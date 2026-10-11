/**
 * Thèmes Soutien FR (CFR) : Voyelles, Consonnes I–III, Sons complexes.
 * Hiérarchie UI : Thème → Lettre → Son (si multi) → Type d’exercice.
 */

export type SoutienSoundOption = {
  /** Identifiant court du son (ex. `k`, `s`). */
  id: string
  /** Libellé UI (ex. `/k/`). */
  label: string
  /** Identifiant banque / exercice : `a`, `c-k`, `ch`… */
  bankId: string
  /** Phonème lecture (filtre). */
  phoneme: string
  /** Graphèmes écrits de la leçon. */
  graphemes: readonly string[]
  /** Clé pool complexe (`ou`, `an-en`…) si applicable. */
  complexPoolKey?: string
  /** Clé pool lettre (`j`, `k`…) si applicable. */
  letterPoolKey?: string
}

export type SoutienLetterOption = {
  /** Identifiant lettre / digramme (ex. `a`, `c`, `ch`). */
  id: string
  /** Libellé UI (toujours majuscules : `A`, `B`, `CH`). */
  label: string
  letterUpper: string
  letterLower: string
  sounds: readonly SoutienSoundOption[]
}

export type SoutienThemeDef = {
  id: string
  label: string
  letters: readonly SoutienLetterOption[]
}

function vowel(
  id: string,
  label: string,
  phoneme: string,
  graphemes: readonly string[],
): SoutienLetterOption {
  const upper = label.toLocaleUpperCase('fr-FR')
  const lower = id
  return {
    id,
    label: upper,
    letterUpper: upper,
    letterLower: lower,
    sounds: [
      {
        id,
        label: phoneme,
        bankId: id,
        phoneme,
        graphemes,
        letterPoolKey: id === 'y' ? 'y' : undefined,
      },
    ],
  }
}

function cons(
  id: string,
  phoneme: string,
  graphemes?: readonly string[],
  letterPoolKey?: string,
): SoutienLetterOption {
  const upper = id.toLocaleUpperCase('fr-FR')
  return {
    id,
    label: upper,
    letterUpper: upper,
    letterLower: id,
    sounds: [
      {
        id,
        label: phoneme,
        bankId: id,
        phoneme,
        graphemes: graphemes ?? [id],
        letterPoolKey: letterPoolKey ?? id,
      },
    ],
  }
}

function multiCons(
  id: string,
  sounds: ReadonlyArray<{
    id: string
    phoneme: string
    label?: string
    graphemes?: readonly string[]
  }>,
): SoutienLetterOption {
  const upper = id.toLocaleUpperCase('fr-FR')
  return {
    id,
    label: upper,
    letterUpper: upper,
    letterLower: id,
    sounds: sounds.map((s) => ({
      id: s.id,
      label: s.label ?? s.phoneme,
      bankId: `${id}-${s.id}`,
      phoneme: s.phoneme,
      graphemes: s.graphemes ?? [id],
      letterPoolKey: id,
    })),
  }
}

function complex(
  id: string,
  phoneme: string,
  graphemes: readonly string[],
  complexPoolKey: string,
  letterUpper?: string,
  letterLower?: string,
): SoutienLetterOption {
  const lower = letterLower ?? id
  const upper = letterUpper ?? id.toLocaleUpperCase('fr-FR')
  return {
    id,
    label: upper,
    letterUpper: upper,
    letterLower: lower,
    sounds: [
      {
        id,
        label: phoneme,
        bankId: id,
        phoneme,
        graphemes,
        complexPoolKey,
      },
    ],
  }
}

