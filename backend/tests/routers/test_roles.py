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


def test_add_role_success(client, mocker, role_exists):
    # assert that a 200 is returned when a user_id is passed that exists
    # TODO: move this to fixture
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

    auth0.roles.list.return_value = {
        "roles": [{"id": 1, "name": "Admin", "description": "Admin role"}]
    }
    mocker.patch("repositories.auth0.Auth0", return_value=auth0)

    community = mocker.MagicMock(id=1)
    mocker.patch(
        "repositories.database.CommunityRepository.read", return_value=community
    )
    user_id = "auth0|1234"
    response = client.post(
        f"{ENDPOINT}/{user_id}/roles",
        json={"role": "Admin", "level": "Community", "resource_id": 1},
    )
    assert response.status_code == status.HTTP_201_CREATED, response.text

    response_get = client.get(f"{ENDPOINT}/{user_id}/roles")
    assert response_get.status_code == status.HTTP_200_OK, response_get.text
    assert response_get.json().get("data") == [
        {"id": 1, "role": "Admin", "level": "Community", "resource_id": 1}
    ]


def test_delete_role_success(client, mocker, role_exists):
    # assert that a 200 is returned when a user_id is passed that exists
    # TODO: move this to fixture
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

    auth0.roles.list.return_value = {
        "roles": [{"id": 1, "name": "Admin", "description": "Admin role"}]
    }
    mocker.patch("repositories.auth0.Auth0", return_value=auth0)

    mocker.patch(
        "repositories.database.CommunityRepository.read",
        return_value=mocker.MagicMock(id=1),
    )
    user_id = "auth0|1234"
    role = {"role": "Admin", "level": "Community", "resource_id": 1}
    response = client.post(
        f"{ENDPOINT}/{user_id}/roles",
        json=role,
    )
    assert response.status_code == status.HTTP_201_CREATED, response.text

    response_get = client.get(f"{ENDPOINT}/{user_id}/roles")
    assert response_get.status_code == status.HTTP_200_OK, response_get.text
    assert response_get.json().get("data") == [
        {"id": 1, "role": "Admin", "level": "Community", "resource_id": 1}
    ]

    response_delete = client.delete(f"{ENDPOINT}/{user_id}/roles/1")
    assert (
        response_delete.status_code == status.HTTP_204_NO_CONTENT
    ), response_delete.text


def test_role_resources(client):
    # test all resource endpoints all at once
    roles = client.get("/roles")
    assert roles.status_code == status.HTTP_200_OK, roles.text
    for role in roles.json().get("data"):

        levels = client.get("/roles/levels", params={"role": role})
        assert levels.status_code == status.HTTP_200_OK, levels.text

        for level in levels.json().get("data"):
            response = client.get(
                "/roles/resources", params={"role": role, "level": level}
            )
            assert response.status_code == status.HTTP_200_OK, response.text
