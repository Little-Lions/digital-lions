from typing import Annotated

from core import exceptions
from core.auth import BearerTokenHandler, CurrentUser
from fastapi import APIRouter, Depends, HTTPException, status
from models import implementing_partner as models
from repositories.database import ImplementingPartnerRepository

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
