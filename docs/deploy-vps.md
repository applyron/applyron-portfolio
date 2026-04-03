# Applyron Server Deployment

This repository is prepared for Docker-based production deployment on Applyron Server.

## Runtime Model

- The app runs as a `Next.js 16` container plus a Redis sidecar
- Internal container port is fixed at `3000`
- Public traffic is expected to come through `Nginx` reverse proxy
- Runtime state is not stateless and must live on persistent host paths

## Required Production Files

The repository now ships with:

- `Dockerfile`
- `.dockerignore`
- `docker-compose.prod.yml`
- `/api/health` health endpoint

On the server, you should provide a real `.env.production` file next to `docker-compose.prod.yml`.

## Required Environment Variables

Copy `.env.example` to `.env.production` and set the values for your server.

Required values:

- `APP_PORT`
- `APP_PUBLIC_URL` (optional but recommended)
- `REDIS_URL`
- `ADMIN_JWT_SECRET` or `ADMIN_JWT_SECRET_FILE`
- `APP_DATA_DIR`
- `APP_UPLOADS_DIR`
- `ADMIN_SETUP_ENABLED` (optional, can stay empty)

Example:

```env
APP_PORT=3000
APP_PUBLIC_URL=https://your-domain.com
REDIS_URL=redis://redis:6379/0
ADMIN_JWT_SECRET=replace-with-a-long-random-secret
ADMIN_JWT_SECRET_FILE=
APP_DATA_DIR=/srv/platform/apps/applyron-portfolio/data
APP_UPLOADS_DIR=/srv/platform/apps/applyron-portfolio/uploads
ADMIN_SETUP_ENABLED=
```

Notes:

- `APP_PORT` is the host-side bind port used by Compose
- `APP_PUBLIC_URL` should be your real public base URL if you want absolute metadata and canonical URLs
- The container always listens on `3000`
- `REDIS_URL` should normally stay on the bundled `redis://redis:6379/0` default
- `ADMIN_JWT_SECRET` is the recommended production secret source
- `ADMIN_JWT_SECRET_FILE` is supported when you mount a secret file into the container yourself
- `APP_DATA_DIR` stores JSON content, `auth.json`, and runtime `messages.json`
- `APP_UPLOADS_DIR` stores uploaded images
- Production does not fall back to generating `.jwt_secret` inside `APP_DATA_DIR`

## Persistent Storage

These host paths must be persistent:

- `${APP_DATA_DIR}`
- `${APP_UPLOADS_DIR}`

They are mounted into the container using the same absolute paths, so the application can keep using `APP_DATA_DIR` and `APP_UPLOADS_DIR` directly.

The container startup script will:

- create the runtime directories if needed
- seed missing `site.json`, `about.json`, `projects.json`, `links.json`, `socials.json`, and `skills.json`
- never overwrite existing runtime data

Prepare the bind mount directories with the same UID/GID used by the container runtime:

```bash
sudo install -d -o 1001 -g 1001 /srv/platform/apps/applyron-portfolio/data
sudo install -d -o 1001 -g 1001 /srv/platform/apps/applyron-portfolio/uploads
```

## Docker Compose

`docker-compose.prod.yml` defines:

- one `app` service and one `redis` service
- `127.0.0.1:${APP_PORT}:3000` port binding
- external Docker network `applyron`
- bind mounts for data and uploads
- a named Redis persistence volume
- healthcheck against `http://127.0.0.1:3000/api/health`

To validate the Compose file locally, copy `.env.example` to `.env.production`, run `docker compose -f docker-compose.prod.yml config`, then remove the temporary `.env.production` file again.

If the external network does not exist yet:

```bash
docker network create applyron
```

## Health Endpoint

The production health endpoint is:

```text
/api/health
```

It returns:

- `200` when the process is alive and runtime directories, Redis, and JWT secret configuration are healthy
- `503` when runtime storage or security dependencies are unhealthy

