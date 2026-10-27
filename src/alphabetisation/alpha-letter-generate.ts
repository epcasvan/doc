/** Générateurs Alphabétisation — leçons lettre / son (hors délégation Soutien FR). */
import type { MathItem } from '@/math/types'

export type AlphaBatch = {
  items: MathItem[]
  instruction: string
  preferredColumns?: number
}

import { displayVocabLabel } from '@/francais/display-vocab-label'
import { genKind } from '@/francais/soutien/gen-kind'
import {
  AUDIO_ORDER_CLIPS,
  buildSyllableReadingList,
  letterGrid,
  syllableBlockRows,
} from '@/francais/soutien/gen-kind-helpers'
import type { SoutienGenerateOptions } from '@/francais/soutien/generate-options'
import { type1Words } from '@/francais/soutien/type1-words'
import type { SoutienVowelBank } from '@/francais/soutien/banks'
import { soutienAudioFor } from '@/francais/soutien/audio'
import { syllabifyFr } from '@/francais/soutien/syllabify-fr'
import {
  wordHasLessonLetter,
  wordHasLessonSound,
} from '@/francais/soutien/phoneme'
import { pick, shuffle, type Rng } from '@/math/rng'
import type { Difficulty } from '@/math/types'
import type { AlphaLetterKindId } from './letter-kinds'

function soulignerWords(
  bank: SoutienVowelBank,
  rng: Rng,
  count: number,
  upper: boolean,
): AlphaBatch {
  const pool = shuffle(rng, type1Words(bank, rng, Math.max(count, 12))).slice(0, count)
  const letter = upper ? bank.letterUpper : bank.letterLower
  const words = pool.map((w) => {
    const d = displayVocabLabel(w)
    return upper ? d.toLocaleUpperCase('fr-FR') : d.toLocaleLowerCase('fr-FR')
  })
  const instruction = `Soulignez la lettre ${letter} dans les mots.`
  return {
    instruction,
    preferredColumns: 1,
    items: [
      {
        layout: 'mark-letter',
        markLetterWords: words,
        themeGraphemes: [...bank.graphemes],
        answer: words.join(' · '),
      },
    ],
  }
}

/** Syllabes CV / VC sans son complexe (an, am, en, on…). */
function isSimpleCvVcSyllable(s: string): boolean {
  const lo = s.toLocaleLowerCase('fr-FR')
  if (lo.length !== 2) return false
  if (/^(an|am|en|em|in|im|on|om|un|um|ain|ein|oin)$/i.test(lo)) return false
  return (
    /^[bcdfghjklmnpqrstvwxz][aeiouyàâäéèêëïîôöùûü]$/i.test(lo) ||
    /^[aeiouyàâäéèêëïîôöùûü][bcdfghjklmpqrstvwxz]$/i.test(lo)
  )
}

const SIMPLE_CONS = ['b', 'c', 'd', 'f', 'g', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'z'] as const
const SIMPLE_VOWELS = ['a', 'e', 'i', 'o', 'u', 'y'] as const

/** Mélange déterministe CV + VC (moitié / moitié) sans nasales. */
function buildSimpleCvVcList(rng: Rng, bank: SoutienVowelBank, total: number): string[] {
  const half = Math.ceil(total / 2)
  const seen = new Set<string>()
  const cv: string[] = []
  const vc: string[] = []
  const tryAdd = (bucket: string[], value: string): boolean => {
    if (seen.has(value) || !isSimpleCvVcSyllable(value)) return false
    seen.add(value)
    bucket.push(value)
    return true
  }
  const isVowelLesson = /^[aeiouy]$/.test(bank.id)
  const vowels = isVowelLesson ? [bank.letterLower] : [...SIMPLE_VOWELS]
  const cons =
    !isVowelLesson && bank.letterLower.length === 1 && (SIMPLE_CONS as readonly string[]).includes(bank.letterLower)
      ? [bank.letterLower]
      : [...SIMPLE_CONS]
  const safeVcCons = cons.filter((c) => !/[nm]/i.test(c))
  const vcCons = safeVcCons.length > 0 ? safeVcCons : [...SIMPLE_CONS.filter((c) => !/[nm]/i.test(c))]
  let guard = 0
  while (cv.length < half && guard < half * 60) {
    guard += 1
    tryAdd(cv, `${pick(rng, cons)}${pick(rng, vowels)}`)
  }
  guard = 0
  while (vc.length < total - half && guard < half * 60) {
    guard += 1
    tryAdd(vc, `${pick(rng, vowels)}${pick(rng, vcCons)}`)
  }
  while (cv.length < half) {
    const s = `${pick(rng, cons)}${pick(rng, vowels)}`
    if (!seen.has(s)) seen.add(s)
    cv.push(s)
  }
  while (vc.length < total - half) {
    const s = `${pick(rng, vowels)}${pick(rng, vcCons)}`
    if (!seen.has(s)) seen.add(s)
    vc.push(s)
  }
  return shuffle(rng, [...cv.slice(0, half), ...vc.slice(0, total - half)]).slice(0, total)
}

