import logging

from core.auth import BearerTokenHandler
from core.context import Permission as Scopes
from core.dependencies import (
    CommunityServiceDependency,
    TeamServiceDependency,
    UserServiceDependency,
)
from fastapi import APIRouter, Depends, HTTPException, status
from models import role as models
from routers._responses import with_default_responses

logger = logging.getLogger()

router = APIRouter(prefix="/roles")

# TODO: this entire modules requires a service (e.g. PermissionService) and proper Python
SCOPES = {
    models.Role.admin: [models.Level.implementing_partner],
    models.Role.coach: [models.Level.community, models.Level.team],
}


@router.get(
    "",
    tags=["roles"],
    response_model=list[str] | None,
    status_code=status.HTTP_200_OK,
    summary="List available user roles",
    responses=with_default_responses(),
)
async def list_roles(
    current_user: BearerTokenHandler = Depends(
        BearerTokenHandler(required_scopes=[Scopes.roles_read])
    ),
):
    """
    List the roles that can be assigned to a user.
    """
    return [e.value for e in models.Role]


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
    current_user: BearerTokenHandler = Depends(
        BearerTokenHandler(required_scopes=[Scopes.roles_read])
    ),
):
    """
    List the levels at which a role can be assigned. The available roles
    can be found at `/roles`.

    """
    return SCOPES.get(role)


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
    user_service: UserServiceDependency,
    community_service: CommunityServiceDependency,
    team_service: TeamServiceDependency,
    current_user: BearerTokenHandler = Depends(
        BearerTokenHandler(required_scopes=[Scopes.users_read])
    ),
):
    """
    List the available resources for a given scoped role, i.e. all resources
    on which a user would be able to assign the passed role.

    Example


    **Required scopes**
    - `communities:read`
    - `teams:read`

    """
    if level not in SCOPES.get(role):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role and level combination not supported.",
        )
    if level == models.Level.implementing_partner:
        return [models.RoleResourcesGetOut(resource_id=1, resource_name="Litle Lions")]
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
