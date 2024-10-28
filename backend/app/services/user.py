import logging
import uuid

from core import exceptions
from core.email import EmailService
from core.settings import get_settings
from database.auth0 import Auth0Repository
from database.session import SessionDependency
from models.api import generic, user
from pydantic.networks import EmailStr
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
        return self.resend_invite(obj.email)

    def reset_password(self, user_id: str = None, email: EmailStr = None) -> None:
        """Send a password reset link to a user.

        Args:
            user_id: str: Auth0 user ID without the 'Auth0|' prefix.

        """
        if (user_id is None and email is None) or (
            user_id is not None and email is not None
        ):
            raise exceptions.BadRequestError(
                "Either user ID or email should be provided."
            )

        user = (
            self.get_user_by_email(email=email)
            if email
            else self.auth0.get_user(user_id=self._add_auth0_id_prefix(user_id))
        )
        email = user["email"]

        link = self.auth0.get_password_change_ticket(email=email)
        self.email_service.send_reset_password_link(email=email, link=link)
        msg = f"Succesfully sent password reset link to {email}"
        logger.info(msg)
        return generic.Message(detail=msg)

    def resend_invite(self, user_id: str = None, email: EmailStr = None) -> None:
        """Send a password reset link to a user.

        Args:
            user_id: str: Auth0 user ID without the 'Auth0|' prefix.
            email str: user email address.

        """
        if (user_id is None and email is None) or (
            user_id is not None and email is not None
        ):
            raise exceptions.BadRequestError(
                "Either user ID or email should be provided."
            )

        user = (
            self.get_user_by_email(email=email)
            if email
            else self.auth0.get_user(user_id=self._add_auth0_id_prefix(user_id))
        )
        email = user["email"]

        link = self.auth0.get_password_change_ticket(email=email)
        self.email_service.send_invite_link(email=email, link=link)
        msg = f"Succesfully sent invite link to {email}"
        logger.info(msg)
        return generic.Message(detail=msg)

    def get_all(self) -> list[user.UserGetOut] | None:
        """Get all users from the table."""
        users = self.auth0.list_users()["users"]
        return [user.UserGetOut(**u) for u in users]

    def get(self, user_id: str) -> user.UserGetOut:
        """Get a user from Auth0 by ID.
        In Auth0 user ID is of format Auth0|<user_id>.

        Args:
            user_id: Auth0 user ID without the prefix.
        """

        try:
            return self.auth0.get_user(user_id=self._add_auth0_id_prefix(user_id))
        except exceptions.ItemNotFoundException:
            msg = f"User with ID {user_id} not found."
            logger.error(msg)
            raise exceptions.UserNotFoundException(msg)

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
        auth0_user_id = self.get_by_email(email=email)["user_id"]
        # remove auth0 prefix
        return auth0_user_id.split("|")[1]

    def update(self) -> None:
        """Update a user."""
        pass

    def delete(self, user_id: str) -> None:
        """Delete a user by ID.

        Args:
            user_id: str: Auth0 user ID without the 'Auth0|' prefix.
        """
        auth0_user_id = self._add_auth0_id_prefix(user_id)
        try:
            self.auth0.delete_user(auth0_user_id)
        except exceptions.UserNotFoundError:
            msg = f"User with ID {user_id} not found."
            logger.error(msg)
            raise exceptions.UserNotFoundError(msg)

    def delete_by_email(self, email: EmailStr) -> None:
        """Delete a user by email."""
        user_id = self.get_id_by_email(email=email)
        try:
            self.delete(user_id=user_id)
        except exceptions.UserNotFoundError:
            msg = f"User with email {email} not found."
            logger.error(msg)
            raise exceptions.UserNotFoundError(msg)

    def _add_auth0_id_prefix(self, user_id: str) -> str:
        """Add the user ID prefix for the authorization server.
        That is, if the user ID does not have the Auth0 prefix ('auth0|'), add it.

        Args:
            user_id: User ID without the 'Auth0|' prefix.

        Returns:
            user_id: User ID with the 'Auth0|' prefix.

        """
        if not user_id.startswith("auth0"):
            return f"auth0|{user_id}"

    def _remove_auth0_id_prefix(self, user_id: str) -> str:
        """Remove the user ID prefix for the authorization server.
        If the user ID has the Auth0 prefix, remove it.

        Args:
            user_id: User ID with the 'Auth0|' prefix.

        Returns:
            user_id: User ID without the 'Auth0|' prefix.

        """
        if user_id.startswith("auth0"):
            return user_id.split("|")[1]
