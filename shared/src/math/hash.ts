/**
 * Deterministic, platform-independent hashing.
 *
 * Used to derive stable numeric seeds from strings (world seeds, shard ids) so
 * that the same textual seed always produces the same simulation. Implements
 * the 32-bit FNV-1a hash, which is fast, simple and well-distributed for short
 * strings.
 */

const FNV_OFFSET_BASIS = 0x811c9dc5;
const FNV_PRIME = 0x01000193;

/** Hash a string to an unsigned 32-bit integer using FNV-1a. */
export function hashStringToUint32(input: string): number {
  let hash = FNV_OFFSET_BASIS;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i) & 0xff;
    // Multiply by the FNV prime using Math.imul to stay within 32-bit space.
    hash = Math.imul(hash, FNV_PRIME);
  }
  // Coerce to unsigned 32-bit.
  return hash >>> 0;
}

/**
 * Mix two 32-bit integers into a new well-distributed 32-bit integer.
 *
 * The combination is order-dependent: `mixSeeds(a, b)` differs from
 * `mixSeeds(b, a)`. This matters when deriving distinct sub-seeds from the same
 * pair of inputs (for example, per-shard or per-entity streams).
 */
export function mixSeeds(a: number, b: number): number {
  let h = ((a >>> 0) ^ 0x9e3779b9) >>> 0;
  h = Math.imul(h, 0x85ebca6b) >>> 0;
  h = (h ^ (b >>> 0)) >>> 0;
  h = Math.imul(h, 0xc2b2ae35) >>> 0;
  h ^= h >>> 16;
  return h >>> 0;
}
