import logging
from typing import Annotated

from core import exceptions
from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from models import team as models
from models.generic import APIResponse, Message, RecordCreated
from routers._responses import with_default_responses
from services import TeamService

logger = logging.getLogger()

router = APIRouter(prefix="/teams")


@router.get(
    "/{team_id}/workshops",
    status_code=status.HTTP_200_OK,
    summary="Get workshops done by team",
    response_model=APIResponse[list[models.TeamGetWorkshopOut]],
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
        data = team_service.get_workshops(team_id)
        return APIResponse(data=data)
    except exceptions.TeamNotFoundError as exc:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content=APIResponse(message=exc.message, detail=exc.detail).model_dump(),
        )


@router.get(
    "/{team_id}/workshops/{workshop_number}",
    status_code=status.HTTP_200_OK,
    summary="Get a team's workshop by number",
    response_model=APIResponse[models.TeamGetWorkshopByNumberOut],
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
        data = team_service.get_workshop_by_number(team_id, workshop_number)
        return APIResponse(data=data)
    except (
        exceptions.TeamNotFoundError,
        exceptions.WorkshopNotFoundError,
    ) as exc:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content=APIResponse(message=exc.message, detail=exc.detail).model_dump(),
        )


@router.post(
    "/{team_id}/workshops",
    status_code=status.HTTP_201_CREATED,
    summary="Add workshop to team",
    response_model=APIResponse[RecordCreated],
    responses=with_default_responses(
        {
            status.HTTP_404_NOT_FOUND: {
                "model": APIResponse,
            },
            status.HTTP_409_CONFLICT: {
                "model": APIResponse,
            },
            status.HTTP_400_BAD_REQUEST: {
                "model": APIResponse,
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
        data = team_service.create_workshop(team_id, workshop)
        return APIResponse(data=data)
    except exceptions.TeamNotFoundError as exc:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content=APIResponse(message=exc.message, detail=exc.detail).model_dump(),
        )
    except exceptions.WorkshopExistsError as exc:
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content=APIResponse(message=exc.message, detail=exc.detail).model_dump(),
        )
    except (
        exceptions.ChildNotInTeam,
        exceptions.WorkshopIncompleteAttendance,
        exceptions.WorkshopNumberInvalidError,
    ) as exc:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content=APIResponse(message=exc.message, detail=exc.detail).model_dump(),
        )


@router.get(
    "/workshops/{workshop_id}",
    status_code=status.HTTP_200_OK,
    summary="Get workshop by ID",
    response_model=APIResponse[models.TeamGetWorkshopByNumberOut],
    responses=with_default_responses(
        {
            status.HTTP_404_NOT_FOUND: {
                "model": APIResponse,
            },
        }
    ),
)
def get_workshop_by_id(
    team_service: Annotated[TeamService, Depends(TeamService)], workshop_id: int
):
    """Get workshop by ID.

    ** Required scopes**
    - `workshops:read`

    """
    try:
        workshop = team_service.get_workshop_by_id(workshop_id)
        return APIResponse(data=workshop)
    except exceptions.WorkshopNotFoundError as exc:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content=APIResponse(message=exc.message, detail=exc.detail).model_dump(),
        )


@router.patch(
    "/workshops/{workshop_id}",
    status_code=status.HTTP_200_OK,
    summary="Update a workshop of a team",
    response_model=APIResponse,
    responses=with_default_responses(
        {
            status.HTTP_404_NOT_FOUND: {
                "model": APIResponse,
            },
        }
    ),
)
async def patch_workshop(
    team_service: Annotated[TeamService, Depends(TeamService)],
    workshop_id: int,
    workshop: models.TeamPatchWorkshopIn,
):
    """
    Update a workshop of a team. This can be either the date of the workshop
    or the attendance of the children. Payload should contain the attendance
    for all children.

    ** Required scopes**
    - `workshops:write`

    """
    try:
        team_service.update_workshop(workshop_id, workshop)
        return APIResponse(message="Successfull updated workshop!")
    except exceptions.WorkshopNotFoundError as exc:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content=APIResponse(message=exc.message, detail=exc.detail).model_dump(),
        )
