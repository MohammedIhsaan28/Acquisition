# Acquisition Docker + Neon Setup

## Overview

- Dev uses **Neon Local** (Docker) + app via `docker-compose.dev.yml`.
- Prod uses real **Neon Cloud** URL via env var with `docker-compose.prod.yml`.
- App reads `DATABASE_URL` (see `src/config/database.js`).
- Testing CI/CD pipelines 

## Files

- `Dockerfile` – builds the Node app
- `docker-compose.dev.yml` – app + Neon Local proxy for dev
- `docker-compose.prod.yml` – app with external Neon Cloud DB
- `.env.development` – sample dev env (Neon Local URL)
- `.env.production` – sample prod env (Neon Cloud URL placeholder)

## Development (Neon Local)

1. Copy env: `cp .env.development .env`
2. Start stack: `docker compose -f docker-compose.dev.yml up --build`
   - App: http://localhost:3000
   - Neon Local proxy: localhost:5432 (inside network: `neon-local:5432`)
3. Drizzle: ensure `DATABASE_URL` matches Neon Local; run e.g. `npm run db:generate`.
4. Stop: `docker compose -f docker-compose.dev.yml down`

Notes:

- Neon Local auto-creates ephemeral branches per session when `NEON_AUTO_BRANCH=true`.
- Adjust credentials/DB name in compose + env if needed.

## Production (Neon Cloud)

1. Set env vars (CI/host):
   - `NODE_ENV=production`
   - `DATABASE_URL=postgres://<user>:<pass>@<project>.neon.tech/<db>`
2. Build & run: `docker compose -f docker-compose.prod.yml up --build -d`
   - Or deploy container image to your platform of choice with the same env vars.
3. No Neon Local runs in prod; it connects directly to the Neon Cloud URL.

## Environment Switching

- Dev: `.env.development` -> Neon Local URL (`postgres://devuser:devpassword@neon-local:5432/devdb`)
- Prod: `.env.production` -> Neon Cloud URL placeholder; inject real secret at deploy time.

## Common commands

- `npm run dev` (inside container via compose)
- `npm run db:generate` (ensure DATABASE_URL points to desired target)
- `npm run db:migrate`

## Notes

- Volume for Neon Local is commented out; enable if you want persistence.
- Make sure `ARCJET_KEY`, JWT secrets, etc., are set in your env/secret manager.
