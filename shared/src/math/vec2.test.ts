import { describe, it, expect } from 'vitest';
import * as V from './vec2.js';

describe('vec2', () => {
  it('adds and subtracts', () => {
    expect(V.add(V.vec2(1, 2), V.vec2(3, 4))).toEqual({ x: 4, y: 6 });
    expect(V.subtract(V.vec2(3, 4), V.vec2(1, 2))).toEqual({ x: 2, y: 2 });
  });

  it('scales and dots', () => {
    expect(V.scale(V.vec2(2, 3), 2)).toEqual({ x: 4, y: 6 });
    expect(V.dot(V.vec2(1, 0), V.vec2(0, 1))).toBe(0);
    expect(V.dot(V.vec2(2, 3), V.vec2(4, 5))).toBe(23);
  });

  it('computes length and distance', () => {
    expect(V.length(V.vec2(3, 4))).toBe(5);
    expect(V.distance(V.vec2(0, 0), V.vec2(3, 4))).toBe(5);
    expect(V.distanceSquared(V.vec2(0, 0), V.vec2(3, 4))).toBe(25);
  });

  it('normalizes, leaving the zero vector unchanged', () => {
    const n = V.normalize(V.vec2(0, 5));
    expect(n).toEqual({ x: 0, y: 1 });
    expect(V.normalize(V.ZERO)).toEqual({ x: 0, y: 0 });
  });

  it('clamps magnitude', () => {
    const clamped = V.clampLength(V.vec2(10, 0), 4);
    expect(clamped).toEqual({ x: 4, y: 0 });
    // Vectors already within range are returned as-is.
    expect(V.clampLength(V.vec2(1, 0), 4)).toEqual({ x: 1, y: 0 });
  });

  it('interpolates component-wise', () => {
    expect(V.lerpVec2(V.vec2(0, 0), V.vec2(10, 20), 0.5)).toEqual({ x: 5, y: 10 });
  });

  it('does not mutate inputs', () => {
    const a = V.vec2(1, 1);
    V.add(a, V.vec2(2, 2));
    expect(a).toEqual({ x: 1, y: 1 });
  });
});
