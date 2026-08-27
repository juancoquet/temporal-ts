import type { ExampleItem, ExampleResult } from "./models.ts";

export class EchoService {
  async handle(item: ExampleItem): Promise<ExampleResult> {
    return { work_id: item.work_id, index: item.index };
  }
}

export function productionExampleService(): EchoService {
  return new EchoService();
}
