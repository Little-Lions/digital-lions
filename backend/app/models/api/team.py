import datetime

from models.generic import CreateProperties, MetadataColumns, UpdateProperties
from pydantic import BaseModel, Field, field_validator


class TeamPostIn(BaseModel, CreateProperties):
    """API payload model for POST /teams."""

    name: str = Field(description="Name of the team")
    community_id: int = Field(description="ID of community the team belongs to")


class TeamPatchIn(BaseModel, UpdateProperties):
    """API payload model for PATCH /teams."""

    # Note this model is mainly used to update the Team's active status
    name: str = Field(description="Name of the team", default=None)
    community_id: int = Field(
        description="ID of community the team belongs to", default=None
    )


class TeamGetOut(BaseModel):
    """API response model for getting a team."""

    class CommunityOut(BaseModel):
        """API response model community as part of team."""

        id: int
        name: str

    class Program(BaseModel):
        """API response model for status of team."""

        class Progress(BaseModel):
            """API response model for progress of team."""

            current: int = Field(
                description="Last completed workshop in the program",
            )
            total: int = Field(
                description="Total number of workshops in the program",
                default=12,
            )

        id: int = Field(description="ID of the program", default=1)
        name: str = Field(description="Name of the program", default="Default Program")
        progress: Progress

    community: CommunityOut
    is_active: bool
    id: int
    name: str
    program: Program


class TeamGetByIdOut(BaseModel, MetadataColumns):
    """API response model for GET /teams/:id."""

    class Community(BaseModel):
        """API response model community as part of team."""

        id: int = Field(description="ID of the community", example=1)
        name: str = Field(description="Name of the community", example="Khayelitsha")

    class Program(BaseModel):
        """API response model for status of team."""

        class Progress(BaseModel):
            """API response model for progress of team."""

            current: int = Field(
                description="Last completed workshop in the program",
            )
            total: int = Field(
                description="Total number of workshops in the program",
                default=12,
            )

        id: int = Field(description="ID of the program", default=1)
        name: str = Field(description="Name of the program", default="Default Program")
        progress: Progress

    class Child(BaseModel):
        """API response model for child as part of team."""

        id: int = Field(description="ID of the child", example=1)
        first_name: str = Field(description="First name of the child", example="Nelson")
        last_name: str = Field(description="Last name of the child", example="Mandela")

    id: int = Field(description="ID of the team", example=1)
    name: str = Field(description="Name of the team", example="The A-Team")
    community: Community
    children: list[Child]
    program: Program
    is_active: bool = Field(
        description="Whether the team is still active in the program", example=True
    )


class TeamGetWorkshopOut(BaseModel):
    """API response model for GET /teams/:id/workshops.
    This response contains aggregated information about a workshop,
    but not the per child attendance."""

    class Workshop(BaseModel):
        """Workshop info."""

        name: str
        id: int = Field(description="Unique identifier of workshop in database.")
        number: int = Field(description="Number of workshop in the program")
        date: str = Field(
            description="Date the workshop took place in format YYYY-MM-DD",
            example="2021-01-01",
        )

    class Attendance(BaseModel):
        """Aggregated attendance score of a workshop."""

        present: int = Field(
            description="Number of children that were present at the workshop."
        )
        cancelled: int = Field(
            description="Number of children that cancelled the workshop."
        )
        absent: int = Field(
            description="Number of children that were absent at the workshop."
        )
        total: int = Field(description="Total number of children in the team.")

    workshop: Workshop
    attendance: Attendance


class TeamGetWorkshopByNumberOut(BaseModel):
    """API response model for GET /teams/:id/workshops/:workshopNumber.
    This reponse contains per child attendance information for a workshop."""

    class Workshop(BaseModel):
        """Workshop info."""

        name: str = Field(description="Name of the workshop", example="Workshop 1")
        id: int = Field(
            description="Unique identifier of workshop in database.", example=1000
        )
        number: int = Field(description="Number of workshop in the program", example=1)
        date: str = Field(
            description="Date the workshop took place in format YYYY-MM-DD",
            example="2021-01-01",
        )

    class Attendance(BaseModel):
        """Attendance of a child to a workshop."""

        attendance: str = Field(
            description="Attendance status of the child",
            examples=["present", "absent", "cancelled"],
        )
        child_id: int = Field(description="ID of the child")
        first_name: str = Field(description="First name of the child", example="Nelson")
        last_name: str = Field(description="Last name of the child", example="Mandela")

    workshop: Workshop
    attendance: list[Attendance]


class TeamPostWorkshopIn(BaseModel):
    """API payload model for POST /teams/:id/workshops."""

    class Attendance(BaseModel):
        """Model for adding attendance to a workshop, part
        of the WorkshopPostIn payload."""

        attendance: str = Field(
            description="Attendance status of the child to the workshop. "
            "Must be 'present', 'absent', or 'cancelled'."
        )
        child_id: int = Field(description="ID of the child")

        @field_validator("attendance")
        def validate_attendance(cls, v):
            if v not in ["present", "absent", "cancelled"]:
                raise ValueError(
                    "Attendance must be either 'present' or 'absent' or 'cancelled'"
                )
            return v

    date: datetime.date = Field(
        description="The date of the workshop in the format YYYY-MM-DD"
    )
    workshop_number: int = Field(
        description="The number of the workshop in the program, which must be between 1 and 12."
    )
    attendance: list[Attendance] | None = Field(
        description="List of attendance records of all children in the team."
    )

    @field_validator("workshop_number")
    def workshop_number_in_default_range(cls, v):
        """Validate that the workshop number is between 1 and 12."""
        if v not in range(1, 13):
            raise ValueError("Workshop number must be between 1 and 12.")
        return v

    @field_validator("date")
    def convert_date_to_str(cls, v) -> str:
        """Convert date to date format YYYY-MM-DD if it is provided."""
        if v is not None:
            v = v.strftime("%Y-%m-%d")
        return v