function syllabesCvVc(
  bank: SoutienVowelBank,
  rng: Rng,
  lineCount: number,
  columns: number,
): AlphaBatch {
  const cols = Math.max(4, Math.min(6, Math.round(columns) || 5))
  const rows = syllableBlockRows(lineCount)
  const total = cols * rows
  const list = buildSimpleCvVcList(rng, bank, total)
  return {
    instruction: 'Lisez les syllabes ci-dessous.',
    preferredColumns: 1,
    items: [
      {
        layout: 'syllable-table',
        options: list,
        labels: [...bank.graphemes],
        answer: list.join(' · '),
        letterGridCols: cols,
        syllableTableScriptOnly: true,
        syllableTableCellFrames: true,
      },
    ],
  }
}

function syllabesLong(
  bank: SoutienVowelBank,
  rng: Rng,
  lineCount: number,
  columns: number,
): AlphaBatch {
  const cols = Math.max(4, Math.min(6, Math.round(columns) || 5))
  const rows = syllableBlockRows(lineCount)
  const total = cols * rows
  const all = buildSyllableReadingList(rng, bank, total * 3)
  const long = all.filter(
    (s) =>
      s.length >= 3 &&
      s.length <= 4 &&
      !/(an|am|en|em|in|im|on|om|un|um|ain|ein|oin)/i.test(s),
  )
  const list = shuffle(rng, long.length >= total ? long : all.filter((s) => s.length >= 3)).slice(
    0,
    total,
  )
  return {
    instruction: 'Lisez les syllabes ci-dessous.',
    preferredColumns: 1,
    items: [
      {
        layout: 'syllable-table',
        options: list,
        labels: [...bank.graphemes],
        answer: list.join(' · '),
        letterGridCols: cols,
        syllableTableScriptOnly: true,
        syllableTableCellFrames: true,
      },
    ],
  }
}

function syllabesPrononcer(
  bank: SoutienVowelBank,
  rng: Rng,
  count: number,
  columns: number,
): AlphaBatch {
  const cols = Math.max(1, Math.min(2, Math.round(columns) || 2))
  const words = shuffle(
    rng,
    type1Words(bank, rng, Math.max(count, 16)).filter((w) => {
      const n = syllabifyFr(w).length
      return n >= 2 && n <= 3
    }),
  ).slice(0, count)
  const rows = words.map((raw, index) => {
    const word = displayVocabLabel(raw)
    const parts = syllabifyFr(word)
    return {
      index: index + 1,
      word,
      parts,
      audioSrc: soutienAudioFor(raw) ?? soutienAudioFor(word),
    }
  })
  return {
    instruction: 'Prononcez les syllabes des mots.',
    preferredColumns: 1,
    items: [
      {
        layout: 'syllable-pronounce',
        syllablePronounceRows: rows,
        answer: rows.map((r) => `${r.index}. ${r.parts.join('-')}`).join(' · '),
        themeGraphemes: [...bank.graphemes],
        letterGridCols: cols,
      },
    ],
  }
}

/** Nombre de lettres d’une syllabe (accents compris, sans signe). */
function syllableLetterCount(syll: string): number {
  return [...syll].filter((ch) => /\p{L}/u.test(ch)).length
}

function associerSyllabes(
  bank: SoutienVowelBank,
  rng: Rng,
  seriesCount: number,
): AlphaBatch {
  const items: MathItem[] = []
  const used = new Set<string>()
  for (let s = 0; s < seriesCount; s++) {
    const clips: Array<{ word: string; audioSrc?: string }> = []
    let guard = 0
    while (clips.length < AUDIO_ORDER_CLIPS && guard < 200) {
      guard += 1
      const raw = pick(rng, type1Words(bank, rng, 24))
      const parts = syllabifyFr(displayVocabLabel(raw))
      const syll = parts.find((p) => syllableLetterCount(p) <= 3 && wordHasLessonLetter(p, bank))
      if (!syll) continue
      const key = syll.toLowerCase()
      if (used.has(key)) continue
      const audioSrc = soutienAudioFor(syll) ?? soutienAudioFor(raw)
      if (!audioSrc) continue
      used.add(key)
      clips.push({
        word: syll,
        // Audio de la syllabe si dispo, sinon le mot source (QR).
        audioSrc,
      })
    }
    if (clips.length < AUDIO_ORDER_CLIPS) break
    const slotSource = clips.map((clip, i) => ({
      word: clip.word,
      correctNum: i + 1,
    }))
    const slots = shuffle(rng, slotSource)
    items.push({
      layout: 'audio-order',
      audioOrder: { mode: 'words', clips, slots },
      answer: clips.map((c, i) => `${i + 1} → ${c.word}`).join(' · '),
      themeGraphemes: [...bank.graphemes],
    })
  }
  return {
    instruction: 'Écoutez et classez les syllabes dans l’ordre.',
    preferredColumns: 1,
    items,
  }
}

