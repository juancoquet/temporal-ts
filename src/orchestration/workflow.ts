import { ApplicationFailure, executeChild, workflowInfo } from "@temporalio/workflow";
import type { z } from "zod";
import type { ZodModel } from "../primitives.ts";
import type { WorkflowContract } from "./contracts.ts";
import { parsePayloadOrFail } from "./failures.ts";

export type WorkflowImpl<TIn extends ZodModel, TOut extends ZodModel> = (
  arg: z.output<TIn>,
) => Promise<z.output<TOut>>;

export type WorkflowFn<TIn extends ZodModel, TOut extends ZodModel> = (
  arg: z.output<TIn>,
) => Promise<z.output<TOut>>;

type WorkflowExecutionOptions = Readonly<{
  workflowId?: string;
}>;

export function createWorkflowDefinition<TIn extends ZodModel, TOut extends ZodModel>(
  contract: WorkflowContract<TIn, TOut>,
  // Infer payload types from the contract alone, then check the implementation against them.
  impl: NoInfer<WorkflowImpl<TIn, TOut>>,
): (rawArg: unknown) => Promise<z.output<TOut>> {
  return async (rawArg: unknown): Promise<z.output<TOut>> => {
    const actualType = workflowInfo().workflowType;
    if (actualType !== contract.name) {
      throw ApplicationFailure.nonRetryable(
        `Workflow type ${actualType} cannot run on the ${contract.queue} worker`,
        "UnexpectedWorkflowType",
      );
    }

    const arg = parsePayloadOrFail(contract.arg, rawArg, `${contract.name} workflow input`);
    const result = await impl(arg);
    return parsePayloadOrFail(contract.out, result, `${contract.name} workflow output`);
  };
}

export async function executeChildWorkflow<TIn extends ZodModel, TOut extends ZodModel>(
  contract: WorkflowContract<TIn, TOut>,
  arg: z.output<TIn>,
  options: WorkflowExecutionOptions = {},
): Promise<z.output<TOut>> {
  const result = await executeChild<WorkflowFn<TIn, TOut>>(contract.name, {
    args: [arg],
    workflowId: options.workflowId ?? contract.key(arg),
    taskQueue: contract.queue,
    workflowExecutionTimeout: contract.executionTimeout,
  });
  return parsePayloadOrFail(contract.out, result, `${contract.name} child workflow output`);
}
