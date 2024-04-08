from fastapi import APIRouter, Request, status
from fastapi.responses import JSONResponse
from fastapi import Depends
from sqlalchemy.orm import Session
from db import schemas
from db.session import get_db

router = APIRouter(prefix="/health")


@router.get(
    "",
    response_description="Health check",
    summary="Health check",
    status_code=200,
)
async def get_health(request: Request, db: Session = Depends(get_db)):
    try:
        # to check database we will execute raw query
        db.query(schemas.Attendance).first()
        return JSONResponse(status_code=status.HTTP_200_OK, content={"status": "ok"})
    except Exception as exc:
        output = str(exc)
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": "error", "message": output},
        )
