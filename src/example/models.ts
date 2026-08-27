import { z } from "zod";
import { NonEmptyStringSchema } from "../primitives.ts";

export const ExampleRequestSchema = z
  .object({
    workId: NonEmptyStringSchema,
  })
  .readonly();
export type ExampleRequest = z.output<typeof ExampleRequestSchema>;

export const ExampleItemSchema = z
  .object({
    workId: NonEmptyStringSchema,
    index: z.number().int(),
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
    workId: NonEmptyStringSchema,
    index: z.number().int(),
  })
  .readonly();
export type ExampleResult = z.output<typeof ExampleResultSchema>;
