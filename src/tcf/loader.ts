import { TCF_NIVEAUX, tcfPosition, type TcfSlotMeta } from './catalog'
import { isTcfExerciseShape, validateTcfExercise } from './validate'
import type { TcfCompetence, TcfExercise, TcfNiveau, TcfTypeExercice } from './types'

/**
 * Banques TCF : `src/content/tcf/{a0-a1,a1-a2,a2-b1}/{ce,co,pe,po}.json`.
 * Chaque fichier contient un tableau d’exercices. Les entrées invalides
 * sont écartées (avertissement console) pour ne jamais casser une fiche.
 */
const FILES = import.meta.glob('../content/tcf/*/*.json', { eager: true, import: 'default' })

function loadAll(): TcfExercise[] {
  const out: TcfExercise[] = []
  for (const [path, raw] of Object.entries(FILES)) {
    const match = path.match(/content\/tcf\/([^/]+)\/(ce|co|pe|po)\.json$/)
    const niveau = TCF_NIVEAUX.find((n) => n.dossier === match?.[1])?.id
    if (!match || !niveau) continue
    const competence = match[2]!.toUpperCase()
    if (!Array.isArray(raw)) {
      console.warn(`[TCF] ${path} : un tableau d’exercices est attendu.`)
      continue
    }
    raw.forEach((entry, index) => {
      if (!isTcfExerciseShape(entry) || entry.niveau !== niveau || entry.competence !== competence) {
        console.warn(`[TCF] ${path} #${index + 1} : enveloppe invalide (niveau, compétence ou type).`)
        return
      }
      const { errors } = validateTcfExercise(entry)
      if (errors.length > 0) {
        console.warn(`[TCF] ${path} · ${entry.id} : ${errors.join(' ')}`)
        return
      }
      out.push(entry)
    })
  }
  return out
}

const BANK: readonly TcfExercise[] = loadAll()

export function tcfBank(
  niveau: TcfNiveau,
  competence?: TcfCompetence,
  typeExercice?: TcfTypeExercice,
): TcfExercise[] {
  return BANK.filter(
    (ex) =>
      ex.niveau === niveau &&
      (competence == null || ex.competence === competence) &&
      (typeExercice == null || ex.type_exercice === typeExercice),
  )
}

/** Tous niveaux confondus (A0-A1, A1-A2, A2-B1), dans l’ordre des niveaux. */
export function tcfBankAllLevels(competence: TcfCompetence): TcfExercise[] {
  return TCF_NIVEAUX.flatMap((n) => tcfBank(n.id, competence))
}

/** Exercices proposés pour un emplacement (CO et CE : même numéro d’épreuve). */
export function tcfSlotBank(niveau: TcfNiveau, slot: TcfSlotMeta): TcfExercise[] {
  return tcfBank(niveau, slot.competence).filter((ex) => {
    if (slot.numero == null) return true
    if (ex.competence !== 'CO' && ex.competence !== 'CE') return true
    return tcfPosition(ex.id) === slot.numero
  })
}

export function tcfExerciseById(id: string | undefined): TcfExercise | undefined {
  return id ? BANK.find((ex) => ex.id === id) : undefined
}
