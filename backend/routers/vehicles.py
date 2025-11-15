from fastapi import APIRouter
from pydantic import BaseModel

from data.vehicles import (
    get_vehicle_battery_status,
    get_vehicle_charging_history,
    get_vehicle_info,
)


class VehicleInfoModel(BaseModel):
    id: str
    make: str
    model: str
    variant: str
    batteryCapacity: float
    maxACCharging: float
    maxDCCharging: float
    efficiency: float
    did: str
    didVerified: bool


class VehicleBatteryStatusModel(BaseModel):
    currentSoC: int
    currentEnergy: int
    estimatedRange: int
    batteryHealth: int


class ChargingHistoryModel(BaseModel):
    totalSessions: int
    totalEnergy: int
    averagePerMonth: int


router = APIRouter(prefix="/api/vehicles", tags=["vehicles"])


@router.get("/info", response_model=VehicleInfoModel)
async def vehicle_info() -> dict:
    return get_vehicle_info()


@router.get("/battery-status", response_model=VehicleBatteryStatusModel)
async def battery_status() -> dict:
    return get_vehicle_battery_status()


@router.get("/charging-history", response_model=ChargingHistoryModel)
async def charging_history() -> dict:
    return get_vehicle_charging_history()


