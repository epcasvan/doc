import type { GramExerciseKindId } from './kinds'

export type GramLesson = {
  subId: string
  kindId: GramExerciseKindId
  /** Libellé du type dans le sélecteur (sous-thème déjà choisi). */
  label: string
  instruction: string
  items: GramBankItem[]
}

export type GramBankItem = {
  /** Énoncé (peut contenir ___ pour le blanc). */
  prompt: string
  /** Réponse attendue (forme ou phrase). */
  answer: string
  /** Choix QCM (3) ; absent pour fill / write. */
  options?: string[]
  /** Indice enseignant (verbe, temps…). */
  hint?: string
  /** Mot donné pour « écrire une phrase ». */
  givenWord?: string
  /** Verbe donné pour « écrire une phrase ». */
  givenVerb?: string
  /** Enregistrement à écouter (compréhension orale). */
  audioSrc?: string
}

export type GramBankFile = {
  typeId: string
  subId: string
  kindId: GramExerciseKindId
  items: GramBankItem[]
}

export function isGrammaireExerciseType(typeId: string): boolean {
  return typeId.startsWith('gram-ex-')
}

export function isGrammaireType(typeId: string): boolean {
  return typeId.startsWith('gram-')
}
