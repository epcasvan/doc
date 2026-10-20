import { createRng, randomSeed, shuffle } from '@/math/rng'
import { tcfBank, tcfBankAllLevels } from './loader'
import { emptyTcfExercise, tcfExerciseId } from './templates'
import type { TcfCompetence, TcfExercise, TcfNiveau, TcfTypeExercice } from './types'

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

/**
 * Un audio au hasard pour le type choisi.
 * Court : un seul extrait, une question. Moyen : un seul extrait, deux questions.
 * On ne recolle pas plusieurs mini-audios dans le même exercice.
 * Images et situations : un exercice déjà défini (5 objets, ou dialogues illustrés).
 */
export function drawTcfSeries(
  niveau: TcfNiveau,
  competence: TcfCompetence,
  typeExercice: TcfTypeExercice,
): TcfExercise {
  const rng = createRng(randomSeed())
  const blank = () =>
    emptyTcfExercise(niveau, competence, typeExercice, tcfExerciseId(niveau, competence, 1))

  if (competence === 'CO' && (typeExercice === 'six_courts' || typeExercice === 'trois_moyens')) {
    const questions = typeExercice === 'six_courts' ? 1 : 2
    const source = shuffle(rng, enough(niveau, complets(questions), 1))[0]
    return source ? withNiveau(source, niveau) : blank()
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
