import { type ResourceKind, type HeroArchetype } from '../types/primitives.js';

/**
 * Global, tunable constants for the simulation and network layer.
 *
 * These values are defaults; deployment may override the network-related ones
 * via environment configuration. Gameplay balance constants live with their
 * systems in the `game` package — only cross-cutting constants belong here.
 */

/** Authoritative simulation tick rate, in Hz. */
export const SIM_TICK_RATE = 20;

/** Duration of one fixed simulation step, in milliseconds. */
export const SIM_STEP_MS = 1000 / SIM_TICK_RATE;

/** Default snapshot broadcast rate, in Hz (decoupled from the tick). */
export const NET_SNAPSHOT_RATE = 10;

/** Maximum number of active heroes in a combat party. */
export const MAX_PARTY_SIZE = 5;

/** The canonical ordered list of the core resources. */
export const RESOURCE_KINDS: readonly ResourceKind[] = [
  'wood',
  'stone',
  'iron',
  'food',
  'gold',
] as const;

/** The canonical ordered list of hero archetypes. */
export const HERO_ARCHETYPES: readonly HeroArchetype[] = [
  'vanguard',
  'ranger',
  'mystic',
  'warden',
  'artificer',
] as const;

/** World grid tile size, in world units. */
export const TILE_SIZE = 32;

/** Half-extent of a client's area of interest, in tiles. */
export const INTEREST_RADIUS_TILES = 24;
