from datetime import datetime
from unittest.mock import MagicMock

import pytest
from auth0.exceptions import Auth0Error
from fastapi import status

ENDPOINT = "/users"


@pytest.fixture(
    autouse=True,
)
def mock_auth0_repository(mocker):
    """Mock the auth0 token for all tests."""
    get_token_mock = mocker.MagicMock()
    get_token_mock.client_credentials.return_value = {"access_token": "dummy-token"}
    mocker.patch("repositories.auth0.GetToken", return_value=get_token_mock)


@pytest.fixture
def user_exists(mocker):
    # fixture for existent user
    valid_user_id = "auth0|1234"
    email = "email@hotmail.com"
    valid_user = {
        "user_id": valid_user_id,
        "email": email,
        "email_verified": None,
        "created_at": None,
    }

    auth0 = MagicMock()
    auth0.users.get.return_value = valid_user
    mocker.patch("repositories.auth0.Auth0", return_value=auth0)


@pytest.fixture
def role_exists(mocker):
    # fixture for existent role
    auth0 = MagicMock()
    auth0.roles.list.return_value = [
        {"id": 1, "name": "Admin", "description": "Admin role"}
    ]
    mocker.patch("repositories.auth0.Auth0", return_value=auth0)


def test_add_role_user_not_found(client, mocker):
    # assert that a 404 is returned when a user_id is passed that does not existk
    auth0 = MagicMock()
    auth0.users.get.side_effect = (
        Auth0Error(
            status_code=404, error_code="inexistent_user", message="User does not exist"
        ),
    )
    mocker.patch("repositories.auth0.Auth0", return_value=auth0)

    user_id = "auth0|1234"
    response = client.post(
        f"{ENDPOINT}/{user_id}/roles",
        json={"role": "Admin", "level": "Community", "resource_id": 1},
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND, response.text


# def test_add_role_success(client, mocker, user_exists, role_exists):
#     # assert that a 200 is returned when a user_id is passed that exists
#     mocker.patch(
#         "repositories.database.CommunityRepository.read",
#         return_value=mocker.MagicMock(),
#     )
#     user_id = "auth0|1234"
#     response = client.post(
#         f"{ENDPOINT}/{user_id}/roles",
#         json={"role": "Admin", "level": "Community", "resource_id": 1},
#     )
#     assert response.status_code == status.HTTP_201_CREATED, response.text
