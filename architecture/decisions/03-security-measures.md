# Security measures

> Date created: Aug 8th, 2024
> Last modified: Dec 12, 2024


This document outlines the security measures that are or will be implemented in the system, to ensure the safety of the data and the system itself.

## General & codebase

- [x] No sensitive data is stored hardcoded in the codebase.
- [ ] All dependencies are kept up-to-date using a dependency management tool (e.g. [Dependabot](https://github.com/dependabot)).

## Authentication & Authorization

- [x] No plain passwords are stored in the database. Instead, we store the hash of the password and the [salt](https://auth0.com/blog/adding-salt-to-hashing-a-better-way-to-store-passwords/) used to generate the hash. Passwords can be reset via email links.
- [x] The database will require a strong password to access it.
  - [ ] This password will be rotated every X months.
- [x] All backend endpoints require a static API key (`API-Key`) to be included in the header of the request. 
  - [x] Replaced by OAuth in Dec 2024. Notes: endpoints that do no require user scopes will require tokens via client credential authorization flow.
- [x] All user specific endpoints require a [Json Web Token (JWT)](https://blog.logrocket.com/secure-rest-api-jwt-authentication/) token to be included in the header of the request. This JWT can be obtained by logging in on the `POST /users/session` endpoint. Actual implementation (Oct 6, 2024): Auth0.
- [x] All endpoints require user scopes.
  - [x] The JWT token will expire after X minutes. 

## Networking

- [x] The database will reside in virtual network of the backend and thus be network-isolated. Implementation: in Railway this is by design the case, unless a TCP proxy is set up. For prod and staging the TCP proxy will be disabled, only on dev it will be enabled and will the database thus be available to the public internet.
- [x] The backend will use [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) to only allow requests from the frontend origin.


