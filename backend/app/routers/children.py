from typing import Annotated

from core import exceptions
from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from models import child as models
from models.generic import APIResponse
from services import ChildService

router = APIRouter(prefix="/children")


@router.get(
    "/{child_id}",
    summary="Get a child by id",
    response_model=APIResponse[models.ChildGetByIdOut],
    responses={
        status.HTTP_404_NOT_FOUND: {
            "model": APIResponse,
            "description": "Child not found",
        }
    },
)
async def get_child(
    child_id: int, child_service: Annotated[ChildService, Depends(ChildService)]
):
    """
    Get a child by ID.

    **Required scopes**
    - `children:read`

    """
    try:
        data = child_service.get(child_id)
        return APIResponse(data=data)
    except exceptions.ChildNotFoundError as exc:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content=APIResponse(message=exc.message, detail=exc.detail).model_dump(),
        )


@router.get(
    "",
    summary="Get children",
    response_model=APIResponse[list[models.ChildGetOut] | None],
    status_code=status.HTTP_200_OK,
)
async def get_children(
    child_service: Annotated[ChildService, Depends(ChildService)],
    community_id: int = None,
):
    """
    Get list of children, optionally filtered by community.

    **Required scopes**
    - `children:read`

    """
    if community_id:
        return JSONResponse(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            content=APIResponse(message="Not implemented").model_dump(),
        )
    data = child_service.get_all()
    return APIResponse(data=data)


@router.post(
    "",
    summary="Add a child",
    status_code=status.HTTP_201_CREATED,
    response_model=APIResponse,
)
async def add_child(
    child_service: Annotated[ChildService, Depends(ChildService)],
    child: models.ChildPostIn,
):
    """
    Add child to team.

    **Required scopes**
    - `children:write`

    """
    try:
        data = child_service.create(child)
        return APIResponse(data=data)
    except exceptions.ChildAlreadyExistsError as exc:
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content=APIResponse(message=exc.message, detail=exc.detail).model_dump(),
        )
    except exceptions.TeamNotFoundError as exc:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content=APIResponse(message=exc.message, detail=exc.detail).model_dump(),
        )


@router.patch(
    "/{child_id}",
    summary="Update a child",
    response_model=APIResponse[models.ChildGetByIdOut],
    status_code=status.HTTP_200_OK,
)
async def update_child(
    child_service: Annotated[ChildService, Depends(ChildService)],
    child_id: int,
    child: models.ChildPatchIn,
):
    """
    Update child info.

    **Required scopes**
    - `children:write`

    """
    try:
        data = child_service.update(object_id=child_id, obj=child)
        return APIResponse(data=data)
    except exceptions.ChildNotFoundError as exc:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content=APIResponse(message=exc.message, detail=exc.detail).model_dump(),
        )


@router.delete(
    "/{child_id}",
    summary="Delete a child",
    status_code=status.HTTP_200_OK,
    response_model=APIResponse,
)
async def delete_child(
    child_id: int,
    child_service: Annotated[ChildService, Depends(ChildService)],
    cascade: bool = False,
):
    """
    Delete a child by ID.

    **WARNING:** If cascade is set to True, also delete all related attendances.

    **Required scopes**
    - `children:write`

    """
    try:
        data = child_service.delete(object_id=child_id, cascade=cascade)
        return APIResponse(data=data)
    except exceptions.ChildHasAttendanceError as exc:
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content=APIResponse(message=exc.message, detail=exc.detail).model_dump(),
        )
    except exceptions.ChildNotFoundError as exc:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content=APIResponse(message=exc.message, detail=exc.detail).model_dump(),
        )
