import { ExampleItemSchema, ExampleResultSchema } from "../../../example/models.ts";
import { createActivityContract } from "../../contracts.ts";
import { ActivityName } from "../names.ts";

export const EXAMPLE_PROCESS_ACTIVITY = createActivityContract({
  name: ActivityName.EXAMPLE_PROCESS,
  arg: ExampleItemSchema,
  out: ExampleResultSchema,
});
