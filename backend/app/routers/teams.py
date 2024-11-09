import logging

from core import exceptions
from core.auth import APIKeyDependency, BearerTokenDependency
from core.dependencies import TeamServiceDependency
from fastapi import APIRouter, HTTPException, status
from models.generic import Message, RecordCreated
from models.team import (
    TeamGetByIdOut,
    TeamGetOut,
    TeamGetWorkshopByNumberOut,
    TeamGetWorkshopOut,
    TeamPostIn,
    TeamPostWorkshopIn,
    TeamStatus,
)

logger = logging.getLogger()

router = APIRouter(
    prefix="/teams", dependencies=[APIKeyDependency, BearerTokenDependency]
)


@router.post(
    "",
    response_model=RecordCreated,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new team",
    responses={
        400: {"model": Message, "description": "Bad request"},
        409: {
            "model": Message,
            "description": "Conflict: team with name already exists",
        },
    },
)
async def post_team(team_service: TeamServiceDependency, team: TeamPostIn):
    try:
        return team_service.create(team)
    except exceptions.CommunityNotFoundException as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    except exceptions.TeamAlreadyExistsException as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc))


@router.get(
    "",
    response_model=list[TeamGetOut],
    status_code=status.HTTP_200_OK,
    summary="Get teams",
)
async def get_teams(
    team_service: TeamServiceDependency,
    community_id: int = None,
    status: TeamStatus = TeamStatus.active,
):
    return team_service.get_all(community_id=community_id, status=status)


@router.get(
    "/{team_id}",
    response_model=TeamGetByIdOut,
    status_code=status.HTTP_200_OK,
    summary="Get team by id",
)
async def get_team(team_service: TeamServiceDependency, team_id: int):
    try:
        return team_service.get(object_id=team_id)
    except exceptions.TeamNotFoundException as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )


@router.delete(
    "/{team_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete a team",
    response_model=Message,
    responses={
        404: {"model": Message, "description": "Not found"},
        409: {
            "model": Message,
            "description": "Conflict: team has children and cascade is False",
        },
    },
)
async def delete_team(
    team_service: TeamServiceDependency, team_id: int, cascade: bool = False
):
    """Delete a team. This will delete all children if cascade is set to True.
    If you want to deactivate a team use PATCH /teams/{team_id} instead."""
    try:
        return team_service.delete(object_id=team_id, cascade=cascade)
    except exceptions.TeamHasChildrenException:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot delete team with ID {team_id} because it has related children record "
            + "and 'cascade' is set to False",
        )
    except exceptions.TeamNotFoundException as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.get(
    "/{team_id}/workshops",
    status_code=status.HTTP_200_OK,
    summary="Get workshops done by team",
    response_model=list[TeamGetWorkshopOut],
)
async def get_workshops(team_service: TeamServiceDependency, team_id: int):
    try:
        return team_service.get_workshops(team_id)
    except exceptions.TeamNotFoundException as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.get(
    "/{team_id}/workshops/{workshop_number}",
    status_code=status.HTTP_200_OK,
    summary="Get a team's workshop by number",
    response_model=TeamGetWorkshopByNumberOut,
    responses={
        404: {
            "model": Message,
        },
    },
)
async def get_workshop_by_number(
    team_service: TeamServiceDependency, team_id: int, workshop_number: int
):
    """Get one of the workshops completed by the team, by number
    of the workshop (i.e. number 1 to 12 for the default program)."""
    try:
        return team_service.get_workshop_by_number(team_id, workshop_number)
    except (
        exceptions.TeamNotFoundException,
        exceptions.WorkshopNotFoundException,
    ) as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.post(
    "/{team_id}/workshops",
    status_code=status.HTTP_201_CREATED,
    summary="Add workshop to team",
    response_model=RecordCreated,
    responses={
        400: {
            "model": Message,
        },
        409: {"model": Message},
        404: {
            "model": Message,
        },
    },
)
async def post_workshop(
    team_service: TeamServiceDependency, team_id: int, workshop: TeamPostWorkshopIn
):
    """Add a workshop to a team."""
    try:
        return team_service.create_workshop(team_id, workshop)
    except exceptions.TeamNotFoundException as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    except exceptions.WorkshopExistsException as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        )
    except (
        exceptions.WorkshopIncompleteAttendance,
        exceptions.ChildNotInTeam,
        exceptions.WorkshopNumberInvalidException,
    ) as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )
    except Exception as exc:
        logger.error("An error occurred: %s", str(exc))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        )
