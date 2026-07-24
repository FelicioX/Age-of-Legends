import { SIM_STEP_MS } from '@aol/shared';

/**
 * Fixed-timestep accumulator.
 *
 * Decouples the variable render/frame cadence from the deterministic simulation
 * step. Feed it elapsed real time; it invokes the step callback a whole number
 * of times and reports the leftover fraction (`alpha`) for render interpolation.
 * A spiral-of-death guard caps how many steps run per advance.
 */
export class FixedStepLoop {
  private accumulatorMs = 0;

  constructor(
    private readonly stepMs: number = SIM_STEP_MS,
    private readonly maxStepsPerAdvance: number = 5,
  ) {
    if (stepMs <= 0) throw new RangeError('stepMs must be positive');
  }

  /**
   * Advance by `elapsedMs` of real time, running zero or more fixed steps.
   *
   * @returns the interpolation fraction in [0, 1) for rendering between the
   *          last two simulation states.
   */
  advance(elapsedMs: number, step: (stepMs: number) => void): number {
    this.accumulatorMs += Math.max(0, elapsedMs);

    let steps = 0;
    while (this.accumulatorMs >= this.stepMs && steps < this.maxStepsPerAdvance) {
      step(this.stepMs);
      this.accumulatorMs -= this.stepMs;
      steps++;
    }

    // If we hit the cap, drop the backlog to avoid a runaway catch-up spiral.
    if (steps >= this.maxStepsPerAdvance && this.accumulatorMs >= this.stepMs) {
      this.accumulatorMs = 0;
    }

    return this.accumulatorMs / this.stepMs;
  }

  reset(): void {
    this.accumulatorMs = 0;
  }
}
