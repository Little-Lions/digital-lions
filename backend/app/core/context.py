from enum import Enum
from typing import Annotated

from core.database.schema import Community, Role, Team
from core.database.session import SessionDependency
from core.settings import Settings, get_settings
from fastapi import Depends
from repositories.database import RoleRepository


class Permission(str, Enum):
    """OAuth permissions that are assigned to roles."""

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


class RoleWithPermissions:
    """Parent class for roles with permissions."""

    def __init__(
        self, name: str, level: str, resource_id: int, permissions: list[Permission]
    ):
        self.name = name
        self.permissions = permissions
        self.level = level
        self.resource_id = resource_id

    def has_permission(self, permission: Permission) -> bool:
        """Check if the role includes a specific permission."""
        return permission in self.permissions


# TODO: ideally permissions should be obtained from OAuth
class CoachRole(RoleWithPermissions):
    """Role with permissions for a coach."""

    def __init__(self, *args, **kwargs):
        super().__init__(
            name="Coach",
            permissions=[
                Permission.children_read,
                Permission.teams_read,
                Permission.communities_read,
                Permission.workshops_read,
                Permission.workshops_write,
            ],
            *args,
            **kwargs,
        )


class AdminRole(Role):
    """Role with permissions for an admin."""

    def __init__(self, *args, **kwargs):
        super().__init__(
            name="Admin",
            permissions=[
                Permission.children_read,
                Permission.children_write,
                Permission.communities_read,
                Permission.communities_write,
                Permission.teams_read,
                Permission.teams_read,
                Permission.roles_read,
                Permission.users_read,
                Permission.users_write,
                Permission.workshops_read,
                Permission.workshops_write,
            ],
            *args,
            **kwargs,
        )


class RoleFactory:
    """Factory to create role objects based on the role name."""

    _role_map = {
        "Coach": CoachRole,
        "Admin": AdminRole,
    }

    @staticmethod
    def get_role_with_permissions(role: Role) -> RoleWithPermissions:
        """Create a role object based on the role name."""
        role_class = RoleFactory._role_map.get(role.role)
        if not role_class:
            raise ValueError(f"Unknown role: {role.role}")
        return role_class(level=role.level, resource_id=role.resource_id)


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
        self._roles: list[RoleWithPermissions] | None = (
            self._get_roles_with_permissions(user_id=user_id)
        )

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

    def has_permission_on_resource(
        self, permission: Permission, resource: Community | Team
    ):
        """Recursively check whether a user has permission
        on a certain resource."""

        if self._has_permission_on_resource(permission, resource):
            return True
        elif resource.parent is None:
            return False
        elif self.has_permission_on_resource(permission, resource.parent):
            return True
        return False

    def _has_permission_on_resource(
        self, permission: Permission, resource: Community | Team
    ) -> bool:
        """
        Check if any of the user's roles satisfy the permission requirements
        for the given resource.

        Args:
            permission (Permission): The permission to check for.
            resource (Community | Team): The resource to check the permission against.

        Returns:
            bool: True if the user has the required permission for the resource, False otherwise.
        """

        if resource is None:
            return False

        for role in self.roles:

            # check if any of the scoped roles' resource match the resoource
            if resource.resource_type == role.level and resource.id == role.resource_id:

                # check if the role has the required permission
                if role.has_permission(permission):
                    return True

        return False

    def _get_roles_with_permissions(self, user_id: str) -> list[dict]:
        """Get the roles assigned to a user."""
        records = self._role_repository.where([("user_id", self.user_id)])
        return [RoleFactory.get_role_with_permissions(record) for record in records]

    @classmethod
    def from_token(cls, token: dict, *args, **kwargs):
        """Create a current user object from a decoded JWT token."""
        return cls(
            user_id=token[cls.subject_key],
            permissions=token.get(cls.permissions_key, []),
            *args,
            **kwargs,
        )
