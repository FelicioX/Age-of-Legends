import { describe, it, expect } from 'vitest';
import { hashStringToUint32, mixSeeds } from './hash.js';

describe('hash', () => {
  it('is deterministic', () => {
    expect(hashStringToUint32('shard-01')).toBe(hashStringToUint32('shard-01'));
  });

  it('returns an unsigned 32-bit integer', () => {
    const h = hashStringToUint32('age-of-legends');
    expect(Number.isInteger(h)).toBe(true);
    expect(h).toBeGreaterThanOrEqual(0);
    expect(h).toBeLessThanOrEqual(0xffffffff);
  });

  it('distinguishes different inputs', () => {
    expect(hashStringToUint32('a')).not.toBe(hashStringToUint32('b'));
  });

  it('hashes the empty string to the FNV offset basis', () => {
    expect(hashStringToUint32('')).toBe(0x811c9dc5);
  });

  it('mixes two seeds deterministically into a uint32', () => {
    const m = mixSeeds(123, 456);
    expect(mixSeeds(123, 456)).toBe(m);
    expect(m).toBeGreaterThanOrEqual(0);
    expect(m).toBeLessThanOrEqual(0xffffffff);
    expect(mixSeeds(456, 123)).not.toBe(m);
  });
});
