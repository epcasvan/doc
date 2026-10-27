import type { GramBankItem, GramLesson } from '../types'
import type { GramExerciseKindId } from '../kinds'

type Extra = { hint?: string; audioSrc?: string }

function extraFields(extra?: Extra | string): Extra {
  if (!extra) return {}
  if (typeof extra === 'string') return extra ? { hint: extra } : {}
  return {
    ...(extra.hint ? { hint: extra.hint } : {}),
    ...(extra.audioSrc ? { audioSrc: extra.audioSrc } : {}),
  }
}

export function fill(
  prompt: string,
  answer: string,
  extra?: Extra | string,
): GramBankItem {
  return { prompt, answer, ...extraFields(extra) }
}

export function qcm(
  prompt: string,
  answer: string,
  options: string[],
  extra?: Extra | string,
): GramBankItem {
  const opts = [...options]
  if (!opts.includes(answer)) opts[0] = answer
  return { prompt, answer, options: opts, ...extraFields(extra) }
}

export function writeItem(verb: string, word: string, extra?: Extra): GramBankItem {
  return {
    prompt: `Verbe : ${verb} · Mot : ${word}`,
    answer: `(phrase libre avec « ${verb} » et « ${word} »)`,
    givenVerb: verb,
    givenWord: word,
    ...extraFields(extra),
  }
}

export function lesson(
  subId: string,
  kindId: GramExerciseKindId,
  label: string,
  instruction: string,
  items: GramBankItem[],
): GramLesson {
  return { subId, kindId, label, instruction, items }
}
