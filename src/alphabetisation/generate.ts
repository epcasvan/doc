import { ALPHABET, WORDS_BY_INITIAL } from '@/francais/lecture-banks'
import { tryGenerateSoutienBatch } from '@/francais/soutien/generate'
import type { SoutienGenerateOptions } from '@/francais/soutien/generate-options'
import { LECTURE_WORD_ITEMS } from '@/francais/soutien/lecture-word-items'
import { syllabifyFr } from '@/francais/soutien/syllabify-fr'
import { int, pick, shuffle, type Rng } from '@/math/rng'
import type { Difficulty, MathItem } from '@/math/types'
import { ALPHA_STORIES } from './data/stories'
import { parseSyllBankId, syllableGridsFor } from './data/syllables'
import { ALL_TOOL_WORDS, toolWordsForCategory } from './data/tool-words'
import { isAlphaLetterKind, parseAlphaType, type AlphaSpecialKindId } from './kinds'

export type AlphaBatch = {
  items: MathItem[]
  instruction: string
  preferredColumns?: number
}

const STORIES = ALPHA_STORIES

function monoWords(): string[] {
  return LECTURE_WORD_ITEMS.filter((w) => {
    const parts = syllabifyFr(w.label)
    return parts.length === 1 && w.label.length <= 9
  }).map((w) => w.label)
}

function multiWords(min: number, max: number | null): string[] {
  return LECTURE_WORD_ITEMS.filter((w) => {
    const n = syllabifyFr(w.label).length
    if (n < min) return false
    if (max != null && n > max) return false
    return true
  }).map((w) => w.label)
}

function poolForBank(bankId: string): string[] {
  if (bankId === 'mots-outils') return ALL_TOOL_WORDS
  if (bankId === 'mots-courants') return monoWords()
  if (bankId === 'mots-multi') return multiWords(2, null)
  const syll = parseSyllBankId(bankId)
  if (syll) {
    const g = syllableGridsFor(syll)
    return [...g.cvLower, ...g.vcLower]
  }
  if (bankId.startsWith('phrase-')) {
    const id = bankId.slice('phrase-'.length)
    const story = STORIES.find((s) => s.id === id)
    return story?.sentences.flatMap((s) => s.split(/\s+/)) ?? []
  }
  return monoWords()
}

function gridItem(prompt: string, cells: string[]): MathItem {
  return {
    layout: 'letter-grid',
    prompt,
    options: cells,
    answer: cells.join(' · '),
    labels: cells,
  }
}

function genLireGrille(bankId: string, count: number, rng: Rng, cursive: boolean): AlphaBatch {
  const syll = parseSyllBankId(bankId)
  if (syll) {
    const g = syllableGridsFor(syll)
    const blocks = [
      { title: `Consonne + ${syll} (majuscules)`, items: g.cvUpper },
      { title: `Consonne + ${syll} (minuscules)`, items: g.cvLower },
      { title: `${syll.toUpperCase()} + consonne (majuscules)`, items: g.vcUpper },
      { title: `${syll} + consonne (minuscules)`, items: g.vcLower },
    ]
    const chosen = shuffle(rng, blocks).slice(0, Math.min(count, blocks.length))
    return {
      instruction: cursive
        ? 'Lisez les syllabes (écriture cursive).'
        : 'Lisez les syllabes ci-dessous.',
      preferredColumns: 1,
      items: chosen.map((b) =>
        gridItem(b.title, shuffle(rng, [...b.items]).slice(0, 15)),
      ),
    }
  }
  if (bankId === 'mots-outils') {
    const cats = Object.keys({
      articles: 1,
      possessifs: 1,
      'pronoms-sujets': 1,
      'pronoms-complements': 1,
    })
    const items = cats.slice(0, count).map((key) => {
      const words = toolWordsForCategory(key)
      return gridItem(key.replace(/-/g, ' '), shuffle(rng, [...words]))
    })
    return {
      instruction: cursive ? 'Lisez les mots-outils (cursive).' : 'Lisez les mots-outils.',
      preferredColumns: 1,
      items,
    }
  }
  if (bankId === 'mots-multi') {
    const pools = [
      { title: 'Deux syllabes', words: multiWords(2, 2) },
      { title: 'Trois syllabes', words: multiWords(3, 3) },
      { title: 'Plus longs', words: multiWords(4, null) },
      { title: 'Lecture rapide', words: multiWords(2, null) },
    ]
    return {
      instruction: cursive ? 'Lisez les mots (cursive).' : 'Lisez les mots.',
      preferredColumns: 1,
      items: pools.slice(0, count).map((p) =>
        gridItem(p.title, shuffle(rng, p.words).slice(0, 12)),
      ),
    }
  }
  const words = shuffle(rng, poolForBank(bankId)).slice(0, Math.max(12, count * 4))
  const chunk = Math.ceil(words.length / Math.max(1, count))
  const items: MathItem[] = []
  for (let i = 0; i < count; i++) {
    const slice = words.slice(i * chunk, (i + 1) * chunk)
    if (!slice.length) break
    items.push(gridItem(`Série ${i + 1}`, slice))
  }
  return {
    instruction: cursive ? 'Lisez les mots (cursive).' : 'Lisez les mots.',
    preferredColumns: 1,
    items,
  }
}

