import { z } from "zod";
import { NonEmptyStringSchema } from "../primitives.ts";

const IntegerSchema = z.preprocess(coerceInteger, z.number().int());

export const ExampleRequestSchema = z
  .object({
    work_id: NonEmptyStringSchema,
  })
  .readonly();
export type ExampleRequest = z.output<typeof ExampleRequestSchema>;

export const ExampleItemSchema = z
  .object({
    work_id: NonEmptyStringSchema,
    index: IntegerSchema,
  })
  .readonly();
export type ExampleItem = z.output<typeof ExampleItemSchema>;

export const ExamplePlanSchema = z
  .object({
    items: z.array(ExampleItemSchema).readonly(),
  })
  .readonly();
export type ExamplePlan = z.output<typeof ExamplePlanSchema>;

export const ExampleResultSchema = z
  .object({
    work_id: NonEmptyStringSchema,
    index: IntegerSchema,
  })
  .readonly();
export type ExampleResult = z.output<typeof ExampleResultSchema>;

function coerceInteger(value: unknown): unknown {
  if (typeof value === "boolean") {
    return Number(value);
  }
  if (typeof value === "string") {
    const normalized = value.trim();
    if (/^[+-]?\d(?:_?\d)*(?:\.0+)?$/.test(normalized)) {
      return Number(normalized.replaceAll("_", ""));
    }
  }
  return value;
}
