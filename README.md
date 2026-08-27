# temporal-ts

A reference template for structuring a **Temporal TypeScript** orchestration layer. It keeps the
boundary between deciding what to run (Workflows) and doing the work (Activities) import-light and
per-unit, so each Worker can run independently without pulling another unit's implementation into
its module graph.

Clone it, keep `src/orchestration/`, replace the `example` domain and `example_*` units, and you have
a typed, runtime-validated Temporal skeleton.

## Layout

```text
src/
  primitives.ts                # Zod model constraint and NonEmptyString
  example/                     # domain code; no Temporal dependency
    models.ts                  # readonly Zod payload models and inferred types
    plan.ts                    # pure domain function
    ports.ts                   # structural domain port
    service.ts                 # production service and factory
  orchestration/
    contracts.ts               # ActivityContract / WorkflowContract
    activity.ts                # Workflow-only executeActivity helper
    workflow.ts                # Workflow Definition and child execution helpers
    client.ts                  # Client connection and top-level execution helpers
    worker.ts                  # shared Activity / Workflow Worker builders
    paths.ts                   # compiled sibling path helper
    failures.ts                # non-retryable payload validation failures
    activities/
      names.ts                 # closed ActivityName enum
      example_plan/
        contract.ts
        definition.ts
        worker.ts
        serve.ts
      example_process/
        contract.ts
        definition.ts
        worker.ts
        serve.ts
    workflows/
      names.ts                 # closed WorkflowName enum
      example_job/
        contract.ts
        definition.ts
        worker.ts
        serve.ts
        bundle.ts
```

There are no orchestration barrel files. Import the concrete module you need.

## Core boundaries

- **The domain does not import Temporal.** Domain models, functions, ports, and services are plain
  TypeScript and Zod.
- **Contracts and Definitions are separate.** Workflow code imports Activity contracts, never
  Activity implementations.
- **One independently served unit lives in each directory.** Every `serve.ts` starts exactly one
  Worker on its contract-derived task queue.
- **Payloads are small references.** Carry IDs, hashes, keys, coordinates, and small values rather
  than heavy content.
- **Workflow imports stay deterministic.** Definitions may import `@temporalio/workflow`, contracts,
  payload models, and pure functions. They must not import services, Workers, Clients, I/O modules,
  or Activity Definitions.

## Typed contracts

Boundary models are readonly Zod objects. Values are validated when they arrive from Temporal, and
malformed inputs or outputs fail non-retryably. The final Workflow output is also validated before
the Workflow completes.

Contracts own their wire name, schemas, timeout policy, and derived queue:

```ts
export const EXAMPLE_PLAN_ACTIVITY = createActivityContract({
  name: ActivityName.EXAMPLE_PLAN,
  arg: ExampleRequestSchema,
  out: ExamplePlanSchema,
  startToClose: "2 minutes",
});
```

Workflow code dispatches by contract without importing the Activity Definition:

```ts
const plan = await executeActivity(EXAMPLE_PLAN_ACTIVITY, request);
```

A starter executes a top-level Workflow through its contract:

```ts
const { client, connection } = await connectClient();

try {
  const request = ExampleRequestSchema.parse({ workId: "doc-1" });
  const result = await executeWorkflow(client, EXAMPLE_JOB_WORKFLOW, request);
  console.info(result);
} finally {
  await connection.close();
}
```

JavaScript promises start eagerly, so execution can start now and be awaited later without a
separate start helper:

```ts
const resultPromise = executeWorkflow(client, EXAMPLE_JOB_WORKFLOW, request);
// Do other work.
const result = await resultPromise;
```

`executeChildWorkflow` has the same promise behaviour inside Workflow code.

## Workflow code and bundles

Source imports use `.ts`. TypeScript rewrites them to `.js` during compilation. Runtime filesystem
paths always point to compiled JavaScript.

A Workflow Worker chooses its code source from `DEPLOYMENT_ENVIRONMENT`:

- `local` or `development`: bundle the adjacent compiled `definition.js` at Worker startup
- missing or any other value: load the adjacent prebuilt `workflow-bundle.js`

Production is the safe default. `bun run build` compiles the project and generates the production
Workflow bundle.

## Running checks

Install [Bun](https://bun.sh/) 1.4.0, then:

```bash
bun install --frozen-lockfile
bun run check
```

The checks run TypeScript 5.9, Biome, a production Workflow bundle build, Bun tests, and a Temporal
time-skipping end-to-end test. The first end-to-end run may download Temporal's test server.

Run each compiled Worker against a local Temporal development server:

```bash
bun run build

DEPLOYMENT_ENVIRONMENT=local bun dist/src/orchestration/workflows/example_job/serve.js
bun dist/src/orchestration/activities/example_plan/serve.js
bun dist/src/orchestration/activities/example_process/serve.js
```

Omitting `DEPLOYMENT_ENVIRONMENT` makes the Workflow Worker use the generated production bundle.
All example connections target `localhost:7233` in namespace `default`.

## Adding an Activity

1. Add its readonly Zod payload models to the domain.
2. Add its exact wire name to `src/orchestration/activities/names.ts`.
3. Create `src/orchestration/activities/<activity>/` with:
   - `contract.ts`: schemas, wire name, and timeout policy;
   - `definition.ts`: a thin adapter over domain behaviour;
   - `worker.ts`: bind exactly that contract and implementation;
   - `serve.ts`: own the `NativeConnection`, run the Worker, and close the connection.
4. Dispatch it from Workflow code with `executeActivity(contract, arg)`.

Pure Activities may call a domain function directly. Collaborator-backed Activities receive a
structural domain port from their local Worker composition root.

## Adding a Workflow

1. Add its exact wire name to `src/orchestration/workflows/names.ts`.
2. Create `src/orchestration/workflows/<workflow>/` with:
   - `contract.ts`: schemas, deterministic ID key, and timeout policy;
   - `definition.ts`: one guarded default Workflow export;
   - `worker.ts`: select its adjacent compiled Definition or bundle;
   - `serve.ts`: own and close its `NativeConnection`;
   - `bundle.ts`: generate its adjacent production bundle.
3. Add the compiled `bundle.ts` entrypoint to the `build` script.

Keep the Definition deterministic and import-light. Use Temporal Workflow APIs such as `uuid4()`
when Workflow code needs deterministic replacements for nondeterministic platform operations.
