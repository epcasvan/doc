/** Blanc dans l’énoncé : `___` (banques) ou `_ _ _` (saisie libre). */

export function hasInlineBlank(text: string): boolean {
  return /_{3,}|_ _ _/.test(text)
}

export function countInlineBlanks(text: string): number {
  return text.match(/_{3,}|_ _ _/g)?.length ?? 0
}

/** Réponses à poser dans les blancs : une seule case garde le texte entier (y compris « a / b »). */
export function answersForInlineBlanks(modele: string | undefined, blankCount: number): string[] {
  const raw = modele?.trim() ?? ''
  if (!raw || blankCount <= 0) return []
  if (blankCount === 1) return [raw]
  const parts = raw
    .split(/\s*\/\s*/)
    .map((part) => part.trim())
    .filter(Boolean)
  if (parts.length === blankCount) return parts
  return [raw]
}
