import type { ExampleItem, ExampleResult } from "./models.ts";

export class EchoService {
  async handle(item: ExampleItem): Promise<ExampleResult> {
    return { workId: item.workId, index: item.index };
  }
}

export function productionExampleService(): EchoService {
  return new EchoService();
}
