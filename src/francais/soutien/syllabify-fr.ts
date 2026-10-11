/**
 * Découpe orthographique scolaire (FLE) — syllabes écrites.
 * Ex. : jardinière → jar-di-nière · jeudi → jeu-di · jambe → jam-be
 *
 * Les monosyllabes (un seul noyau vocalique) renvoient un seul segment
 * et doivent être exclus du type 8.
 */

/** Groupes vocaliques oraux / semi-composés (plus longs d’abord). */
const ORAL_VOWEL_GROUPS = [
  'ière',
  'ieres',
  'eau',
  'eaux',
  'aie',
  'aïe',
  'oui',
  'uin',
  'oin',
  'ain',
  'ein',
  'ien',
  'ion',
  'iou',
  'ier',
  'iez',
  'ail',
  'eil',
  'euil',
  'ueil',
  'ère',
  'ére',
  'au',
  'eu',
  'œu',
  'ou',
  'oi',
  'ai',
  'ei',
  'ui',
  'oy',
  'ay',
  'ey',
  'èe',
  'ée',
  'ie',
  'ue',
] as const

/** Nasales : seulement devant consonne ou fin de mot (pas devant voyelle). */
const NASAL_VOWEL_GROUPS = [
  'an',
  'en',
  'in',
  'on',
  'un',
  'am',
  'em',
  'im',
  'om',
  'um',
  'yn',
  'ym',
] as const

/** Digrammes consonantiques inséparables (restent avec la syllabe suivante). */
const CLUSTER_KEEP = new Set([
  'bl',
  'br',
  'cl',
  'cr',
  'dr',
  'fl',
  'fr',
  'gl',
  'gr',
  'pl',
  'pr',
  'tr',
  'vr',
  'ch',
  'ph',
  'th',
  'gn',
  'qu',
  'gu',
  'kh',
])

const VOWEL_CHAR = /[aeiouyàâäéèêëïîôöùûüœæ]/i

type Tok = { text: string; vowel: boolean }

function normalizeWord(raw: string): string {
  return raw
    .trim()
    .normalize('NFC')
    .replace(/['’]/g, '')
    .replace(/\s+/g, '')
}

function isVowelChar(ch: string): boolean {
  return VOWEL_CHAR.test(ch)
}

function startsWithVowel(lower: string, index: number): boolean {
  return isVowelChar(lower[index] ?? '')
}

/** Tokenise en graphèmes (voyelle / consonne). */
function tokenize(word: string): Tok[] {
  const lower = word.toLowerCase()
  const toks: Tok[] = []
  let i = 0
  while (i < word.length) {
    let matched: Tok | null = null

    for (const g of ORAL_VOWEL_GROUPS) {
      if (lower.startsWith(g, i)) {
        matched = { text: word.slice(i, i + g.length), vowel: true }
        break
      }
    }

    if (!matched) {
      for (const g of NASAL_VOWEL_GROUPS) {
        if (!lower.startsWith(g, i)) continue
        const after = i + g.length
        // Nasale annulée devant une voyelle (di-nière, py-ja-ma).
        if (startsWithVowel(lower, after)) continue
        matched = { text: word.slice(i, after), vowel: true }
        break
      }
    }

    if (!matched && lower.startsWith('ill', i)) {
      const prev = toks[toks.length - 1]
      if (prev?.vowel) {
        matched = { text: word.slice(i, i + 3), vowel: true }
      }
    }

    if (!matched && lower.startsWith('gu', i) && /[eiéèê]/i.test(lower[i + 2] ?? '')) {
      matched = { text: word.slice(i, i + 2), vowel: false }
    }

    if (!matched) {
      for (const dig of ['ch', 'ph', 'th', 'gn', 'qu'] as const) {
        if (lower.startsWith(dig, i)) {
          matched = { text: word.slice(i, i + dig.length), vowel: false }
          break
        }
      }
    }

    if (!matched) {
      const ch = word[i]!
      matched = { text: ch, vowel: isVowelChar(ch) }
    }

    toks.push(matched)
    i += matched.text.length
  }
  return toks
}

/**
 * Découpe en syllabes écrites.
 * Retourne au moins un segment (mot entier si monosyllabe / échec).
 */
export function syllabifyFr(raw: string): string[] {
  const word = normalizeWord(raw)
  if (!word) return []
  if (word.includes('-')) {
    return word
      .split('-')
      .flatMap((part) => syllabifyFr(part))
      .filter(Boolean)
  }

  const toks = tokenize(word)
  const vowelIdx = toks.map((t, i) => (t.vowel ? i : -1)).filter((i) => i >= 0)
  if (vowelIdx.length <= 1) {
    return [word]
  }

  const cuts: number[] = []
  for (let v = 0; v < vowelIdx.length - 1; v++) {
    const leftV = vowelIdx[v]!
    const rightV = vowelIdx[v + 1]!
    const between = toks.slice(leftV + 1, rightV)
    if (between.length === 0) {
      cuts.push(rightV)
      continue
    }
    if (between.length === 1) {
      // VCV → V-CV
      cuts.push(leftV + 1)
      continue
    }
    const lastTwo = (
      between[between.length - 2]!.text + between[between.length - 1]!.text
    ).toLowerCase()
    if (CLUSTER_KEEP.has(lastTwo)) {
      cuts.push(rightV - 2)
      continue
    }
    // VC-CV
    cuts.push(rightV - 1)
  }

  const parts: string[] = []
  let start = 0
  for (const cut of cuts) {
    if (cut <= start) continue
    parts.push(toks.slice(start, cut).map((t) => t.text).join(''))
    start = cut
  }
  parts.push(toks.slice(start).map((t) => t.text).join(''))
  return parts.filter(Boolean)
}

/** Vrai si le mot a au moins 2 syllabes écrites. */
export function isMultisyllableFr(raw: string): boolean {
  return syllabifyFr(raw).length >= 2
}

/** Construit un item type 8, ou `null` si monosyllabe. */
export function syllableItemFr(raw: string): { word: string; parts: string[] } | null {
  const word = raw.trim()
  if (!word) return null
  const parts = syllabifyFr(word)
  if (parts.length < 2) return null
  return { word, parts }
}
