import { expect, test } from "bun:test";
import { loadTemporalConnection } from "../../src/orchestration/config.ts";

test("Temporal connection uses local defaults", () => {
  expect(loadTemporalConnection({}, {})).toEqual({
    target: "localhost:7233",
    namespace: "default",
  });
});

test("Temporal connection uses the environment", () => {
  expect(
    loadTemporalConnection(
      {},
      { TEMPORAL_TARGET: "temporal.example.test:7233", TEMPORAL_NAMESPACE: "example" },
    ),
  ).toEqual({
    target: "temporal.example.test:7233",
    namespace: "example",
  });
});

test("Temporal connection uses explicit overrides over the environment", () => {
  expect(
    loadTemporalConnection(
      { target: "override:7233", namespace: "override" },
      { TEMPORAL_TARGET: "temporal.example.test:7233", TEMPORAL_NAMESPACE: "example" },
    ),
  ).toEqual({
    target: "override:7233",
    namespace: "override",
  });
});
