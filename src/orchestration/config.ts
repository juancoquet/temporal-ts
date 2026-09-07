const DEFAULT_TARGET = "localhost:7233";
const DEFAULT_NAMESPACE = "default";
const TARGET_ENV = "TEMPORAL_TARGET";
const NAMESPACE_ENV = "TEMPORAL_NAMESPACE";

export type TemporalConnection = Readonly<{
  target: string;
  namespace: string;
}>;

type TemporalConnectionOverrides = Readonly<{
  target?: string;
  namespace?: string;
}>;

export function loadTemporalConnection(
  overrides: TemporalConnectionOverrides = {},
  env: NodeJS.ProcessEnv = process.env,
): TemporalConnection {
  return Object.freeze({
    target: overrides.target ?? env[TARGET_ENV] ?? DEFAULT_TARGET,
    namespace: overrides.namespace ?? env[NAMESPACE_ENV] ?? DEFAULT_NAMESPACE,
  });
}
