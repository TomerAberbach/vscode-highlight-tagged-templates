import { entries, filterMap, map, pipe, reduce, toArray, toObject } from 'lfi'

/**
 * Returns a copy of {@link grammar} without `{ include: '#{name}' }` objects.
 */
export const removeIncludes = (grammar: unknown, name: string): unknown => {
  if (typeof grammar !== `object` || grammar === null) {
    return grammar
  }

  if (`include` in grammar && grammar.include === `#${name}`) {
    // Remove `raw_block` grammar.
    return null
  }

  return Array.isArray(grammar)
    ? pipe(
        grammar,
        filterMap(item => removeIncludes(item, name)),
        reduce(toArray()),
      )
    : pipe(
        entries(grammar as Record<PropertyKey, unknown>),
        filterMap(([key, value]) => {
          value = removeIncludes(value, name)
          return value === null ? null : [key, value]
        }),
        reduce(toObject()),
      )
}

export const transformPatterns = (
  grammar: unknown,
  transform: (pattern: string, key: PatternKey) => string,
): unknown => {
  if (typeof grammar !== `object` || grammar === null) {
    return grammar
  }

  const grammarCopy = { ...grammar } as Record<string, unknown>

  for (const key of PATTERN_KEYS) {
    if (key in grammarCopy && typeof grammarCopy[key] === `string`) {
      grammarCopy[key] = transform(grammarCopy[key], key)
    }
  }

  if (`patterns` in grammarCopy && Array.isArray(grammarCopy.patterns)) {
    grammarCopy.patterns = grammarCopy.patterns.map(pattern =>
      transformPatterns(pattern, transform),
    )
  }

  for (const key of [
    `repository`,
    `captures`,
    `whileCaptures`,
    `beginCaptures`,
    `endCaptures`,
  ]) {
    if (
      key in grammarCopy &&
      typeof grammarCopy[key] === `object` &&
      grammarCopy[key] !== null
    ) {
      grammarCopy[key] = pipe(
        entries(grammarCopy[key]),
        map(([key, value]) => [key, transformPatterns(value, transform)]),
        reduce(toObject()),
      )
    }
  }

  return grammarCopy
}

const PATTERN_KEYS = [`match`, `while`, `begin`, `end`] as const
export type PatternKey = (typeof PATTERN_KEYS)[number]