function genEntourer(bankId: string, count: number, rng: Rng): AlphaBatch {
  const pool = poolForBank(bankId)
  const items: MathItem[] = []
  for (let i = 0; i < count; i++) {
    const target = pick(rng, pool)
    const distractors = shuffle(
      rng,
      pool.filter((w) => w !== target),
    ).slice(0, 15)
    const cells = shuffle(rng, [target, target, ...distractors]).slice(0, 16)
    items.push({
      layout: 'letter-grid',
      prompt: `Entourez « ${target} ».`,
      options: cells,
      answer: target,
      labels: [target],
    })
  }
  return {
    instruction: 'Entourez les formes demandées.',
    preferredColumns: 1,
    items,
  }
}

function genFormer(bankId: string, count: number, rng: Rng): AlphaBatch {
  const syll = parseSyllBankId(bankId)
  const items: MathItem[] = []
  if (syll) {
    const g = syllableGridsFor(syll)
    for (let i = 0; i < count; i++) {
      const s = pick(rng, g.cvLower)
      const a = s[0]!
      const b = s.slice(1)
      items.push({
        layout: 'text',
        prompt: `Associez : ${a} + ${b} →`,
        answer: s,
      })
    }
  } else {
    const words = poolForBank(bankId).filter((w) => w.length >= 3)
    for (let i = 0; i < count; i++) {
      const w = pick(rng, words.length ? words : ['ami'])
      const cut = int(rng, 1, Math.max(1, w.length - 1))
      items.push({
        layout: 'text',
        prompt: `Associez : ${w.slice(0, cut)} + ${w.slice(cut)} →`,
        answer: w,
      })
    }
  }
  return {
    instruction: 'Associez les parties et écrivez le résultat.',
    preferredColumns: 1,
    items,
  }
}

function genClasser(bankId: string, count: number, rng: Rng): AlphaBatch {
  const left =
    bankId === 'mots-outils'
      ? toolWordsForCategory('articles')
      : multiWords(2, 2).slice(0, 20)
  const right =
    bankId === 'mots-outils'
      ? toolWordsForCategory('pronoms-sujets')
      : multiWords(3, 3).slice(0, 20)
  const items: MathItem[] = []
  for (let i = 0; i < count; i++) {
    const a = pick(rng, left)
    const b = pick(rng, right)
    const options = shuffle(rng, [a, b])
    items.push({
      layout: 'select',
      prompt:
        bankId === 'mots-outils'
          ? `Classez « ${options[0]} » : article ou pronom ?`
          : `Combien de syllabes dans « ${options[0]} » ?`,
      options:
        bankId === 'mots-outils'
          ? ['article / déterminant', 'pronom']
          : ['2', '3'],
      answer:
        bankId === 'mots-outils'
          ? left.includes(options[0]!)
            ? 'article / déterminant'
            : 'pronom'
          : String(syllabifyFr(options[0]!).length),
    })
  }
  return {
    instruction: 'Classez les mots.',
    preferredColumns: 1,
    items,
  }
}

function genDictee(bankId: string, count: number, rng: Rng): AlphaBatch {
  const pool = shuffle(rng, poolForBank(bankId)).slice(0, count)
  return {
    instruction: 'Écrivez correctement.',
    preferredColumns: 1,
    items: pool.map((w, i) => ({
      layout: 'text',
      prompt: `${i + 1}.`,
      answer: w,
    })),
  }
}

function genLirePhrases(bankId: string): AlphaBatch {
  const id = bankId.startsWith('phrase-') ? bankId.slice('phrase-'.length) : bankId
  const story = STORIES.find((s) => s.id === id) ?? STORIES[0]!
  return {
    instruction: `Lisez « ${story.title} ».`,
    preferredColumns: 1,
    items: story.sentences.map((sentence) => ({
      layout: 'text',
      prompt: sentence,
      answer: sentence,
    })),
  }
}

function genOrdrePhrases(bankId: string, count: number, rng: Rng): AlphaBatch {
  const id = bankId.startsWith('phrase-') ? bankId.slice('phrase-'.length) : bankId
  const story = STORIES.find((s) => s.id === id) ?? STORIES[0]!
  const pool = shuffle(rng, [...story.sentences]).slice(0, count)
  return {
    instruction: 'Mettez les mots dans l’ordre.',
    preferredColumns: 1,
    items: pool.map((sentence) => {
      const words = sentence.replace(/[.!?,;:]/g, '').split(/\s+/).filter(Boolean)
      return {
        layout: 'order',
        prompt: 'Remettez la phrase en ordre.',
        sequence: shuffle(rng, [...words]),
        placeParts: words,
        answer: words.join(' '),
      }
    }),
  }
}

