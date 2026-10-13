/** Parsing / formatage des nombres saisis en mode libre (virgule FR). */

export function parseFrNumber(raw: string): number | null {
  const s = String(raw ?? '')
    .trim()
    .replace(/\s/g, '')
    .replace(',', '.')
  if (!s || s === '-' || s === '.' || s === '-.') return null
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

export function parseFrInt(raw: string): number | null {
  const n = parseFrNumber(raw)
  if (n == null) return null
  const i = Math.round(n)
  return Number.isFinite(i) ? i : null
}

/** Extrait les nombres d’une suite « 11 < 25,7 < 38 ». */
export function parseOrderSequence(raw: string): number[] {
  return String(raw ?? '')
    .split(/[<>≤≥,;\s]+/u)
    .map((part) => parseFrNumber(part))
    .filter((n): n is number => n != null)
}

/** Remplace le premier entier/décimal trouvé dans une phrase. */
export function replaceFirstNumber(text: string, next: number, fmt: (n: number) => string): string {
  return text.replace(/-?\d+(?:[.,]\d+)?/, fmt(next))
}

/** Remplace tous les nombres dans l’ordre d’apparition. */
export function replaceNumbersInOrder(
  text: string,
  values: number[],
  fmt: (n: number) => string,
): string {
  let i = 0
  return text.replace(/-?\d+(?:[.,]\d+)?/g, (match) => {
    if (i >= values.length) return match
    const out = fmt(values[i]!)
    i += 1
    return out
  })
}
