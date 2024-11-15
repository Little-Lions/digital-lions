"""Standard authorization responses that are 
included on every endpoint."""

from typing import Any

from fastapi import status
from models.generic import Message

DEFAULT_RESPONSES = {
    status.HTTP_401_UNAUTHORIZED: {
        "model": Message,
        "description": "Unauthorized",
    },
    status.HTTP_403_FORBIDDEN: {
        "model": Message,
        "description": "Forbidden",
    },
}


def with_default_responses(custom_responses: dict[int, dict[str, Any]] = None) -> dict:
    """Merges default responses with any endpoint-specific responses."""
    if custom_responses is None:
        custom_responses = {}
    return {**DEFAULT_RESPONSES, **custom_responses}
