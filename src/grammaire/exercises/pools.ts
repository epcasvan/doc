import type { GramExerciseKindId } from './kinds'
import {
  DEFAULT_TAILS,
  STANDARD_PRONOUNS,
  type SubProfile,
  type TenseMode,
  type VerbConj,
  profileBySubId,
  SUB_PROFILES,
} from './profiles'
import type { GramBankItem } from './types'
import { gramExerciseTypeId } from './subthemes'

const POOL = 10

function sep(display: string, elide: boolean): string {
  return display.endsWith("'") || elide ? '' : ' '
}

function pronounAt(i: number) {
  return STANDARD_PRONOUNS[i % STANDARD_PRONOUNS.length]!
}

function tailAt(tails: string[], i: number) {
  return tails[i % tails.length]!
}

function verbAnswer(v: VerbConj, mode: TenseMode, idx: number): string {
  if (mode === 'passe_compose_avoir') {
    return ['ai', 'as', 'a', 'a', 'avons', 'avez', 'ont', 'ont'][idx]!
  }
  if (mode === 'passe_compose_etre') {
    return ['suis', 'es', 'est', 'est', 'sommes', 'êtes', 'sont', 'sont'][idx]!
  }
  if (mode === 'futur_proche') {
    return ['vais', 'vas', 'va', 'va', 'allons', 'allez', 'vont', 'vont'][idx]!
  }
  if (v.reflexive) {
    return `${v.reflexive[idx]} ${v.forms[idx]}`
  }
  return v.forms[idx]!
}

function fullForm(v: VerbConj, mode: TenseMode, idx: number): string {
  const ans = verbAnswer(v, mode, idx)
  if (mode === 'passe_compose_avoir' || mode === 'passe_compose_etre') {
    const pp =
      (idx === 3 || idx === 7) && v.participeF ? v.participeF : (v.participe ?? v.stem)
    return `${ans} ${pp}`
  }
  if (mode === 'futur_proche') {
    return `${ans} ${v.infinitive}`
  }
  return ans
}

function fillSentence(v: VerbConj, mode: TenseMode, idx: number, tail: string): string {
  const p = STANDARD_PRONOUNS[idx]!
  const blank = '___'
  const parenthetical = `(${v.infinitive})`
  if (mode === 'futur_proche') {
    return `${p.display}${sep(p.display, p.elide)}${blank} ${parenthetical}${tail}`
  }
  if (mode === 'passe_compose_avoir' || mode === 'passe_compose_etre') {
    const pp =
      (idx === 3 || idx === 7) && v.participeF ? v.participeF : (v.participe ?? v.stem)
    return `${p.display}${sep(p.display, p.elide)}${blank} ${pp} ${parenthetical}${tail}`
  }
  if (v.reflexive) {
    return `${p.display}${sep(p.display, p.elide)}${blank} ${parenthetical}${tail}`
  }
  return `${p.display}${sep(p.display, p.elide)}${blank} ${parenthetical}${tail}`
}

function affirmativeSentence(v: VerbConj, mode: TenseMode, idx: number, tail: string): string {
  const p = STANDARD_PRONOUNS[idx]!
  const form = fullForm(v, mode, idx)
  return `${p.display}${sep(p.display, p.elide)}${form}${tail}`.replace(/\s+/g, ' ').trim()
}

function negativeSentence(v: VerbConj, mode: TenseMode, idx: number, tail: string): string {
  const p = STANDARD_PRONOUNS[idx]!
  const t = tail.replace(/^\s/, '')
  if (mode === 'futur_proche') {
    const aller = ['vais', 'vas', 'va', 'va', 'allons', 'allez', 'vont', 'vont'][idx]!
    return `${p.display} ne ${aller} pas ${v.infinitive} ${t}`.replace(/\s+/g, ' ').trim()
  }
  if (mode === 'passe_compose_avoir' || mode === 'passe_compose_etre') {
    const aux =
      mode === 'passe_compose_etre'
        ? ['suis', 'es', 'est', 'est', 'sommes', 'êtes', 'sont', 'sont'][idx]!
        : ['ai', 'as', 'a', 'a', 'avons', 'avez', 'ont', 'ont'][idx]!
    const pp =
      (idx === 3 || idx === 7) && v.participeF ? v.participeF : (v.participe ?? v.stem)
    const elide = (idx === 0 || idx === 2 || idx === 3) && /^[aeiou]/i.test(aux)
    const ne = elide ? "n'" : 'ne '
    return `${p.display} ${ne}${aux} pas ${pp} ${t}`.replace(/\s+/g, ' ').trim()
  }
  const form = v.forms[idx]!
  const startsVowel = /^[aeiouhéèêëàâîïôùûü]/i.test(form)
  const ne = (p.display === 'Je' && startsVowel) || startsVowel ? "n'" : 'ne '
  if (v.reflexive) {
    return `${p.display} ${ne}${v.reflexive[idx]} ${form} pas ${t}`.replace(/\s+/g, ' ').trim()
  }
  return `${p.display} ${ne}${form} pas ${t}`.replace(/\s+/g, ' ').trim()
}

