import { expect, test } from "bun:test";
import { ActivityName } from "../src/orchestration/activities/names.ts";
import { WorkflowName } from "../src/orchestration/workflows/names.ts";

test("Temporal names are unique", () => {
  expect(new Set(Object.values(ActivityName)).size).toBe(Object.values(ActivityName).length);
  expect(new Set(Object.values(WorkflowName)).size).toBe(Object.values(WorkflowName).length);
});
