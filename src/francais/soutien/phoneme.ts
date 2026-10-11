/**
 * Filtrage phonème / graphème pour Soutien FR.
 * Source : banque lecture soutien-scolaire (mots déjà découpés en phonèmes).
 *
 * - Type 1 / écrits : phonème de la leçon + lettre écrite (ex. /o/ → lettre o/ô).
 * - Audio : phonème seul (ex. /o/ inclut au, eau → bateau, chaud…).
 * - Types 12 / 14 : découpe Alpha (an/au/eau… exclus du /a/ simple).
 */
import { displayVocabLabel } from '@/francais/display-vocab-label'
import { normalizeLetter } from '@/francais/lecture-banks'
import { VOCAB_TOPIC_BANKS } from '@/francais/vocab-registry'
import { tokenizeAlpha } from '@/jeux/alpha-phonics'
import type { SoutienCompound, SoutienVowelBank } from './banks'
import { GRAPHEME_WORD_POOLS } from './grapheme-word-pools'
import { LECTURE_WORD_ITEMS, type LectureWordItem } from './lecture-word-items'
import { LECTURE_WORD_ITEMS_EXTRA } from './lecture-word-items-extra'

/** Banque lecture + mots Voc courants (A1–B1) pour les exercices sans image. */
const ALL_LECTURE_WORD_ITEMS: readonly LectureWordItem[] = [
  ...LECTURE_WORD_ITEMS,
  ...LECTURE_WORD_ITEMS_EXTRA,
]

/** Index label minuscule → item lecture. */
const LECTURE_BY_LABEL: Map<string, LectureWordItem> = (() => {
  const map = new Map<string, LectureWordItem>()
  for (const item of ALL_LECTURE_WORD_ITEMS) {
    const key = item.label.trim().toLowerCase()
    if (key && !map.has(key)) map.set(key, item)
  }
  return map
})()

/** Libellés Voc (sans sous-thème). */
export const ALL_VOCAB_LABELS: readonly string[] = (() => {
  const labels: string[] = []
  const seen = new Set<string>()
  for (const topic of VOCAB_TOPIC_BANKS) {
    for (const subgroup of topic.subgroups) {
      for (const word of subgroup.words) {
        const key = word.label.trim().toLowerCase()
        if (!key || seen.has(key)) continue
        seen.add(key)
        labels.push(word.label.trim())
      }
    }
  }
  return labels
})()

/** Phonème pédagogique de la leçon (ex. `/a/`, `/o/`). */
export function lessonPhoneme(bank: SoutienVowelBank): string {
  return bank.sound
}

/**
 * Phonèmes acceptés pour le filtre (aliases pédagogiques).
 * La voyelle E est notée `/ə/` en thème mais la banque lecture utilise `/e/` / `/ɛ/`.
 */
export function lessonPhonemesAccepted(bank: SoutienVowelBank): readonly string[] {
  const primary = lessonPhoneme(bank)
  if (primary === '/ə/') return ['/ə/', '/e/', '/ɛ/']
  if (primary === '/e/') return ['/e/', '/ɛ/', '/ə/']
  return [primary]
}

/** Graphèmes écrits de la leçon (surlignage). */
export function lessonLetterGraphemes(bank: SoutienVowelBank): readonly string[] {
  return bank.graphemes
}

/**
 * Graphèmes pour le son (surlignage audio).
 * Pour /o/ (voyelle o) : o, ô + au, eau (pool complexe lecture).
 */
export function lessonSoundGraphemes(bank: SoutienVowelBank): readonly string[] {
  if (bank.id === 'o') return [...bank.graphemes, 'au', 'eau']
  return bank.graphemes
}

/** True si la banque est une voyelle simple A–Y (logique Alpha « voyelle simple »). */
export function isSoutienVowelBank(bank: SoutienVowelBank): boolean {
  return /^[aeiouy]$/.test(bank.id)
}

function teachingPhonemes(label: string): readonly string[] | null {
  return LECTURE_BY_LABEL.get(label.trim().toLowerCase())?.phonemes ?? null
}

/** Le mot porte le phonème de la leçon (données lecture). */
export function wordHasLessonSound(word: string, bank: SoutienVowelBank): boolean {
  const phonemes = teachingPhonemes(word)
  if (!phonemes) return false
  const accepted = lessonPhonemesAccepted(bank)
  return accepted.some((p) => phonemes.includes(p))
}

