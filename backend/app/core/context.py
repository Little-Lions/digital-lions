from typing import Annotated

from core.database.session import SessionDependency
from core.settings import Settings, get_settings
from fastapi import Depends
from repositories.database import RoleRepository


class CurrentUser:
    """Internal model to represent the current user.
    Contains user ID, permissions, roles,
    and methods to check permissions and roles."""

    subject_key = "sub"
    permissions_key = "permissions"

    def __init__(
        self,
        user_id: str,
        permissions: list[str],
        session: SessionDependency,
        settings: Annotated[Settings, Depends(get_settings)],
    ):
        """Initialize the user context with a decoded token."""
        self._user_id = user_id
        self._permissions = permissions
        self._role_repository = RoleRepository(session=session)
        self._roles = self._get_roles(user_id=user_id)

    @property
    def user_id(self):
        """Get the user ID."""
        return self._user_id

    @property
    def roles(self):
        """Get the roles assigned to the user."""
        return self._roles

    @property
    def permissions(self):
        """Get the permissions assigned to the user."""
        return self._permissions

    def has_permission(self, permission: str) -> bool:
        """Check if the user has a specific permission."""
        return permission in self._permissions

    def has_permission_on_resource(self, permission: str, resource_id: int) -> bool:
        """Check if the user has a specific permission on a resource."""
        raise NotImplementedError()

    def _get_roles(self, user_id: str) -> list[dict]:
        """Get the roles assigned to a user."""
        return self._role_repository.where([("user_id", self.user_id)])

    @classmethod
    def from_token(cls, token: dict, *args, **kwargs):
        """Create a current user object from a decoded JWT token."""
        return cls(
            user_id=token[cls.subject_key],
            permissions=token.get(cls.permissions_key, []),
            *args,
            **kwargs
        )
