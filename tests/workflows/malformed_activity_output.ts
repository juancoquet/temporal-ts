import { ExampleItemSchema } from "../../src/example/models.ts";
import { executeActivity } from "../../src/orchestration/activity.ts";
import { EXAMPLE_PROCESS_ACTIVITY } from "../../src/orchestration/activities/example_process/contract.ts";

export default async function malformedActivityOutput(): Promise<void> {
  const item = ExampleItemSchema.parse({ workId: "doc-1", index: 0 });
  await executeActivity(EXAMPLE_PROCESS_ACTIVITY, item);
}
