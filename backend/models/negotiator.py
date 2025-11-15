import os
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, List, Optional, Literal

from data.battery_birth_certificate import BATTERY_BIRTH_CERTIFICATE
from data.battery_soh import BATTERY_SOH_RECORDS
from data.vehicle_sessions import VEHICLE_SOC_HISTORY
from data.vehicles import VEHICLE_BATTERY_STATUS
from data.charging_stations import (
    get_station_snapshot,
    find_nearest_station,
    CHARGING_STATIONS,
)
from services.pricing import pricing_engine  # <-- NEW: cost estimation
from config import settings

from openai import OpenAI

client = OpenAI(
    base_url="https://api.featherless.ai/v1",
    api_key=settings.openai_api_key or os.getenv("OPENAI_API_KEY"),
)


# ---------------------------------------------------------
# Battery Data Agent (still deterministic, but now exposes battery_id)
# ---------------------------------------------------------

class BatteryDataAgent:
    def __init__(self, vin: str, target_soc: float):
        self.vin = vin
        self.target_soc = target_soc  # e.g. 0.8 for 80%

        # NEW: simple assumption that this BBC corresponds to the active battery
        self.battery_id = BATTERY_BIRTH_CERTIFICATE["credentialSubject"]["batteryId"]

    def _get_latest_soh_record(self) -> Dict[str, Any]:
        # In a real system you'd match batteryId to VIN.
        # Here we just pick the last record as a demo.
        latest_record = BATTERY_SOH_RECORDS[-1]["credentialSubject"]
        return latest_record

    def _get_current_soc(self) -> float:
        history = VEHICLE_SOC_HISTORY.get(self.vin, {}).get("values", [])
        if history:
            last_value = history[-1]["value"]
            if 0.0 < last_value < 100.0:
                return last_value / 100.0

        status_value = VEHICLE_BATTERY_STATUS.get("currentSoC")
        if status_value is not None:
            return min(max(status_value / 100.0, 0.0), 1.0)

        return 0.5

    def build_battery_summary(self) -> Dict[str, Any]:
        """
        Returns all info the other agents need:
        - current SoC
        - target SoC
        - energy needed
        - max safe power (SoH + impedance based)
        """
        soh_rec = self._get_latest_soh_record()
        soc_now = self._get_current_soc()

        soh = float(soh_rec["newSOHVal"])
        max_capacity = float(soh_rec["maxCapacity"])  # kWh
        effective_capacity = max_capacity * soh / 100.0

        # Energy needed to go from current SoC to target SoC, on *effective* capacity
        energy_needed = max(self.target_soc - soc_now, 0.0) * effective_capacity

        # Simple health-based power limit: derate if SoH < 85 or impedance high
        impedance = float(soh_rec["impedance"])
        if soh < 85 or impedance > 8.0:
            max_safe_power_kw = 80  # lower
            health_notes = ["Battery aging; reduce fast charging power"]
        else:
            max_safe_power_kw = 150
            health_notes = ["Battery in good condition"]

        return {
            "vin": self.vin,
            "battery_id": self.battery_id,
            "soc_now": soc_now,
            "target_soc": self.target_soc,
            "soh": soh,
            "impedance_ohm": impedance / 1000.0,  # if stored in mΩ
            "max_capacity_kwh": max_capacity,
            "effective_capacity_kwh": effective_capacity,
            "energy_needed_kwh": energy_needed,
            "max_safe_power_kw": max_safe_power_kw,
            "health_notes": health_notes,
        }


# ---------------------------------------------------------
# Charging Station Agent
# ---------------------------------------------------------

