import logging
from abc import ABC, abstractmethod
from typing import TypeVar

from core.database.session import SessionDependency
from core.email import EmailService
from core.settings import get_settings
from repositories import database as db
from repositories._base import Columns
from sqlmodel import SQLModel

Model = TypeVar("Model", bound=SQLModel)

logger = logging.getLogger(__name__)


class AbstractService(ABC):
    """Abstract class to be used as a parent class for all services,
    defining the methods that each service should implement."""

    @abstractmethod
    def get_all(self):
        """Get all objects from the table."""
        pass

    @abstractmethod
    def get(self, object_id):
        """Get an object from the repository that is
        represented by the service, by ID."""
        pass

    @abstractmethod
    def create(self, obj: Model):
        """Create a new object on the repository that is
        represented by the service."""
        pass

    @abstractmethod
    def update(self, object_id: int, obj):
        """Update an object on the repository that is represented
        by the service."""
        pass

    @abstractmethod
    def delete(self, object_id: int):
        """Delete an object from the repository."""
        pass


class BaseService:
    """Internal class to make each API request act as
    on a unit of work on the database."""

    def __init__(self, session: SessionDependency) -> None:
        """Instantiate all repositories.

        Args:
            session: database session.
        """
        self._session: SessionDependency = session
        self._attendances = db.AttendanceRepository(session=self._session)
        self._communities = db.CommunityRepository(session=self._session)
        self._children = db.ChildRepository(session=self._session)
        self._teams = db.TeamRepository(session=self._session)
        self._workshops = db.WorkshopRepository(session=self._session)
        self.settings = get_settings()
        self.email_service = EmailService(settings=self.settings)
        self.cols = Columns

    def __enter__(self):
        """On entering context start a transaction."""
        return self

    def __exit__(self, exc_type, exc_value, traceback) -> None:
        """On exit rollback any staged database changes."""
        self.rollback()

    def commit(self) -> None:
        """Commit all staged changes to the database."""
        self._session.commit()

    def rollback(self) -> None:
        """Rollback all staged changes in the database."""
        self._session.rollback()
