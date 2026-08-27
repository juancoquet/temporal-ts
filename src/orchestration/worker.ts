import type { NativeConnection } from "@temporalio/worker";
import { Worker } from "@temporalio/worker";
import type { z } from "zod";
import type { ZodModel } from "../primitives.ts";
import type { ActivityContract, WorkflowContract } from "./contracts.ts";
import { parsePayloadOrFail } from "./failures.ts";

export type ActivityImpl<TIn extends ZodModel, TOut extends ZodModel> = (
  arg: z.output<TIn>,
) => Promise<z.output<TOut>>;

type SameType<Left, Right> = [Left] extends [Right]
  ? [Right] extends [Left]
    ? unknown
    : never
  : never;

type CongruentActivityImpl<
  TIn extends ZodModel,
  TOut extends ZodModel,
  TImpl extends (...args: never[]) => Promise<unknown>,
> = TImpl &
  SameType<Parameters<TImpl>, [arg: z.output<TIn>]> &
  SameType<Awaited<ReturnType<TImpl>>, z.output<TOut>>;

export type WorkflowWorkerMode = "development" | "production";

export type WorkflowCode =
  | { workflowsPath: string; workflowBundle?: never }
  | { workflowsPath?: never; workflowBundle: { codePath: string } };

export function workflowWorkerModeFromEnvironment(
  env: NodeJS.ProcessEnv = process.env,
): WorkflowWorkerMode {
  const deploymentEnvironment = env.DEPLOYMENT_ENVIRONMENT?.toLowerCase();
  return deploymentEnvironment === "local" || deploymentEnvironment === "development"
    ? "development"
    : "production";
}

export async function buildActivityWorker<
  TIn extends ZodModel,
  TOut extends ZodModel,
  TImpl extends (...args: never[]) => Promise<unknown>,
>(
  connection: NativeConnection,
  contract: ActivityContract<TIn, TOut>,
  impl: CongruentActivityImpl<TIn, TOut, TImpl>,
): Promise<Worker> {
  const congruentImpl = impl as ActivityImpl<TIn, TOut>;
  const validatedImpl = async (rawArg: unknown): Promise<z.output<TOut>> => {
    const arg = parsePayloadOrFail(contract.arg, rawArg, `${contract.name} activity input`);
    return congruentImpl(arg);
  };

  return Worker.create({
    connection,
    taskQueue: contract.queue,
    activities: { [contract.name]: validatedImpl },
  });
}

export async function buildWorkflowWorker<TIn extends ZodModel, TOut extends ZodModel>(
  connection: NativeConnection,
  contract: WorkflowContract<TIn, TOut>,
  workflowCode: WorkflowCode,
): Promise<Worker> {
  return Worker.create({
    connection,
    taskQueue: contract.queue,
    ...workflowCode,
  });
}
