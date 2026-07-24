import { type Brand } from './brand.js';

/** Stable identifier of a simulation entity within a world. */
export type EntityId = Brand<number, 'EntityId'>;

/** Identifier of a player account. */
export type PlayerId = Brand<string, 'PlayerId'>;

/** Identifier of a kingdom (one per player). */
export type KingdomId = Brand<string, 'KingdomId'>;

/** Identifier of a guild. */
export type GuildId = Brand<string, 'GuildId'>;

/** Identifier of a world shard. */
export type ShardId = Brand<string, 'ShardId'>;

/** Monotonic identifier of a client input, used for reconciliation. */
export type InputSequence = Brand<number, 'InputSequence'>;

/** Simulation tick counter. */
export type Tick = Brand<number, 'Tick'>;

export const asEntityId = (value: number): EntityId => value as EntityId;
export const asPlayerId = (value: string): PlayerId => value as PlayerId;
export const asKingdomId = (value: string): KingdomId => value as KingdomId;
export const asGuildId = (value: string): GuildId => value as GuildId;
export const asShardId = (value: string): ShardId => value as ShardId;
export const asInputSequence = (value: number): InputSequence => value as InputSequence;
export const asTick = (value: number): Tick => value as Tick;
