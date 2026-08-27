import type { NativeConnection, Worker } from "@temporalio/worker";
import { buildActivityWorker } from "../../worker.ts";
import { EXAMPLE_PLAN_ACTIVITY } from "./contract.ts";
import { examplePlan } from "./definition.ts";

export function buildWorker(connection: NativeConnection): Promise<Worker> {
  return buildActivityWorker(connection, EXAMPLE_PLAN_ACTIVITY, examplePlan);
}
