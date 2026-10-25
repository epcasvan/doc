import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const root = 'public/lib/images/vocabulaire'
const byStem = new Map()
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p)
    else {
      const stem = name.replace(/\.[^.]+$/, '').toLowerCase()
      if (!byStem.has(stem)) {
        const rel = '/' + p.replace(/\\/g, '/').replace(/^public\//, '')
        byStem.set(stem, rel)
      }
    }
  }
}
walk(root)

let missing = 0
let relinked = 0
let still = []
const banks = 'src/francais/vocab-banks'
for (const file of readdirSync(banks)) {
  if (!file.endsWith('.ts')) continue
  const path = join(banks, file)
  let text = readFileSync(path, 'utf8')
  let changed = false
  text = text.replace(/"imageSrc"\s*:\s*"(\/lib\/images\/vocabulaire\/[^"]+)"/g, (full, src) => {
    const disk = 'public' + src
    try { if (statSync(disk).isFile()) return full } catch {}
    missing++
    const stem = src.split('/').pop().replace(/\.[^.]+$/, '').toLowerCase()
    const hit = byStem.get(stem)
    if (hit && hit !== src) {
      relinked++
      changed = true
      return `"imageSrc":"${hit}"`
    }
    if (still.length < 40) still.push(src)
    return full
  })
  if (changed) writeFileSync(path, text)
}
console.log({ missing, relinked, sample: still })
