import { proxyActivities } from "@temporalio/workflow";
import type { z } from "zod";
import type { ZodModel } from "../primitives.ts";
import type { ActivityName } from "./activities/names.ts";
import type { ActivityContract } from "./contracts.ts";
import { parsePayloadOrFail } from "./failures.ts";

type TemporalActivities = Record<ActivityName, (arg: unknown) => Promise<unknown>>;

export async function executeActivity<TIn extends ZodModel, TOut extends ZodModel>(
  contract: ActivityContract<TIn, TOut>,
  arg: z.output<TIn>,
): Promise<z.output<TOut>> {
  const activities = proxyActivities<TemporalActivities>({
    taskQueue: contract.queue,
    startToCloseTimeout: contract.startToClose,
  });
  const result = await activities[contract.name](arg);
  return parsePayloadOrFail(contract.out, result, `${contract.name} activity output`);
}
