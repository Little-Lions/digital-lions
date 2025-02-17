"""Generic API response models for all endpoints."""

from typing import Generic, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


class Message(BaseModel):
    """Generic API message response model for API error messages."""

    detail: str


class RecordCreated(BaseModel):
    """Generic API message response model for
    when an object created in the database."""

    id: int


class APIResponse(BaseModel, Generic[T]):
    """Generic API response for all endpoints."""

    message: str | None = Field(
        default=None, description="User friendly message", max_length=32
    )
    detail: str | None = Field(default=None, description="Detailed developer message")
    data: T | None = Field(default_factory=list)
