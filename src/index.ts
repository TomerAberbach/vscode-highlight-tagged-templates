import fs from 'node:fs/promises'
import generateContributes from './generate-contributes.ts'
import {
  BASIC_GRAMMAR_PATH,
  REINJECT_GRAMMAR_PATH,
  generateBasicGrammar,
  generateReinjectGrammar,
} from './generate-grammars.ts'

const writeJson = async (path: string, json: unknown): Promise<void> =>
  fs.writeFile(path, `${JSON.stringify(json, null, 2)}\n`)

await fs.mkdir(`dist`, { recursive: true })
await Promise.all([
  writeJson(BASIC_GRAMMAR_PATH, generateBasicGrammar()),
  writeJson(REINJECT_GRAMMAR_PATH, generateReinjectGrammar()),
  (async () => {
    const packageJson = JSON.parse(
      await fs.readFile(`package.json`, `utf8`),
    ) as Record<string, unknown>
    packageJson.contributes = generateContributes()
    await writeJson(`package.json`, packageJson)
  })(),
])
