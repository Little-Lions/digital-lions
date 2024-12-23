"""Service provider to be injected into route handlers."""

from collections.abc import Callable
from typing import Annotated

from core.database.session import SessionDependency
from fastapi import Depends, Request
from services import ChildService, CommunityService, TeamService, UserService


class ServiceProvider:
    """Generic service provider for dependency injection
    on a route handler. Injects session and the current
    user, obtained from the BearerTokenHandler into the
    service.

    Returns an instantiated service object that provides
    access to all public service methods.
    """

    def __init__(self, service: Callable):
        """Instantiate the provider with the service
        to be injected."""
        self.service = service

    async def __call__(self, request: Request, session: SessionDependency):
        """Callable required for dependency injection."""
        return self.service(session=session)


ChildServiceDependency = Annotated[
    ChildService, Depends(ServiceProvider(service=ChildService))
]
CommunityServiceDependency = Annotated[
    CommunityService, Depends(ServiceProvider(service=CommunityService))
]
TeamServiceDependency = Annotated[
    TeamService, Depends(ServiceProvider(service=TeamService))
]
UserServiceDependency = Annotated[
    UserService, Depends(ServiceProvider(service=UserService))
]
