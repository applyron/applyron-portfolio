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

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/scripts/docker-entrypoint.cjs ./scripts/docker-entrypoint.cjs
COPY data/about.json data/links.json data/projects.json data/site.json data/socials.json ./seed-data/

EXPOSE 3000

CMD ["node", "scripts/docker-entrypoint.cjs"]
