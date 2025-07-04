import escapeStringRegexp from 'escape-string-regexp'
import { entries, flatMap, index, join, map, pipe, reduce, toObject } from 'lfi'
import { LANGUAGES } from './languages.ts'
import type { Language } from './languages.ts'
import { transformPatterns } from './helpers.ts'

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
  repository: generateRepository(),
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

const generateRepository = (): unknown =>
  Object.assign(
    {},
    ...pipe(
      LANGUAGES,
      flatMap(language =>
        pipe(
          language.grammars,
          index,
          flatMap(([index, grammar]) => {
            const name = `${language.name}-${index}`
            grammar = bailOnBacktick(
              allowEscapedBacktick(qualifyLocalIncludes(grammar, name)),
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

            return [{ [name]: grammar }, repository]
          }),
        ),
      ),
    ),
  )

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

  const qualifiedGrammar = pipe(
    entries(grammar),
    map(([key, value]) => [key, qualifyLocalIncludes(value, qualifier)]),
    reduce(toObject()),
  )

  if (
    `repository` in qualifiedGrammar &&
    typeof qualifiedGrammar.repository === `object` &&
    qualifiedGrammar.repository !== null
  ) {
    qualifiedGrammar.repository = pipe(
      entries(qualifiedGrammar.repository as Record<string, unknown>),
      map(([key, value]) => [`${qualifier}-${key}`, value]),
      reduce(toObject()),
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
 * Allow the grammar to use escaped backticks instead of just backticks for any
 * patterns that use backticks. The latter cannot be used without escaping
 * inside a tagged template literal.
 */
const allowEscapedBacktick = (grammar: unknown) =>
  transformPatterns(grammar, pattern => pattern.replaceAll(`\``, `(?:\\\\\`)`))

/**
 * Force the grammar to end on backticks so that it doesn't spill out of the
 * template literal for unclosed language constructs.
 */
const bailOnBacktick = (grammar: unknown): unknown =>
  transformPatterns(grammar, (pattern, key) => {
    switch (key) {
      case `match`:
      case `begin`:
      case `while`:
        return `${pattern}(?!\`)`
      case `end`:
        return `${pattern}|(?<!\\\\)(?=\`)`
    }
  })
