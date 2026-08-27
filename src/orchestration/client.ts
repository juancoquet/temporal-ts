import { Client, Connection } from "@temporalio/client";
import type { z } from "zod";
import type { ZodModel } from "../primitives.ts";
import type { WorkflowContract } from "./contracts.ts";
import type { WorkflowFn } from "./workflow.ts";

const TARGET = "localhost:7233";
const NAMESPACE = "default";

type WorkflowExecutionOptions = Readonly<{
  workflowId?: string;
}>;

export type ConnectedClient = Readonly<{
  client: Client;
  connection: Connection;
}>;

export async function connectClient(): Promise<ConnectedClient> {
  const connection = await Connection.connect({ address: TARGET });
  return {
    connection,
    client: new Client({ connection, namespace: NAMESPACE }),
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
  return contract.out.parse(result);
}
