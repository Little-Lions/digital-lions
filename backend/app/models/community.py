from models._metadata import (
    _CreatePropertiesIn,
    _MetadataPropertiesOut,
    _UpdatePropertiesIn,
)
from pydantic import BaseModel, Field


class CommunityPostIn(BaseModel, _CreatePropertiesIn):
    """API payload model for POST /communities endpoint."""

    name: str = Field(description="Name of the community")

    class Config:
        # useful for setting the implementing partner ID
        extra = "allow"


class CommunityPatchIn(BaseModel, _UpdatePropertiesIn):
    """API payload model for PATCH /communities/{id} endpoint."""

    name: str | None = None


class CommunityGetOut(BaseModel):
    """API response model for GET /communities."""

    id: int
    name: str

    class Config:
        extra = "ignore"


class CommunityGetByIdOut(BaseModel, _MetadataPropertiesOut):
    """API response model for GET /communities/:id."""

    id: int
    name: str