/** Le mot contient la lettre écrite de la leçon (o / ô, a / à / â…). */
export function wordHasLessonLetter(word: string, bank: SoutienVowelBank): boolean {
  for (const g of bank.graphemes) {
    if (g.length > 1) {
      if (word.toLowerCase().includes(g.toLowerCase())) return true
      continue
    }
    for (const ch of word) {
      if (normalizeLetter(ch) === normalizeLetter(g)) return true
    }
  }
  return false
}

/** Cibles lettre de la leçon (a/à/â → « a », etc.). */
function lessonLetterTargets(bank: SoutienVowelBank): Set<string> {
  const targets = new Set<string>()
  targets.add(normalizeLetter(bank.letterLower))
  for (const g of bank.graphemes) {
    if (g.length === 1) targets.add(normalizeLetter(g))
  }
  return targets
}

/**
 * Segment Alpha = cible de la leçon.
 * Voyelles : voyelle simple (pas an / au / eau / on…).
 * Consonnes / complexes : graphème (lettre ou digramme) dans le segment ou le texte.
 */
export function isLessonSimpleVowelSegment(
  segmentText: string,
  tone: string,
  bank: SoutienVowelBank,
): boolean {
  if (isSoutienVowelBank(bank)) {
    if (tone !== 'vowel') return false
    if (segmentText.length !== 1) return false
    return lessonLetterTargets(bank).has(normalizeLetter(segmentText))
  }
  const lower = segmentText.toLowerCase()
  for (const g of bank.graphemes) {
    if (g.length === 1) {
      if (normalizeLetter(segmentText) === normalizeLetter(g)) return true
    } else if (lower === g.toLowerCase() || lower.includes(g.toLowerCase())) {
      return true
    }
  }
  return false
}

/** Compte les occurrences du son / graphème de la leçon dans un texte. */
export function countLessonPhonemeInText(text: string, bank: SoutienVowelBank): number {
  if (isSoutienVowelBank(bank)) {
    let n = 0
    for (const seg of tokenizeAlpha(text)) {
      if (isLessonSimpleVowelSegment(seg.text, seg.tone, bank)) n += 1
    }
    return n
  }
  // Consonnes / complexes : compter les graphèmes (longs d’abord).
  const needles = [...bank.graphemes].sort((a, b) => b.length - a.length)
  const lower = text.toLowerCase()
  let n = 0
  let i = 0
  while (i < lower.length) {
    let matched = 0
    for (const g of needles) {
      if (lower.startsWith(g.toLowerCase(), i)) {
        matched = g.length
        break
      }
    }
    if (matched > 0) {
      n += 1
      i += matched
    } else {
      i += 1
    }
  }
  return n
}

/** Découpe Alpha + marquage des cibles de la leçon. */
export function lessonPhonemeSegments(
  text: string,
  bank: SoutienVowelBank,
): ReadonlyArray<{ text: string; hit: boolean }> {
  if (isSoutienVowelBank(bank)) {
    return tokenizeAlpha(text).map((seg) => ({
      text: seg.text,
      hit: isLessonSimpleVowelSegment(seg.text, seg.tone, bank),
    }))
  }
  return lessonPhonemeSegmentsFromGraphemes(text, bank.graphemes)
}

/**
 * Variante à partir des seuls graphèmes (rendu UI sans objet banque).
 * Voyelles simples : Alpha tone vowel.
 * Multi-lettres / consonnes : coincement de graphèmes (longs d’abord).
 */
