import type { ExampleItem, ExampleResult } from "../../../example/models.ts";
import type { ExampleService } from "../../../example/ports.ts";

export function createExampleProcessActivity(
  service: ExampleService,
): (item: ExampleItem) => Promise<ExampleResult> {
  return async (item: ExampleItem): Promise<ExampleResult> => service.handle(item);
}
