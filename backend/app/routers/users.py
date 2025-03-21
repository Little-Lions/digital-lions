import logging
from typing import Annotated

from core import exceptions
from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from models import user as models
from models.generic import APIResponse
from routers._responses import with_default_responses
from services import UserService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/users")


@router.get(
    "/me",
    response_model=APIResponse[models.UserCurrentGetOut],
    tags=["users"],
    status_code=status.HTTP_200_OK,
    summary="Get information about the current user",
)
async def me(
    user_service: Annotated[UserService, Depends(UserService)],
):
    """
    Get the current user.

    """
    data = user_service.me()
    return APIResponse(data=data)


@router.get(
    "",
    response_model=APIResponse[list[models.UserGetOut]],
    tags=["users"],
    status_code=status.HTTP_200_OK,
    summary="List all users",
    responses=with_default_responses(),
)
async def get_users(user_service: Annotated[UserService, Depends(UserService)]):
    """
    Get a list of all users.

    **Required scopes**
    - `users:read`

    """
    try:
        data = user_service.get_all()
        return APIResponse(data=data)
    except exceptions.InsufficientPermissionsError as exc:
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content=APIResponse(message=exc.message, detail=exc.detail).model_dump(),
        )


@router.get(
    "/{user_id}",
    tags=["users"],
    response_model=APIResponse[models.UserGetByIdOut],
    status_code=status.HTTP_200_OK,
    summary="Get user",
    responses=with_default_responses(
        {
            status.HTTP_404_NOT_FOUND: {
                "model": APIResponse,
                "description": "User not found",
            }
        }
    ),
)
async def get_user_by_id(
    user_id: str,
    user_service: Annotated[UserService, Depends(UserService)],
):
    """
    Get a user by ID.

    **Required scopes**
    - `users:read`

    """
    try:
        data = user_service.get(user_id=user_id)
        return APIResponse(data=data)
    except exceptions.UserNotFoundError as exc:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content=APIResponse(message=exc.message, detail=exc.detail).model_dump(),
        )
    except exceptions.InsufficientPermissionsError as exc:
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content=APIResponse(message=exc.message, detail=exc.detail).model_dump(),
        )


@router.post(
    "",
    tags=["users"],
    response_model=APIResponse[models.UserPostOut],
    status_code=status.HTTP_201_CREATED,
    summary="Invite new user",
    responses=with_default_responses(
        {
            status.HTTP_404_NOT_FOUND: {
                "model": APIResponse,
                "description": "User not found",
            },
            status.HTTP_409_CONFLICT: {
                "model": APIResponse,
                "description": "User email already exists",
            },
        }
    ),
)
async def create_user(
    user: models.UserPostIn,
    user_service: Annotated[UserService, Depends(UserService)],
):
    """
    Invite a new user to the platform. This will trigger creation
    of new user in the user database with a temporary password,
    and subsequently send a password reset link to the users email.

    **Required scopes**
    - `users:write`

    """
    try:
        data = user_service.create(user)
        return APIResponse(data=data)
    except exceptions.UserEmailExistsError as exc:
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content=APIResponse(message=exc.message, detail=exc.detail).model_dump(),
        )
    except exceptions.InsufficientPermissionsError as exc:
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content=APIResponse(message=exc.message, detail=exc.detail).model_dump(),
        )


@router.post(
    "/resend-invite",
    tags=["users"],
    response_model=APIResponse[APIResponse],
    status_code=status.HTTP_200_OK,
    summary="Resend invite link",
    responses=with_default_responses(
        {
            status.HTTP_404_NOT_FOUND: {
                "model": APIResponse,
                "description": "User not found",
            }
        }
    ),
)
async def resend_invite(
    user_service: Annotated[UserService, Depends(UserService)],
    user_id: str = None,
):
    """
    Resend an invite link for a new user. This will trigger a new invite email
    to be sent to the user.

    **Required scopes**
    - `users:write`

    """
    try:
        data = user_service.send_invite(user_id=user_id)
        return APIResponse(data=data)
    except exceptions.BadRequestError as exc:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content=APIResponse(message=exc.message, detail=exc.detail).model_dump(),
        )
    except exceptions.UserNotFoundError as exc:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content=APIResponse(message=exc.message, detail=exc.detail).model_dump(),
        )


@router.delete(
    "/{user_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete user",
    tags=["users"],
    responses=with_default_responses(
        {
            status.HTTP_404_NOT_FOUND: {
                "model": APIResponse,
                "description": "User not found",
            },
        }
    ),
)
async def delete_user(
    user_id: str,
    user_service: Annotated[UserService, Depends(UserService)],
):
    """
    Delete a user by ID.

    **Required scopes**
    - `users:write`

    """
    try:
        msg = user_service.delete(user_id=user_id)
        return APIResponse(message="User deleted successfully", detail=msg)
    except exceptions.UserNotFoundError as exc:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content=APIResponse(message=exc.message, detail=exc.detail).model_dump(),
        )


