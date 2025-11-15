from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from data.charging_stations import (
    CHARGING_STATIONS,
    build_station_card,
    get_station_cards,
    get_station_snapshot,
)


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


class StationCard(BaseModel):
    id: str
    name: str
    lat: float
    lng: float
    available: int
    total: int
    power: str
    price: str
    distance: Optional[str] = None
    address: Optional[str] = None


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


@router.get("/cards", response_model=List[StationCard])
async def list_station_cards(
    lat: Optional[float] = Query(default=None, alias="userLat"),
    lng: Optional[float] = Query(default=None, alias="userLng"),
    radius_km: Optional[float] = Query(default=None, alias="radius"),
) -> List[dict]:
    return get_station_cards(user_lat=lat, user_lon=lng, radius_km=radius_km)


@router.get("/cards/{station_id}", response_model=StationCard)
async def get_station_card(station_id: str) -> dict:
    station = CHARGING_STATIONS.get(station_id)
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")
    return build_station_card(station)

