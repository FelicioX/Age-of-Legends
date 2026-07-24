import { type Vec2 } from '@aol/shared';
import { defineComponent } from '@aol/engine';

/** World-space position of an entity, in world units. */
export const Position = defineComponent<Vec2>('Position');

/** World-space velocity of an entity, in world units per second. */
export const Velocity = defineComponent<Vec2>('Velocity');
