from functools import lru_cache
from typing import Any

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings"""

    model_config = SettingsConfigDict(case_sensitive=False)

    LOGGING_CONF: str | None = "logging.conf"

    # database
    POSTGRES_DATABASE_URL: str

    # feature flags
    FEATURE_AUTH0: bool | None = True
    FEATURE_API_KEY: bool | None = True

    # Auth0
    AUTH0_SERVER: str
    AUTH0_AUDIENCE: str
    AUTH0_CLIENT_ID: str
    AUTH0_CLIENT_SECRET: str
    AUTH0_CONNECTION_ID: str

    # networking and security
    ALLOWED_ORIGINS: str
    API_KEY: str | None = None

    # emails
    RESEND_API_KEY: str | None = None

    def model_post_init(self, __context) -> None:
        """Post init hook."""
        self.ALLOWED_ORIGINS = self.ALLOWED_ORIGINS.split(",")

    @model_validator(mode="after")
    def validate_api_key_settings(self) -> Any:
        """Validate the API key settings."""
        if self.FEATURE_API_KEY and not self.API_KEY:
            raise ValueError("FEATURE_API_KEY is True but API_KEY is not set")
        return self

    @model_validator(mode="after")
    def validate_oauth_settings(self) -> Any:
        """Validate the OAuth settings."""
        if self.FEATURE_AUTH0 and not self.AUTH0_SERVER:
            raise ValueError("FEATURE_AUTH0 is True but AUTH0_SERVER is not set")
        if self.FEATURE_AUTH0 and not self.AUTH0_AUDIENCE:
            raise ValueError("FEATURE_AUTH0 is True but AUTH0_AUDIENCE is not set")
        return


@lru_cache
def get_settings() -> Settings:
    return Settings()
