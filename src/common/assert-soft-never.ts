export function assertSoftNever(shouldBeNever: never, fallback: unknown): never {
  return fallback as never;
}
