from datetime import datetime

from models._metadata import _UpdatePropertiesIn
from models.role import Level, Role
from pydantic import BaseModel, EmailStr, Field


class UserCurrentGetOut(BaseModel):
    """API response model for GET /users/me."""

    user_id: str
    nickname: str | None = Field(default=None)
    email: EmailStr

    # login information
    email_verified: bool
    created_at: datetime
    updated_at: datetime

    permissions: list[str] = Field(
        description="List of permissions the user has based on their role."
    )

    class Config:
        extra = "ignore"  # Ignore fields not defined in the model


class UserRolePostIn(BaseModel):
    """Model for role that can be assigned to a user."""

    role: Role = Field(description="Role of the user", examples=["Coach"])
    level: Level = Field(
        description="Level at which the role is assigned",
        examples=["Implementing Partner", "Community", "Team"],
    )
    resource_id: int = Field(description="ID of the resource the role is assigned to.")


class UserRoleGetOut(BaseModel):
    """
    Response model for GET /users/:id/roles. Used for listing the
    roles that has been assigned to a user.
    """

    id: int = Field(description="ID of the role")
    role: str = Field(description="Name of the role")
    level: str = Field(description="Level at which the role is assigned")
    resource_id: int = Field(description="ID of the resource the role is assigned to")


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
