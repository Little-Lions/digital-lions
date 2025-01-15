from typing import Annotated

from core import exceptions
from fastapi import APIRouter, Depends, HTTPException, status
from models import community as models
from models.community import VALID_IMPLEMENTING_PARTNER_ID
from models.generic import Message, RecordCreated
from services import CommunityService

router = APIRouter(prefix="/communities")


@router.get(
    "/{community_id}",
    response_model=models.CommunityGetByIdOut,
    status_code=status.HTTP_200_OK,
    summary="Get community",
    responses={
        status.HTTP_404_NOT_FOUND: {
            "model": Message,
            "description": "Community not found",
        }
    },
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
        return service.get(community_id)
    except exceptions.CommunityNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    except exceptions.InsufficientPermissionsError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc))


@router.get(
    "",
    summary="List all communities",
    status_code=status.HTTP_200_OK,
    response_model=list[models.CommunityGetOut] | None,
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
        return service.get_all(implementing_partner_id=implementing_partner_id)
    except exceptions.InsufficientPermissionsError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc))


@router.post(
    "",
    summary="Add a community.",
    status_code=status.HTTP_201_CREATED,
    response_model=RecordCreated,
    responses={
        status.HTTP_409_CONFLICT: {
            "model": Message,
            "description": "Community with name already exists.",
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
        return service.create(community)
    except exceptions.CommunityAlreadyExistsError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc))
    except exceptions.InsufficientPermissionsError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc))


@router.patch(
    "/{community_id}",
    summary="Update a community",
    response_model=models.CommunityGetByIdOut,
    status_code=status.HTTP_200_OK,
    responses={
        status.HTTP_404_NOT_FOUND: {
            "model": Message,
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
        return service.update(community_id, community)
    except exceptions.CommunityNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    except exceptions.InsufficientPermissionsError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc))


# TODO: add option to archive workshops and attendances
@router.delete(
    "/{community_id}",
    summary="Delete a community",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={
        status.HTTP_404_NOT_FOUND: {
            "model": Message,
            "description": "Community not found",
        },
        status.HTTP_409_CONFLICT: {
            "model": Message,
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
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    except exceptions.CommunityHasTeamsError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        )
    except exceptions.InsufficientPermissionsError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc))
