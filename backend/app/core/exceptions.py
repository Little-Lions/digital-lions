"""Custom exceptions for the app."""


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


class CommunityAlreadyExistsError(Exception):
    pass


class CommunityHasTeamsError(Exception):
    pass


class CommunityNotFoundError(Exception):
    pass


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
