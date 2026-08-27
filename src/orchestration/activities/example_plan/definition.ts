import type { ExamplePlan, ExampleRequest } from "../../../example/models.ts";
import { buildPlan } from "../../../example/plan.ts";

export async function examplePlan(request: ExampleRequest): Promise<ExamplePlan> {
  return buildPlan(request);
}
