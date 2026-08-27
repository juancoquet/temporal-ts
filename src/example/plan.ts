import type { ExamplePlan, ExampleRequest } from "./models.ts";

export function buildPlan(request: ExampleRequest): ExamplePlan {
  return {
    items: [
      { work_id: request.work_id, index: 0 },
      { work_id: request.work_id, index: 1 },
    ],
  };
}
