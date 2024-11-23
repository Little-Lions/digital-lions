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
        return user_service.delete_role(user_id=user_id, role=role)
    except (exceptions.UserNotFoundError, exceptions.RoleNotFoundForUserError) as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
