from fastapi import APIRouter
from pydantic import BaseModel

from data.users import get_user_profile, get_user_statistics


class UserProfileModel(BaseModel):
    id: str
    name: str
    email: str
    memberSince: str
    totalSessions: int
    totalEnergyCharged: int
    didVerified: bool
    walletConnected: bool


class UserStatisticsModel(BaseModel):
    totalSessions: int
    totalEnergyCharged: int
    totalSpent: float
    averageMonthlyUsage: int


router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/profile", response_model=UserProfileModel)
async def user_profile() -> dict:
    return get_user_profile()


@router.get("/statistics", response_model=UserStatisticsModel)
async def user_statistics() -> dict:
    return get_user_statistics()


