/** Génération par kind Soutien FR (types 1–17) — extrait de generate.ts. */
import { pick, shuffle, type Rng } from '@/math/rng'
import { tagged } from '@/francais/phrase-sentences'
import type { Difficulty, MathItem, PhraseToken } from '@/math/types'
import { displayVocabLabel } from '@/francais/display-vocab-label'
import type { SoutienVowelBank } from './banks'
import { soutienAudioFor } from './audio'
import { completesFromType1Words } from './complete-blank'
import { soutienEntriesWithImages, soutienImageFor } from './images'
import type { SoutienKindId } from './kinds'
import {
  buildPhrasesForWord,
  soutienPhraseAudioPath,
} from './phrase-scramble-build'
import {
  compoundsForType1Words,
  lessonSoundGraphemes,
  lessonWordsBySound,
  wordHasLessonLetter,
  wordHasLessonSound,
} from './phoneme'
import { buildWordSearch, wordSearchHitCells } from './word-search'
import { isSoutienType1Word, type1WordPool, type1Words } from './type1-words'
import type { SoutienGenerateOptions } from './generate-options'
import {
  filterSoutienLevel,
  soutienPhrasesFor,
  type SoutienLevelFilter,
} from './phrases-data'
import {
  AUDIO_ORDER_CLIPS,
  buildSyllableReadingList,
  countSoundInPhrase,
  joinSoutienOrder,
  letterGrid,
  otherWords,
  syllableBlockRows,
} from './gen-kind-helpers'

/** Phrases rédigées (types 12 / 14) filtrées par niveau ; `null` si aucune. */
function curatedPhrases(
  bank: SoutienVowelBank,
  kind: 'type12' | 'type14',
  level: SoutienLevelFilter | undefined,
): string[] | null {
  const data = soutienPhrasesFor(bank.id)
  if (!data) return null
  const rows = filterSoutienLevel(data[kind], level)
  if (rows.length === 0) return null
  return rows.map((r) => r.sentence)
}

