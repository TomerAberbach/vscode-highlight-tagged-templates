import generateContributes from './generate-contributes.ts'
import {
  generateReinjectGrammar,
  generateBasicGrammar,
  BASIC_GRAMMAR_PATH,
  REINJECT_GRAMMAR_PATH,
} from './generate-grammars.ts'
import fs from 'fs/promises'

const writeJson = async (path: string, json: unknown): Promise<void> =>
  fs.writeFile(path, JSON.stringify(json, null, 2))

await fs.mkdir('dist', { recursive: true })
await Promise.all([
  writeJson(BASIC_GRAMMAR_PATH, generateBasicGrammar()),
  writeJson(REINJECT_GRAMMAR_PATH, generateReinjectGrammar()),
  (async () => {
    const packageJson: Record<string, unknown> = JSON.parse(
      await fs.readFile('package.json', 'utf8'),
    )
    packageJson.contributes = generateContributes()
    await writeJson('package.json', packageJson)
  })(),
])
