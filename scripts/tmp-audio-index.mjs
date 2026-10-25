import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = 'E:/doc-prof'
const AUDIO = join(ROOT, 'public/lib/audio')
const STEM = join(ROOT, 'src/francais/soutien/audio-stem-index.json')

function slugify(label) {
  return label.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

const buckets = new Map()
function walk(dir) {
  if (!existsSync(dir)) return
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p)
    else if (name.endsWith('.mp3') && statSync(p).size > 500) {
      const rel = '/' + p.slice(join(ROOT, 'public').length + 1).replace(/\\/g, '/')
      const stem = name.slice(0, -4).toLowerCase()
      const list = buckets.get(stem) ?? []
      list.push(rel)
      buckets.set(stem, list)
    }
  }
}
walk(join(AUDIO, 'vocabulaire'))
walk(join(AUDIO, 'syllabes'))

function prefer(paths) {
  const paired = paths.find((rel) => {
    if (!rel.includes('/vocabulaire/')) return false
    const img = 'public' + rel.replace('/audio/', '/images/').replace(/\.mp3$/, '.webp')
    return existsSync(img)
  })
  return paired ?? paths[0]
}

const entries = {}
for (const [stem, paths] of buckets) {
  const rel = prefer(paths)
  const ascii = slugify(stem)
  const prefix = rel.includes('/syllabes/') ? 'syll:' : ''
  if (!entries[prefix + ascii]) entries[prefix + ascii] = rel
  if (!entries[prefix + stem]) entries[prefix + stem] = rel
  if (prefix && !entries[ascii]) entries[ascii] = rel
}
const sorted = {}
for (const k of Object.keys(entries).sort()) sorted[k] = entries[k]
writeFileSync(STEM, JSON.stringify(sorted) + '\n')
console.log('keys', Object.keys(sorted).length, 'stems', buckets.size)
