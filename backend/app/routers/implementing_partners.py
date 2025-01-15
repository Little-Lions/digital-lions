from typing import Annotated

from core import exceptions
from core.auth import BearerTokenHandler, CurrentUser
from fastapi import APIRouter, Depends, HTTPException, status
from models import implementing_partner as models
from repositories.database import ImplementingPartnerRepository

from app.models.generic import RecordCreated

router = APIRouter(prefix="/implementing_partners")


@router.get(
    "",
    summary="List all implementing partners",
    status_code=status.HTTP_200_OK,
    response_model=list[models.ImplementingPartnerGetOut] | None,
)
async def get_implementing_partners(
    current_user: Annotated[CurrentUser, Depends(BearerTokenHandler())],
    repository: Annotated[
        ImplementingPartnerRepository, Depends(ImplementingPartnerRepository)
    ],
):
    """
    List implementing partners.
    """
    try:
        return repository.read_all()
    except exceptions.InsufficientPermissionsError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc))


@router.post(
    "",
    summary="Create a new implementing partner",
    status_code=status.HTTP_201_CREATED,
    response_model=RecordCreated,
)
async def create_implementing_partner(
    implementing_partner: models.ImplementingPartnerPostIn,
    current_user: Annotated[CurrentUser, Depends(BearerTokenHandler())],
    repository: Annotated[
        ImplementingPartnerRepository, Depends(ImplementingPartnerRepository)
    ],
):
    """
    Create a new implementing partner.
    """
    try:
        record = repository.create(implementing_partner)
        # temporary commit until we have refactored with service
        repository._session.commit()
        return record
    except exceptions.InsufficientPermissionsError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc))


@router.delete(
    "/{implementing_partner_id}",
    summary="Delete an implementing partner",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_implementing_partner(
    implementing_partner_id: int,
    current_user: Annotated[CurrentUser, Depends(BearerTokenHandler())],
    repository: Annotated[
        ImplementingPartnerRepository, Depends(ImplementingPartnerRepository)
    ],
):
    """
    Delete an implementing partner.
    """
    try:
        repository.delete(implementing_partner_id)
        # temporary commit until we have refactored with service
        repository._session.commit()
    except exceptions.InsufficientPermissionsError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc))
    except exceptions.NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
