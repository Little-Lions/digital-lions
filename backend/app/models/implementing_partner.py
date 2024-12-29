from models._metadata import _CreatePropertiesIn, _MetadataPropertiesOut
from pydantic import BaseModel
from sqlmodel import Field


class ImplementingPartnerPostIn(BaseModel, _CreatePropertiesIn):
    """API payload model for POST /implementing_partners endpoint."""

    name: str = Field(description="Name of the community")


class ImplementingPartnerGetOut(BaseModel):
    """API response model for GET /implementing_partners."""

    id: int
    name: str


class ImplementingPartnerGetByIdOut(BaseModel, _MetadataPropertiesOut):
    """API response model for GET /implementing_partners/:id."""

    id: int
    name: str
