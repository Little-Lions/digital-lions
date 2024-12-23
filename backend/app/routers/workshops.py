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


@router.get(
    "/{team_id}/workshops",
    status_code=status.HTTP_200_OK,
    summary="Get workshops done by team",
    response_model=list[models.TeamGetWorkshopOut],
    responses=with_default_responses(),
)
async def get_workshops(
    team_service: Annotated[TeamService, Depends(TeamService)],
    team_id: int,
):
    """
    Get all workshops completed by the team.

    **Required scopes**
    - `workshops:read`

    """
    try:
        return team_service.get_workshops(team_id)
    except exceptions.TeamNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    except exceptions.InsufficientPermissionsError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc))


@router.get(
    "/{team_id}/workshops/{workshop_number}",
    status_code=status.HTTP_200_OK,
    summary="Get a team's workshop by number",
    response_model=models.TeamGetWorkshopByNumberOut,
    responses=with_default_responses(
        {
            status.HTTP_404_NOT_FOUND: {
                "model": Message,
            },
        }
    ),
)
async def get_workshop_by_number(
    team_service: Annotated[TeamService, Depends(TeamService)],
    team_id: int,
    workshop_number: int,
):
    """
    Get one of the workshops completed by the team, by number
    of the workshop (i.e. number 1 to 12 for the default program).

    **Required scopes**
    - `workshops:read`

    """
    try:
        return team_service.get_workshop_by_number(team_id, workshop_number)
    except (
        exceptions.TeamNotFoundError,
        exceptions.WorkshopNotFoundError,
    ) as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    except exceptions.InsufficientPermissionsError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc))


@router.post(
    "/{team_id}/workshops",
    status_code=status.HTTP_201_CREATED,
    summary="Add workshop to team",
    response_model=RecordCreated,
    responses=with_default_responses(
        {
            400: {
                "model": Message,
            },
            409: {"model": Message},
            404: {
                "model": Message,
            },
        }
    ),
)
async def post_workshop(
    team_service: Annotated[TeamService, Depends(TeamService)],
    team_id: int,
    workshop: models.TeamPostWorkshopIn,
):
    """
    Add a workshop to a team.

    **Required scopes**
    - `workshops:write`

    """
    try:
        return team_service.create_workshop(team_id, workshop)
    except exceptions.TeamNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    except exceptions.WorkshopExistsError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        )
    except (
        exceptions.ChildNotInTeam,
        exceptions.WorkshopIncompleteAttendance,
        exceptions.WorkshopNumberInvalidError,
    ) as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )
    except exceptions.InsufficientPermissionsError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc))
