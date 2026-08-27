import { expect, test } from "bun:test";
import { TestWorkflowEnvironment } from "@temporalio/testing";
import { ExampleRequestSchema } from "../../src/example/models.ts";
import { buildWorker as buildPlanWorker } from "../../src/orchestration/activities/example_plan/worker.ts";
import { buildWorker as buildProcessWorker } from "../../src/orchestration/activities/example_process/worker.ts";
import { executeWorkflow } from "../../src/orchestration/client.ts";
import { EXAMPLE_JOB_WORKFLOW } from "../../src/orchestration/workflows/example_job/contract.ts";
import { buildWorker as buildJobWorker } from "../../src/orchestration/workflows/example_job/worker.ts";

test("the example Workflow runs through its dedicated production Workers", async () => {
  const environment = await TestWorkflowEnvironment.createTimeSkipping();
  try {
    const planWorker = await buildPlanWorker(environment.nativeConnection);
    const processWorker = await buildProcessWorker(environment.nativeConnection);
    const jobWorker = await buildJobWorker(environment.nativeConnection, "production");
    const request = ExampleRequestSchema.parse({ workId: "doc-1" });
    const execution = executeWorkflow(environment.client, EXAMPLE_JOB_WORKFLOW, request);

    const [result] = await Promise.all([
      jobWorker.runUntil(execution),
      planWorker.runUntil(execution),
      processWorker.runUntil(execution),
    ]);

    expect(String(result.workId)).toBe("doc-1");
    expect(result.index).toBe(2);
    expect(Object.isFrozen(result)).toBeTrue();
  } finally {
    await environment.teardown();
  }
}, 120_000);
