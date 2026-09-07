# syntax=docker/dockerfile:1

FROM worker-base

COPY src/orchestration/activities/example_process/package.json src/orchestration/activities/example_process/package.json
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --filter example-process-activity --production --frozen-lockfile

COPY --chown=app:app src ./src

USER app

CMD ["bun", "run", "src/orchestration/activities/example_process/serve.ts"]
