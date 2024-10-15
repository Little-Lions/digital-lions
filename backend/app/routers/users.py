import logging

from core import exceptions
from core.auth import APIKeyDependency, BearerTokenDependency
from core.dependencies import UserServiceDependency
from fastapi import APIRouter, HTTPException, status
from models.api import user
from models.api.generic import RecordCreated

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


@router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a user by ID",
)
async def delete_user(user_id: str, user_service: UserServiceDependency):
    try:
        user_service.delete(user_id=user_id)
    except exceptions.UserNotFoundException as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.get(
    "/{user_id}",
    response_model=user.UserGetByIdOut,
    status_code=status.HTTP_200_OK,
    summary="Get a user by ID",
)
async def read_user(user_id: int, user_service: UserServiceDependency):
    try:
        return user_service.get(user_id=user_id)
    except exceptions.UserNotFoundException as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.patch(
    "/{user_id}",
    response_model=user.UserGetByIdOut,
    summary="Update a user by ID",
)
async def update_user(
    user_id: int,
    user: user.UserPatchIn,
    user_service: UserServiceDependency,
):
    try:
        return user_service.update(user_id=user_id, user=user)
    except exceptions.UserNotFoundException as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
