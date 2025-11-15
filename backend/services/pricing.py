from __future__ import annotations

import math
from typing import Any, Dict, Optional

from data.battery_soh import get_latest_battery_soh, get_soh_capacity_kwh
from data.vehicle_sessions import VEHICLE_SOC_HISTORY
from data.vehicle_specs import get_vehicle_capacity_kwh

DEFAULT_SESSION_ENERGY_KWH = 28.0
SESSION_ACTIVATION_FEE_EUR = 0.75

POWER_PRICING_TIERS = (
    {"name": "AC urban ≤25kW", "max_power_kw": 25, "rate_eur_per_kwh": 0.25},
    {"name": "Fast DC 26-150kW", "max_power_kw": 150, "rate_eur_per_kwh": 0.34},
    {"name": "HPC 151-350kW", "max_power_kw": 350, "rate_eur_per_kwh": 0.42},
    {"name": "Ultra HPC 351kW+", "max_power_kw": math.inf, "rate_eur_per_kwh": 0.47},
)


def _to_float(value: Any, default: float = 0.0) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


class PricingEngine:
    """
    Estimates charging costs by combining connector power, battery data and SOC history.
    """

    def __init__(self) -> None:
        self.default_energy_kwh = DEFAULT_SESSION_ENERGY_KWH
        self.session_fee_eur = SESSION_ACTIVATION_FEE_EUR

    @staticmethod
    def _resolve_capacity_context(vehicle_vin: str, battery_id: Optional[str]) -> Dict[str, Any]:
        if battery_id:
            soh_subject = get_latest_battery_soh(battery_id)
            soh_capacity = get_soh_capacity_kwh(battery_id)
            if soh_subject and soh_capacity is not None:
                return {
                    "source": "battery_soh",
                    "capacity_kwh": soh_capacity,
                    "battery_soh": {
                        "battery_id": battery_id,
                        "soh_percent": _to_float(soh_subject.get("newSOHVal"), 0.0),
                        "timestamp": soh_subject.get("newSOHTimeStamp"),
                        "auto_corrected": soh_subject.get("_autoCorrected"),
                    },
                }

        return {
            "source": "vehicle_specs",
            "capacity_kwh": get_vehicle_capacity_kwh(vehicle_vin),
        }

    def _estimate_energy_kwh(self, vehicle_vin: str, battery_id: Optional[str]) -> Dict[str, Any]:
        session = VEHICLE_SOC_HISTORY.get(vehicle_vin)
        capacity_ctx = self._resolve_capacity_context(vehicle_vin, battery_id)
        estimation: Dict[str, Any] = {
            "energy_method": "default_fallback",
            "capacity_context": capacity_ctx,
            "estimated_energy_kwh": self.default_energy_kwh,
        }

        if not session:
            return estimation

        values = session.get("values") or []
        if len(values) < 2:
            return estimation

        start_soc = values[0]["value"]
        end_soc = values[-1]["value"]
        delta_soc_percent = max(end_soc - start_soc, 0)
        delta_soc_fraction = delta_soc_percent / 100.0

        capacity_kwh = capacity_ctx["capacity_kwh"]
        estimated_energy = capacity_kwh * delta_soc_fraction
        if estimated_energy <= 0:
            return estimation

        estimation.update(
            {
                "energy_method": "soc_history",
                "estimated_energy_kwh": round(estimated_energy, 2),
                "soc_delta_percent": round(delta_soc_percent, 2),
            }
        )
        return estimation

    @staticmethod
    def _determine_rate(power_kw: float) -> Dict[str, Any]:
        for tier in POWER_PRICING_TIERS:
            if power_kw <= tier["max_power_kw"]:
                return tier
        return POWER_PRICING_TIERS[-1]

    @staticmethod
    def _select_connector(
        station_snapshot: Dict[str, Any], reserved_connector: Optional[Dict[str, Any]]
    ) -> Optional[Dict[str, Any]]:
        if reserved_connector:
            return reserved_connector

        connectors = station_snapshot.get("connectors", [])
        if not connectors:
            return None

        return max(connectors, key=lambda conn: conn.get("power_kw", 0))

    def calculate_session_cost(
        self,
        vehicle_vin: str,
        station_snapshot: Dict[str, Any],
        battery_id: Optional[str] = None,
        reserved_connector: Optional[Dict[str, Any]] = None,
        energy_kwh_override: Optional[float] = None,
    ) -> Dict[str, Any]:
        connector = self._select_connector(station_snapshot, reserved_connector)
        if not connector:
            return {
                "currency": "EUR",
                "total_eur": 0.0,
                "reason": "no_connectors_available",
            }

        power_kw = connector.get("power_kw", 0.0)
        tier = self._determine_rate(power_kw)
        rate = tier["rate_eur_per_kwh"]

        energy_estimation = self._estimate_energy_kwh(vehicle_vin, battery_id)
        energy_kwh = energy_estimation["estimated_energy_kwh"]

        if energy_kwh_override is not None:
            energy_kwh = round(energy_kwh_override, 2)
            energy_estimation["energy_method"] = "override"
            energy_estimation["estimated_energy_kwh"] = energy_kwh
            energy_estimation["override_value_kwh"] = energy_kwh

        energy_component = round(energy_kwh * rate, 2)
        total = round(energy_component + self.session_fee_eur, 2)

        return {
            "currency": "EUR",
            "connector_id": connector.get("connector_id"),
            "power_kw": power_kw,
            "pricing_tier": tier["name"],
            "rate_eur_per_kwh": rate,
            "energy_kwh": energy_kwh,
            "energy_component_eur": energy_component,
            "session_fee_eur": self.session_fee_eur,
            "total_eur": total,
            "estimation_context": energy_estimation,
        }


pricing_engine = PricingEngine()


