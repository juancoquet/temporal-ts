import { ApplicationFailure } from "@temporalio/common";
import type { z } from "zod";

const PAYLOAD_VALIDATION_FAILURE = "PayloadValidationFailure";

export function parsePayloadOrFail<TSchema extends z.ZodType>(
  schema: TSchema,
  value: unknown,
  boundary: string,
): z.output<TSchema> {
  const parsed = schema.safeParse(value);
  if (parsed.success) {
    return parsed.data;
  }

  throw ApplicationFailure.nonRetryable(
    `Malformed ${boundary}`,
    PAYLOAD_VALIDATION_FAILURE,
    parsed.error.issues,
  );
}
