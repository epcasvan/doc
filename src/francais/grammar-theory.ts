/** Types et helpers pour les fiches de théorie grammaticale. */

/** Marqueur des exemples : puces rondes, tirets, numéros, ou bordure seule. */
export type TheoryExamplesMarker = 'border' | 'puces' | 'trait' | 'numeros'

export type TheoryExampleItem = string | { text: string; wrong?: string }

export type GrammarTheoryBlock =
  | { kind: 'section'; role: 'regarder' | 'expliquer' | 'retenir'; blocks: GrammarTheoryBlock[] }
  | { kind: 'heading'; text: string; sub?: boolean }
  | { kind: 'paragraph'; text: string }
  | { kind: 'note'; text: string }
  | { kind: 'rule'; text: string; examples?: Array<{ correct: string; wrong?: string }> }
  | {
      kind: 'examples'
      items: TheoryExampleItem[]
      marker?: TheoryExamplesMarker
      border?: boolean
      label?: string
    }
  /** Colonnes alignées. `puce` ajoute une puce dans l’espace de tabulation. */
  | { kind: 'tab'; rows: string[][]; tab?: number; fleche?: boolean; puce?: boolean }
  | { kind: 'list'; title?: string; items: string[] }
  | { kind: 'table'; headers: string[]; rows: string[][]; colHeader?: boolean; rowHeader?: boolean }
  | { kind: 'attention'; text: string }
  | { kind: 'astuce'; text: string }
  /** Coupe manuelle : la suite commence sur la feuille suivante. */
  | { kind: 'page' }

export type GrammarTheoryDoc = {
  id: string
  /** 1-based — libellé « Théorie N ». */
  index: number
  title: string
  sourceSlug: string
  blocks: GrammarTheoryBlock[]
}

export function isGrammarTheoryType(typeId: string): boolean {
  return (
    /^(fr-[a-z]+)-gram-theorie-\d+$/.test(typeId) ||
    /^gram-[a-z0-9]+-theorie$/.test(typeId)
  )
}

/** Gabarit FALC vide : titre, texte, Je regarde, J’explique, astuce, Je retiens, tableau, Attention. */
export function theoryGabarit(title: string): GrammarTheoryBlock[] {
  return [
    { kind: 'heading', text: title },
    { kind: 'paragraph', text: 'À compléter.' },
    { kind: 'heading', text: 'Je regarde', sub: true },
    { kind: 'examples', items: ['À compléter.'] },
    { kind: 'heading', text: 'J’explique', sub: true },
    { kind: 'paragraph', text: 'À compléter.' },
    { kind: 'astuce', text: 'À compléter.' },
    { kind: 'heading', text: 'Je retiens', sub: true },
    { kind: 'paragraph', text: 'À compléter.' },
    {
      kind: 'table',
      colHeader: true,
      rowHeader: true,
      headers: ['', ''],
      rows: [['À compléter.', 'À compléter.']],
    },
    { kind: 'attention', text: 'À compléter.' },
  ]
}

export function exampleItemText(item: TheoryExampleItem): string {
  return typeof item === 'string' ? item : item.text
}

export function exampleItemWrong(item: TheoryExampleItem): string | undefined {
  return typeof item === 'string' ? undefined : item.wrong
}

function stripLead(text: string, re: RegExp): string {
  return text.replace(re, '').replace(/^\s+/, '')
}

/** Aligne les blocs hérités sur les styles unifiés (titre, texte, exemples, tableau, attention, astuce). */
export function normalizeTheoryBlocks(blocks: GrammarTheoryBlock[]): GrammarTheoryBlock[] {
  const out: GrammarTheoryBlock[] = []
  for (const block of blocks) {
    if (block.kind === 'section') {
      out.push({ ...block, blocks: normalizeTheoryBlocks(block.blocks) })
      continue
    }
    if (block.kind === 'rule') {
      const items = (block.examples ?? []).map((ex) =>
        ex.wrong ? { text: ex.correct, wrong: ex.wrong } : ex.correct,
      )
      if (items.length === 0 && block.text.trim() && !/^exemples?$/i.test(block.text.trim())) {
        items.push(block.text.trim())
      }
      out.push({ kind: 'examples', items, marker: 'puces' })
      continue
    }
    if (block.kind === 'list') {
      out.push({
        kind: 'examples',
        items: block.items,
        marker: 'puces',
        label: block.title?.trim() || 'Exemples',
      })
      continue
    }
    if (block.kind === 'note') {
      const raw = block.text.trim()
      if (/^attention\b/i.test(raw)) {
        out.push({
          kind: 'attention',
          text: stripLead(raw, /^attention\s*[!.]?\s*/i),
        })
        continue
      }
      if (/^astuce\b/i.test(raw)) {
        out.push({
          kind: 'astuce',
          text: stripLead(raw, /^astuce\s*[!.:]?\s*/i),
        })
        continue
      }
      if (/^je retiens\s*:/i.test(raw)) {
        out.push({ kind: 'heading', text: 'Je retiens', sub: true })
        const rest = stripLead(raw, /^je retiens\s*:\s*/i)
        if (rest) out.push({ kind: 'paragraph', text: rest })
        continue
      }
      out.push({ kind: 'paragraph', text: raw })
      continue
    }
    if (block.kind === 'table') {
      out.push({
        ...block,
        colHeader: block.colHeader ?? true,
        rowHeader: block.rowHeader ?? true,
      })
      continue
    }
    if (block.kind === 'examples') {
      out.push({
        ...block,
        marker: block.marker ?? 'puces',
        label: block.label?.trim() || 'Exemples',
      })
      continue
    }
    if (block.kind === 'page') {
      out.push(block)
      continue
    }
    if (block.kind === 'paragraph') {
      const parts = block.text
        .split(/\n{2,}/)
        .map((part) => part.trim())
        .filter(Boolean)
      if (parts.length === 0) continue
      const joined = parts.join('\n\n')
      const last = out[out.length - 1]
      if (last?.kind === 'paragraph') {
        out[out.length - 1] = { kind: 'paragraph', text: `${last.text}\n\n${joined}` }
        continue
      }
      out.push({ kind: 'paragraph', text: joined })
      continue
    }
    out.push(block)
  }
  return groupTheorySections(out)
}

function groupTheorySections(blocks: GrammarTheoryBlock[]): GrammarTheoryBlock[] {
  const grouped: GrammarTheoryBlock[] = []
  let section: Extract<GrammarTheoryBlock, { kind: 'section' }> | undefined

  const flush = () => {
    if (!section) return
    grouped.push(section)
    section = undefined
  }

  for (const block of blocks) {
    if (block.kind === 'section') {
      flush()
      grouped.push(block)
      continue
    }
    if (block.kind === 'heading' && block.sub) {
      const heading = block.text.trim().toLocaleLowerCase('fr').replace(/[’]/g, "'")
      const role =
        heading === 'je regarde'
          ? 'regarder'
          : heading === "j'explique"
            ? 'expliquer'
            : heading === 'je retiens'
              ? 'retenir'
              : undefined
      if (role) {
        flush()
        section = { kind: 'section', role, blocks: [] }
        continue
      }
    }
    if (block.kind === 'page' || block.kind === 'heading') {
      flush()
      grouped.push(block)
      continue
    }
    if (section) section.blocks.push(block)
    else grouped.push(block)
  }

  flush()
  return grouped
}
