from typing import List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from data.charging_stations import CHARGING_STATIONS, get_station_snapshot


class StationLocation(BaseModel):
    city: str
    country: str
    address: str
    latitude: float
    longitude: float


class StationConnector(BaseModel):
    connector_id: str = Field(..., alias="connector_id")
    type: str
    power_kw: float
    status: str

    class Config:
        populate_by_name = True


class StationSnapshot(BaseModel):
    station_id: str
    name: str
    operator: str
    location: StationLocation
    connectors: List[StationConnector]
    total_connectors: int
    available_connectors: int
    occupied_connectors: int


router = APIRouter(prefix="/api/stations", tags=["stations"])


def _snapshot_or_404(station_id: str) -> dict:
    snapshot = get_station_snapshot(station_id)
    if snapshot is None:
        raise HTTPException(status_code=404, detail="Station not found")
    return snapshot


@router.get("/", response_model=List[StationSnapshot])
async def list_stations() -> List[dict]:
    return [_snapshot_or_404(station_id) for station_id in CHARGING_STATIONS.keys()]


@router.get("/{station_id}", response_model=StationSnapshot)
async def get_station(station_id: str) -> dict:
    return _snapshot_or_404(station_id)


