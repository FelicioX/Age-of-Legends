import { describe, it, expect } from 'vitest';
import { clamp, lerp, inverseLerp, approxEqual, moveToward, wrap } from './scalar.js';

describe('scalar', () => {
  describe('clamp', () => {
    it('clamps below, within and above the range', () => {
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(15, 0, 10)).toBe(10);
    });
  });

  describe('lerp / inverseLerp', () => {
    it('interpolates linearly', () => {
      expect(lerp(0, 10, 0.5)).toBe(5);
      expect(lerp(0, 10, 0)).toBe(0);
      expect(lerp(0, 10, 1)).toBe(10);
    });

    it('inverts interpolation', () => {
      expect(inverseLerp(0, 10, 5)).toBe(0.5);
    });

    it('returns 0 for a degenerate range', () => {
      expect(inverseLerp(4, 4, 4)).toBe(0);
    });
  });

  describe('approxEqual', () => {
    it('treats near-equal values as equal', () => {
      expect(approxEqual(0.1 + 0.2, 0.3)).toBe(true);
      expect(approxEqual(1, 2)).toBe(false);
    });
  });

  describe('moveToward', () => {
    it('never overshoots the target', () => {
      expect(moveToward(0, 10, 3)).toBe(3);
      expect(moveToward(0, 10, 100)).toBe(10);
      expect(moveToward(10, 0, 4)).toBe(6);
    });
  });

  describe('wrap', () => {
    it('wraps into [0, range)', () => {
      expect(wrap(5, 4)).toBe(1);
      expect(wrap(-1, 4)).toBe(3);
      expect(wrap(4, 4)).toBe(0);
    });

    it('guards non-positive ranges', () => {
      expect(wrap(3, 0)).toBe(0);
    });
  });
});
