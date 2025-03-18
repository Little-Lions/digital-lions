import pytest
from fastapi import status

ENDPOINT = "/teams"


def test_get_team_not_found(client):
    # assert that a 404 is raised when child is not found
    non_existing_id = 0
    response = client.get(f"{ENDPOINT}/{non_existing_id}")
    assert response.status_code == status.HTTP_404_NOT_FOUND, response.text


@pytest.fixture(name="client")
def client_with_communities(client, implementing_partner):
    # arrange two communities
    for i in range(2):
        r = client.post(
            "/communities",
            json={
                "name": f"Community {i}",
                "implementing_partner_id": implementing_partner["id"],
            },
        )
        r.raise_for_status()
    yield client


def test_post_team_success(client):
    # test successfull creation of a team
    team_1 = "Team 1"
    data = {"community_id": 1, "name": team_1}
    response = client.post(ENDPOINT, json=data)
    assert response.status_code == status.HTTP_201_CREATED
    id_ = response.json().get("data").get("id")

    # assert that team can be obtained
    response_get = client.get(f"{ENDPOINT}/{id_}")
    assert response_get.status_code == status.HTTP_200_OK
    assert response_get.json().get("data").get("name") == team_1
    assert response_get.json().get("data").get("is_active")


# TODO setup testing framework with current_user
# otherwise it will not return a community
# def test_get_team_filter_community(client):
#     # test that we can filter teams by community_id
#     team_1 = "Team 1"
#     data = {"community_id": 1, "name": team_1}
#     response = client.post(ENDPOINT, json=data)
#     assert response.status_code == status.HTTP_201_CREATED
#     team_2 = "Team 2"
#     data = {"community_id": 2, "name": team_2}
#     response = client.post(ENDPOINT, json=data)
#     assert response.status_code == status.HTTP_201_CREATED
#     response_get = client.get(f"{ENDPOINT}?community_id=1")
#     assert response_get.status_code == status.HTTP_200_OK
#     assert len(response_get.json()) == 1
#     assert response_get.json()[0].get("name") == team_1


def test_get_team_by_id(client):
    # test that we can get a team by id
    team_x = "Team X"
    data = {"community_id": 1, "name": team_x}
    response = client.post(ENDPOINT, json=data)
    assert response.status_code == status.HTTP_201_CREATED
    id_ = response.json().get("data").get("id")
    response_get = client.get(f"{ENDPOINT}/{id_}")
    assert response_get.json().get("data").get("name") == team_x


def test_delete_team_with_children(client):
    # test that we can't delete a team with children if cascade is not set
    team_x = "Team Y"
    data = {"community_id": 1, "name": team_x}
    response = client.post(ENDPOINT, json=data)
    assert response.status_code == status.HTTP_201_CREATED
    id_ = response.json().get("data").get("id")

    # add child to team
    child = {"first_name": "Child 1", "last_name": "Last name", "age": 10}
    client.post("/children", json={**child, "team_id": id_})

    # assert team cannot be deleted
    response_delete = client.delete(f"{ENDPOINT}/{id_}")
    assert response_delete.status_code == status.HTTP_409_CONFLICT, response_delete.text


def test_delete_team_with_children_cascade(client):
    # test that we can't delete a team with children if cascade is not set
    team_x = "Team Y"
    data = {"community_id": 1, "name": team_x}
    response = client.post(ENDPOINT, json=data)
    assert response.status_code == status.HTTP_201_CREATED
    id_ = response.json().get("data").get("id")

    # add child to team
    child = {"first_name": "Child 1", "last_name": "Last name", "age": 10}
    client.post("/children", json={**child, "team_id": id_})

    team = client.get(f"{ENDPOINT}/{id_}")
    assert team.status_code == status.HTTP_200_OK
    child_id_0 = team.json().get("data").get("children")[0].get("id")

    # assert team cannot be deleted
    response_delete = client.delete(f"{ENDPOINT}/{id_}", params={"cascade": True})
    assert response_delete.status_code == status.HTTP_200_OK, response_delete.text

    # assert that team and child have been deleted
    assert (
        client.get(f"/children/{child_id_0}").status_code == status.HTTP_404_NOT_FOUND
    )
    assert client.get(f"{ENDPOINT}/{id_}").status_code == status.HTTP_404_NOT_FOUND


