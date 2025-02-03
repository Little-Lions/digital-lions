from pydantic import BaseModel, Field, field_validator

from models._metadata import (
    _CreatePropertiesIn,
    _MetadataPropertiesOut,
    _UpdatePropertiesIn,
)


class ChildValidators:
    """Validation methods for child model."""

    @field_validator("gender")
    def validate_gender(cls, v) -> str:
        """Validate that the gender is either male, female or null."""
        if v is not None and v not in ["male", "female"]:
            raise ValueError(
                f"Invalid gender, should be male, female or null. Got: {v}"
            )
        return v

    @field_validator("age")
    def validate_age(cls, v) -> int:
        """Validate that age is a positive integer."""
        if v is not None and v <= 0 and v > 100:
            raise ValueError(f"Age {v} is invalid")
        return v


class ChildPostIn(BaseModel, _CreatePropertiesIn, ChildValidators):
    """API payload model for creating a child."""

    first_name: str = Field(description="First name of child", example="Nelson")
    last_name: str = Field(description="Last name of child", example="Mandela")
    age: int | None = Field(
        description="Optional age in years at the time of registration",
        default=None,
        example=10,
    )
    gender: str | None = Field(
        default=None,
        description="Optional gender of child. Either 'male', 'female' or null.",
        examples=["male", "female"],
    )
    team_id: int = Field(description="Team ID to which the child belongs", example=1)


class ChildPatchIn(BaseModel, _UpdatePropertiesIn, ChildValidators):
    """API payload model for PATCH /children/:id for updating a child."""

    first_name: str | None = Field(
        description="First name of child", example="Nelson", default=None
    )
    last_name: str | None = Field(
        description="Last name of child", example="Mandela", default=None
    )
    age: int | None = Field(
        description="Optional age in years at the time of registration",
        default=None,
        example=10,
    )
    gender: str | None = Field(
        default=None,
        description="Optional gender of child. Either 'male', 'female' or null.",
        examples=["male", "female"],
    )


class ChildGetByIdOut(BaseModel, _MetadataPropertiesOut):
    """Response model for GET /children/{id}."""

    id: int
    first_name: str
    last_name: str
    age: int | None = Field(
        default=None,
        description="Age in years at the time of registration",
    )
    gender: str | None = Field(
        default=None, description="Gender of child. Either male or female."
    )
    team_id: int


class ChildGetOut(BaseModel):
    """Response model for list response of GET /children."""

    first_name: str
    last_name: str
    id: int
    age: int | None = Field(
        default=None,
        description="Age in years at the time of registration",
    )
    gender: str | None = Field(
        default=None, description="Gender of child. Either male or female."
    )
