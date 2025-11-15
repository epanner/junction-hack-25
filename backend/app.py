from contextlib import asynccontextmanager

from fastapi import FastAPI

from adapters.denso_did import DensoDIDClient
from config import settings
from routers.session_auth import router as session_auth_router

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
app.include_router(session_auth_router)