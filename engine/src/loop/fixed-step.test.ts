import { describe, it, expect } from 'vitest';
import { FixedStepLoop } from './fixed-step.js';

describe('FixedStepLoop', () => {
  it('runs one step when exactly one step of time elapses', () => {
    const loop = new FixedStepLoop(50);
    let steps = 0;
    const alpha = loop.advance(50, () => steps++);
    expect(steps).toBe(1);
    expect(alpha).toBeCloseTo(0);
  });

  it('accumulates fractional time across advances', () => {
    const loop = new FixedStepLoop(50);
    let steps = 0;
    loop.advance(30, () => steps++);
    expect(steps).toBe(0);
    loop.advance(30, () => steps++);
    expect(steps).toBe(1); // 60ms accumulated -> one 50ms step, 10ms remainder
  });

  it('reports the interpolation fraction', () => {
    const loop = new FixedStepLoop(50);
    const alpha = loop.advance(75, () => {});
    // 75ms -> one step, 25ms remainder -> alpha 0.5
    expect(alpha).toBeCloseTo(0.5);
  });

  it('runs multiple steps for a large elapsed time', () => {
    const loop = new FixedStepLoop(50);
    let steps = 0;
    loop.advance(160, () => steps++);
    expect(steps).toBe(3);
  });

  it('caps steps to avoid a spiral of death', () => {
    const loop = new FixedStepLoop(50, 5);
    let steps = 0;
    loop.advance(100000, () => steps++);
    expect(steps).toBe(5);
    // Backlog is dropped; the next small advance does not replay it.
    steps = 0;
    loop.advance(50, () => steps++);
    expect(steps).toBe(1);
  });

  it('rejects a non-positive step', () => {
    expect(() => new FixedStepLoop(0)).toThrow(RangeError);
  });
});