function genAlphabet(
  kind: AlphaSpecialKindId,
  count: number,
  rng: Rng,
  difficulty: Difficulty,
): AlphaBatch | null {
  if (kind === 'alphabet-ordre') {
    const items: MathItem[] = []
    for (let i = 0; i < count; i++) {
      const n = difficulty === 'facile' ? 4 : difficulty === 'moyen' ? 5 : 6
      const letters = shuffle(rng, [...ALPHABET]).slice(0, n)
      const sorted = [...letters].sort()
      items.push({
        layout: 'order',
        prompt: 'Classez ces lettres par ordre alphabétique.',
        sequence: letters,
        placeParts: sorted,
        answer: sorted.join(' '),
        orderOp: '<',
      })
    }
    return {
      instruction: 'Classez les lettres par ordre alphabétique.',
      preferredColumns: 1,
      items,
    }
  }
  if (kind === 'alphabet-suivant') {
    const items: MathItem[] = []
    for (let i = 0; i < count; i++) {
      const idx = int(rng, 0, ALPHABET.length - 2)
      const letter = ALPHABET[idx]!
      const next = ALPHABET[idx + 1]!
      const distractors = shuffle(
        rng,
        ALPHABET.filter((l) => l !== next && l !== letter),
      ).slice(0, 3)
      items.push({
        layout: 'select',
        prompt: `Quelle lettre vient juste après ${letter} ?`,
        options: shuffle(rng, [next, ...distractors]),
        answer: next,
      })
    }
    return {
      instruction: 'Quelle lettre vient juste après ?',
      preferredColumns: 2,
      items,
    }
  }
  if (kind === 'alphabet-initiale') {
    const items: MathItem[] = []
    for (let i = 0; i < count; i++) {
      const letter = pick(
        rng,
        ALPHABET.filter((l) => (WORDS_BY_INITIAL[l]?.length ?? 0) > 0),
      )
      const examples = WORDS_BY_INITIAL[letter] ?? []
      items.push({
        layout: 'text',
        prompt: `Écrivez un mot qui commence par la lettre ${letter}.`,
        answer: pick(rng, examples),
      })
    }
    return {
      instruction: 'Écrivez un mot qui commence par la lettre demandée.',
      preferredColumns: 1,
      items,
    }
  }
  return null
}

function genSpecial(
  bankId: string,
  kind: AlphaSpecialKindId,
  count: number,
  rng: Rng,
  difficulty: Difficulty,
): AlphaBatch | null {
  if (kind.startsWith('alphabet-')) return genAlphabet(kind, count, rng, difficulty)
  switch (kind) {
    case 'lire-grille':
      return genLireGrille(bankId, count, rng, false)
    case 'lire-cursive':
      return genLireGrille(bankId, count, rng, true)
    case 'entourer':
      return genEntourer(bankId, count, rng)
    case 'former':
      return genFormer(bankId, count, rng)
    case 'classer':
      return genClasser(bankId, count, rng)
    case 'dictee-mots':
      return genDictee(bankId, count, rng)
    case 'lire-phrases':
      return genLirePhrases(bankId)
    case 'ordre-phrases':
      return genOrdrePhrases(bankId, count, rng)
    default:
      return null
  }
}

export function tryGenerateAlphabetisationBatch(
  exerciseType: string,
  count: number,
  rng: Rng,
  difficulty: Difficulty = 'moyen',
  options?: SoutienGenerateOptions,
): AlphaBatch | null {
  const parsed = parseAlphaType(exerciseType)
  if (!parsed) return null

  // Leçons lettre / son : même générateur que Soutien FR.
  if (isAlphaLetterKind(parsed.kind) && !parsed.bankId.startsWith('syll-') && !parsed.bankId.startsWith('mots-') && !parsed.bankId.startsWith('phrase-') && parsed.bankId !== 'alphabet') {
    const soutien = tryGenerateSoutienBatch(
      `soutien-${parsed.bankId}-${parsed.kind}`,
      count,
      rng,
      difficulty,
      options,
    )
    if (soutien) return soutien
  }

  if (!isAlphaLetterKind(parsed.kind)) {
    return genSpecial(parsed.bankId, parsed.kind, count, rng, difficulty)
  }

  // Kinds Soutien demandés sur un bank spécial → adaptation minimale.
  if (parsed.kind === 'lire' && parsed.bankId.startsWith('phrase-')) {
    return genLirePhrases(parsed.bankId)
  }
  if (parsed.kind === 'syllabes' || parsed.kind === 'lettres') {
    return genLireGrille(parsed.bankId, count, rng, parsed.kind === 'syllabes')
  }
  if (parsed.kind === 'dictee') {
    return genDictee(parsed.bankId, count, rng)
  }
  if (parsed.kind === 'ordre') {
    return genOrdrePhrases(parsed.bankId, count, rng)
  }

  return genLireGrille(parsed.bankId, count, rng, false)
}
