from core import exceptions
from core.auth import APIKeyDependency, BearerTokenDependency
from core.dependencies import ChildServiceDependency
from fastapi import APIRouter, HTTPException, status
from models import child
from models.generic import RecordCreated

router = APIRouter(
    prefix="/children", dependencies=[APIKeyDependency, BearerTokenDependency]
)


@router.get(
    "/{child_id}", summary="Get a child by id", response_model=child.ChildGetByIdOut
)
async def get_child(child_id: int, child_service: ChildServiceDependency):
    try:
        return child_service.get(child_id)
    except exceptions.ChildNotFoundException as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.get(
    "",
    summary="Get children",
    response_model=list[child.ChildGetOut] | None,
    status_code=status.HTTP_200_OK,
)
async def get_children(
    child_service: ChildServiceDependency,
    community_id: int = None,
):
    """Get list of children, optionally filtered by community."""

    return child_service.get_all()


@router.post(
    "",
    summary="Add a child",
    status_code=status.HTTP_201_CREATED,
    response_model=RecordCreated,
)
async def add_child(child_service: ChildServiceDependency, child: child.ChildPostIn):
    try:
        return child_service.create(child)
    except exceptions.ChildAlreadyExistsException as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc))
    except exceptions.TeamNotFoundException as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.patch(
    "/{child_id}",
    summary="Update a child",
    response_model=child.ChildGetByIdOut,
    status_code=status.HTTP_200_OK,
)
async def update_child(
    child_service: ChildServiceDependency,
    child_id: int,
    child: child.ChildPatchIn,
):
    try:
        return child_service.update(object_id=child_id, obj=child)
    except exceptions.ChildNotFoundException as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.delete(
    "/{child_id}",
    summary="Delete a child",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_child(
    child_id: int, child_service: ChildServiceDependency, cascade: bool = False
):
    """Delete a child by ID. If cascade is set to True, also delete all
    related attendances."""
    try:
        child_service.delete(object_id=child_id, cascade=cascade)
    except exceptions.ChildHasAttendanceException as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc))
    except exceptions.ChildNotFoundException as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )
