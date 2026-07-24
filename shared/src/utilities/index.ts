/** Small, side-effect-free helpers shared across packages. */

/** Assert that a value is non-null/undefined, narrowing its type. */
export function assertDefined<T>(value: T | null | undefined, message?: string): T {
  if (value === null || value === undefined) {
    throw new Error(message ?? 'Expected value to be defined');
  }
  return value;
}

/**
 * Exhaustiveness helper for discriminated unions. Placing this in the
 * `default` branch of a switch makes the compiler flag any unhandled case.
 */
export function assertNever(value: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(value)}`);
}

/** Return a shallow, readonly-frozen copy of an object. */
export function freeze<T extends object>(value: T): Readonly<T> {
  return Object.freeze({ ...value });
}

/** Clamp an integer into an inclusive range and floor it. */
export function toIntInRange(value: number, min: number, max: number): number {
  const floored = Math.floor(value);
  if (floored < min) return min;
  if (floored > max) return max;
  return floored;
}
