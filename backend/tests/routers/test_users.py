from datetime import datetime
from unittest.mock import MagicMock

import pytest
from auth0.exceptions import Auth0Error
from fastapi import status

ENDPOINT = "/users"


@pytest.fixture(autouse=True)
def mock_auth0_repository(mocker):
    """Mock the auth0 token for all tests."""
    get_token_mock = mocker.MagicMock()
    get_token_mock.client_credentials.return_value = {"access_token": "dummy-token"}
    mocker.patch("repositories.auth0.GetToken", return_value=get_token_mock)


def test_get_user_not_found(client, mocker):
    # assert that a 404 is returned when a user_id is passed that does not exist
    auth0 = MagicMock()
    auth0.users.get.side_effect = (
        Auth0Error(
            status_code=404, error_code="inexistent_user", message="User does not exist"
        ),
    )
    mocker.patch("repositories.auth0.Auth0", return_value=auth0)

    non_existing_id = "auth0|2390nasgq23"
    response = client.get(f"{ENDPOINT}/{non_existing_id}")
    assert response.status_code == status.HTTP_404_NOT_FOUND, response.text

    # assert that the correct user_id is passed to the auth0 repository
    auth0.users.get.assert_called_with(non_existing_id)


def test_get_valid_user_found(client, mocker):
    # assert that a 200 is returned when a user_id is passed that exists

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

    response = client.get(f"{ENDPOINT}/{valid_user_id}")
    assert response.status_code == status.HTTP_200_OK, response.text

    # assert that the correct user_id is passed to the auth0 repository
    auth0.users.get.assert_called_with(valid_user_id)


def test_add_user_success(client, mocker):
    # test successfull creation of a user and sending of email
    email = "valid@hotmail.com"
    user_id = "auth0|1234"
    created_user = {
        "created_at": datetime.now(),
        "email": email,
        "email_verified": False,
        "user_id": user_id,
    }

    auth0 = MagicMock()
    auth0.users.create.return_value = created_user

    # mock the return ticket link
    ticket_link = "https://auth0.com"
    auth0.tickets.create_pswd_change.return_value = {"ticket": ticket_link}

    mocker.patch("repositories.auth0.Auth0", return_value=auth0)

    # mock the email service
    resend = mocker.patch("core.email.resend")
    mocker.patch("core.email.os")

    data = {"email": email}
    response = client.post(ENDPOINT, json=data)
    assert response.status_code == status.HTTP_201_CREATED
    assert response.json()["user_id"] == user_id

    assert resend.Emails.send.call_args.args[0]["to"][0] == email


def test_delete_user_success(client, mocker):
    # test successfull deletion of a user
    user_id = "auth0|1234"
    email = "mail@hotmail.com"
    user = {
        "created_at": datetime.now(),
        "email": email,
        "email_verified": False,
        "user_id": user_id,
    }

    auth0 = MagicMock()
    auth0.users.delete.return_value = None
    auth0.users.get.return_value = user
    mocker.patch("repositories.auth0.Auth0", return_value=auth0)
    response = client.delete(f"{ENDPOINT}/{user_id}")
    assert response.status_code == status.HTTP_204_NO_CONTENT, response.text
    # assert that the correct user_id is passed to the auth0 repository
    auth0.users.delete.assert_called_with(user_id)


def test_delete_user_not_found(client, mocker):
    # assert that a 404 is returned when a user_id is passed that does not exist
    auth0 = MagicMock()
    auth0.users.get.side_effect = (
        Auth0Error(
            status_code=404, error_code="inexistent_user", message="User does not exist"
        ),
    )
    mocker.patch("repositories.auth0.Auth0", return_value=auth0)

    non_existing_id = "auth0|2390nasgq23"
    response = client.delete(f"{ENDPOINT}/{non_existing_id}")
    assert response.status_code == status.HTTP_404_NOT_FOUND, response.text
