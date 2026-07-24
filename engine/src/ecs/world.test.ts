import { describe, it, expect } from 'vitest';
import { World } from './world.js';
import { defineComponent } from './component.js';
import { type System } from './system.js';

interface Position {
  x: number;
  y: number;
}
const PositionC = defineComponent<Position>('Position');
const TagC = defineComponent<true>('Tag');

describe('World', () => {
  it('creates and destroys entities', () => {
    const world = new World(1);
    const a = world.createEntity();
    const b = world.createEntity();
    expect(world.entityCount).toBe(2);
    expect(world.isAlive(a)).toBe(true);

    world.destroyEntity(a);
    expect(world.isAlive(a)).toBe(false);
    expect(world.entityCount).toBe(1);
    expect(world.isAlive(b)).toBe(true);
  });

  it('adds, reads, checks and removes components', () => {
    const world = new World(1);
    const e = world.createEntity();
    world.addComponent(e, PositionC, { x: 1, y: 2 });

    expect(world.hasComponent(e, PositionC)).toBe(true);
    expect(world.getComponent(e, PositionC)).toEqual({ x: 1, y: 2 });

    world.removeComponent(e, PositionC);
    expect(world.hasComponent(e, PositionC)).toBe(false);
    expect(world.getComponent(e, PositionC)).toBeUndefined();
  });

  it('throws when adding a component to a dead entity', () => {
    const world = new World(1);
    const e = world.createEntity();
    world.destroyEntity(e);
    expect(() => world.addComponent(e, PositionC, { x: 0, y: 0 })).toThrow();
  });

  it('queries entities having all requested components, in creation order', () => {
    const world = new World(1);
    const a = world.createEntity();
    const b = world.createEntity();
    const c = world.createEntity();

    world.addComponent(a, PositionC, { x: 0, y: 0 });
    world.addComponent(a, TagC, true);
    world.addComponent(b, PositionC, { x: 0, y: 0 });
    world.addComponent(c, TagC, true);

    expect(world.query(PositionC)).toEqual([a, b]);
    expect(world.query(PositionC, TagC)).toEqual([a]);
    expect(world.query(TagC)).toEqual([a, c]);
  });

  it('destroying an entity clears its components', () => {
    const world = new World(1);
    const e = world.createEntity();
    world.addComponent(e, PositionC, { x: 5, y: 5 });
    world.destroyEntity(e);
    expect(world.query(PositionC)).toEqual([]);
  });

  it('runs systems in order and advances the tick', () => {
    const world = new World(1);
    const order: string[] = [];
    const first: System = { name: 'first', update: () => order.push('first') };
    const second: System = { name: 'second', update: () => order.push('second') };
    world.addSystem(first).addSystem(second);

    expect(world.tick).toBe(0);
    world.step(50);
    expect(order).toEqual(['first', 'second']);
    expect(world.tick).toBe(1);
  });

  it('is deterministic across two identical runs', () => {
    const run = (): number[] => {
      const world = new World('age-of-legends');
      const results: number[] = [];
      const system: System = {
        name: 'rng',
        update: (w) => results.push(w.rng.nextUint32()),
      };
      world.addSystem(system);
      for (let i = 0; i < 10; i++) world.step(50);
      return results;
    };
    expect(run()).toEqual(run());
  });
});
