import logging
from typing import Any

from core import exceptions
from core.auth import (
    APIKeyDependency,
    BearerTokenDependency,
    BearerTokenHandler,
    Scopes,
)
from core.dependencies import CommunityServiceDependency
from fastapi import APIRouter, Depends, HTTPException, Request, status
from models.community import (
    CommunityGetByIdOut,
    CommunityGetOut,
    CommunityPatchIn,
    CommunityPostIn,
)
from models.generic import Message, RecordCreated

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/communities")


@router.get(
    "/{community_id}",
    response_model=CommunityGetByIdOut,
    status_code=status.HTTP_200_OK,
    summary="Get community by ID",
)
async def get_community(
    community_id: int,
    service: CommunityServiceDependency,
    token_dependency: Any = Depends(
        BearerTokenHandler(required_scopes=[Scopes.communities_read])
    ),
):
    """Get a community by ID."""
    try:
        return service.get(community_id)
    except exceptions.CommunityNotFoundException:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Community with ID {community_id} not found",
        )


@router.get(
    "",
    summary="List all communities",
    status_code=status.HTTP_200_OK,
    response_model=list[CommunityGetOut] | None,
)
async def get_communities(
    service: CommunityServiceDependency,
    token_dependency: Any = Depends(
        BearerTokenHandler(required_scopes=["communities:read"])
    ),
):
    return service.get_all()


@router.post(
    "",
    summary="Add a community",
    status_code=status.HTTP_201_CREATED,
    response_model=RecordCreated,
)
async def post_community(
    community: CommunityPostIn, service: CommunityServiceDependency
):
    """Add a community."""
    try:
        return service.create(community)
    except exceptions.CommunityAlreadyExistsException as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc))
    except Exception as e:
        logger.error(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error.",
        )


@router.patch(
    "/{community_id}",
    summary="Update a community",
    response_model=CommunityGetByIdOut,
    status_code=status.HTTP_200_OK,
)
async def update_community(
    community_id: int, community: CommunityPatchIn, service: CommunityServiceDependency
):
    """Update a community."""
    try:
        return service.update(community_id, community)
    except exceptions.CommunityNotFoundException:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Community with ID {community_id} not found.",
        )


@router.delete(
    "/{community_id}",
    summary="Delete a community",
    status_code=status.HTTP_200_OK,
    response_model=Message,
)
async def delete_community(
    service: CommunityServiceDependency, community_id: int, cascade: bool = False
):
    """Delete a community. WARNING: If cascade is set to true, will delete all teams,
    workshops, children, and attendances associated with the community."""
    try:
        return service.delete(community_id, cascade)
    except exceptions.CommunityNotFoundException as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    except exceptions.CommunityHasTeamsException as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        )
    except Exception as e:
        logger.error(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error.",
        )
