import { NativeConnection } from "@temporalio/worker";
import { loadTemporalConnection } from "../../config.ts";
import { workflowWorkerModeFromEnvironment } from "../../worker.ts";
import { buildWorker } from "./worker.ts";

async function serve(): Promise<void> {
  const { target, namespace } = loadTemporalConnection();
  const connection = await NativeConnection.connect({ address: target });
  try {
    const worker = await buildWorker(connection, namespace, workflowWorkerModeFromEnvironment());
    console.info("starting example-job workflow worker");
    await worker.run();
  } finally {
    await connection.close();
  }
}

await serve();
