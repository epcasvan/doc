import type { ReactNode } from 'react'

/** `{g}…{/g}` gras · `{c}…{/c}` gras + couleur du thème · `{s}…{/s}` souligné couleur du thème. */
const MARK = /\{(g|c|s)\}([\s\S]*?)\{\/\1\}/g

export function TheoryRichText({ text }: { text: string }) {
  const nodes: ReactNode[] = []
  let last = 0
  let key = 0
  for (const match of text.matchAll(MARK)) {
    const start = match.index ?? 0
    if (start > last) nodes.push(text.slice(last, start))
    const kind = match[1]
    const inner = match[2] ?? ''
    const className =
      kind === 'g' ? 'theory-mark-bold' : kind === 'c' ? 'theory-mark-theme' : 'theory-mark-under'
    nodes.push(
      <span key={key} className={className}>
        {inner}
      </span>,
    )
    key += 1
    last = start + match[0].length
  }
  if (last < text.length) nodes.push(text.slice(last))
  if (nodes.length === 0) return text
  return <>{nodes}</>
}
