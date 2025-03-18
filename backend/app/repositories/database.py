"""Repositories for CRUD operations on the database.
Each table in the database translate to a repository class."""

from core.database import schema
from repositories._base import BaseRepository
from sqlalchemy import and_, func, or_, select


class AttendanceRepository(BaseRepository[schema.Attendance]):
    """Repository to interact with attendances table."""

    _model = schema.Attendance


class ChildRepository(BaseRepository[schema.Child]):
    """Repository to interact with children table."""

    _model = schema.Child


class CommunityRepository(BaseRepository[schema.Community]):
    """Repository to interact with Communities table."""

    _model = schema.Community

    def read_all_by_user_access(
        self, user_id: str, filters: list[tuple[str, str]]
    ) -> list:
        """Get all communities but only the ones a user has access to
        by scoped role. Optionally add a WHERE clause."""
        # TODO add link to README for explanation
        query = (
            select(self._model)
            .distinct(self._model.id)
            .join(
                schema.Role,
                # match both parent and child
                or_(
                    # match child paths (Role's path is parent of model's path)
                    schema.Role.resource_path.like(self._model.resource_path + "/%"),
                    schema.Role.resource_path == self._model.resource_path,
                    # match parent paths (Model's path is a descendant of Role's path)
                    self._model.resource_path.like(schema.Role.resource_path + "/%"),
                    self._model.resource_path == schema.Role.resource_path,
                ),
            )
            .where(schema.Role.user_id == user_id)
        )
        if filters:
            expr = and_(*self._construct_filter(filters))
            query = query.where(and_(expr))

        results = self._session.exec(query).all()

        # with a join the returned object are somehow
        # tuples, even if we only select one model.
        # so we need to get the first index value of each
        return [r[0] for r in results]


class ImplementingPartnerRepository(BaseRepository[schema.ImplementingPartner]):
    """Repository to interact with Implementing Partner tables."""

    _model = schema.ImplementingPartner

    def read_all_by_user_access(self, user_id: str) -> list:
        """Get all implementing partners but only the ones a user has access to
        by scoped role. Optionally add a WHERE clause."""
        query = (
            select(self._model)
            .distinct(self._model.id)
            .join(
                schema.Role,
                # match both parent and child
                or_(
                    # match child paths (Role's path is parent of model's path)
                    schema.Role.resource_path.like(self._model.resource_path + "/%"),
                    schema.Role.resource_path == self._model.resource_path,
                    # match parent paths (Model's path is a descendant of Role's path)
                    self._model.resource_path.like(schema.Role.resource_path + "/%"),
                    self._model.resource_path == schema.Role.resource_path,
                ),
            )
            .where(schema.Role.user_id == user_id)
        )
        results = self._session.exec(query).all()

        # with a join the returned object are somehow
        # tuples, even if we only select one model.
        # so we need to get the first index value of each
        return [r[0] for r in results]


class ProgramRepository(BaseRepository[schema.Program]):
    """Repository to interact with Program table."""

    _model = schema.Program


class RoleRepository(BaseRepository[schema.Role]):
    """Repository to interact with Roles table."""

    _model = schema.Role


class TeamRepository(BaseRepository[schema.Team]):
    """Repository to interact with Team table."""

    _model = schema.Team

    def read_all_by_user_access(
        self, user_id: str, filters: list[tuple[str, str]]
    ) -> list[schema.Team] | None:
        """Get all teams but only the ones a user has access to
        by scoped role."""
        query = (
            select(self._model)
            .distinct(self._model.id)
            .join(
                schema.Role,
                # match both parent and child
                or_(
                    # match child paths (Role's path is parent of model's path)
                    schema.Role.resource_path.like(self._model.resource_path + "/%"),
                    schema.Role.resource_path == self._model.resource_path,
                    # match parent paths (Model's path is a descendant of Role's path)
                    self._model.resource_path.like(schema.Role.resource_path + "/%"),
                    self._model.resource_path == schema.Role.resource_path,
                ),
            )
            .where(schema.Role.user_id == user_id)
        )

        if filters:
            expr = and_(*self._construct_filter(filters))
            query = query.where(and_(expr))

        # with a join the returned object are somehow
        # tuples, even if we only select one model.
        # so we need to get the first index value of each
        return [r[0] for r in self._session.exec(query).all()]


class WorkshopRepository(BaseRepository[schema.Workshop]):
    """Repository to interact with Workshop table."""

    _model = schema.Workshop

    # TODO ideally below method should pass 0 if a team has no workshop yet
    # also saves us ugly list comprehesions later
    def get_last_workshop_per_team(self, team_ids: list[int]) -> dict:
        """For a list of team ID's, get the highest workshop number
        for each team.

        Args:
            team_ids (list[int]): List of team ID's to get aggregation for.

        Returns:
            dict: Dictionary with team ID as key and highest workshop number as value.
        """
        results = (
            self._session.query(
                self._model.team_id, func.max(self._model.workshop_number)
            )
            .filter(self._model.team_id.in_(team_ids))
            .group_by(self._model.team_id)
            .all()
        )

        result_dict = {team_id: workshop_number for team_id, workshop_number in results}
        return result_dict


class DatabaseRepositories:
    """Container class for all repositories
    that can be injected into services to gain
    access to all tables in the database."""

    def __init__(self, session):
        self.attendances = AttendanceRepository(session=session)
        self.children = ChildRepository(session=session)
        self.communities = CommunityRepository(session=session)
        self.implementing_partners = ImplementingPartnerRepository(session=session)
        self.programs = ProgramRepository(session=session)
        self.roles = RoleRepository(session=session)
        self.teams = TeamRepository(session=session)
        self.workshops = WorkshopRepository(session=session)
