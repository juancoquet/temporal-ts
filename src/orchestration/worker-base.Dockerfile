# syntax=docker/dockerfile:1

ARG BUN_IMAGE=oven/bun:1.4.0-slim

FROM ${BUN_IMAGE}

WORKDIR /app

COPY package.json bun.lock ./
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --filter temporal-ts --production --frozen-lockfile

RUN groupadd --gid 10001 app \
    && useradd --uid 10001 --gid app --no-create-home --home-dir /nonexistent app
