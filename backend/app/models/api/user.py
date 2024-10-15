from models.generic import CreateProperties, UpdateProperties
from pydantic import BaseModel, EmailStr, field_validator
from sqlmodel import AutoString, Field, SQLModel

ROLES = ["admin", "partner", "community_manager", "coach"]


class UserValidators:
    """Validators for user model."""

    @field_validator("role")
    def validate_role(cls, value):
        if value not in ROLES:
            raise ValueError("Invalid role")


class UserPostIn(BaseModel, CreateProperties, UserValidators):
    """API payload model for POST /users."""

    first_name: str | None = Field(default=None)
    last_name: str | None = Field(default=None)
    email_address: EmailStr
    password: str = Field(description="Plain user password")
    role: str | None = Field(default=None, description="User role on platform")


class UserPatchIn(BaseModel, UpdateProperties, UserValidators):
    """API payload model for PATCH /users/:id."""

    first_name: str | None = None
    last_name: str | None = None
    email_address: EmailStr | None = None
    role: str | None = Field(default=None, description="User role on platform")
    password: str | None = None


class UserPostLoginIn(BaseModel):
    """API payload model for POST /users/login."""

    email_address: EmailStr
    password: str


class UserPostInviteIn(BaseModel):
    """API payload model for inviting a new user to the platform via /users/invite-user."""

    email_address: EmailStr

    class Role(BaseModel):
        """Model for role that can be assigned to a user."""

        role: str
        scope: str

    roles: list[Role] | None = None


class UserBase(SQLModel):
    first_name: str
    last_name: str = Field(default=None)
    email_address: EmailStr = Field(unique=True, index=True, sa_type=AutoString)
    role: str | None = Field(default=None, description="User role on platform")

    @field_validator("role")
    def validate_role(cls, value):
        if value not in ROLES:
            raise ValueError("Invalid role")


class UserCreate(UserBase, CreateProperties):
    password: str


class UserUpdate(UserBase, UpdateProperties):
    first_name: str | None = None
    last_name: str | None = None
    email_address: EmailStr | None = None
    role: str | None = None
    password: str | None = None


class UserGetByIdOut(BaseModel):
    id: int
    first_name: str | None = Field(default=None)
    last_name: str | None = Field(default=None)
    email_address: EmailStr = Field(unique=True, index=True, sa_type=AutoString)
    role: str | None = Field(default=None, description="User role on platform")


class UserSessionOut(BaseModel):
    id: int
    first_name: str
    last_name: str = Field(default=None)
    email_address: EmailStr = Field(unique=True, index=True, sa_type=AutoString)
    role: str | None = Field(default=None, description="User role on platform")
    token: str
    expires_at: int
    created_at: int
    last_updated_at: int
    is_active: bool
