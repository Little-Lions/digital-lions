# Environment setup

> Date created: Sun 6 Oct, 2024

There will be three environments: `dev`, `staging` and `prod`. Each environment will have its own database, backend and frontend. Staging is basically a copy of prod, but with dummy data and a different database. The characteristics of each environment are described below.

|                                         | **Dev**             | **Staging**            | **Prod**        |
|-----------------------------------------|---------------------|------------------------|-----------------|
| Abbreviation                            | `dev`               | `stg`                  | `prd`           |
| CNAME                                   | None                | `staging.digitallions` | `digitallions`  |
| `API-Key` required for backend          | no                  | yes                    | yes             |
| Bearer Authentication required          | no                  | yes                    | yes             |
| CORS allowed origins includes localhost | yes                 | no                     | no              |
| Database TCP proxy disabled             | no                  | yes                    | yes             |
| FastAPI backend headless served         | no                  | yes                    | yes             |
| Deployed from                           | any branch, locally | `develop`              | `main`          |
| Deployed with                           | Railway CLI         | Github Workflow        | Github Workflow |
