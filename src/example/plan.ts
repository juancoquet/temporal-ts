import type { ExamplePlan, ExampleRequest } from "./models.ts";

export function buildPlan(request: ExampleRequest): ExamplePlan {
  return {
    items: [
      { workId: request.workId, index: 0 },
      { workId: request.workId, index: 1 },
    ],
  };
}
