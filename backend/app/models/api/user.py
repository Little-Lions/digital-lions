from datetime import datetime
from typing import Any

from models.generic import UpdateProperties
from pydantic import BaseModel, EmailStr, Field, field_validator

ROLES = ["admin", "partner", "community_manager", "coach"]


class UserIDHandler:

    def model_post_init(self, __context: Any) -> None:
        """
        Handle the user ID prefix for the authorization server. That is,
        if the user ID does not have the Auth0 prefix ('auth0|'), add it.
        If the user ID has the Auth0 prefix, remove it.

        """
        if self.user_id.startswith("auth0"):
            self.user_id = self.user_id.split("|")[1]


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
class UserGetOut(UserIDHandler, BaseModel):
    """API response model for GET /users."""

    user_id: str
    nickname: str | None = Field(default=None)
    email: EmailStr
    roles: list[Role] | None = Field(default=None, description="User roles on platform")

    # login information
    email_verified: bool
    created_at: datetime
    updated_at: datetime


class UserGetByIdOut(UserIDHandler, BaseModel):
    """API repsonse model for GET /users/:id."""

    user_id: str
    nickname: str | None = Field(default=None)
    email: EmailStr
    roles: list[str] | None = Field(default=None, description="User roles on platform")

    # login information
    email_verified: bool
    created_at: datetime
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


class UserPatchIn(BaseModel, UpdateProperties, UserValidators):
    """API payload model for PATCH /users/:id."""

    email_address: EmailStr | None = None
    role: str | None = Field(default=None, description="User role on platform")


#
# class UserBase(BaseModel):
#     first_name: str
#     last_name: str = Field(default=None)
#     email_address: EmailStr = Field(unique=True, index=True, sa_type=AutoString)
#     role: str | None = Field(default=None, description="User role on platform")
#
#     @field_validator("role")
#     def validate_role(cls, value):
#         if value not in ROLES:
#             raise ValueError("Invalid role")
#
#
# class UserUpdate(UserBase, UpdateProperties):
#     first_name: str | None = None
#     last_name: str | None = None
#     email_address: EmailStr | None = None
#     role: str | None = None
#     password: str | None = None
#
#

#
# class UserSessionOut(BaseModel):
#     id: int
#     first_name: str
#     last_name: str = Field(default=None)
#     email_address: EmailStr = Field(unique=True, index=True, sa_type=AutoString)
#     role: str | None = Field(default=None, description="User role on platform")
#     token: str
#     expires_at: int
#     created_at: int
#     last_updated_at: int
#     is_active: bool