export function lessonPhonemeSegmentsFromGraphemes(
  text: string,
  graphemes: readonly string[],
): ReadonlyArray<{ text: string; hit: boolean }> {
  const multi = graphemes.filter((g) => g.length > 1)
  const single = graphemes.filter((g) => g.length === 1).map((g) => normalizeLetter(g))
  const onlySimpleVowels =
    multi.length === 0 &&
    single.length > 0 &&
    single.every((g) => 'aeiouy'.includes(g))

  if (onlySimpleVowels) {
    const targets = new Set(single)
    return tokenizeAlpha(text).map((seg) => ({
      text: seg.text,
      hit: seg.tone === 'vowel' && seg.text.length === 1 && targets.has(normalizeLetter(seg.text)),
    }))
  }

  // Découpe par graphèmes (longs d’abord), sinon caractère par caractère.
  const needles = [...graphemes].filter(Boolean).sort((a, b) => b.length - a.length)
  if (needles.length === 0) return [{ text, hit: false }]
  const out: Array<{ text: string; hit: boolean }> = []
  let i = 0
  while (i < text.length) {
    const restLower = text.slice(i).toLowerCase()
    let matched: string | null = null
    for (const g of needles) {
      if (restLower.startsWith(g.toLowerCase())) {
        matched = text.slice(i, i + g.length)
        break
      }
    }
    if (matched) {
      out.push({ text: matched, hit: true })
      i += matched.length
    } else {
      out.push({ text: text[i]!, hit: false })
      i += 1
    }
  }
  return out
}

/**
 * Pool lecture + Voc ayant le phonème exact de la leçon.
 * Voc n’est ajouté que s’il figure dans la banque lecture (phonèmes connus).
 */
function labelsWithPhoneme(bank: SoutienVowelBank): string[] {
  const accepted = new Set(lessonPhonemesAccepted(bank))
  const seen = new Set<string>()
  const out: string[] = []
  for (const item of ALL_LECTURE_WORD_ITEMS) {
    if (!item.phonemes.some((p) => accepted.has(p))) continue
    const key = item.label.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(item.label)
  }
  // Voc : uniquement si déjà découpé en phonèmes (même son).
  for (const label of ALL_VOCAB_LABELS) {
    const key = label.toLowerCase()
    if (seen.has(key)) continue
    const item = LECTURE_BY_LABEL.get(key)
    if (!item || !item.phonemes.some((p) => accepted.has(p))) continue
    seen.add(key)
    out.push(label)
  }
  return out
}

/** Clé pool complexe associée à un bankId (sons complexes + /o/ voyelle). */
function complexPoolKeyForBank(bank: SoutienVowelBank): string | undefined {
  if (bank.id === 'o') return 'au-eau'
  const map: Record<string, string> = {
    ou: 'ou',
    an: 'an-en',
    in: 'in-ain',
    on: 'on',
    au: 'au-eau',
    oi: 'oi',
    ch: 'ch',
    ph: 'ph',
    gn: 'gn',
    ill: 'ill',
  }
  return map[bank.id]
}

/**
 * Mots écrits (type 1) : phonème exact + lettre / graphème de la leçon.
 * Ex. /o/ → tomate, robot (lettre o) ; pas bateau / chaud (au, eau).
 */
export function lessonWordsByLetter(bank: SoutienVowelBank): string[] {
  const fromSound = labelsWithPhoneme(bank).filter((w) => wordHasLessonLetter(w, bank))
  const letterPools = GRAPHEME_WORD_POOLS.letters as Record<string, readonly string[]>
  const letterPool = letterPools[bank.letterLower] ?? []
  const complexKey = complexPoolKeyForBank(bank)
  const complexPools = GRAPHEME_WORD_POOLS.complex as Record<string, readonly string[]>
  const complexPool = complexKey ? (complexPools[complexKey] ?? []) : []
  const seen = new Set(fromSound.map((w) => w.toLowerCase()))
  const out = [...fromSound]
  for (const w of [...letterPool, ...complexPool]) {
    const key = w.toLowerCase()
    if (seen.has(key)) continue
    // Pool : garder si phonème confirmé, ou si complexe (pool déjà filtré).
    if (!complexKey && !wordHasLessonSound(w, bank)) continue
    if (complexKey && !wordHasLessonLetter(w, bank) && !wordHasLessonSound(w, bank)) continue
    seen.add(key)
    out.push(w)
  }
  return preferBankOrder(bank, out)
}

/**
 * Mots audio : phonème exact (au / eau admis pour /o/).
 * Enrichit aussi avec les pools complexes.
 */
