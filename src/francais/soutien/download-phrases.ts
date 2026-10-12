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

/** Type 9 — banque commune (mot + phrase). */
export function downloadSoutienType9Phrases(bank: SoutienVowelBank) {
  const common = soutienPhrasesCommon().type9
  const local = soutienPhrasesFor(bank.id)?.type9
  const rows =
    common.length > 0
      ? common
      : local && local.length > 0
        ? local
        : bank.scrambles.map((s) => ({ word: s.word, sentence: s.sentence }))
  triggerDownload(`soutien-type9-all.json`, `${JSON.stringify(rows, null, 2)}\n`)
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

/** Type 12 — compter le son (banque commune). */
export function downloadSoutienType12Phrases(_bank: SoutienVowelBank) {
  const rows = soutienPhrasesCommon().type12
  triggerDownload(`soutien-type12-all.json`, `${JSON.stringify(rows, null, 2)}\n`)
}

/** Type 14 — phrases à lire (banque commune). */
export function downloadSoutienType14Phrases(_bank: SoutienVowelBank) {
  const rows = soutienPhrasesCommon().type14
  triggerDownload(`soutien-type14-all.json`, `${JSON.stringify(rows, null, 2)}\n`)
}

/** Fichiers regroupés servis sous /soutien-phrases/. */
export function soutienPhrasesPublicUrl(
  kind: 'type9' | 'type10' | 'type12' | 'type14',
  all = true,
): string {
  if (all) return `/soutien-phrases/${kind}-all.json`
  return `/soutien-phrases/${kind}/`
}
