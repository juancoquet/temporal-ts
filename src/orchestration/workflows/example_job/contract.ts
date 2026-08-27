import { ExampleRequestSchema, ExampleResultSchema } from "../../../example/models.ts";
import { createWorkflowContract } from "../../contracts.ts";
import { WorkflowName } from "../names.ts";

export const EXAMPLE_JOB_WORKFLOW = createWorkflowContract({
  name: WorkflowName.EXAMPLE_JOB,
  arg: ExampleRequestSchema,
  out: ExampleResultSchema,
  key: (request) => `example-job-${request.work_id}`,
});
