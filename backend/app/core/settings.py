from functools import lru_cache
from typing import Annotated

from fastapi import Depends
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings"""

    model_config = SettingsConfigDict(case_sensitive=False)

    LOGGING_CONF: str | None = "logging.conf"

    # database
    POSTGRES_DATABASE_URL: str

    # feature flags
    FEATURE_VERIFY_PERMISSIONS: bool | None = True

    # Auth0
    AUTH0_SERVER: str
    AUTH0_AUDIENCE: str
    AUTH0_CLIENT_ID: str
    AUTH0_CLIENT_SECRET: str
    AUTH0_CONNECTION_ID: str

    # networking and security
    ALLOWED_ORIGINS: str

    # emails
    RESEND_API_KEY: str
    RESEND_SENDER: str

    def model_post_init(self, __context) -> None:
        """Post init hook."""
        self.ALLOWED_ORIGINS = self.ALLOWED_ORIGINS.split(",")


@lru_cache
def get_settings() -> Settings:
    return Settings()


SettingsDependency = Annotated[Settings, Depends(get_settings)]
