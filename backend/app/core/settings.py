from functools import lru_cache
from typing import Annotated, Any

from fastapi import Depends
from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings"""

    model_config = SettingsConfigDict(case_sensitive=False)

    LOGGING_CONF: str | None = "logging.conf"

    # database
    POSTGRES_DATABASE_URL: str

    # feature flags
    FEATURE_AUTH0: bool | None = Field(
        default=True, description="Feature flag for checking the identity of the caller"
    )
    FEATURE_VERIFY_PERMISSIONS: bool | None = False

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

    @model_validator(mode="after")
    def validate_oauth_settings(self) -> Any:
        """Validate the OAuth settings."""
        if self.FEATURE_AUTH0 and not self.AUTH0_SERVER:
            raise ValueError("FEATURE_AUTH0 is True but AUTH0_SERVER is not set")
        if self.FEATURE_AUTH0 and not self.AUTH0_AUDIENCE:
            raise ValueError("FEATURE_AUTH0 is True but AUTH0_AUDIENCE is not set")
        if self.FEATURE_VERIFY_PERMISSIONS and not self.FEATURE_AUTH0:
            raise ValueError(
                "Can only verify permissions if FEATURE_AUTH0 is set to true"
            )
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()


SettingsDependency = Annotated[Settings, Depends(get_settings)]
