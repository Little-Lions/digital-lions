# Show active and non active teams

> Date created: Aug 15, 2024

By default, the API should return only active teams, because at some point we will have hundreds of teams, which are not relevant for the user on landing (it's about the active teams only).

The `GET /teams` returns, amon
```
[
  {
    "is_active": true,
    ...
    "program": {
      "id": 1,
      "name": "Program 1",
      "progress": {
        "current": 1,
        "total": 12
    }
  },
  ...
]
```
As described in [design of the workshop endpoint](02-workshop-endpoint.md), the status
of a team in the program is as follows:
- on team creation -> `program.progress.current = 0` and `is_active = true`.
- after workshop 1 -> `program.progress.current = 1` and `is_active = true`
- ...
- after workshop 12 -> `program.progress.current = 12` & `is_active = false`


## Q's for Stijn
- Should it be possible to **manually** deactivate a team?
- What to do with partially attending kids? Can teams or children opt out?
- What to do with the countries (this is major design decision that we should address before going live).


## API design to achieve the active and non active teams overview

> Note: below is in addition to the already existing `community_id` query parameter.

By default the endpoint will only return active. We'll add a query parameter to filter by active and non-active teams:

- query parameters on `GET /teams`: `status`
  - type: `enum string`
  - values: `active | non_active | all`
  - default: `active`

So the `GET /teams` endpoint can be invoked as follows:
- **Default behaviour**: To get only active teams (i.e. teams that have program.progress.current in range `[0, 11]`): `GET /teams?status=active`. 
- To get only non-active teams: `GET /teams?status=non_active`
- To get all teams (active and non-active (i.e. completed program)): `GET /teams?status=all`

