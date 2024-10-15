from datetime import UTC, datetime

from core.dependencies import CommunityServiceDependency
from fastapi import APIRouter, status
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/health")


@router.get(
    "",
    response_description="Health check",
    summary="Health check",
    status_code=200,
)
async def get_health(community_service: CommunityServiceDependency):
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
            output = "Database connection error"
        else:
            output = str(exc)
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": "error", "message": output},
        )
