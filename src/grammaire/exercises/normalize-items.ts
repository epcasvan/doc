import type { GramBankItem } from './types'

const BLANK = '___'

const IRREGULAR_INFINITIVES = new Set([
  'être',
  'avoir',
  'aller',
  'faire',
  'dire',
  'venir',
  'tenir',
  'voir',
  'savoir',
  'pouvoir',
  'vouloir',
  'devoir',
  'falloir',
  'prendre',
  'mettre',
  'partir',
  'sortir',
  'ouvrir',
  'lire',
  'écrire',
  'boire',
  'croire',
  'connaître',
  'naître',
  'vivre',
  'suivre',
  'appeler',
  "s'appeler",
  's’appeler',
])

const PAREN_VERB_RE = /___\s*\(\s*([^)]+?)\s*\)/g

export function countBlanks(prompt: string): number {
  return prompt.split(BLANK).length - 1
}

export function splitAnswerParts(answer: string): string[] {
  return answer
    .split(/\s*\/\s*/)
    .map((part) => part.trim())
    .filter(Boolean)
}

function unique(values: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const value of values) {
    const key = value.trim()
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(key)
  }
  return out
}

export function looksLikeInfinitive(raw: string): boolean {
  const word = raw
    .trim()
    .toLowerCase()
    .replace(/’/g, "'")
  if (!word) return false
  if (IRREGULAR_INFINITIVES.has(word)) return true
  const bare = word.replace(/^s'/, '').replace(/^se\s+/, '')
  if (IRREGULAR_INFINITIVES.has(bare)) return true
  return /(?:er|ir|re|oir)$/i.test(bare)
}

export function extractParenVerb(
  prompt: string,
): { verb: string; extra: string; negatif: boolean } | null {
  const matches = [...prompt.matchAll(PAREN_VERB_RE)]
  if (matches.length !== 1) return null
  const inner = matches[0]![1]!.trim()
  const [rawVerb, ...flags] = inner.split(',').map((part) => part.trim())
  if (!rawVerb || !looksLikeInfinitive(rawVerb)) return null
  const extra = flags.join(', ')
  const negatif = flags.some((flag) => /négatif/i.test(flag))
  return { verb: rawVerb, extra, negatif }
}

export function stripParenVerb(prompt: string): string {
  return prompt
    .replace(/___\s*\(\s*[^)]+?\s*\)/g, BLANK)
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+\./g, '.')
    .trim()
}

export function uniqueSampleVerb(
  items: GramBankItem[],
): { verb: string; negatif: boolean } | null {
  if (items.length === 0) return null
  const found = items.map((item) => extractParenVerb(item.prompt)).filter((row) => row != null)
  if (found.length === 0) return null
  const verbs = new Set(found.map((row) => row.verb.toLowerCase().replace(/’/g, "'")))
  if (verbs.size !== 1) return null
  return {
    verb: found[0]!.verb,
    negatif: found.every((row) => row.negatif),
  }
}

export function instructionForSingleVerb(
  base: string,
  verb: { verb: string; negatif: boolean },
): string {
  const conj = `Conjuguez le verbe ${verb.verb}${verb.negatif ? ' à la forme négative' : ''}.`
  if (/entre parenthèses/i.test(base)) return conj
  const escaped = verb.verb.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  if (new RegExp(escaped, 'i').test(base) && !/\bou\b/i.test(base)) return base.trim()
  const extra = base
    .replace(/conjuguez[^.]*\.?/i, '')
    .replace(/complétez[^.]*\.?/i, '')
    .trim()
  if (extra && extra.length < 80 && /attention/i.test(extra)) return `${conj} ${extra}`
  return conj
}

function capitalizeIfNeeded(word: string, before: string): string {
  if (!word) return word
  if (!/(?:^|[.!?…]\s*)$/.test(before)) return word
  return word.charAt(0).toLocaleUpperCase('fr-FR') + word.slice(1)
}

/** Une phrase = une réponse : chaque ___ devient un item. */
export function splitSingleAnswers(item: GramBankItem): GramBankItem[] {
  const blankCount = countBlanks(item.prompt)
  if (blankCount <= 1) return [item]
  const parts = splitAnswerParts(item.answer)
  if (parts.length !== blankCount) return [item]

  const optionParts = (item.options ?? []).map((option) => splitAnswerParts(option))
  const canSplitOptions =
    !item.options?.length || optionParts.every((row) => row.length === blankCount)

  const out: GramBankItem[] = []
  const segments = item.prompt.split(BLANK)
  for (let index = 0; index < blankCount; index++) {
    const prompt = segments
      .map((segment, edge) => {
        if (edge === blankCount) return segment
        const piece = edge === index ? BLANK : capitalizeIfNeeded(parts[edge]!, segment)
        return `${segment}${piece}`
      })
      .join('')
    const answer = parts[index]!
    let options: string[] | undefined
    if (canSplitOptions && item.options?.length) {
      const splitOpts = unique(optionParts.map((row) => row[index] ?? '').filter(Boolean))
      if (!splitOpts.includes(answer)) splitOpts.unshift(answer)
      options = splitOpts.length >= 2 ? splitOpts : undefined
    }
    out.push({ ...item, prompt, answer, options })
  }
  return out
}

export function normalizeGramBank(items: GramBankItem[]): GramBankItem[] {
  return items.flatMap(splitSingleAnswers)
}
