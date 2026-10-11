/** Téléchargement des phrases Soutien (types 9 / 12 / 14) pour édition manuelle. */
import type { SoutienVowelBank } from './banks'

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

/** Type 9 — mot dans la phrase. */
export function downloadSoutienType9Phrases(bank: SoutienVowelBank) {
  const rows = bank.scrambles.map((s) => ({ word: s.word, sentence: s.sentence }))
  triggerDownload(
    `soutien-type9-${bank.id}.json`,
    `${JSON.stringify(rows, null, 2)}\n`,
  )
}

/** Type 12 — compter le son. */
export function downloadSoutienType12Phrases(bank: SoutienVowelBank) {
  triggerDownload(
    `soutien-type12-${bank.id}.json`,
    `${JSON.stringify([...bank.countPhrases], null, 2)}\n`,
  )
}

/** Type 14 — phrases à lire. */
export function downloadSoutienType14Phrases(bank: SoutienVowelBank) {
  triggerDownload(
    `soutien-type14-${bank.id}.json`,
    `${JSON.stringify([...bank.readPhrases], null, 2)}\n`,
  )
}

/** Fichiers regroupés déjà servis sous /soutien-phrases/ (voyelles). */
export function soutienPhrasesPublicUrl(
  kind: 'type9' | 'type12' | 'type14',
  all = true,
): string {
  if (all) return `/soutien-phrases/${kind}-all.json`
  return `/soutien-phrases/${kind}/`
}
