import logging

from core import exceptions
from models.child import ChildPatchIn, ChildPostIn
from services._base import BaseService

logger = logging.getLogger(__name__)


class ChildService(BaseService):
    """Service layer for managing children in the system.

    Handles operations for children with team assignments and attendance
    records. Ensures data integrity through team validation and name uniqueness
    checks within teams.
    """

    def create(self, child: ChildPostIn):
        """Create a new child in the specified team.

        Args:
            child: Child creation data

        Raises:
            TeamNotFoundError: If team doesn't exist
            ChildAlreadyExistsError: If name exists in team
        """
        self._validate_team_exists(child.team_id)
        self._validate_child_unique(child)

        child = self.database.children.create(child)
        self.commit()
        logger.info(f"Child created in team {child.team_id} with ID {child.id}")
        return child

    def _validate_child_unique(self, child: ChildPostIn | ChildPatchIn):
        """Check if child name is unique within their team.

        Args:
            child: Child data with name and team_id

        Raises:
            ChildAlreadyExistsError: If duplicate name in team
        """
        if self.database.children.where(
            [
                ("team_id", child.team_id),
                ("first_name", child.first_name),
                ("last_name", child.last_name),
            ]
        ):
            team = self.database.teams.read(child.team_id)
            error_msg = (
                f"Child {child.first_name} {child.last_name} already "
                f"exists in team {team.name}"
            )
            logger.error(error_msg)
            raise exceptions.ChildAlreadyExistsError(error_msg)

    def delete(self, object_id: int, cascade: bool = False):
        """Delete a child and optionally their attendance records.

        Args:
            object_id: Child ID to delete
            cascade: If True, deletes attendance records

        Raises:
            ChildNotFoundError: If child not found
            ChildHasAttendanceError: If has attendance and cascade=False
        """

        # check if child has attendance records
        if self.database.attendances.where([("child_id", object_id)]):
            # if cascade is False, raise an exception
            if not cascade:
                error_msg = (
                    f"Child with ID {object_id} has attendance "
                    "records and cascade is False"
                )
                logger.error(error_msg)
                raise exceptions.ChildHasAttendanceError(error_msg)

            # if cascade is True, delete all attendance records for the child
            logger.info(f"Deleting attendance records for child with ID {object_id}")
            self.database.attendances.delete_bulk(attr="child_id", value=object_id)

        # if child has no attendance records, delete the child
        self.database.children.delete(object_id=object_id)
        self.commit()
        logger.info(f"Deleted child with ID {object_id}")

    def get_all(self) -> list:
        """Get all children from the database.

        Returns:
            list[Child]: All child records
        """
        return self.database.children.read_all()

    def get(self, object_id):
        """Get a child by their ID.

        Args:
            object_id: Child ID

        Raises:
            ChildNotFoundError: If child not found
        """
        try:
            return self.database.children.read(object_id=object_id)
        except exceptions.ItemNotFoundError:
            raise exceptions.ChildNotFoundError(f"Child with ID {object_id} not found")

    def update(self, object_id: int, obj: ChildPatchIn):
        """Update a child's information.

        Args:
            object_id: Child ID to update
            obj: Updated child data

        Raises:
            ChildNotFoundError: If child not found
        """
        child = self.database.children.update(object_id=object_id, obj=obj)
        self.commit()
        logger.info(f"Updated child with ID {object_id}: {obj}")
        return child

    def _validate_team_exists(self, team_id: int):
        """Verify team exists.

        Args:
            team_id: Team ID to check

        Raises:
            TeamNotFoundError: If team not found
        """
        try:
            self.database.teams.read(object_id=team_id)
        except exceptions.ItemNotFoundError:
            error_msg = f"Team with ID {team_id} not found"
            logger.error(error_msg)
            raise exceptions.TeamNotFoundError(error_msg)
