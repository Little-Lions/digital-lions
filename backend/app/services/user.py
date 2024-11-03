import logging
import uuid

from core import exceptions
from core.email import EmailService
from core.settings import get_settings
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
        self.auth0 = Auth0Repository(settings=self.settings)
        self.email_service = EmailService(settings=self.settings)

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
            created_user = self.auth0.create_user(
                {
                    "email": obj.email,
                    "connection": self.AUTH0_USER_CONNECTION,
                    "password": str(tmp_password),
                    "verify_email": False,
                }
            )
            user_id = created_user["user_id"]
            logger.info(f"User with email {obj.email} created. ID {user_id}")
        except exceptions.ItemAlreadyExistsException:
            raise exceptions.UserEmailExistsError(
                f"User with email {obj.email} already exists."
            )
        msg = self._send_invite_by_email(obj.email)
        return user.UserPostOut(user_id=user_id, message=msg)

    def send_invite(self, user_id: str = None) -> generic.Message:
        """Send an invitation link to the user.

        Args:
            user_id: str: Auth0 user ID with the 'Auth0|' prefix.
        """
        user = self.get(user_id=user_id)
        email = user["email"]

        return self._send_invite_by_email(email)

    def _send_invite_by_email(self, email: str) -> generic.Message:
        """Send an invitation link to user. This method assumes the user exists."""
        link = self.auth0.get_password_change_ticket(email=email)
        self.email_service.send_invite_link(email=email, link=link)
        msg = f"Succesfully sent invite link to {email}"
        logger.info(msg)
        return msg

    def get_all(self) -> list[user.UserGetOut] | None:
        """Get all users from the table."""
        users = self.auth0.list_users()["users"]
        return [user.UserGetOut(**u) for u in users]

    def get(self, user_id: str = None) -> user.UserGetOut | None:
        """Get a user from Auth0 by ID.

        In Auth0 user ID is of format Auth0|<user_id>.

        Args:
            user_id: Auth0 user ID including Auth0 prefix.
        """
        try:
            return self.auth0.get_user(user_id=user_id)
        except exceptions.UserNotFoundError:
            msg = f"User with ID {user_id} not found."
            logger.error(msg)
            raise exceptions.UserNotFoundError(msg)

    def get_by_email(self, email: str) -> user.UserGetOut | None:
        """Get a user by email address."""
        try:
            return self.auth0.get_user_by_email(email=email)
        except exceptions.UserNotFoundError:
            msg = f"User with email {email} not found."
            logger.error(msg)
            raise exceptions.UserNotFoundException(msg)

    def get_id_by_email(self, email: str) -> str:
        """Get the user ID by email."""
        return self.get_by_email(email=email)["user_id"]

    def update(self, user_id: str):
        """Update a user by ID."""
        raise NotImplementedError()

    def delete(self, user_id: str) -> None:
        """Delete a user by ID.

        Args:
            user_id: str: user ID, including 'Auth0|' prefix.
        """
        try:
            # auth0-python sdk does not raise an exception if user is not found
            # so we ahve to check ourselves first whether the user exist
            self.get(user_id=user_id)
        except exceptions.UserNotFoundError:
            msg = f"User with ID {user_id} not found."
            logger.error(msg)
            raise exceptions.UserNotFoundError(msg)

        self.auth0.delete_user(user_id)
