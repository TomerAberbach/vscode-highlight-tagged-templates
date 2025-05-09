import { map, pipe, reduce, toObject } from 'lfi'
import {
  BASIC_GRAMMAR_PATH,
  BASIC_GRAMMAR_SCOPE_NAME,
  REINJECT_GRAMMAR_PATH,
  REINJECT_GRAMMAR_SCOPE_NAME,
} from './generate-grammars.ts'
import { LANGUAGES } from './languages.ts'

const generateContributes = () => ({
  grammars: [
    {
      injectTo: [
        'source.js',
        'source.js.jsx',
        'source.jsx',
        'source.ts',
        'source.tsx',
        'text.html.basic',
        'text.html.derivative',
        'text.html.markdown',
      ],
      scopeName: BASIC_GRAMMAR_SCOPE_NAME,
      path: BASIC_GRAMMAR_PATH,
      embeddedLanguages: pipe(
        LANGUAGES,
        map(({ name }) => [`meta.embedded.block.${name}`, name]),
        reduce(toObject()),
      ),
    },
    {
      injectTo: [
        'source.js',
        'source.js.jsx',
        'source.jsx',
        'source.ts',
        'source.tsx',
        'text.html.basic',
        'text.html.derivative',
        'text.html.markdown',
      ],
      scopeName: REINJECT_GRAMMAR_SCOPE_NAME,
      path: REINJECT_GRAMMAR_PATH,
      embeddedLanguages: {
        'meta.template.expression.ts': 'typescript',
      },
    },
  ],
})

export default generateContributes
