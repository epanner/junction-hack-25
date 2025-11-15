from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")
    denso_base_url: str = "https://hackathon1.didgateway.eu/federal"

    solana_enabled: bool = Field(default=True, description="Feature flag for Solana anchoring")
    solana_rpc_url: str = Field(
        default="https://api.devnet.solana.com", description="Solana RPC endpoint"
    )
    solana_keypair_path: str | None = Field(
        default=None,
        description="Path to the solana-keygen JSON keypair used as the fee payer",
    )
    openai_api_key: str | None = Field(
        default=None,
        description="API key for negotiator LLM integrations",
    )


settings = Settings()