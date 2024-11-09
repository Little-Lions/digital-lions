# :earth_africa: Digital Lions 

![Frontend Deployment](https://github.com/Little-Lions/digital-lions/actions/workflows/backend.yml/badge.svg)
![Backend Deployment](https://github.com/Little-Lions/digital-lions/actions/workflows/frontend.yml/badge.svg)

## Table of Contents
- [About](#about)
- [System design](#system-design)
- [Development](#development)


## About

Digital Lions is the private web application that is part of [Little Lions Child Coaching](https://littlelionschildcoaching.com/). Little Lion's Child Coaching is a Cape Town based NGO that provides workshops in social and emotional skills for children in the townships of Africa. The workshops are given in a 12-week program. This application is designed to help the coaches, volunteers, and administrators to keep track of the children, teams, and workshops. 

> Maintainers  
  [anne@littlelionschildcoaching.com](mailto:anne@littlelionschildcoaching.com)    
  [kasper@littlelionschildcoaching.com](mailto:kasper@littlelionschildcoaching.com)


## System design

Design decisions, architecture diagrams, and other relevant design information can be found in the [architecture](architecture) folder. A status overview of the backend endpoints can be found in the [development status](architecture/README.md) table.
The application is a classic web application consisting of three main components:
- [Frontend in React](frontend)
- [Backend in Python FastAPI](backend)
- [PostgresDB](architecture/decisions/00-inital-concept.md)


## Development

All components are dockerized and available in development locally with docker compose. 

### Environment

This project uses [direnv](https://direnv.net/) to setup environment variables. First copy `.env.dist` to `.env` and populate with the required values. After that you can build and run the services required the run the app. For the database (and optionally pgadmin):
```bash
docker compose up -d db pgadmin
```
For connecting to the database with pgadmin, the credentials can be found in the `docker-compose.yml`. Since you run pgadmin from within Docker you need obtain the IP of the container to connect to the database. You can find the IP with:
```bash
make db.ip
```
Frontend and backend can be build and run with Docker as well, 
```bash
docker compose up frontend backend
```
though for development it makes sense to run both services in development mode with hot reloading.

### Frontend
```bash
cd frontend && npm run dev
```
The frontend should now be available at `http://localhost:5173`.

### Backend

To run the backend API with Poetry and hot reloading:
```bash
cd backend && make app
```
The backend API should now be available at `http://localhost:8000/api/v1/docs#/`.

### Authorization & authentication

You can disable `API-Key` and `Bearer token` authorization with feature flags in the `.env` file. Once you have successfully populated your `.env` with the right client credentials, you can manually obtain a Bearer token from the authorization server with user credentials using
```bash
make token USERNAME=<email> PASSWORD=<your-password>
```
This will provide you a JWT and decode it, such that permissions are visible too.