class ChargingStationAgent:
    def __init__(self, user_lat: float, user_lon: float):
        self.user_lat = user_lat
        self.user_lon = user_lon

    # Existing helper kept for compatibility (nearest-only)
    def get_best_station(self) -> Dict[str, Any]:
        result = find_nearest_station(self.user_lat, self.user_lon)
        if result is None:
            raise RuntimeError("No stations found")
        station, distance_km = result

        # Simple static pricing & grid windows
        connectors = []
        for c in station["connectors"]:
            price = 0.25 if c["type"] == "CCS2" else 0.20
            connectors.append({**c, "price_eur_per_kwh": price})

        grid_windows = [
            {"label": "stressed", "from": "13:00", "to": "15:00"},
            {"label": "cheap", "from": "10:00", "to": "11:00"},
        ]

        return {
            "station_id": station["station_id"],
            "name": station["name"],
            "distance_km": distance_km,
            "location": station["location"],
            "connectors": connectors,
            "grid_windows": grid_windows,
        }

    # NEW: evaluate *all* stations & connectors against battery + time constraints
    def evaluate_stations(
        self,
        battery_info: Dict[str, Any],
        departure_time: datetime,
    ) -> List[Dict[str, Any]]:
        """
        For each station + available connector:
        - estimate cost using PricingEngine
        - estimate charge duration using min(battery_max_safe_power, connector_power)
        - check if it's possible to reach target SoC before departure
        Returns a list of candidate options.
        """
        candidates: List[Dict[str, Any]] = []

        vin = battery_info["vin"]
        battery_id = battery_info.get("battery_id")
        energy_needed = battery_info["energy_needed_kwh"]
        max_safe_power = battery_info["max_safe_power_kw"]

        now = datetime.utcnow().replace(tzinfo=timezone.utc)
        time_window_h = max((departure_time - now).total_seconds() / 3600.0, 0.0)

        if energy_needed <= 0:
            # Nothing to charge; still return an empty list and let negotiator explain
            return candidates

        for station in CHARGING_STATIONS.values():
            # Compute distance from user to station
            loc = station["location"]
            # reuse find_nearest_station's haversine indirectly via snapshot distance
            # For simplicity, approximate distance as 0 if it's the fleet demo site at user coords
            distance_km = 0.0
            if "latitude" in loc and "longitude" in loc:
                # Cheap inline haversine (duplicated from charging_stations module)
                import math

                def _haversine_km(lat1, lon1, lat2, lon2):
                    r = 6371.0
                    d_lat = math.radians(lat2 - lat1)
                    d_lon = math.radians(lon2 - lon1)
                    a = (
                        math.sin(d_lat / 2) ** 2
                        + math.cos(math.radians(lat1))
                        * math.cos(math.radians(lat2))
                        * math.sin(d_lon / 2) ** 2
                    )
                    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
                    return r * c

                distance_km = _haversine_km(
                    self.user_lat,
                    self.user_lon,
                    loc["latitude"],
                    loc["longitude"],
                )

            station_snapshot = get_station_snapshot(station["station_id"])
            if not station_snapshot:
                continue

            for connector in station_snapshot["connectors"]:
                if connector["status"] != "available":
                    continue

                connector_power = float(connector.get("power_kw", 0.0))
                # Respect both connector power and battery's safe limit
                effective_power_kw = min(connector_power, max_safe_power)
                if effective_power_kw <= 0:
                    continue

                # Time needed to deliver required energy at this effective power
                duration_h = energy_needed / effective_power_kw
                can_meet_ready_by = duration_h <= time_window_h

                # Use PricingEngine to estimate total cost for this station/connector
                cost_ctx = pricing_engine.calculate_session_cost(
                    vehicle_vin=vin,
                    station_snapshot=station_snapshot,
                    battery_id=battery_id,
                    reserved_connector=connector,
                    energy_kwh_override=energy_needed,
                )

                candidates.append(
                    {
                        "station_id": station_snapshot["station_id"],
                        "station_name": station_snapshot["name"],
                        "distance_km": distance_km,
                        "location": station_snapshot["location"],
                        "available_connectors": station_snapshot.get("available_connectors"),
                        "total_connectors": station_snapshot.get("total_connectors"),
                        "connector_id": connector["connector_id"],
                        "connector_type": connector["type"],
                        "connector_power_kw": connector_power,
                        "effective_power_kw": effective_power_kw,
                        "session_duration_h": duration_h,
                        "can_meet_ready_by": can_meet_ready_by,
                        "pricing": cost_ctx,
                        "total_cost_eur": cost_ctx["total_eur"],
                    }
                )

        return candidates


# ---------------------------------------------------------
# Negotiator Agent (LLM-driven station selection + UI formatting)
# ---------------------------------------------------------

