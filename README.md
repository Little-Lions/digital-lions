# :earth_africa: Digital Lions

![Frontend Deployment](https://github.com/Little-Lions/digital-lions/actions/workflows/backend.yml/badge.svg)
![Backend Deployment](https://github.com/Little-Lions/digital-lions/actions/workflows/frontend.yml/badge.svg)

## Table of Contents

- [About](#about)
- [System design](#system-design)
- [Development](#development)
  - [Environment](#environment)
  - [Database and mgirations](#database-and-migrations)
  - [Backend](#backend)
  - [Frontend](#frontend)

## About

Digital Lions is the private web application that is part of [Little Lions Child Coaching](https://littlelionschildcoaching.com/). Little Lion's Child Coaching is a Cape Town based NGO that provides workshops in social and emotional skills for children in the townships of Africa. The workshops are given in a 12-week program. This application is designed to help the coaches, volunteers, and administrators to keep track of the children, teams, and workshops.

> Maintainers  
>  [anne@littlelionschildcoaching.com](mailto:anne@littlelionschildcoaching.com)  
>  [kasper@littlelionschildcoaching.com](mailto:kasper@littlelionschildcoaching.com)

## System design

Design decisions, architecture diagrams, and other relevant design information can be found in the [docs](docs) folder. A status overview of the backend endpoints can be found in the [development status](docs/README.md) table.
The application is a classic web application consisting of three main components:

- [Frontend in React](frontend)
- [Backend in Python FastAPI](backend)
- [PostgresDB](architecture/decisions/00-inital-concept.md)

## Development

All components are dockerized and available in development locally with docker compose.

### Environment

#### Prerequisites

This project uses [direnv](https://direnv.net/) to auto (re)-load environment variables. First copy `.env.dist` to `.env` and populate with the required values. After that you can build and run the services required the run the app.

> :warning: Once you have installed `direnv` you need to **[allow](https://direnv.net/#quick-demo)** it to load your `.env` in all relevant dirs: the root of the repo, `backend`, and `frontend`. Otherwise the environment variables are not properly loaded.

#### Setup

The order of getting yourself up to speed is

1. Spin a Postgres container with a database.
2. Run migrations to get the correct schema.
3. Run the backend.
4. (Optional) populate the database with a utility script.
5. Run the frontend to interact with the app.

Below is a walkthrough per component.

### Database and migrations

Run a Postgres container with

```bash
docker compose up -d db pgadmin
```

This will run a Postgres container with an empty database `digitallions`, and a pgadmin client to visually inspect the database.

#### pgadmin

For connecting to the database with pgadmin, the credentials can be found in the `docker-compose.yml`. Since you run pgadmin from within Docker you need obtain the IP of the container to connect to the database. You can find the IP with:

```bash
make db.ip
```

#### Migrations

Database migrations are handled with [alembic](https://alembic.sqlalchemy.org/en/latest/). Migrations are run as part of the backend Docker container. If you do not run the backend with Docker the first time, you need to manually run database migration with Poetry / Alembic. From within the `backend` folder run

```
poetry run alembic upgrade head
```

You will now see the set of tables (attendances, children, communities, ...) required for running the application in your database client (e.g. pgadmin). There exist utility scripts to populate the database programmatically, see [populate](#populate-the-database) (for this you first need to have the API running).

### Run the application

Frontend and backend can be build and run with Docker as well,

```bash
docker compose up frontend backend
```

though for development it makes sense to run both services in development mode with hot reloading.

### Backend

To run the backend API with Poetry and hot reloading:

```bash
cd backend && make app
```

The interactive Swagger docs of the backend API should now be available at `http://localhost:8000/api/v1/docs#/`.

#### Populate the database

There are utility scripts to populate the database with records in a programmatic way. From the backend folder simply run

```
make scripts.populate
```

to populate the database with a few fake records. Subsequently wipe the database content with

```
make scripts.wipe
```

### Frontend

```bash
cd frontend && npm run dev
```

The frontend should now be available at `http://localhost:5173`.

### Authorization & authentication

You can disable `API-Key` and `Bearer token` authorization with feature flags in the `.env` file. Once you have successfully populated your `.env` with the right client credentials, you can manually obtain a Bearer token from the authorization server with user credentials using

```bash

make token USERNAME=<email> PASSWORD=<your-password>
```

This will provide you a JWT, **copies it to your clipboard**, and prints the decoded token to your terminal output. If you are running the backend API with `FEATURE_AUTH0=true`, you need to pass this token as Bearer token when you want to make request via the Swagger docs.
