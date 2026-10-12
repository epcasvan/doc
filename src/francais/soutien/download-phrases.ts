/**
 * Téléchargement des phrases Soutien (types 9 / 10 / 12 / 14) pour édition manuelle.
 * Fichier unique groupé : `soutienPhrasesGrouped()` / `phrases.json`.
 */
import type { SoutienVowelBank } from './banks'
import {
  serializeGroupedPhrases,
  soutienPhrasesCommon,
  soutienPhrasesFor,
  soutienPhrasesGrouped,
} from './phrases-data'

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

function downloadGrouped(
  filename: string,
  rows: Parameters<typeof serializeGroupedPhrases>[0],
) {
  const phrases = serializeGroupedPhrases(rows)
  triggerDownload(filename, `${JSON.stringify({ phrases }, null, 2)}\n`)
}

/** Banque complète groupée (word → sounds → sentences). */
export function downloadSoutienType9Phrases(bank: SoutienVowelBank) {
  const common = soutienPhrasesCommon().phrases
  const local = soutienPhrasesFor(bank.id)?.phrases
  const rows = common.length > 0 ? common : local && local.length > 0 ? local : []
  if (rows.length === 0) {
    // Repli : export groupé actuel
    triggerDownload(
      `soutien-phrases-all.json`,
      `${JSON.stringify({ phrases: soutienPhrasesGrouped() }, null, 2)}\n`,
    )
    return
  }
  downloadGrouped(`soutien-phrases-all.json`, rows)
}

/** Type 10 — déterminants (souvent générés depuis le type 5). */
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

/** Même fichier groupé que type 9 (vivier unique). */
export function downloadSoutienType12Phrases(_bank: SoutienVowelBank) {
  triggerDownload(
    `soutien-phrases-all.json`,
    `${JSON.stringify({ phrases: soutienPhrasesGrouped() }, null, 2)}\n`,
  )
}

/** Type 14 — même vivier groupé. */
export function downloadSoutienType14Phrases(_bank: SoutienVowelBank) {
  triggerDownload(
    `soutien-phrases-all.json`,
    `${JSON.stringify({ phrases: soutienPhrasesGrouped() }, null, 2)}\n`,
  )
}

/** Fichiers regroupés servis sous /soutien-phrases/. */
export function soutienPhrasesPublicUrl(
  kind: 'type9' | 'type10' | 'type12' | 'type14',
  all = true,
): string {
  if (all) return `/soutien-phrases/${kind === 'type10' ? 'type10' : 'phrases'}-all.json`
  return `/soutien-phrases/${kind}/`
}
