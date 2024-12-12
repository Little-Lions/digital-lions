from typing import Annotated

from core import exceptions
from core.auth import Scopes
from core.dependencies import ServiceProvider
from fastapi import APIRouter, Depends, HTTPException, status
from models import child as models
from models.generic import Message, RecordCreated
from services import ChildService

router = APIRouter(prefix="/children")


@router.get(
    "/{child_id}",
    summary="Get a child by id",
    response_model=models.ChildGetByIdOut,
    responses={
        status.HTTP_404_NOT_FOUND: {
            "model": Message,
            "description": "Child not found",
        }
    },
)
async def get_child(
    child_id: int,
    child_service: Annotated[
        ChildService,
        Depends(
            ServiceProvider(
                service=ChildService, required_scopes=[Scopes.children_read]
            )
        ),
    ],
):
    """
    Get a child by ID.

    **Required scopes**
    - `children:read`

    """
    try:
        return child_service.get(child_id)
    except exceptions.ChildNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.get(
    "",
    summary="Get children",
    response_model=list[models.ChildGetOut] | None,
    status_code=status.HTTP_200_OK,
)
async def get_children(
    child_service: Annotated[
        ChildService,
        Depends(
            ServiceProvider(
                service=ChildService, required_scopes=[Scopes.children_read]
            )
        ),
    ],
    community_id: int = None,
):
    """
    Get list of children, optionally filtered by community.

    **Required scopes**
    - `children:read`

    """
    if community_id:
        raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED)
    return child_service.get_all()


@router.post(
    "",
    summary="Add a child",
    status_code=status.HTTP_201_CREATED,
    response_model=RecordCreated,
)
async def add_child(
    child_service: Annotated[
        ChildService,
        Depends(
            ServiceProvider(
                service=ChildService, required_scopes=[Scopes.children_write]
            )
        ),
    ],
    child: models.ChildPostIn,
):
    """
    Add child to team.

    **Required scopes**
    - `children:write`

    """
    try:
        return child_service.create(child)
    except exceptions.ChildAlreadyExistsError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc))
    except exceptions.TeamNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.patch(
    "/{child_id}",
    summary="Update a child",
    response_model=models.ChildGetByIdOut,
    status_code=status.HTTP_200_OK,
)
async def update_child(
    child_service: Annotated[
        ChildService,
        Depends(
            ServiceProvider(
                service=ChildService, required_scopes=[Scopes.children_write]
            )
        ),
    ],
    child_id: int,
    child: models.ChildPatchIn,
):
    """
    Update child info.

    **Required scopes**
    - `children:write`

    """
    try:
        return child_service.update(object_id=child_id, obj=child)
    except exceptions.ChildNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.delete(
    "/{child_id}",
    summary="Delete a child",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_child(
    child_id: int,
    child_service: Annotated[
        ChildService,
        Depends(
            ServiceProvider(
                service=ChildService, required_scopes=[Scopes.children_write]
            )
        ),
    ],
    cascade: bool = False,
):
    """
    Delete a child by ID.

    **WARNING:** If cascade is set to True, also delete all related attendances.

    **Required scopes**
    - `children:write`

    """
    try:
        child_service.delete(object_id=child_id, cascade=cascade)
    except exceptions.ChildHasAttendanceError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc))
    except exceptions.ChildNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )
