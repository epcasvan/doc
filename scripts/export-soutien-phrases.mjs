/**
 * Exporte les phrases Soutien FR (types 9 / 12 / 14, niveaux a1 / a2 / b1)
 * de `src/francais/soutien/phrases/*.json` vers `public/soutien-phrases/` :
 *   - `<bankId>.json` (copie par banque) ;
 *   - `type9-all.json`, `type12-all.json`, `type14-all.json` (regroupés par banque).
 *
 *   node scripts/export-soutien-phrases.mjs
 */
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'fs'
import { join } from 'path'

const SRC = 'src/francais/soutien/phrases'
const OUT = 'public/soutien-phrases'

rmSync(OUT, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })

const type9 = {}
const type12 = {}
const type14 = {}
const ids = readdirSync(SRC)
  .filter((f) => f.endsWith('.json'))
  .map((f) => f.replace(/\.json$/, ''))
  .sort()

for (const id of ids) {
  const data = JSON.parse(readFileSync(join(SRC, `${id}.json`), 'utf8'))
  type9[id] = data.type9 ?? []
  type12[id] = data.type12 ?? []
  type14[id] = data.type14 ?? []
  writeFileSync(join(OUT, `${id}.json`), `${JSON.stringify(data, null, 2)}\n`)
}
writeFileSync(join(OUT, 'type9-all.json'), `${JSON.stringify(type9, null, 2)}\n`)
writeFileSync(join(OUT, 'type12-all.json'), `${JSON.stringify(type12, null, 2)}\n`)
writeFileSync(join(OUT, 'type14-all.json'), `${JSON.stringify(type14, null, 2)}\n`)
console.log(`exporté ${ids.length} banque(s) → ${OUT}/`)
