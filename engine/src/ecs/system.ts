import { type World } from './world.js';

/**
 * A system advances the simulation by reading and writing component data for
 * entities that match its needs. Systems run in registration order once per
 * fixed step. They must be deterministic: no wall-clock time, no unscoped
 * randomness (use `world.rng`), and stable iteration (use `world.query`).
 */
export interface System {
  readonly name: string;
  /**
   * @param world The world being simulated.
   * @param dtMs  The fixed step duration in milliseconds.
   */
  update(world: World, dtMs: number): void;
}
