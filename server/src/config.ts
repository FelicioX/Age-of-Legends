import { SIM_TICK_RATE, NET_SNAPSHOT_RATE } from '@aol/shared';

/** Read an integer environment variable, falling back to a default. */
function envInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/** Read a string environment variable, falling back to a default. */
function envStr(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

/** Effective server configuration, resolved from the environment. */
export interface ServerConfig {
  readonly apiHost: string;
  readonly apiPort: number;
  readonly wsHost: string;
  readonly wsPort: number;
  readonly simTickRate: number;
  readonly snapshotRate: number;
  readonly shardId: string;
  readonly worldSeed: string;
}

export function loadConfig(): ServerConfig {
  return {
    apiHost: envStr('API_HOST', '0.0.0.0'),
    apiPort: envInt('API_PORT', 4000),
    wsHost: envStr('WS_HOST', '0.0.0.0'),
    wsPort: envInt('WS_PORT', 4001),
    simTickRate: envInt('SIM_TICK_RATE', SIM_TICK_RATE),
    snapshotRate: envInt('NET_SNAPSHOT_RATE', NET_SNAPSHOT_RATE),
    shardId: envStr('SHARD_ID', 'shard-01'),
    worldSeed: envStr('WORLD_SEED', 'age-of-legends-0001'),
  };
}
