from pydantic_settings import BaseSettings
from typing import Annotated
from pydantic import AnyHttpUrl, Field

class Settings(BaseSettings):
    denso_base_url: str = "https://hackathon1.didgateway.eu/federal"
    # denso_api_key: str | None = None

settings = Settings()