/** A 2D vector in world space. Immutable by convention; math returns new values. */
export interface Vec2 {
  readonly x: number;
  readonly y: number;
}

/** An axis-aligned bounding box, used for areas of interest and regions. */
export interface Rect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/** A discrete grid coordinate (tiles). */
export interface GridPos {
  readonly col: number;
  readonly row: number;
}

/** Cardinal facing used for movement and rendering. */
export type Direction = 'north' | 'east' | 'south' | 'west';

/** The five core resources of the kingdom economy. */
export type ResourceKind = 'wood' | 'stone' | 'iron' | 'food' | 'gold';

/** Hero archetypes defining role and stat themes. */
export type HeroArchetype = 'vanguard' | 'ranger' | 'mystic' | 'warden' | 'artificer';

/** A bundle of resource amounts, keyed by resource kind. */
export type ResourceBundle = Readonly<Record<ResourceKind, number>>;
