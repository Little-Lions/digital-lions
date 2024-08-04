import logging
from enum import Enum

import exceptions
from models.api.generic import Message
from models.api.team import (TeamGetByIdOut, TeamGetWorkshopOut, TeamPostIn,
                             TeamPostWorkshopIn)
from services.base import AbstractService, BaseService

logger = logging.getLogger(__name__)


class Attendance(Enum):
    present: str = "present"
    cancelled: str = "cancelled"
    absent: str = "absent"


class TeamService(AbstractService, BaseService):
    """Team service layer to do anything related to teams."""

    def create(self, team: TeamPostIn):
        """Create a new team."""
        try:
            self._communities.read(object_id=team.community_id)
        except exceptions.ItemNotFoundException:
            msg = f"Community with ID {team.community_id} not found"
            logger.error(msg)
            raise exceptions.CommunityNotFoundException(msg)

        # first create the team, then add children to it
        children = team.children
        delattr(team, "children")
        new_team = self._teams.create(team)
        logger.info(f"Team with ID {new_team.id} created.")

        for child in children:
            child_created = self._children.create(
                {"team_id": new_team.id, **child.dict()}
            )
            logger.info(
                f"Child with ID {child_created.id} added to team {new_team.id}."
            )

        self.commit()
        return new_team

    def create_workshop(self, team_id: int, workshop: TeamPostWorkshopIn) -> dict:
        """Create a workshop for a team.

        Args:
            team_id (int): Team ID to create the workshop for.
            workshop (TeamPostWorkshopIn): Workshop object to create.

        Returns:
            dict: Workshop object created.
        """
        self._validate_team_exists(team_id)

        # validate that workshop does not exist yet for the team
        if self._workshops.where(
            [
                (self.cols.team_id, team_id),
                (self.cols.workshop_number, workshop.workshop_number),
            ]
        ):
            error_msg = f"Workshop {workshop.workshop_number} for team {team_id} already exists."
            logger.error(error_msg)
            raise exceptions.WorkshopExistsException(error_msg)

        # validate that the workshop number is the next valid workshop for the team
        workshops = self._workshops.where([(self.cols.team_id, team_id)])
        valid_workshop_number = (
            max(w.workshop_number for w in workshops) + 1 if len(workshops) > 0 else 1
        )
        if workshop.workshop_number != valid_workshop_number:
            error_msg = (
                f"Workshop number {workshop.workshop_number} is not the next correct "
                + f"workshop for team {team_id}. Should be {valid_workshop_number}"
            )
            logger.error(error_msg)
            raise exceptions.WorkshopNumberInvalidException(error_msg)

        # validate that all children in the payload are part of the team
        payload_child_ids = set([child.child_id for child in workshop.attendance])
        team_child_ids = set(
            [child.id for child in self._children.where([(self.cols.team_id, team_id)])]
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
        workshop_record = self._workshops.create(
            {
                "team_id": team_id,
                "date": workshop.date,
                "workshop_number": workshop.workshop_number,
            }
        )
        # create attendance records for all children in team
        for child_attendance in attendance:
            self._attendances.create(
                {
                    "workshop_id": workshop_record.id,
                    "child_id": child_attendance.child_id,
                    "attendance": child_attendance.attendance,
                }
            )

        self.commit()
        return workshop_record

    def get_all(self, filters=list[tuple]):
        """Get all objects from the table."""
        if filters:
            teams = self._teams.where(filters=filters)
        else:
            teams = self._teams.read_all()

        # TODO add progress from
        # self.workshops.get_last_workshop_per_team_()
        return teams

    def get(self, object_id):
        """Get a team from the table by id."""
        self._validate_team_exists(object_id)

        team = self._teams.read(object_id=object_id)

        # this should be done by the database
        team_workshops = self._workshops.where([("team_id", object_id)])
        latest_workshop = (
            max([w.workshop_number for w in team_workshops]) if team_workshops else 0
        )
        # TODO find a Pythonic way to do this
        return TeamGetByIdOut(
            **team.model_dump(),
            children=[child.model_dump() for child in team.children],
            community=team.community.model_dump(),
            progress={"workshop": latest_workshop},
        )

    def update(self, object_id: int, obj):
        return self._teams.update(object_id=object_id, obj=obj)

    def delete(self, object_id: int, cascade: bool = False):
        """Delete a team and its children (including attendances).
        Raises an exception if the team has children and cascade is False.

        Args:
            object_id (int): Team ID to delete.
            cascade (bool, optional): Delete children and attendances if
                present. Defaults to False.
        """
        self._validate_team_exists(object_id)

        deleted_children = False
        if self._children.where([(self.cols.team_id, object_id)]):
            deleted_children = True
            if not cascade:
                error_msg = f"Team with ID {object_id} not empty: has children."
                logger.error(error_msg)
                raise exceptions.TeamHasChildrenException(error_msg)

        logger.info(f"Deleting team with ID {object_id}")
        self._teams.delete(object_id=object_id)
        self.commit()

        msg = (
            f"Team with ID {object_id} deleted, no children deleted."
            if not deleted_children
            else f"Team with ID {object_id} and related children deleted."
        )
        return Message(detail=msg)

    def get_workshops(self, team_id: int) -> list | None:
        """Get all workshops for a team."""
        self._validate_team_exists(team_id)

        workshops = self._workshops.where([(self.cols.team_id, team_id)])

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

    def get_aggregated_attendance(self, workshop_id: int) -> dict:
        """Get aggregated attendance score of a workshop."""
        attendance = self._attendances.where([("workshop_id", workshop_id)])

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

    def _validate_team_exists(self, team_id: int) -> None:
        """Check if a team exists."""
        try:
            self._teams.read(object_id=team_id)
        except exceptions.ItemNotFoundException:
            error_msg = f"Team with ID {team_id} not found"
            logger.error(error_msg)
            raise exceptions.TeamNotFoundException(error_msg)

    @classmethod
    def factory(cls):
        """Factory method to get service when not in dependency context."""
        raise NotImplementedError()
