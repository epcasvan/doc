import { createRng, randomSeed, shuffle } from '@/math/rng'
import { tcfTypeMeta } from './catalog'
import { tcfBank, tcfBankAllLevels } from './loader'
import { emptyTcfExercise, tcfExerciseId } from './templates'
import type { TcfCompetence, TcfExercise, TcfNiveau, TcfQuestion, TcfTypeExercice } from './types'

function withNiveau(ex: TcfExercise, niveau: TcfNiveau): TcfExercise {
  return { ...structuredClone(ex), niveau }
}

/** Le niveau courant s’il a assez d’exercices, sinon tous les niveaux. */
function enough(niveau: TcfNiveau, items: TcfExercise[], min: number): TcfExercise[] {
  const here = items.filter((ex) => ex.niveau === niveau)
  return here.length >= min ? here : items
}

function complets(questions: number): TcfExercise[] {
  return tcfBankAllLevels('CO').filter(
    (ex) =>
      ex.type_exercice === 'complet' &&
      ex.questions.length === questions &&
      ex.support.audio.trim().length > 0,
  )
}

function tagged(ex: TcfExercise, audio: number): TcfQuestion[] {
  return ex.questions.map((q) => ({ ...structuredClone(q), audio }))
}

/**
 * Série au hasard pour le type choisi.
 * Courts : 6 audios, une question chacun. Moyens : 3 audios, deux questions chacun.
 * Images et situations : un exercice déjà défini (5 objets, ou dialogues illustrés).
 */
export function drawTcfSeries(
  niveau: TcfNiveau,
  competence: TcfCompetence,
  typeExercice: TcfTypeExercice,
): TcfExercise {
  const rng = createRng(randomSeed())
  const meta = tcfTypeMeta(competence, typeExercice)
  const blank = () =>
    emptyTcfExercise(niveau, competence, typeExercice, tcfExerciseId(niveau, competence, 1))

  if (competence === 'CO' && typeExercice === 'six_courts') {
    const picked = shuffle(rng, enough(niveau, complets(1), 6)).slice(0, 6)
    if (picked.length < 6) return blank()
    const series = blank()
    if (series.type_exercice !== 'six_courts') return blank()
    return {
      ...series,
      consigne: meta?.instruction,
      support: { audios: picked.map((ex) => (ex.type_exercice === 'complet' ? ex.support.audio : '')) },
      questions: picked.flatMap((ex, i) => tagged(ex, i + 1)),
    }
  }

  if (competence === 'CO' && typeExercice === 'trois_moyens') {
    const picked = shuffle(rng, enough(niveau, complets(2), 3)).slice(0, 3)
    if (picked.length < 3) return blank()
    const series = blank()
    if (series.type_exercice !== 'trois_moyens') return blank()
    return {
      ...series,
      consigne: meta?.instruction,
      support: { audios: picked.map((ex) => (ex.type_exercice === 'complet' ? ex.support.audio : '')) },
      questions: picked.flatMap((ex, i) => tagged(ex, i + 1)),
    }
  }

  if (competence === 'CO' && typeExercice === 'images_a_reconnaitre') {
    const ready = tcfBankAllLevels('CO').filter(
      (ex) => ex.type_exercice === 'images_a_reconnaitre' && ex.images.length === 5,
    )
    const source = shuffle(rng, ready)[0]
    return source ? withNiveau(source, niveau) : blank()
  }

  if (competence === 'CO' && typeExercice === 'association_images') {
    const ready = tcfBankAllLevels('CO').filter((ex) => ex.type_exercice === 'association_images')
    const source = shuffle(rng, ready)[0]
    return source ? withNiveau(source, niveau) : blank()
  }

  const here = tcfBank(niveau, competence, typeExercice)
  const any = tcfBankAllLevels(competence).filter((ex) => ex.type_exercice === typeExercice)
  const source = shuffle(rng, here.length ? here : any)[0]
  return source ? withNiveau(source, niveau) : blank()
}
