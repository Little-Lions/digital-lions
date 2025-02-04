"""Custom exceptions for the app."""

from fastapi import status


class BadRequestError(Exception):
    pass


class ChildAlreadyExistsError(Exception):
    pass


class ChildHasAttendanceError(Exception):
    pass


class ChildNotFoundError(Exception):
    pass


class ChildNotInTeam(Exception):
    pass


class BaseException(Exception):
    """Custom base exception for all internal errors.
    Each subclass should have its own short message
    which is displayed to the user."""

    def __init__(self, message):
        """The error message is what we want to show
        as detail, which is not shown to the user."""
        self.detail = message


class CommunityAlreadyExistsError(BaseException):

    message = "Community already exists!"
    status_code = status.HTTP_409_CONFLICT


class CommunityHasTeamsError(BaseException):

    message = "Community has teams"
    status_code = status.HTTP_409_CONFLICT


class CommunityNotFoundError(BaseException):

    message = "Community not found"
    status_code = status.HTTP_404_NOT_FOUND


class ForbiddenError(Exception):
    pass


class InternalServerError(Exception):
    pass


class InsufficientPermissionsError(Exception):
    pass


class ItemAlreadyExistsError(Exception):
    pass


class ItemNotFoundError(Exception):
    pass


class ResourceNotFoundError(Exception):
    pass


class RoleAlreadyExistsError(Exception):
    pass


class RoleNotFoundError(Exception):
    pass


class RoleNotFoundForUserError(Exception):
    pass


class TeamAlreadyExistsError(Exception):
    pass


class TeamHasChildrenError(Exception):
    pass


class TeamNotFoundError(Exception):
    pass


class UserEmailExistsError(Exception):
    pass


class UserNotFoundError(Exception):
    pass


class UserUnauthorizedError(Exception):
    pass


class WorkshopExistsError(Exception):
    pass


class WorkshopIncompleteAttendance(Exception):
    pass


class WorkshopNotFoundError(Exception):
    pass


class WorkshopNumberInvalidError(Exception):
    pass
