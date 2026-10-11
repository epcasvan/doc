/**
 * Syllabe à trous (type 5) : toujours 2 lettres CV ou VC.
 * Voyelles / Consonnes I–III : pas de digrammes complexes (an, eau, ch…).
 * Le blanc ne doit pas non plus chevaucher un son complexe voisin
 * (ex. bouleau → pas [bo]uleau : o fait partie de ou).
 */
import { displayVocabLabel } from '@/francais/display-vocab-label'
import { tokenizeAlpha } from '@/jeux/alpha-phonics'
import type { SoutienComplete, SoutienVowelBank } from './banks'

const VOWEL_RE = /[aeiouyàâäéèêëïîôöùûüœæ]/i

/** Digrammes / trigrammes complexes (nasales, digraphes…) — exclus hors thème Sons complexes. */
const COMPLEX_BLANKS = new Set([
  'ch',
  'ph',
  'gn',
  'qu',
  'ou',
  'oi',
  'an',
  'en',
  'am',
  'em',
  'in',
  'ain',
  'ein',
  'im',
  'on',
  'om',
  'au',
  'eau',
  'ill',
  'ss',
])

function isVowel(ch: string): boolean {
  return VOWEL_RE.test(ch)
}

function isLetter(ch: string): boolean {
  return /\p{L}/u.test(ch)
}

/**
 * True si un segment Alpha multi-lettres (ou, au, on, ch…) chevauche le blanc
 * sans y être entièrement inclus — l’élève verrait alors une demi-graphie.
 */
function blankSpansComplexGrapheme(word: string, blankIndex: number, blankLen: number): boolean {
  const blankStart = blankIndex
  const blankEnd = blankIndex + blankLen
  let pos = 0
  for (const seg of tokenizeAlpha(word)) {
    const start = pos
    const end = pos + seg.text.length
    pos = end
    if (seg.text.length <= 1) continue
    const overlaps = start < blankEnd && end > blankStart
    if (!overlaps) continue
    const fullyInside = start >= blankStart && end <= blankEnd
    if (!fullyInside) return true
  }
  return false
}

function articleFor(word: string): 'Un' | 'Une' {
  const w = word.trim().toLowerCase()
  if (
    /e$|ion$|ette$|elle$|ance$|ence$|ure$|ade$|ise$|ine$|ille$|asse$|otte$/.test(w) &&
    !/age$|isme$|eau$|ou$/.test(w)
  ) {
    return 'Une'
  }
  return 'Un'
}

/** Thèmes où les blancs complexes sont interdits. */
export function isSimpleSoutienTheme(bank: SoutienVowelBank): boolean {
  const t = bank.topic
  if (t === 'soutien-sons-complexes') return false
  if (
    t === 'soutien-voyelles' ||
    t === 'soutien-consonnes-i' ||
    t === 'soutien-consonnes-ii' ||
    t === 'soutien-consonnes-iii'
  ) {
    return true
  }
  // Anciens topics voyelle (soutien-a, …).
  if (/^soutien-[aeiouy]$/i.test(t)) return true
  // Banques voyelle CSC (id a/o/i/u/e/y).
  if (/^[aeiouy]$/i.test(bank.id)) return true
  return true
}

function blankContainsLesson(blank: string, graphemes: readonly string[], allowComplex: boolean): boolean {
  const lower = blank.toLowerCase()
  for (const g of graphemes) {
    const gl = g.toLowerCase()
    if (gl.length === 1) {
      if (lower.includes(gl)) return true
      continue
    }
    // Sons complexes : le digramme entier peut être le blanc.
    if (allowComplex && (lower === gl || lower.includes(gl))) return true
  }
  return false
}

/**
 * Trouve un blanc CV ou VC de 2 lettres portant la lettre / le son de la leçon.
 */
export function findCvVcBlank(
  rawWord: string,
  graphemes: readonly string[],
  allowComplex: boolean,
): { before: string; blank: string; after: string } | null {
  const word = displayVocabLabel(rawWord).replace(/\s+/g, '')
  if (word.length < 2) return null

  type Cand = { index: number; blank: string; score: number }
  const cands: Cand[] = []

  for (let i = 0; i < word.length - 1; i++) {
    const a = word[i]!
    const b = word[i + 1]!
    if (!isLetter(a) || !isLetter(b)) continue
    const aV = isVowel(a)
    const bV = isVowel(b)
    const isCV = !aV && bV
    const isVC = aV && !bV
    if (!isCV && !isVC) continue
    const blank = word.slice(i, i + 2)
    if (!allowComplex && COMPLEX_BLANKS.has(blank.toLowerCase())) continue
    // Hors sons complexes : o+u, a+n, c+h… ne doivent pas couper le blanc.
    if (!allowComplex && blankSpansComplexGrapheme(word, i, 2)) continue
    if (!blankContainsLesson(blank, graphemes, allowComplex)) continue
    // Préférer début de mot, puis CV.
    let score = 0
    if (i === 0) score += 4
    if (isCV) score += 2
    if (graphemes.some((g) => g.length === 1 && blank.toLowerCase().includes(g.toLowerCase()))) {
      score += 1
    }
    cands.push({ index: i, blank, score })
  }

  // Sons complexes : accepter aussi un digramme exact de 2 lettres (ch, ou, an…).
  if (allowComplex && cands.length === 0) {
    const needles = [...graphemes].filter((g) => g.length >= 2).sort((a, b) => b.length - a.length)
    for (const g of needles) {
      const gl = g.toLowerCase()
      if (gl.length !== 2) continue
      const idx = word.toLowerCase().indexOf(gl)
      if (idx < 0) continue
      const blank = word.slice(idx, idx + 2)
      cands.push({ index: idx, blank, score: 3 })
      break
    }
  }

  if (cands.length === 0) return null
  cands.sort((a, b) => b.score - a.score || a.index - b.index)
  const best = cands[0]!
  return {
    before: word.slice(0, best.index),
    blank: best.blank,
    after: word.slice(best.index + best.blank.length),
  }
}

/** Construit les items type 5 à partir des mots type 1 uniquement. */
export function completesFromType1Words(
  bank: SoutienVowelBank,
  words: readonly string[],
): SoutienComplete[] {
  const allowComplex = !isSimpleSoutienTheme(bank)
  const out: SoutienComplete[] = []
  const seen = new Set<string>()
  for (const raw of words) {
    const word = displayVocabLabel(raw)
    // Mots composés multi-mots : pas de trous fiables (ex. table de nuit).
    if (/\s/.test(word)) continue
    const key = word.toLowerCase()
    if (!key || seen.has(key)) continue
    const found = findCvVcBlank(word, bank.graphemes, allowComplex)
    if (!found || found.blank.length !== 2) continue
    seen.add(key)
    out.push({
      article: articleFor(word),
      word,
      before: found.before,
      blank: found.blank,
      after: found.after,
    })
  }
  return out
}
