import type { NativeConnection } from "@temporalio/worker";
import { Worker } from "@temporalio/worker";
import type { z } from "zod";
import type { ZodModel } from "../primitives.ts";
import type { ActivityContract, WorkflowContract } from "./contracts.ts";
import { parsePayloadOrFail } from "./failures.ts";

export type ActivityImpl<TIn extends ZodModel, TOut extends ZodModel> = (
  arg: z.output<TIn>,
) => Promise<z.output<TOut>>;

type ActivityContractShape = ActivityContract<ZodModel, ZodModel>;

type ActivityImplFor<TContract extends ActivityContractShape> = ActivityImpl<
  TContract["arg"],
  TContract["out"]
>;

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

export async function buildActivityWorker<const TContract extends ActivityContractShape>(
  connection: NativeConnection,
  contract: TContract,
  // Infer payload types from the contract alone, then check the implementation against them.
  impl: NoInfer<ActivityImplFor<TContract>>,
): Promise<Worker> {
  const validatedImpl = async (rawArg: unknown): Promise<z.output<TContract["out"]>> => {
    const arg = parsePayloadOrFail<TContract["arg"]>(
      contract.arg,
      rawArg,
      `${contract.name} activity input`,
    );
    return impl(arg);
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
