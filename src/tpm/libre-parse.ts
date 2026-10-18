/** Parsing / formatage des nombres saisis en mode libre (virgule FR). */

export function parseFrNumber(raw: string): number | null {
  const s = String(raw ?? '')
    .trim()
    // Espaces / apostrophes (fr-CH : 1'234) / séparateurs fins.
    .replace(/[\s'\u2019\u202f]/g, '')
    .replace(',', '.')
  if (!s || s === '-' || s === '.' || s === '-.') return null
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

/**
 * Nombre relatif saisi : `(+4)`, `(−4)`, `+4`, `−4`, `4`, `-4,5`.
 */
export function parseRelatifNumber(raw: string): number | null {
  let s = String(raw ?? '').trim()
  if (!s) return null
  if (s.startsWith('(') && s.endsWith(')')) s = s.slice(1, -1).trim()
  s = s.replace(/^−/, '-').replace(/^\+/, '')
  return parseFrNumber(s)
}

/** Extrait a, op, b depuis un prompt « (+12) − (−3) = ». */
export function parseRelatifPrompt(
  prompt: string,
): { a: number; op: '+' | '−' | '×' | '÷'; b: number } | null {
  const m = String(prompt ?? '').match(
    /^\s*(\([+-−]?\d+(?:[.,]\d+)?\)|[+-−]?\d+(?:[.,]\d+)?)\s*([+\-−×÷])\s*(\([+-−]?\d+(?:[.,]\d+)?\)|[+-−]?\d+(?:[.,]\d+)?)\s*=?\s*$/u,
  )
  if (!m) return null
  const a = parseRelatifNumber(m[1]!)
  const b = parseRelatifNumber(m[3]!)
  if (a == null || b == null) return null
  const rawOp = m[2]!
  const op = (rawOp === '-' ? '−' : rawOp) as '+' | '−' | '×' | '÷'
  if (!['+', '−', '×', '÷'].includes(op)) return null
  return { a, op, b }
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
