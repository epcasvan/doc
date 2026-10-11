/**
 * Banques auto pour consonnes / sons complexes (à partir des pools + lecture).
 * Les voyelles restent dans SOUTIEN_VOWEL_BANKS (contenu pédagogique CSC).
 */
import { displayVocabLabel } from '@/francais/display-vocab-label'
import { resolveGameImageSrc } from '@/jeux/image-resolve'
import { GRAPHEME_WORD_POOLS } from './grapheme-word-pools'
import { LECTURE_WORD_ITEMS } from './lecture-word-items'
import { LECTURE_WORD_ITEMS_EXTRA } from './lecture-word-items-extra'

const ALL_LECTURE_FOR_AUTO = [...LECTURE_WORD_ITEMS, ...LECTURE_WORD_ITEMS_EXTRA]
import type {
  SoutienAudio,
  SoutienComplete,
  SoutienCompound,
  SoutienDet,
  SoutienScramble,
  SoutienSyllableItem,
  SoutienVowelBank,
} from './banks'
import { buildScrambleBank } from './phrase-scramble-build'
import { syllableItemFr } from './syllabify-fr'
import type { SoutienLetterOption, SoutienSoundOption } from './themes'

const KEEP_SHORT = new Set([
  'jet',
  'feu',
  'donjon',
  'jonc',
  'joli',
  'boxe',
  'axe',
  'luxe',
  'taxe',
  'texte',
  'fixe',
  'mixte',
  'relax',
])

function isUsefulWord(word: string): boolean {
  const w = word.trim().toLowerCase()
  if (w.length < 2) return false
  if (KEEP_SHORT.has(w)) return true
  // Verbes conjugués / infinitifs / formes nues issus des pools (alignaient, aligne…).
  if (/(aient|ait|ent|ons|ez)$/i.test(w) && w.length > 4) return false
  if (/er$/i.test(w) && w.length >= 5) {
    if (!ALL_LECTURE_FOR_AUTO.some((it) => it.label.toLowerCase() === w)) return false
  }
  // Adjectifs / mots peu imageables des pools x.
  if (w === 'vexant' || w === 'zonard') return false
  // Formes nues type « aligne / assigne / alignes » (pas dans la banque lecture).
  if (
    /e[s]?$/i.test(w) &&
    w.length >= 5 &&
    !ALL_LECTURE_FOR_AUTO.some((it) => it.label.toLowerCase() === w) &&
    /^(align|assign|gagn)/i.test(w)
  ) {
    return false
  }
  return true
}

const VOWELS = ['a', 'e', 'i', 'o', 'u', 'y'] as const

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

