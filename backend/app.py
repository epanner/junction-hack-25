from fastapi import FastAPI
from contextlib import asynccontextmanager
from adapters.denso_did import DensoDIDClient
from config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    global denso
    denso = DensoDIDClient(base_url=settings.denso_base_url)
    try:
        yield
    finally:
        if denso:
            await denso.close()

app = FastAPI(lifespan=lifespan, title="GridPass Backend API", version="0.1.0")