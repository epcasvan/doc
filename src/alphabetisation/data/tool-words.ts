/** Mots-outils adaptés (lecture soutien L6) — listes fonctionnelles courtes. */

export const TOOL_WORD_POOLS: Record<string, string[]> = {
  articles: ['le', 'la', 'les', 'un', 'une', 'des', 'ce', 'cet', 'cette', 'ces'],
  possessifs: [
    'mon',
    'ma',
    'mes',
    'ton',
    'ta',
    'tes',
    'son',
    'sa',
    'ses',
    'notre',
    'nos',
    'votre',
    'vos',
    'leur',
    'leurs',
  ],
  'pronoms-sujets': ['je', 'tu', 'il', 'elle', 'on', 'nous', 'vous', 'ils', 'elles'],
  'pronoms-complements': ['me', 'te', 'lui', 'moi', 'toi', 'eux'],
}

export const ALL_TOOL_WORDS: string[] = [
  ...new Set(Object.values(TOOL_WORD_POOLS).flat()),
]

export function toolWordsForCategory(key: string): string[] {
  return TOOL_WORD_POOLS[key] ?? ALL_TOOL_WORDS
}