function autoSplit(word: string): readonly [string, string] | null {
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

function wordsForSound(sound: SoutienSoundOption, letter: SoutienLetterOption): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  const push = (w: string) => {
    const key = w.trim().toLowerCase()
    if (!key || seen.has(key) || !isUsefulWord(w)) return
    seen.add(key)
    out.push(w.trim())
  }

  // 1) Items lecture avec le phonème
  // /gz/ (x) est rare dans la banque lecture : accepter aussi « ex + voyelle » (examen…).
  const acceptExVowelGz = sound.bankId === 'x-gz'
  const acceptedPhonemes =
    sound.phoneme === '/ə/'
      ? ['/ə/', '/e/', '/ɛ/']
      : sound.phoneme === '/e/'
        ? ['/e/', '/ɛ/', '/ə/']
        : [sound.phoneme]
  for (const item of ALL_LECTURE_FOR_AUTO) {
    const lower = item.label.toLowerCase()
    const hasPhoneme = item.phonemes.some((p) => acceptedPhonemes.includes(p))
    const exVowelGz = acceptExVowelGz && /^ex[aeiouyàâäéèêëïîôöùûü]/i.test(lower)
    if (!hasPhoneme && !exVowelGz) continue
    // Pour multi-sons (c/g/s/x) : exiger aussi la lettre écrite
    if (letter.sounds.length > 1 || letter.id.length === 1) {
      const hasLetter = sound.graphemes.some((g) => {
        if (g.length > 1) return lower.includes(g.toLowerCase())
        return [...lower].some((ch) => ch.normalize('NFC') === g.normalize('NFC'))
      })
      // h muet : au moins la lettre h
      if (sound.phoneme === '/∅/') {
        if (!lower.includes('h')) continue
      } else if (!hasLetter && letter.id.length <= 2) {
        // Digrammes complexes : le pool / phonème suffit souvent
        if (!sound.complexPoolKey && !exVowelGz) continue
      }
    }
    push(item.label)
  }

  // 2) Pool complexe
  if (sound.complexPoolKey) {
    const complexPools = GRAPHEME_WORD_POOLS.complex as Record<string, readonly string[]>
    for (const w of complexPools[sound.complexPoolKey] ?? []) push(w)
  }

  // 3) Pool lettre
  const letterKey = sound.letterPoolKey ?? (letter.id.length === 1 ? letter.id : undefined)
  if (letterKey) {
    const letterPools = GRAPHEME_WORD_POOLS.letters as Record<string, readonly string[]>
    for (const w of letterPools[letterKey] ?? []) {
      const item = ALL_LECTURE_FOR_AUTO.find((it) => it.label.toLowerCase() === w.toLowerCase())
      if (
        item &&
        !item.phonemes.some((p) => acceptedPhonemes.includes(p)) &&
        sound.phoneme !== '/∅/'
      ) {
        continue
      }
      push(w)
    }
  }

  // Illustrés d’abord (types 1 / 7 / 16), puis mots sans image (dictée, mêlés…).
  const withImg: string[] = []
  const without: string[] = []
  for (const w of out) {
    if (resolveGameImageSrc(w)) withImg.push(w)
    else without.push(w)
  }
  // Slugs conservés pour image / phonème ; l’affichage applique displayVocabLabel.
  return [...withImg, ...without]
}

function buildCompletes(words: readonly string[], graphemes: readonly string[]): SoutienComplete[] {
  const out: SoutienComplete[] = []
  for (const raw of words.slice(0, 18)) {
    const word = displayVocabLabel(raw)
    const lower = word.toLowerCase()
    let blank = ''
    let before = ''
    let after = ''
    // Cherche le premier graphème cible
    const needles = [...graphemes].sort((a, b) => b.length - a.length)
    let idx = -1
    let matched = ''
    for (const g of needles) {
      const i = lower.indexOf(g.toLowerCase())
      if (i >= 0) {
        idx = i
        matched = word.slice(i, i + g.length)
        break
      }
    }
    if (idx < 0) {
      const parts = autoSplit(word)
      if (!parts) continue
      blank = parts[0]
      after = parts[1]
    } else {
      // Blank = graphème + voyelle suivante éventuelle (syllabe)
      let end = idx + matched.length
      if (end < word.length && /[aeiouyàâäéèêëïîôöùûü]/i.test(word[end]!)) {
        end += 1
      }
      before = word.slice(0, idx)
      blank = word.slice(idx, end)
      after = word.slice(end)
      if (!blank) continue
    }
    out.push({
      article: articleFor(word),
      word,
      before,
      blank,
      after,
    })
  }
  return out
}

function buildCompounds(words: readonly string[]): SoutienCompound[] {
  const out: SoutienCompound[] = []
  for (const raw of words.slice(0, 16)) {
    const word = displayVocabLabel(raw)
    const parts = autoSplit(word)
    if (!parts || !parts[0] || !parts[1]) continue
    out.push({ parts: [parts[0], parts[1]], word })
  }
  return out
}

