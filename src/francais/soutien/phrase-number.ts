/**
 * Nombre grammatical des phrases Soutien (sing / plur) — critère banque type 9–14.
 */
import { displayVocabLabel } from '@/francais/display-vocab-label'

export type SoutienPhraseNumber = 'sing' | 'plur'

/**
 * Premier déterminant + nom.
 * Groupes : 1=L’/l’, 2=nom collé | 3=le/la/les/un/une/des, 4=nom.
 */
const DET_RE =
  /(?:^|[\s«"'‘’(])(?:([Ll]['’])(\p{L}[\p{L}'’-]*)|([Ll]es|[Ll]e|[Ll]a|[Uu]ne|[Uu]n|[Dd]es)\s+(\p{L}[\p{L}'’-]*))/gu

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Déterminant immédiatement devant un nom donné (forme sing. ou plur. du nom). */
export function findDetBeforeNoun(
  sentence: string,
  noun: string,
): { det: string; nounForm: string; index: number; end: number } | null {
  const label = displayVocabLabel(noun).trim()
  if (!label || !sentence.trim()) return null
  const n = escapeRe(label)
  const re = new RegExp(
    `(?:^|[\\s«"'‘’(])(?:(([Ll]['’])(${n}s?))|(([Ll]es|[Ll]e|[Ll]a|[Uu]ne|[Uu]n|[Dd]es))\\s+(${n}s?))(?![\\p{L}])`,
    'iu',
  )
  const m = re.exec(sentence)
  if (!m || m.index === undefined) return null
  const det = (m[2] ?? m[4])!
  const nounForm = (m[3] ?? m[5])!
  const detStart = m.index + m[0].indexOf(det)
  return { det, nounForm, index: detStart, end: detStart + det.length }
}

export function numberFromDet(det: string, nounForm: string, lemma: string): SoutienPhraseNumber {
  if (/^(les|des)$/i.test(det.trim())) return 'plur'
  const lemmaLower = displayVocabLabel(lemma).toLocaleLowerCase('fr-FR')
  const formLower = nounForm.toLocaleLowerCase('fr-FR')
  if (formLower !== lemmaLower && formLower.startsWith(lemmaLower)) return 'plur'
  return 'sing'
}

/** Infère sing/plur pour une entrée type 9 (mot cible connu). */
export function inferNumberForWordPhrase(
  sentence: string,
  word: string,
): SoutienPhraseNumber | undefined {
  const hit = findDetBeforeNoun(sentence, word)
  if (!hit) return undefined
  return numberFromDet(hit.det, hit.nounForm, word)
}

/** Premier nom précédé d’un déterminant (pour aligner la syntaxe type 12 sur type 9). */
export function inferFirstNoun(sentence: string): string | undefined {
  DET_RE.lastIndex = 0
  const m = DET_RE.exec(sentence)
  if (!m) return undefined
  const noun = (m[2] ?? m[4])?.trim()
  return noun || undefined
}

/**
 * Infère sing/plur pour une phrase sans mot cible :
 * premier déterminant de la phrase (Les… → plur, sinon sing si trouvé).
 */
export function inferNumberForSentence(sentence: string): SoutienPhraseNumber | undefined {
  DET_RE.lastIndex = 0
  const m = DET_RE.exec(sentence)
  if (!m) return undefined
  const det = (m[1] ?? m[3])!
  if (/^(les|des)$/i.test(det)) return 'plur'
  return 'sing'
}

export function parsePhraseNumber(v: unknown): SoutienPhraseNumber | undefined {
  if (v === 'sing' || v === 'singular') return 'sing'
  if (v === 'plur' || v === 'plural') return 'plur'
  return undefined
}
