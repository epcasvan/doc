import type { ReactNode } from 'react'
import { Fragment } from 'react'

/** `{g}…{/g}` gras · `{c}…{/c}` couleur · `{s}…{/s}` souligné · `{ligne}` / `{ligne/2}` · `{tab:N}` / `{tab:N>}`. */
const MARK = /\{(g|c|s)\}([\s\S]*?)\{\/\1\}/g
const LIGNE = /\{ligne(\/2)?\}/gi
const TAB = /\{tab:(\d+)(?:\s*(>|fleche))?\}/gi

type TabRow = { n: number; arrow: boolean; cells: string[] }
type TheoryPiece = { kind: 'text'; text: string } | { kind: 'tabs'; rows: TabRow[] }
type TheorySegment = { gap: true; half: boolean } | { gap: false; text: string }

export function theoryHasLigne(text: string): boolean {
  return /\{ligne(?:\/2)?\}/i.test(text)
}

/** Découpe le texte autour de `{ligne}` et `{ligne/2}`. */
export function theorySegments(text: string): TheorySegment[] {
  const out: TheorySegment[] = []
  let cursor = 0
  for (const match of text.matchAll(new RegExp(LIGNE.source, 'gi'))) {
    const start = match.index ?? 0
    const chunk = text.slice(cursor, start)
    if (chunk.trim()) out.push({ gap: false, text: chunk.trim() })
    out.push({ gap: true, half: Boolean(match[1]) })
    cursor = start + match[0].length
  }
  const remaining = text.slice(cursor)
  if (remaining.trim()) out.push({ gap: false, text: remaining.trim() })
  return out
}

export function TheoryLigne({ half = false }: { half?: boolean }) {
  return <div className={`theory-ligne${half ? ' is-half' : ''}`} aria-hidden="true" />
}

/** Découpe le texte courant et les lignes `{tab:N}` / `{tab:N>}`. */
function theoryPieces(text: string): TheoryPiece[] {
  const matches = [...text.matchAll(new RegExp(TAB.source, 'gi'))]
  if (matches.length === 0) return [{ kind: 'text', text }]
  const pieces: TheoryPiece[] = []
  let cursor = 0
  let rows: TabRow[] = []
  const flushRows = () => {
    if (rows.length === 0) return
    pieces.push({ kind: 'tabs', rows })
    rows = []
  }
  matches.forEach((match, index) => {
    const start = match.index ?? 0
    const before = text.slice(cursor, start)
    if (before.trim()) {
      flushRows()
      pieces.push({ kind: 'text', text: before.trim() })
    }
    const end = index + 1 < matches.length ? (matches[index + 1]?.index ?? text.length) : text.length
    const cells = text
      .slice(start + match[0].length, end)
      .trim()
      .split(',')
      .map((cell) => cell.trim())
    rows.push({
      n: Math.max(1, Number(match[1]) || 1),
      arrow: Boolean(match[2]),
      cells,
    })
    cursor = end
  })
  flushRows()
  if (cursor < text.length && text.slice(cursor).trim()) {
    pieces.push({ kind: 'text', text: text.slice(cursor).trim() })
  }
  return pieces
}

function TheoryTabs({ rows }: { rows: TabRow[] }) {
  const cols = Math.max(...rows.map((row) => row.cells.length), 1)
  return (
    <table className="theory-tabs">
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {Array.from({ length: cols }, (_, cellIndex) => (
              <Fragment key={cellIndex}>
                {cellIndex > 0 ? (
                  <td
                    className={`theory-tab${row.arrow ? ' is-arrow' : ''}`}
                    style={{ width: `${row.n * 2}em`, minWidth: `${row.n * 2}em` }}
                    aria-hidden="true"
                  />
                ) : null}
                <td className="theory-tab-cell">
                  <TheoryRichText text={row.cells[cellIndex] ?? ''} />
                </td>
              </Fragment>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/** Rendu du contenu tabulé inline, utilisable dans un paragraphe ou un exemple. */
export function TheoryInlineContent({ text }: { text: string }) {
  return (
    <>
      {theoryPieces(text).map((piece, index) =>
        piece.kind === 'tabs' ? (
          <TheoryTabs key={index} rows={piece.rows} />
        ) : (
          <span key={index}>
            <TheoryRichText text={piece.text} />
          </span>
        ),
      )}
    </>
  )
}

/** Paragraphes séparés par `{ligne}` / `{ligne/2}`, colonnes par `{tab:N}`. */
export function TheoryFlow({ text, className }: { text: string; className?: string }) {
  const segments = theorySegments(text)
  if (segments.length === 0) return null
  return (
    <>
      {segments.map((segment, index) => {
        if (segment.gap) return <TheoryLigne key={index} half={segment.half} />
        return theoryPieces(segment.text).map((piece, pieceIndex) =>
          piece.kind === 'tabs' ? (
            <TheoryTabs key={`${index}-${pieceIndex}`} rows={piece.rows} />
          ) : (
            <p key={`${index}-${pieceIndex}`} className={className}>
              <TheoryRichText text={piece.text} />
            </p>
          ),
        )
      })}
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
