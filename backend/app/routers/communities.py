from typing import Annotated

from core import exceptions
from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from models import community as models
from models.community import VALID_IMPLEMENTING_PARTNER_ID
from models.generic import APIResponse
from services import CommunityService

from routers._responses import with_default_responses

router = APIRouter(prefix="/communities")


@router.get(
    "/{community_id}",
    response_model=APIResponse[models.CommunityGetByIdOut],
    status_code=status.HTTP_200_OK,
    summary="Get community",
    responses=with_default_responses(
        {
            status.HTTP_404_NOT_FOUND: {
                "model": APIResponse,
            }
        }
    ),
)
async def get_community(
    community_id: int,
    service: Annotated[CommunityService, Depends(CommunityService)],
):
    """
    Get a community by ID.

    **Required scopes**
     - `communities:read`

    """
    try:
        return APIResponse(data=service.get(community_id))
    except exceptions.CommunityNotFoundError as exc:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content=APIResponse(message=exc.message, detail=exc.detail).model_dump(),
        )
    except exceptions.InsufficientPermissionsError as exc:
        raise JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content=APIResponse(message=exc.message, detail=exc.detail).model_dump(),
        )


@router.get(
    "",
    summary="List all communities",
    status_code=status.HTTP_200_OK,
    response_model=APIResponse[list[models.CommunityGetOut]],
)
async def get_communities(
    service: Annotated[CommunityService, Depends(CommunityService)],
    implementing_partner_id: int | None = VALID_IMPLEMENTING_PARTNER_ID,
):
    """
    List all communities that a user has access to, optionally
    filtered by Implementing Partner.

    **Required scopes**
    - `communities:read`

    """
    try:
        return APIResponse(
            data=service.get_all(implementing_partner_id=implementing_partner_id)
        )
    except exceptions.InsufficientPermissionsError as exc:
        raise JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content=APIResponse(message=exc.message, detail=exc.detail).model_dump(),
        )


@router.post(
    "",
    summary="Add a community.",
    status_code=status.HTTP_201_CREATED,
    response_model=APIResponse,
    responses={
        status.HTTP_409_CONFLICT: {
            "model": APIResponse,
        }
    },
)
async def post_community(
    community: models.CommunityPostIn,
    service: Annotated[CommunityService, Depends(CommunityService)],
):
    """
    Add a community.

    **Requires scopes**
    - `communities:write`

    """
    try:
        data = service.create(community)
        return APIResponse(message="Community successfully created!", data=data)
    except exceptions.CommunityAlreadyExistsError as exc:
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content=APIResponse(message=exc.message, detail=exc.detail).model_dump(),
        )
    except exceptions.InsufficientPermissionsError as exc:
        raise JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content=APIResponse(message=exc.message, detail=exc.detail).model_dump(),
        )


@router.patch(
    "/{community_id}",
    summary="Update a community",
    response_model=APIResponse[models.CommunityGetByIdOut],
    status_code=status.HTTP_200_OK,
    responses={
        status.HTTP_404_NOT_FOUND: {
            "model": APIResponse,
            "description": "Community not found",
        }
    },
)
async def update_community(
    community_id: int,
    community: models.CommunityPatchIn,
    service: Annotated[CommunityService, Depends(CommunityService)],
):
    """
    Update a community.

    **Required scopes**
    - `communities:write`

    """
    try:
        data = service.update(community_id, community)
        return APIResponse(data=data)
    except exceptions.CommunityNotFoundError as exc:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content=APIResponse(message=exc.message, detail=exc.detail).model_dump(),
        )
    except exceptions.InsufficientPermissionsError as exc:
        raise JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content=APIResponse(message=exc.message, detail=exc.detail).model_dump(),
        )


# TODO: add option to archive workshops and attendances
@router.delete(
    "/{community_id}",
    summary="Delete a community",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={
        status.HTTP_404_NOT_FOUND: {
            "model": APIResponse,
            "description": "Community not found",
        },
        status.HTTP_409_CONFLICT: {
            "model": APIResponse,
            "description": "Community has teams and cascade is false.",
        },
    },
)
async def delete_community(
    community_id: int,
    service: Annotated[CommunityService, Depends(CommunityService)],
    cascade: bool = False,
):
    """
    Delete a community.

    **WARNING**: If cascade is set to true, will delete all teams,
    workshops, children, and attendances associated with the community.

    **Required scopes**
    - `communities:write`

    """
    try:
        service.delete(community_id, cascade)
    except exceptions.CommunityNotFoundError as exc:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content=APIResponse(detail=str(exc), message=exc.message).model_dump(),
        )
    except exceptions.CommunityHasTeamsError as exc:
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content=APIResponse(detail=str(exc), message=exc.message).model_dump(),
        )
    except exceptions.InsufficientPermissionsError as exc:
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content=APIResponse(detail=str(exc), message=exc.message).model_dump(),
        )
