import logging
from enum import Enum
from typing import Annotated, Any

import jwt
import requests
from core.context import CurrentUser
from core.database.session import SessionDependency
from core.settings import Settings, get_settings
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

logger = logging.getLogger(__name__)


class Scopes(str, Enum):
    """OAuth scopes that can be assigned to roles."""

    children_read: str = "children:read"
    children_write: str = "children:write"
    communities_read: str = "communities:read"
    communities_write: str = "communities:write"
    teams_read: str = "teams:read"
    teams_write: str = "teams:write"
    users_read: str = "users:read"
    users_write: str = "users:write"
    roles_read: str = "roles:read"
    workshops_read: str = "workshops:read"
    workshops_write: str = "workshops:write"


class BearerTokenHandler(HTTPBearer):
    """FastAPI dependency for JWT token. Requirement of this token
    is enabled/disabled in the backend via environment variable `FEATURE_AUTH0`.

    Headers to be sent in the request:
    ```
    headers = {
        "Authorization": Bearer {JWT},
    }
    ```
    """

    CREDENTIAL_SCHEME = "Bearer"
    PUBLIC_KEY_URL = "https://{}/.well-known/jwks.json"
    ALGORITHM = "RS256"

    def __init__(
        self, auto_error: bool = True, required_scopes: list[str] | None = None
    ):
        """
        Instantiate Bearer Token validator.

        Args:
            auto_error bool: Raise HTTPException if token is invalid.
            required_scopes list[str]: List of scopes user
                should have to call the endpoint.

        """
        super().__init__(auto_error=auto_error)
        self.required_scopes = required_scopes

    async def __call__(
        self,
        request: Request,
        settings: Annotated[Settings, Depends(get_settings)],
        session: SessionDependency,
    ) -> Any:
        """Verify the bearer token and optionally the scopes,
        and return the decoded token."""
        self.settings = settings
        if not self.settings.FEATURE_AUTH0:
            return

        token, kid = await self._verify_request(request)
        verified_token = self._verify_token(token=token, kid=kid)

        # TODO: scope validation should be moved to the repository calls
        if not self._verify_required_scopes(verified_token["permissions"]):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User does not have required permission.",
            )

        return CurrentUser.from_token(
            verified_token, settings=self.settings, session=session
        )

    async def _verify_request(self, request: Request) -> [str, str]:
        """Verify the credentials and return the decoded token."""
        credentials: HTTPAuthorizationCredentials = await super().__call__(request)
        if credentials:
            if not credentials.scheme == self.CREDENTIAL_SCHEME:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid authentication scheme.",
                )

            token_headers = self._get_unverified_headers(credentials.credentials)
            if token_headers is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Bearer token is no valid JWT.",
                )
            kid = token_headers.get("kid")
            if kid is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid kid"
                )
            return credentials.credentials, kid

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization code.",
        )

    def _verify_token(self, token: str, kid: str) -> dict:
        """Verify access token."""
        pub_key = self._get_public_key(
            token=token,
            kid=kid,
            pub_key_url=self.PUBLIC_KEY_URL.format(self.settings.AUTH0_SERVER),
        )
        if pub_key is None:
            raise HTTPException(
                status_code=403, detail="Could not get public key for token"
            )

        jwt_token_decoded = self._verify_jwt(
            token=token,
            pub_key=pub_key,
            algorithm=self.ALGORITHM,
            audience=self.settings.AUTH0_AUDIENCE,
        )
        if not jwt_token_decoded:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token.",
            )

        return jwt_token_decoded

    def _verify_required_scopes(self, token_scopes: list[str]) -> bool:
        """
        Verify that token has the required scopes.

        Args:
            decoded_token dict: decoded token containing scopes.
        """
        if not self.required_scopes:
            return True
        return all(scope in token_scopes for scope in self.required_scopes)

    def _verify_jwt(
        self, token: str, pub_key: str, algorithm: str, audience: str
    ) -> Any | None:
        """Verify JWT token with public key and audience.
        Returns verified token content."""
        try:
            return jwt.decode(
                jwt=token,
                key=pub_key,
                algorithms=algorithm,
                audience=audience,
            )
        except (jwt.exceptions.DecodeError, jwt.exceptions.ExpiredSignatureError):
            return None

    def _get_unverified_headers(self, token: str) -> dict[str, str] | None:
        """Get unverified token headers containing type,
        algorithm and key identifier."""
        try:
            return jwt.get_unverified_header(token)
        except jwt.exceptions.DecodeError:
            return None

    def _get_public_key(self, token: str, kid: str, pub_key_url: str) -> str | None:
        """Get public key from Auth0 server with which token was signed."""
        pub_key = None
        response = requests.get(pub_key_url)
        keys = response.json()["keys"]
        for key in keys:
            if key["kid"] == kid:
                pub_key = jwt.algorithms.RSAAlgorithm.from_jwk(key)
                break
        return pub_key


BearerTokenDependency = Depends(BearerTokenHandler())
