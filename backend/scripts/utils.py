"""Utility script to populate db with records."""

import logging
import os
import random
import sys
from functools import lru_cache

import click
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
# URL = "https://dev.api.littlelionschildcoaching.com/api/v1"

logger.info(f"API URL: {URL}")

fake = Faker(LOCALE)
Faker.seed(random.randint(0, 100))


@lru_cache
def get_token() -> str:
    logger.info("Getting Bearer token from authorization server")
    AUTH0_SERVER = os.environ.get("AUTH0_SERVER")
    r = requests.post(
        f"https://{AUTH0_SERVER}/oauth/token",
        headers={"content-type": "application/x-www-form-urlencoded"},
        data={
            "grant_type": "password",
            "client_id": os.environ.get("AUTH0_CLIENT_ID"),
            "client_secret": os.environ.get("AUTH0_CLIENT_SECRET"),
            "audience": os.environ.get("AUTH0_AUDIENCE"),
            "username": os.environ.get("USERNAME"),
            "password": os.environ.get("PASSWORD"),
        },
    )
    r.raise_for_status()
    return r.json().get("access_token")


def get_headers():
    return {"Authorization": "Bearer " + get_token()}


@click.group()
def cli():
    pass


@cli.command()
def wipe():
    """Wipe all records in database except the Implementing Partner."""
    # First get all implementing partners
    r = requests.get(
        f"{URL}/implementing_partners",
        headers=get_headers(),
    )
    r.raise_for_status()
    implementing_partners = r.json().get("data")
    logger.info(f"Found {len(implementing_partners)} implementing partners")

    # For each IP, first delete its communities
    for ip in implementing_partners:
        ip_id = ip.get("id")

        # Get all communities for this IP
        r = requests.get(
            f"{URL}/communities",
            params={"implementing_partner_id": ip_id},
            headers=get_headers(),
        )
        r.raise_for_status()
        communities = r.json().get("data")
        logger.info(f"Found {len(communities)} communities for IP {ip_id}")

        # Delete each community
        for community in communities:
            community_id = community.get("id")
            logger.info(f"Deleting community {community_id} from IP {ip_id}")
            r = requests.delete(
                f"{URL}/communities/{community_id}",
                params={"cascade": True},
                headers=get_headers(),
            )
            r.raise_for_status()

        # Now delete the implementing partner
        logger.info(f"Deleting implementing partner with ID {ip_id}")
        r = requests.delete(
            f"{URL}/implementing_partners/{ip_id}",
            params={"cascade": True},
            headers=get_headers(),
        )
        r.raise_for_status()


@cli.command()
@click.option("--communities", default=3)
@click.option("--children", default=3)
@click.option("--teams", default=3)
def populate(communities: int, children: int, teams: int):
    """Populate database with communities,
    teams, children, workshops."""

    # create IP
    logger.info("Creating implementing partner")
    r = requests.post(
        f"{URL}/implementing_partners",
        json={"name": "Little Lions"},
        headers=get_headers(),
    )
    r.raise_for_status()
    ip_id = r.json().get("data").get("id")

    # make user admin of IP such that he or she can get them
    # todo need to add implementing_partners:read:all permission
    logger.info("Getting user info from current user")
    r = requests.get(f"{URL}/users/me", headers=get_headers())
    r.raise_for_status()
    user_id = r.json().get("data").get("user_id")

    logger.info(f"Assigning Admin role to IP {ip_id} for user {user_id}")
    r = requests.post(
        f"{URL}/users/{user_id}/roles",
        json={"role": "Admin", "level": "Implementing Partner", "resource_id": ip_id},
        headers=get_headers(),
    )
    r.raise_for_status()

    logger.info(f"Adding {communities} communities to the db")

    for _ in range(communities):
        community = {"name": fake.first_name()}
        logger.info(f"Creating community {community['name']}")
        response = requests.post(
            f"{URL}/communities",
            params={"implementing_partner_id": ip_id},
            json=community,
            headers=get_headers(),
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
