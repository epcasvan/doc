/**
 * Téléchargement des phrases Soutien pour édition manuelle.
 * Un fichier par son : `phrases/<son>.json`.
 */
import type { SoutienVowelBank } from './banks'
import {
  serializeSonFile,
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

/** Export du fichier son de la fiche (word → variants → sentences). */
export function downloadSoutienType9Phrases(bank: SoutienVowelBank) {
  const local = soutienPhrasesFor(bank.id)?.phrases ?? []
  const rows = local.length > 0 ? local : soutienPhrasesCommon().phrases
  const payload = serializeSonFile(bank.id, rows)
  triggerDownload(`soutien-phrases-${bank.id}.json`, `${JSON.stringify(payload, null, 2)}\n`)
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

/** Même export que type 9 : fichier du son courant. */
export function downloadSoutienType12Phrases(bank: SoutienVowelBank) {
  downloadSoutienType9Phrases(bank)
}

/** Type 14 — fichier du son courant. */
export function downloadSoutienType14Phrases(bank: SoutienVowelBank) {
  const payload = {
    son: bank.id,
    phrases: soutienPhrasesGrouped(bank.id),
  }
  triggerDownload(`soutien-phrases-${bank.id}.json`, `${JSON.stringify(payload, null, 2)}\n`)
}

/** Fichiers regroupés servis sous /soutien-phrases/. */
export function soutienPhrasesPublicUrl(
  kind: 'type9' | 'type10' | 'type12' | 'type14',
  all = true,
): string {
  if (all) return `/soutien-phrases/${kind === 'type10' ? 'type10' : 'phrases'}-all.json`
  return `/soutien-phrases/${kind}/`
}