function uniqueOptions(correct: string, distractors: string[]): string[] {
  const opts = [correct]
  for (const d of distractors) {
    if (d && d !== correct && !opts.includes(d)) opts.push(d)
    if (opts.length >= 3) break
  }
  // Remplir si besoin
  const fallback = ['suis', 'es', 'est', 'avons', 'allez', 'vont', 'parle', 'parles']
  for (const f of fallback) {
    if (opts.length >= 3) break
    if (!opts.includes(f)) opts.push(f)
  }
  return opts.slice(0, 3)
}

function buildQcmConj(profile: SubProfile): GramBankItem[] {
  const tails = profile.tails ?? DEFAULT_TAILS
  const items: GramBankItem[] = []
  for (let i = 0; i < POOL; i++) {
    const v = profile.verbs[i % profile.verbs.length]!
    const idx = i % 8
    const tail = tailAt(tails, i)
    const answer = verbAnswer(v, profile.mode, idx)
    const distractors = [
      verbAnswer(v, profile.mode, (idx + 1) % 8),
      verbAnswer(v, profile.mode, (idx + 4) % 8),
      verbAnswer(profile.verbs[(i + 1) % profile.verbs.length]!, profile.mode, idx),
    ]
    const options = uniqueOptions(answer, distractors)
    items.push({
      prompt: fillSentence(v, profile.mode, idx, tail),
      answer,
      options,
      hint: v.infinitive,
    })
  }
  return items
}

function buildFillConj(profile: SubProfile): GramBankItem[] {
  const tails = profile.tails ?? DEFAULT_TAILS
  const items: GramBankItem[] = []
  for (let i = 0; i < POOL; i++) {
    const v = profile.verbs[i % profile.verbs.length]!
    const idx = i % 8
    const tail = tailAt(tails, i)
    items.push({
      prompt: fillSentence(v, profile.mode, idx, tail),
      answer: verbAnswer(v, profile.mode, idx),
      hint: v.infinitive,
    })
  }
  return items
}

function buildQcmVerbe(profile: SubProfile): GramBankItem[] {
  const tails = profile.tails ?? DEFAULT_TAILS
  const items: GramBankItem[] = []
  for (let i = 0; i < POOL; i++) {
    const v = profile.verbs[i % profile.verbs.length]!
    const idx = i % 8
    const p = pronounAt(i)
    const tail = tailAt(tails, i)
    const answer = fullForm(v, profile.mode, idx)
    const other = profile.verbs[(i + 1) % profile.verbs.length]!
    const distractors = [
      fullForm(other, profile.mode, idx),
      fullForm(v, profile.mode, (idx + 2) % 8),
    ]
    items.push({
      prompt: `${p.display}${sep(p.display, p.elide)}___${tail}`,
      answer,
      options: uniqueOptions(answer, distractors),
      hint: v.infinitive,
    })
  }
  return items
}

function buildPluriel(profile: SubProfile): GramBankItem[] {
  const tails = profile.tails ?? DEFAULT_TAILS
  const pairs = [
    { s: 0, p: 4 },
    { s: 1, p: 5 },
    { s: 2, p: 6 },
    { s: 3, p: 7 },
  ]
  const items: GramBankItem[] = []
  for (let i = 0; i < POOL; i++) {
    const v = profile.verbs[i % profile.verbs.length]!
    const { s, p } = pairs[i % pairs.length]!
    const tail = tailAt(tails, i)
    const sp = STANDARD_PRONOUNS[s]!
    const pp = STANDARD_PRONOUNS[p]!
    const sing = affirmativeSentence(v, profile.mode, s, tail)
    const plurForm = fullForm(v, profile.mode, p)
    items.push({
      prompt: `${sing} → ${pp.display} ___${tail}`,
      answer: plurForm,
      hint: 'pluriel',
    })
  }
  return items
}

