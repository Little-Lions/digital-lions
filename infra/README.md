# Infra

Digital Lions runs on servers hosted by Hetzner Cloud. Deployments are done from a self-hosted (also on Hetzner) [Coolify](https://coolify.io/) instance, and triggered from within Github CI (`dev` and `main`).

## Server setup

The servers are deployed manually in a private network. For security each server should be deployed with the `cloud_config.yaml` as cloud configuration that can be linked to from within Hetzner when deploying a server. With this config the servers are setup in a way that they pass basic security checks like having a non-root sudo user, using UFW security, ssh, fail2ban, ports, etc. See [Hetzner basic cloud config](https://community.hetzner.com/tutorials/basic-cloud-config) for more info.