@pytest.fixture(name="client_with_team")
def client_with_community_and_team(client):
    # arrange two communities
    teams = ["Team_1", "Team_2"]
    children = [
        {"first_name": "Child 1", "last_name": "Last name", "age": 10},
        {"first_name": "Child 2", "last_name": "Last name", "age": 12},
    ]

    client.post(
        "/communities",
        json={"name": "Community 1"},
    )
    # add teams
    for team in teams:
        r = client.post("/teams", json={"community_id": 1, "name": team})
        r.raise_for_status()
        id_ = r.json().get("data").get("id")
        # add children to team
        for child in children:
            client.post("/children", json={**child, "team_id": id_})
    yield client


def test_add_workshop_with_attendance(client_with_team):
    # test that we can add a workshop to a team
    team_id = 1
    attendance = [
        {"attendance": "present", "child_id": 1},
        {"attendance": "absent", "child_id": 2},
    ]
    payload = {
        "date": "2021-01-01",
        "workshop_number": 1,
        "attendance": attendance,
    }

    # assert that team progress is 0 at first
    response_team = client_with_team.get(f"{ENDPOINT}/{team_id}")
    assert (
        response_team.json().get("data").get("program").get("progress").get("current")
        == 0
    )

    response = client_with_team.post(f"{ENDPOINT}/{team_id}/workshops", json=payload)
    assert response.status_code == status.HTTP_201_CREATED, response.text

    # assert that team progress is updated
    response_team = client_with_team.get(f"{ENDPOINT}/{team_id}")
    assert (
        response_team.json().get("data").get("program").get("progress").get("current")
        == 1
    )

    response_workshop = client_with_team.get(f"{ENDPOINT}/{team_id}/workshops")
    assert response_workshop.json().get("data")[0].get("workshop").get("number") == 1


def test_update_workshop_attendance(client_with_team):
    # test that we can update the attendance of a workshop to a team
    team_id = 1
    attendance = [
        {"attendance": "present", "child_id": 1},
        {"attendance": "absent", "child_id": 2},
    ]
    payload = {
        "date": "2021-01-01",
        "workshop_number": 1,
        "attendance": attendance,
    }

    response = client_with_team.post(f"{ENDPOINT}/{team_id}/workshops", json=payload)
    assert response.status_code == status.HTTP_201_CREATED, response.text

    id_ = response.json().get("data").get("id")
    response_workshop = client_with_team.get(f"{ENDPOINT}/workshops/{id_}")
    response_workshop.raise_for_status()
    workshop = response_workshop.json().get("data")
    child_1_attendance = [a for a in workshop["attendance"] if a["child_id"] == 1][0]
    assert child_1_attendance["attendance"] == "present"

    # update workshop
    attendance = [
        {"attendance": "absent", "child_id": 1},
        {"attendance": "absent", "child_id": 2},
    ]
    payload = {
        "date": "2021-01-02",
        "workshop_number": 1,
        "attendance": attendance,
    }
    response_update = client_with_team.patch(
        f"{ENDPOINT}/workshops/{id_}", json=payload
    )
    assert response_update.status_code == status.HTTP_200_OK

    # check that it was updated correctly
    response_updated_workshop = client_with_team.get(f"{ENDPOINT}/workshops/{id_}")
    response_updated_workshop.raise_for_status()
    updated_workshop = response_updated_workshop.json().get("data")
    assert (
        updated_workshop["workshop"]["date"] == "2021-01-02"
    ), "Workshop date not update correctly"

    child_1_attendance = [
        a for a in updated_workshop["attendance"] if a["child_id"] == 1
    ][0]
    assert (
        child_1_attendance["attendance"] == "absent"
    ), "Workshop attendance not updated correctly"