export function lessonWordsBySound(bank: SoutienVowelBank): string[] {
  const base = labelsWithPhoneme(bank)
  const complexKey = complexPoolKeyForBank(bank)
  if (!complexKey) return preferBankOrder(bank, base)
  const complexPools = GRAPHEME_WORD_POOLS.complex as Record<string, readonly string[]>
  const pool = complexPools[complexKey] ?? []
  const seen = new Set(base.map((w) => w.toLowerCase()))
  const out = [...base]
  const accepted = new Set(lessonPhonemesAccepted(bank))
  for (const w of pool) {
    const key = w.toLowerCase()
    if (seen.has(key)) continue
    const item = LECTURE_BY_LABEL.get(key)
    if (item && !item.phonemes.some((p) => accepted.has(p))) continue
    seen.add(key)
    out.push(w)
  }
  return preferBankOrder(bank, out)
}

/**
 * Mots pour exercices **sans image obligatoire** (dictée, mots mêlés, écouter…).
 * Inclut lecture + Voc + banque, y compris mots non illustrés.
 */
export function lessonWordsForText(bank: SoutienVowelBank): string[] {
  const byLetter = lessonWordsByLetter(bank)
  const bySound = lessonWordsBySound(bank)
  const seen = new Set<string>()
  const out: string[] = []
  const push = (w: string) => {
    const key = w.trim().toLowerCase()
    if (!key || seen.has(key)) return
    seen.add(key)
    out.push(w.trim())
  }
  for (const w of bank.words) push(w)
  for (const w of byLetter) push(w)
  for (const w of bySound) push(w)
  for (const w of bank.wordSearchWords) push(w)
  for (const w of bank.completes.map((c) => c.word)) push(w)
  for (const w of bank.syllableItems.map((s) => s.word)) push(w)
  return out
}

/** Banque Soutien d’abord, puis mots lecture / Voc. */
function preferBankOrder(bank: SoutienVowelBank, pool: readonly string[]): string[] {
  const poolByKey = new Map(pool.map((w) => [w.toLowerCase(), w] as const))
  const seen = new Set<string>()
  const out: string[] = []
  for (const w of bank.words) {
    const key = w.toLowerCase()
    if (!poolByKey.has(key)) continue
    if (seen.has(key)) continue
    seen.add(key)
    out.push(w)
  }
  for (const w of pool) {
    const key = w.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(w)
  }
  return out
}

/** Découpe un mot en deux parties pour le type 4 (si absent de la banque). */
function autoSplitWord(word: string): readonly [string, string] | null {
  const w = word.trim()
  if (w.length < 2) return null
  const vowels = /[aeiouyàâäéèêëïîôöùûüœæ]/i
  const mid = Math.max(1, Math.floor(w.length / 2))
  for (let i = mid; i >= 1; i--) {
    if (vowels.test(w[i - 1]!)) return [w.slice(0, i), w.slice(i)] as const
  }
  for (let i = mid; i < w.length; i++) {
    if (vowels.test(w[i]!)) return [w.slice(0, i + 1), w.slice(i + 1)] as const
  }
  return [w.slice(0, mid), w.slice(mid)] as const
}

/**
 * Jusqu’à 16 composés alignés sur les mots du type 1 (banque puis découpe auto).
 */
export function compoundsForType1Words(
  bank: SoutienVowelBank,
  words: readonly string[],
): SoutienCompound[] {
  const byWord = new Map(
    bank.compounds.map((c) => [c.word.trim().toLowerCase(), c] as const),
  )
  const out: SoutienCompound[] = []
  const seen = new Set<string>()
  for (const raw of words.slice(0, 24)) {
    const word = displayVocabLabel(raw)
    // Pas de mots composés multi-mots (table de nuit) : découpe ambiguë.
    if (/\s/.test(word)) continue
    const key = raw.trim().toLowerCase()
    const displayKey = word.toLowerCase()
    if (!key || seen.has(key) || seen.has(displayKey)) continue
    const existing = byWord.get(key) ?? byWord.get(displayKey)
    if (existing && !/\s/.test(existing.word)) {
      seen.add(key)
      seen.add(displayKey)
      out.push({ ...existing, word: displayVocabLabel(existing.word) })
      continue
    }
    const parts = autoSplitWord(word)
    if (!parts || !parts[0] || !parts[1]) continue
    seen.add(key)
    seen.add(displayKey)
    out.push({ parts: [parts[0], parts[1]], word })
  }
  return out
}
