import logging
from typing import Annotated

from core import exceptions
from fastapi import APIRouter, Depends, HTTPException, status
from models import role as models
from repositories.database import ImplementingPartnerRepository
from routers._responses import with_default_responses
from services import CommunityService, TeamService, UserService

logger = logging.getLogger()

router = APIRouter(prefix="/roles")


@router.get(
    "",
    tags=["roles"],
    response_model=list[str] | None,
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
    try:
        return user_service.get_platform_roles()
    except exceptions.InsufficientPermissionsError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc))


@router.get(
    "/levels",
    tags=["roles"],
    response_model=list[str] | None,
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
    try:
        return user_service.get_role_levels(role)
    except exceptions.InsufficientPermissionsError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc))


@router.get(
    "/resources",
    tags=["roles"],
    response_model=list[models.RoleResourcesGetOut] | None,
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
    try:
        if level not in user_service.get_role_levels(role=role):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Role and level combination not supported.",
            )
        if level == models.Level.implementing_partner:
            return [
                models.RoleResourcesGetOut(resource_id=v.id, resource_name=v.name)
                for v in implementing_partner_repository.read_all()
            ]
            return [
                models.RoleResourcesGetOut(resource_id=1, resource_name="Litle Lions")
            ]
        if level == models.Level.community:
            return [
                models.RoleResourcesGetOut(resource_id=v.id, resource_name=v.name)
                for v in community_service.get_all()
            ]
        if level == models.Level.team:
            return [
                models.RoleResourcesGetOut(resource_id=v.id, resource_name=v.name)
                for v in team_service.get_all()
            ]
    except exceptions.InsufficientPermissionsError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc))
