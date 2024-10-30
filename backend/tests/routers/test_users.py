import pytest
from fastapi import status

ENDPOINT = "/users"


@pytest.fixture
def mock_auth0_repository(mocker):
    pass


def test_get_user_not_found(client):
    # assert that a 404 is raised when user is not found
    non_existing_id = "2390nasgq23"
    response = client.get(f"{ENDPOINT}/{non_existing_id}")
    assert response.status_code == status.HTTP_404_NOT_FOUND, response.text


#
#
# @pytest.mark.parametrize(
#     "email_address,status_code",
#     [
#         ("invalid@email.", status.HTTP_422_UNPROCESSABLE_ENTITY),
#         ("", status.HTTP_422_UNPROCESSABLE_ENTITY),
#         ("nelson@mandela.com", status.HTTP_201_CREATED),
#     ],
# )
# def test_add_user_with_email(client, email_address, status_code):
#     # assert that a 422 is raised when user is added without password
#     data = {
#         "email_address": email_address,
#         "first_name": "Nelson",
#         "last_name": "Mandela",
#         "password": "password",
#     }
#     response = client.post(ENDPOINT, json=data)
#     assert response.status_code == status_code, response.text
#
#
# def test_add_user_success(client):
#     # test successfull creation of a user
#     data = {
#         "email_address": "valid@email.com",
#         "first_name": "Nelson",
#         "last_name": "Mandela",
#         "password": "password",
#     }
#     response = client.post(ENDPOINT, json=data)
#     assert response.status_code == status.HTTP_201_CREATED
#
#     id_ = response.json().get("id")
#     response_get = client.get(f"{ENDPOINT}/{id_}")
#     assert response_get.status_code == status.HTTP_200_OK
#     assert response_get.json().get("email_address") == data["email_address"]
