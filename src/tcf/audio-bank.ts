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

/** Accents courants dans les stems / dossiers audio. */
const AUDIO_WORD_ACCENTS: Record<string, string> = {
  aeroport: 'aéroport',
  a: 'à',
  ecole: 'école',
  etudes: 'études',
  universite: 'université',
  bibliotheque: 'bibliothèque',
  theatre: 'théâtre',
  musee: 'musée',
  meteo: 'météo',
  telephone: 'téléphone',
  hopital: 'hôpital',
  cinema: 'cinéma',
  medicaments: 'médicaments',
  medecin: 'médecin',
  hotel: 'hôtel',
  presenter: 'présenter',
  vetements: 'vêtements',
  sante: 'santé',
  actualite: 'actualité',
}

/**
 * Nom lisible d’un chemin audio (« …/a-l-aeroport-1.mp3 » → « À l'aéroport »).
 * Pour les stems numériques soutien (`facile-a1__160`), utilise le dossier thème.
 */
export function tcfAudioDisplayName(audioPath: string, bankEntries?: readonly TcfAudioEntry[]): string {
  const trimmed = audioPath.trim()
  if (!trimmed) return ''
  const fromBank = bankEntries?.find((e) => e.audio === trimmed)
  if (fromBank?.label) return fromBank.label

  const parts = trimmed.split('/').filter(Boolean)
  const file = parts[parts.length - 1] ?? trimmed
  const folder = parts.length >= 2 ? parts[parts.length - 2]! : ''
  const stem = file.replace(/\.mp3$/i, '')
  const afterLevel = stem.includes('__') ? stem.split('__').slice(1).join('__') : stem
  const bare = afterLevel.replace(/-\d+(\.\d+)?$/, '').replace(/__/g, ' ').replace(/-/g, ' ').trim()

  // Stem purement numérique (dialogue soutien) → nom du dossier thème
  if (!bare || /^\d+$/.test(bare)) {
    return titleAudioWords(folder || bare || stem)
  }
  return titleAudioWords(bare)
}

function titleAudioWords(raw: string): string {
  const titled = raw
    .split(/\s+/)
    .map((w, i) => {
      let lower = w.toLocaleLowerCase('fr-FR')
      lower = AUDIO_WORD_ACCENTS[lower] ?? lower
      if (i > 0 && ['a', 'à', 'au', 'aux', 'de', 'des', 'du', 'en', 'et', 'l', 'la', 'le', 'les', 'un', 'une'].includes(lower)) {
        return lower === 'a' ? 'à' : lower
      }
      if (lower === 'l') return "l'"
      return lower.charAt(0).toLocaleUpperCase('fr-FR') + lower.slice(1)
    })
    .join(' ')
    .replace(/\bl'\s+/gi, "l'")
    .replace(/^A /, 'À ')
  return titled
}

/** Chemins audio d’un exercice CO (un ou plusieurs). */
export function tcfExerciseAudios(ex: TcfExercise): string[] {
  const s = ex.support as { audio?: string; audios?: string[] }
  if (Array.isArray(s.audios)) return s.audios.map((a) => a.trim()).filter(Boolean)
  if (typeof s.audio === 'string' && s.audio.trim()) return [s.audio.trim()]
  return []
}

/** Libellé banque : scène si renseignée, sinon nom dérivé du fichier audio. */
export function tcfAudioLabel(exercise: TcfExercise, audio: string): string {
  const scene = exercise.scene?.trim()
  if (scene) return scene
  return tcfAudioDisplayName(audio)
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
        label: tcfAudioLabel(exercise, audio),
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
