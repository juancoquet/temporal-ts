import { NativeConnection } from "@temporalio/worker";
import { TEMPORAL_ADDRESS } from "../../config.ts";
import { workflowWorkerModeFromEnvironment } from "../../worker.ts";
import { buildWorker } from "./worker.ts";

async function serve(): Promise<void> {
  const connection = await NativeConnection.connect({ address: TEMPORAL_ADDRESS });
  try {
    const worker = await buildWorker(connection, workflowWorkerModeFromEnvironment());
    console.info("starting example-job workflow worker");
    await worker.run();
  } finally {
    await connection.close();
  }
}

await serve();
