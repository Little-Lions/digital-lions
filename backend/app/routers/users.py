import logging
from enum import Enum

from core import exceptions
from core.auth import APIKeyDependency, BearerTokenHandler, Scopes
from core.dependencies import UserServiceDependency
from fastapi import APIRouter, Depends, HTTPException, status
from models import user as models
from models.generic import Message

logger = logging.getLogger()

router = APIRouter(prefix="/users", dependencies=[APIKeyDependency])


class Responses:
    """Shared endpoint responses."""

    UNAUTHORIZED: dict = {
        status.HTTP_401_UNAUTHORIZED: {
            "model": Message,
            "description": "Unauthorized",
        }
    }
    FORBIDDEN: dict = {
        status.HTTP_403_FORBIDDEN: {
            "model": Message,
            "description": "Insufficient permissions",
        }
    }
    USER_NOT_FOUND: dict = {
        status.HTTP_404_NOT_FOUND: {
            "model": Message,
            "description": "User not found",
        }
    }

    @classmethod
    def get(cls, *response_names):
        """Return a dictionary of responses based
        on given response names."""
        responses = {}
        for name in response_names:
            responses.update(getattr(cls, name))
        return responses


@router.get(
    "",
    response_model=list[models.UserGetOut],
    status_code=status.HTTP_200_OK,
    summary="List all users",
    responses=Responses.get("UNAUTHORIZED", "FORBIDDEN", "USER_NOT_FOUND"),
)
async def get_users(
    user_service: UserServiceDependency,
    current_user: BearerTokenHandler = Depends(
        BearerTokenHandler(required_scopes=[Scopes.users_read])
    ),
):
    """
    Get a list of all users.

    **Required scopes**
    - `users:read`

    """
    return user_service.get_all()


@router.get(
    "/{user_id}",
    response_model=models.UserGetByIdOut,
    status_code=status.HTTP_200_OK,
    summary="Get user",
    responses=Responses.get("UNAUTHORIZED", "FORBIDDEN", "USER_NOT_FOUND"),
)
async def get_user_by_id(
    user_id: str,
    user_service: UserServiceDependency,
    current_user: BearerTokenHandler = Depends(
        BearerTokenHandler(required_scopes=[Scopes.users_read])
    ),
):
    """
    Get a user by ID.

    **Required scopes**
    - `users:read`

    """
    try:
        return user_service.get(user_id=user_id)
    except exceptions.UserNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.post(
    "",
    response_model=models.UserPostOut,
    status_code=status.HTTP_201_CREATED,
    summary="Invite new user",
    responses={
        **Responses.get("UNAUTHORIZED", "FORBIDDEN", "USER_NOT_FOUND"),
        status.HTTP_409_CONFLICT: {
            "model": Message,
            "description": "User email already exists",
        },
    },
)
async def create_user(
    user: models.UserPostIn,
    user_service: UserServiceDependency,
    current_user: BearerTokenHandler = Depends(
        BearerTokenHandler(required_scopes=[Scopes.users_write])
    ),
):
    """
    Invite a new user to the platform. This will trigger creation
    of new user in the user database with a temporary password,
    and subsequently send a password reset link to the users email.

    **Required scopes**
    - `users:write`

    """
    try:
        return user_service.create(user)
    except exceptions.UserEmailExistsError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc))


@router.post(
    "/reset-password",
    response_model=Message,
    status_code=status.HTTP_200_OK,
    summary="Request password reset",
    responses=Responses.get("UNAUTHORIZED", "FORBIDDEN", "USER_NOT_FOUND"),
)
async def reset_password(
    user_service: UserServiceDependency,
    user_id: str,
    current_user: BearerTokenHandler = Depends(
        BearerTokenHandler(required_scopes=[Scopes.users_write])
    ),
):
    """
    Request a password reset for a user. This will trigger a
    password reset flow, i.e. a user will receive a link to reset their password.

    **Note:** This endpoint is only used from within the platform, and is
    not part of the general "Forgot Password" flow.

    **Required scopes**
    - `users:write`

    """
    try:
        return user_service.reset_password(user_id=user_id)
    except exceptions.BadRequestError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    except exceptions.UserNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.post(
    "/resend-invite",
    response_model=Message,
    status_code=status.HTTP_200_OK,
    summary="Resend invite link",
    responses=Responses.get("UNAUTHORIZED", "FORBIDDEN", "USER_NOT_FOUND"),
)
async def resend_invite(
    user_service: UserServiceDependency,
    user_id: str = None,
    current_user: BearerTokenHandler = Depends(
        BearerTokenHandler(required_scopes=[Scopes.users_write])
    ),
):
    """
    Resend an invite link for a new user. This will trigger a new invite email
    to be sent to the user.

    **Required scopes**
    - `users:write`

    """
    try:
        return user_service.resend_invite(user_id=user_id)
    except exceptions.BadRequestError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    except exceptions.UserNotFoundException as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete user",
    responses=Responses.get("UNAUTHORIZED", "FORBIDDEN", "USER_NOT_FOUND"),
)
async def delete_user(
    user_id: str,
    user_service: UserServiceDependency,
    current_user: BearerTokenHandler = Depends(
        BearerTokenHandler(required_scopes=[Scopes.users_write])
    ),
):
    """
    Delete a user by ID.

    **Required scopes**
    - `users:write`

    """
    try:
        user_service.delete(user_id=user_id)
    except exceptions.UserNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.post(
    "/{user_id}/roles",
    response_model=Message,
    status_code=status.HTTP_200_OK,
    summary="Add scoped role to a user",
    responses=Responses.get("UNAUTHORIZED", "FORBIDDEN", "USER_NOT_FOUND"),
)
async def add_role_to_user(
    user_id: str,
    role: models.Role,
    user_service: UserServiceDependency,
    current_user: BearerTokenHandler = Depends(
        BearerTokenHandler(required_scopes=[Scopes.users_write])
    ),
):
    """
    Add a scoped role to an existing user.

    **Required scopes**
    - `users:write`

    """
    try:
        return user_service.add_role(user_id=user_id, role=role)
    except exceptions.UserNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.get(
    "/{user_id}/roles",
    response_model=list[models.Role],
    status_code=status.HTTP_200_OK,
    summary="List all scoped roles of a user",
    responses=Responses.get("UNAUTHORIZED", "FORBIDDEN", "USER_NOT_FOUND"),
)
async def get_roles_of_user(
    user_id: str,
    user_service: UserServiceDependency,
    current_user: BearerTokenHandler = Depends(
        BearerTokenHandler(required_scopes=[Scopes.users_read])
    ),
):
    """
    List all scoped roles of an existing user.

    **Required scopes**
    - `users:read`

    """
    try:
        return user_service.list_roles(user_id=user_id)
    except exceptions.UserNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.delete(
    "/{user_id}/roles",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove a scoped role from a user",
    responses={
        **Responses.get("UNAUTHORIZED", "FORBIDDEN", "USER_NOT_FOUND"),
        status.HTTP_404_NOT_FOUND: {
            "model": Message,
            "description": "Role not found for user",
        },
    },
)
async def remove_role_from_user(
    user_id: str,
    role: models.Role,
    user_service: UserServiceDependency,
    current_user: BearerTokenHandler = Depends(
        BearerTokenHandler(required_scopes=[Scopes.users_write])
    ),
):
    """
    Remove a scoped role from an existing user.

    **Required scopes**
    - `users:write`

    """
    try:
        return user_service.remove_role(user_id=user_id, role=role)
    except (exceptions.UserNotFoundError, exceptions.RoleNotFoundForUser) as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