export const SOUTIEN_THEMES: readonly SoutienThemeDef[] = [
  {
    id: 'soutien-voyelles',
    label: 'Voyelles',
    letters: [
      vowel('a', 'A', '/a/', ['a', 'à', 'â']),
      vowel('o', 'O', '/o/', ['o', 'ô']),
      vowel('i', 'I', '/i/', ['i', 'î']),
      vowel('u', 'U', '/y/', ['u', 'û']),
      vowel('e', 'E', '/ə/', ['e', 'é', 'è', 'ê']),
      vowel('y', 'Y', '/i/', ['y']),
    ],
  },
  {
    id: 'soutien-consonnes-i',
    label: 'Consonnes I',
    letters: [
      cons('b', '/b/'),
      multiCons('c', [
        { id: 'k', phoneme: '/k/', label: '/k/', graphemes: ['c'] },
        { id: 's', phoneme: '/s/', label: '/s/', graphemes: ['c', 'ç'] },
      ]),
      cons('d', '/d/'),
      multiCons('g', [
        { id: 'g', phoneme: '/g/', label: '/g/', graphemes: ['g'] },
        { id: 'j', phoneme: '/ʒ/', label: '/ʒ/', graphemes: ['g'] },
      ]),
      cons('k', '/k/', ['k'], 'k'),
      cons('p', '/p/'),
      cons('q', '/k/', ['q', 'qu']),
      cons('t', '/t/'),
    ],
  },
  {
    id: 'soutien-consonnes-ii',
    label: 'Consonnes II',
    letters: [
      cons('f', '/f/'),
      cons('j', '/ʒ/', ['j'], 'j'),
      cons('l', '/l/'),
      cons('m', '/m/'),
      cons('n', '/n/'),
      cons('r', '/r/'),
      multiCons('s', [
        { id: 's', phoneme: '/s/', label: '/s/', graphemes: ['s', 'ss'] },
        { id: 'z', phoneme: '/z/', label: '/z/', graphemes: ['s'] },
      ]),
      cons('v', '/v/'),
      cons('z', '/z/', ['z'], 'z'),
    ],
  },
  {
    id: 'soutien-consonnes-iii',
    label: 'Consonnes III',
    letters: [
      cons('w', '/w/', ['w'], 'w'),
      multiCons('x', [
        { id: 'ks', phoneme: '/ks/', label: '/ks/', graphemes: ['x'] },
        { id: 'gz', phoneme: '/gz/', label: '/gz/', graphemes: ['x'] },
      ]),
      cons('h', '/∅/', ['h']),
    ],
  },
  {
    id: 'soutien-sons-complexes',
    label: 'Sons complexes',
    letters: [
      complex('ch', '/ʃ/', ['ch'], 'ch', 'CH', 'ch'),
      complex('ph', '/f/', ['ph'], 'ph', 'PH', 'ph'),
      complex('ou', '/u/', ['ou'], 'ou', 'OU', 'ou'),
      complex('oi', '/wa/', ['oi'], 'oi', 'OI', 'oi'),
      complex('an', '/ɑ̃/', ['an', 'en', 'am', 'em'], 'an-en', 'AN', 'an'),
      complex('in', '/ɛ̃/', ['in', 'ain', 'ein', 'im'], 'in-ain', 'IN', 'in'),
      complex('on', '/ɔ̃/', ['on', 'om'], 'on', 'ON', 'on'),
      complex('au', '/o/', ['au', 'eau'], 'au-eau', 'AU', 'au'),
      complex('gn', '/ɲ/', ['gn'], 'gn', 'GN', 'gn'),
      complex('ill', '/j/', ['ill', 'il'], 'ill', 'ILL', 'ill'),
    ],
  },
] as const

export const SOUTIEN_THEME_IDS = SOUTIEN_THEMES.map((t) => t.id)

/** Anciens topics voyelle → thème + bankId. */
const LEGACY_VOWEL_TOPIC: Record<string, string> = {
  'soutien-a': 'a',
  'soutien-o': 'o',
  'soutien-i': 'i',
  'soutien-u': 'u',
  'soutien-e': 'e',
  'soutien-y': 'y',
}

export function soutienThemeById(themeId: string): SoutienThemeDef | undefined {
  return SOUTIEN_THEMES.find((t) => t.id === themeId)
}

export function allSoutienBankDefs(): Array<{
  themeId: string
  letter: SoutienLetterOption
  sound: SoutienSoundOption
}> {
  const out: Array<{
    themeId: string
    letter: SoutienLetterOption
    sound: SoutienSoundOption
  }> = []
  for (const theme of SOUTIEN_THEMES) {
    for (const letter of theme.letters) {
      for (const sound of letter.sounds) {
        out.push({ themeId: theme.id, letter, sound })
      }
    }
  }
  return out
}

export function findSoutienByBankId(bankId: string): {
  theme: SoutienThemeDef
  letter: SoutienLetterOption
  sound: SoutienSoundOption
} | null {
  for (const theme of SOUTIEN_THEMES) {
    for (const letter of theme.letters) {
      for (const sound of letter.sounds) {
        if (sound.bankId === bankId) return { theme, letter, sound }
      }
    }
  }
  return null
}

/** Résout thème / lettre / son à partir du topic catalogue + type d’exercice. */
export function resolveSoutienSelection(
  topic: string,
  exerciseType: string,
): {
  theme: SoutienThemeDef
  letter: SoutienLetterOption
  sound: SoutienSoundOption
} | null {
  const legacyBank = LEGACY_VOWEL_TOPIC[topic]
  if (legacyBank) {
    const found = findSoutienByBankId(legacyBank)
    if (found) return found
  }
  const theme = soutienThemeById(topic)
  if (!theme) return null

  // bankId depuis le type : soutien-{bankId}-{kind}
  const kindMatch =
    /-(mots|lettres|syllabes|relier|completer|ecouter-image|ecouter|syllabe-son|lettres-phrase|determinants|dictee|compter|ordre|lire|associer-image|associer-audio|mots-meles)$/.exec(
      exerciseType,
    )
  if (kindMatch && exerciseType.startsWith('soutien-')) {
    const bankId = exerciseType.slice('soutien-'.length, exerciseType.length - kindMatch[0].length)
    const inTheme = theme.letters
      .flatMap((l) => l.sounds.map((s) => ({ letter: l, sound: s })))
      .find((x) => x.sound.bankId === bankId)
    if (inTheme) return { theme, letter: inTheme.letter, sound: inTheme.sound }
  }

  const letter = theme.letters[0]!
  const sound = letter.sounds[0]!
  return { theme, letter, sound }
}

export function soutienExerciseTypeId(bankId: string, kind: string): string {
  return `soutien-${bankId}-${kind}`
}
