from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from adapters.denso_did import DensoDIDClient
from config import settings
from routers.charging_sessions import router as charging_sessions_router
from routers.negotiator import router as negotiator_router
from routers.session_auth import router as session_auth_router
from routers.stations import router as stations_router
from routers.trust_anchor import router as trust_anchor_router
from routers.users import router as users_router
from routers.vehicles import router as vehicles_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    global denso
    denso = DensoDIDClient(base_url=settings.denso_base_url)
    app.state.denso_client = denso
    try:
        yield
    finally:
        if denso:
            await denso.close()

app = FastAPI(lifespan=lifespan, title="GridPass Backend API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(session_auth_router)
app.include_router(stations_router)
app.include_router(trust_anchor_router)
app.include_router(negotiator_router)
app.include_router(users_router)
app.include_router(vehicles_router)
app.include_router(charging_sessions_router)