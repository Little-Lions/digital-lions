import functools
from collections.abc import Callable

from auth0.authentication import GetToken
from auth0.exceptions import Auth0Error
from auth0.management import Auth0
from core import exceptions
from fastapi import status


class Auth0Repository:
    """
    Repository pattern implementation for Auth0 service integration.

    Provides a clean abstraction layer between domain logic and Auth0 service,
    handling user management, roles, and authentication operations.

    Required settings:
        OAUTH_DOMAIN: Auth0 domain
        OAUTH_CLIENT_ID: Client ID
        OAUTH_CLIENT_SECRET: Client secret
        OAUTH_CONNECTION_ID: Database connection ID
        OAUTH_PWD_TICKET_RESULT_URL: Password reset URL

    Note:
        Uses @convert_auth0_error to transform silent Auth0 exceptions into
        proper Python exceptions.
    """

    MGMT_API = "https://{}/api/v2/"

    def __init__(self, settings):
        self.settings = settings
        self.domain = self.settings.OAUTH_DOMAIN

        token = self._get_mgmt_token()
        self.auth0 = Auth0(domain=self.domain, token=token)

    def _get_mgmt_token(self) -> str:
        """
        Get the management token for the authorization server.
        """
        client_id = self.settings.OAUTH_CLIENT_ID
        client_secret = self.settings.OAUTH_CLIENT_SECRET
        get_token = GetToken(
            domain=self.domain, client_id=client_id, client_secret=client_secret
        )

        token = get_token.client_credentials(self.MGMT_API.format(self.domain))
        return token["access_token"]

    def convert_auth0_error(func) -> Callable:
        """Auth0 error handler decorator to convert the generic Auth0 error
        to a more specific exception."""

        @functools.wraps(func)
        def wrapper_handle_error(*args, **kwargs):
            """Wrapper function to handle the Auth0 error."""
            try:
                return func(*args, **kwargs)
            except Auth0Error as exc:
                match exc.status_code:
                    case status.HTTP_400_BAD_REQUEST:
                        raise exceptions.BadRequestError(str(exc))
                    case status.HTTP_403_FORBIDDEN:
                        raise exceptions.ForbiddenError(str(exc))
                    case status.HTTP_404_NOT_FOUND:
                        raise exceptions.UserNotFoundError(str(exc))
                    case status.HTTP_409_CONFLICT:
                        raise exceptions.ItemAlreadyExistsError(str(exc))
                    case _:
                        raise exc

        return wrapper_handle_error

    @convert_auth0_error
    def create_user(self, obj: dict):
        """
        Create a new user in the authorization server.
        """
        return self.auth0.users.create(obj)

    @convert_auth0_error
    def get_user(self, user_id: str) -> dict:
        """
        Get a user from the authorization server.

        Args:
            user_id str: The Auth0 user ID.

        Returns:
            dict: The user data.

        Raises:
            UserNotFoundError: If the user is not found.
        """
        return self.auth0.users.get(user_id)

    @convert_auth0_error
    def list_users(self) -> list:
        """
        Get all users from the authorization server.

        Args:
            None

        Returns:
            list: list of users in Auth0.

        """
        return self.auth0.users.list()

    @convert_auth0_error
    def delete_user(self, user_id: str):
        """
        Delete a user from the authorization server.
        """
        return self.auth0.users.delete(user_id)

    @convert_auth0_error
    def add_role(self, user_id: str, role_name: str) -> None:
        """
        Add a role to a user.

        Args:
            user_id str: The Auth0 user ID.
            role_name str: The name of the role.

        Returns:
            Empty string

        Raises:
            RoleNotFoundError: If the role is not found.
            ValueError: If multiple roles with the same name are found.

        """
        auth0_roles = self.auth0.roles.list(name_filter=role_name)
        if len(auth0_roles["roles"]) == 0:
            # this should never happen because we validate the role on the API level
            raise exceptions.RoleNotFoundError(f"Role {role_name} not found.")
        if len(auth0_roles["roles"]) > 1:
            # this should never happen
            raise ValueError(f"Multiple roles with name {role_name} found.")

        auth0_role = auth0_roles["roles"][0]
        return self.auth0.users.add_roles(id=user_id, roles=[auth0_role["id"]])

    @convert_auth0_error
    def get_roles(self, user_id: str) -> list:
        """
        Get all roles of a user.
        """
        return self.auth0.users.list_roles(user_id)["roles"]

    @convert_auth0_error
    def delete_role(self, user_id: str, role_name: str) -> None:
        """
        Delete a role from a user.
        Returns:
            Empty string
        """
        auth0_roles = self.auth0.roles.list(name_filter=role_name)
        if len(auth0_roles["roles"]) == 0:
            # this should never happen because we validate the role on the API level
            raise exceptions.RoleNotFoundError(f"Role {role_name} not found.")
        if len(auth0_roles["roles"]) > 1:
            # this should never happen
            raise ValueError(
                f"Multiple roles with name {role_name} found. This is a bug."
            )
        auth0_role = auth0_roles["roles"][0]
        return self.auth0.users.remove_roles(id=user_id, roles=[auth0_role["id"]])

    @convert_auth0_error
    def get_password_change_ticket(self, email: str) -> str:
        """
        Get a password change ticket for a user.
        """
        body = {
            "email": email,
            "connection_id": self.settings.OAUTH_CONNECTION_ID,
            "result_url": self.settings.OAUTH_PWD_TICKET_RESULT_URL,
        }
        return self.auth0.tickets.create_pswd_change(body=body)["ticket"]

    @convert_auth0_error
    def get_user_by_email(self, email: str) -> dict:
        """
        Get the user ID by email.

        Args:
            email str: The email of the user.

        Returns:
            dict: user object.

        Raises:
            UserNotFoundError: If the user is not found.
            ValueError: If multiple users with the same email are found.
        """
        users = self.auth0.users_by_email.search_users_by_email(email=email)
        if len(users) == 0:
            raise exceptions.UserNotFoundError(f"User with email {email} not found.")
        if len(users) > 1:
            # this should never happen
            raise ValueError(f"Multiple users with email {email} found.")
        return users[0]
