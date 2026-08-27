import { describe, expect, test } from "bun:test";
import { ApplicationFailure } from "@temporalio/common";
import { z } from "zod";
import { NonEmptyStringSchema } from "../src/primitives.ts";
import { parsePayloadOrFail } from "../src/orchestration/failures.ts";

describe("NonEmptyStringSchema", () => {
  test("accepts non-blank strings without transforming them", () => {
    const value = "  work-id  ";
    expect(String(NonEmptyStringSchema.parse(value))).toBe(value);
  });

  test("rejects empty and whitespace-only strings", () => {
    expect(NonEmptyStringSchema.safeParse("").success).toBeFalse();
    expect(NonEmptyStringSchema.safeParse("   ").success).toBeFalse();
  });
});

test("malformed Temporal payloads become non-retryable failures", () => {
  const schema = z.object({ value: NonEmptyStringSchema }).readonly();

  try {
    parsePayloadOrFail(schema, { value: " " });
    throw new Error("expected payload validation to fail");
  } catch (error: unknown) {
    expect(error).toBeInstanceOf(ApplicationFailure);
    expect((error as ApplicationFailure).nonRetryable).toBeTrue();
    expect((error as ApplicationFailure).type).toBe("ValidationError");
    expect((error as ApplicationFailure).message).toBe("Payload validation failed");
  }
});
