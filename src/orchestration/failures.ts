import { ApplicationFailure } from "@temporalio/common";
import type { z } from "zod";

const VALIDATION_ERROR_TYPE = "ValidationError";

export function parsePayloadOrFail<TSchema extends z.ZodType>(
  schema: TSchema,
  value: unknown,
): z.output<TSchema> {
  const parsed = schema.safeParse(value);
  if (parsed.success) {
    return parsed.data;
  }

  throw ApplicationFailure.nonRetryable("Payload validation failed", VALIDATION_ERROR_TYPE);
}
