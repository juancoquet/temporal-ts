import type { ExampleRequest, ExampleResult } from "../../../example/models.ts";
import { executeActivity } from "../../activity.ts";
import { EXAMPLE_PLAN_ACTIVITY } from "../../activities/example_plan/contract.ts";
import { EXAMPLE_PROCESS_ACTIVITY } from "../../activities/example_process/contract.ts";
import { createWorkflowDefinition } from "../../workflow.ts";
import { EXAMPLE_JOB_WORKFLOW } from "./contract.ts";

export default createWorkflowDefinition(
  EXAMPLE_JOB_WORKFLOW,
  async (request: ExampleRequest): Promise<ExampleResult> => {
    const plan = await executeActivity(EXAMPLE_PLAN_ACTIVITY, request);
    for (const item of plan.items) {
      await executeActivity(EXAMPLE_PROCESS_ACTIVITY, item);
    }
    return { work_id: request.work_id, index: plan.items.length };
  },
);
