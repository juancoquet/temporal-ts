import { z } from "zod";

export type ZodModel = z.ZodReadonly<z.ZodObject<z.ZodRawShape>>;

export const NonEmptyStringSchema = z
  .string()
  .min(1)
  .refine((value) => value.trim().length > 0, {
    message: "must contain non-whitespace characters",
  })
  .brand<"NonEmptyString">();

export type NonEmptyString = z.output<typeof NonEmptyStringSchema>;
