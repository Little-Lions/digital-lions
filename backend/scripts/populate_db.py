"""Utility script to populate db with records."""

import logging
import random
import sys

import requests
from faker import Faker

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

handler = logging.StreamHandler(sys.stdout)
handler.setLevel(logging.DEBUG)
formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
handler.setFormatter(formatter)
logger.addHandler(handler)

LOCALE = "zu_ZA"
URL = "http://localhost:8000/api/v1"
COMMUNITY_COUNT = 3
TEAM_COUNT = 3
CHILD_COUNT = 3

fake = Faker(LOCALE)
Faker.seed(9)

if __name__ == "__main__":
    """Populate db with records, to be converted to integration test."""

    logger.info(f"Adding {COMMUNITY_COUNT} communities to the db")

    for _ in range(COMMUNITY_COUNT):
        community = {"name": fake.first_name()}
        logger.info(f"Creating community {community['name']}")
        response = requests.post(f"{URL}/communities", json=community)
        logger.info(response.json())
        response.raise_for_status()
        logger.info(
            f"Community {community['name']} created with id {response.json()['id']}"
        )

    community_ids = [r["id"] for r in requests.get(f"{URL}/communities").json()]

    logger.info(f"Adding {TEAM_COUNT} teams to the db")
    for _ in range(TEAM_COUNT):
        team = {
            "name": f"Team {fake.first_name()}",
            "community_id": random.choice(community_ids),
            "children": [
                {
                    "first_name": fake.first_name(),
                    "last_name": fake.last_name(),
                    "gender": random.choice(["male", "female", None]),
                    **random.choice(
                        [
                            {"age": random.choice([random.randint(5, 18), None])},
                            {
                                "dob": f"{random.randint(2000, 2020)}-{random.randint(10, 12)}-{random.randint(10, 30)}"
                            },
                        ],
                    ),
                }
                for _ in range(CHILD_COUNT)
            ],
        }
        logger.info(f"Creating team {team}")
        try:
            response = requests.post(f"{URL}/teams", json=team)
            response.raise_for_status()
        except requests.exceptions.HTTPError as exc:
            logger.error(f"Error creating team: {response.text}")

    """
    Add workshops to teams.
    """
    attendances = ["present", "absent", "cancelled"]

    # for each team add some workshops
    logger.info("Adding workshops to teams")
    team_ids = [x["id"] for x in requests.get(f"{URL}/teams").json()]

    for id_ in team_ids:
        logger.info(f"Getting team info for team {id_}")
        team = requests.get(f"{URL}/teams/{id_}").json()
        children = team["children"]

        workshops = random.randint(3, 9)
        logger.info(f"Adding {workshops} workshops to team {id_}")
        for n in range(1, workshops):
            logger.info(f"Adding workshop {n} to team {id_}")
            requests.post(
                f"{URL}/teams/{id_}/workshops",
                json={
                    "workshop_number": n,
                    "date": f"2021-10-0{n}",
                    "attendance": [
                        {
                            "child_id": child["id"],
                            "attendance": random.choice(attendances),
                        }
                        for child in children
                    ],
                },
            )