In production, the response body is intentionally minimal and only exposes the overall status.
In non-production environments, the response includes extra diagnostic details for local debugging.

## GitHub Actions Deploy

Production deploy is triggered by pushes to `main`.
The workflow also supports manual runs through `workflow_dispatch`.

The workflow:

1. checks out the repository
2. installs dependencies with `npm ci`
3. runs `npm run lint`
4. runs `npm run build`
5. validates `github.actor` against the allowlist
6. connects over SSH
7. verifies the remote `ed25519` host fingerprint before trusting the host key
8. syncs the repository to `/srv/apps/applyron-portfolio/repo`
9. creates a timestamped release under `/srv/apps/applyron-portfolio/releases`
10. updates `/srv/apps/applyron-portfolio/current` to point at the new release
11. deploys through the Dockge-managed stack file:

```bash
docker compose --project-name applyron-portfolio \
  -f /opt/stacks/applyron-portfolio/compose.yaml \
  up -d --build --remove-orphans
```

12. waits for `http://127.0.0.1:${APP_PORT}/api/health`
13. rolls back `current` to the previous release if the healthcheck fails

The allowlist, server paths, and timeout are intentionally easy to change inside `.github/workflows/deploy-vps.yml`.

## Canonical Production Paths

The production deploy now assumes these canonical paths on the server:

- repository sync cache: `/srv/apps/applyron-portfolio/repo`
- release history: `/srv/apps/applyron-portfolio/releases`
- active release symlink: `/srv/apps/applyron-portfolio/current`
- previous release symlink: `/srv/apps/applyron-portfolio/previous`
- shared environment file: `/srv/apps/applyron-portfolio/shared/.env.production`
- Dockge stack file: `/opt/stacks/applyron-portfolio/compose.yaml`

This is important because the Dockge stack is the canonical Compose entrypoint, while the `current` symlink controls which release the stack builds from.

## Required GitHub Secrets

- `DEPLOY_SSH_KEY`
- `DEPLOY_HOST`
- `DEPLOY_USER`

By default, SSH uses port `22`.

## Required GitHub Variables

- `DEPLOY_HOST_ED25519_FINGERPRINT`

Example command to capture the expected fingerprint:

```bash
ssh-keyscan -p 22 -t ed25519 your-domain.com | ssh-keygen -lf - -E sha256
```

## Deploy Behaviour Notes

- The GitHub Actions job does not depend on `/srv/platform/bin/deploy-app` anymore.
- The stack remains manageable from Dockge because the running Compose project always comes from `/opt/stacks/applyron-portfolio/compose.yaml`.
- Release cutover happens by switching the `current` symlink before `docker compose up -d --build`.
- Healthcheck rollback restores the previous `current` symlink and re-runs the same Dockge stack.

## Nginx Notes

The reverse proxy should forward the real client IP and enforce coarse request throttling in front of the app:

```nginx
proxy_set_header X-Real-IP $remote_addr;
client_max_body_size 6M;
limit_req_zone $binary_remote_addr zone=applyron_admin:10m rate=5r/m;

location /api/admin/ {
    limit_req zone=applyron_admin burst=10 nodelay;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_pass http://127.0.0.1:3000;
}
```

## First Production Startup

If no admin password exists yet, open:

```text
https://your-domain.com/admin-applyron
```

With `ADMIN_SETUP_ENABLED` left empty, setup stays available until the first admin account is created. After that, the setup route closes automatically because `auth.json` exists.

If you want to hard-disable setup after onboarding:

```env
ADMIN_SETUP_ENABLED=false
```

Then redeploy the app.

## Runtime Data Boundaries

- Keep `site.json`, `about.json`, `projects.json`, `links.json`, `socials.json`, and `skills.json` versioned in the repository.
- Keep `auth.json`, `.jwt_secret`, `messages.json`, and uploaded files as runtime-only data on the server.
- The contact inbox is intentionally persisted in runtime storage and should not be committed back into git.
