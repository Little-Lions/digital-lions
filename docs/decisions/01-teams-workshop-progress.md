# ADR 1: Teams and workshops

> Date: July 20th, 2024

Each team in the app follows a program of workshops. For each workshop we keep track of the attendance of the children in the team. 
For V1 there will be only one, fixed program, consisting of Workshop 1 to 12. For each workshop the attendance is submitted. The idea is that 
the frontend will show the progress of the team in the program on a dedicated team page using a vertical progress bar:

<img src="../img/team-progress.png" width="60%">

## Tracking the status of a team

The status of the team in the program is included in the response of the `GET /teams/:teamId` endpoint:
```
{
  "is_active": true,
  "last_updated_at": "2024-07-07T06:19:15.624253",
  "created_at": "2024-07-07T06:19:15.624261",
  "name": "Team Siyabonga",
  "id": 1,
  "children": [
    {
      "first_name": "Zibuyile",
      "last_name": "Bhensela",
      "id": 1
    }
  ],
  "community": {
    "name": "Nokulunga",
    "id": 3
  },
  "progress": {
    "workshop": 0,
  }
}
```
Here the `progress` object indicates the status of the team in the program. `progress.workshop` is the number of the last workshop that has been attended. I.e.:
- `progress.workshop = 0` means the program hasn't started yet.
- `progress.workshop = 1` means the team has completed Workshop 1. 
- `progress.workshop = 12` means the team has completed all workshops. 

> Note: in the future the program will have possibly have a variable length of number of workshops, this is out of scope for V1.

## Adding workshops to a team

Once a team has been created we want to add a workshop with attendance. This is done on the `POST /teams/:teamId/workshops` endpoint, with the following payload:
```
{
  "date": "2024-07-30",
  "workshop_number": 1,
  "attendance": [
    {
      "attendance": "present",
      "child_id": 1
    }
  ]
```
The response is a workshop ID. The following validations are done on the payload.
- `workshop_number` is a number in the range `[1, 12]`.
- `workshop_number` needs to be valid, i.e. once a workshop with number `n` has been created, it can't be created again **and** the next `workshop_number` must be `n+1`.
- `attenances` should contain all the `child_id`'s of the team. These ID's can be obtained from the `GET /teams/:teamId` endpoint.
- `date` should be a valid date in the format `YYYY-MM-DD`, and cannot be a date that falls before the date of the workshop that was created lats.

## Getting workshops of a team.

The attendance of a team in a workshop can be retrieved with the `GET /teams/:teamId/workshops` endpoint, which will return
```
[
  {
    "date": "2024-07-30",
    "workshop_number": 1,  # the number of the workshop in the program (1 to 12)
    "workshop_id": 234,  # the unique workshop ID reference in the database
    "attendance": [
      {
        "attendance": "present",
        "child_id": 1
        "first_name": "Zibuyile",
        "last_name": "Bhensela"
      }
    ]
  }
]
```
