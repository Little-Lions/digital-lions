"""Repositories for CRUD operations on the database.
Each table in the database translate to a repository class."""

from core.database import schema
from repositories._base import BaseRepository
from sqlalchemy import func


class AttendanceRepository(BaseRepository[schema.Attendance]):
    """Repository to interact with attendances table."""

    _model = schema.Attendance


class ChildRepository(BaseRepository[schema.Child]):
    """Repository to interact with children table."""

    _model = schema.Child


class CommunityRepository(BaseRepository[schema.Community]):
    """Repository to interact with Communities table."""

    _model = schema.Community


class ProgramRepository(BaseRepository[schema.Program]):
    """Repository to interact with Program table."""

    _model = schema.Program


class RoleRepository(BaseRepository[schema.Role]):
    """Repository to interact with Roles table."""

    _model = schema.Role


class TeamRepository(BaseRepository[schema.Team]):
    """Repository to interact with Team table."""

    _model = schema.Team


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
        self.programs = ProgramRepository(session=session)
        self.roles = RoleRepository(session=session)
        self.teams = TeamRepository(session=session)
        self.workshops = WorkshopRepository(session=session)
