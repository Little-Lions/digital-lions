from datetime import datetime

from models._metadata import _UpdatePropertiesIn
from models.role import Level, Role
from pydantic import BaseModel, EmailStr, Field


class UserRolePostIn(BaseModel):
    """Model for role that can be assigned to a user."""

    role: Role = Field(description="Role of the user", examples=["Coach"])
    level: Level = Field(
        description="Level at which the role is assigned",
        examples=["Community", "Team"],
    )
    resource_id: int = Field(description="ID of the resource the role is assigned to.")


class UserGetRolesOut(BaseModel):
    """API response model for GET /users/:id/roles."""

    user_id: str
    roles: list[UserRolePostIn] | None = Field(
        default_factory=list, description="List of assigned roles on platform"
    )


class UserGetOut(BaseModel):
    """API response model for GET /users."""

    user_id: str
    nickname: str | None = Field(default=None)
    email: EmailStr

    # login information
    email_verified: bool
    created_at: datetime
    updated_at: datetime


class UserGetByIdOut(BaseModel):
    """API repsonse model for GET /users/:id."""

    user_id: str
    nickname: str | None = Field(default=None)
    email: EmailStr

    # login information
    email_verified: bool | None
    created_at: datetime | None
    updated_at: datetime | None = None
    last_login: datetime | None = None
    logins_count: int | None = 0


class UserPostIn(BaseModel):
    """API payload model for inviting a new user to the platform via /users."""

    email: EmailStr


class UserPostOut(BaseModel):
    """API response model for POST /users."""

    user_id: str
    message: str


class UserPatchIn(BaseModel, _UpdatePropertiesIn):
    """API payload model for PATCH /users/:id."""

    email_address: EmailStr | None = None
