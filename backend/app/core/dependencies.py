"""FastAPI dependencies to be injected into route handlers."""

from typing import Annotated

from core.database.session import SessionDependency
from fastapi import Depends
from services import ChildService, CommunityService, TeamService, UserService


def get_team_service(session: SessionDependency):
    return TeamService(session=session)


def get_community_service(session: SessionDependency):
    return CommunityService(session=session)


def get_child_service(session: SessionDependency):
    return ChildService(session=session)


def get_user_service(session: SessionDependency):
    return UserService(session=session)


ChildServiceDependency = Annotated[ChildService, Depends(get_child_service)]
CommunityServiceDependency = Annotated[CommunityService, Depends(get_community_service)]
TeamServiceDependency = Annotated[TeamService, Depends(get_team_service)]
UserServiceDependency = Annotated[UserService, Depends(get_user_service)]
