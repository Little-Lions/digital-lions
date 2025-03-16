import pytest
from fastapi import status

ENDPOINT = "/children"


def test_get_child_not_found(client):
    # assert that a 404 is raised when child is not found
    non_existing_id = 0
    response = client.get(f"{ENDPOINT}/{non_existing_id}")
    assert response.status_code == status.HTTP_404_NOT_FOUND, response.text


def test_post_child_non_existing_team(client):
    # assert that we can't create a child for a non-existing team
    data = {"first_name": "Firstname", "last_name": "Lastname", "team_id": 0}
    response = client.post(ENDPOINT, json=data)
    assert response.status_code == status.HTTP_400_BAD_REQUEST, response.text


@pytest.fixture(name="client")
def client_with_community_and_team(client, implementing_partner):
    # arrange a community with a team without children
    client.post(
        "/communities",
        json={
            "name": "Community 1",
            "implementing_partner_id": implementing_partner["id"],
        },
    )
    client.post(
        "/teams",
        json={"name": "Team 1", "community_id": 1, "children": []},
    )
    return client


def test_post_child_success(client):
    # test successfull creation of a child
    child_name = "Firstname"
    data = {"first_name": child_name, "last_name": "Lastname", "team_id": 1}
    response = client.post(ENDPOINT, json=data)
    assert response.status_code == status.HTTP_201_CREATED, response.text
    id_ = response.json().get("data").get("id")

    # test that child can be obtained
    response_get = client.get(f"{ENDPOINT}/{id_}")
    assert response_get.status_code == status.HTTP_200_OK, response_get.text
    assert response_get.json().get("data").get("first_name") == child_name


def test_update_child_success(client):
    # test updating a child
    data = {
        "first_name": "Firstname",
        "last_name": "Lastname",
        "team_id": 1,
        "age": 10,
    }
    response = client.post(ENDPOINT, json=data)
    assert response.status_code == status.HTTP_201_CREATED
    id_ = response.json().get("data").get("id")

    update_data = {"is_active": False, "last_name": "New Lastname"}
    response_patch = client.patch(f"{ENDPOINT}/{id_}", json=update_data)
    assert response_patch.status_code == status.HTTP_200_OK, response_patch.text

    # assert that first name still same, but last name updated
    response_json = response_patch.json().get("data")

    assert response_json.get("first_name") == "Firstname"
    assert response_json.get("last_name") == "New Lastname"
    assert not response_json.get("is_active")
    assert response_json.get("last_updated_at") != response_json.get("created_at")
