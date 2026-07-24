import { describe, it, expect } from 'vitest';
import { parseClientMessage } from './parse.js';

describe('parseClientMessage', () => {
  it('accepts a valid move intent', () => {
    const raw = JSON.stringify({
      type: 'move',
      seq: 1,
      target: { x: 10, y: 20 },
      facing: 'north',
    });
    const result = parseClientMessage(raw);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.type).toBe('move');
    }
  });

  it('accepts a handshake', () => {
    const raw = JSON.stringify({ type: 'handshake', protocolVersion: 1, token: 'abc' });
    expect(parseClientMessage(raw).ok).toBe(true);
  });

  it('rejects invalid JSON', () => {
    const result = parseClientMessage('{ not json');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('invalid_json');
  });

  it('rejects an unknown message type', () => {
    const raw = JSON.stringify({ type: 'teleport', seq: 1 });
    expect(parseClientMessage(raw).ok).toBe(false);
  });

  it('rejects a move intent with a non-finite coordinate', () => {
    const raw = JSON.stringify({
      type: 'move',
      seq: 1,
      target: { x: 'oops', y: 0 },
      facing: 'north',
    });
    expect(parseClientMessage(raw).ok).toBe(false);
  });

  it('rejects a move intent with an invalid facing', () => {
    const raw = JSON.stringify({
      type: 'move',
      seq: 1,
      target: { x: 0, y: 0 },
      facing: 'up',
    });
    expect(parseClientMessage(raw).ok).toBe(false);
  });

  it('rejects a negative sequence number', () => {
    const raw = JSON.stringify({
      type: 'gather',
      seq: -1,
      nodeEntityId: 3,
    });
    expect(parseClientMessage(raw).ok).toBe(false);
  });

  it('accepts an optional target on useSkill', () => {
    const withTarget = parseClientMessage(
      JSON.stringify({ type: 'useSkill', seq: 2, skillId: 'cleave', targetEntityId: 9 }),
    );
    const withoutTarget = parseClientMessage(
      JSON.stringify({ type: 'useSkill', seq: 3, skillId: 'cleave' }),
    );
    expect(withTarget.ok).toBe(true);
    expect(withoutTarget.ok).toBe(true);
  });
});
