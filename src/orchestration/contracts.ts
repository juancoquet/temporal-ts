import type { Duration } from "@temporalio/common";
import type { z } from "zod";
import type { ZodModel } from "../primitives.ts";
import type { ActivityName } from "./activities/names.ts";
import type { WorkflowName } from "./workflows/names.ts";

export interface ActivityContract<TIn extends ZodModel, TOut extends ZodModel> {
  readonly name: ActivityName;
  readonly arg: TIn;
  readonly out: TOut;
  readonly startToClose: Duration;
  readonly queue: `${ActivityName}_queue`;
}

export interface WorkflowContract<TIn extends ZodModel, TOut extends ZodModel> {
  readonly name: WorkflowName;
  readonly arg: TIn;
  readonly out: TOut;
  readonly key: (arg: z.output<TIn>) => string;
  readonly executionTimeout: Duration;
  readonly queue: `${WorkflowName}_queue`;
}

type ActivityContractFields<TIn extends ZodModel, TOut extends ZodModel> = Readonly<{
  name: ActivityName;
  arg: TIn;
  out: TOut;
  startToClose?: Duration;
}>;

type WorkflowContractFields<TIn extends ZodModel, TOut extends ZodModel> = Readonly<{
  name: WorkflowName;
  arg: TIn;
  out: TOut;
  key: (arg: z.output<TIn>) => string;
  executionTimeout?: Duration;
}>;

export function createActivityContract<TIn extends ZodModel, TOut extends ZodModel>(
  fields: ActivityContractFields<TIn, TOut>,
): ActivityContract<TIn, TOut> {
  return Object.freeze({
    ...fields,
    startToClose: fields.startToClose ?? "30 minutes",
    queue: `${fields.name}_queue`,
  });
}

export function createWorkflowContract<TIn extends ZodModel, TOut extends ZodModel>(
  fields: WorkflowContractFields<TIn, TOut>,
): WorkflowContract<TIn, TOut> {
  return Object.freeze({
    ...fields,
    executionTimeout: fields.executionTimeout ?? "1 hour",
    queue: `${fields.name}_queue`,
  });
}
