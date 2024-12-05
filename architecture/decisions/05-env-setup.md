# Environment setup

> Created at: Sun 6 Oct, 2024  
> Last updated at: Thu 5 Dec, 2024 

Digital Lions works on two environments: `dev` and `production`. For the sake of simplicity we will not use a staging environment until we have a need for it. Each environment will have its own database, backend and frontend, and Auth0 tenant.

The root domain of Little Lions (the static Wordpress website) is `littlelionschildcoaching.com`. The "root" subdomain for Digital Lions is `digitallions.littlelionschildcoaching.com`. This is the root domain for all subdomains listed below. 

|                                         | **Dev**                 | **Production**            |
|-----------------------------------------|-------------------------|---------------------|
| Environment name                        | `dev`                   | `production`        |
| Frontend custom domain                  | `dev.digitallions`      | `digitallions`      |
| Backend custom domain                   | `api.dev.digitallions`  | `api.digitallions`* |
| Auth0 custom domain                     | `auth.dev.digitallions` | `auth.digitallions` |
| `API-Key` required for backend          | no                      | yes                 |
| Bearer Authentication required          | yes                     | yes                 |
| CORS allowed origins includes localhost | yes                     | no                  |
| Database TCP proxy disabled             | no                      | yes                 |
| *Public networking disabled for API     | no                      | yes                 |
| FastAPI backend headless served         | no                      | yes                 |
| Deployed from                           | any branch, locally     | `main`              |
| Deployed with                           | Railway CLI             | Github Workflow     |
