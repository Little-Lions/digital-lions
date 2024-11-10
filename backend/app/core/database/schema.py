"""Database schema for all tables in the database."""

from models._metadata import _MetadataPropertiesOut
from sqlalchemy import Column, ForeignKey, Integer
from sqlmodel import Field, Relationship, SQLModel, UniqueConstraint


class Child(SQLModel, _MetadataPropertiesOut, table=True):
    """Schema for child model in database."""

    __tablename__ = "children"
    id: int = Field(default=None, primary_key=True)
    first_name: str
    last_name: str

    age: int | None = Field(
        default=None,
        description="Age in years at the time of registration",
    )
    gender: str | None = Field(
        default=None, description="Gender of child. Either male or female."
    )

    team: "Team" = Relationship(back_populates="children")
    team_id: int = Field(
        sa_column=Column(Integer, ForeignKey("teams.id", ondelete="CASCADE"))
    )
    attendances: list["Attendance"] = Relationship(
        sa_relationship_kwargs={"cascade": "delete"}, back_populates="child"
    )


class Team(SQLModel, _MetadataPropertiesOut, table=True):
    """Data model for teams. A team is a group of children that
    follow the Little Lions program: a set of workshops. The workshops
    that the team follows are linked to the team as well."""

    __tablename__ = "teams"

    id: int = Field(default=None, primary_key=True)
    name: str = Field(description="Name of the team")

    community_id: int = Field(
        sa_column=Column(Integer, ForeignKey("communities.id", ondelete="CASCADE"))
    )
    community: "Community" = Relationship(back_populates="teams")
    children: list["Child"] | None = Relationship(
        sa_relationship_kwargs={"cascade": "delete"}, back_populates="team"
    )
    workshops: list["Workshop"] | None = Relationship(
        sa_relationship_kwargs={"cascade": "delete"}, back_populates="team"
    )


class Community(SQLModel, _MetadataPropertiesOut, table=True):
    """Schema for community in database."""

    __tablename__ = "communities"
    id: int = Field(default=None, primary_key=True)

    name: str
    teams: list["Team"] = Relationship(
        sa_relationship_kwargs={"cascade": "delete"}, back_populates="community"
    )


class Attendance(SQLModel, table=True):
    """Data model for attendance of a child in a workshop."""

    __tablename__ = "attendances"

    id: int = Field(default=None, primary_key=True)
    attendance: str

    child_id: int = Field(
        sa_column=Column(Integer, ForeignKey("children.id", ondelete="CASCADE")),
    )
    workshop_id: int = Field(
        sa_column=Column(Integer, ForeignKey("workshops.id", ondelete="CASCADE")),
    )

    child: "Child" = Relationship(back_populates="attendances")
    workshop: "Workshop" = Relationship(back_populates="attendance")


class Workshop(SQLModel, table=True):
    """Data model for workshops. A workshop is a session that took place with a team
    on a given date in a given community."""

    __tablename__ = "workshops"
    __table__args__ = (
        UniqueConstraint(
            "team_id", "workshop_number", name="unique_workshop_number_per_team"
        ),
    )

    date: str = Field(description="The date of the workshop in the format YYYY-MM-DD")
    workshop_number: int = Field(
        description="The number of the workshop in the program"
    )

    id: int = Field(default=None, primary_key=True)
    team_id: int = Field(
        sa_column=Column(Integer, ForeignKey("teams.id", ondelete="CASCADE"))
    )

    team: "Team" = Relationship(
        sa_relationship_kwargs={"cascade": "delete"}, back_populates="workshops"
    )
    attendance: list["Attendance"] = Relationship(
        sa_relationship_kwargs={"cascade": "delete"}, back_populates="workshop"
    )


class Program(SQLModel, table=False):
    """Data model for workshop programs. A program is a set of workshops that a team
    follows. It is used to track the progress of a team through the workshops. The table's
    ID column (PK) is an indicator (FK on Team's table) of where a team is in the program.

    Example:
        With program_id 1, workshop 0, the Team has not started the pgram yet.
        With program_id 1, workshop 1, the Team has completed workshop 1.
    """

    __tablename__ = "programs"

    id: int = Field(default=None, primary_key=True)
    program_id: int = Field()
    workshop: int = Field()
    workshop_name: str = Field(default=None)


# for V1 there will not be a program table in the databse, instead
# we just hardcode a default program of 12 workshops
DefaultProgram = [
    Program(id=n, program_id=1, workshop=n, workshop_name=f"Workshop {n}")
    for n in range(1, 13)
]

class Roles(SQLModel, table=True):
    """Data model for user roles in the app."""

    __tablename__ = "roles"
    id: int = Field(default=None, primary_key=True)
    user_id: str = Field(description="Auth0 user ID.")
    role: str = Field(description="Role of the user")
    scope: str = Field(description="Scope of the role ")
