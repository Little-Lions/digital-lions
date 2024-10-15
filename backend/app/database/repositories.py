"""Repositories for CRUD operations on the database.
Each table in the database translate to a repository class."""

from enum import Enum
from typing import Generic, TypeVar

from core import exceptions
from database import schema
from database.session import SessionDependency
from sqlalchemy import and_, delete, func
from sqlmodel import SQLModel

Model = TypeVar("Model", bound=SQLModel)


class Columns(str, Enum):
    """Enum for all columns in the database."""

    id = "id"
    name = "name"
    email_address = "email_address"
    password = "password"
    salt = "salt"
    hashed_password = "hashed_password"
    team_id = "team_id"
    workshop_number = "workshop_number"
    date = "date"
    attendance = "attendance"
    child_id = "child_id"
    workshop_id = "workshop_id"


class BaseRepository(Generic[Model]):
    """Generic repository template metaclass for all repositories that
    interact with a table in the database. Supports all classic CRUD
    operations as well as custom queries."""

    _model: type[Model]
    cols: Columns

    def __init__(self, session: SessionDependency):
        self._session: SessionDependency = session

    def create(self, obj: Model) -> Model:
        """Create an object in the table."""
        new_obj = self._model.model_validate(obj)
        self._session.add(new_obj)
        self._session.flush()
        self._session.refresh(new_obj)
        return new_obj

    def delete(self, object_id: int) -> None:
        """Delete an object from the table."""
        obj = self._session.get(self._model, object_id)
        if not obj:
            raise exceptions.ItemNotFoundException()
        self._session.delete(obj)
        self._session.flush()

    def delete_where(self, attr: str, value: str) -> None:
        """Delete all objects by an attribute matching a value."""
        statement = delete(self._model).where(getattr(self._model, attr) == value)
        self._session.exec(statement)
        self._session.flush()

    def read(self, object_id: int) -> Model | None:
        """Read an object from the table."""
        obj = self._session.get(self._model, object_id)
        if not obj:
            raise exceptions.ItemNotFoundException()
        return obj

    def read_all(self) -> list[Model] | None:
        """Read all objects from the table."""
        objects = self._session.query(self._model).all()
        return objects

    def update(self, object_id: int, obj: Model) -> Model:
        """Update an object in the table."""
        db_object = self._session.get(self._model, object_id)
        if not db_object:
            raise exceptions.ItemNotFoundException()

        obj_data = obj.model_dump(exclude_unset=True)
        db_object.sqlmodel_update(obj_data)
        self._session.add(db_object)
        self._session.flush()
        self._session.refresh(db_object)
        return db_object

    def where(self, filters: list[tuple[str, str]]) -> list[Model] | None:
        """Filter table by one or more columns where all filters need to be met (AND).

        Args:
            filters (list[tuple[str, str]]): A list of tuples where each tuple contains
            the column name and the value to filter by. E.g. [("name", "John"), ("age", 25)].

        Returns:
            list[Model]: A list of objects that meet all the filters.
        """
        expr = and_(*self._construct_filter(filters))
        return self._session.query(self._model).where(and_(expr)).all()

    def where_in(self, attr: str, values: list[str]) -> list[Model] | None:
        """Filter table by an attribute where the attribute value is in a list of values.
        Args:
            attr (str): The attribute to filter by.
            values (list[str]): A list of values to filter by.
        Returns:
            list[Model]: A list of objects that meet the filter.
        """
        return (
            self._session.query(self._model)
            .filter(getattr(self._model, attr).in_(values))
            .all()
        )

    def query(self, query: str) -> list[Model]:
        """Execute a custom query."""
        objects = self._session.exec(query)
        return objects

    def _construct_filter(self, filters: list[tuple[str, str]]) -> list:
        """Construct a filter from a list of tuples where each tuple
        contains the attribute and the value to filter by.

        Args:
            filters (list[tuple[str, str]]): A list of tuples where each tuple
                contains the attribute and the value to filter by. E.g.
                [("name", "John"), ("age", 25)].
        """
        filter_list = []
        for expr in filters:
            if expr[1] is not None:
                filter_list.append(getattr(self._model, expr[0]) == expr[1])
        return filter_list


class AttendanceRepository(BaseRepository[schema.Attendance]):
    """Repository to interact with attendances table."""

    _model = schema.Attendance


class ChildRepository(BaseRepository[schema.Child]):
    """Repository to interact with children table."""

    _model = schema.Child


class CommunityRepository(BaseRepository[schema.Community]):
    """Repository to interact with Communities table."""

    _model = schema.Community


class ProgramRepository(BaseRepository[schema.Program]):
    """Repository to interact with Program table."""

    _model = schema.Program


class TeamRepository(BaseRepository[schema.Team]):
    """Repository to interact with Team table."""

    _model = schema.Team


class WorkshopRepository(BaseRepository[schema.Workshop]):
    """Repository to interact with Workshop table."""

    _model = schema.Workshop

    # TODO ideally below method should pass 0 if a team has no workshop yet
    # also saves us ugly list comprehesions later
    def get_last_workshop_per_team(self, team_ids: list[int]) -> dict:
        """For a list of team ID's, get the highest workshop number
        for each team.

        Args:
            team_ids (list[int]): List of team ID's to get aggregation for.

        Returns:
            dict: Dictionary with team ID as key and highest workshop number as value.
        """
        results = (
            self._session.query(
                self._model.team_id, func.max(self._model.workshop_number)
            )
            .filter(self._model.team_id.in_(team_ids))
            .group_by(self._model.team_id)
            .all()
        )

        result_dict = {team_id: workshop_number for team_id, workshop_number in results}
        return result_dict
