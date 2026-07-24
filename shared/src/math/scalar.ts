/** Scalar helpers used throughout the deterministic simulation. */

export const EPSILON = 1e-6;

/** Clamp `value` into the inclusive range [min, max]. */
export function clamp(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

/** Linear interpolation between `a` and `b` by `t` (t is not clamped). */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Inverse lerp: the position of `value` within [a, b], undefined range guarded. */
export function inverseLerp(a: number, b: number, value: number): number {
  if (Math.abs(b - a) < EPSILON) return 0;
  return (value - a) / (b - a);
}

/** Approximate equality within EPSILON. */
export function approxEqual(a: number, b: number, epsilon: number = EPSILON): boolean {
  return Math.abs(a - b) <= epsilon;
}

/** Move `current` toward `target` by at most `maxDelta`. */
export function moveToward(current: number, target: number, maxDelta: number): number {
  if (Math.abs(target - current) <= maxDelta) return target;
  return current + Math.sign(target - current) * maxDelta;
}

/** Wrap `value` into the half-open range [0, range). */
export function wrap(value: number, range: number): number {
  if (range <= 0) return 0;
  const result = value % range;
  return result < 0 ? result + range : result;
}
