from typing import Annotated

from core import exceptions
from core.auth import BearerTokenHandler, CurrentUser
from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from models import implementing_partner as models
from models.generic import APIResponse
from services.implementing_partner import ImplementingPartnerService

from app.models import implementing_partner

router = APIRouter(prefix="/implementing_partners")


@router.get(
    "",
    summary="List all implementing partners",
    status_code=status.HTTP_200_OK,
    response_model=APIResponse[list[models.ImplementingPartnerGetOut]],
)
async def get_implementing_partners(
    current_user: Annotated[CurrentUser, Depends(BearerTokenHandler())],
    service: Annotated[ImplementingPartnerService, Depends(ImplementingPartnerService)],
):
    """
    List implementing partners.
    """
    data = service.get_all()
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
    service: Annotated[ImplementingPartnerService, Depends(ImplementingPartnerService)],
):
    """
    Create a new implementing partner.
    """
    try:
        record = service.create(implementing_partner)
        return APIResponse(message=f"Created {record.name}", data=record)
    except exceptions.ImplementingPartnerAlreadyExistsError as exc:
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content=APIResponse(detail=exc.detail, message=exc.message).model_dump(),
        )


@router.delete(
    "/{implementing_partner_id}",
    summary="Delete an implementing partner",
    status_code=status.HTTP_200_OK,
    response_model=APIResponse,
)
async def delete_implementing_partner(
    implementing_partner_id: int,
    current_user: Annotated[CurrentUser, Depends(BearerTokenHandler())],
    service: Annotated[ImplementingPartnerService, Depends(ImplementingPartnerService)],
):
    """
    Delete an implementing partner.
    """
    try:
        return service.delete(implementing_partner_id)
    except exceptions.ImplementingPartnerNotFoundError as exc:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content=APIResponse(
                detail=str(exc), message="Implementing partner not found"
            ),
        )
