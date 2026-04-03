FROM node:22-bookworm-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY patches ./patches

RUN npm ci

COPY . .

RUN npm run build

FROM node:22-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN groupadd --system --gid 1001 applyron \
  && useradd --system --uid 1001 --gid 1001 --home-dir /app --shell /usr/sbin/nologin applyron

COPY --from=builder --chown=1001:1001 /app/.next/standalone ./
COPY --from=builder --chown=1001:1001 /app/.next/static ./.next/static
COPY --from=builder --chown=1001:1001 /app/public ./public
COPY --from=builder --chown=1001:1001 /app/scripts/docker-entrypoint.cjs ./scripts/docker-entrypoint.cjs
COPY --chown=1001:1001 data/about.json data/links.json data/projects.json data/site.json data/socials.json data/skills.json ./seed-data/

EXPOSE 3000

USER 1001:1001

CMD ["node", "scripts/docker-entrypoint.cjs"]
