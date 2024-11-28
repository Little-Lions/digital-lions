import logging

from core import exceptions
from models.community import CommunityPostIn
from models.generic import Message
from services._base import BaseService

logger = logging.getLogger(__name__)


class CommunityService(BaseService):
    """Community service layer to do anything related to communities."""

    def create(self, obj: CommunityPostIn):
        """Create a new community in the database.

        Args:
            obj (CommunityPostIn): Community object to create.
        """
        if self.database.communities.where([("name", obj.name)]):
            raise exceptions.CommunityAlreadyExistsError(
                f"Community with name {obj.name} already exists."
            )
        community = self.database.communities.create(obj)
        self.commit()
        logger.info(f"Community created with name: {obj.name}, ID: {community.id}.")
        return community

    def get_all(self):
        """Get all objects from the table."""
        return self.database.communities.read_all()

    def get(self, object_id):
        """Get an object from the table by id."""
        self._validate_community_exists(object_id)
        return self.database.communities.read(object_id=object_id)

    def update(self, object_id: int, obj):
        self._validate_community_exists(object_id)
        updated_community = self.database.communities.update(
            object_id=object_id, obj=obj
        )
        self.commit()
        return updated_community

    def delete(self, object_id: int, cascade: bool = False):
        """Delete an object from the table by id."""
        self._validate_community_exists(object_id)

        if self.database.teams.where([("community_id", object_id)]):
            if not cascade:
                raise exceptions.CommunityHasTeamsError(
                    f"Community with ID {object_id} has teams assigned to it."
                )

        self.database.communities.delete(object_id=object_id)
        self.commit()
        msg = f"Community with ID {object_id} deleted."
        return Message(detail=msg)

    def _validate_community_exists(self, community_id: int) -> None:
        """Validate that community exists."""
        try:
            self.database.communities.read(object_id=community_id)
        except exceptions.ItemNotFoundError:
            error_msg = f"Community with ID {community_id} not found"
            logger.error(error_msg)
            raise exceptions.CommunityNotFoundError(error_msg)
