"""Internally shared metadata properties for all database- and API models."""

from datetime import datetime

from pydantic import computed_field


class _CreatedAtPropertyIn:
    """Created at timestamp, to be set
    on incoming models."""

    @computed_field
    def created_at(self) -> datetime:
        return datetime.now()


class _CreatedAtPropertyOut:
    """Created at timestamp,
    to be set on outgoing models."""

    created_at: datetime


class _IsActivePropertyIn:
    """Is active property, defaults to True on creation of record.
    To be set on incoming models."""

    @computed_field
    def is_active(self) -> bool:
        return True


class _IsActiveUpdatePropertyIn:
    """Is active property, defaults to True on creation of record,
    but can be updated to false at a later stage."""

    is_active: bool | None = None


class _IsActivePropertyOut:
    """Is active column in databases table."""

    is_active: bool


class _LastUpdatedAtPropertyIn:
    """Updated at timestamp."""

    @computed_field
    def last_updated_at(self) -> datetime:
        return datetime.now()


class _LastUpdatedAtPropertyOut:
    """Updated at timestamp."""

    last_updated_at: datetime


class _CreatePropertiesIn(
    _CreatedAtPropertyIn, _LastUpdatedAtPropertyIn, _IsActivePropertyIn
):
    """Properties for create objects."""

    pass


class _UpdatePropertiesIn(_LastUpdatedAtPropertyIn, _IsActiveUpdatePropertyIn):
    """Metadata properties for updating models."""

    pass


class _MetadataPropertiesOut(
    _CreatedAtPropertyOut, _LastUpdatedAtPropertyOut, _IsActivePropertyOut
):
    """Metadata properties for outgoing models."""

    pass
