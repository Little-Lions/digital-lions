# Attendance page

> Date: Aug 2nd, 2024

## Current 
On landing 

`GET /teams/{id}/workshops`
```
[
  {
    "date": "2021-01-01",
    "workshop_number": 1,
    "workshop_id": 1000,
    "attendance": [
      {
        "attendance": "present",
        "child_id": 1,
        "first_name": "Nelson",
        "last_name": "Mandela"
      }
    ]
  }
]
```

This is too much because we don't need the attenadance of all children to all workshops on landing, only the status of the team and the workshop info.

## Future state

### On landingH

General call for team info + children (for submiting a new workshop).
`GET /teams/{id}`
- children info (which children, first name, last name, id)
- status of team in progress



```
{
  "is_active": true,
  "last_updated_at": "2024-08-02T08:31:04.816Z",
  "created_at": "2024-08-02T08:31:04.816Z",
  "id": 1,
  "name": "The A-Team",
  "community": {
    "id": 1,
    "name": "Khayelitsha"
  },
  "children": [
    {
      "id": 1,
      "first_name": "Nelson",
      "last_name": "Mandela"
    }
  ],
  "program": {
    "id": 1,
    "name": "Program 1",
    "progress": {
      "current": 1,
      "total": 12
  }
}
```


Info for populating vertical stepper

`GET /teams/{id}/workshops`

```

[
  {
    "workshop": {
      "name": "Workshop 1",
      "id": 1000,       # unique workshop in database
      "number": 1,      # workshop number in program ([1, 12]) 
      "date": "2021-01-01",
    }
    "attendance": {
      "present": 6,
      "cancelled": 1,
      "absent": 3,
      "total": 10
    }
  }
]
```

#### On collapse of completed workshops (clickable)

Get detailed info on workshop

Either:
- `GET /teams/{id}/workshops/{workshop_number}`, where `workshop_number` is a value in range `[1, 12]`, or
- `GET /workshops/{workshop_id}`
```
  {
    "workshop": {
      "name": "Workshop 1",
      "id": 1000,       # unique workshop in database
      "number": 1,      # workshop number in program ([1, 12]) 
      "date": "2021-01-01",
    }
    "attendance": [
      {
        "attendance": "present",
        "child_id": 1,
        "first_name": "Nelson",
        "last_name": "Mandela"
      },
      ...
    ]
  }
```




