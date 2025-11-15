from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel

from data.charging_stations import get_station_snapshot, occupy_connector
from services.did_denso_verification import DensoDIDVerificationService
from services.pricing import pricing_engine

router = APIRouter(prefix="/api/sessions", tags=["session-auth"])


def get_verification_service(request: Request) -> DensoDIDVerificationService:
    client = getattr(request.app.state, "denso_client", None)
    if client is None:
        raise HTTPException(status_code=503, detail="Denso DID client not ready")
    return DensoDIDVerificationService(client)


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
    verification: Dict[str, Any]
    pricing: Dict[str, Any]


@router.post("/authenticate", response_model=SessionAuthResponse)
async def authenticate_session(
    payload: SessionAuthRequest,
    verifier: DensoDIDVerificationService = Depends(get_verification_service),
) -> SessionAuthResponse:
    """
    Simulates a tri-party authentication by validating input IDs and
    returning the latest charging-station snapshot plus optional reservation info.
    """

    verification = await verifier.verify_all()
    if not verification.get("verified"):
        raise HTTPException(status_code=502, detail={"message": "DID verification failed", "verification": verification})

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

    pricing = pricing_engine.calculate_session_cost(
        vehicle_vin=payload.vehicle_vin,
        battery_id=payload.battery_id,
        station_snapshot=station_snapshot,
        reserved_connector=reserved_connector,
    )

    return SessionAuthResponse(
        status=status,
        user_id=payload.user_id,
        vehicle_vin=payload.vehicle_vin,
        battery_id=payload.battery_id,
        charger=station_snapshot,
        reserved_connector=reserved_connector,
        verification=verification,
        pricing=pricing,
    )

