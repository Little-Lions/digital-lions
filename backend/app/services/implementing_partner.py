import logging

from core import exceptions
from models.generic import APIResponse
from models.implementing_partner import ImplementingPartnerPostIn
from services._base import BaseService

logger = logging.getLogger(__name__)


class ImplementingPartnerService(BaseService):
    """Implementing Partner service layer to do anything
    related to implementing partners."""

    def create(self, obj: ImplementingPartnerPostIn):
        """Create a new implementing partner in the database.

        Args:
            obj (ImplementingPartnerPostIn): Implementing Partner object to create.
        """
        self.current_user.verify_permission(
            self.permissions.implementing_partners_write
        )

        if self.database.implementing_partners.where([("name", obj.name)]):
            raise exceptions.ImplementingPartnerAlreadyExistsError(
                f"Implementing Partner with name {obj.name} already exists."
            )
        implementing_partner = self.database.implementing_partners.create(obj)
        self.commit()
        logger.info(
            f"Implementing Partner created with name: {obj.name}, ID: {implementing_partner.id}."
        )
        return implementing_partner

    def get_all(self) -> list | None:
        """Get all implementing partners from the table."""
        self.current_user.verify_permission(self.permissions.implementing_partners_read)

        implementing_partners = (
            self.database.implementing_partners.read_all_by_user_access(
                user_id=self.current_user.user_id
            )
        )
        return sorted(
            implementing_partners,
            key=lambda implementing_partner: implementing_partner.name,
        )

    def get(self, object_id):
        """Get an implementing partner from the table by id."""
        self.current_user.verify_permission(self.permissions.implementing_partners_read)

        self._validate_implementing_partner_exists(object_id)
        implementing_partner = self.database.implementing_partners.read(
            object_id=object_id
        )
        return implementing_partner

    def update(self, object_id: int, obj):
        self.current_user.verify_permission(
            self.permissions.implementing_partners_write
        )

        self._validate_implementing_partner_exists(object_id)
        updated_implementing_partner = self.database.implementing_partners.update(
            object_id=object_id, obj=obj
        )
        self.commit()
        return updated_implementing_partner

    def delete(self, object_id: int, cascade: bool = False):
        """Delete an implementing partner from the table by id."""

        self.current_user.verify_permission(
            self.permissions.implementing_partners_write
        )

        self._validate_implementing_partner_exists(object_id)

        # TODO: this should be managed by database cascading setting
        if self.database.communities.where([("implementing_partner_id", object_id)]):
            if not cascade:
                raise exceptions.ImplementingPartnerHasCommunitiesError(
                    f"Implementing Partner with ID {object_id} has communities assigned to it."
                )

        self.database.implementing_partners.delete(object_id=object_id)
        self.commit()
        msg = f"IP with ID {object_id} deleted."
        return APIResponse(message=msg)

    def _validate_implementing_partner_exists(
        self, implementing_partner_id: int
    ) -> None:
        """Validate that implementing partner exists."""
        try:
            self.database.implementing_partners.read(object_id=implementing_partner_id)
        except exceptions.ItemNotFoundError:
            error_msg = (
                f"Implementing Partner with ID {implementing_partner_id} not found"
            )
            logger.error(error_msg)
            raise exceptions.ImplementingPartnerNotFoundError(error_msg)