@router.post(
    "/{user_id}/roles",
    tags=["roles"],
    response_model=APIResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add scoped role to a user",
    responses=with_default_responses(
        {
            status.HTTP_404_NOT_FOUND: {
                "model": APIResponse,
                "description": "User not found",
            },
            status.HTTP_409_CONFLICT: {
                "model": APIResponse,
                "description": "Role with scope already exists",
            },
        }
    ),
)
async def add_role_to_user(
    user_id: str,
    role: models.UserRolePostIn,
    user_service: Annotated[UserService, Depends(UserService)],
):
    """
    Digital Lions has the following hiearchicy between entities:
    **Implementing Partner > Community > Team**

    Each of the above is a level. The payload for adding a role then consists of
    the following fields:
    - `role`: The role name
    - `level`: The level at which the role is assigned. This translated to a resource in
      the hierarchical setup of the platform. I.e. `Implementing Partner` (top-level),
        `Community` (mid-level), `Team` (bottom-level).
    - `resource_id`: The ID of the resource the role is assigned to.

    **Examples**
    - A user should be coach for team with id 1. In this case the payload should be
    `{"role": "coach", "level": "Team", "resource_id": 1}`
    - A user should be coach for all teams in community that has id 2. In this case
      the payload should be
    `{ "role": "coach", "level": "Community", "resource_id": 2}`.

    **Important**
    - Currently the only supported `resource_id` for `level` `Implementing Partner`
    is the default implenting partner (Little Lions, ID 1).

    **Required scopes**
    - `users:write`

    """
    try:
        data = user_service.add_role(user_id=user_id, role=role)
        return APIResponse(data=data)
    except exceptions.BadRequestError as exc:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content=APIResponse(message=exc.message, detail=exc.detail).model_dump(),
        )
    except (
        exceptions.ResourceNotFoundError,
        exceptions.UserNotFoundError,
    ) as exc:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content=APIResponse(message=exc.message, detail=exc.detail).model_dump(),
        )
    except exceptions.RoleAlreadyExistsError as exc:
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content=APIResponse(message=exc.message, detail=exc.detail).model_dump(),
        )
    except exceptions.InsufficientPermissionsError as exc:
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content=APIResponse(message=exc.message, detail=exc.detail).model_dump(),
        )


@router.get(
    "/{user_id}/roles",
    response_model=APIResponse[list[models.UserRoleGetOut] | None],
    status_code=status.HTTP_200_OK,
    tags=["roles"],
    summary="List all scoped roles of a user",
    responses=with_default_responses(
        {
            status.HTTP_404_NOT_FOUND: {
                "model": APIResponse,
                "description": "User not found",
            }
        }
    ),
)
async def get_roles_of_user(
    user_id: str,
    user_service: Annotated[UserService, Depends(UserService)],
):
    """
    List all scoped roles of an existing user.

    **Required scopes**
    - `users:read`

    """
    try:
        data = user_service.get_roles(user_id=user_id)
        return APIResponse(data=data)
    except exceptions.UserNotFoundError as exc:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content=APIResponse(message=exc.message, detail=exc.detail).model_dump(),
        )


@router.delete(
    "/{user_id}/roles/{role_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["roles"],
    summary="Remove a scoped role from a user",
    responses=with_default_responses(
        {
            status.HTTP_404_NOT_FOUND: {
                "model": APIResponse,
                "description": "User not found",
            },
            status.HTTP_404_NOT_FOUND: {
                "model": APIResponse,
                "description": "Role not found for user",
            },
        }
    ),
)
async def remove_role_from_user(
    user_id: str,
    role_id: int,
    user_service: Annotated[UserService, Depends(UserService)],
):
    """
    Remove a scoped role from an existing user. The `role_id` corresponds to the
    ID that was returned when the role was assigned to a user.

    **Required scopes**
    - `users:write`

    """
    try:
        user_service.delete_role(user_id=user_id, role_id=role_id)
        return APIResponse(message="Role deleted successfully")
    except (exceptions.UserNotFoundError, exceptions.RoleNotFoundForUserError) as exc:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content=APIResponse(message=exc.message, detail=exc.detail).model_dump(),
        )
    except exceptions.InsufficientPermissionsError as exc:
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content=APIResponse(message=exc.message, detail=exc.detail).model_dump(),
        )
