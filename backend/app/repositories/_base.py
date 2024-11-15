"""Base repository for database repositories."""

from enum import Enum
from typing import Generic, TypeVar

from core import exceptions
from core.database.session import SessionDependency
from sqlalchemy import and_, delete
from sqlmodel import SQLModel

Model = TypeVar("Model", bound=SQLModel)


class Columns(str, Enum):
    """Enum for all columns in the database."""

    id = "id"
    name = "name"
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
        """
        Create an object in the database table.

        Args:
            obj (Model): The object to create.

        Returns:
            Model: The created object including primary key.
        """
        new_obj = self._model.model_validate(obj)
        self._session.add(new_obj)
        self._session.flush()
        self._session.refresh(new_obj)
        return new_obj

    def read(self, object_id: int) -> Model | None:
        """
        Read a record from the database table by primary key,
        which is often the `id` column.

        Args:
            object_id (int): The primary key of the record to read.

        Returns:
            Model: The record from the database table.

        Raises:
            exceptions.ItemNotFoundError: If the record is not found.
        """
        obj = self._session.get(self._model, object_id)
        if not obj:
            raise exceptions.ItemNotFoundError(f"{self._model.__name__} not found.")
        return obj

    def read_all(self) -> list[Model] | None:
        """Read all objects from the table."""
        objects = self._session.query(self._model).all()
        return objects

    def update(self, object_id: int, obj: Model) -> Model:
        """
        Update a record in the database table by primary key.

        Args:
            object_id (int): The primary key of the record to update.
            obj (Model): The updated record.

        Returns:
            Model: The updated record.

        Raises:
            exceptions.ItemNotFoundError: If the record is not found.
        """

        db_object = self._session.get(self._model, object_id)
        if not db_object:
            raise exceptions.ItemNotFoundError()

        obj_data = obj.model_dump(exclude_unset=True)
        db_object.sqlmodel_update(obj_data)
        self._session.add(db_object)
        self._session.flush()
        self._session.refresh(db_object)
        return db_object

    def delete(self, object_id: int) -> None:
        """Delete an object from the table."""
        obj = self._session.get(self._model, object_id)
        if not obj:
            raise exceptions.ItemNotFoundError()
        self._session.delete(obj)
        self._session.flush()

    def delete_where(self, attr: str, value: str) -> None:
        """Delete all objects by an attribute matching a value."""
        statement = delete(self._model).where(getattr(self._model, attr) == value)
        self._session.exec(statement)
        self._session.flush()

    def where(self, filters: list[tuple[str, str]]) -> list[Model] | None:
        """
        Filter table by one or more columns where all filters need to be met (AND).

        Args:
            filters (list[tuple[str, str]]): A list of tuples where each tuple
                contains the column name and the value to filter by.
                E.g. [("name", "John"), ("age", 25)].

        Returns:
            list[Model] | None: A list of objects that meet all the filters,
                or empty list.
        """
        expr = and_(*self._construct_filter(filters))
        return self._session.query(self._model).where(and_(expr)).all()

    def where_in(self, attr: str, values: list[str]) -> list[Model] | None:
        """
        Filter table by list of values for one given column (attribute).

        Args:
            attr (str): The attribute (column) to filter by.
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
        """
        Construct a filter from a list of tuples where each tuple
        contains the attribute and the value to filter by.

        Args:
            filters (list[tuple[str, str]]): A list of tuples where each tuple
                contains the attribute and the value to filter by. E.g.
                [("name", "John"), ("age", 25)].

        Returns:
            list: A list of filter expressions
        """
        filter_list = []
        for expr in filters:
            if expr[1] is not None:
                filter_list.append(getattr(self._model, expr[0]) == expr[1])
        return filter_list
