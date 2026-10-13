import { tcfScene } from './sources'
import type { TcfExercise } from './types'

export type TcfAudioEntry = {
  audio: string
  exercise: TcfExercise
  /** Scène / libellé court. */
  label: string
  /** Thème ou type pour la recherche. */
  meta: string
}

/** Chemins audio d’un exercice CO (un ou plusieurs). */
export function tcfExerciseAudios(ex: TcfExercise): string[] {
  const s = ex.support as { audio?: string; audios?: string[] }
  if (Array.isArray(s.audios)) return s.audios.map((a) => a.trim()).filter(Boolean)
  if (typeof s.audio === 'string' && s.audio.trim()) return [s.audio.trim()]
  return []
}

/** Index des audios de la banque (dédupliqués par chemin, premier exercice gardé). */
export function tcfAudioEntries(exercises: readonly TcfExercise[]): TcfAudioEntry[] {
  const seen = new Set<string>()
  const out: TcfAudioEntry[] = []
  for (const exercise of exercises) {
    for (const audio of tcfExerciseAudios(exercise)) {
      if (seen.has(audio)) continue
      seen.add(audio)
      const stem = audio.split('/').pop()?.replace(/\.mp3$/i, '') ?? audio
      out.push({
        audio,
        exercise,
        label: tcfScene(exercise),
        meta: [exercise.theme, exercise.type_exercice, stem, exercise.id].filter(Boolean).join(' · '),
      })
    }
  }
  return out.sort((a, b) => a.label.localeCompare(b.label, 'fr'))
}

/**
 * Remplace le contenu libre par celui de l’exercice banque lié à l’audio
 * (transcription, questions, thème…), en gardant l’id et le niveau courants.
 */
export function applyExerciseFromAudioBank(current: TcfExercise, source: TcfExercise): TcfExercise {
  const next = structuredClone(source)
  return {
    ...next,
    id: current.id,
    niveau: current.niveau,
  }
}
