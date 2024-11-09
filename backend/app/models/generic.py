"""Generic API response models for all endpoints."""

from pydantic import BaseModel


class Message(BaseModel):
    """Generic API message response model for API error messages."""

    detail: str


class RecordCreated(BaseModel):
    """Generic API message response model for
    when an object created in the database."""

    id: int
