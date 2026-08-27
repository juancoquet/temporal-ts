import { NativeConnection } from "@temporalio/worker";
import { buildWorker } from "./worker.ts";

const TARGET = "localhost:7233";

async function serve(): Promise<void> {
  const connection = await NativeConnection.connect({ address: TARGET });
  try {
    const worker = await buildWorker(connection);
    console.info("starting example-plan worker");
    await worker.run();
  } finally {
    await connection.close();
  }
}

await serve();
