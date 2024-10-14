import logging

from core import exceptions
from core.settings import get_settings
from database import repositories
from database.auth0 import Auth0Repository
from database.session import SessionDependency
from models.api import user
from services.base import AbstractService, BaseService

logger = logging.getLogger()


class UserService(BaseService, AbstractService):
    """User service layer to do anything related to users."""

    AUTH0_USER_CONNECTION = "Username-Password-Authentication"

    def __init__(self, session: SessionDependency) -> None:
        """Instantiate all repositories.

        Args:
            session: database session.
        """
        self._session: SessionDependency = session
        self.settings = get_settings()
        self._attendances = repositories.AttendanceRepository(session=self._session)
        self._communities = repositories.CommunityRepository(session=self._session)
        self._children = repositories.ChildRepository(session=self._session)
        self._teams = repositories.TeamRepository(session=self._session)
        self._workshops = repositories.WorkshopRepository(session=self._session)
        # self.permissions = repositories.PermissionRepository(session=self._session)
        self.auth0 = Auth0Repository(settings=self.settings)

        self._cols = repositories.Columns

    def create(self, obj: user.UserPostIn):
        """Create a new user."""
        try:
            import uuid
            password = uuid.uuid4()
            user = self.auth0.create_user({"email": obj.email, "connection": self.AUTH0_USER_CONNECTION, "password": str(password)})
            logger.info(
                f"User with email {obj.email} created"
            )
        except exceptions.ItemAlreadyExistsException:
            raise exceptions.UserEmailExistsError(f"User with email {obj.email} already exists.")

    def get_all(self) -> list[user.UserGetOut] | None:
        """Get all users from the table."""
        users = self.auth0.list_users()["users"]
        return [user.UserGetOut(id=u["user_id"], email=u["email"]) for u in users]

    def get(self, user_id: str) -> user.UserGetOut:
        """Get a user from Auth0 by ID. 
        In Auth0 user ID is of format Auth0|<user_id>.

        Args:
            user_id: Auth0 user ID without the prefix.
        """
        try:
            return self.users.read(object_id=user_id)
        except exceptions.ItemNotFoundException:
            msg = f"User with ID {user_id} not found."
            logger.error(msg)
            raise exceptions.UserNotFoundException(msg)

    def get_user_by_email(self, email_address: str) -> user.UserGetOut | exceptions.UserNotFoundError:
        """Get a User from the table by email address."""
        user = self._get_user_by_email(email_address)
        if not user:
            msg = f"User with email {email_address} not found."
            logger.error(msg)
            raise exceptions.UserNotFoundException(msg)
        return user

    def update(self, user_id: int, user: user.UserUpdate) -> user.UserGetByIdOut:
        """Update a user."""

        self._validate_user_exists(user_id)

        # TODO do some validations
        user = self.users.update(object_id=user_id, obj=user)
        self.commit()
        return user

    def delete(self, user_id: str) -> None:
        """Delete a user by ID.

        Args:
            user_id: str: Auth0 user ID without the 'Auth0|' prefix.
        """
        try:
            self.auth0.get_user(user_id=user_id)
        except exceptions.ItemNotFoundException:
            error_msg = f"User with ID {user_id} not found."
            logger.error(error_msg)
            raise exceptions.UserNotFoundException(error_msg)

        self.auth0.delete_user(user_id)
        logger.info(f"User with ID {user_id} deleted.")


    def _validate_user_exists(self, user_id: int) -> user.UserGetOut:
        """Check if user exists in the database."""
        user = self.users.read(object_id=user_id)
        if not user:
            raise exceptions.ItemNotFoundException()
        return user

    def _get_user_by_email(self, email_address: str) -> user.UserGetOut | None:
        """Get a user by email address."""
        users = self.users.where([("email_address", email_address)])
        if users:
            return users[0]
        return None
