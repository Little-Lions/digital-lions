import logging

from core import exceptions
from core.auth import APIKeyDependency, BearerTokenHandler, Scopes
from core.dependencies import UserServiceDependency
from fastapi import APIRouter, Depends, HTTPException, status
from models import user as models
from models.generic import Message
from routers._responses import with_default_responses

logger = logging.getLogger()

router = APIRouter(prefix="/users", dependencies=[APIKeyDependency])


@router.get(
    "",
    response_model=list[models.UserGetOut],
    status_code=status.HTTP_200_OK,
    summary="List all users",
    responses=with_default_responses(),
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
    responses=with_default_responses(
        {
            status.HTTP_404_NOT_FOUND: {
                "model": Message,
                "description": "User not found",
            }
        }
    ),
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
    responses=with_default_responses(
        {
            status.HTTP_404_NOT_FOUND: {
                "model": Message,
                "description": "User not found",
            },
            status.HTTP_409_CONFLICT: {
                "model": Message,
                "description": "User email already exists",
            },
        }
    ),
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
    responses=with_default_responses(
        {
            status.HTTP_404_NOT_FOUND: {
                "model": Message,
                "description": "User not found",
            }
        }
    ),
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
    responses=with_default_responses(
        {
            status.HTTP_404_NOT_FOUND: {
                "model": Message,
                "description": "User not found",
            }
        }
    ),
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
    except exceptions.UserNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete user",
    responses=with_default_responses(
        {
            status.HTTP_404_NOT_FOUND: {
                "model": Message,
                "description": "User not found",
            },
        }
    ),
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
    status_code=status.HTTP_201_CREATED,
    summary="Add scoped role to a user",
    responses=with_default_responses(
        {
            status.HTTP_404_NOT_FOUND: {
                "model": Message,
                "description": "User not found",
            },
            status.HTTP_409_CONFLICT: {
                "model": Message,
                "description": "Role with scope already exists",
            },
        }
    ),
)
async def add_role_to_user(
    user_id: str,
    role: models.RolePostIn,
    user_service: UserServiceDependency,
    current_user: BearerTokenHandler = Depends(
        BearerTokenHandler(required_scopes=[Scopes.users_write])
    ),
):
    """
    Digital Lions has the following hiearchicy between entities:
    **Implementing Partner > Community > Team**

    Each of the above is a `level`. The payload for adding a role then consists of
    the following fields:
    - `role`: The role name
    - `level`: The level at which the role is assigned. This translated to a resource in
      the hierarchical setup of the platform. I.e. `implementing_partner` (top-level),
        `community` (mid-level), `team` (bottom-level).
    - `resource_id`: The ID of the reousrce the role is assigned to.

    **Examples**
    - A user should be coach for team with id 1. In this case the payload should be
    `{"role": "coach", "level": "team", "resource_id": 1}`
    - A user should be coach for all teams in community that has id 2. In this case
      the payload should be
    `{ "role": "coach", "level": "community", "resource_id": 2}`.

    **Important**
    - Currently the only supported `resource_id` for `level=implementing_parter`
    is the default implenting partner (Little Lions, ID 1).

    **Required scopes**
    - `users:write`

    """
    try:
        return user_service.add_role(user_id=user_id, role=role)
    except exceptions.BadRequestError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    except (
        exceptions.ResourceNotFoundError,
        exceptions.UserNotFoundError,
    ) as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    except exceptions.RoleAlreadyExistsError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc))


@router.get(
    "/{user_id}/roles",
    response_model=list[models.RolePostIn] | None,
    status_code=status.HTTP_200_OK,
    summary="List all scoped roles of a user",
    responses=with_default_responses(
        {
            status.HTTP_404_NOT_FOUND: {
                "model": Message,
                "description": "User not found",
            }
        }
    ),
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
        return user_service.get_roles(user_id=user_id)
    except exceptions.UserNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.delete(
    "/{user_id}/roles",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove a scoped role from a user",
    responses=with_default_responses(
        {
            status.HTTP_404_NOT_FOUND: {
                "model": Message,
                "description": "User not found",
            },
            status.HTTP_404_NOT_FOUND: {
                "model": Message,
                "description": "Role not found for user",
            },
        }
    ),
)
async def remove_role_from_user(
    user_id: str,
    role: models.RolePostIn,
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
    except (exceptions.UserNotFoundError, exceptions.RoleNotFoundForUserError) as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
