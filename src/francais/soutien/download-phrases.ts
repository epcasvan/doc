/**
 * Téléchargement des phrases Soutien (types 9 / 12 / 14) pour édition manuelle.
 * Source de vérité : `src/francais/soutien/phrases/<bankId>.json` (niveaux a1 / a2 / b1).
 */
import type { SoutienVowelBank } from './banks'
import { soutienPhrasesFor } from './phrases-data'

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

/** Type 9 — mot dans la phrase (avec niveau si phrases rédigées). */
export function downloadSoutienType9Phrases(bank: SoutienVowelBank) {
  const curated = soutienPhrasesFor(bank.id)?.type9
  const rows =
    curated && curated.length > 0
      ? curated
      : bank.scrambles.map((s) => ({ word: s.word, sentence: s.sentence }))
  triggerDownload(`soutien-type9-${bank.id}.json`, `${JSON.stringify(rows, null, 2)}\n`)
}

/** Type 12 — compter le son. */
export function downloadSoutienType12Phrases(bank: SoutienVowelBank) {
  const curated = soutienPhrasesFor(bank.id)?.type12
  const rows = curated && curated.length > 0 ? curated : [...bank.countPhrases]
  triggerDownload(`soutien-type12-${bank.id}.json`, `${JSON.stringify(rows, null, 2)}\n`)
}

/** Type 14 — phrases à lire. */
export function downloadSoutienType14Phrases(bank: SoutienVowelBank) {
  const curated = soutienPhrasesFor(bank.id)?.type14
  const rows = curated && curated.length > 0 ? curated : [...bank.readPhrases]
  triggerDownload(`soutien-type14-${bank.id}.json`, `${JSON.stringify(rows, null, 2)}\n`)
}

/** Fichiers regroupés servis sous /soutien-phrases/ (export de `src/francais/soutien/phrases/`). */
export function soutienPhrasesPublicUrl(
  kind: 'type9' | 'type12' | 'type14',
  all = true,
): string {
  if (all) return `/soutien-phrases/${kind}-all.json`
  return `/soutien-phrases/${kind}/`
}
