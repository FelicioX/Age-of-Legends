import { type EntityId, asEntityId, type Tick, asTick, Rng } from '@aol/shared';
import { type ComponentType } from './component.js';
import { type System } from './system.js';

/**
 * The container of all entities, their component data and the system schedule.
 *
 * The world is the unit of simulation. It is deterministic: given the same seed
 * and the same sequence of operations and steps, it always produces the same
 * state. Entity ids are assigned in a stable, reproducible order, and
 * {@link query} iterates in entity-creation order so systems observe a
 * consistent world every step.
 */
export class World {
  /** Seeded generator; the only source of randomness the simulation may use. */
  readonly rng: Rng;

  private currentTick: Tick = asTick(0);
  private nextEntityId = 0;
  private readonly aliveEntities = new Set<number>();
  /** Entities in creation order, for stable query iteration. */
  private readonly entityOrder: number[] = [];
  /** componentTypeId -> (entityId -> component value) */
  private readonly stores = new Map<number, Map<number, unknown>>();
  private readonly systems: System[] = [];

  constructor(seed: number | string = 0) {
    this.rng = typeof seed === 'string' ? Rng.fromString(seed) : new Rng(seed);
  }

  /** The current simulation tick (number of completed steps). */
  get tick(): Tick {
    return this.currentTick;
  }

  /** Number of living entities. */
  get entityCount(): number {
    return this.aliveEntities.size;
  }

  // --- Entities ------------------------------------------------------------

  createEntity(): EntityId {
    const id = this.nextEntityId++;
    this.aliveEntities.add(id);
    this.entityOrder.push(id);
    return asEntityId(id);
  }

  isAlive(entity: EntityId): boolean {
    return this.aliveEntities.has(entity);
  }

  destroyEntity(entity: EntityId): void {
    if (!this.aliveEntities.delete(entity)) return;
    const index = this.entityOrder.indexOf(entity);
    if (index !== -1) this.entityOrder.splice(index, 1);
    for (const store of this.stores.values()) {
      store.delete(entity);
    }
  }

  // --- Components ----------------------------------------------------------

  private storeFor<T>(type: ComponentType<T>): Map<number, T> {
    let store = this.stores.get(type.id);
    if (store === undefined) {
      store = new Map<number, unknown>();
      this.stores.set(type.id, store);
    }
    return store as Map<number, T>;
  }

  /** Attach or overwrite a component on an entity. */
  addComponent<T>(entity: EntityId, type: ComponentType<T>, value: T): void {
    if (!this.isAlive(entity)) {
      throw new Error(`addComponent: entity ${entity} is not alive`);
    }
    this.storeFor(type).set(entity, value);
  }

  getComponent<T>(entity: EntityId, type: ComponentType<T>): T | undefined {
    return this.storeFor(type).get(entity);
  }

  hasComponent<T>(entity: EntityId, type: ComponentType<T>): boolean {
    return this.storeFor(type).has(entity);
  }

  removeComponent<T>(entity: EntityId, type: ComponentType<T>): void {
    this.storeFor(type).delete(entity);
  }

  // --- Queries -------------------------------------------------------------

  /**
   * Return, in stable creation order, the living entities that have all of the
   * given component types.
   */
  query(...types: readonly ComponentType<unknown>[]): EntityId[] {
    const result: EntityId[] = [];
    for (const id of this.entityOrder) {
      let matches = true;
      for (const type of types) {
        const store = this.stores.get(type.id);
        if (store === undefined || !store.has(id)) {
          matches = false;
          break;
        }
      }
      if (matches) result.push(asEntityId(id));
    }
    return result;
  }

  // --- Systems & stepping --------------------------------------------------

  addSystem(system: System): this {
    this.systems.push(system);
    return this;
  }

  /** Advance the simulation by one fixed step of `dtMs` milliseconds. */
  step(dtMs: number): void {
    for (const system of this.systems) {
      system.update(this, dtMs);
    }
    this.currentTick = asTick(this.currentTick + 1);
  }
}