class NegotiatorAgent:
    def __init__(
        self,
        user_departure_time: datetime,
        strategy: str = "balanced",
        reasoning_model: str = "meta-llama/Meta-Llama-3.1-8B-Instruct",
    ):
        self.departure_time = user_departure_time
        self.strategy = strategy  # "cost" | "speed" | "balanced"
        self.reasoning_model = reasoning_model

    # -----------------------------------------------------
    # LLM chooses the best station/connector
    # -----------------------------------------------------
    def _llm_choose_best(self, battery_info, candidates):

        # Prepare a minimal candidate list for the model
        compact_candidates = [
            {
                "station_id": c["station_id"],
                "connector_id": c["connector_id"],
                "total_cost_eur": c["total_cost_eur"],
                "duration_h": c["session_duration_h"],
                "distance_km": c["distance_km"],
                "can_meet_ready_by": c["can_meet_ready_by"],
            }
            for c in candidates
        ]

        system_msg = {
            "role": "system",
            "content": (
                "You are a strict EV charging decision agent.\n"
                "Choose EXACTLY ONE candidate.\n"
                "Mandatory constraints:\n"
                "1. must meet ready-by\n"
                "2. must achieve target SOC\n"
                "Decision rules:\n"
                "- strategy='cost': choose lowest total_cost_eur\n"
                "- strategy='speed': choose shortest duration_h\n"
                "- strategy='balanced': choose best compromise of cost + time\n"
                "Return ONLY JSON: {\"station_id\": \"...\", \"connector_id\": \"...\"}"
            ),
        }

        user_msg = {
            "role": "user",
            "content": (
                f"Strategy: {self.strategy}\n"
                f"Battery info: {battery_info}\n"
                f"Candidates: {compact_candidates}\n"
                "Return JSON only."
            ),
        }

        response = client.chat.completions.create(
            model=self.reasoning_model,
            messages=[system_msg, user_msg],
            temperature=0.0,
        )

        import json
        raw = response.choices[0].message.content.strip()
        decision = json.loads(raw)

        # Match to the full candidate
        for c in candidates:
            if (
                c["station_id"] == decision["station_id"]
                and c["connector_id"] == decision["connector_id"]
            ):
                return c

        raise RuntimeError("LLM returned station not in candidates")

    # -----------------------------------------------------
    # Match score for the frontend UI
    # -----------------------------------------------------
    def _compute_match_score(self, candidate):
        cost_norm = max(0, 1 - candidate["total_cost_eur"] / 10)
        speed_norm = max(0, 1 - candidate["session_duration_h"] / 2)
        distance_norm = max(0, 1 - candidate["distance_km"] / 10)

        if self.strategy == "cost":
            score = 0.7 * cost_norm + 0.2 * speed_norm + 0.1 * distance_norm
        elif self.strategy == "speed":
            score = 0.6 * speed_norm + 0.3 * cost_norm + 0.1 * distance_norm
        else:  # balanced
            score = 0.4 * speed_norm + 0.4 * cost_norm + 0.2 * distance_norm

        return round(score * 100)

    # -----------------------------------------------------
    # Build UI-expected output
    # -----------------------------------------------------
    def propose_plan(self, battery_info, candidates):

        if not candidates:
            return {"error": "No stations can meet ready-by constraints"}

        # LLM picks the final candidate
        chosen = self._llm_choose_best(battery_info, candidates)

        # compute timing details
        duration_h = chosen["session_duration_h"]
        duration_min = round(duration_h * 60)
        recommended_start = self.departure_time - timedelta(hours=duration_h)

        match_score = self._compute_match_score(chosen)

        original_price = chosen["pricing"]["energy_component_eur"] + 0.75
        negotiated_price = chosen["total_cost_eur"]
        savings = round(original_price - negotiated_price, 2)

        # -------------------------------------------
        # Final UI-ready structure
        # -------------------------------------------
        return {
            "meta": {
                "strategy_used": self.strategy,
                "match_score": match_score,
            },
            "station": {
                "station_id": chosen["station_id"],
                "station_name": chosen["station_name"],
                "distance_km": chosen["distance_km"],
                "max_power_kw": chosen["connector_power_kw"],
                "available_connectors": chosen.get("available_connectors"),
                "total_connectors": chosen.get("total_connectors"),
            },
            "charging_details": {
                "current_level_percent": round(battery_info["soc_now"] * 100),
                "target_level_percent": round(battery_info["target_soc"] * 100),
                "energy_needed_kwh": round(battery_info["energy_needed_kwh"], 2),
                "ready_by": self.departure_time.strftime("%H:%M"),
                "recommended_start": recommended_start.strftime("%H:%M"),
            },
            "pricing": {
                "original_price_eur": round(original_price, 2),
                "negotiated_price_eur": round(negotiated_price, 2),
                "estimated_duration_min": duration_min,
                "savings_eur": savings,
            },
        }
