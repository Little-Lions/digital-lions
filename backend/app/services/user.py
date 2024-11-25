import logging
import uuid

from core import exceptions
from core.database.session import SessionDependency
from core.settings import get_settings
from models import generic
from models import user as models
from repositories.auth0 import Auth0Repository
from services._base import AbstractService, BaseService

logger = logging.getLogger(__name__)


class UserService(BaseService, AbstractService):
    """User service layer to do anything related to users."""

    AUTH0_USER_CONNECTION = "Username-Password-Authentication"

    def __init__(self, session: SessionDependency) -> None:
        """Instantiate UserService with Auth0Repository

        Args:
            session: database session.
        """
        self.settings = get_settings()
        self.auth0 = Auth0Repository(settings=self.settings)
        super().__init__(session=session)

    def create(self, obj: models.UserPostIn) -> str:
        """Invite new user to the system, by first creating,
        and then triggering a password reset.

        Args:
            obj: user.UserPostIn: User data to create, containing email.

        Returns:
            str: Auth0 user ID with the 'Auth0|' prefix.

        Raises:
            UserEmailExistsError: If user with email already exists.
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
        except exceptions.ItemAlreadyExistsError:
            raise exceptions.UserEmailExistsError(
                f"User with email {obj.email} already exists."
            )

        self.commit()
        msg = self._send_invite_by_email(obj.email)
        return models.UserPostOut(user_id=user_id, message=msg)

    def get_all(self) -> list[models.UserGetOut] | None:
        """Get all users from the table."""
        users = self.auth0.list_users()["users"]
        return [models.UserGetOut(**u) for u in users]

    def get(self, user_id: str = None) -> models.UserGetOut | None:
        """Get a user.

        In Auth0 user ID is of format Auth0 | <user_id > .

        Args:
            user_id: Auth0 user ID including Auth0 prefix.

        """
        try:
            user_obj = self.auth0.get_user(user_id=user_id)
        except exceptions.UserNotFoundError:
            msg = f"User with ID {user_id} not found."
            logger.error(msg)
            raise exceptions.UserNotFoundError(msg)

        return models.UserGetByIdOut(**user_obj)

    def update(self, user_id: str):
        """Update a user by ID."""
        raise NotImplementedError()

    def delete(self, user_id: str) -> generic.Message:
        """Delete a user by ID.

        Args:
            user_id: str: user ID, including 'Auth0|' prefix.

        Returns:
            generic.Message: info message in case successfull.

        Raises:
            UserNotFoundError: If user is not found.

        """
        try:
            # auth0-python sdk does not raise an exception if user is not found
            # so we have to check ourselves first whether the user exist
            self.get(user_id=user_id)
        except exceptions.UserNotFoundError:
            msg = f"User with ID {user_id} not found."
            logger.error(msg)
            raise exceptions.UserNotFoundError(msg)

        # delete user from auth0
        self.auth0.delete_user(user_id)

        # delete user roles from the database
        self._roles.delete_where(attr="user_id", value=user_id)
        self.commit()
        msg = f"User with ID {user_id} deleted."
        logger.info(msg)
        return generic.Message(detail=msg)

    def add_role(self, user_id: str, role: models.RolePostIn) -> generic.Message:
        """
        Add role to an existing user.

        Args:
            user_id: str: Auth0 user ID with the 'Auth0|' prefix.
            role: user.RolePostIn: Role to add to the user.

        Returns:
            generic.Message

        Raises:
            ResourceNotFoundError: If resource ID is not found.
            RoleAlreadyExistsError: If role already exists for user.
            UserNotFoundError: If user is not found.
        """
        user_in_db = self.get(user_id=user_id)
        if not user_in_db:
            raise exceptions.UserNotFoundError(f"User with ID {user_id} not found.")

        self._validate_role_resource_id(role)

        if not self._validate_user_has_auth0_roles(user_id=user_id, role=role):
            logger.info(
                f"User with ID {user_id} does not have role "
                f"'{role.role.value}' in Auth0, adding."
            )
            self.auth0.add_role(user_id=user_id, role_name=role.role.value)

        # check if role exists in auth0, if not create it
        role_in_db = {
            "user_id": user_id,
            "role": role.role,
            "level": role.level,
            "resource_id": role.resource_id,
        }
        if self._roles.where(filters=list(role_in_db.items())):
            msg = (
                f"Role '{role.role.value}' for {role.level.value} "
                f"{role.resource_id} already exists for user {user_id}"
            )
            logger.info(msg)
            raise exceptions.RoleAlreadyExistsError(msg)

        self._roles.create(role_in_db)
        msg = (
            f"Role '{role.role.value}' for {role.level.value} "
            f"{role.resource_id} added to user {user_id}"
        )
        logger.info(msg)
        self.commit()
        return generic.Message(detail=msg)

    def get_roles(self, user_id: str) -> list:
        """
        Get all scoped roles of a user.

        Args:
            user_id: str: Auth0 user ID with the 'Auth0|' prefix.
        """
        roles = self._roles.where(filters=[("user_id", user_id)])
        return [
            models.RolePostIn(role=r.role, level=r.level, resource_id=r.resource_id)
            for r in roles
        ]

    def delete_role(self, user_id: str, role: models.RolePostIn) -> generic.Message:
        """
        Delete a role from a user.

        Args:
            user_id: str: Auth0 user ID with the 'Auth0|' prefix.
            role: user.RolePostIn: Role to delete.

        Returns:
            generic.Message: info message in case successfull.

        Raises:
            UserNotFoundError: If user is not found.
            RoleNotFoundForUserError: If role does not exist for user.
        """
        user_in_db = self.get(user_id=user_id)
        if not user_in_db:
            raise exceptions.UserNotFoundError(f"User with ID {user_id} not found.")

        # check if user has roles assigned in db
        role_in_db = self._roles.where(filters=list(role.dict().items()))
        if not role_in_db:
            msg = (
                f"User with ID {user_id} does not have role '{role.role.value}' "
                f"assigned to {role.level.value} {role.resource_id}"
            )
            logger.error(msg)
            raise exceptions.RoleNotFoundForUserError(msg)
        if len(role_in_db) > 1:
            msg = (
                f"User with ID {user_id} has multiple roles '{role.role.value}' "
                f"assigned to resource {role.resource_id}. This is a bug."
            )
            logger.error(msg)
            raise exceptions.InternalServerError(msg)

        self._roles.delete(role_in_db[0].id)

        # if it is the last scoped role in the db we also need
        # to remove the role in Auth0
        if not self._roles.where(
            filters=[("user_id", user_id), ("role", role.role.value)]
        ):
            logger.info(
                f"User with ID {user_id} has no more roles in the database."
                f"Deleting role '{role.role.value}' from Auth0"
            )
            self.auth0.delete_role(user_id=user_id, role_name=role.role.value)

        self.commit()
        msg = (
            f"Role '{role.role.value}' for {role.level.value} "
            f"{role.resource_id} deleted from user {user_id}"
        )
        logger.info(msg)
        return generic.Message(detail=msg)

    def _get_auth0_roles(self, user_id: str) -> list | None:
        """Get all roles of a user in Auth0."""
        return self.auth0.get_roles(user_id=user_id)

    def _validate_user_has_auth0_roles(
        self, user_id: str, role: models.RolePostIn
    ) -> bool:
        """Check if user has a role in Auth0."""
        roles = self._get_auth0_roles(user_id=user_id)
        return any(r["name"] == role.role for r in roles)

    def _validate_role_resource_id(self, role: models.RolePostIn):
        """
        Validate the resource ID of the role. That is:
        - if the role is assigned on Implementing Partner level,
          the ID must be 1.
        - if the role is assigned on a community, the community ID must exist
        - if the role is assigned on a team, the team ID must exist

        Args:
            role: user.RolePostIn: Role to validate.

        Returns:
            bool: True if valid, False otherwise.

        Raises:
            BadRequestError: If role level is invalid.
            ResourceNotFoundError: If resource ID is not found.

        """
        if role.level == models.Level.implementing_partner:
            if not role.resource_id == 1:
                raise exceptions.BadRequestError(
                    "Resource ID must be 1 for role level Implementing Partner."
                )
            return
        elif role.level == models.Level.community:
            try:
                self._communities.read(role.resource_id)
                return
            except exceptions.ItemNotFoundError:
                raise exceptions.ResourceNotFoundError(
                    f"Community with ID {role.resource_id} not found."
                )
        elif role.level == models.Level.team:
            try:
                self._teams.read(role.resource_id)
                return
            except exceptions.ItemNotFoundError:
                raise exceptions.ResourceNotFoundError(
                    f"Team with ID {role.resource_id} not found."
                )
        raise exceptions.BadRequestError("Invalid role level.")

    def send_invite(self, user_id: str = None) -> generic.Message:
        """Send an invitation link to the user.

        Args:
            user_id: str: Auth0 user ID with the 'Auth0|' prefix.
        """
        user = self.get(user_id=user_id)
        return generic.Message(detail=self._send_invite_by_email(user.email))

    def _send_invite_by_email(self, email: str) -> generic.Message:
        """Send an invitation link to user. This method assumes the user exists."""
        link = self.auth0.get_password_change_ticket(email=email)
        self.email_service.send_invite_link(email=email, link=link)
        msg = f"Succesfully sent invite link to {email}"
        logger.info(msg)
        return msg

    def _get_roles(self, user_id: str) -> list[models.Role] | None:
        """
        Get all roles of a user in the db.

        Args:
            user_id: str: Auth0 user ID with the 'Auth0|' prefix.
        """
        return self._roles.where(filters=[("user_id", user_id)])
