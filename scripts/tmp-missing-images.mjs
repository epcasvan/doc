import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const root = 'src/francais/vocab-banks'
const missing = []
let total = 0
for (const file of readdirSync(root)) {
  if (!file.endsWith('.ts')) continue
  const text = readFileSync(join(root, file), 'utf8')
  for (const m of text.matchAll(/"imageSrc"\s*:\s*"(\/lib\/images\/vocabulaire\/[^"]+)"/g)) {
    total += 1
    const rel = 'public' + m[1]
    if (!existsSync(rel)) missing.push(m[1])
  }
}
console.log(JSON.stringify({ total, missing: missing.length, sample: missing.slice(0, 30) }, null, 2))
