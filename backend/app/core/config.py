from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str = "postgresql+asyncpg://booking:booking@localhost:5432/booking"
    secret_key: str = "dev-secret-change-in-production"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7
    cors_origins: str = "http://localhost:3000"
    cookie_secure: bool = False
    cookie_domain: str | None = None

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
