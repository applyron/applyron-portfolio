# Applyron Server Deployment

This repository is prepared for Docker-based production deployment on Applyron Server.

## Runtime Model

- The app runs as a single `Next.js 16` container
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
- `APP_DATA_DIR`
- `APP_UPLOADS_DIR`
- `ADMIN_SETUP_ENABLED` (optional, can stay empty)

Example:

```env
APP_PORT=3000
APP_PUBLIC_URL=https://your-domain.com
APP_DATA_DIR=/srv/platform/apps/applyron-portfolio/data
APP_UPLOADS_DIR=/srv/platform/apps/applyron-portfolio/uploads
ADMIN_SETUP_ENABLED=
```

Notes:

- `APP_PORT` is the host-side bind port used by Compose
- `APP_PUBLIC_URL` should be your real public base URL if you want absolute metadata and canonical URLs
- The container always listens on `3000`
- `APP_DATA_DIR` stores JSON content, `auth.json`, and `.jwt_secret`
- `APP_UPLOADS_DIR` stores uploaded images

## Persistent Storage

These host paths must be persistent:

- `${APP_DATA_DIR}`
- `${APP_UPLOADS_DIR}`

They are mounted into the container using the same absolute paths, so the application can keep using `APP_DATA_DIR` and `APP_UPLOADS_DIR` directly.

The container startup script will:

- create the runtime directories if needed
- seed missing `site.json`, `about.json`, `projects.json`, `links.json`, and `socials.json`
- never overwrite existing runtime data

## Docker Compose

`docker-compose.prod.yml` defines:

- one `app` service
- `127.0.0.1:${APP_PORT}:3000` port binding
- external Docker network `applyron`
- bind mounts for data and uploads
- healthcheck against `http://127.0.0.1:3000/api/health`

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

- `200` when the process is alive and runtime directories are accessible
- `503` when runtime storage is unhealthy

The response includes JSON details for:

- process state
- data directory access
- uploads directory access
- JWT secret presence when admin auth is configured

## GitHub Actions Deploy

Production deploy is triggered by pushes to `main`.

The workflow:

1. checks out the repository
2. installs dependencies with `npm ci`
3. runs `npm run lint`
4. runs `npm run build`
5. validates `github.actor` against the allowlist
6. connects over SSH
7. runs:

```bash
/srv/platform/bin/deploy-app applyron-portfolio
```

The allowlist and app name are intentionally easy to change inside `.github/workflows/deploy-vps.yml`.

## Required GitHub Secrets

- `DEPLOY_SSH_KEY`
- `DEPLOY_HOST`
- `DEPLOY_USER`

By default, SSH uses port `22`.

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
