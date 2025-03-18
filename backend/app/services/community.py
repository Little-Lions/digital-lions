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
            implementing_partner_id (int): IP ID to create community in.
            obj (CommunityPostIn): Community object to create.
        """
        self.current_user.verify_permission(self.permissions.communities_write)

        if not self.database.implementing_partners.where(
            [("id", obj.implementing_partner_id)]
        ):
            raise exceptions.ImplementingPartnerNotFoundError(
                f"Implementing partner with ID {obj.implementing_partner_id} does not exist"
            )

        if self.database.communities.where([("name", obj.name)]):
            raise exceptions.CommunityAlreadyExistsError(
                f"Community with name {obj.name} already exists."
            )
        community = self.database.communities.create(obj)
        self.commit()
        logger.info(f"Community created with name: {obj.name}, ID: {community.id}.")
        return community

    def get_all(self, implementing_partner_id: int = None) -> list | None:
        """Get all objects from the table."""
        self.current_user.verify_permission(self.permissions.communities_read)

        filters = []
        if implementing_partner_id:
            filters.append(("implementing_partner_id", implementing_partner_id))

        communities = self.database.communities.read_all_by_user_access(
            user_id=self.current_user.user_id, filters=filters
        )
        return sorted(communities, key=lambda community: community.name)

    def get(self, object_id):
        """Get an object from the table by id."""
        self.current_user.verify_permission(self.permissions.communities_read)

        self._validate_community_exists(object_id)
        community = self.database.communities.read(object_id=object_id)
        return community

    def update(self, object_id: int, obj):
        self.current_user.verify_permission(self.permissions.communities_write)

        self._validate_community_exists(object_id)
        updated_community = self.database.communities.update(
            object_id=object_id, obj=obj
        )
        self.commit()
        return updated_community

    def delete(self, object_id: int, cascade: bool = False):
        """Delete an object from the table by id."""

        self.current_user.verify_permission(self.permissions.communities_write)

        self._validate_community_exists(object_id)

        # TODO: this should be managed by database cascading setting
        if self.database.teams.where([("community_id", object_id)]):
            if not cascade:
                error_msg = (
                    "Attempted deletion of community with "
                    f"ID {object_id}, but has teams assigned to it."
                )
                logger.error(error_msg)
                raise exceptions.CommunityHasTeamsError(error_msg)

        self.database.communities.delete(object_id=object_id)
        self.commit()
        msg = f"Community with ID {object_id} deleted."
        logger.info(msg)
        return Message(detail=msg)

    def _validate_community_exists(self, community_id: int) -> None:
        """Validate that community exists."""
        try:
            self.database.communities.read(object_id=community_id)
        except exceptions.ItemNotFoundError:
            error_msg = f"Community with ID {community_id} not found"
            logger.error(error_msg)
            raise exceptions.CommunityNotFoundError(error_msg)
