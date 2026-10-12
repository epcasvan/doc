/**
 * Téléchargement des phrases Soutien (types 9 / 10 / 12 / 14) pour édition manuelle.
 * Banque commune : `soutienPhrasesCommon()` (tous les `phrases/<bankId>.json`).
 */
import type { SoutienVowelBank } from './banks'
import { soutienPhrasesCommon, soutienPhrasesFor } from './phrases-data'

function triggerDownload(filename: string, content: string, mime = 'application/json') {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

/** Syntaxe canonique partagée type 9 / 12 : level, number?, word, sentence. */
function serializeWordPhrases(
  rows: ReadonlyArray<{ level?: string; number?: string; word: string; sentence: string }>,
): string {
  const out = rows.map((r) => ({
    level: r.level ?? 'a2',
    ...(r.number ? { number: r.number } : {}),
    word: r.word,
    sentence: r.sentence,
  }))
  return `${JSON.stringify(out, null, 2)}\n`
}

/** Type 9 — banque commune (même syntaxe que type 12). */
export function downloadSoutienType9Phrases(bank: SoutienVowelBank) {
  const common = soutienPhrasesCommon().type9
  const local = soutienPhrasesFor(bank.id)?.type9
  const rows =
    common.length > 0
      ? common
      : local && local.length > 0
        ? local
        : bank.scrambles.map((s) => ({ word: s.word, sentence: s.sentence, level: 'a2' as const }))
  triggerDownload(`soutien-type9-all.json`, serializeWordPhrases(rows))
}

/** Type 10 — déterminants (souvent générés au pluriel depuis le type 5). */
export function downloadSoutienType10Phrases(bank: SoutienVowelBank) {
  const common = soutienPhrasesCommon().type10
  const local = soutienPhrasesFor(bank.id)?.type10
  const rows =
    common.length > 0
      ? common
      : local && local.length > 0
        ? local
        : bank.determinants.map((d) => ({
            sentence: d.sentence,
            parts: d.parts,
          }))
  triggerDownload(`soutien-type10-all.json`, `${JSON.stringify(rows, null, 2)}\n`)
}

/** Type 12 — compter le son (même syntaxe que type 9). */
export function downloadSoutienType12Phrases(_bank: SoutienVowelBank) {
  const rows = soutienPhrasesCommon().type12
  triggerDownload(`soutien-type12-all.json`, serializeWordPhrases(rows))
}

/** Type 14 — phrases à lire (même syntaxe que type 9 / 12). */
export function downloadSoutienType14Phrases(_bank: SoutienVowelBank) {
  const rows = soutienPhrasesCommon().type14
  triggerDownload(`soutien-type14-all.json`, serializeWordPhrases(rows))
}

/** Fichiers regroupés servis sous /soutien-phrases/. */
export function soutienPhrasesPublicUrl(
  kind: 'type9' | 'type10' | 'type12' | 'type14',
  all = true,
): string {
  if (all) return `/soutien-phrases/${kind}-all.json`
  return `/soutien-phrases/${kind}/`
}
