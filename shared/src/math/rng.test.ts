import { describe, it, expect } from 'vitest';
import { Rng } from './rng.js';

describe('Rng', () => {
  it('is deterministic for the same seed and call sequence', () => {
    const a = new Rng(12345);
    const b = new Rng(12345);
    const seqA = Array.from({ length: 20 }, () => a.nextUint32());
    const seqB = Array.from({ length: 20 }, () => b.nextUint32());
    expect(seqA).toEqual(seqB);
  });

  it('produces different streams for different seeds', () => {
    const a = new Rng(1);
    const b = new Rng(2);
    expect(a.nextUint32()).not.toBe(b.nextUint32());
  });

  it('derives a stable seed from a string', () => {
    const a = Rng.fromString('age-of-legends');
    const b = Rng.fromString('age-of-legends');
    expect(a.nextUint32()).toBe(b.nextUint32());
  });

  it('produces floats in [0, 1)', () => {
    const rng = new Rng(99);
    for (let i = 0; i < 1000; i++) {
      const f = rng.nextFloat();
      expect(f).toBeGreaterThanOrEqual(0);
      expect(f).toBeLessThan(1);
    }
  });

  it('produces integers within an inclusive range', () => {
    const rng = new Rng(7);
    for (let i = 0; i < 1000; i++) {
      const n = rng.nextInt(3, 6);
      expect(n).toBeGreaterThanOrEqual(3);
      expect(n).toBeLessThanOrEqual(6);
    }
  });

  it('throws when nextInt bounds are inverted', () => {
    const rng = new Rng(1);
    expect(() => rng.nextInt(5, 1)).toThrow(RangeError);
  });

  it('snapshots and restores state', () => {
    const rng = new Rng(42);
    rng.nextUint32();
    const state = rng.getState();
    const expected = rng.nextUint32();

    const restored = new Rng(0);
    restored.setState(state);
    expect(restored.nextUint32()).toBe(expected);
  });

  it('clones independently', () => {
    const rng = new Rng(2024);
    rng.nextUint32();
    const clone = rng.clone();
    expect(clone.nextUint32()).toBe(rng.nextUint32());
  });

  it('shuffles deterministically without mutating the input', () => {
    const input = [1, 2, 3, 4, 5];
    const s1 = new Rng(5).shuffle(input);
    const s2 = new Rng(5).shuffle(input);
    expect(s1).toEqual(s2);
    expect(input).toEqual([1, 2, 3, 4, 5]);
    expect(s1.slice().sort()).toEqual(input);
  });

  it('picks from a non-empty array and throws on empty', () => {
    const rng = new Rng(3);
    expect([10, 20, 30]).toContain(rng.pick([10, 20, 30]));
    expect(() => rng.pick([])).toThrow(RangeError);
  });
});
