import type { ReactNode } from 'react'
import { Fragment } from 'react'

/** `{g}…{/g}` gras · `{c}…{/c}` couleur · `{s}…{/s}` souligné · `{ligne}` ligne vide. */
const MARK = /\{(g|c|s)\}([\s\S]*?)\{\/\1\}/g
const LIGNE = /\{ligne\}/gi

export function theoryHasLigne(text: string): boolean {
  return /\{ligne\}/i.test(text)
}

/** Découpe le texte autour de chaque `{ligne}`. */
export function theorySegments(text: string): Array<{ gap: true } | { gap: false; text: string }> {
  const parts = text.split(LIGNE)
  const out: Array<{ gap: true } | { gap: false; text: string }> = []
  for (let i = 0; i < parts.length; i++) {
    if (i > 0) out.push({ gap: true })
    const chunk = parts[i] ?? ''
    if (chunk.trim()) out.push({ gap: false, text: chunk.trim() })
  }
  return out
}

export function TheoryLigne() {
  return <div className="theory-ligne" aria-hidden="true" />
}

/** Paragraphes séparés par une ligne vide `{ligne}`. */
export function TheoryFlow({ text, className }: { text: string; className?: string }) {
  const segments = theorySegments(text)
  if (segments.length === 0) return null
  return (
    <>
      {segments.map((segment, index) =>
        segment.gap ? (
          <TheoryLigne key={index} />
        ) : (
          <p key={index} className={className}>
            <TheoryRichText text={segment.text} />
          </p>
        ),
      )}
    </>
  )
}

/** Bloc `tab` : `rows` comme un tableau, sans bordures. */
export function TheoryTabBlock({
  rows,
  tab = 1,
  fleche = false,
}: {
  rows: string[][]
  tab?: number
  fleche?: boolean
}) {
  const cols = Math.max(...rows.map((row) => row.length), 1)
  const width = `${Math.max(1, tab) * 2}em`
  return (
    <table className="theory-tabs">
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {Array.from({ length: cols }, (_, cellIndex) => (
              <Fragment key={cellIndex}>
                {cellIndex > 0 ? (
                  <td
                    className={`theory-tab${fleche ? ' is-arrow' : ''}`}
                    style={{ width, minWidth: width }}
                    aria-hidden="true"
                  />
                ) : null}
                <td className="theory-tab-cell">
                  <TheoryRichText text={row[cellIndex] ?? ''} />
                </td>
              </Fragment>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

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
