import { Vec2Math } from '@aol/shared';
import { type System, type World } from '@aol/engine';
import { Position, Velocity } from '../components/movement.js';

/**
 * Integrates velocity into position for every moving entity.
 *
 * Uses semi-implicit Euler integration over the fixed step. Velocity is
 * expressed in units per second, so the millisecond step is converted to
 * seconds before integration. This is the canonical example of a deterministic
 * gameplay system: pure data in, pure data out, no I/O.
 */
export const MovementSystem: System = {
  name: 'MovementSystem',
  update(world: World, dtMs: number): void {
    const dtSeconds = dtMs / 1000;
    for (const entity of world.query(Position, Velocity)) {
      const position = world.getComponent(entity, Position);
      const velocity = world.getComponent(entity, Velocity);
      // The query guarantees both components are present, but narrow explicitly.
      if (position === undefined || velocity === undefined) continue;
      const next = Vec2Math.add(position, Vec2Math.scale(velocity, dtSeconds));
      world.addComponent(entity, Position, next);
    }
  },
};