/** Type 8 : découpe scolaire ; exclut les monosyllabes. */
function buildSyllableItems(words: readonly string[]): SoutienSyllableItem[] {
  const seen = new Set<string>()
  const out: SoutienSyllableItem[] = []
  for (const raw of words) {
    const display = displayVocabLabel(raw)
    const key = display.toLowerCase()
    if (!key || seen.has(key)) continue
    const item = syllableItemFr(display) ?? syllableItemFr(raw)
    if (!item) continue
    seen.add(key)
    out.push({ word: raw.trim(), parts: item.parts })
    if (out.length >= 72) break
  }
  return out
}

function buildScrambles(words: readonly string[], phoneme: string): SoutienScramble[] {
  return buildScrambleBank(words, phoneme, 20)
}

function buildDeterminants(words: readonly string[]): SoutienDet[] {
  const out: SoutienDet[] = []
  for (const raw of words.slice(0, 16)) {
    const word = displayVocabLabel(raw)
    const art = articleFor(word) === 'Une' ? 'La' : 'Le'
    const sentence = `${art} ${word} est sur la table.`
    out.push({
      parts: [{ blank: art }, { t: ` ${word} est sur la table.` }],
      sentence,
    })
  }
  return out
}

function buildPhrases(words: readonly string[]): string[] {
  return words.slice(0, 16).map((raw) => {
    const w = displayVocabLabel(raw)
    return `Je vois ${articleFor(w).toLowerCase()} ${w} ici.`
  })
}

function buildAudioPairs(words: readonly string[]): SoutienAudio[] {
  return words.slice(0, 12).map((raw, i) => {
    const word = displayVocabLabel(raw)
    const otherRaw = words[(i + 3) % Math.max(words.length, 1)] ?? raw
    return { word, other: displayVocabLabel(otherRaw) }
  })
}

function buildOrderSentences(words: readonly string[]): (readonly string[])[] {
  return words.slice(0, 12).map((raw) => {
    const w = displayVocabLabel(raw)
    const art = articleFor(w) === 'Une' ? 'la/determinant' : 'le/determinant'
    return [`je/pronom`, `vois/verbe`, art, `${w}/nom`, `./interjection`] as const
  })
}

function buildSyllables(letter: SoutienLetterOption, sound: SoutienSoundOption): string[] {
  const g = sound.graphemes[0] ?? letter.letterLower
  // Digramme / complex : cha, che… ou an, in…
  if (g.length > 1 || sound.complexPoolKey) {
    const base = letter.letterLower
    return VOWELS.flatMap((v) => [`${base}${v}`, `${v}${base}`, `${base}${v}${base}`])
  }
  // Consonne : ba, be, bi…
  return VOWELS.flatMap((v) => {
    const c = letter.letterLower
    return [`${c}${v}`, `${v}${c}`, `${c}${v}${c}`, `${c}${v}${c}${v}`]
  })
}

export function buildAutoSoutienBank(
  themeId: string,
  letter: SoutienLetterOption,
  sound: SoutienSoundOption,
): SoutienVowelBank {
  const words = wordsForSound(sound, letter)
  const seed = words.length ? words : [letter.letterLower]
  return {
    id: sound.bankId,
    topic: themeId,
    letterUpper: letter.letterUpper,
    letterLower: letter.letterLower,
    sound: sound.phoneme,
    label: `${letter.label} · ${sound.label}`,
    graphemes: sound.graphemes,
    // Slugs bruts (lookup image / phonème) ; l’affichage fiche applique displayVocabLabel.
    // Large bassin : types sans image (dictée, mêlés, écouter) piochent aussi les mots non illustrés.
    words: seed.slice(0, 96),
    syllables: buildSyllables(letter, sound),
    compounds: buildCompounds(seed),
    completes: buildCompletes(seed, sound.graphemes),
    scrambles: buildScrambles(seed, sound.phoneme),
    determinants: buildDeterminants(seed),
    countPhrases: buildPhrases(seed),
    readPhrases: buildPhrases(seed),
    audioPairs: buildAudioPairs(seed),
    syllableItems: buildSyllableItems(seed),
    orderSentences: buildOrderSentences(seed),
    wordSearchWords: seed.slice(0, 24).map(displayVocabLabel),
  }
}
