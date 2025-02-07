from typing import Annotated

from core import exceptions
from core.auth import BearerTokenHandler, CurrentUser
from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from models import implementing_partner as models
from models.generic import APIResponse
from repositories.database import ImplementingPartnerRepository

router = APIRouter(prefix="/implementing_partners")


@router.get(
    "",
    summary="List all implementing partners",
    status_code=status.HTTP_200_OK,
    response_model=APIResponse[list[models.ImplementingPartnerGetOut]],
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
    data = repository.read_all()
    return APIResponse(data=data)


@router.post(
    "",
    summary="Create a new implementing partner",
    status_code=status.HTTP_201_CREATED,
    response_model=APIResponse[models.ImplementingPartnerGetByIdOut],
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
    record = repository.create(implementing_partner)
    # temporary commit until we have refactored with service
    repository._session.commit()
    return APIResponse(message="Created implementing partner!", data=record)


@router.delete(
    "/{implementing_partner_id}",
    summary="Delete an implementing partner",
    status_code=status.HTTP_200_OK,
    response_model=APIResponse,
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
        return APIResponse(message="Successfully deleted implementing partner")
    except exceptions.NotFoundError as exc:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content=APIResponse(
                detail=str(exc), message="Implementing partner not found"
            ),
        )