export function genKind(
  kind: SoutienKindId,
  bank: SoutienVowelBank,
  count: number,
  rng: Rng,
  _difficulty: Difficulty,
  options?: SoutienGenerateOptions,
): { items: MathItem[]; instruction: string; preferredColumns?: number } {
  const n = Math.max(1, count)

  switch (kind) {
    case 'mots': {
      const libre =
        Boolean(options?.soutienMotsLibre) &&
        (options?.soutienMotsEntries?.some((e) => e.label.trim()) ?? false)
      const libreEntries = libre
        ? (options!.soutienMotsEntries ?? [])
            .filter((e) => e.label.trim())
            .slice(0, 16)
            .map((e, index) => {
              const raw = e.label.trim()
              const label = displayVocabLabel(raw)
              return {
                id: e.id || `soutien-libre-${index}`,
                label,
                imageSrc: e.imageSrc || soutienImageFor(raw) || soutienImageFor(label),
                audioSrc: soutienAudioFor(raw) ?? soutienAudioFor(label),
              }
            })
        : null
      /** Tirage aléatoire 16 mots (image prioritaire) — se régénère avec la graine. */
      const rawWords = libreEntries
        ? libreEntries.map((e) => e.label)
        : type1Words(bank, rng)
      const entries =
        libreEntries ??
        soutienEntriesWithImages(rawWords).map((e) => ({
          ...e,
          audioSrc: soutienAudioFor(e.label),
          label: displayVocabLabel(e.label),
        }))
      const words = entries.map((e) => e.label)
      const total = Math.max(1, Math.min(16, entries.length))
      /** Grille 4×4 pour tenir sur l’A4 avec en-tête et pied. */
      const cols = 4
      const rows = Math.max(1, Math.ceil(total / cols))
      return {
        instruction: `On entend le son ${bank.sound} dans ces mots.`,
        preferredColumns: 1,
        items: [
          {
            layout: 'vocab-table',
            prompt: `On entend le son ${bank.sound} dans ces mots.`,
            vocabEntries: entries,
            vocabRows: rows,
            vocabCols: cols,
            labels: [...bank.graphemes],
            answer: words.join(' · '),
          },
        ],
      }
    }
    case 'lettres':
      return {
        instruction: `Entourez les lettres ${bank.letterUpper} ${bank.letterLower}.`,
        preferredColumns: 1,
        /** `count` = nombre de lignes du tableau de lettres. */
        items: [letterGrid(rng, bank, n)],
      }
    case 'syllabes': {
      /**
       * Deux blocs (script + Playwrite), même contenu.
       * `count` = lignes par bloc (défaut 3) ; moitié CV, moitié doubles sans nasal.
       */
      const cols = 5
      const rows = syllableBlockRows(n)
      const list = buildSyllableReadingList(rng, bank, cols * rows)
      return {
        instruction: 'Lisez les syllabes ci-dessous.',
        preferredColumns: 1,
        items: [
          {
            layout: 'syllable-table',
            prompt: 'Lisez les syllabes :',
            options: list,
            labels: [...bank.graphemes],
            answer: list.join(' · '),
            letterGridCols: cols,
          },
        ],
      }
    }
    case 'relier': {
      /**
       * Uniquement les mots du type 1 (même banque / tirage Voc) ;
       * défaut 12 mots en 2 colonnes.
       */
      const want = Math.max(1, Math.min(16, n))
      const colCount = options?.columns === 1 ? 1 : 2
      // Tirage type 1 élargi, puis composés seulement sur ces mots (pas d’autres).
      const type1 = type1Words(bank, rng, Math.max(16, want))
      const pool = compoundsForType1Words(bank, type1)
      const compounds = shuffle(rng, pool).slice(0, Math.min(want, pool.length))
      const mid = colCount === 2 ? Math.ceil(compounds.length / 2) : compounds.length
      const groups =
        colCount === 2
          ? [compounds.slice(0, mid), compounds.slice(mid)]
          : [compounds]
      const left: string[] = []
      const right: string[] = []
      const pairs: Array<{ left: string; right: string }> = []
      for (const group of groups) {
        const gLeft = group.map((c) => c.parts[0])
        const gRight = shuffle(
          rng,
          group.map((c) => c.parts[1]),
        )
        left.push(...gLeft)
        right.push(...gRight)
        for (const c of group) pairs.push({ left: c.parts[0], right: c.parts[1] })
      }
      return {
        instruction: 'Reliez les parties et formez un mot.',
        preferredColumns: 1,
        items: [
          {
            layout: 'vocab-match',
            labels: left,
            options: right,
            vocabMatchMode: 'syllables',
            themeGraphemes: [...bank.graphemes],
            vocabPairs: pairs,
            letterGridCols: colCount,
            letterGridVariant: colCount === 2 ? 'table' : undefined,
            answer: compounds.map((c) => `${c.parts[0]} + ${c.parts[1]} → ${c.word}`).join(' · '),
          },
        ],
      }
    }
    case 'completer': {
      /** Grille image + Un/Une + trait CV/VC + QR ; mots = type 1 uniquement. */
      const cols = Math.max(1, Math.min(3, Math.round(options?.columns ?? 2) || 2))
      const libre =
        Boolean(options?.soutienCompleterLibre) &&
        (options?.soutienCompleterEntries?.some((e) => e.word.trim() && e.blank.trim()) ??
          false)
      const want = Math.max(1, Math.min(18, n))
      const pool = libre
        ? (options!.soutienCompleterEntries ?? [])
            .filter((e) => e.word.trim() && e.blank.trim())
            .slice(0, want)
            .map((row) => {
              const raw = row.word.trim()
              const word = displayVocabLabel(raw)
              return {
                article: row.article.trim() || 'Un',
                before: row.before,
                blank: row.blank.slice(0, 2),
                after: row.after,
                word,
                imageSrc: row.imageSrc || soutienImageFor(raw) || soutienImageFor(word),
                audioSrc: soutienAudioFor(raw) ?? soutienAudioFor(word),
              }
            })
        : (() => {
            const type1 = type1Words(bank, rng, Math.max(18, want))
            const built = completesFromType1Words(bank, type1)
            return shuffle(rng, built)
              .slice(0, Math.min(want, built.length))
              .map((row) => ({
                article: row.article,
                before: row.before,
                blank: row.blank,
                after: row.after,
                word: row.word,
                imageSrc: soutienImageFor(row.word),
                audioSrc: soutienAudioFor(row.word),
              }))
          })()
      const rows = Math.max(1, Math.ceil(pool.length / cols))
      return {
        instruction: 'Écoutez et Complétez les mots.',
        preferredColumns: 1,
        items: [
          {
            layout: 'syllable-complete',
            syllableCompletes: pool,
            answer: pool.map((row) => `${row.article} ${row.word}`).join(' · '),
            vocabRows: rows,
            vocabCols: cols,
            themeGraphemes: [...bank.graphemes],
          },
        ],
      }
    }
    case 'ecouter': {
      /** Grille : n° + case + trait (+ QR) ; positifs = son (au/eau admis pour /o/). */
      const cols = Math.max(1, Math.min(3, Math.round(options?.columns ?? 3) || 3))
      const need = Math.max(1, Math.min(30, n))
      const soundPool = lessonWordsBySound(bank)
      const posCount = Math.max(1, Math.min(need, Math.ceil(need * 0.55)))
      const negCount = Math.max(0, need - posCount)
      const positives = shuffle(rng, soundPool).slice(0, Math.min(posCount, soundPool.length))
      const negatives = shuffle(rng, otherWords(bank)).slice(0, negCount)
      let optionsList = shuffle(rng, [...positives, ...negatives])
      if (optionsList.length < need) {
        const extra = shuffle(rng, [...soundPool, ...otherWords(bank)]).filter(
          (w) => !optionsList.some((p) => p.toLowerCase() === w.toLowerCase()),
        )
        optionsList = [...optionsList, ...extra].slice(0, need)
      }
      optionsList = optionsList.slice(0, need)
      const positiveSet = new Set(positives.map((w) => w.toLowerCase()))
      const checked = optionsList.filter((w) => positiveSet.has(w.toLowerCase()))
      const audios = optionsList.map((w) => soutienAudioFor(w))
      const shown = optionsList.map(displayVocabLabel)
      const shownChecked = checked.map(displayVocabLabel)
      return {
        instruction: `Écoutez les mots et cochez quand vous entendez le son ${bank.sound}.`,
        preferredColumns: 1,
        items: [
          {
            layout: 'listen-check',
            options: shown,
            optionAudioSrcs: audios.map((a) => a ?? ''),
            labels: shownChecked,
            answer: shownChecked.join(' · '),
            letterGridCols: cols,
            themeGraphemes: [...lessonSoundGraphemes(bank)],
          },
        ],
      }
    }
    case 'ecouter-image': {
      /** Grille images fluide ; positifs = son (au/eau admis pour /o/). */
      const cols = Math.max(3, Math.min(5, Math.round(options?.columns ?? 3) || 3))
      const need = Math.max(1, Math.min(30, n))
      const withImg = (list: readonly string[]) =>
        list.filter((w) => Boolean(soutienImageFor(w)))
      const soundPool = lessonWordsBySound(bank)
      const posPool = withImg(soundPool)
      const negPool = withImg([
        ...otherWords(bank),
        ...bank.completes.map((c) => c.word).filter((w) => !wordHasLessonSound(w, bank)),
        ...bank.syllableItems
          .map((item) => item.word)
          .filter((w) => !wordHasLessonSound(w, bank)),
      ])
      const posCount = Math.max(1, Math.min(need, Math.ceil(need * 0.55)))
      const positives = shuffle(rng, posPool).slice(0, Math.min(posCount, posPool.length))
      const negatives = shuffle(
        rng,
        negPool.filter((w) => !positives.some((p) => p.toLowerCase() === w.toLowerCase())),
      ).slice(0, Math.max(0, need - positives.length))
      let pool = shuffle(rng, [...positives, ...negatives])
      if (pool.length < need) {
        const extra = withImg([...soundPool, ...otherWords(bank)]).filter(
          (w) => !pool.some((p) => p.toLowerCase() === w.toLowerCase()),
        )
        pool = [...pool, ...shuffle(rng, extra)].slice(0, need)
      }
      pool = pool.slice(0, need)
      const images = pool.map((w) => soutienImageFor(w)!)
      const audios = pool.map((w) => soutienAudioFor(w))
      const positiveSet = new Set(positives.map((w) => w.toLowerCase()))
      const checked = pool.filter((w) => positiveSet.has(w.toLowerCase()))
      const shown = pool.map(displayVocabLabel)
      const shownChecked = checked.map(displayVocabLabel)
      return {
        instruction: `Écoutez les mots et cochez quand vous entendez le son ${bank.sound}.`,
        preferredColumns: 1,
        items: [
          {
            layout: 'listen-check',
            options: shown,
            optionImages: images,
            optionAudioSrcs: audios.map((a) => a ?? ''),
            imagesAvailable: true,
            labels: shownChecked,
            answer: shownChecked.join(' · '),
            letterGridCols: cols,
            themeGraphemes: [...lessonSoundGraphemes(bank)],
          },
        ],
      }
    }
    case 'syllabe-son': {
      /** Grille fluide ; count = nb de cartes ; colonnes 1–3 ; ≥ 2 syllabes avec le son. */
      const cols = Math.max(1, Math.min(3, Math.round(options?.columns ?? 3) || 3))
      const need = Math.max(1, Math.min(18, n))
      const pool = shuffle(
        rng,
        bank.syllableItems.filter(
          (item) =>
            item.parts.length >= 2 &&
            (wordHasLessonLetter(item.word, bank) || wordHasLessonSound(item.word, bank)),
        ),
      )
      let chosen = pool.slice(0, need)
      if (chosen.length < need) {
        const rest = bank.syllableItems.filter(
          (item) =>
            item.parts.length >= 2 &&
            !chosen.some((t) => t.word.toLowerCase() === item.word.toLowerCase()),
        )
        chosen = [...chosen, ...shuffle(rng, rest)].slice(0, need)
      }
      return {
        instruction: `À quelle syllabe entendez-vous le son ${bank.sound} ?`,
        preferredColumns: 1,
        items: [
          {
            layout: 'syllable-sound',
            syllableSoundItems: chosen.map((item) => {
              const parts = [...item.parts]
              const hitIndex = parts.findIndex((p) => wordHasLessonLetter(p, bank))
              const word = displayVocabLabel(item.word)
              return {
                word,
                parts,
                hitIndex: hitIndex >= 0 ? hitIndex : -1,
                imageSrc: soutienImageFor(item.word) || soutienImageFor(word),
                audioSrc: soutienAudioFor(item.word) ?? soutienAudioFor(word),
              }
            }),
            answer: chosen
              .map((item) => {
                const parts = item.parts
                const hit = parts.find((p) => wordHasLessonLetter(p, bank))
                const word = displayVocabLabel(item.word)
                return hit ? `${word} → ${hit}` : word
              })
              .join(' · '),
            letterGridCols: cols,
            themeGraphemes: [...bank.graphemes],
          },
        ],
      }
    }
    case 'lettres-phrase': {
      /** Phrases illustratives ; exclut mots types 1 et 5 ; lettres sous le trait. */
      const want = Math.max(1, Math.min(16, n))
      const exclude = new Set(
        (options?.excludeWords ?? []).map((w) => displayVocabLabel(w).toLowerCase()),
      )
      type ScrambleRow = { sentence: string; word: string; letters: string }
      const byWord = new Map<string, ScrambleRow[]>()
      const curated = soutienPhrasesFor(bank.id)
      const curatedRows = curated ? filterSoutienLevel(curated.type9, options?.level) : []
      /** Phrases rédigées avec image ; pas de composés. */
      for (const row of curatedRows) {
        if (!isSoutienType1Word(row.word)) continue
        if (exclude.has(displayVocabLabel(row.word).toLowerCase())) continue
        const scramble: ScrambleRow = { sentence: row.sentence, word: row.word, letters: '' }
        const key = displayVocabLabel(row.word).toLowerCase()
        const list = byWord.get(key) ?? []
        list.push(scramble)
        byWord.set(key, list)
      }
      if (byWord.size < want) {
        const fromBank = bank.scrambles.filter(
          (row) =>
            isSoutienType1Word(row.word) &&
            !exclude.has(displayVocabLabel(row.word).toLowerCase()),
        )
        for (const row of shuffle(rng, fromBank)) {
          if (byWord.size >= want) break
          const key = displayVocabLabel(row.word).toLowerCase()
          if (byWord.has(key)) continue
          byWord.set(key, [row])
        }
      }
      if (byWord.size < want) {
        const extraWords = type1WordPool(bank).filter(
          (w) => !exclude.has(displayVocabLabel(w).toLowerCase()),
        )
        for (const raw of shuffle(rng, extraWords)) {
          if (byWord.size >= want) break
          const key = displayVocabLabel(raw).toLowerCase()
          if (byWord.has(key)) continue
          const phrases = buildPhrasesForWord(raw, bank.sound, byWord.size)
          if (phrases.length === 0) continue
          byWord.set(
            key,
            phrases.map((sentence) => ({
              sentence,
              word: displayVocabLabel(raw),
              letters: '',
            })),
          )
        }
      }
      const wordKeys = shuffle(rng, [...byWord.keys()])
      const chosenKeys = wordKeys.slice(0, Math.min(want, wordKeys.length))
      const rows = chosenKeys
        .map((key) => {
          const variants = byWord.get(key) ?? []
          if (variants.length === 0) return null
          return pick(rng, variants)
        })
        .filter((row): row is NonNullable<typeof row> => Boolean(row))
      return {
        instruction: 'Écrivez le mot correct à l’aide des lettres.',
        preferredColumns: 1,
        items: [
          {
            layout: 'phrase-scramble',
            phraseScrambles: rows.map((row) => {
              const word = displayVocabLabel(row.word)
              const lower = row.sentence.toLowerCase()
              const w = word.toLowerCase()
              const idx = lower.indexOf(w)
              const before = idx >= 0 ? row.sentence.slice(0, idx) : `${row.sentence} `
              const after =
                idx >= 0 ? row.sentence.slice(idx + word.length) : ''
              const letters = shuffle(
                rng,
                [...word.toLocaleUpperCase('fr-FR')].filter((ch) => /\p{L}/u.test(ch)),
              ).join(' ')
              const sentence =
                idx >= 0 ? row.sentence : `${before}${word}${after}`.trim()
              return {
                before,
                after,
                word,
                letters,
                imageSrc: soutienImageFor(row.word) || soutienImageFor(word),
                audioSrc: soutienPhraseAudioPath(sentence),
                sentence,
              }
            }),
            answer: rows.map((row) => displayVocabLabel(row.word)).join(' · '),
            themeGraphemes: [...lessonSoundGraphemes(bank)],
          },
        ],
      }
    }
    case 'determinants': {
      /**
       * Phrases à trous (scènes rédigées type 10, sinon banque) ; count = nb de questions.
       * Consigne unique en en-tête (l’ / le / la / les stylés).
       */
      const want = Math.max(1, Math.min(16, n))
      const curated = soutienPhrasesFor(bank.id)
      const curatedRows = curated ? filterSoutienLevel(curated.type10, options?.level) : []
      const pool =
        curatedRows.length > 0
          ? curatedRows.map((row) => ({
              parts: row.parts.map((p) =>
                'blank' in p ? { blank: p.blank } : { t: p.t },
              ),
              sentence: row.sentence,
            }))
          : bank.determinants.map((row) => ({
              parts: row.parts.map((p) =>
                'blank' in p ? { blank: p.blank } : { t: p.t },
              ),
              sentence: row.sentence,
            }))
      const rows = shuffle(rng, pool).slice(0, Math.min(want, pool.length))
      return {
        instruction: 'Complétez avec les déterminants l’, le, la ou les.',
        preferredColumns: 1,
        items: [
          {
            layout: 'determinant-fill',
            determinantFills: rows.map((row) => ({
              parts: row.parts,
              sentence: row.sentence,
            })),
            answer: rows.map((row) => row.sentence).join(' · '),
            themeGraphemes: [...bank.graphemes],
          },
        ],
      }
    }
    case 'dictee': {
      /** Grille 2 colonnes ; count = nb de mots ; trait continu, sans bordure. */
      const want = Math.max(1, Math.min(16, n))
      const pool = type1Words(bank, rng)
      const words = shuffle(rng, pool.length ? pool : [...bank.words])
        .slice(0, Math.min(want, pool.length || bank.words.length))
        .map(displayVocabLabel)
      return {
        instruction: 'Dictée. Écrivez les mots correctement !',
        preferredColumns: 1,
        items: [
          {
            layout: 'dictee-grid',
            dicteeWords: words,
            answer: words.join(' · '),
            themeGraphemes: [...bank.graphemes],
          },
        ],
      }
    }
    case 'compter': {
      /** Phrases à lire (texte simple) + compter le son ; count réglable. */
      const want = Math.max(1, Math.min(12, n))
      const pool = curatedPhrases(bank, 'type12', options?.level) ?? [...bank.countPhrases]
      const phrases = shuffle(rng, pool).slice(0, Math.min(want, pool.length))
      const items = phrases.map((phrase) => ({
        phrase,
        count: countSoundInPhrase(phrase, bank),
      }))
      return {
        instruction: `Combien de fois entendez-vous le son ${bank.sound} ?`,
        preferredColumns: 1,
        items: [
          {
            layout: 'count-sound',
            countSoundItems: items,
            answer: items.map((it) => String(it.count)).join(' · '),
          },
        ],
      }
    }
    case 'ordre': {
      /** Pastilles Gattegno uniquement (pas de coloriage des lettres du son). */
      const want = Math.max(1, Math.min(12, n))
      const rows = shuffle(rng, [...bank.orderSentences]).slice(
        0,
        Math.min(want, bank.orderSentences.length),
      )
      return {
        instruction: 'Mettez dans l’ordre les mots.',
        preferredColumns: 1,
        items: rows.map((taggedParts) => {
          const ordered: PhraseToken[] = tagged(taggedParts.join(' '))
          const scrambled = shuffle(rng, [...ordered])
          const sentence = joinSoutienOrder(ordered)
          return {
            layout: 'phrase-order' as const,
            tokens: scrambled,
            labels: ordered.map((t) => t.text),
            answer: sentence,
            responseAnswer: sentence,
          }
        }),
      }
    }
    case 'lire': {
      /** Phrases à lire ; voyelle du thème en couleur ; count réglable. */
      const want = Math.max(1, Math.min(20, n))
      const pool = curatedPhrases(bank, 'type14', options?.level) ?? [...bank.readPhrases]
      const phrases = shuffle(rng, pool).slice(0, Math.min(want, pool.length))
      return {
        instruction: 'Lisez les phrases.',
        preferredColumns: 1,
        items: [
          {
            layout: 'read-phrases',
            readPhrases: phrases,
            answer: phrases.join(' · '),
            themeGraphemes: [...bank.graphemes],
          },
        ],
      }
    }
    case 'associer-audio':
    case 'associer-image': {
      /**
       * Type 15 (mots) / 16 (images type 1) :
       * count = nb de séries (1–3) ; chaque série = 8 QR numérotés + 8 cases réponse.
       */
      const seriesCount = Math.max(1, Math.min(3, n))
      const mode = kind === 'associer-image' ? 'images' : 'words'
      const exclude = new Set(
        (options?.excludeWords ?? []).map((w) => w.toLowerCase()),
      )
      const used = new Set<string>()

      const takeWords = (pool: string[], want: number): string[] => {
        const available = pool.filter((w) => {
          const key = w.toLowerCase()
          return !used.has(key) && !exclude.has(key)
        })
        const picked = shuffle(rng, available).slice(0, Math.min(want, available.length))
        for (const w of picked) used.add(w.toLowerCase())
        if (picked.length >= want) return picked
        /** Repli : réutiliser hors déjà tirés dans la série courante. */
        const refill = shuffle(
          rng,
          pool.filter((w) => !picked.some((p) => p.toLowerCase() === w.toLowerCase())),
        )
        return [...picked, ...refill].slice(0, want)
      }

      let pool: string[]
      if (mode === 'images') {
        const pinned = (options?.type1Words ?? []).filter((w) => Boolean(soutienImageFor(w)))
        const fallback = type1WordPool(bank).filter((w) => Boolean(soutienImageFor(w)))
        pool = pinned.length >= AUDIO_ORDER_CLIPS ? pinned : fallback
      } else {
        const candidates = [
          ...bank.audioPairs.map((p) => p.word),
          ...bank.wordSearchWords,
          ...lessonWordsBySound(bank),
          ...bank.words,
        ]
        const seen = new Set<string>()
        pool = []
        for (const raw of candidates) {
          const key = raw.toLowerCase()
          if (seen.has(key) || exclude.has(key)) continue
          if (!soutienAudioFor(raw)) continue
          seen.add(key)
          pool.push(raw)
        }
        if (pool.length < AUDIO_ORDER_CLIPS) {
          for (const raw of type1WordPool(bank)) {
            const key = raw.toLowerCase()
            if (seen.has(key) || exclude.has(key)) continue
            if (!soutienAudioFor(raw)) continue
            seen.add(key)
            pool.push(raw)
          }
        }
      }

      const items: MathItem[] = []
      for (let s = 0; s < seriesCount; s++) {
        const rawWords = takeWords(pool, AUDIO_ORDER_CLIPS)
        while (rawWords.length < AUDIO_ORDER_CLIPS && pool.length > 0) {
          rawWords.push(pool[rawWords.length % pool.length]!)
        }
        const clips = rawWords.slice(0, AUDIO_ORDER_CLIPS).map((word) => ({
          word: displayVocabLabel(word),
          audioSrc: soutienAudioFor(word) ?? undefined,
        }))
        const slotSource = clips.map((clip, i) => ({
          word: mode === 'words' ? clip.word : undefined,
          imageSrc:
            mode === 'images'
              ? soutienImageFor(rawWords[i]!) || undefined
              : undefined,
          correctNum: i + 1,
        }))
        const slots = shuffle(rng, slotSource)
        items.push({
          layout: 'audio-order',
          audioOrder: { mode, clips, slots },
          answer: clips.map((c, i) => `${i + 1} → ${c.word}`).join(' · '),
          themeGraphemes: [...bank.graphemes],
        })
      }

      return {
        instruction:
          mode === 'images'
            ? 'Écoutez et classez les images dans l’ordre.'
            : 'Écoutez et classez les mots dans l’ordre.',
        preferredColumns: 1,
        items,
      }
    }
    case 'mots-meles': {
      /** Liste 12 mots + grille 15×15 (H/V) ; lettres sans accents ni ligatures. */
      const puzzle = buildWordSearch(
        rng,
        bank.wordSearchWords.map(displayVocabLabel),
        15,
        12,
      )
      const hits = [...wordSearchHitCells(puzzle.placements)]
      return {
        instruction: 'Entourez les mots dans la grille.',
        preferredColumns: 1,
        items: [
          {
            layout: 'word-search',
            wordSearch: {
              size: puzzle.size,
              grid: puzzle.grid,
              words: puzzle.words,
              hitCells: hits,
            },
            answer: puzzle.words.join(' · '),
            themeGraphemes: [...bank.graphemes],
          },
        ],
      }
    }
    default:
      return { instruction: 'Complétez.', items: [] }
  }
}
