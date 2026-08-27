import { expect, test } from "bun:test";
import { workflowWorkerModeFromEnvironment } from "../src/orchestration/worker.ts";

test("local deployment environments use development Workflow code", () => {
  expect(workflowWorkerModeFromEnvironment({ DEPLOYMENT_ENVIRONMENT: "local" })).toBe(
    "development",
  );
  expect(workflowWorkerModeFromEnvironment({ DEPLOYMENT_ENVIRONMENT: "DEVELOPMENT" })).toBe(
    "development",
  );
});

test("Workflow Workers default to production bundles", () => {
  expect(workflowWorkerModeFromEnvironment({})).toBe("production");
  expect(workflowWorkerModeFromEnvironment({ DEPLOYMENT_ENVIRONMENT: "staging" })).toBe(
    "production",
  );
});
