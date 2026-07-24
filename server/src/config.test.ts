import { describe, it, expect, afterEach } from 'vitest';
import { SIM_TICK_RATE } from '@aol/shared';
import { loadConfig } from './config.js';

describe('loadConfig', () => {
  const saved = { ...process.env };

  afterEach(() => {
    process.env = { ...saved };
  });

  it('falls back to defaults when env vars are absent', () => {
    delete process.env.API_PORT;
    delete process.env.SIM_TICK_RATE;
    const config = loadConfig();
    expect(config.apiPort).toBe(4000);
    expect(config.simTickRate).toBe(SIM_TICK_RATE);
  });

  it('reads integer and string overrides from the environment', () => {
    process.env.API_PORT = '5000';
    process.env.SHARD_ID = 'shard-42';
    const config = loadConfig();
    expect(config.apiPort).toBe(5000);
    expect(config.shardId).toBe('shard-42');
  });

  it('ignores non-numeric integer overrides', () => {
    process.env.WS_PORT = 'not-a-number';
    expect(loadConfig().wsPort).toBe(4001);
  });
});
