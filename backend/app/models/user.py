from datetime import datetime

from pydantic import BaseModel, EmailStr
from sqlmodel import AutoString, Field, SQLModel

ROLES = ["admin", "partner", "community_owner", "coach"]


class UserLogin(BaseModel):
    email_address: EmailStr
    password: str


class UserBase(SQLModel):
    first_name: str
    last_name: str = Field(default=None)
    email_address: EmailStr = Field(unique=True, index=True, sa_type=AutoString)
    role: str | None = Field(default=None, description="User role on platform")

    # @field_validator("role")
    # def validate_role(cls, value):
    #     if value not in ROLES:
    #         raise ValueError("Invalid role")


class UserCreate(UserBase):
    password: str


class UserUpdate(UserCreate):
    is_active: bool = True
    password: str = Field(default=None)


class User(UserBase, table=True):
    """User model in database."""

    __tablename__ = "users"
    created_at: datetime = datetime.now()
    id: int | None = Field(default=None, primary_key=True)
    hashed_password: bytes = Field(description="Hashed password in bytes")
    salt: bytes = Field(
        description="Random byte string with which the password is encrypted"
    )
