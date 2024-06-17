from __future__ import annotations

from models.base import CreatedAt, UpdatedAt
from pydantic import field_validator
from sqlmodel import Field, SQLModel


class ChildValidator:
    """Methods to validate child input on creation or updating."""

    @field_validator("gender")
    def validate_gender(cls, v) -> str:
        if v is not None and v not in ["male", "female"]:
            raise ValueError("Invalid gender")
        return v

    @field_validator("age")
    def validate_age(cls, v) -> int:
        if v is not None and v <= 0:
            raise ValueError("Negative age is invalid")
        return v


class ChildBase(SQLModel, ChildValidator, CreatedAt, UpdatedAt):
    """Base schema for child model."""

    first_name: str
    last_name: str
    age: int | None = Field(
        default=None,
        description="Age in years at the time of registration",
    )
    dob: str | None = Field(default=None, description="Date of birth in the format YYYY-MM-DD")
    gender: str | None = Field(default=None, description="Gender of child")
    community_id: int = Field(foreign_key="community.id")


class Child(ChildBase, table=True):
    """Schema for child model in database."""

    # __table_args__ = {"extend_existing": True}
    id: int = Field(default=None, primary_key=True)

    # community: Community | None = Relationship(back_populates="children")
    # attendances: list[Attendance] = Relationship(back_populates="child")


class ChildCreate(ChildBase):
    """Schema for creating a child."""

    pass


class ChildUpdate(SQLModel, ChildValidator, UpdatedAt):
    """Schema for updating a child."""

    first_name: str | None = None
    last_name: str | None = None
    age: int | None = None
    dob: str | None = None
    gender: str | None = None
    community_id: int | None = None
    is_active: bool | None = None
