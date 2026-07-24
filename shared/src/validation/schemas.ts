import { z } from 'zod';

/**
 * Runtime validation for inbound client messages.
 *
 * Every message received from a client is untrusted and must be validated at
 * the boundary before any handler runs. These schemas mirror the static
 * protocol types and are the single source of runtime truth for message shape.
 */

const directionSchema = z.enum(['north', 'east', 'south', 'west']);

const vec2Schema = z.object({
  x: z.number().finite(),
  y: z.number().finite(),
});

const handshakeSchema = z.object({
  type: z.literal('handshake'),
  protocolVersion: z.number().int().nonnegative(),
  token: z.string().min(1).max(4096),
});

const pingSchema = z.object({
  type: z.literal('ping'),
  time: z.number().finite(),
});

const moveIntentSchema = z.object({
  type: z.literal('move'),
  seq: z.number().int().nonnegative(),
  target: vec2Schema,
  facing: directionSchema,
});

const useSkillIntentSchema = z.object({
  type: z.literal('useSkill'),
  seq: z.number().int().nonnegative(),
  skillId: z.string().min(1).max(64),
  targetEntityId: z.number().int().nonnegative().optional(),
});

const gatherIntentSchema = z.object({
  type: z.literal('gather'),
  seq: z.number().int().nonnegative(),
  nodeEntityId: z.number().int().nonnegative(),
});

export const clientMessageSchema = z.discriminatedUnion('type', [
  handshakeSchema,
  pingSchema,
  moveIntentSchema,
  useSkillIntentSchema,
  gatherIntentSchema,
]);

export type ValidatedClientMessage = z.infer<typeof clientMessageSchema>;
