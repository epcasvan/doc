/**
 * Vérifie les phrases Soutien FR (types 9 / 12 / 14) de `src/francais/soutien/phrases/*.json`.
 *
 * Par niveau : A1 5–7 mots / ≥ 2 sons · A2 8–12 mots / ≥ 3 sons · B1 13–15 mots / ≥ 4 sons.
 * Type 9 : le mot doit figurer tel quel dans la phrase.
 *
 *   node scripts/check-soutien-phrases.mjs            → toutes les banques
 *   node scripts/check-soutien-phrases.mjs a ch ou    → banques choisies
 *   node scripts/check-soutien-phrases.mjs --summary  → compte seulement
 */
import { createServer } from 'vite'
import { readFileSync, readdirSync, existsSync } from 'fs'
import { join } from 'path'

const DIR = 'src/francais/soutien/phrases'
const RANGES = { a1: [5, 7, 2], a2: [8, 12, 3], b1: [13, 15, 4] }
const ELISION = /\b(l|d|j|n|m|t|s|c|qu|jusqu|lorsqu|puisqu)[’']/gi

function wordCounts(sentence) {
  const base = sentence.trim().split(/\s+/).filter((t) => /\p{L}|\d/u.test(t)).length
  const elisions = (sentence.match(ELISION) ?? []).length
  return [base, base + elisions]
}

const args = process.argv.slice(2)
const summaryOnly = args.includes('--summary')
const wanted = args.filter((a) => !a.startsWith('--'))

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
let totalErrors = 0
try {
  const { soutienBankById } = await server.ssrLoadModule('/src/francais/soutien/banks.ts')
  const { countLessonPhonemeInText } = await server.ssrLoadModule('/src/francais/soutien/phoneme.ts')

  const files = existsSync(DIR)
    ? readdirSync(DIR)
        .filter((f) => f.endsWith('.json'))
        .map((f) => f.replace(/\.json$/, ''))
        .filter((id) => wanted.length === 0 || wanted.includes(id))
        .sort()
    : []
  if (files.length === 0) console.log('Aucun fichier dans', DIR)

  for (const id of files) {
    const bank = soutienBankById(id)
    const errors = []
    let data
    try {
      data = JSON.parse(readFileSync(join(DIR, `${id}.json`), 'utf8'))
    } catch (e) {
      console.log(`✗ ${id}: JSON invalide — ${e.message}`)
      totalErrors += 1
      continue
    }
    if (!bank) errors.push(`banque inconnue « ${id} »`)
    const seen = new Map()
    const stats = { type9: {}, type12: {}, type14: {} }
    const perWordLevels = new Map()

    for (const kind of ['type9', 'type12', 'type14']) {
      const rows = Array.isArray(data[kind]) ? data[kind] : null
      if (!rows) {
        errors.push(`${kind}: tableau manquant`)
        continue
      }
      rows.forEach((row, i) => {
        const tag = `${kind}[${i}]`
        if (!row || typeof row !== 'object') return errors.push(`${tag}: entrée invalide`)
        const { level, sentence, word } = row
        if (!RANGES[level]) return errors.push(`${tag}: niveau « ${level} » invalide`)
        if (typeof sentence !== 'string' || !sentence.trim()) {
          return errors.push(`${tag}: phrase vide`)
        }
        stats[kind][level] = (stats[kind][level] ?? 0) + 1
        const s = sentence.trim()
        const [min, max, minSound] = RANGES[level]
        const [c1, c2] = wordCounts(s)
        const inRange = (c) => c >= min && c <= max
        if (!inRange(c1) && !inRange(c2)) {
          errors.push(`${tag} (${level}) ${c1} mots hors ${min}–${max} : « ${s} »`)
        }
        if (!/^[A-ZÀÂÄÉÈÊËÎÏÔÖÙÛÜÇŒ«"]/.test(s)) errors.push(`${tag}: majuscule initiale : « ${s} »`)
        if (!/[.!?»]$/.test(s)) errors.push(`${tag}: ponctuation finale : « ${s} »`)
        if (bank) {
          const n = countLessonPhonemeInText(s, bank)
          if (n < minSound) {
            errors.push(`${tag} (${level}) son ×${n} < ${minSound} : « ${s} »`)
          }
        }
        const key = s.toLowerCase()
        if (seen.has(key)) errors.push(`${tag}: doublon de ${seen.get(key)} : « ${s} »`)
        else seen.set(key, tag)
        if (kind === 'type9') {
          if (typeof word !== 'string' || !word.trim()) return errors.push(`${tag}: mot vide`)
          const w = word.trim().toLowerCase()
          if (!s.toLowerCase().includes(w)) {
            errors.push(`${tag}: mot « ${word} » absent de « ${s} »`)
          }
          const levels = perWordLevels.get(w) ?? new Set()
          levels.add(level)
          perWordLevels.set(w, levels)
        }
      })
    }
    for (const [w, levels] of perWordLevels) {
      const missing = ['a1', 'a2', 'b1'].filter((l) => !levels.has(l))
      if (missing.length) errors.push(`type9: « ${w} » sans niveau ${missing.join(', ')}`)
    }

    const fmt = (o) => ['a1', 'a2', 'b1'].map((l) => `${l}=${o[l] ?? 0}`).join(' ')
    const head = `${errors.length ? '✗' : '✓'} ${id}: type9 ${perWordLevels.size} mots (${fmt(stats.type9)}) · type12 ${fmt(stats.type12)} · type14 ${fmt(stats.type14)}`
    console.log(head)
    if (!summaryOnly) for (const e of errors) console.log('   -', e)
    totalErrors += errors.length
  }
} finally {
  await server.close()
}
console.log(totalErrors ? `\n${totalErrors} problème(s).` : '\nOK — aucune erreur.')
process.exit(totalErrors ? 1 : 0)
