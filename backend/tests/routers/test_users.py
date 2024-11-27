from unittest.mock import MagicMock

import pytest
from auth0.exceptions import Auth0Error
from fastapi import status

ENDPOINT = "/users"
USER_ID = "auth0|1234"
NON_EXISITNG_ID = "auth0|2390nasgq23"
EMAIL = "email@hotmail.com"
VALID_USER = {
    "user_id": USER_ID,
    "email": EMAIL,
    "email_verified": None,
    "created_at": None,
}


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

    response = client.get(f"{ENDPOINT}/{NON_EXISITNG_ID}")
    assert response.status_code == status.HTTP_404_NOT_FOUND, response.text

    # assert that the correct user_id is passed to the auth0 repository
    auth0.users.get.assert_called_with(NON_EXISITNG_ID)


def test_get_valid_user_found(client, mocker):
    # assert that a 200 is returned when a user_id is passed that exists
    auth0 = MagicMock()
    auth0.users.get.return_value = VALID_USER
    mocker.patch("repositories.auth0.Auth0", return_value=auth0)

    response = client.get(f"{ENDPOINT}/{USER_ID}")
    assert response.status_code == status.HTTP_200_OK, response.text

    # assert that the correct user_id is passed to the auth0 repository
    auth0.users.get.assert_called_with(USER_ID)


def test_add_user_success(client, mocker):
    # test successfull creation of a user and sending of email
    auth0 = MagicMock()
    auth0.users.create.return_value = VALID_USER

    # mock the return ticket link
    ticket_link = "https://auth0.com"
    auth0.tickets.create_pswd_change.return_value = {"ticket": ticket_link}

    mocker.patch("repositories.auth0.Auth0", return_value=auth0)
    resend = mocker.patch("core.email.resend")
    mocker.patch("core.email.os")

    # act
    response = client.post(ENDPOINT, json={"email": EMAIL})

    # assert
    assert response.status_code == status.HTTP_201_CREATED
    assert response.json()["user_id"] == USER_ID

    assert resend.Emails.send.call_args.args[0]["to"][0] == EMAIL


def test_add_user_duplicate(client, mocker):
    # test that we can't create the same user twice
    auth0 = MagicMock()
    auth0.users.create.return_value = VALID_USER
    mocker.patch("repositories.auth0.Auth0", return_value=auth0)

    # mock the return ticket link
    mocker.patch("services.user.UserService._send_invite_by_email", return_value="msg")

    response = client.post(ENDPOINT, json={"email": EMAIL})
    assert response.status_code == status.HTTP_201_CREATED

    # second time should fail
    auth0 = MagicMock()
    auth0.users.create.side_effect = (
        Auth0Error(
            status_code=409,
            error_code="existent_user",
            message="User email already exists",
        ),
    )
    mocker.patch("repositories.auth0.Auth0", return_value=auth0)
    response = client.post(ENDPOINT, json={"email": EMAIL})
    assert response.status_code == status.HTTP_409_CONFLICT, response.text


def test_delete_user_success(client, mocker):
    # arrange
    auth0 = MagicMock()
    auth0.users.delete.return_value = None
    auth0.users.get.return_value = VALID_USER
    mocker.patch("repositories.auth0.Auth0", return_value=auth0)

    # act
    response = client.delete(f"{ENDPOINT}/{USER_ID}")

    # assert that the correct user_id is passed to the auth0 repository
    assert response.status_code == status.HTTP_204_NO_CONTENT, response.text
    auth0.users.delete.assert_called_with(USER_ID)


def test_delete_user_not_found(client, mocker):
    # assert that a 404 is returned when a user_id is passed that does not exist
    auth0 = MagicMock()
    auth0.users.get.side_effect = (
        Auth0Error(
            status_code=404, error_code="inexistent_user", message="User does not exist"
        ),
    )
    mocker.patch("repositories.auth0.Auth0", return_value=auth0)

    response = client.delete(f"{ENDPOINT}/{NON_EXISITNG_ID}")
    assert response.status_code == status.HTTP_404_NOT_FOUND, response.text
