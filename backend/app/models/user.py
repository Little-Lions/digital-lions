from datetime import datetime
from enum import Enum

from models._metadata import _UpdatePropertiesIn
from pydantic import BaseModel, EmailStr, Field


class RoleName(str, Enum):
    """Enumeration for possible user roles."""

    admin = "admin"
    coach = "coach"


class Role(BaseModel):
    """Model for role that can be assigned to a user."""

    role: RoleName
    scope: str


class UserGetOut(BaseModel):
    """API response model for GET /users."""

    user_id: str
    nickname: str | None = Field(default=None)
    email: EmailStr
    roles: list[Role] | None = Field(
        default_factory=list, description="User roles on platform"
    )

    # login information
    email_verified: bool
    created_at: datetime
    updated_at: datetime


class UserGetByIdOut(BaseModel):
    """API repsonse model for GET /users/:id."""

    user_id: str
    nickname: str | None = Field(default=None)
    email: EmailStr
    roles: list[Role] | None = Field(
        default_factory=list, description="User roles on platform"
    )

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

        role: RoleName
        scope: str

    roles: list[Role] | None = Field(
        default_factory=list, description="User roles on platform"
    )


class UserPostOut(BaseModel):
    """API response model for POST /users."""

    user_id: str
    message: str


class UserPatchIn(BaseModel, _UpdatePropertiesIn):
    """API payload model for PATCH /users/:id."""

    email_address: EmailStr | None = None
    role: str | None = Field(default=None, description="User role on platform")
