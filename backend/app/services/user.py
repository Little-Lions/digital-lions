import logging
import uuid

from core import exceptions
from core.settings import get_settings
from database import repositories
from database.auth0 import Auth0Repository
from database.session import SessionDependency
from models.api import generic, user
from services.base import AbstractService, BaseService

logger = logging.getLogger(__name__)


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

    def create(self, obj: user.UserPostIn) -> str:
        """Invite new user to the system, by first creating,
        and then triggering a password reset.

        Args:
            obj: user.UserPostIn: User data to create, containing email and roles.

        Returns:
            str: Auth0 user ID without the 'Auth0|' prefix.
        """
        try:
            tmp_password = uuid.uuid4()
            user = self.auth0.create_user(
                {
                    "email": obj.email,
                    "connection": self.AUTH0_USER_CONNECTION,
                    "password": str(tmp_password),
                    "verify_email": False,
                }
            )
            user_id = user["user_id"]
            logger.info(f"User with email {obj.email} created. ID {user_id}")
        except exceptions.ItemAlreadyExistsException:
            raise exceptions.UserEmailExistsError(
                f"User with email {obj.email} already exists."
            )

        self.send_password_reset_link(user_id=user_id)

        link = self.auth0.get_password_change_ticket(user_id=user_id)
        self.email_service.send_register_link(
            obj.email, self.settings.EMAIL_SENDER, link
        )

    def reset_password(self, user_id: str = None, email: EmailStr = None) -> None:
        """Send a password reset link to a user.

        Args:
            user_id: str: Auth0 user ID without the 'Auth0|' prefix.

        """
        if (user_id is None and email is None) or (
            user_id is not None and email is not None
        ):
            raise exceptions.BadRequest("Provide either user ID or user email.")

        link = self.auth0.get_password_change_ticket(user_id=user_id)
        self.email_service.send_reset_password_link(user_id, link)
        msg = f"Password reset ticket created for user with ID {user_id}."
        logger.info(msg)
        return generic.Message(msg)

    def get_all(self) -> list[user.UserGetOut] | None:
        """Get all users from the table."""
        users = self.auth0.list_users()["users"]
        return [user.UserGetOut(**u) for u in users]

    def _handle_id_prefix(self, user_id: str) -> str:
        """Handle the user ID prefix for the authorization server.
        That is, if the user ID does not have the Auth0 prefix ('auth0|'), add it.
        If the user ID has the Auth0 prefix, remove it.

        Args:
            user_id: User ID without the 'Auth0|' prefix.

        Returns:
            user_id: User ID with the 'Auth0|' prefix.
        """
        if user_id.startswith("auth0"):
            return user_id.split("|")[1]
        return f"auth0|{user_id}"

    def get(self, user_id: str) -> user.UserGetOut:
        """Get a user from Auth0 by ID.
        In Auth0 user ID is of format Auth0|<user_id>.

        Args:
            user_id: Auth0 user ID without the prefix.
        """

        try:
            return self.auth0.get_user(user_id=self._handle_id_prefix(user_id))
        except exceptions.ItemNotFoundException:
            msg = f"User with ID {user_id} not found."
            logger.error(msg)
            raise exceptions.UserNotFoundException(msg)

    def get_user_by_email(
        self, email_address: str
    ) -> user.UserGetOut | exceptions.UserNotFoundException:
        """Get a User from the table by email address."""
        user = self._get_user_by_email(email_address)
        if not user:
            msg = f"User with email {email_address} not found."
            logger.error(msg)
            raise exceptions.UserNotFoundException(msg)
        return user

    def update(self) -> None:
        """Update a user."""
        pass

    def delete(self, user_id: str) -> None:
        """Delete a user by ID.

        Args:
            user_id: str: Auth0 user ID without the 'Auth0|' prefix.
        """
        try:
            self.auth0.get_user(user_id=self._handle_id_prefix(user_id))
        except exceptions.ItemNotFoundException:
            error_msg = f"User with ID {user_id} not found."
            logger.error(error_msg)
            raise exceptions.UserNotFoundException(error_msg)

        self.auth0.delete_user(user_id)
        logger.info(f"User with ID {user_id} deleted.")

    def reset_password(self, email: str) -> None:
        """Reset the password for a user by email address.

        Args:
            email (str): Email address of the user.
        """
        try:
            self.auth0.get_user(user_id=self._handle_id_prefix(user_id))
        except exceptions.ItemNotFoundException:
            error_msg = f"User with ID {user_id} not found."
            logger.error(error_msg)
            raise exceptions.UserNotFoundException(error_msg)
        link = self.auth0.get_password_change_ticket()
        self.email_service.send_reset_password_link(email_address, link)

        msg = f"Password reset ticket created for user with ID {user_id}."
        logger.info(msg)
        # return Message(msg)

    def _validate_user_exists(self, user_id: int) -> user.UserGetOut:
        """Check if user exists in the database."""
        user = self.users.read(object_id=user_id)
        if not user:
            raise exceptions.ItemNotFoundException()
        return user

    def get_user_by_email(self, email: str) -> user.UserGetOut | None:
        """Get a user by email address."""

        user = self.auth0.get_user_by_email(email=email)

        users = self.users.where([("email_address", email_address)])
        if users:
            return users[0]
        return None
