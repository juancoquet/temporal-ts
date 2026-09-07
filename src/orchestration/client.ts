import { Client, Connection } from "@temporalio/client";
import type { z } from "zod";
import type { ZodModel } from "../primitives.ts";
import { loadTemporalConnection, type TemporalConnection } from "./config.ts";
import type { WorkflowContract } from "./contracts.ts";
import { parsePayloadOrFail } from "./failures.ts";
import type { WorkflowFn } from "./workflow.ts";

type WorkflowExecutionOptions = Readonly<{
  workflowId?: string;
}>;

export type ConnectedClient = Readonly<{
  client: Client;
  connection: Connection;
}>;

export async function connectClient(
  config: TemporalConnection = loadTemporalConnection(),
): Promise<ConnectedClient> {
  const connection = await Connection.connect({ address: config.target });
  return {
    connection,
    client: new Client({ connection, namespace: config.namespace }),
  };
}

export async function executeWorkflow<TIn extends ZodModel, TOut extends ZodModel>(
  client: Client,
  contract: WorkflowContract<TIn, TOut>,
  arg: z.output<TIn>,
  options: WorkflowExecutionOptions = {},
): Promise<z.output<TOut>> {
  const result = await client.workflow.execute<WorkflowFn<TIn, TOut>>(contract.name, {
    args: [arg],
    workflowId: options.workflowId ?? contract.key(arg),
    taskQueue: contract.queue,
    workflowExecutionTimeout: contract.executionTimeout,
  });
  return parsePayloadOrFail(contract.out, result);
}
