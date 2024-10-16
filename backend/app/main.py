import logging
import logging.config
from contextlib import asynccontextmanager
from typing import Any

import yaml
from core.settings import get_settings
from database.session import init_db
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from routers import children, communities, health, teams, users

logging_conf = "logging.conf"
logging.config.fileConfig(logging_conf, disable_existing_loggers=False)  # type: ignore
logger = logging.getLogger(__name__)
logger.info("Logging configuration: %s", logging_conf)


def get_config(path: str) -> dict:
    """Get configuration from a yaml file."""
    with open(path) as file:
        return yaml.safe_load(file)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler for FastAPI."""

    logger.info("Starting db client...")
    init_db()

    yield


async def catch_any_exception(request: Request, call_next: Any) -> Any:
    """Catch any exception and return it as 500 with info.
    TODO: this should be removed in production and handled by a proper error handler."""
    try:
        return await call_next(request)
    except Exception as exc:
        logger.error(exc)
        return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


settings = get_settings()

app = FastAPI(
    title="Digital Lion's API", version="0.1.0", root_path="/api/v1", lifespan=lifespan
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_methods=settings.ALLOWED_METHODS,
    allow_headers=settings.ALLOWED_HEADERS,
)
app.include_router(health.router, tags=["health"])
app.include_router(teams.router, tags=["teams"])
app.include_router(children.router, tags=["children"])
app.include_router(communities.router, tags=["communities"])
app.include_router(users.router, tags=["users"])
