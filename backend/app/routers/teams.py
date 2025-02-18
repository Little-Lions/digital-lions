import logging
from typing import Annotated

from core import exceptions
from fastapi import APIRouter, Depends
from fastapi import status as http_status
from fastapi.responses import JSONResponse
from models import team as models
from models.generic import APIResponse
from services import TeamService

from routers._responses import with_default_responses

logger = logging.getLogger()

router = APIRouter(prefix="/teams")


@router.post(
    "",
    response_model=APIResponse,
    status_code=http_status.HTTP_201_CREATED,
    summary="Create a new team",
    responses=with_default_responses(
        {
            http_status.HTTP_404_NOT_FOUND: {
                "model": APIResponse,
                "description": "Not found",
            },
            http_status.HTTP_409_CONFLICT: {
                "model": APIResponse,
                "description": "Conflict",
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
        data = team_service.create(team)
        return APIResponse(message="Team successfully created!", data=data)
    except exceptions.CommunityNotFoundError as exc:
        return JSONResponse(
            status_code=http_status.HTTP_404_NOT_FOUND,
            content=APIResponse(message=exc.message, detail=exc.detail).model_dump(),
        )
    except exceptions.TeamAlreadyExistsError as exc:
        return JSONResponse(
            status_code=http_status.HTTP_409_CONFLICT,
            content=APIResponse(message=exc.message, detail=exc.detail).model_dump(),
        )
    except exceptions.InsufficientPermissionsError as exc:
        return JSONResponse(
            status_code=http_status.HTTP_403_FORBIDDEN,
            content=APIResponse(message=exc.message, detail=exc.detail).model_dump(),
        )


@router.get(
    "",
    response_model=APIResponse[list[models.TeamGetOut]],
    status_code=http_status.HTTP_200_OK,
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
        data = team_service.get_all(community_id=community_id, status=status)
        return APIResponse(data=data)
    except exceptions.InsufficientPermissionsError as exc:
        return JSONResponse(
            status_code=http_status.HTTP_403_FORBIDDEN,
            content=APIResponse(message=exc.message, detail=exc.detail).model_dump(),
        )


@router.get(
    "/{team_id}",
    response_model=APIResponse[models.TeamGetByIdOut],
    status_code=http_status.HTTP_200_OK,
    summary="Get team by id",
    responses=with_default_responses(
        {
            http_status.HTTP_404_NOT_FOUND: {
                "model": APIResponse,
                "description": "Not found",
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
        data = team_service.get(object_id=team_id)
        return APIResponse(data=data)
    except exceptions.TeamNotFoundError as exc:
        return JSONResponse(
            status_code=http_status.HTTP_404_NOT_FOUND,
            content=APIResponse(message=exc.message, detail=exc.detail).model_dump(),
        )
    except exceptions.InsufficientPermissionsError as exc:
        return JSONResponse(
            status_code=http_status.HTTP_403_FORBIDDEN,
            content=APIResponse(message=exc.message, detail=exc.detail).model_dump(),
        )


@router.delete(
    "/{team_id}",
    status_code=http_status.HTTP_200_OK,
    summary="Delete a team",
    response_model=APIResponse,
    responses=with_default_responses(
        {
            http_status.HTTP_404_NOT_FOUND: {
                "model": APIResponse,
                "description": "Team not found",
            },
            http_status.HTTP_409_CONFLICT: {
                "model": APIResponse,
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
        msg = team_service.delete(object_id=team_id, cascade=cascade)
        return APIResponse(message="Team successfully deleted!", detail=msg)
    except exceptions.TeamHasChildrenError as exc:
        return JSONResponse(
            status_code=http_status.HTTP_409_CONFLICT,
            content=APIResponse(message=exc.message, detail=exc.detail).model_dump(),
        )
    except exceptions.TeamNotFoundError as exc:
        return JSONResponse(
            status_code=http_status.HTTP_404_NOT_FOUND,
            content=APIResponse(message=exc.message, detail=exc.detail).model_dump(),
        )
    except exceptions.InsufficientPermissionsError as exc:
        return JSONResponse(
            status_code=http_status.HTTP_403_FORBIDDEN,
            content=APIResponse(message=exc.message, detail=exc.detail).model_dump(),
        )
