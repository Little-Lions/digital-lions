import logging
from typing import Annotated

from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from models import role as models
from models.generic import APIResponse
from repositories.database import ImplementingPartnerRepository
from services import CommunityService, TeamService, UserService

from routers._responses import with_default_responses

logger = logging.getLogger()

router = APIRouter(prefix="/roles")


@router.get(
    "",
    tags=["roles"],
    response_model=APIResponse[list[str]],
    status_code=status.HTTP_200_OK,
    summary="List available user roles",
    responses=with_default_responses(),
)
async def list_roles(
    user_service: Annotated[UserService, Depends(UserService)],
):
    """
    List the roles that can be assigned to a user.
    """
    roles = user_service.get_platform_roles()
    return APIResponse(data=roles)


@router.get(
    "/levels",
    tags=["roles"],
    response_model=APIResponse[list[str]],
    status_code=status.HTTP_200_OK,
    summary="List levels at which a role can be assigned.",
    responses=with_default_responses(),
)
async def list_levels(
    role: models.Role,
    user_service: Annotated[UserService, Depends(UserService)],
):
    """
    List the levels at which a role can be assigned. The available roles
    can be found at `/roles`.

    """
    levels = user_service.get_role_levels(role)
    return APIResponse(data=levels)


@router.get(
    "/resources",
    tags=["roles"],
    response_model=APIResponse[list[models.RoleResourcesGetOut]],
    status_code=status.HTTP_200_OK,
    summary="List resources for role and level",
    responses=with_default_responses(),
)
async def list_resources(
    role: models.Role,
    level: models.Level,
    user_service: Annotated[UserService, Depends(UserService)],
    community_service: Annotated[CommunityService, Depends(CommunityService)],
    team_service: Annotated[TeamService, Depends(TeamService)],
    implementing_partner_repository: Annotated[
        ImplementingPartnerRepository, Depends(ImplementingPartnerRepository)
    ],
):
    """
    List the available resources for a given scoped role, i.e. all resources
    on which a user would be able to assign the passed role.

    Example


    **Required scopes**
    - `communities:read`
    - `teams:read`

    """
    if level not in user_service.get_role_levels(role=role):
        detail = "Role and level combination not supported."
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content=APIResponse(detail=detail).model_dump(),
        )
    if level == models.Level.implementing_partner:
        data = [
            models.RoleResourcesGetOut(resource_id=v.id, resource_name=v.name)
            for v in implementing_partner_repository.read_all()
        ]
    if level == models.Level.community:
        data = [
            models.RoleResourcesGetOut(resource_id=v.id, resource_name=v.name)
            for v in community_service.get_all()
        ]
    if level == models.Level.team:
        data = [
            models.RoleResourcesGetOut(resource_id=v.id, resource_name=v.name)
            for v in team_service.get_all()
        ]
    return APIResponse(data=data)
