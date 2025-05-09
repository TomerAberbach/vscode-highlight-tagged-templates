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
  end: `\``,
  endCaptures: {
    0: { name: `punctuation.definition.string.template.end.js` },
  },
  patterns: [
    ...Array.from(language.sources, source => ({ include: source })),
    // When a language grammar is not installed, insert a catch-all pattern so that we still match all the
    // inner text but don't highlight it.
    { match: `.` },
  ],
})
