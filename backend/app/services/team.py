import logging
from enum import Enum

from core import exceptions
from models.team import (
    TeamGetByIdOut,
    TeamGetOut,
    TeamGetWorkshopByNumberOut,
    TeamGetWorkshopOut,
    TeamPatchIn,
    TeamPostIn,
    TeamPostWorkshopIn,
    TeamStatus,
)
from services._base import BaseService

logger = logging.getLogger(__name__)


class Attendance(str, Enum):
    present = "present"
    cancelled = "cancelled"
    absent = "absent"


class TeamService(BaseService):
    """Team service layer to do anything related to teams."""

    def create(self, team: TeamPostIn):
        """Create a new team."""

        self.current_user.verify_permission(self.permissions.teams_write)

        self._validate_team_unique(team)

        try:
            community = self.database.communities.read(object_id=team.community_id)
        except exceptions.ItemNotFoundError:
            msg = f"Community with ID {team.community_id} not found"
            logger.error(msg)
            raise exceptions.CommunityNotFoundError(msg)

        team.implementing_partner_id = community.implementing_partner_id
        new_team = self.database.teams.create(team)
        self.commit()
        logger.info(f"Team with ID {new_team.id} created.")
        return new_team

    def _validate_team_unique(self, team: TeamPostIn | TeamPatchIn):
        """Validate that a team name is unique.

        Args:
            team: Team data to validate

        Raises:
            TeamAlreadyExistsError: If a team with the same name already exists
        """
        if self.database.teams.where([("name", team.name)]):
            error_msg = f"Team with name '{team.name}' already exists"
            logger.error(error_msg)
            raise exceptions.TeamAlreadyExistsError(error_msg)

    def create_workshop(self, team_id: int, workshop: TeamPostWorkshopIn) -> dict:
        """Create a workshop for a team.

        Args:
            team_id (int): Team ID to create the workshop for.
            workshop (TeamPostWorkshopIn): Workshop object to create.

        Returns:
            dict: Workshop object created.
        """
        self.current_user.verify_permission(self.permissions.workshops_write)

        self._validate_team_exists(team_id)

        # validate that workshop does not exist yet for the team
        if self.database.workshops.where(
            [
                ("team_id", team_id),
                ("workshop_number", workshop.workshop_number),
            ]
        ):
            error_msg = (
                f"Workshop {workshop.workshop_number} for team "
                f"{team_id} already exists."
            )
            logger.error(error_msg)
            raise exceptions.WorkshopExistsError(error_msg)

        # validate that the workshop number is the next valid workshop for the team
        workshops = self.database.workshops.where([("team_id", team_id)])
        valid_workshop_number = (
            max(w.workshop_number for w in workshops) + 1 if len(workshops) > 0 else 1
        )
        if workshop.workshop_number != valid_workshop_number:
            error_msg = (
                f"Workshop number {workshop.workshop_number} is not the next correct "
                + f"workshop for team {team_id}. Should be {valid_workshop_number}"
            )
            logger.error(error_msg)
            raise exceptions.WorkshopNumberInvalidError(error_msg)

        # validate that all children in the payload are part of the team
        payload_child_ids = set([child.child_id for child in workshop.attendance])
        team_child_ids = set(
            [child.id for child in self.database.children.where([("team_id", team_id)])]
        )

        payload_child_ids_not_in_team = [
            i for i in payload_child_ids if i not in team_child_ids
        ]
        if payload_child_ids_not_in_team:
            error_msg = (
                "Payload attendance field contains children ID's that "
                + f"are not in team {team_id}: {payload_child_ids_not_in_team}"
            )
            logger.error(error_msg)
            raise exceptions.ChildNotInTeam(error_msg)

        # validate that all children from the team are in the payload
        team_child_ids_not_in_payload = [
            i for i in team_child_ids if i not in payload_child_ids
        ]
        if team_child_ids_not_in_payload:
            error_msg = (
                "Attendance payload incomplete. Missing child ID's from "
                + f"team {team_id}: {team_child_ids_not_in_payload}"
            )
            logger.error(error_msg)
            raise exceptions.WorkshopIncompleteAttendance(error_msg)

        # create workshop
        attendance = workshop.attendance
        workshop_record = self.database.workshops.create(
            {
                "team_id": team_id,
                "date": workshop.date,
                "workshop_number": workshop.workshop_number,
            }
        )
        # create attendance records for all children in team
        for child_attendance in attendance:
            self.database.attendances.create(
                {
                    "workshop_id": workshop_record.id,
                    "child_id": child_attendance.child_id,
                    "attendance": child_attendance.attendance,
                }
            )

        # if this is the last workshop, set team as inactive
        # TO DO get this from Program info
        final_workshop = 12
        if workshop.workshop_number == final_workshop:
            logger.info(
                f"Team with ID {team_id} has completed "
                f"workshop {final_workshop} and is now inactive."
            )
            self.database.teams.update(
                object_id=team_id, obj=TeamPatchIn(is_active=False)
            )

        self.commit()
        return workshop_record

    def get_all(
        self,
        community_id: int = None,
        status: TeamStatus = TeamStatus.active,
    ) -> list | None:
        """Get all teams from the table.

        Args:
            community_id (str, optional): Filter by community ID. Defaults to None.
            status (TeamStatus, optional): Filter by status. Defaults to "active". Ohter options
                are "inactive" and "all".

        Returns:
            list: List of teams.
        """
        self.current_user.verify_permission(self.permissions.teams_read)

        filters = []
        if community_id:
            filters.append(("community_id", community_id))

        # filter by status, if status neither active or inactive, no filters are applied
        if status == TeamStatus.active:
            filters.append(("is_active", True))
        if status == TeamStatus.inactive:
            filters.append(("is_active", False))

        teams = self.database.teams.read_all_by_user_access(
            user_id=self.current_user.user_id, filters=filters
        )

        team_ids = [team.id for team in teams]

        # TODO ideally below method should pass 0 if a team has no workshop yet
        # also saves us ugly list comprehesions later
        teams_progresses = self.database.workshops.get_last_workshop_per_team(
            team_ids=team_ids
        )
        teams = [
            TeamGetOut(
                **team.model_dump(),
                community=team.community.model_dump(),
                program={
                    "progress": {
                        "current": (
                            teams_progresses[team.id]
                            if team.id in teams_progresses
                            else 0
                        )
                    }
                },
            )
            for team in teams
        ]
        return sorted(teams, key=lambda team: team.name)

    def get(self, object_id: int) -> TeamGetByIdOut:
        """Get a team from the table by id.

        Args:
            object_id (int): Team ID to get Team for.
        """
        self.current_user.verify_permission(self.permissions.teams_read)
        team = self._validate_team_exists(object_id)

        teams_progresses = self.database.workshops.get_last_workshop_per_team(
            team_ids=[team.id]
        )
        # if the team has no workshops yet, its ID will not be in the dict
        team_progress = teams_progresses[team.id] if team.id in teams_progresses else 0

        children = [child.model_dump() for child in team.children]
        return TeamGetByIdOut(
            **team.model_dump(),
            children=sorted(children, key=lambda child: child.first_name),
            community=team.community.model_dump(),
            program={"progress": {"current": team_progress}},
        )

    def update(self, object_id: int, obj):
        self.current_user.verify_permission(self.permissions.teams_write)
        return self.database.teams.update(object_id=object_id, obj=obj)

    def delete(self, object_id: int, cascade: bool = False):
        """Delete a team and its children (including attendances).
        Raises an exception if the team has children and cascade is False.

        Args:
            object_id (int): Team ID to delete.
            cascade (bool, optional): Delete children and attendances if
                present. Defaults to False.
        """
        self.current_user.verify_permission(self.permissions.teams_write)
        self._validate_team_exists(object_id)

        deleted_children = False
        if self.database.children.where([("team_id", object_id)]):
            deleted_children = True
            if not cascade:
                error_msg = (
                    f"Cannot delete team with ID {object_id} because it has related "
                    + "children record and 'cascade' is set to False"
                )
                logger.error(error_msg)
                raise exceptions.TeamHasChildrenError(error_msg)

        logger.info(f"Deleting team with ID {object_id}")
        self.database.teams.delete(object_id=object_id)
        self.commit()

        msg = (
            f"Team with ID {object_id} deleted, no children deleted."
            if not deleted_children
            else f"Team with ID {object_id} and related children deleted."
        )
        return msg

    def get_workshops(self, team_id: int) -> list | None:
        """Get all workshops for a team."""

        self.current_user.verify_permission(self.permissions.workshops_read)
        self._validate_team_exists(team_id)

        workshops = self.database.workshops.where([("team_id", team_id)])

        # TODO this is quite inefficient because we do a query for each workshop (at most 12)
        # we could do a single query to get all the scores at once and let the db do the lifting
        workshops_out = [
            TeamGetWorkshopOut(
                **{
                    "workshop": {
                        "id": w.id,
                        "number": w.workshop_number,
                        "date": w.date,
                        "name": f"Workshop {w.workshop_number}",
                    },
                    "attendance": self.get_aggregated_attendance(workshop_id=w.id),
                }
            )
            for w in workshops
        ]
        return workshops_out

    def get_workshop_by_number(
        self, team_id: int, workshop_number: int
    ) -> TeamGetWorkshopByNumberOut:
        """Get a workshop by number that was completed by a team.

        Args:
            team_id (int): Team ID to get workshop for.
            workshop_number (int): Workshop number to get.
        """
        self.current_user.verify_permission(self.permissions.workshops_read)

        self._validate_team_exists(team_id)

        workshop = self.database.workshops.where(
            [("team_id", team_id), ("workshop_number", workshop_number)]
        )
        if not workshop:
            error_msg = f"Workshop {workshop_number} for team {team_id} not found."
            raise exceptions.WorkshopNotFoundError(error_msg)

        if len(workshop) > 1:
            error_msg = (
                "Unexpected error. Found 0 or more than 1 workshop with "
                + f"number {workshop_number} for team {team_id}."
            )
            raise ValueError(error_msg)

        # get per child attendance for the workshop
        workshop_id = workshop[0].id
        attendance = self.database.attendances.where([("workshop_id", workshop_id)])

        workshop = TeamGetWorkshopByNumberOut(
            workshop={
                "id": workshop_id,
                "number": workshop_number,
                "date": workshop[0].date,
                "name": f"Workshop {workshop_number}",
            },
            attendance=[
                {
                    "child_id": a.child.id,
                    "attendance": a.attendance,
                    "first_name": a.child.first_name,
                    "last_name": a.child.last_name,
                }
                for a in attendance
            ],
        )
        return workshop

    def get_aggregated_attendance(self, workshop_id: int) -> dict:
        """Get aggregated attendance score of a workshop."""
        attendance = self.database.attendances.where([("workshop_id", workshop_id)])

        total = len(attendance)
        present = len(
            [x for x in attendance if x.attendance == Attendance.present.value]
        )
        cancelled = len(
            [x for x in attendance if x.attendance == Attendance.cancelled.value]
        )
        absent = len([x for x in attendance if x.attendance == Attendance.absent.value])

        return {
            "total": total,
            "present": present,
            "cancelled": cancelled,
            "absent": absent,
        }

    def _validate_team_exists(self, team_id: int):
        """Check if a team exists."""
        try:
            return self.database.teams.read(object_id=team_id)
        except exceptions.ItemNotFoundError:
            error_msg = f"Team with ID {team_id} not found"
            logger.error(error_msg)
            raise exceptions.TeamNotFoundError(error_msg)

    @classmethod
    def factory(cls):
        """Factory method to get service when not in dependency context."""
        raise NotImplementedError()
