import { expect, test } from "bun:test";
import { ExampleItemSchema } from "../src/example/models.ts";

test("integer fields preserve Pydantic's JSON coercion behaviour", () => {
  expect(ExampleItemSchema.parse({ work_id: "doc-1", index: " 1_0 " }).index).toBe(10);
  expect(ExampleItemSchema.parse({ work_id: "doc-1", index: "01.00" }).index).toBe(1);
  expect(ExampleItemSchema.parse({ work_id: "doc-1", index: true }).index).toBe(1);
  expect(ExampleItemSchema.parse({ work_id: "doc-1", index: 1.0 }).index).toBe(1);

  expect(ExampleItemSchema.safeParse({ work_id: "doc-1", index: "" }).success).toBeFalse();
  expect(ExampleItemSchema.safeParse({ work_id: "doc-1", index: "1e2" }).success).toBeFalse();
  expect(ExampleItemSchema.safeParse({ work_id: "doc-1", index: "1.2" }).success).toBeFalse();
});
