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
        answer: words.join(' · '),
      },
    ],
  }
}

function syllabesCvVc(bank: SoutienVowelBank, rng: Rng, lineCount: number): AlphaBatch {
  const cols = 5
  const rows = syllableBlockRows(lineCount)
  const total = cols * rows
  const all = buildSyllableReadingList(rng, bank, total * 2)
  const cvvc = all.filter((s) => s.length === 2)
  const list = shuffle(rng, cvvc.length >= total ? cvvc : all).slice(0, total)
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
      },
    ],
  }
}

function syllabesLong(bank: SoutienVowelBank, rng: Rng, lineCount: number): AlphaBatch {
  const cols = 5
  const rows = syllableBlockRows(lineCount)
  const total = cols * rows
  const all = buildSyllableReadingList(rng, bank, total * 3)
  const long = all.filter((s) => s.length >= 3 && s.length <= 4)
  const list = shuffle(rng, long.length >= total ? long : all).slice(0, total)
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
      },
    ],
  }
}

function syllabesPrononcer(
  bank: SoutienVowelBank,
  rng: Rng,
  count: number,
): AlphaBatch {
  const words = shuffle(
    rng,
    type1Words(bank, rng, Math.max(count, 12)).filter((w) => syllabifyFr(w).length >= 2),
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
      },
    ],
  }
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
      const hitIdx = parts.findIndex((p) => wordHasLessonLetter(p, bank))
      if (hitIdx < 0) continue
      const syll = parts[hitIdx]!
      const key = syll.toLowerCase()
      if (used.has(key)) continue
      used.add(key)
      clips.push({
        word: syll,
        audioSrc: soutienAudioFor(raw) ?? undefined,
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

function syllablePool(bank: SoutienVowelBank, rng: Rng, need: number) {
  const pool = shuffle(
    rng,
    bank.syllableItems.filter((item) => {
      const parts = syllabifyFr(item.word)
      return (
        parts.length >= 2 &&
        (wordHasLessonLetter(item.word, bank) || wordHasLessonSound(item.word, bank))
      )
    }),
  )
  let chosen = pool.slice(0, need)
  if (chosen.length < need) {
    const rest = bank.syllableItems.filter(
      (item) =>
        syllabifyFr(item.word).length >= 2 &&
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
      const chosen = syllablePool(bank, rng, need)
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
      return syllabesCvVc(bank, rng, n)
    case 'syllabes-long':
      return syllabesLong(bank, rng, n)
    case 'syllabes-prononcer':
      return syllabesPrononcer(bank, rng, Math.min(16, n))
    case 'mots':
    case 'ecouter':
    case 'ecouter-image':
    case 'syllabe-son':
    case 'associer-audio':
    case 'associer-image': {
      const soutienKind = kind
      const merged: SoutienGenerateOptions = {
        ...options,
        alphaVocabCount: kind === 'mots' ? 4 : options?.alphaVocabCount,
      }
      return genKind(soutienKind, bank, n, rng, difficulty, merged)
    }
    default:
      return null
  }
}
