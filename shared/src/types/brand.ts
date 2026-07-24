/**
 * Nominal ("branded") typing utility.
 *
 * TypeScript is structurally typed, so two aliases of `number` are
 * interchangeable. Branding attaches a phantom tag so that, for example, an
 * `EntityId` cannot be passed where a `PlayerId` is expected, catching whole
 * classes of identifier mix-ups at compile time. The tag exists only in the
 * type system and has no runtime footprint.
 */
declare const brand: unique symbol;

export type Brand<T, B extends string> = T & { readonly [brand]: B };
