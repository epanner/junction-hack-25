from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel

from data.charging_sessions import (
    cancel_charging_session,
    complete_charging_session,
    create_charging_session,
    get_active_session,
    get_charging_session,
    list_charging_sessions,
)


class ChargingSessionModel(BaseModel):
    id: str
    date: str
    station: str
    stationId: str
    location: str
    energy: str
    cost: str
    duration: str
    status: str
    startTime: Optional[str] = None
    endTime: Optional[str] = None
    startSoC: Optional[int] = None
    endSoC: Optional[int] = None
    connectorId: Optional[str] = None
    connectorType: Optional[str] = None


router = APIRouter(prefix="/api/charging-sessions", tags=["charging-sessions"])


@router.get("/", response_model=List[ChargingSessionModel])
async def charging_sessions(
    limit: Optional[int] = Query(default=None, ge=1),
) -> List[dict]:
    return list_charging_sessions(limit=limit)


@router.get("/active", response_model=Optional[ChargingSessionModel])
async def active_session() -> Optional[dict]:
    return get_active_session()


@router.get("/{session_id}", response_model=ChargingSessionModel)
async def session_by_id(session_id: str) -> dict:
    session = get_charging_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.post("/", response_model=ChargingSessionModel, status_code=201)
async def create_session(payload: ChargingSessionModel) -> dict:
    if not payload.connectorId:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="connectorId is required to track availability.",
        )
    return create_charging_session(payload.model_dump())


@router.post("/{session_id}/cancel", response_model=ChargingSessionModel)
async def cancel_session(session_id: str) -> dict:
    session = cancel_charging_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.post("/{session_id}/complete", response_model=ChargingSessionModel)
async def complete_session(session_id: str) -> dict:
    session = complete_charging_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