def test_add_workshop_missing_child_id(client_with_team):
    # test that we get a bad request when we are missing children
    team_id = 1
    attendance = [{"attendance": "present", "child_id": 1}]
    response = client_with_team.post(
        f"{ENDPOINT}/{team_id}/workshops",
        json={
            "workshop_number": 1,
            "date": "2021-01-01",
            "attendance": attendance,
        },
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST, response.text


def test_add_workshop_incorrect_child_id(client_with_team):
    # test that we get a bad request when we have extra children
    team_id = 1
    attendance = [
        {"attendance": "present", "child_id": 1},
        {"attendance": "cancelled", "child_id": 2},
        {"attendance": "present", "child_id": 3},
    ]
    response = client_with_team.post(
        f"{ENDPOINT}/{team_id}/workshops",
        json={
            "date": "2021-01-01",
            "workshop_number": 1,
            "attendance": attendance,
        },
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST, response.text


def test_workshop_invalid_number(client_with_team):
    # assert that only a workshop can be added between 1 and 12
    team_id = 1
    attendance = [
        {"attendance": "present", "child_id": 1},
        {"attendance": "cancelled", "child_id": 2},
    ]
    response = client_with_team.post(
        f"{ENDPOINT}/{team_id}/workshops",
        json={
            "workshop_number": 0,
            "date": "2021-01-01",
            "attendance": attendance,
        },
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY, response.text


def test_workshop_already_exists(client_with_team):
    # given a workshop has been created with a number,
    # assert that the workshop cannot be created again
    team_id = 1
    attendance = [
        {"attendance": "present", "child_id": 1},
        {"attendance": "absent", "child_id": 2},
    ]
    payload = {
        "date": "2021-01-01",
        "workshop_number": 1,
        "attendance": attendance,
    }

    response = client_with_team.post(
        f"{ENDPOINT}/{team_id}/workshops",
        json=payload,
    )
    assert response.status_code == status.HTTP_201_CREATED, response.text
    response = client_with_team.post(
        f"{ENDPOINT}/{team_id}/workshops",
        json=payload,
    )
    assert response.status_code == status.HTTP_409_CONFLICT, response.text


def test_workshop_number_not_subsequent(client_with_team):
    # given a team has done a workshop, assert that the next workshop added
    # can only have the workshop number of the last + 1
    team_id = 1
    attendance = [
        {"attendance": "present", "child_id": 1},
        {"attendance": "absent", "child_id": 2},
    ]

    # create workshop number 1
    response = client_with_team.post(
        f"{ENDPOINT}/{team_id}/workshops",
        json={
            "date": "2021-01-01",
            "workshop_number": 1,
            "attendance": attendance,
        },
    )
    assert response.status_code == status.HTTP_201_CREATED, response.text

    # try to create workshop 3, which should fail
    response_post_second_workshop = client_with_team.post(
        f"{ENDPOINT}/{team_id}/workshops",
        json={
            "date": "2021-01-01",
            "workshop_number": 1 + 2,
            "attendance": attendance,
        },
    )
    assert (
        response_post_second_workshop.status_code == status.HTTP_400_BAD_REQUEST
    ), response_post_second_workshop.text


def test_team_non_active_after_completed_program(client_with_team):
    # given a team has completed all workshops, assert that the team is non-active
    team_id = 1
    attendance = [
        {"attendance": "present", "child_id": 1},
        {"attendance": "absent", "child_id": 2},
    ]
    team = client_with_team.get(f"{ENDPOINT}/{team_id}")
    current = team.json().get("data").get("program").get("progress").get("current")

    # assert that team is active at first
    assert team.json().get("data").get("is_active")

    # TODO the POST workshop endpoint does not do date validation
    # (chronologic order of date)
    # create all remaining workshops in program
    for i in range(current + 1, 13):
        response = client_with_team.post(
            f"{ENDPOINT}/{team_id}/workshops",
            json={
                "date": "2021-01-01",
                "workshop_number": i,
                "attendance": attendance,
            },
        )
        assert response.status_code == status.HTTP_201_CREATED, response.text

    # assert that team is non-active
    team = client_with_team.get(f"{ENDPOINT}/{team_id}")
    assert team.json().get("data").get("is_active") is False
