import escapeStringRegexp from 'escape-string-regexp'
import { join, map, pipe } from 'lfi'
import { LANGUAGES } from './languages.ts'
import type { Language } from './languages.ts'

export const generateReinjectGrammar = (): Record<string, unknown> => ({
  fileTypes: [],
  injectionSelector: pipe(
    targetScopes,
    map(scope => {
      const embeddedScopeSelectors = pipe(
        LANGUAGES,
        map(language => `meta.embedded.block.${language.name}`),
        join(`, `),
      )
      return `L:${scope} (${embeddedScopeSelectors})`
    }),
    join(`, `),
  ),
  patterns: [{ include: `source.ts#template-substitution-element` }],
  scopeName: REINJECT_GRAMMAR_SCOPE_NAME,
})
export const REINJECT_GRAMMAR_SCOPE_NAME = `inline.tagged-template-languages.reinjection`
export const REINJECT_GRAMMAR_PATH = `./dist/reinject-grammar.json`

export const generateBasicGrammar = (): Record<string, unknown> => ({
  fileTypes: [],
  injectionSelector: pipe(
    targetScopes,
    map(scope => `L:${scope} -comment -(string - meta.embedded)`),
    join(`, `),
  ),
  patterns: LANGUAGES.map(generatePattern),
  scopeName: BASIC_GRAMMAR_SCOPE_NAME,
  repository: Object.assign(
    {},
    ...LANGUAGES.flatMap(language =>
      language.grammars.flatMap((grammar, index) => {
        grammar = bailOnBacktick(
          qualifyLocalIncludes(grammar, `${language.name}-${index}`),
        )
        let repository: unknown
        if (
          typeof grammar === `object` &&
          grammar !== null &&
          `repository` in grammar
        ) {
          ;({ repository } = grammar)
          delete grammar.repository
        }
        return [{ [`${language.name}-${index}`]: grammar }, repository]
      }),
    ),
  ),
})
export const BASIC_GRAMMAR_SCOPE_NAME = `inline.tagged-template-languages`
export const BASIC_GRAMMAR_PATH = `./dist/basic-grammar.json`

const targetScopes = [
  `source.js`,
  `source.jsx`,
  `source.js.jsx`,
  `source.ts`,
  `source.tsx`,
]

const generatePattern = (language: Language) => ({
  name: `string.js.tagged-template.${language.name}`,
  contentName: `meta.embedded.block.${language.name}`,
  begin: `(?i)(\\b(?:${pipe(
    language.identifiers,
    map(escapeStringRegexp),
    join(`|`),
  )})\\b)\\s*(\`)`,
  beginCaptures: {
    1: { name: `entity.name.function.tagged-template.js` },
    2: { name: `punctuation.definition.string.template.begin.js` },
  },
  end: `(?<!\\\\)\``,
  endCaptures: {
    0: { name: `punctuation.definition.string.template.end.js` },
  },
  patterns: language.grammars.map((_, index) => ({
    include: `#${language.name}-${index}`,
  })),
})

/**
 * Prefixes all local includes with the given qualifier.
 *
 * This is necessary because we inject multiple grammars into the same file, but
 * `repository` must be at the top level of the grammar. So the repository of
 * each grammar must be prefixed with the name of the grammar to avoid
 * collisions.
 */
const qualifyLocalIncludes = (grammar: unknown, qualifier: string): unknown => {
  if (typeof grammar !== `object` || grammar === null) {
    return grammar
  }

  if (Array.isArray(grammar)) {
    return grammar.map(value => qualifyLocalIncludes(value, qualifier))
  }

  const qualifiedGrammar = Object.fromEntries(
    Object.entries(grammar).map(([key, value]) => [
      key,
      qualifyLocalIncludes(value, qualifier),
    ]),
  )

  if (
    `repository` in qualifiedGrammar &&
    typeof qualifiedGrammar.repository === `object` &&
    qualifiedGrammar.repository !== null
  ) {
    qualifiedGrammar.repository = Object.fromEntries(
      Object.entries(qualifiedGrammar.repository).map(([key, value]) => [
        `${qualifier}-${key}`,
        value,
      ]),
    )
  }

  if (
    `include` in qualifiedGrammar &&
    typeof qualifiedGrammar.include === `string`
  ) {
    if (qualifiedGrammar.include.startsWith(`#`)) {
      qualifiedGrammar.include = `#${qualifier}-${qualifiedGrammar.include.slice(1)}`
    } else if (qualifiedGrammar.include === `$self`) {
      qualifiedGrammar.include = `#${qualifier}`
    }
  }

  return qualifiedGrammar
}

/**
 * Force the grammar to end on backticks so that it doesn't spill out of the
 * template literal for unclosed language constructs.
 */
const bailOnBacktick = (grammar: unknown): unknown => {
  if (typeof grammar !== `object` || grammar === null) {
    return grammar
  }

  const grammarCopy = { ...grammar } as Record<string, unknown>

  if (`end` in grammarCopy && typeof grammarCopy.end === `string`) {
    grammarCopy.end = `${grammarCopy.end}|(?<!\\\\)(?=\`)`
  }

  if (`patterns` in grammarCopy && Array.isArray(grammarCopy.patterns)) {
    grammarCopy.patterns = grammarCopy.patterns.map(bailOnBacktick)
  }

  for (const key of [
    `repository`,
    `captures`,
    `beginCaptures`,
    `endCaptures`,
  ]) {
    if (
      key in grammarCopy &&
      typeof grammarCopy[key] === `object` &&
      grammarCopy[key] !== null
    ) {
      grammarCopy[key] = Object.fromEntries(
        Object.entries(grammarCopy[key]).map(([key, value]) => [
          key,
          bailOnBacktick(value),
        ]),
      )
    }
  }

  return grammarCopy
}
