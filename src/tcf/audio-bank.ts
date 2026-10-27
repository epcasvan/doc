import type { TcfExercise } from './types'

export type TcfAudioEntry = {
  audio: string
  exercise: TcfExercise
  /** Scène / libellé court (numéroté s’il y a des doublons). */
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
  journee: 'journée',
}

/** Types de stem soutien à préfixer par le dossier thème. */
const GENERIC_STEM_TYPES = new Set([
  'annonce',
  'conversation',
  'message',
  'radio',
  'objet',
  'instruction',
])

/**
 * Nom lisible d’un chemin audio (« …/a-l-aeroport-1.mp3 » → « À l'aéroport »).
 * Pour les stems numériques soutien (`facile-a1__160`), utilise le dossier thème.
 */
export function tcfAudioDisplayName(audioPath: string, bankEntries?: readonly TcfAudioEntry[]): string {
  const trimmed = audioPath.trim()
  if (!trimmed) return ''
  const fromBank = bankEntries?.find((e) => e.audio === trimmed)
  if (fromBank?.label) return fromBank.label
  return tcfAudioBaseFromPath(trimmed)
}

/** Base sans numéro (pour regrouper les doublons). */
export function tcfAudioBaseFromPath(audioPath: string): string {
  const trimmed = audioPath.trim()
  const parts = trimmed.split('/').filter(Boolean)
  const file = parts[parts.length - 1] ?? trimmed
  const folder = parts.length >= 2 ? parts[parts.length - 2]! : ''
  const stem = file.replace(/\.mp3$/i, '')
  const afterLevel = stem.includes('__') ? stem.split('__').slice(1).join('__') : stem
  const bare = afterLevel.replace(/-\d+(\.\d+)?$/, '').replace(/__/g, ' ').replace(/-/g, ' ').trim()

  if (!bare || /^\d+$/.test(bare)) {
    return titleAudioWords(folder || bare || stem)
  }
  const titled = titleAudioWords(bare)
  if (GENERIC_STEM_TYPES.has(bare.toLocaleLowerCase('fr-FR')) && folder) {
    return `${titleAudioWords(folder)} · ${titled}`
  }
  return titled
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

/** Retire un éventuel suffixe numérique (« À l'aéroport - 2 » → « À l'aéroport »). */
function stripTrailingNumber(label: string): string {
  return label.replace(/\s*[-–]?\s*\d+$/u, '').trim() || label
}

/** Numéro implicite dans le nom de fichier (`a-l-aeroport-2`, `facile-a1__160`). */
function audioStemNumber(audio: string): number | null {
  const stem = audio.split('/').pop()?.replace(/\.mp3$/i, '') ?? ''
  const after = stem.includes('__') ? stem.split('__').slice(1).join('__') : stem
  const m = after.match(/-(\d+)(?:\.\d+)?$/u) || after.match(/^(\d+)$/u)
  return m ? Number(m[1]) : null
}

/** Chemins audio d’un exercice CO (un ou plusieurs). */
export function tcfExerciseAudios(ex: TcfExercise): string[] {
  const s = ex.support as { audio?: string; audios?: string[] }
  if (Array.isArray(s.audios)) return s.audios.map((a) => a.trim()).filter(Boolean)
  if (typeof s.audio === 'string' && s.audio.trim()) return [s.audio.trim()]
  return []
}

/** Libellé de base : scène / thème scénario, sinon nom dérivé du fichier. */
export function tcfAudioBaseLabel(exercise: TcfExercise, audio: string): string {
  const scene = exercise.scene?.trim()
  if (scene) return stripTrailingNumber(scene)
  return tcfAudioBaseFromPath(audio)
}

/** Index des audios de la banque (dédupliqués par chemin, premier exercice gardé). */
export function tcfAudioEntries(exercises: readonly TcfExercise[]): TcfAudioEntry[] {
  const seen = new Set<string>()
  const raw: Array<{ audio: string; exercise: TcfExercise; base: string; stem: string }> = []
  for (const exercise of exercises) {
    for (const audio of tcfExerciseAudios(exercise)) {
      if (seen.has(audio)) continue
      seen.add(audio)
      const stem = audio.split('/').pop()?.replace(/\.mp3$/i, '') ?? audio
      raw.push({
        audio,
        exercise,
        base: tcfAudioBaseLabel(exercise, audio),
        stem,
      })
    }
  }

  const counts = new Map<string, number>()
  for (const row of raw) counts.set(row.base, (counts.get(row.base) ?? 0) + 1)

  // Ordre stable pour la numérotation : numéro de fichier puis chemin
  const byBase = new Map<string, typeof raw>()
  for (const row of raw) {
    const list = byBase.get(row.base) ?? []
    list.push(row)
    byBase.set(row.base, list)
  }
  for (const list of byBase.values()) {
    list.sort((a, b) => {
      const na = audioStemNumber(a.audio)
      const nb = audioStemNumber(b.audio)
      if (na != null && nb != null && na !== nb) return na - nb
      if (na != null && nb == null) return -1
      if (na == null && nb != null) return 1
      return a.audio.localeCompare(b.audio, 'fr')
    })
  }

  const out: TcfAudioEntry[] = []
  for (const row of raw) {
    const list = byBase.get(row.base)!
    const total = counts.get(row.base) ?? 1
    const index = list.indexOf(row) + 1
    const label = total > 1 ? `${row.base} ${index}` : row.base
    out.push({
      audio: row.audio,
      exercise: row.exercise,
      label,
      meta: [row.exercise.theme, row.exercise.type_exercice, row.stem, row.exercise.id].filter(Boolean).join(' · '),
    })
  }
  return out.sort((a, b) => a.label.localeCompare(b.label, 'fr', { numeric: true }))
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
