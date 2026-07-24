import { type Vec2 } from '../types/primitives.js';
import { type Direction } from '../types/primitives.js';

/**
 * The client/server message contract.
 *
 * Messages are discriminated unions keyed by `type`. Client → server messages
 * are *intents* and *control* messages; server → client messages are
 * *snapshots*, *deltas* and *events*. Runtime validation of inbound messages is
 * defined in the validation module; these types are the static contract.
 */

// --- Client → Server -------------------------------------------------------

export interface HandshakeMessage {
  readonly type: 'handshake';
  readonly protocolVersion: number;
  readonly token: string;
}

export interface PingMessage {
  readonly type: 'ping';
  readonly time: number;
}

/** Request to move the local player toward a target position. */
export interface MoveIntent {
  readonly type: 'move';
  readonly seq: number;
  readonly target: Vec2;
  readonly facing: Direction;
}

/** Request to use a skill, optionally on a target entity. */
export interface UseSkillIntent {
  readonly type: 'useSkill';
  readonly seq: number;
  readonly skillId: string;
  readonly targetEntityId?: number;
}

/** Request to gather from a world node. */
export interface GatherIntent {
  readonly type: 'gather';
  readonly seq: number;
  readonly nodeEntityId: number;
}

export type ClientMessage =
  HandshakeMessage | PingMessage | MoveIntent | UseSkillIntent | GatherIntent;

/** All intent messages carry a monotonic `seq` for reconciliation. */
export type Intent = MoveIntent | UseSkillIntent | GatherIntent;

// --- Server → Client -------------------------------------------------------

export interface HandshakeAckMessage {
  readonly type: 'handshakeAck';
  readonly protocolVersion: number;
  readonly playerId: string;
  readonly shardId: string;
  readonly serverTick: number;
}

export interface PongMessage {
  readonly type: 'pong';
  readonly time: number;
  readonly serverTime: number;
}

/** A minimal entity state carried in snapshots. */
export interface EntityState {
  readonly id: number;
  readonly position: Vec2;
  readonly facing: Direction;
  readonly health: number;
}

/** A full authoritative snapshot of entities within the client's interest. */
export interface WorldSnapshot {
  readonly type: 'snapshot';
  readonly tick: number;
  readonly ackSeq: number;
  readonly entities: readonly EntityState[];
}

/** An incremental change set since the client's last acknowledged snapshot. */
export interface WorldDelta {
  readonly type: 'delta';
  readonly tick: number;
  readonly ackSeq: number;
  readonly upserts: readonly EntityState[];
  readonly removed: readonly number[];
}

/** A discrete, reliable notification (chat, reward, result). */
export interface ServerEventMessage {
  readonly type: 'event';
  readonly tick: number;
  readonly name: string;
  readonly payload: Readonly<Record<string, unknown>>;
}

export interface ErrorMessage {
  readonly type: 'error';
  readonly code: string;
  readonly message: string;
}

export type ServerMessage =
  | HandshakeAckMessage
  | PongMessage
  | WorldSnapshot
  | WorldDelta
  | ServerEventMessage
  | ErrorMessage;
