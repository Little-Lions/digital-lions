from functools import lru_cache
from typing import Any

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings"""

    model_config = SettingsConfigDict(case_sensitive=False)

    # database
    POSTGRES_DATABASE_URL: str

    # feature flags
    FEATURE_OAUTH: bool | None = False
    FEATURE_API_KEY: bool | None = True

    # security
    API_KEY: str | None = None
    OAUTH_DOMAIN: str | None = None
    OAUTH_AUDIENCE: str | None = None
    OAUTH_CLIENT_ID: str | None = None
    OAUTH_CLIENT_SECRET: str | None = None
    OAUTH_CONNECTION_ID: str | None = None

    # networking
    ALLOWED_ORIGINS: str
    ALLOWED_METHODS: str = "*"
    ALLOWED_HEADERS: str = "Content-Type, Authorization"

    # emails
    RESEND_API_KEY: str | None = None

    def model_post_init(self, __context) -> None:
        """Post init hook."""
        self.ALLOWED_METHODS = self.ALLOWED_METHODS.split(",")
        self.ALLOWED_HEADERS = self.ALLOWED_HEADERS.split(",")

    @model_validator(mode="after")
    def validate_api_key_settings(self) -> Any:
        """Validate the API key settings."""
        if self.FEATURE_API_KEY and not self.API_KEY:
            raise ValueError("FEATURE_API_KEY is True but API_KEY is not set")
        return self

    @model_validator(mode="after")
    def validate_oauth_settings(self) -> Any:
        """Validate the OAuth settings."""
        if self.FEATURE_OAUTH and not self.OAUTH_DOMAIN:
            raise ValueError("FEATURE_OAUTH is True but OAUTH_DOMAIN is not set")
        if self.FEATURE_OAUTH and not self.OAUTH_AUDIENCE:
            raise ValueError("FEATURE_OAUTH is True but AUTH0_AUDIENCE is not set")
        return


@lru_cache
def get_settings():
    return Settings()
