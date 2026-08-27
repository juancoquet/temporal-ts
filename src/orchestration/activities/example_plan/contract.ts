import { ExamplePlanSchema, ExampleRequestSchema } from "../../../example/models.ts";
import { createActivityContract } from "../../contracts.ts";
import { ActivityName } from "../names.ts";

export const EXAMPLE_PLAN_ACTIVITY = createActivityContract({
  name: ActivityName.EXAMPLE_PLAN,
  arg: ExampleRequestSchema,
  out: ExamplePlanSchema,
  startToClose: "2 minutes",
});
