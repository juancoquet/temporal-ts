import { NativeConnection } from "@temporalio/worker";
import { workflowWorkerModeFromEnvironment } from "../../worker.ts";
import { buildWorker } from "./worker.ts";

const TARGET = "localhost:7233";

async function serve(): Promise<void> {
  const connection = await NativeConnection.connect({ address: TARGET });
  try {
    const worker = await buildWorker(connection, workflowWorkerModeFromEnvironment());
    console.info("starting example-job workflow worker");
    await worker.run();
  } finally {
    await connection.close();
  }
}

await serve();
