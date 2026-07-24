import { World } from '@aol/engine';
import { MovementSystem } from '@aol/game';
import { type ServerConfig } from '../config.js';

/**
 * Owns a shard's authoritative simulation: the ECS world, its registered
 * systems and the fixed-step tick loop. The runtime advances the world at the
 * configured tick rate and is the single place where authoritative state lives
 * on the server.
 */
export class WorldRuntime {
  readonly world: World;
  private readonly stepMs: number;
  private timer: ReturnType<typeof setInterval> | undefined;

  constructor(config: ServerConfig) {
    this.world = new World(config.worldSeed);
    this.stepMs = 1000 / config.simTickRate;
    this.registerSystems();
  }

  private registerSystems(): void {
    this.world.addSystem(MovementSystem);
    // Additional systems (combat, resources, AI, …) are registered here as
    // they are implemented in later milestones.
  }

  start(): void {
    if (this.timer !== undefined) return;
    this.timer = setInterval(() => {
      this.world.step(this.stepMs);
    }, this.stepMs);
  }

  stop(): void {
    if (this.timer !== undefined) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  get tick(): number {
    return this.world.tick;
  }
}
