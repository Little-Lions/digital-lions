# Environment setup

> Created at: Sun 6 Oct, 2024  
> Last updated at: Thu 23 Jan, 2025

Digital Lions works on two environments: `dev` and `production`. For the sake of simplicity we will not use a staging environment until we have a need for it. Each environment will have its own database, backend and frontend, and Auth0 tenant.

The root domain of Little Lions (the static Wordpress website) is `littlelionschildcoaching.com`. The "root" subdomain for Digital Lions is `app.littlelionschildcoaching.com`. 

|                                         | **Dev**                                              | **Prod**                                         |
|-----------------------------------------|------------------------------------------------------|--------------------------------------------------|
| Environment name                        | `dev`                                                | `production`                                     |
| Frontend custom domain                  | `dev.app.littlelionschildcoaching.com`      | `app.littlelionschildcoaching.com`      |
| Backend custom domain                   | `dev.api.littlelionschildcoaching.com`  | `api.littlelionschildcoaching.com`* |
| Auth0 custom domain                     | `dev.auth.littlelionschildcoaching.com` | `auth.digitallions.littlelionschildcoaching.com` |
| Bearer Authentication required          | yes                                                  | yes                                              |
| CORS allowed origins includes localhost | yes                                                  | no                                               |
| Database publicly exposed               | no                                                   | yes                                              |
| API publicly exposed                    | yes| no |
| FastAPI backend headless served         | no                                                   | yes                                              |
| Deployed from                           | any branch, locally                                  | `main`                                           |
| Deployed with                           | Coolify CLI                                          | Github Workflow                                  |
