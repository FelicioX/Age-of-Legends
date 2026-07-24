/**
 * Canonical, stable event names shared across client and server.
 *
 * Changing a name here is a protocol-level change. Values are namespaced by
 * domain to avoid collisions and to keep logs and analytics legible.
 */
export const GameEvents = {
  PlayerConnected: 'player.connected',
  PlayerDisconnected: 'player.disconnected',
  EntitySpawned: 'entity.spawned',
  EntityDespawned: 'entity.despawned',
  CombatStarted: 'combat.started',
  CombatEnded: 'combat.ended',
  ResourceGathered: 'resource.gathered',
  BuildingUpgraded: 'building.upgraded',
  QuestCompleted: 'quest.completed',
} as const;

export type GameEventName = (typeof GameEvents)[keyof typeof GameEvents];
