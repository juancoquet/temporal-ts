import { fileURLToPath } from "node:url";
import { expect, test } from "bun:test";
import { ApplicationFailure } from "@temporalio/common";
import { TestWorkflowEnvironment } from "@temporalio/testing";
import { Worker } from "@temporalio/worker";
import type { ExampleItem, ExampleResult } from "../../src/example/models.ts";
import { ExampleRequestSchema } from "../../src/example/models.ts";
import { buildWorker as buildPlanWorker } from "../../src/orchestration/activities/example_plan/worker.ts";
import { EXAMPLE_PROCESS_ACTIVITY } from "../../src/orchestration/activities/example_process/contract.ts";
import { buildActivityWorker, buildWorkflowWorker } from "../../src/orchestration/worker.ts";
import { EXAMPLE_JOB_WORKFLOW } from "../../src/orchestration/workflows/example_job/contract.ts";
import { buildWorker as buildJobWorker } from "../../src/orchestration/workflows/example_job/worker.ts";

const MALFORMED_ACTIVITY_INPUT_WORKFLOW = "malformed_activity_input_workflow";
const MALFORMED_ACTIVITY_OUTPUT_WORKFLOW = "malformed_activity_output_workflow";

test("malformed Workflow input fails non-retryably", async () => {
  const environment = await TestWorkflowEnvironment.createTimeSkipping();
  try {
    const worker = await buildJobWorker(environment.nativeConnection, "production");
    const execution = captureApplicationFailure(
      environment.client.workflow.execute<(arg: unknown) => Promise<unknown>>(
        EXAMPLE_JOB_WORKFLOW.name,
        {
          args: [{ workId: " " }],
          workflowId: "malformed-workflow-input",
          taskQueue: EXAMPLE_JOB_WORKFLOW.queue,
        },
      ),
    );

    const failure = await worker.runUntil(execution);
    expectPayloadValidationFailure(failure);
  } finally {
    await environment.teardown();
  }
}, 120_000);

test("malformed Activity input fails non-retryably", async () => {
  const environment = await TestWorkflowEnvironment.createTimeSkipping();
  try {
    const activityWorker = await buildPlanWorker(environment.nativeConnection);
    const workflowWorker = await Worker.create({
      connection: environment.nativeConnection,
      taskQueue: `${MALFORMED_ACTIVITY_INPUT_WORKFLOW}_queue`,
      workflowsPath: compiledTestWorkflowPath("malformed_activity_input"),
    });
    const execution = captureApplicationFailure(
      environment.client.workflow.execute<() => Promise<void>>(MALFORMED_ACTIVITY_INPUT_WORKFLOW, {
        args: [],
        workflowId: "malformed-activity-input",
        taskQueue: `${MALFORMED_ACTIVITY_INPUT_WORKFLOW}_queue`,
      }),
    );

    const [failure] = await Promise.all([
      workflowWorker.runUntil(execution),
      activityWorker.runUntil(execution),
    ]);
    expectPayloadValidationFailure(failure);
  } finally {
    await environment.teardown();
  }
}, 120_000);

test("malformed Activity output fails its calling Workflow non-retryably", async () => {
  const environment = await TestWorkflowEnvironment.createTimeSkipping();
  try {
    const malformedActivity = async (item: ExampleItem): Promise<ExampleResult> =>
      ({ workId: item.workId, index: "invalid" }) as unknown as ExampleResult;
    const activityWorker = await buildActivityWorker(
      environment.nativeConnection,
      EXAMPLE_PROCESS_ACTIVITY,
      malformedActivity,
    );
    const workflowWorker = await Worker.create({
      connection: environment.nativeConnection,
      taskQueue: `${MALFORMED_ACTIVITY_OUTPUT_WORKFLOW}_queue`,
      workflowsPath: compiledTestWorkflowPath("malformed_activity_output"),
    });
    const execution = captureApplicationFailure(
      environment.client.workflow.execute<() => Promise<void>>(MALFORMED_ACTIVITY_OUTPUT_WORKFLOW, {
        args: [],
        workflowId: "malformed-activity-output",
        taskQueue: `${MALFORMED_ACTIVITY_OUTPUT_WORKFLOW}_queue`,
      }),
    );

    const [failure] = await Promise.all([
      workflowWorker.runUntil(execution),
      activityWorker.runUntil(execution),
    ]);
    expectPayloadValidationFailure(failure);
  } finally {
    await environment.teardown();
  }
}, 120_000);

test("malformed Workflow output fails non-retryably before completion", async () => {
  const environment = await TestWorkflowEnvironment.createTimeSkipping();
  try {
    const worker = await buildWorkflowWorker(environment.nativeConnection, EXAMPLE_JOB_WORKFLOW, {
      workflowsPath: compiledTestWorkflowPath("malformed_workflow_output"),
    });
    const request = ExampleRequestSchema.parse({ workId: "doc-1" });
    const execution = captureApplicationFailure(
      environment.client.workflow.execute(EXAMPLE_JOB_WORKFLOW.name, {
        args: [request],
        workflowId: "malformed-workflow-output",
        taskQueue: EXAMPLE_JOB_WORKFLOW.queue,
      }),
    );

    const failure = await worker.runUntil(execution);
    expectPayloadValidationFailure(failure);
  } finally {
    await environment.teardown();
  }
}, 120_000);

function compiledTestWorkflowPath(moduleName: string): string {
  return fileURLToPath(new URL(`../workflows/${moduleName}.js`, import.meta.url));
}

async function captureApplicationFailure(promise: Promise<unknown>): Promise<ApplicationFailure> {
  try {
    await promise;
  } catch (error: unknown) {
    const failure = findApplicationFailure(error);
    if (failure !== undefined) {
      return failure;
    }
    throw error;
  }
  throw new Error("expected Workflow execution to fail");
}

function findApplicationFailure(error: unknown): ApplicationFailure | undefined {
  let current = error;
  while (current instanceof Error) {
    if (current instanceof ApplicationFailure) {
      return current;
    }
    current = current.cause;
  }
  return undefined;
}

function expectPayloadValidationFailure(failure: ApplicationFailure): void {
  expect(failure.type).toBe("PayloadValidationFailure");
  expect(failure.nonRetryable).toBeTrue();
}
