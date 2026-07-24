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

/** Mix two 32-bit integers into a new well-distributed 32-bit integer. */
export function mixSeeds(a: number, b: number): number {
  let h = (a ^ 0x9e3779b9) >>> 0;
  h = Math.imul(h ^ (b >>> 0), FNV_PRIME) >>> 0;
  h ^= h >>> 15;
  return h >>> 0;
}
