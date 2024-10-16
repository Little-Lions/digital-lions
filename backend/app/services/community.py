import logging

from core import exceptions
from models.api import Message
from models.api.community import CommunityPostIn
from services.base import AbstractService, BaseService

logger = logging.getLogger(__name__)


class CommunityService(AbstractService, BaseService):
    """Community service layer to do anything related to communities."""

    def create(self, obj: CommunityPostIn):
        """Create a new community in the database.

        Args:
            obj (CommunityPostIn): Community object to create.
        """
        if self._communities.where([("name", obj.name)]):
            raise exceptions.CommunityAlreadyExistsException(
                f"Community with name {obj.name} already exists."
            )
        community = self._communities.create(obj)
        self.commit()
        logger.info(f"Community created with name: {obj.name}, ID: {community.id}.")
        return community

    def get_all(self):
        """Get all objects from the table."""
        return self._communities.read_all()

    def get(self, object_id):
        """Get an object from the table by id."""
        self._validate_community_exists(object_id)
        return self._communities.read(object_id=object_id)

    def update(self, object_id: int, obj):
        self._validate_community_exists(object_id)
        updated_community = self._communities.update(object_id=object_id, obj=obj)
        self.commit()
        return updated_community

    def delete(self, object_id: int, cascade: bool = False):
        """Delete an object from the table by id."""
        self._validate_community_exists(object_id)

        if self._teams.where([("community_id", object_id)]):
            if not cascade:
                raise exceptions.CommunityHasTeamsException(
                    f"Community with ID {object_id} has teams assigned to it."
                )

        self._communities.delete(object_id=object_id)
        self.commit()
        msg = f"Community with ID {object_id} deleted."
        return Message(detail=msg)

    def _validate_community_exists(self, community_id: int) -> None:
        """Validate that community exists."""
        try:
            self._communities.read(object_id=community_id)
        except exceptions.ItemNotFoundException:
            error_msg = f"Community with ID {community_id} not found"
            logger.error(error_msg)
            raise exceptions.CommunityNotFoundException(error_msg)
