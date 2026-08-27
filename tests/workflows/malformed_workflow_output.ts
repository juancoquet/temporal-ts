import type { ExampleResult } from "../../src/example/models.ts";
import { createWorkflowDefinition } from "../../src/orchestration/workflow.ts";
import { EXAMPLE_JOB_WORKFLOW } from "../../src/orchestration/workflows/example_job/contract.ts";

export default createWorkflowDefinition(EXAMPLE_JOB_WORKFLOW, async (request) => {
  return { work_id: request.work_id, index: "invalid" } as unknown as ExampleResult;
});
