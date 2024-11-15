from typing import Any

from core import exceptions
from core.auth import APIKeyDependency, BearerTokenHandler, Scopes
from core.dependencies import CommunityServiceDependency
from fastapi import APIRouter, Depends, HTTPException, status
from models import community as models
from models.generic import Message, RecordCreated

router = APIRouter(prefix="/communities", dependencies=[APIKeyDependency])


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
    service: CommunityServiceDependency,
    current_user: Any = Depends(
        BearerTokenHandler(required_scopes=[Scopes.communities_read])
    ),
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


@router.get(
    "",
    summary="List all communities",
    status_code=status.HTTP_200_OK,
    response_model=list[models.CommunityGetOut] | None,
)
async def get_communities(
    service: CommunityServiceDependency,
    current_user: Any = Depends(
        BearerTokenHandler(required_scopes=[Scopes.communities_read])
    ),
):
    """
    List all communities that a user has access to.

    **Required scopes**
    - `communities:read`

    """
    return service.get_all()


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
    service: CommunityServiceDependency,
    current_user: Any = Depends(
        BearerTokenHandler(required_scopes=[Scopes.communities_write])
    ),
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
    service: CommunityServiceDependency,
    current_user: Any = Depends(
        BearerTokenHandler(required_scopes=[Scopes.communities_write])
    ),
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


# TODO: add option to archive workshops and attendances
@router.delete(
    "/{community_id}",
    summary="Delete a community",
    status_code=status.HTTP_200_OK,
    response_model=Message,
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
    service: CommunityServiceDependency,
    cascade: bool = False,
    current_user: Any = Depends(
        BearerTokenHandler(required_scopes=[Scopes.communities_write])
    ),
):
    """
    Delete a community.

    **WARNING**: If cascade is set to true, will delete all teams,
    workshops, children, and attendances associated with the community.

    **Required scopes**
    - `communities:write`

    """
    try:
        return service.delete(community_id, cascade)
    except exceptions.CommunityNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    except exceptions.CommunityHasTeamsError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        )
