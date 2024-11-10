import logging

from core import exceptions
from models.child import ChildPatchIn, ChildPostIn
from services._base import BaseService

logger = logging.getLogger(__name__)


class ChildService(BaseService):
    """Service layer to interact with children."""

    def create(self, child: ChildPostIn):
        """Create a new child."""
        self._validate_team_exists(child.team_id)

        self._validate_child_unique(child)

        child = self._children.create(child)
        self.commit()
        logger.info(f"Child created in team {child.team_id} with ID {child.id}")
        return child

    def _validate_child_unique(self, child: ChildPostIn | ChildPatchIn):
        """Validate that a child is unique in a team."""
        if self._children.where(
            [
                ("team_id", child.team_id),
                ("first_name", child.first_name),
                ("last_name", child.last_name),
            ]
        ):
            team = self._teams.read(child.team_id)
            error_msg = (
                f"Child {child.first_name} {child.last_name} already "
                f"exists in team {team.name}"
            )
            logger.error(error_msg)
            raise exceptions.ChildAlreadyExistsError(error_msg)

    def delete(self, object_id: int, cascade: bool = False):
        """Delete a child."""

        # check if child has attendance records
        if self._attendances.where([("child_id", object_id)]):
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
            self._attendances.delete_bulk(attr="child_id", value=object_id)

        # if child has no attendance records, delete the child
        self._children.delete(object_id=object_id)
        self.commit()
        logger.info(f"Deleted child with ID {object_id}")

    def get_all(self) -> list:
        """Get all objects from the table."""
        return self._children.read_all()

    def get(self, object_id):
        """Get a child by ID.

        Args:
            object_id (int): ID of the child to get.
        """
        try:
            return self._children.read(object_id=object_id)
        except exceptions.ItemNotFoundException:
            raise exceptions.ChildNotFoundError(f"Child with ID {object_id} not found")

    def update(self, object_id: int, obj: ChildPatchIn):
        """Update a child.

        Args:
            object_id (int): ID of the child to update.
            obj (ChildUpdate): Child object with updated fields.
        """
        child = self._children.update(object_id=object_id, obj=obj)
        self.commit()
        logger.info(f"Updated child with ID {object_id}: {obj}")
        return child

    def _validate_team_exists(self, team_id: int):
        """Validate that a team exists."""
        try:
            self._teams.read(object_id=team_id)
        except exceptions.ItemNotFoundException:
            error_msg = f"Team with ID {team_id} not found"
            logger.error(error_msg)
            raise exceptions.TeamNotFoundException(error_msg)
