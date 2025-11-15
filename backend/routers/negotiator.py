from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Literal, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from models.negotiator import BatteryDataAgent, ChargingStationAgent, NegotiatorAgent


class NegotiationRequest(BaseModel):
    user_lat: float = Field(..., description="Driver latitude in decimal degrees")
    user_lng: float = Field(..., description="Driver longitude in decimal degrees")
    target_soc_percent: float = Field(
        default=80,
        ge=1,
        le=100,
        description="Desired SOC in percent (e.g. 80 for 80%)",
    )
    departure_time: Optional[datetime] = Field(
        default=None,
        description="ISO timestamp when the driver needs to depart. Defaults to now+2h.",
    )
    strategy: Literal["cost", "speed", "balanced"] = Field(
        default="balanced", description="Optimization strategy for the negotiator LLM."
    )
    vehicle_vin: str = Field(
        default="W1KAH5EB2PF093797", description="Vehicle VIN used for SOC history lookup."
    )


class NegotiationResponse(BaseModel):
    battery: Dict[str, Any]
    candidate_count: int
    candidates: List[Dict[str, Any]]
    plan: Dict[str, Any]


router = APIRouter(prefix="/api/negotiator", tags=["negotiator"])


@router.post("/plan", response_model=NegotiationResponse)
async def negotiate_plan(payload: NegotiationRequest) -> NegotiationResponse:
    now = datetime.utcnow().replace(tzinfo=timezone.utc)
    if payload.departure_time:
        departure_ts = payload.departure_time
        if departure_ts.tzinfo is None:
            departure_ts = departure_ts.replace(tzinfo=timezone.utc)
        else:
            departure_ts = departure_ts.astimezone(timezone.utc)
    else:
        departure_ts = now + timedelta(hours=2)

    min_departure = now + timedelta(minutes=5)
    max_departure = now + timedelta(hours=12)

    if departure_ts < min_departure:
        raise HTTPException(status_code=400, detail="Departure time must be at least 5 minutes in the future")
    if departure_ts > max_departure:
        raise HTTPException(status_code=400, detail="Departure time must be within the next 12 hours")

    battery_agent = BatteryDataAgent(
        vin=payload.vehicle_vin,
        target_soc=payload.target_soc_percent / 100.0,
    )
    battery_summary = battery_agent.build_battery_summary()

    station_agent = ChargingStationAgent(user_lat=payload.user_lat, user_lon=payload.user_lng)
    candidates = station_agent.evaluate_stations(battery_summary, departure_ts)

    negotiator = NegotiatorAgent(
        user_departure_time=departure_ts,
        strategy=payload.strategy,
    )
    plan = negotiator.propose_plan(battery_summary, candidates)

    return NegotiationResponse(
        battery=battery_summary,
        candidate_count=len(candidates),
        candidates=candidates,
        plan=plan,
    )

