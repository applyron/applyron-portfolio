# Applyron Web Design

English | [Türkçe](./README.tr.md)

Applyron Web Design is a multilingual portfolio site and file-based admin CMS built with `Next.js 16`, designed to manage a brand-facing showcase without introducing a database.

## Overview

This repository contains:

- A public marketing/portfolio experience under locale-based routes such as `/en` and `/tr`
- A protected admin panel at `/admin-applyron`
- File-based content storage for site, hero, projects, links, and social data
- Production-oriented deployment and runtime hardening for a VPS environment

## Reference Project

This project is designed on top of [sanidhyy/space-portfolio](https://github.com/sanidhyy/space-portfolio) and extends the original visual foundation into a more operational product.

The upstream project is a single-language portfolio template with hardcoded content. This repository keeps the original visual direction as a starting point, then expands it with multilingual routing, editable content, an admin CMS, deployment automation, and production hardening.

## What Changed

Compared to the reference project, this repository adds:

- Locale-based `en` / `tr` routing with `next-intl`
- A file-based CMS backed by `data/*.json` and `lib/data.ts`
- An admin setup, login, and dashboard flow under `/admin-applyron`
- CRUD APIs for site settings, hero content, projects, external links, socials, and uploads
- Project detail pages and public revalidation after admin edits
- Production-focused auth, rate limiting, upload validation, and persistent runtime storage
- GitHub Actions to VPS deployment instead of template-style Netlify/Vercel setup

## Features

- Multilingual public site with Turkish and English content
- Editable navigation, hero content, projects, external links, and social links
- Project carousel on the home page and dedicated project detail pages
- File-based admin workflow with setup, login, and authenticated dashboard tabs
- Raster-only image uploads processed with `sharp`
- Runtime auth using `bcrypt` password hashing and JWT cookies
- IP-based throttling for admin auth endpoints
- Persistent `data/` and `uploads/` support through runtime environment variables
- Docker-ready production deployment for Applyron Server

## Tech Stack

- `Next.js 16`
- `React 19`
- `TypeScript`
- `Tailwind CSS`
- `next-intl`
- `framer-motion`
- `@react-three/fiber` and `@react-three/drei`
- `bcryptjs`
- `jsonwebtoken`
- `sharp`

## Getting Started

### Requirements

- `Node.js 22+`
- `npm 10+`

### Install

```bash
git clone <repository-url>
cd applyron-web-design
npm ci
```

### Development

```bash
npm run dev
```

Default local URLs:

- `http://localhost:3000/en`
- `http://localhost:3000/tr`
- `http://localhost:3000/admin-applyron`

### Production Build

```bash
npm run lint
npm run build
npm run start
```

## Environment & Runtime Storage

The app supports runtime storage outside the release directory.

Relevant environment variables:

- `APP_PUBLIC_URL`: optional public base URL for absolute metadata and canonical generation
- `APP_DATA_DIR`: persistent directory for JSON content, `auth.json`, and `.jwt_secret`
- `APP_UPLOADS_DIR`: persistent directory for uploaded images
- `ADMIN_SETUP_ENABLED`: optional override for allowing or denying first-run admin setup

Behavior:

- In local development, the app falls back to `data/` and `public/uploads/`
- In production, `APP_DATA_DIR` and `APP_UPLOADS_DIR` should point to persistent directories on the VPS
- If `ADMIN_SETUP_ENABLED` is unset in production, setup stays available only until the first admin account is created

Example values are documented in [`.env.example`](./.env.example).

## Admin Panel

The admin panel lives at `/admin-applyron`.

Main capabilities:

- First-run setup when no admin password exists yet
- Password-based login
- Editable tabs for site settings, projects, external links, social media, and hero/about content
- Image upload support for logo, hero, and project images
- Automatic public path revalidation after content changes

Admin auth details:

- Passwords are hashed with `bcrypt`
- Sessions are stored in JWT cookies
- Login and setup endpoints are rate-limited
- Uploads are restricted to supported raster formats

## Deployment

Production deployment is designed for `GitHub Actions -> Applyron Server`.

The production stack now assumes:

- Docker image build with `Next.js` standalone output
- `docker-compose.prod.yml` for the application service
- Persistent bind mounts for runtime `data` and `uploads`
- Health checks through `/api/health`
- SSH-triggered remote deploy via `/srv/platform/bin/deploy-app applyron-portfolio`

Deployment details, required secrets, and the `.env.production` shape are documented in [`docs/deploy-vps.md`](./docs/deploy-vps.md).

## Project Structure

- `app/[locale]`: locale-aware public routes and layout handling
- `app/admin-applyron`: admin UI
- `app/api/admin`: admin APIs for content, auth, and uploads
- `app/uploads/[filename]`: controlled upload delivery route
- `components/main`: public-facing sections
- `components/sub`: shared UI and supporting components
- `data`: file-based content source and runtime auth storage in local/dev setups
- `i18n`: locale routing and request configuration
- `messages`: UI translation files for the public site
- `lib`: data access, auth, validation, rate limiting, upload processing, and runtime helpers
- `docs`: operational documentation, including VPS deployment notes

## License & Credits

This repository is licensed under the [MIT License](./LICENSE).
The LICENSE file preserves upstream attribution and adds attribution for this derived repository.

Credit to the original visual foundation: [sanidhyy/space-portfolio](https://github.com/sanidhyy/space-portfolio). This repository substantially extends that base with multilingual content management, admin tooling, and production deployment behavior.
