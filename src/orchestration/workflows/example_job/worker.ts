import type { NativeConnection, Worker } from "@temporalio/worker";
import { compiledSiblingPath } from "../../paths.ts";
import { buildWorkflowWorker, type WorkflowWorkerMode } from "../../worker.ts";
import { EXAMPLE_JOB_WORKFLOW } from "./contract.ts";

const definitionPath = compiledSiblingPath(import.meta.url, "definition");
const bundlePath = compiledSiblingPath(import.meta.url, "workflow-bundle");

export function buildWorker(
  connection: NativeConnection,
  mode: WorkflowWorkerMode,
): Promise<Worker> {
  const workflowCode =
    mode === "development"
      ? { workflowsPath: definitionPath }
      : { workflowBundle: { codePath: bundlePath } };
  return buildWorkflowWorker(connection, EXAMPLE_JOB_WORKFLOW, workflowCode);
}
