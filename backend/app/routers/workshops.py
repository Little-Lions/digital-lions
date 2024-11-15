import logging

from core import exceptions
from core.auth import APIKeyDependency, BearerTokenHandler, Scopes
from core.dependencies import TeamServiceDependency
from fastapi import APIRouter, Depends, HTTPException, status
from models import team as models
from models.generic import Message, RecordCreated
from routers._responses import with_default_responses

logger = logging.getLogger()

router = APIRouter(prefix="/teams", dependencies=[APIKeyDependency])


@router.get(
    "/{team_id}/workshops",
    status_code=status.HTTP_200_OK,
    summary="Get workshops done by team",
    response_model=list[models.TeamGetWorkshopOut],
    responses=with_default_responses(),
)
async def get_workshops(
    team_service: TeamServiceDependency,
    team_id: int,
    current_user: BearerTokenHandler = Depends(
        BearerTokenHandler(required_scopes=[Scopes.workshops_read])
    ),
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
    team_service: TeamServiceDependency,
    team_id: int,
    workshop_number: int,
    current_user: BearerTokenHandler = Depends(
        BearerTokenHandler(required_scopes=[Scopes.workshops_read])
    ),
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
    team_service: TeamServiceDependency,
    team_id: int,
    workshop: models.TeamPostWorkshopIn,
    current_user: BearerTokenHandler = Depends(
        BearerTokenHandler(required_scopes=[Scopes.workshops_write])
    ),
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
