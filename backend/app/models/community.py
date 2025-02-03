from pydantic import BaseModel, Field

from models._metadata import (
    _CreatePropertiesIn,
    _MetadataPropertiesOut,
    _UpdatePropertiesIn,
)

# TODO: remove once we support multiple Implementing Partners
VALID_IMPLEMENTING_PARTNER_ID = 1


class CommunityPostIn(BaseModel, _CreatePropertiesIn):
    """API payload model for POST /communities endpoint."""

    name: str = Field(description="Name of the community")
    implementing_partner_id: int | None = Field(
        description="Implementing partner in which to create the community.",
        default=VALID_IMPLEMENTING_PARTNER_ID,
    )


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
