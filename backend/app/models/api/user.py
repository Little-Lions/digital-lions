from datetime import datetime
from typing import Any

from models.generic import UpdateProperties
from pydantic import BaseModel, EmailStr, Field, field_validator

ROLES = ["admin", "partner", "community_manager", "coach"]


class UserValidators:
    """Validators for user model."""

    @field_validator("role")
    def validate_role(cls, value):
        if value not in ROLES:
            raise ValueError("Invalid role")


class Role(BaseModel):
    """Model for role that can be assigned to a user."""

    role: str
    scope: str


# note that BaseModel should come after the validators
class UserGetOut(BaseModel):
    """API response model for GET /users."""

    user_id: str
    nickname: str | None = Field(default=None)
    email: EmailStr
    roles: list[Role] | None = Field(default=None, description="User roles on platform")

    # login information
    email_verified: bool
    created_at: datetime
    updated_at: datetime


class UserGetByIdOut(BaseModel):
    """API repsonse model for GET /users/:id."""

    user_id: str
    nickname: str | None = Field(default=None)
    email: EmailStr
    roles: list[str] | None = Field(default=None, description="User roles on platform")

    # login information
    email_verified: bool | None
    created_at: datetime | None
    updated_at: datetime | None = None
    last_login: datetime | None = None
    logins_count: int | None = 0


class UserPostIn(BaseModel):
    """API payload model for inviting a new user to the platform via /users."""

    email: EmailStr

    class Role(BaseModel):
        """Model for role that can be assigned to a user."""

        role: str
        scope: str

    roles: list[Role] | None = Field(default=None, description="User roles on platform")


class UserPostOut(BaseModel):
    """API response model for POST /users."""

    user_id: str
    message: str


class UserPatchIn(BaseModel, UpdateProperties, UserValidators):
    """API payload model for PATCH /users/:id."""

    email_address: EmailStr | None = None
    role: str | None = Field(default=None, description="User role on platform")