function buildSingulier(profile: SubProfile): GramBankItem[] {
  const tails = profile.tails ?? DEFAULT_TAILS
  const pairs = [
    { s: 0, p: 4 },
    { s: 1, p: 5 },
    { s: 2, p: 6 },
    { s: 3, p: 7 },
  ]
  const items: GramBankItem[] = []
  for (let i = 0; i < POOL; i++) {
    const v = profile.verbs[i % profile.verbs.length]!
    const { s, p } = pairs[i % pairs.length]!
    const tail = tailAt(tails, i)
    const sp = STANDARD_PRONOUNS[s]!
    const plur = affirmativeSentence(v, profile.mode, p, tail)
    const singForm = fullForm(v, profile.mode, s)
    items.push({
      prompt: `${plur} → ${sp.display} ___${tail}`,
      answer: singForm,
      hint: 'singulier',
    })
  }
  return items
}

function buildNegatif(profile: SubProfile): GramBankItem[] {
  const tails = profile.tails ?? DEFAULT_TAILS
  const items: GramBankItem[] = []
  for (let i = 0; i < POOL; i++) {
    const v = profile.verbs[i % profile.verbs.length]!
    const idx = i % 8
    const tail = tailAt(tails, i)
    const aff = affirmativeSentence(v, profile.mode, idx, tail)
    const neg = negativeSentence(v, profile.mode, idx, tail)
    items.push({
      prompt: `${aff.replace(/\.$/, '')}.`,
      answer: neg.endsWith('.') ? neg : `${neg}.`,
      hint: 'ne … pas',
    })
  }
  return items
}

function buildAffirmatif(profile: SubProfile): GramBankItem[] {
  const tails = profile.tails ?? DEFAULT_TAILS
  const items: GramBankItem[] = []
  for (let i = 0; i < POOL; i++) {
    const v = profile.verbs[i % profile.verbs.length]!
    const idx = i % 8
    const tail = tailAt(tails, i)
    const neg = negativeSentence(v, profile.mode, idx, tail)
    const aff = affirmativeSentence(v, profile.mode, idx, tail)
    items.push({
      prompt: `${neg.endsWith('.') ? neg : `${neg}.`}`,
      answer: aff.endsWith('.') ? aff : `${aff}.`,
      hint: 'forme affirmative',
    })
  }
  return items
}

function buildEcrire(profile: SubProfile): GramBankItem[] {
  const items: GramBankItem[] = []
  for (let i = 0; i < POOL; i++) {
    const verb = profile.verbPool[i % profile.verbPool.length]!
    const word = profile.wordPool[i % profile.wordPool.length]!
    items.push({
      prompt: `Verbe : ${verb} · Mot : ${word}`,
      answer: `(phrase libre avec « ${verb} » et « ${word} »)`,
      givenVerb: verb,
      givenWord: word,
      hint: 'sujet + verbe + complément',
    })
  }
  return items
}

const BUILDERS: Record<GramExerciseKindId, (p: SubProfile) => GramBankItem[]> = {
  'qcm-conj': buildQcmConj,
  'fill-conj': buildFillConj,
  'qcm-verbe': buildQcmVerbe,
  pluriel: buildPluriel,
  singulier: buildSingulier,
  negatif: buildNegatif,
  affirmatif: buildAffirmatif,
  ecrire: buildEcrire,
}

/** Banque figée pour un type d’exercice. */
export function buildBankFor(subId: string, kindId: GramExerciseKindId): GramBankItem[] {
  const profile = profileBySubId(subId)
  if (!profile) return []
  return BUILDERS[kindId](profile)
}

/** Toutes les banques conjugaison (sous-thèmes avec profil). */
export function buildAllConjBanks(): Record<string, GramBankItem[]> {
  const out: Record<string, GramBankItem[]> = {}
  for (const profile of SUB_PROFILES) {
    for (const kindId of Object.keys(BUILDERS) as GramExerciseKindId[]) {
      const typeId = gramExerciseTypeId(profile.subId, kindId)
      out[typeId] = buildBankFor(profile.subId, kindId)
    }
  }
  return out
}
