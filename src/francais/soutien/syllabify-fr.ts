/**
 * Découpe en syllabes orales (FLE) — noyaux vocaliques entendus.
 * Ex. : famille → fa-mille · billard → bi-liard · baleine → ba-leine
 *
 * Les monosyllabes (un seul noyau) renvoient un seul segment
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

    // -ill / -ille : /ij/ (noyau) si précédé d’une consonne (fille, famille, billard…).
    if (!matched && lower.startsWith('ill', i)) {
      const prev = toks[toks.length - 1]
      if (prev && !prev.vowel) {
        matched = { text: word.slice(i, i + 3), vowel: true }
      } else if (prev?.vowel) {
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
  let vIdx = -1
  for (let i = toks.length - 4; i >= 0; i--) {
    if (toks[i]!.vowel) {
      vIdx = i
      break
    }
  }
  if (vIdx < 0) return null
  const earlierVowels = toks.slice(0, vIdx).filter((t) => t.vowel)
  if (earlierVowels.length > 0) return null

  const vowelTok = toks[vIdx]!
  if (isSimpleVowelLetter(vowelTok) || vowelTok.text.length === 1) {
    return [word]
  }
  if (DIGRAPH_VOWELS.has(vowelTok.text.toLowerCase()) || vowelTok.text.length > 1) {
    const first = toks
      .slice(0, vIdx + 1)
      .map((t) => t.text)
      .join('')
    const second = c1.text[0]! + last!.text
    const a = word.slice(0, first.length)
    const b = word.slice(word.length - second.length)
    return [a, b]
  }
  return null
}

/** E muet final (e / es) : pas un noyau oral. */
function isTrailingMuteE(toks: Tok[], index: number): boolean {
  const tok = toks[index]
  if (!tok || !isMuteE(tok)) return false
  // Dernier token, ou avant un « s » final seul.
  if (index === toks.length - 1) return true
  if (
    index === toks.length - 2 &&
    !toks[index + 1]!.vowel &&
    toks[index + 1]!.text.toLowerCase() === 's'
  ) {
    return true
  }
  return false
}

/**
 * Noyaux vocaliques oraux (ignore e muet final).
 * Pour -ill(e) traité comme noyau /ij/.
 */
function oralVowelIndices(toks: Tok[]): number[] {
  const out: number[] = []
  for (let i = 0; i < toks.length; i++) {
    if (!toks[i]!.vowel) continue
    if (isTrailingMuteE(toks, i)) continue
    out.push(i)
  }
  return out
}

/**
 * Découpe en syllabes orales.
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

  const key = word.toLowerCase()
  const override = SYLLABLE_OVERRIDES[key]
  if (override) return [...override]

  const toks = tokenize(word)

  const geminate = tryGeminateMuteE(word, toks)
  if (geminate) return geminate

  const vowelIdx = oralVowelIndices(toks)
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
    // Géminée (ll, nn…) : V-CV oral — la géminée part avec la 2ᵉ syllabe.
    // billard : b + i | ll + a + rd → puis normalisation liard.
    if (
      between.length >= 2 &&
      !between[0]!.vowel &&
      !between[1]!.vowel &&
      between[0]!.text.toLowerCase() === between[1]!.text.toLowerCase()
    ) {
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

  return normalizeOralParts(parts.filter(Boolean))
}

/** Ajuste l’écriture pédagogique (bi-llard → bi-liard, etc.). */
function normalizeOralParts(parts: string[]): string[] {
  if (parts.length < 2) return parts
  const out = [...parts]
  for (let i = 1; i < out.length; i++) {
    const prev = out[i - 1]!
    const cur = out[i]!
    const curLo = cur.toLowerCase()
    // llard / llon / lle… après voyelle seule : une seule consonne + glisse i si besoin.
    if (/^llard$/i.test(curLo)) {
      out[i] = cur[0] === 'L' ? 'Liard' : 'liard'
      if (/l$/i.test(prev) && prev.length > 1) {
        out[i - 1] = prev.slice(0, -1)
      }
      continue
    }
    if (/^llon$/i.test(curLo)) {
      out[i] = cur[0] === 'L' ? 'Llon' : 'llon'
      continue
    }
    // Géminée en tête de syllabe après coupe V-CC : garder les deux lettres (mille, nexe…).
  }
  return out.filter(Boolean)
}

/** Vrai si le mot a au moins 2 syllabes orales. */
export function isMultisyllableFr(raw: string): boolean {
  return syllabifyFr(raw).length >= 2
}

/**
 * Découpages oraux imposés (exceptions / glides).
 * Clé = mot normalisé minuscule.
 */
const SYLLABLE_OVERRIDES: Record<string, string[]> = {
  famille: ['fa', 'mille'],
  billard: ['bi', 'liard'],
  baleine: ['ba', 'leine'],
  salade: ['sa', 'lade'],
  papillon: ['pa', 'pi', 'llon'],
  armoire: ['ar', 'moire'],
  parapluie: ['pa', 'ra', 'pluie'],
  automne: ['au', 'tomne'],
  asperge: ['as', 'perge'],
  astéroïde: ['as', 'té', 'roïde'],
  asteroid: ['as', 'té', 'roïde'],
  chandelier: ['chan', 'de', 'lier'],
  calculatrice: ['cal', 'cu', 'la', 'trice'],
  annexe: ['a', 'nnexe'],
  avocat: ['a', 'vo', 'cat'],
  avion: ['a', 'vion'],
  aliment: ['a', 'li', 'ment'],
  atlas: ['at', 'las'],
  basketball: ['bas', 'ket', 'ball'],
  bague: ['ba', 'gue'],
  fille: ['fille'],
  bille: ['bille'],
  ville: ['ville'],
  balle: ['balle'],
  pomme: ['pomme'],
  femme: ['femme'],
  bonne: ['bonne'],
  terre: ['terre'],
  beurre: ['beu', 're'],
  jardin: ['jar', 'din'],
  jardinière: ['jar', 'di', 'nière'],
  fenêtre: ['fe', 'nêtre'],
  étoile: ['é', 'toile'],
  école: ['é', 'cole'],
  orange: ['o', 'range'],
  oreille: ['o', 'reille'],
  oiseau: ['oi', 'seau'],
  maison: ['mai', 'son'],
  fromage: ['fro', 'mage'],
  tomate: ['to', 'mate'],
  banane: ['ba', 'nane'],
  ananas: ['a', 'na', 'nas'],
  animal: ['a', 'ni', 'mal'],
  aquarium: ['a', 'qua', 'rium'],
  araignée: ['a', 'rai', 'gnée'],
  abeille: ['a', 'beille'],
  appareil: ['a', 'ppa', 'reil'],
  appartement: ['a', 'ppar', 'te', 'ment'],
  aspirateur: ['a', 'spi', 'ra', 'teur'],
  allumette: ['a', 'llu', 'mette'],
  alligator: ['a', 'lli', 'ga', 'tor'],
  ambulance: ['am', 'bu', 'lance'],
  ampoule: ['am', 'poule'],
  andouille: ['an', 'douille'],
  angine: ['an', 'gine'],
  antenne: ['an', 'tenne'],
  appareilphoto: ['a', 'ppa', 'reil'],
}

/** Construit un item type 8, ou `null` si monosyllabe. */
export function syllableItemFr(raw: string): { word: string; parts: string[] } | null {
  const word = raw.trim()
  if (!word) return null
  const parts = syllabifyFr(word)
  if (parts.length < 2) return null
  return { word, parts }
}
