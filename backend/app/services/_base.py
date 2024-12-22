import logging
from abc import ABC, abstractmethod
from typing import Annotated, TypeVar

from core.auth import BearerTokenHandlerInst
from core.context import Permission
from core.database.session import SessionDependency
from core.email import EmailService
from core.settings import SettingsDependency
from fastapi import Depends, Request
from models.user import CurrentUser
from repositories.database import DatabaseRepositories
from sqlmodel import SQLModel

Model = TypeVar("Model", bound=SQLModel)

logger = logging.getLogger(__name__)


class BaseService(ABC):
    """Abstract base class for all application services implementing
    Unit of Work pattern.

    This class serves as the foundation for all service layer implementations,
    providing:
    - Database session management and transaction control
    - Access to all repositories
    - Email service integration
    - Application settings access
    - Unit of Work pattern implementation
    - Access to the current user for RBAC

    Each service inheriting from this class must implement the basic CRUD operations
    and will automatically gain access to all repositories and shared functionality.

    """

    permissions = Permission

    def __init__(
        self,
        session: SessionDependency,
        settings: SettingsDependency,
        current_user: Annotated[
            BearerTokenHandlerInst, Depends(BearerTokenHandlerInst)
        ],
    ) -> None:
        """Initialize service with database session and instantiate dependencies.

        Sets up all repository instances, email service, and loads application
        settings. Each service instance operates within a single database
        transaction context.

        Args:
            session: SQLAlchemy database session for transaction management
        """
        self._session: SessionDependency = session
        self.settings: SettingsDependency = settings
        self.email_service = EmailService(settings=self.settings)
        self.database = DatabaseRepositories(session=self._session)
        self.current_user = current_user

    @abstractmethod
    def create(self, obj: Model):
        """Create a new object on the repository that is
        represented by the service."""
        pass

    @abstractmethod
    def get(self, object_id: int) -> Model:
        """Get an object from the repository that is
        represented by the service, by ID."""
        pass

    @abstractmethod
    def get_all(self) -> list[Model] | None:
        """Get all objects from the table."""
        pass

    @abstractmethod
    def update(self, object_id: int, obj: Model):
        """Update an object on the repository that is represented
        by the service."""
        pass

    @abstractmethod
    def delete(self, object_id: int):
        """Delete an object from the repository."""
        pass

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
        logger.warning("Rolling back transaction")
        self._session.rollback()