function syllablePool(bank: SoutienVowelBank, rng: Rng, need: number, requireAudio = false) {
  const hasAudio = (word: string) =>
    Boolean(soutienAudioFor(word) || soutienAudioFor(displayVocabLabel(word)))
  const eligible = (word: string) =>
    syllabifyFr(word).length >= 2 &&
    (wordHasLessonLetter(word, bank) || wordHasLessonSound(word, bank)) &&
    (!requireAudio || hasAudio(word))
  const pool = shuffle(
    rng,
    bank.syllableItems.filter((item) => eligible(item.word)),
  )
  let chosen = pool.slice(0, need)
  if (chosen.length < need) {
    const rest = bank.syllableItems.filter(
      (item) =>
        syllabifyFr(item.word).length >= 2 &&
        (!requireAudio || hasAudio(item.word)) &&
        !chosen.some((t) => t.word.toLowerCase() === item.word.toLowerCase()),
    )
    chosen = [...chosen, ...shuffle(rng, rest)].slice(0, need)
  }
  return chosen
}

export function generateAlphaLetterKind(
  kind: AlphaLetterKindId,
  bank: SoutienVowelBank,
  count: number,
  rng: Rng,
  difficulty: Difficulty,
  options?: SoutienGenerateOptions,
): AlphaBatch | null {
  const n = Math.max(1, count)
  switch (kind) {
    case 'lettres-maj': {
      const item = letterGrid(rng, bank, n, 'upper')
      return {
        instruction: `Entourez les lettres ${bank.letterUpper}.`,
        preferredColumns: 1,
        items: [{ ...item, prompt: undefined }],
      }
    }
    case 'lettres-min': {
      const item = letterGrid(rng, bank, n, 'lower')
      return {
        instruction: `Entourez les lettres ${bank.letterLower}.`,
        preferredColumns: 1,
        items: [{ ...item, prompt: undefined }],
      }
    }
    case 'souligner-maj':
      return soulignerWords(bank, rng, Math.min(16, n), true)
    case 'souligner-min':
      return soulignerWords(bank, rng, Math.min(16, n), false)
    case 'syllabe-son-qr': {
      const cols = Math.max(1, Math.min(3, Math.round(options?.columns ?? 3) || 3))
      const need = Math.max(1, Math.min(18, n))
      const chosen = syllablePool(bank, rng, need, true)
      return {
        instruction: `À quelle syllabe entendez-vous le son ${bank.sound} ?`,
        preferredColumns: 1,
        items: [
          {
            layout: 'syllable-sound',
            syllableSoundItems: chosen.map((item) => {
              const raw = item.word
              const word = displayVocabLabel(raw)
              const parts = syllabifyFr(word)
              const hitIndices = parts
                .map((p, i) => (wordHasLessonLetter(p, bank) ? i : -1))
                .filter((i) => i >= 0)
              return {
                word,
                parts,
                hitIndex: hitIndices[0] ?? -1,
                hitIndices,
                audioSrc: soutienAudioFor(raw) ?? soutienAudioFor(word),
              }
            }),
            syllableSoundQrOnly: true,
            answer: chosen
              .map((item) => {
                const word = displayVocabLabel(item.word)
                const parts = syllabifyFr(word)
                const hits = parts.filter((p) => wordHasLessonLetter(p, bank))
                return hits.length ? `${word} → ${hits.join(' · ')}` : word
              })
              .join(' · '),
            letterGridCols: cols,
            themeGraphemes: [...bank.graphemes],
          },
        ],
      }
    }
    case 'associer-syllabe':
      return associerSyllabes(bank, rng, Math.max(1, Math.min(3, n)))
    case 'syllabes-cv':
      return syllabesCvVc(bank, rng, n, options?.columns ?? 5)
    case 'syllabes-long':
      return syllabesLong(bank, rng, n, options?.columns ?? 5)
    case 'syllabes-prononcer':
      return syllabesPrononcer(bank, rng, Math.min(16, n), options?.columns ?? 2)
    case 'mots':
    case 'ecouter':
    case 'ecouter-image':
    case 'syllabe-son':
    case 'associer-audio':
    case 'associer-image': {
      const soutienKind = kind
      const alphaCols =
        kind === 'mots' ? Math.max(3, Math.min(4, Math.round(options?.columns ?? 3) || 3)) : null
      const merged: SoutienGenerateOptions = {
        ...options,
        columns:
          kind === 'ecouter'
            ? Math.max(2, Math.min(3, Math.round(options?.columns ?? 3) || 3))
            : kind === 'mots'
              ? (alphaCols ?? 3)
              : options?.columns,
        alphaVocabCount: kind === 'mots' ? Math.max(1, Math.min(16, n)) : options?.alphaVocabCount,
      }
      return genKind(soutienKind, bank, n, rng, difficulty, merged)
    }
    default:
      return null
  }
}
