import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "bun:test";
import { TestWorkflowEnvironment } from "@temporalio/testing";
import { bundleWorkflowCode } from "@temporalio/worker";
import { ExampleRequestSchema } from "../../src/example/models.ts";
import { buildWorker as buildPlanWorker } from "../../src/orchestration/activities/example_plan/worker.ts";
import { buildWorker as buildProcessWorker } from "../../src/orchestration/activities/example_process/worker.ts";
import { executeWorkflow } from "../../src/orchestration/client.ts";
import { buildWorkflowWorker } from "../../src/orchestration/worker.ts";
import { EXAMPLE_JOB_WORKFLOW } from "../../src/orchestration/workflows/example_job/contract.ts";

test("the example Workflow runs through its dedicated production Workers", async () => {
  const bundleDirectory = await mkdtemp(join(tmpdir(), "temporal-ts-test-"));
  try {
    const bundlePath = join(bundleDirectory, "workflow-bundle.js");
    const { code } = await bundleWorkflowCode({ workflowsPath: exampleDefinitionPath() });
    await writeFile(bundlePath, code, "utf8");

    const environment = await TestWorkflowEnvironment.createTimeSkipping();
    try {
      const planWorker = await buildPlanWorker(environment.nativeConnection);
      const processWorker = await buildProcessWorker(environment.nativeConnection);
      const jobWorker = await buildWorkflowWorker(
        environment.nativeConnection,
        EXAMPLE_JOB_WORKFLOW,
        { workflowBundle: { codePath: bundlePath } },
      );
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
  } finally {
    await rm(bundleDirectory, { force: true, recursive: true });
  }
}, 120_000);

function exampleDefinitionPath(): string {
  const extension = import.meta.url.endsWith(".ts") ? "ts" : "js";
  return fileURLToPath(
    new URL(
      `../../src/orchestration/workflows/example_job/definition.${extension}`,
      import.meta.url,
    ),
  );
}
