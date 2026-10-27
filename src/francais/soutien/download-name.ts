/**
 * Noms de fichiers audio téléchargeables (tous domaines).
 *
 * Soutien FR (playlist groupée, WAV continu) :
 *   SOUTIEN-FR_VOYELLES_A_Exercice-1_10.10.2026.wav
 *
 * TCM CFR (playlist groupée, WAV continu) :
 *   TCM-CFR_Exercice-1_NOMBRE_Semestre-1.wav
 *   TCM-CFR_Exercice-2_MULTIPLICATION_Semestre-2.wav
 *
 * TCF :
 *   TCF_A1-A2_CO_Exercice-1_26-27_Semestre-1.mp3
 *   (+ `_Audio-2` si plusieurs fichiers)
 */

// ─── Commun ───────────────────────────────────────────────────────────────

/** Normalise un segment de nom (majuscules, tirets, sans accents). */
export function audioNameSegment(raw: string): string {
  return raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLocaleUpperCase('fr-FR')
}

/** @deprecated Alias — préférer `audioNameSegment`. */
export const soutienAudioNameSegment = audioNameSegment

/** JJ.MM.AAAA (calendrier civil). */
export function audioDateDot(date = new Date()): string {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}.${month}.${year}`
}

/**
 * Semestre scolaire : 1 = août–décembre, 2 = janvier–juillet.
 * Partagé TCM CFR / TCF.
 */
export function audioSemestreScolaire(
  date = new Date(),
): 'Semestre-1' | 'Semestre-2' {
  const month = date.getMonth() // 0 = janv.
  return month >= 7 && month <= 11 ? 'Semestre-1' : 'Semestre-2'
}

/** Année scolaire `AA-AA` (août → juillet) + semestre. */
export function audioAnneeSemestreScolaire(date = new Date()): {
  annee: string
  semestre: 'Semestre-1' | 'Semestre-2'
} {
  const month = date.getMonth()
  const year = date.getFullYear()
  if (month >= 7) {
    const y1 = year % 100
    const y2 = (year + 1) % 100
    return {
      annee: `${String(y1).padStart(2, '0')}-${String(y2).padStart(2, '0')}`,
      semestre: month >= 7 && month <= 11 ? 'Semestre-1' : 'Semestre-2',
    }
  }
  const y1 = (year - 1) % 100
  const y2 = year % 100
  return {
    annee: `${String(y1).padStart(2, '0')}-${String(y2).padStart(2, '0')}`,
    semestre: 'Semestre-2',
  }
}

function exerciseNoSafe(n: number): number {
  return Math.max(1, Math.round(n) || 1)
}

// ─── Soutien FR ───────────────────────────────────────────────────────────

export type SoutienAudioDownloadNameOpts = {
  /** Libellé thème UI (ex. « Voyelles »). */
  themeLabel: string
  /** Lettre affichée (ex. « A », « CH »). */
  letterLabel: string
  /** Numéro d’exercice sur la fiche (1-based). */
  exerciseNo: number
  date?: Date
}

/**
 * SOUTIEN-FR_{THEME}_{LETTRE}_Exercice-{n}_{JJ}.{MM}.{AAAA}.wav
 */
export function soutienAudioDownloadName(opts: SoutienAudioDownloadNameOpts): string {
  const theme = audioNameSegment(opts.themeLabel) || 'THEME'
  const letter = audioNameSegment(opts.letterLabel) || 'X'
  const n = exerciseNoSafe(opts.exerciseNo)
  return `SOUTIEN-FR_${theme}_${letter}_Exercice-${n}_${audioDateDot(opts.date)}.wav`
}

// ─── TCM CFR ──────────────────────────────────────────────────────────────

export type TcmCfrAudioKind = 'NOMBRE' | 'MULTIPLICATION'

export type TcmCfrAudioDownloadNameOpts = {
  kind: TcmCfrAudioKind
  /** Si omis : 1 = NOMBRE, 2 = MULTIPLICATION. */
  exerciseNo?: number
  date?: Date
}

/** Alias historique — même règle que `audioSemestreScolaire`. */
export function tcmCfrSemestre(date = new Date()): 'Semestre-1' | 'Semestre-2' {
  return audioSemestreScolaire(date)
}

/**
 * TCM-CFR_Exercice-{1|2}_{NOMBRE|MULTIPLICATION}_Semestre-{1|2}.wav
 */
export function tcmCfrAudioDownloadName(opts: TcmCfrAudioDownloadNameOpts): string {
  const exerciseNo =
    opts.exerciseNo ?? (opts.kind === 'MULTIPLICATION' ? 2 : 1)
  return `TCM-CFR_Exercice-${exerciseNoSafe(exerciseNo)}_${opts.kind}_${audioSemestreScolaire(opts.date)}.wav`
}

// ─── TCF ──────────────────────────────────────────────────────────────────

export type TcfAudioDownloadNameOpts = {
  /** Ex. `A1-A2`, `B1`, `B2`. */
  niveau: string
  /** Ex. `CO`, `CE`, `EE`, `EO`. */
  competence: string
  exerciseNo: number
  date?: Date
}

/** Alias historique TCF. */
export function tcfAnneeSemestre(date = new Date()): {
  annee: string
  semestre: 'Semestre-1' | 'Semestre-2'
} {
  return audioAnneeSemestreScolaire(date)
}

/**
 * Base (sans extension) :
 * TCF_{NIVEAU}_{COMPETENCE}_Exercice-{n}_{AA-AA}_Semestre-{1|2}
 */
export function tcfAudioFileBase(opts: TcfAudioDownloadNameOpts): string {
  const { annee, semestre } = audioAnneeSemestreScolaire(opts.date)
  const niveau = String(opts.niveau).trim() || 'NIVEAU'
  const competence = String(opts.competence).trim() || 'COMP'
  return `TCF_${niveau}_${competence}_Exercice-${exerciseNoSafe(opts.exerciseNo)}_${annee}_${semestre}`
}

/**
 * Nom complet TCF (un fichier) :
 * TCF_A1-A2_CO_Exercice-1_26-27_Semestre-1.mp3
 */
export function tcfAudioDownloadName(
  opts: TcfAudioDownloadNameOpts & { audioIndex?: number; audioCount?: number; ext?: string },
): string {
  const base = tcfAudioFileBase(opts)
  const ext = (opts.ext ?? 'mp3').replace(/^\./, '')
  const count = opts.audioCount ?? 1
  const index = opts.audioIndex ?? 1
  if (count <= 1) return `${base}.${ext}`
  return `${base}_Audio-${Math.max(1, index)}.${ext}`
}
