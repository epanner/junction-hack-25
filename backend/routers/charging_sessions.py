from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from data.charging_sessions import (
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


