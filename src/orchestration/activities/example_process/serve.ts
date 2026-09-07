import { NativeConnection } from "@temporalio/worker";
import { loadTemporalConnection } from "../../config.ts";
import { buildWorker } from "./worker.ts";

async function serve(): Promise<void> {
  const { target, namespace } = loadTemporalConnection();
  const connection = await NativeConnection.connect({ address: target });
  try {
    const worker = await buildWorker(connection, namespace);
    console.info("starting example-process worker");
    await worker.run();
  } finally {
    await connection.close();
  }
}

await serve();
