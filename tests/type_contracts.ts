import type { NativeConnection } from "@temporalio/worker";
import type {
  ExampleItemSchema,
  ExamplePlan,
  ExampleRequest,
  ExampleResult,
} from "../src/example/models.ts";
import { EXAMPLE_PLAN_ACTIVITY } from "../src/orchestration/activities/example_plan/contract.ts";
import { type ActivityImpl, buildActivityWorker } from "../src/orchestration/worker.ts";
import { createWorkflowDefinition } from "../src/orchestration/workflow.ts";
import { EXAMPLE_JOB_WORKFLOW } from "../src/orchestration/workflows/example_job/contract.ts";

declare const connection: NativeConnection;

const correctActivity: ActivityImpl<
  typeof EXAMPLE_PLAN_ACTIVITY.arg,
  typeof EXAMPLE_PLAN_ACTIVITY.out
> = async (_request: ExampleRequest): Promise<ExamplePlan> => ({ items: [] });
void buildActivityWorker(connection, EXAMPLE_PLAN_ACTIVITY, correctActivity);

const wrongActivity: ActivityImpl<
  typeof ExampleItemSchema,
  typeof EXAMPLE_PLAN_ACTIVITY.out
> = async (): Promise<ExamplePlan> => ({ items: [] });
type PlanActivity = ActivityImpl<
  typeof EXAMPLE_PLAN_ACTIVITY.arg,
  typeof EXAMPLE_PLAN_ACTIVITY.out
>;
// @ts-expect-error The implementation input must match the contract input.
const mismatchedActivity: PlanActivity = wrongActivity;
void mismatchedActivity;
// @ts-expect-error The Worker builder rejects an incongruent implementation.
void buildActivityWorker(connection, EXAMPLE_PLAN_ACTIVITY, wrongActivity);

const extraParameterActivity = async (
  _request: ExampleRequest,
  _dependency: string,
): Promise<ExamplePlan> => ({ items: [] });
// @ts-expect-error Activity implementations must accept exactly one argument.
void buildActivityWorker(connection, EXAMPLE_PLAN_ACTIVITY, extraParameterActivity);

createWorkflowDefinition(
  EXAMPLE_JOB_WORKFLOW,
  async (request: ExampleRequest): Promise<ExampleResult> => ({
    work_id: request.work_id,
    index: 0,
  }),
);

createWorkflowDefinition(
  EXAMPLE_JOB_WORKFLOW,
  // @ts-expect-error The implementation output must match the contract output.
  async () => ({ invalid: true }),
);
