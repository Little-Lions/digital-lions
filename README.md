# :earth_africa: Digital Lions 

![Frontend Deployment](https://github.com/Little-Lions/digital-lions/actions/workflows/backend.yml/badge.svg)
![Backend Deployment](https://github.com/Little-Lions/digital-lions/actions/workflows/frontend.yml/badge.svg)

## Table of Contents
- [About](#-about)
- [System design](#-system-design)
- [Development](#-development)
- [Licence](#-licence)


## About

Digital Lions is the private web application that is part of [Little Lions Child Coaching](https://littlelionschildcoaching.com/). Little Lion's Child Coaching is a Cape Town based NGO that provides workshops in social and emotional skills for children in the townships of Africa. The workshops are given in a 12-week program. This application is designed to help the coaches, volunteers, and administrators to keep track of the children, teams, and workshops. 

  > Maintainers: X & Y


## System design

Design decisions, architecture diagrams, and other relevant design information can be found in the [architecture](architecture) folder. A status overview of the backend endpoints can be found in the [development status](architecture/README.md) table.
The application is a classic web application consisting of three main components:
- [Frontend in React](frontend)
- [Backend in Python FastAPI](backend)
- [PostgresDB](architecture/decisions/00-inital-concept.md)


## Development

All components are dockerized and available in development locally with docker compose. 

### Environment

This project uses [direnv](https://direnv.net/) to setup environment variables. First copy `.env.dist` to `.env`. After that spin up the postgresDB (and optionally pgadmin if you want to inspect the database from the browser).

### Build
```bash
docker compose up -d db pgadmin
```
After that spin up the backend (either detached or in separate window):
```bash
docker compose up backend
```
The backend API should now be available at `http://localhost:8000/api/v1/docs#/`. Finally spin up the frontend (either detached or in separate window):
```bash
docker compose up frontend
```
The frontend should now be available at `http://localhost:5173`.


## Licence

To be added.
