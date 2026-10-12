#!/usr/bin/env node
/**
 * Ajoute pays + habitants m/f dans lecture-word-items-extra.ts,
 * met à jour imageSrc nationalités dans fr-presenter.ts,
 * régénère l’index vocab-images.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { PAYS_NATIONALITES, PHONEMES, inhabitantJobs } from './pays-nationalites-data.mjs'

const ROOT = process.cwd()
const EXTRA = join(ROOT, 'src/francais/soutien/lecture-word-items-extra.ts')
const PRESENTER = join(ROOT, 'src/francais/vocab-banks/fr-presenter.ts')

function slugFile(label) {
  return label.trim().toLowerCase().replace(/\s+/g, '-')
}

function phonemeLine(label) {
  const key = label.trim().toLowerCase()
  const ph = PHONEMES[key] ?? PHONEMES[slugFile(label)]
  if (!ph) {
    console.warn('Missing phonemes for', label)
    return null
  }
  const arr = ph.map((p) => `"${p}"`).join(', ')
  return `  { label: ${JSON.stringify(label)}, phonemes: [${arr}] },`
}

/** Labels pays = stems fichiers (lookup image). */
function countryLectureLabel(entry) {
  // stems connus non accentués
  if (entry.country === 'grece') return 'grece'
  if (entry.country === 'erythree') return 'erythree'
  if (entry.country === 'etats-unis') return 'etats-unis'
  if (entry.country === 'corée-du-sud') return 'corée-du-sud'
  if (entry.country === 'sri-lanka') return 'sri-lanka'
  if (entry.country === 'pays-bas') return 'pays-bas'
  return entry.country
}

function collectLabels() {
  const labels = []
  const seen = new Set()
  const add = (label) => {
    const k = label.toLowerCase()
    if (seen.has(k)) return
    seen.add(k)
    labels.push(label)
  }
  for (const e of PAYS_NATIONALITES) {
    add(countryLectureLabel(e))
    for (const job of inhabitantJobs(e)) add(job.label)
  }
  // russe déjà en banque Voc sans pays
  add('russe')
  return labels
}

function updateLectureExtra() {
  const labels = collectLabels()
  const lines = labels.map(phonemeLine).filter(Boolean)
  const markerStart = '// --- pays + habitants (auto) ---'
  const markerEnd = '// --- fin pays + habitants ---'
  const block = [markerStart, ...lines, markerEnd].join('\n')

  let src = readFileSync(EXTRA, 'utf8')
  // Retirer l’ancien bloc auto (indent optionnelle)
  src = src.replace(
    /\n?\s*\/\/ --- pays \+ habitants \(auto\) ---[\s\S]*?\/\/ --- fin pays \+ habitants ---\n?/,
    '\n',
  )
  // Retirer les doublons hors bloc (nationalités déjà présentes, etc.)
  const drop = new Set(labels.map((l) => l.toLowerCase()))
  src = src
    .split('\n')
    .filter((line) => {
      const m = line.match(/\{\s*label:\s*"([^"]+)"/)
      if (!m) return true
      return !drop.has(m[1].toLowerCase())
    })
    .join('\n')

  const idx = src.lastIndexOf(']')
  if (idx < 0) throw new Error('lecture-word-items-extra: ] not found')
  src = src.slice(0, idx) + `  ${block}\n` + src.slice(idx)
  writeFileSync(EXTRA, src)
  console.log('Updated', EXTRA, 'with', lines.length, 'pays/habitants entries')
}

function updatePresenterImageSrc() {
  let src = readFileSync(PRESENTER, 'utf8')
  // Remplacer presenter/{country}.webp → pays/{nationality}.webp pour chaque nationalité connue
  const map = new Map()
  for (const e of PAYS_NATIONALITES) {
    for (const job of inhabitantJobs(e)) {
      map.set(job.label.toLowerCase(), `/lib/images/vocabulaire/presenter/${slugFile(job.slug)}.webp`)
    }
  }
  map.set('russe', '/lib/images/vocabulaire/presenter/russe.webp')

  // Remplace imageSrc sur les entrées v1-nationalites-{label}
  src = src.replace(
    /\{"id":"(v1-nationalites-[^"]+)","label":"([^"]+)","imageSrc":"([^"]+)"/g,
    (full, id, label, _img) => {
      const next = map.get(label.toLowerCase())
      if (!next) return full
      return `{"id":"${id}","label":"${label}","imageSrc":"${next}"`
    },
  )
  writeFileSync(PRESENTER, src)
  console.log('Updated presenter nationalité imageSrc')
}

function rebuildIndex() {
  const r = spawnSync('node', ['scripts/build-vocab-images-index.mjs'], {
    cwd: ROOT,
    stdio: 'inherit',
  })
  if (r.status !== 0) process.exit(r.status ?? 1)
}

function listMissingImages() {
  const missing = []
  for (const e of PAYS_NATIONALITES) {
    for (const job of inhabitantJobs(e)) {
      const dest = join(ROOT, 'public/lib/images/vocabulaire/presenter', `${slugFile(job.slug)}.webp`)
      if (!existsSync(dest)) missing.push({ ...e, job, dest })
    }
  }
  const russe = join(ROOT, 'public/lib/images/vocabulaire/presenter/russe.webp')
  if (!existsSync(russe)) {
    missing.push({
      country: 'russie',
      look: 'Russian adult',
      flag: 'Russia flag (white, blue, red horizontal stripes)',
      job: { label: 'russe', gender: 'person', slug: 'russe' },
      dest: russe,
    })
  }
  return missing
}

const cmd = process.argv[2] || 'all'
if (cmd === 'lecture' || cmd === 'all') updateLectureExtra()
if (cmd === 'presenter' || cmd === 'all') updatePresenterImageSrc()
if (cmd === 'index' || cmd === 'all') rebuildIndex()
if (cmd === 'missing') {
  const missing = listMissingImages()
  console.log(JSON.stringify(missing.map((m) => ({
    slug: m.job.slug,
    gender: m.job.gender,
    look: m.look,
    flag: m.flag,
  })), null, 2))
  console.log('missing count', missing.length)
}
