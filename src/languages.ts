import fishGrammar from 'tm-grammars/grammars/fish.json' with { type: 'json' }
import markdownGrammar from 'tm-grammars/grammars/markdown.json' with { type: 'json' }
import shellGrammar from 'tm-grammars/grammars/shellscript.json' with { type: 'json' }
import cssGrammar from 'tm-grammars/grammars/css.json' with { type: 'json' }
import csharpGrammar from 'tm-grammars/grammars/csharp.json' with { type: 'json' }
import goGrammar from 'tm-grammars/grammars/go.json' with { type: 'json' }
import javaGrammar from 'tm-grammars/grammars/java.json' with { type: 'json' }
import javascriptGrammar from 'tm-grammars/grammars/javascript.json' with { type: 'json' }
import jsonGrammar from 'tm-grammars/grammars/json.json' with { type: 'json' }
import kotlinGrammar from 'tm-grammars/grammars/kotlin.json' with { type: 'json' }
import phpGrammar from 'tm-grammars/grammars/php.json' with { type: 'json' }
import pythonGrammar from 'tm-grammars/grammars/python.json' with { type: 'json' }
import rubyGrammar from 'tm-grammars/grammars/ruby.json' with { type: 'json' }
import hclGrammar from 'tm-grammars/grammars/hcl.json' with { type: 'json' }
import htmlGrammar from 'tm-grammars/grammars/html.json' with { type: 'json' }
import terraformGrammar from 'tm-grammars/grammars/terraform.json' with { type: 'json' }
import typescriptGrammar from 'tm-grammars/grammars/typescript.json' with { type: 'json' }
import yamlGrammar from 'tm-grammars/grammars/yaml.json' with { type: 'json' }
import { removeIncludes, transformPatterns } from './helpers.ts'

export type Language = Readonly<{
  name: string
  identifiers: ReadonlySet<string>
  grammars: unknown[]
}>

export const LANGUAGES: readonly Language[] = [
  { name: `css`, identifiers: new Set([`css`]), grammars: [cssGrammar] },
  {
    name: `csharp`,
    identifiers: new Set([`cs`, `csharp`]),
    grammars: [csharpGrammar],
  },
  { name: `fish`, identifiers: new Set([`fish`]), grammars: [fishGrammar] },
  { name: `go`, identifiers: new Set([`go`]), grammars: [goGrammar] },
  { name: `html`, identifiers: new Set([`html`]), grammars: [htmlGrammar] },
  { name: `java`, identifiers: new Set([`java`]), grammars: [javaGrammar] },
  {
    name: `javascript`,
    identifiers: new Set([`js`, `jsx`, `javascript`]),
    grammars: [javascriptGrammar],
  },
  { name: `json`, identifiers: new Set([`json`]), grammars: [jsonGrammar] },
  {
    name: `kotlin`,
    identifiers: new Set([`kotlin`, `kt`]),
    grammars: [kotlinGrammar],
  },
  {
    name: `php`,
    identifiers: new Set([`php`]),
    grammars: [phpGrammar, htmlGrammar],
  },
  {
    name: `python`,
    identifiers: new Set([`py`, `python`]),
    grammars: [pythonGrammar],
  },
  {
    name: `ruby`,
    identifiers: new Set([`rb`, `ruby`]),
    grammars: [rubyGrammar],
  },
  {
    name: `shell`,
    identifiers: new Set([`bash`, `sh`, `shell`]),
    grammars: [shellGrammar],
  },
  {
    name: `terraform`,
    identifiers: new Set([`tf`, `terraform`]),
    grammars: [hclGrammar, terraformGrammar],
  },
  {
    name: `typescript`,
    identifiers: new Set([`ts`, `tsx`, `typescript`]),
    grammars: [typescriptGrammar],
  },
  {
    name: `yaml`,
    identifiers: new Set([`yaml`, `yml`]),
    grammars: [yamlGrammar],
  },
  // The Markdown grammar has to be included last because it's extremely eager.
  // Otherwise, it wrecks the highlighting of other languages.
  {
    name: `markdown`,
    identifiers: new Set([`md`, `markdown`]),
    grammars: [
      transformPatterns(
        removeIncludes(
          markdownGrammar,
          // This pattern breaks syntax highlighting when code is indented so we
          // remove it. People should just use fenced blocks instead.
          `raw_block`,
        ),
        // We also need to transform parts of other patterns that make them
        // conditional on not being inside a raw block.
        pattern =>
          pattern
            // Don't require a maximum number of spaces before constructs to
            // trigger them because tagged template literals may be indented any
            // amount.
            .replaceAll(/ {0,\d+}/g, ` *`)
            // Don't trigger any constructs that require a specific number of
            // more than zero spaces before them because tagged template
            // literals may be indented any amount.
            .replaceAll(/ {\d+,\d*}|\\t(?:{\d+,\d*})?/g, ` {1000,}`),
      ),
    ],
  },
]
