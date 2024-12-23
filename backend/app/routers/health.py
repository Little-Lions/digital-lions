from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from services.community import CommunityService

router = APIRouter(prefix="/health")


@router.get(
    "",
    response_description="Health check",
    summary="Health check",
    status_code=200,
)
async def get_health(
    community_service: Annotated[CommunityService, Depends(CommunityService)]
):
    """Health endpoint to ping database."""
    try:
        # TODO use db.ping() to check for connection instead of relying on service
        community_service.get_all()
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"status": "ok", "datetime": str(datetime.now(UTC))},
        )
    except Exception as exc:
        if "psycopg2.OperationalError" in str(exc):
            error_msg = "Database connection error"
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                content={"status": "error", "message": error_msg},
            )
        # reraising will be catched by middleware and return a 500 as well
        raise exc
