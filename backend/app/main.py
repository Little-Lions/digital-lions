import logging
import logging.config
import os
from contextlib import asynccontextmanager
from typing import Any

from core.database.session import init_db
from core.settings import get_settings
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from models.generic import APIResponse
from routers import (
    children,
    communities,
    health,
    implementing_partners,
    roles,
    teams,
    users,
    workshops,
)

logger = logging.getLogger(__name__)


def setup_logger(settings):
    logging_conf = "logging.conf"
    logging.config.fileConfig(logging_conf, disable_existing_loggers=False)
    logger = logging.getLogger(__name__)
    logger.info("Logging configuration: %s", logging_conf)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler for FastAPI."""
    settings = get_settings()
    setup_logger(settings)

    logger.info("Starting db client...")
    init_db()

    yield


app = FastAPI(
    title="Digital Lions API",
    version="0.1.0",
    root_path="/api/v1",
    lifespan=lifespan,
)


@app.exception_handler(Exception)
async def catch_any_exception(request: Request, exc) -> Any:
    """
    Catch all internal exceptions that are not explicitly raised
    and raise them as proper HTTPExceptions.
    """
    logger.error(exc)

    try:
        return JSONResponse(
            status_code=exc.status_code,
            content=APIResponse(message=exc.message, detail=str(exc)).model_dump(),
        )
    except AttributeError:
        # in case an unknown error occurs
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=APIResponse(
                message="Something went wrong!", detail=str(exc)
            ).model_dump(),
        )


app.add_middleware(
    CORSMiddleware,
    # TODO: allowed origins should come from settings
    # but settings is only available after instantiation of the API
    # while the middleware is added before, not sure how to fix this
    allow_origins=os.environ.get("ALLOWED_ORIGINS").split(","),
    allow_methods=["*"],
    allow_headers=["Content-Type", "Authorization"],
)
app.include_router(health.router, tags=["health"])
app.include_router(implementing_partners.router, tags=["implementing partners"])
app.include_router(communities.router, tags=["communities"])
app.include_router(teams.router, tags=["teams"])
app.include_router(workshops.router, tags=["workshops"])
app.include_router(children.router, tags=["children"])
app.include_router(users.router)
app.include_router(roles.router)
