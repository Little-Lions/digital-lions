import logging
from typing import Annotated

from core import exceptions
from fastapi import APIRouter, Depends, HTTPException, status
from models import team as models
from models.generic import Message, RecordCreated
from routers._responses import with_default_responses
from services import TeamService

logger = logging.getLogger()

router = APIRouter(prefix="/teams")


@router.post(
    "",
    response_model=RecordCreated,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new team",
    responses=with_default_responses(
        {
            status.HTTP_404_NOT_FOUND: {
                "model": Message,
                "description": "Community not found",
            },
            status.HTTP_409_CONFLICT: {
                "model": Message,
                "description": "Conflict: team name already exists",
            },
        }
    ),
)
async def post_team(
    team_service: Annotated[
        TeamService,
        Depends(TeamService),
    ],
    team: models.TeamPostIn,
):
    """
    Create a new team.

    **Required scopes**
    - `teams:write`

    """
    try:
        return team_service.create(team)
    except exceptions.CommunityNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    except exceptions.TeamAlreadyExistsError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc))
    except exceptions.InsufficientPermissionsError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc))


@router.get(
    "",
    response_model=list[models.TeamGetOut],
    status_code=status.HTTP_200_OK,
    summary="Get teams",
    responses=with_default_responses(),
)
async def get_teams(
    team_service: Annotated[TeamService, Depends(TeamService)],
    community_id: int = None,
    status: models.TeamStatus = models.TeamStatus.active,
):
    """
    Get list of teams that a user has access to.

    **Required scopes**
    - `teams:read`

    """
    try:
        return team_service.get_all(community_id=community_id, status=status)
    except exceptions.InsufficientPermissionsError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc))


@router.get(
    "/{team_id}",
    response_model=models.TeamGetByIdOut,
    status_code=status.HTTP_200_OK,
    summary="Get team by id",
    responses=with_default_responses(
        {
            status.HTTP_404_NOT_FOUND: {
                "model": Message,
                "description": "Team not found",
            },
        }
    ),
)
async def get_team(
    team_service: Annotated[TeamService, Depends(TeamService)],
    team_id: int,
):
    """
    Get a team by ID.

    **Required scopes**
    - `teams:read`

    """
    try:
        return team_service.get(object_id=team_id)
    except exceptions.TeamNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )
    except exceptions.InsufficientPermissionsError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc))


@router.delete(
    "/{team_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete a team",
    response_model=Message,
    responses=with_default_responses(
        {
            status.HTTP_404_NOT_FOUND: {
                "model": Message,
                "description": "Team not found",
            },
            status.HTTP_409_CONFLICT: {
                "model": Message,
                "description": "Conflict: team has children and cascade is False",
            },
        }
    ),
)
async def delete_team(
    team_service: Annotated[TeamService, Depends(TeamService)],
    team_id: int,
    cascade: bool = False,
):
    """
    Delete a team.

    **WARNING** This will delete all children if cascade is set to True.
    If you want to deactivate a team use PATCH /teams/{team_id} instead.

    **Required scopes**
    - `teams:write`

    """
    try:
        return team_service.delete(object_id=team_id, cascade=cascade)
    except exceptions.TeamHasChildrenError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        )
    except exceptions.TeamNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    except exceptions.InsufficientPermissionsError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc))
