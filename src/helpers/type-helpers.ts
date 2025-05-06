/**
 * This can be used to change any other that matches type "From" into type "To"
 *
 * ! Beware it is based on the object structure, so if two types have the exactly
 *
 * ! same properties it will replace both
 */
export type TypeReplacer<T, From, To> = T extends (...args: any[]) => any
  ? T
  : {
      [K in keyof T]: [T[K], From] extends [From, T[K]] ? To : TypeReplacer<T[K], From, To>
    }

/**
 * Converts readonly types into mutable types
 */
export type Mutable<Immutable> = {
  -readonly [K in keyof Immutable]: Immutable[K]
}

export type PossiblyNullValues<T> = { [P in keyof T]: T[P] | null }
