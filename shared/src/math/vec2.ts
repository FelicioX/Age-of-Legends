import { type Vec2 } from '../types/primitives.js';

/** Construct a vector. */
export function vec2(x: number, y: number): Vec2 {
  return { x, y };
}

export const ZERO: Vec2 = Object.freeze({ x: 0, y: 0 });

export function add(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function subtract(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function scale(v: Vec2, factor: number): Vec2 {
  return { x: v.x * factor, y: v.y * factor };
}

export function dot(a: Vec2, b: Vec2): number {
  return a.x * b.x + a.y * b.y;
}

export function lengthSquared(v: Vec2): number {
  return v.x * v.x + v.y * v.y;
}

export function length(v: Vec2): number {
  return Math.sqrt(lengthSquared(v));
}

export function distanceSquared(a: Vec2, b: Vec2): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

export function distance(a: Vec2, b: Vec2): number {
  return Math.sqrt(distanceSquared(a, b));
}

/** Return a unit-length vector; the zero vector is returned unchanged. */
export function normalize(v: Vec2): Vec2 {
  const len = length(v);
  if (len === 0) return ZERO;
  return { x: v.x / len, y: v.y / len };
}

/** Component-wise linear interpolation. */
export function lerpVec2(a: Vec2, b: Vec2, t: number): Vec2 {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

/** Clamp a vector's magnitude to `maxLength`. */
export function clampLength(v: Vec2, maxLength: number): Vec2 {
  const lenSq = lengthSquared(v);
  if (lenSq <= maxLength * maxLength) return v;
  const len = Math.sqrt(lenSq);
  return { x: (v.x / len) * maxLength, y: (v.y / len) * maxLength };
}

export function equals(a: Vec2, b: Vec2): boolean {
  return a.x === b.x && a.y === b.y;
}
