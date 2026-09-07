# syntax=docker/dockerfile:1

ARG BUN_IMAGE=oven/bun:1.4.0-slim

FROM ${BUN_IMAGE} AS build

WORKDIR /app

COPY package.json bun.lock tsconfig.json ./
COPY src/orchestration/workflows/example_job/package.json src/orchestration/workflows/example_job/package.json
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --filter temporal-ts --filter example-job-workflow --frozen-lockfile

COPY src ./src
RUN bunx tsc && bun dist/src/orchestration/workflows/example_job/bundle.js

FROM worker-base

COPY src/orchestration/workflows/example_job/package.json src/orchestration/workflows/example_job/package.json
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --filter temporal-ts --filter example-job-workflow --production --frozen-lockfile

COPY --from=build --chown=app:app /app/dist ./dist

USER app

CMD ["bun", "run", "dist/src/orchestration/workflows/example_job/serve.js"]
