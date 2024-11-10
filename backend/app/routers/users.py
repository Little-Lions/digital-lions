import logging

from core import exceptions
from core.auth import APIKeyDependency, BearerTokenHandler, Scopes
from core.dependencies import UserServiceDependency
from fastapi import APIRouter, Depends, HTTPException, status
from models import user as models
from models.generic import Message

logger = logging.getLogger()

router = APIRouter(prefix="/users", dependencies=[APIKeyDependency])


@router.get(
    "",
    response_model=list[models.UserGetOut],
    status_code=status.HTTP_200_OK,
    summary="List all users",
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
    summary="Get a user by ID",
    responses={
        status.HTTP_404_NOT_FOUND: {
            "model": Message,
            "description": "User not found",
        }
    },
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
    summary="Invite new user to platform",
    responses={
        status.HTTP_409_CONFLICT: {
            "model": Message,
            "description": "User email already exists",
        }
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
    Invite a new user to the platform.

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
    summary="Request password reset for user.",
    responses={
        status.HTTP_404_NOT_FOUND: {
            "model": Message,
            "description": "User not found",
        }
    },
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
    summary="Resend invite link for new user",
    responses={
        status.HTTP_404_NOT_FOUND: {
            "model": Message,
            "description": "User not found",
        }
    },
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
    summary="Delete a user by ID",
    responses={
        status.HTTP_404_NOT_FOUND: {
            "model": Message,
            "description": "User not found",
        }
    },
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
