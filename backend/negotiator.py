import os
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional

from backend.data.battery_birth_certificate import BATTERY_BIRTH_CERTIFICATE
from backend.data.battery_soh import BATTERY_SOH_RECORDS
from backend.data.vehicle_sessions import VEHICLE_SOC_HISTORY
from backend.data.charging_stations import get_station_snapshot, find_nearest_station

# If using the OpenAI Python SDK:
from openai import OpenAI
client = OpenAI(
    base_url="https://api.featherless.ai/v1",
    api_key="rc_86168a8d8c41a25e4e486d5edc4407a58f29ad952801e067e0e86973d2aa98db",   # <<< IMPORTANT
)


# ---------------------------------------------------------
# Battery Data Agent
# ---------------------------------------------------------

class BatteryDataAgent:
    def __init__(self, vin: str, target_soc: float):
        self.vin = vin
        self.target_soc = target_soc  # e.g. 0.8 for 80%

    def _get_latest_soh_record(self) -> Dict[str, Any]:
        # In a real system you'd match batteryId to VIN.
        # Here we just pick the first record as a demo.
        latest_record = BATTERY_SOH_RECORDS[-1]["credentialSubject"]
        return latest_record

    def _get_current_soc(self) -> float:
        history = VEHICLE_SOC_HISTORY[self.vin]["values"]
        # Last SOC sample
        return history[-1]["value"] / 100.0  # convert percent → fraction

    def build_battery_summary(self) -> Dict[str, Any]:
        soh_rec = self._get_latest_soh_record()
        soc_now = self._get_current_soc()

        soh = float(soh_rec["newSOHVal"])
        max_capacity = float(soh_rec["maxCapacity"])  # kWh
        effective_capacity = max_capacity * soh / 100.0

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

    def get_best_station(self) -> Dict[str, Any]:
        result = find_nearest_station(self.user_lat, self.user_lon)
        if result is None:
            raise RuntimeError("No stations found")
        station, distance_km = result

        # Simple static pricing & grid windows
        # In real life this would come from tariff + grid APIs
        connectors = []
        for c in station["connectors"]:
            price = 0.25 if c["type"] == "CCS2" else 0.20
            connectors.append({
                **c,
                "price_eur_per_kwh": price
            })

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


# ---------------------------------------------------------
# Negotiator Agent
# ---------------------------------------------------------

class NegotiatorAgent:
    def __init__(self, user_departure_time: datetime, price_weight=0.4, time_weight=0.3, health_weight=0.3):
        self.departure_time = user_departure_time
        self.price_weight = price_weight
        self.time_weight = time_weight
        self.health_weight = health_weight

    def _create_baseline_plan(self, battery_info: Dict[str, Any], station_info: Dict[str, Any]) -> Dict[str, Any]:
        """
        Very simple deterministic planner:
        - Choose the highest power CCS2 connector that respects battery max power.
        - Aim to charge mostly in the 'cheap' window if time allows.
        """

        energy_needed = battery_info["energy_needed_kwh"]
        max_power = min(
            battery_info["max_safe_power_kw"],
            max(c["power_kw"] for c in station_info["connectors"] if c["status"] == "available")
        )

        # Assume linear charging (no taper) for MVP
        hours_needed = energy_needed / max_power if max_power > 0 else float("inf")
        start_time = datetime.utcnow()
        end_time = start_time + timedelta(hours=hours_needed)

        # Clamp to departure time
        if end_time > self.departure_time:
            end_time = self.departure_time
            actual_duration_h = (end_time - start_time).total_seconds() / 3600
            delivered_energy = max_power * actual_duration_h
        else:
            delivered_energy = energy_needed

        connector = max(
            (c for c in station_info["connectors"] if c["status"] == "available"),
            key=lambda c: c["power_kw"]
        )
        price = connector["price_eur_per_kwh"]

        total_cost = delivered_energy * price

        return {
            "station_id": station_info["station_id"],
            "connector_id": connector["connector_id"],
            "start_time": start_time.isoformat(),
            "end_time": end_time.isoformat(),
            "planned_power_kw": max_power,
            "delivered_energy_kwh": delivered_energy,
            "total_cost_eur": total_cost,
            "price_eur_per_kwh": price,
        }

    def _call_llm_for_explanation(self, battery_info: Dict[str, Any],
                                  station_info: Dict[str, Any],
                                  baseline_plan: Dict[str, Any]) -> Dict[str, Any]:
        """
        Call an LLM to:
        - Sanity-check the plan
        - Generate natural language explanation & key insights
        """
        system_msg = {
            "role": "system",
            "content": (
                "You are an EV charging planner assistant. "
                "Given structured context, explain the plan in user-friendly terms. "
                "Do not change hard constraints but you may suggest minor improvements."
            ),
        }

        user_msg = {
            "role": "user",
            "content": (
                "Here is the battery info, station info, and baseline plan. "
                "1) Briefly summarize the plan. "
                "2) Provide 3 bullet-point insights (cost, time, battery health, grid). "
                "3) If relevant, suggest an alternative schedule that is greener or cheaper.\n\n"
                f"BatteryInfo:\n{battery_info}\n\n"
                f"StationInfo:\n{station_info}\n\n"
                f"BaselinePlan:\n{baseline_plan}"
            ),
        }

        response = client.chat.completions.create(
            model="meta-llama/Meta-Llama-3.1-8B-Instruct",
            messages=[system_msg, user_msg],
            temperature=0.3,
        )

        explanation_text = response.choices[0].message.content
        return {"explanation": explanation_text}

    def propose_plan(self, battery_info: Dict[str, Any], station_info: Dict[str, Any]) -> Dict[str, Any]:
        baseline = self._create_baseline_plan(battery_info, station_info)
        llm_result = self._call_llm_for_explanation(battery_info, station_info, baseline)

        return {
            "plan": baseline,
            "explanation": llm_result["explanation"],
        }


# ---------------------------------------------------------
# Example: Running the Multi-Agent Stack
# ---------------------------------------------------------

def run_multi_agent_demo():
    # User inputs
    vin = "TMAH081A1RJ012825"
    target_soc = 0.85  # 85%
    departure_time = datetime.utcnow() + timedelta(hours=3)
    user_lat, user_lon = 60.1699, 24.9384  # somewhere in Helsinki

    # Agents
    battery_agent = BatteryDataAgent(vin=vin, target_soc=target_soc)
    station_agent = ChargingStationAgent(user_lat=user_lat, user_lon=user_lon)
    negotiator = NegotiatorAgent(user_departure_time=departure_time)

    # Agent collaboration
    battery_summary = battery_agent.build_battery_summary()
    station_summary = station_agent.get_best_station()
    result = negotiator.propose_plan(battery_summary, station_summary)

    return {
        "battery": battery_summary,
        "station": station_summary,
        "negotiation_result": result,
    }


if __name__ == "__main__":
    res = run_multi_agent_demo()
    from pprint import pprint
    pprint(res)
