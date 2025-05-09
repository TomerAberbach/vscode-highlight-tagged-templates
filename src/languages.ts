export type Language = Readonly<{
  name: string
  identifiers: ReadonlySet<string>
  sources: ReadonlySet<string>
}>

export const LANGUAGES: readonly Language[] = [
  {
    name: 'shell',
    identifiers: new Set(['bash', 'sh', 'shell']),
    sources: new Set(['source.shell']),
  },
  {
    name: 'css',
    identifiers: new Set(['css']),
    sources: new Set(['source.css']),
  },
  {
    name: 'csharp',
    identifiers: new Set(['cs', 'csharp']),
    sources: new Set(['source.cs']),
  },
  { name: 'go', identifiers: new Set(['go']), sources: new Set(['source.go']) },
  {
    name: 'java',
    identifiers: new Set(['java']),
    sources: new Set(['source.java']),
  },
  {
    name: 'javascript',
    identifiers: new Set(['js', 'jsx', 'javascript']),
    sources: new Set(['source.js']),
  },
  {
    name: 'json',
    identifiers: new Set(['json']),
    sources: new Set(['source.json']),
  },
  {
    name: 'kotlin',
    identifiers: new Set(['kotlin', 'kt']),
    sources: new Set(['source.kotlin']),
  },
  {
    name: 'php',
    identifiers: new Set(['php']),
    sources: new Set(['text.html.basic', 'source.php']),
  },
  {
    name: 'python',
    identifiers: new Set(['py', 'python']),
    sources: new Set(['source.python']),
  },
  {
    name: 'ruby',
    identifiers: new Set(['rb', 'ruby']),
    sources: new Set(['source.ruby']),
  },
  {
    name: 'terraform',
    identifiers: new Set(['tf', 'terraform']),
    sources: new Set(['source.hcl', 'source.hcl.terraform']),
  },
  {
    name: 'typescript',
    identifiers: new Set(['ts', 'tsx', 'typescript']),
    sources: new Set(['source.ts']),
  },
  {
    name: 'yaml',
    identifiers: new Set(['yaml', 'yml']),
    sources: new Set(['source.yaml']),
  },
]
