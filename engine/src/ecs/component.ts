/**
 * A typed handle identifying a component kind.
 *
 * Components are plain data. A `ComponentType<T>` is a lightweight token that
 * ties a stable numeric id (used for fast storage lookup) to the data type `T`
 * (used for compile-time safety). Create one with {@link defineComponent}.
 */
export interface ComponentType<T> {
  readonly id: number;
  readonly name: string;
  /** Phantom marker carrying the component's data type; never read at runtime. */
  readonly __type?: T;
}

let nextComponentId = 0;

/**
 * Define a new component kind.
 *
 * @param name Human-readable name, used in diagnostics.
 * @typeParam T The plain-data shape stored for this component.
 */
export function defineComponent<T>(name: string): ComponentType<T> {
  return { id: nextComponentId++, name };
}
