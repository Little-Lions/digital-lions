"""Utility script to populate db with records."""

import logging
import random
import sys
import click
import os

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
URL = "https://dev.api.littlelionschildcoaching.com/api/v1"

fake = Faker(LOCALE)
Faker.seed(random.randint(0, 100))


def get_headers():
    return {"Authorization": "Bearer " + os.environ["BEARER"]}


@click.group()
def cli():
    pass


@cli.command()
def wipe():
    """Wipe all records in database except the Implementing Partner."""
    r = requests.get(
        f"{URL}/communities",
        params={"implementing_partner_id": 1},
        headers=get_headers(),
    )
    r.raise_for_status()

    communities = r.json().get("data")

    logger.info(f"Found {len(communities)} implementing partners")
    for community in communities:
        id_ = community.get("id")

        logger.info(f"Deleting community with ID {id_}")
        r_ = requests.delete(
            f"{URL}/communities/{id_}",
            params={"cascade": True},
            headers=get_headers(),
        )
        r_.raise_for_status()


@cli.command()
@click.option("--communities", default=3)
@click.option("--children", default=3)
@click.option("--teams", default=3)
def populate(communities: int, children: int, teams: int):
    """Populate database with communities,
    teams, children, workshops."""

    # default ipmleenting partner ID
    ip_id = 1

    logger.info(f"Adding {communities} communities to the db")

    for _ in range(communities):
        community = {"name": fake.first_name(), "implementing_partner_id": ip_id}
        logger.info(f"Creating community {community['name']}")
        response = requests.post(
            f"{URL}/communities", json=community, headers=get_headers()
        )
        logger.info(response.json())
        response.raise_for_status()
        logger.info(
            f"Community {community['name']} created with id {response.json().get('data').get('id')}"
        )

    community_ids = [
        r["id"]
        for r in requests.get(
            f"{URL}/communities",
            headers=get_headers(),
            params={"implementing_partner_id": ip_id},
        )
        .json()
        .get("data")
    ]

    logger.info(f"Adding {teams} teams to the db")
    for _ in range(teams):
        team = {
            "name": f"Team {fake.first_name()}",
            "community_id": random.choice(community_ids),
        }
        logger.info(f"Creating team {team}")
        try:
            response = requests.post(f"{URL}/teams", json=team, headers=get_headers())
            response.raise_for_status()
            id_ = response.json().get("data").get("id")
        except requests.exceptions.HTTPError as exc:
            logger.error(f"Error creating team: {exc}, {response.text}")

        for _ in range(children):
            child = {
                "team_id": id_,
                "first_name": fake.first_name(),
                "last_name": fake.last_name(),
                "gender": random.choice(["male", "female", None]),
                "age": random.choice([random.randint(5, 18), None]),
            }

            logger.info(f"Adding child {child} to team {id_}")
            r = requests.post(f"{URL}/children", json=child, headers=get_headers())
            r.raise_for_status()

    # Add workshops to teams.
    attendances = ["present", "absent", "cancelled"]

    # for each team add some workshops
    logger.info("Adding workshops to teams")
    team_ids = [
        x["id"]
        for x in requests.get(f"{URL}/teams", headers=get_headers()).json().get("data")
    ]

    for id_ in team_ids:
        logger.info(f"Getting team info for team {id_}")
        team = (
            requests.get(f"{URL}/teams/{id_}", headers=get_headers()).json().get("data")
        )
        children = team["children"]

        workshops = random.randint(3, 9)
        logger.info(f"Adding {workshops} workshops to team {id_}")
        for n in range(1, workshops):
            logger.info(f"Adding workshop {n} to team {id_}")
            requests.post(
                f"{URL}/teams/{id_}/workshops",
                headers=get_headers(),
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


if __name__ == "__main__":
    """Utility commands for creating, deleting records."""
    cli()
