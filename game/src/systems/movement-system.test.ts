import { describe, it, expect } from 'vitest';
import { World } from '@aol/engine';
import { type Vec2 } from '@aol/shared';
import { Position, Velocity } from '../components/movement.js';
import { MovementSystem } from './movement-system.js';

describe('MovementSystem', () => {
  it('integrates velocity into position over a fixed step', () => {
    const world = new World(1).addSystem(MovementSystem);
    const e = world.createEntity();
    world.addComponent(e, Position, { x: 0, y: 0 });
    world.addComponent(e, Velocity, { x: 10, y: 0 }); // 10 units/second

    world.step(1000); // one second

    expect(world.getComponent(e, Position)).toEqual({ x: 10, y: 0 });
  });

  it('accumulates across multiple steps', () => {
    const world = new World(1).addSystem(MovementSystem);
    const e = world.createEntity();
    world.addComponent(e, Position, { x: 0, y: 0 });
    world.addComponent(e, Velocity, { x: 0, y: 2 });

    for (let i = 0; i < 4; i++) world.step(500); // 4 x 0.5s = 2s

    const pos = world.getComponent(e, Position) as Vec2;
    expect(pos.y).toBeCloseTo(4);
  });

  it('ignores entities without a velocity', () => {
    const world = new World(1).addSystem(MovementSystem);
    const e = world.createEntity();
    world.addComponent(e, Position, { x: 3, y: 3 });

    world.step(1000);

    expect(world.getComponent(e, Position)).toEqual({ x: 3, y: 3 });
  });

  it('is deterministic across identical runs', () => {
    const run = (): Vec2 => {
      const world = new World('seed').addSystem(MovementSystem);
      const e = world.createEntity();
      world.addComponent(e, Position, { x: 0, y: 0 });
      world.addComponent(e, Velocity, { x: 1.5, y: -0.5 });
      for (let i = 0; i < 20; i++) world.step(50);
      return world.getComponent(e, Position) as Vec2;
    };
    expect(run()).toEqual(run());
  });
});
