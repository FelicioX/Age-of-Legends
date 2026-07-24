/**
 * @aol/engine — the reusable runtime for Age of Legends.
 *
 * Provides the deterministic ECS core and the fixed-step loop. Contains no
 * game rules; those live in `@aol/game`. Depends only on `@aol/shared`.
 */
export * from './ecs/index.js';
export * from './loop/fixed-step.js';
