/**
 * Découpe orthographique scolaire (FLE) — syllabes écrites.
 * Ex. : jardinière → jar-di-nière · baleine → ba-lei-ne · beurre → beu-re
 *
 * Les monosyllabes (un seul noyau vocalique) renvoient un seul segment
 * et doivent être exclus du type 8 (ex. balle, bille).
 */

/** Groupes vocaliques oraux / semi-composés (plus longs d’abord). Sans nasales ain/ein/oin. */
const ORAL_VOWEL_GROUPS = [
  'ière',
  'ieres',
  'eau',
  'eaux',
  'aie',
  'aïe',
  'oui',
  'uin',
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

/**
 * Nasales : seulement devant consonne ou fin de mot (pas devant voyelle).
 * Ain/ein/oin ici pour éviter ba-lein-e → ba-lei-ne.
 */
const NASAL_VOWEL_GROUPS = [
  'ain',
  'ein',
  'oin',
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

/** Voyelle écrite « digraphe » (eu, ou…) — utile pour beurre → beu-re. */
const DIGRAPH_VOWELS = new Set([
  'au',
  'eau',
  'eaux',
  'eu',
  'œu',
  'ou',
  'oi',
  'ai',
  'ei',
  'ui',
  'ay',
  'oy',
  'ey',
  'ain',
  'ein',
  'oin',
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
  'ien',
  'ion',
])

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
        // Nasale annulée devant une voyelle (ba-lei-ne, di-nière).
        if (startsWithVowel(lower, after)) continue
        // Nasale annulée devant géminée + e (pomme, femme, bonne…).
        const nasalCoda = g[g.length - 1]!
        if (
          lower[after] === nasalCoda &&
          (lower[after + 1] === 'e' || lower[after + 1] === 'es')
        ) {
          continue
        }
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

function isMuteE(tok: Tok | undefined): boolean {
  if (!tok?.vowel) return false
  return tok.text.toLowerCase() === 'e'
}

function isSimpleVowelLetter(tok: Tok): boolean {
  return tok.vowel && tok.text.length === 1 && !/[éèêëàâäùûüïîôö]/i.test(tok.text)
}

/**
 * Mot type balle / bille / pomme : voyelle simple + géminée + e muet → 1 syllabe.
 * Mot type beurre : digraphe + géminée + e → V-Ce (beu-re).
 */
function tryGeminateMuteE(word: string, toks: Tok[]): string[] | null {
  if (toks.length < 4) return null
  const last = toks[toks.length - 1]
  if (!isMuteE(last)) return null
  const c2 = toks[toks.length - 2]
  const c1 = toks[toks.length - 3]
  if (!c1 || !c2 || c1.vowel || c2.vowel) return null
  if (c1.text.toLowerCase() !== c2.text.toLowerCase()) return null
  // Cherche la dernière voyelle avant la géminée.
  let vIdx = -1
  for (let i = toks.length - 4; i >= 0; i--) {
    if (toks[i]!.vowel) {
      vIdx = i
      break
    }
  }
  if (vIdx < 0) return null
  // Pas d’autre voyelle avant → mono ou bi selon digraphe.
  const earlierVowels = toks.slice(0, vIdx).filter((t) => t.vowel)
  if (earlierVowels.length > 0) return null

  const vowelTok = toks[vIdx]!
  if (isSimpleVowelLetter(vowelTok) || vowelTok.text.length === 1) {
    // balle, bille, botte, pomme…
    return [word]
  }
  if (DIGRAPH_VOWELS.has(vowelTok.text.toLowerCase()) || vowelTok.text.length > 1) {
    // beurre → beu-re (géminée fondue en une consonne)
    const first = toks
      .slice(0, vIdx + 1)
      .map((t) => t.text)
      .join('')
    const second = c1.text[0]! + last!.text
    // Conserver la casse du mot d’origine au mieux.
    const a = word.slice(0, first.length)
    const b = word.slice(word.length - second.length)
    return [a, b]
  }
  return null
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

  const geminate = tryGeminateMuteE(word, toks)
  if (geminate) return geminate

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
    // VC-CV (bal-lon, ter-re si non capté plus haut)
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

/** Découpages scolaires imposés (exceptions). */
const SYLLABLE_OVERRIDES: Record<string, string[]> = {
  calculatrice: ['cal', 'cu', 'la', 'trice'],
  chandelier: ['chan', 'de', 'lier'],
}

/** Construit un item type 8, ou `null` si monosyllabe. */
export function syllableItemFr(raw: string): { word: string; parts: string[] } | null {
  const word = raw.trim()
  if (!word) return null
  const key = word.toLowerCase()
  const override = SYLLABLE_OVERRIDES[key]
  const parts = override ?? syllabifyFr(word)
  if (parts.length < 2) return null
  return { word, parts }
}
