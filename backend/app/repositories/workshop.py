from models.db.schema import Workshop
from repositories.base import BaseRepository


class WorkshopRepository(BaseRepository[Workshop]):
    """Repository to interact with Workshop table."""

    _model = Workshop
