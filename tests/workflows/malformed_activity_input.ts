import { proxyActivities } from "@temporalio/workflow";
import { EXAMPLE_PLAN_ACTIVITY } from "../../src/orchestration/activities/example_plan/contract.ts";
import { ActivityName } from "../../src/orchestration/activities/names.ts";

type TestActivities = Record<ActivityName, (arg: unknown) => Promise<unknown>>;

export default async function malformedActivityInput(): Promise<void> {
  const activities = proxyActivities<TestActivities>({
    taskQueue: EXAMPLE_PLAN_ACTIVITY.queue,
    startToCloseTimeout: EXAMPLE_PLAN_ACTIVITY.startToClose,
    retry: { maximumAttempts: 2 },
  });
  await activities[ActivityName.EXAMPLE_PLAN]({ work_id: " " });
}
