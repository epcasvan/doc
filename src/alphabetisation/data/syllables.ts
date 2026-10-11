/** Grilles de syllabes simples (CV / VC) — adaptées des leçons L5 lecture. */

const SIMPLE_CONSONANTS = [
  'b',
  'c',
  'd',
  'f',
  'g',
  'j',
  'l',
  'm',
  'n',
  'p',
  'r',
  's',
  't',
  'v',
  'z',
] as const

export type SyllableGrids = {
  vowel: string
  cvUpper: string[]
  cvLower: string[]
  vcUpper: string[]
  vcLower: string[]
}

export function syllableGridsFor(vowel: string): SyllableGrids {
  const v = vowel.toLowerCase()
  const upper = v.toLocaleUpperCase('fr-FR')
  const vcCons = SIMPLE_CONSONANTS.filter((c) => c !== 'n' && c !== 'm')
  return {
    vowel: v,
    cvUpper: SIMPLE_CONSONANTS.map((c) => `${c.toUpperCase()}${upper}`),
    cvLower: SIMPLE_CONSONANTS.map((c) => `${c}${v}`),
    vcUpper: vcCons.map((c) => `${upper}${c.toUpperCase()}`),
    vcLower: vcCons.map((c) => `${v}${c}`),
  }
}

export function parseSyllBankId(bankId: string): string | null {
  const m = /^syll-([aeiouy])$/.exec(bankId)
  return m?.[1] ?? null
}
