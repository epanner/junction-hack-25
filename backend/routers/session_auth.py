from typing import Any, Dict, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from data.charging_stations import get_station_snapshot, occupy_connector

router = APIRouter(prefix="/sessions", tags=["session-auth"])


class SessionAuthRequest(BaseModel):
    user_id: str
    vehicle_vin: str
    battery_id: str
    charger_id: str
    reserve_connector: bool = True


class SessionAuthResponse(BaseModel):
    status: str
    user_id: str
    vehicle_vin: str
    battery_id: str
    charger: Dict[str, Any]
    reserved_connector: Optional[Dict[str, Any]] = None


@router.post("/authenticate", response_model=SessionAuthResponse)
async def authenticate_session(payload: SessionAuthRequest) -> SessionAuthResponse:
    """
    Simulates a tri-party authentication by validating input IDs and
    returning the latest charging-station snapshot plus optional reservation info.
    """

    station_snapshot = get_station_snapshot(payload.charger_id)
    if not station_snapshot:
        raise HTTPException(status_code=404, detail="Charger not found")

    reserved_connector: Optional[Dict[str, Any]] = None
    status = "verified"

    if payload.reserve_connector:
        reserved_connector = occupy_connector(payload.charger_id)
        if reserved_connector:
            status = "reserved"
            station_snapshot = get_station_snapshot(payload.charger_id) or station_snapshot
        else:
            status = "waitlist"

    return SessionAuthResponse(
        status=status,
        user_id=payload.user_id,
        vehicle_vin=payload.vehicle_vin,
        battery_id=payload.battery_id,
        charger=station_snapshot,
        reserved_connector=reserved_connector,
    )

