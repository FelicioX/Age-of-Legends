import { hashStringToUint32 } from './hash.js';

/**
 * Deterministic pseudo-random number generator.
 *
 * The simulation must be reproducible: identical seed and identical call
 * sequence must yield identical output on every platform. This implements the
 * `mulberry32` algorithm — a small, fast, well-distributed 32-bit PRNG whose
 * entire state is a single unsigned 32-bit integer, making it trivial to seed,
 * snapshot and restore.
 *
 * Never use `Math.random()` inside the simulation; use an instance of this
 * generator owned by the world.
 */
export class Rng {
  private state: number;

  constructor(seed: number) {
    // Normalize to unsigned 32-bit; avoid a zero state.
    this.state = seed >>> 0 || 0x1a2b3c4d;
  }

  /** Create a generator from a textual seed (e.g. a world seed). */
  static fromString(seed: string): Rng {
    return new Rng(hashStringToUint32(seed));
  }

  /** Current internal state, for snapshotting. */
  getState(): number {
    return this.state >>> 0;
  }

  /** Restore a previously captured state. */
  setState(state: number): void {
    this.state = state >>> 0 || 0x1a2b3c4d;
  }

  /** Return an independent copy with the same state. */
  clone(): Rng {
    return new Rng(this.state);
  }

  /** Next unsigned 32-bit integer in [0, 2^32). */
  nextUint32(): number {
    // mulberry32
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return (t ^ (t >>> 14)) >>> 0;
  }

  /** Next float in the half-open range [0, 1). */
  nextFloat(): number {
    return this.nextUint32() / 0x1_0000_0000;
  }

  /**
   * Next integer in the inclusive range [min, max].
   * Throws if `min > max`.
   */
  nextInt(min: number, max: number): number {
    if (min > max) throw new RangeError(`nextInt: min (${min}) > max (${max})`);
    const span = max - min + 1;
    return min + Math.floor(this.nextFloat() * span);
  }

  /** Next boolean with the given probability of `true` (default 0.5). */
  nextBool(probability = 0.5): boolean {
    return this.nextFloat() < probability;
  }

  /** Pick a uniformly random element; throws on an empty array. */
  pick<T>(items: readonly T[]): T {
    if (items.length === 0) throw new RangeError('pick: empty array');
    const index = this.nextInt(0, items.length - 1);
    // Index is provably within bounds; the non-null assertion documents that.
    return items[index] as T;
  }

  /**
   * Return a new array that is a deterministic Fisher–Yates shuffle of `items`.
   * The input is not mutated.
   */
  shuffle<T>(items: readonly T[]): T[] {
    const result = items.slice();
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      const a = result[i] as T;
      const b = result[j] as T;
      result[i] = b;
      result[j] = a;
    }
    return result;
  }
}
