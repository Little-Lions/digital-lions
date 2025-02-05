"""Custom exceptions for the app."""

from fastapi import status


class BaseAPIException(Exception):
    """Custom base exception for all internal errors
    that are exposed to the user.

    Each subclass should have its own short message
    which is displayed to the user, and status code."""

    def __init__(self, message):
        """The error message is what we want to show
        as detail, which is not shown to the user."""
        self.detail = message


class BadRequestError(Exception):
    pass


class ChildAlreadyExistsError(Exception):
    pass


class ChildHasAttendanceError(Exception):
    pass


class ChildNotFoundError(BaseAPIException):

    message = "Child not found"
    status_code = status.HTTP_404_NOT_FOUND


class ChildNotInTeam(BaseAPIException):

    message = "Child not in team"
    status_code = status.HTTP_400_BAD_REQUEST


class CommunityAlreadyExistsError(BaseAPIException):

    message = "Community already exists!"
    status_code = status.HTTP_409_CONFLICT


class CommunityHasTeamsError(BaseAPIException):

    message = "Community has teams"
    status_code = status.HTTP_409_CONFLICT


class CommunityNotFoundError(BaseAPIException):

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


class TeamHasChildrenError(BaseAPIException):

    message = "Team has children!"
    status_code = status.HTTP_409_CONFLICT


class TeamNotFoundError(BaseAPIException):

    message = "Team not found"
    status_code = status.HTTP_404_NOT_FOUND


class UserEmailExistsError(Exception):
    pass


class UserNotFoundError(Exception):
    pass


class UserUnauthorizedError(Exception):
    pass


class WorkshopExistsError(BaseAPIException):

    message = "Workshop already exists!"
    status_code = status.HTTP_409_CONFLICT


class WorkshopIncompleteAttendance(BaseAPIException):

    message = "Missing child attendance"
    status_code = status.HTTP_400_BAD_REQUEST


class WorkshopNotFoundError(Exception):
    pass


class WorkshopNumberInvalidError(BaseAPIException):

    message = "Workshop number invalid!"
    status_code = status.HTTP_400_BAD_REQUEST
