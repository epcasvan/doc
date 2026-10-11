/**
 * Thèmes Alphabétisation — répartition lecture soutien (L1–L8) + Alphabet + Phrases.
 * Structure lettre/son alignée sur Soutien FR (phase précédente).
 */
import {
  SOUTIEN_THEMES,
  type SoutienLetterOption,
  type SoutienSoundOption,
  type SoutienThemeDef,
} from '@/francais/soutien/themes'
import type { AlphaKindId } from './kinds'
import { ALPHA_STORIES } from './data/stories'

export type AlphaThemeDef = SoutienThemeDef & {
  /** `letter` = même logique que Soutien FR ; `special` = Syllabes / Mots / Phrases / Alphabet. */
  mode: 'letter' | 'special'
}

function mapTheme(id: string, label: string, sourceId: string): AlphaThemeDef {
  const src = SOUTIEN_THEMES.find((t) => t.id === sourceId)!
  return {
    id,
    label,
    mode: 'letter',
    letters: src.letters,
  }
}

function vowelSyllable(id: string): SoutienLetterOption {
  const upper = id.toLocaleUpperCase('fr-FR')
  return {
    id,
    label: upper,
    letterUpper: upper,
    letterLower: id,
    sounds: [
      {
        id,
        label: `syllabes ${upper}`,
        bankId: `syll-${id}`,
        phoneme: `/${id === 'u' ? 'y' : id === 'e' ? 'ə' : id}/`,
        graphemes: [id],
      },
    ],
  }
}

function motsLetter(id: string, label: string, bankId: string): SoutienLetterOption {
  return {
    id,
    label,
    letterUpper: label,
    letterLower: id,
    sounds: [
      {
        id,
        label,
        bankId,
        phoneme: '',
        graphemes: [],
      },
    ],
  }
}

function phraseLetter(story: { id: string; title: string; level: string }): SoutienLetterOption {
  return {
    id: story.id,
    label: `${story.title} (${story.level})`,
    letterUpper: story.title,
    letterLower: story.id,
    sounds: [
      {
        id: story.id,
        label: story.level,
        bankId: `phrase-${story.id}`,
        phoneme: '',
        graphemes: [],
      },
    ],
  }
}

const ALPHABET_LETTER: SoutienLetterOption = {
  id: 'alphabet',
  label: 'Alphabet',
  letterUpper: 'ABC',
  letterLower: 'alphabet',
  sounds: [
    {
      id: 'alphabet',
      label: 'a → z',
      bankId: 'alphabet',
      phoneme: '',
      graphemes: [],
    },
  ],
}

export const ALPHA_THEMES: readonly AlphaThemeDef[] = [
  {
    id: 'alpha-alphabet',
    label: 'L’alphabet',
    mode: 'special',
    letters: [ALPHABET_LETTER],
  },
  mapTheme('alpha-voyelles', 'Voyelles', 'soutien-voyelles'),
  mapTheme('alpha-consonnes-i', 'Consonnes qui claquent', 'soutien-consonnes-i'),
  mapTheme('alpha-consonnes-ii', 'Consonnes qui sifflent', 'soutien-consonnes-ii'),
  mapTheme('alpha-consonnes-iii', 'Consonnes spéciales', 'soutien-consonnes-iii'),
  {
    id: 'alpha-syllabes',
    label: 'Les syllabes',
    mode: 'special',
    letters: ['a', 'o', 'i', 'e', 'u', 'y'].map(vowelSyllable),
  },
  {
    id: 'alpha-mots',
    label: 'Les mots',
    mode: 'special',
    letters: [
      motsLetter('outils', 'Mots-outils', 'mots-outils'),
      motsLetter('courants', 'Mots courants', 'mots-courants'),
      motsLetter('multi', 'Plusieurs syllabes', 'mots-multi'),
    ],
  },
  mapTheme('alpha-sons-complexes', 'Les sons complexes', 'soutien-sons-complexes'),
  {
    id: 'alpha-phrases',
    label: 'Les phrases',
    mode: 'special',
    letters: ALPHA_STORIES.map(phraseLetter),
  },
]

export const ALPHA_THEME_IDS = ALPHA_THEMES.map((t) => t.id)

export function alphaThemeById(themeId: string): AlphaThemeDef | undefined {
  return ALPHA_THEMES.find((t) => t.id === themeId)
}

export function allAlphaBankDefs(): Array<{
  themeId: string
  letter: SoutienLetterOption
  sound: SoutienSoundOption
  mode: 'letter' | 'special'
}> {
  const out: Array<{
    themeId: string
    letter: SoutienLetterOption
    sound: SoutienSoundOption
    mode: 'letter' | 'special'
  }> = []
  for (const theme of ALPHA_THEMES) {
    for (const letter of theme.letters) {
      for (const sound of letter.sounds) {
        out.push({ themeId: theme.id, letter, sound, mode: theme.mode })
      }
    }
  }
  return out
}

export function findAlphaByBankId(bankId: string): {
  theme: AlphaThemeDef
  letter: SoutienLetterOption
  sound: SoutienSoundOption
} | null {
  for (const theme of ALPHA_THEMES) {
    for (const letter of theme.letters) {
      for (const sound of letter.sounds) {
        if (sound.bankId === bankId) return { theme, letter, sound }
      }
    }
  }
  return null
}

export function resolveAlphaSelection(
  topic: string,
  exerciseType: string,
): {
  theme: AlphaThemeDef
  letter: SoutienLetterOption
  sound: SoutienSoundOption
} | null {
  const theme = alphaThemeById(topic)
  if (!theme) return null
  if (exerciseType.startsWith('alpha-')) {
    const rest = exerciseType.slice('alpha-'.length)
    // bankId peut contenir des tirets : on teste tous les sons du thème
    for (const letter of theme.letters) {
      for (const sound of letter.sounds) {
        if (rest.startsWith(`${sound.bankId}-`)) {
          return { theme, letter, sound }
        }
      }
    }
  }
  const letter = theme.letters[0]!
  const sound = letter.sounds[0]!
  return { theme, letter, sound }
}

export function alphaExerciseTypeId(bankId: string, kind: AlphaKindId | string): string {
  return `alpha-${bankId}-${kind}`
}

export function alphaFicheTitle(letter: SoutienLetterOption): string {
  if (letter.id === 'alphabet') return 'L’alphabet'
  if (letter.sounds[0]?.bankId.startsWith('syll-')) {
    return `Syllabes avec ${letter.letterUpper}`
  }
  if (letter.sounds[0]?.bankId.startsWith('mots-')) {
    return letter.label
  }
  if (letter.sounds[0]?.bankId.startsWith('phrase-')) {
    return `Phrases — ${letter.letterUpper}`
  }
  const sounds = letter.sounds.map((s) => s.label)
  if (sounds.length <= 1) {
    return `Lettre ${letter.letterUpper} et le son ${sounds[0] ?? ''}`
  }
  if (sounds.length === 2) {
    return `Lettre ${letter.letterUpper} et les sons ${sounds[0]} et ${sounds[1]}`
  }
  const head = sounds.slice(0, -1).join(', ')
  return `Lettre ${letter.letterUpper} et les sons ${head} et ${sounds[sounds.length - 1]}`
}
