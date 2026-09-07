import type { NativeConnection, Worker } from "@temporalio/worker";
import { productionExampleService } from "../../../example/service.ts";
import { buildActivityWorker } from "../../worker.ts";
import { EXAMPLE_PROCESS_ACTIVITY } from "./contract.ts";
import { createExampleProcessActivity } from "./definition.ts";

export function buildWorker(connection: NativeConnection, namespace: string): Promise<Worker> {
  const service = productionExampleService();
  const activity = createExampleProcessActivity(service);
  return buildActivityWorker(connection, namespace, EXAMPLE_PROCESS_ACTIVITY, activity);
}
