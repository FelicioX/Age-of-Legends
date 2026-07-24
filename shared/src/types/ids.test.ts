import { describe, it, expect } from 'vitest';
import { asEntityId, asPlayerId, asTick } from './ids.js';

describe('branded ids', () => {
  it('wrap primitive values without altering them at runtime', () => {
    expect(asEntityId(42)).toBe(42);
    expect(asPlayerId('player-1')).toBe('player-1');
    expect(asTick(0)).toBe(0);
  });
});
