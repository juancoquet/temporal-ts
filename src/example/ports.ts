import type { ExampleItem, ExampleResult } from "./models.ts";

export interface ExampleService {
  handle(item: ExampleItem): Promise<ExampleResult>;
}
