import functools
from collections.abc import Callable

from auth0.authentication import GetToken
from auth0.exceptions import Auth0Error
from auth0.management import Auth0
from core import exceptions
from fastapi import status


class Auth0Repository:
    """Repository for operations with the authorization server,
    which is Auth0 by Okta."""

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

    def _convert_auth0_error(func) -> Callable:
        """Auth0 error handler decorator to convert the generic Auth0 error
        to a more specific exception."""

        @functools.wraps(func)
        def wrapper_handle_error(*args, **kwargs):
            """Wrapper function to handle the Auth0 error."""
            try:
                return func(*args, **kwargs)
            except Auth0Error as exc:
                match exc.status_code:
                    case status.HTTP_409_CONFLICT:
                        raise exceptions.ItemAlreadyExistsException(str(exc))
                    case status.HTTP_404_NOT_FOUND:
                        raise exceptions.UserNotFoundError(str(exc))
                    case status.HTTP_403_FORBIDDEN:
                        raise exceptions.ForbiddenException(str(exc))
                    case _:
                        raise exc

        return wrapper_handle_error

    @_convert_auth0_error
    def delete_user(self, user_id: str):
        """
        Delete a user from the authorization server.
        """
        return self.auth0.users.delete(user_id)

    @_convert_auth0_error
    def get_user(self, user_id: str) -> dict:
        """
        Get a user from the authorization server.
        """
        return self.auth0.users.get(user_id)

    @_convert_auth0_error
    def list_users(self) -> list:
        """
        Get all users from the authorization server.
        """
        return self.auth0.users.list()

    @_convert_auth0_error
    def create_user(self, obj: dict):
        """
        Create a new user in the authorization server.
        """
        return self.auth0.users.create(obj)

    @_convert_auth0_error
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

    @_convert_auth0_error
    def get_user_by_email(self, email: str) -> dict:
        """
        Get the user ID by email.
        """
        users = self.auth0.users_by_email.search_users_by_email(email=email)
        if len(users) == 0:
            raise exceptions.UserNotFoundException(
                f"User with email {email} not found."
            )
        if len(users) > 1:
            # this should never happen
            raise ValueError(f"Multiple users with email {email} found.")
        return users[0]
