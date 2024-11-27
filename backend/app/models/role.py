from enum import Enum

from pydantic import BaseModel, Field


class Role(str, Enum):
    """Enumeration for possible user roles."""

    admin = "Admin"
    coach = "Coach"


class Level(str, Enum):
    """Enumeration for possible entity types that
    a role can be assigned to."""

    implementing_partner = "Implementing Partner"
    community = "Community"
    team = "Team"


class ScopedRole(BaseModel):
    """Model for role that can be assigned to a user."""

    role: Role = Field(description="Role of the user", examples=["Admin", "Coach"])
    level: Level = Field(
        description="Level at which the role is assigned",
        examples=["Community", "Team"],
    )


class RoleResourcesGetOut(BaseModel):
    """
    Reponse model for GET /roles/resources. Used for listing
    the resources at which a role can be assigned. A resource is
    thus any of the entities that a role can be assigned to:
    Implementing Partner, Community or Team. The model attributes are
    the same regardless of the level of the resource.
    """

    resource_id: int = Field(description="ID of the resource")
    resource_name: str = Field(description="Name of the resource")
