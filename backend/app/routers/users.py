import logging

from core import exceptions
from core.auth import APIKeyDependency, BearerTokenDependency
from core.dependencies import UserServiceDependency
from fastapi import APIRouter, HTTPException, status
from models.api import user
from models.api.generic import Message, RecordCreated
from pydantic.networks import EmailStr

logger = logging.getLogger()

router = APIRouter(
    prefix="/users",
    dependencies=[APIKeyDependency, BearerTokenDependency],
)


@router.get(
    "",
    response_model=list[user.UserGetOut],
    status_code=status.HTTP_200_OK,
    summary="List all users",
)
async def get_users(user_service: UserServiceDependency):
    return user_service.get_all()


@router.get(
    "/{user_id}",
    response_model=user.UserGetByIdOut,
    status_code=status.HTTP_200_OK,
    summary="Get a user by ID",
)
async def get_user_by_id(user_id: str, user_service: UserServiceDependency):
    try:
        return user_service.get(user_id=user_id)
    except exceptions.UserNotFoundException as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.post(
    "",
    response_model=RecordCreated,
    status_code=status.HTTP_201_CREATED,
    summary="Invite new user to platform",
)
async def create_user(user: user.UserPostIn, user_service: UserServiceDependency):
    try:
        return user_service.create(user)
    except exceptions.UserEmailExistsError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc))


@router.post(
    "/reset-password",
    response_model=Message,
    status_code=status.HTTP_200_OK,
    summary="Request password reset for user.",
)
async def reset_password(user_service: UserServiceDependency, user_id: str):
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
)
async def resend_invite(user_service: UserServiceDependency, user_id: str = None):
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
)
async def delete_user(user_id: str, user_service: UserServiceDependency):
    try:
        user_service.delete(user_id=user_id)
    except exceptions.UserNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
