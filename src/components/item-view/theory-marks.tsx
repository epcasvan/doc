import type { ReactNode } from 'react'
import { Fragment } from 'react'

/** `{g}…{/g}` gras · `{c}…{/c}` couleur · `{s}…{/s}` souligné · `/n` retour · `{ligne}` / `{ligne/N}` · après `{tab:N}`, `+` vide, `>` flèche, `<` puce, `-` tiret, dans l’ordre des colonnes. */
const MARK = /\{(g|c|s)\}([\s\S]*?)\{\/\1\}|\/n/g
const LIGNE = /\{ligne(?:\/([234]))?\}/gi
const TAB = /\{tab:(\d+)(?:\s*(\+*[><-]+|fleche))?(?:\s*(puce))?\}/gi

type TheoryTabMarker = 'arrow' | 'bullet' | 'trait' | null
export type TheoryTabRow = { n: number; markers: TheoryTabMarker[]; cells: string[] }
type TheoryPiece = { kind: 'text'; text: string } | { kind: 'tabs'; rows: TheoryTabRow[] }
type TheorySegment = { gap: true; divisor: 1 | 2 | 3 | 4 } | { gap: false; text: string }

export function theoryHasLigne(text: string): boolean {
  return /\{ligne(?:\/[234])?\}/i.test(text)
}

/** Découpe le texte autour de `{ligne}` et `{ligne/2}`, `/3` ou `/4`. */
export function theorySegments(text: string): TheorySegment[] {
  const out: TheorySegment[] = []
  let cursor = 0
  for (const match of text.matchAll(new RegExp(LIGNE.source, 'gi'))) {
    const start = match.index ?? 0
    const chunk = text.slice(cursor, start)
    if (chunk.trim()) out.push({ gap: false, text: chunk.trim() })
    const divisor = match[1] === '2' ? 2 : match[1] === '3' ? 3 : match[1] === '4' ? 4 : 1
    out.push({ gap: true, divisor })
    cursor = start + match[0].length
  }
  const remaining = text.slice(cursor)
  if (remaining.trim()) out.push({ gap: false, text: remaining.trim() })
  return out
}

export function TheoryLigne({ divisor = 1 }: { divisor?: 1 | 2 | 3 | 4 }) {
  const sizeClass =
    divisor === 2 ? ' is-half' : divisor === 3 ? ' is-third' : divisor === 4 ? ' is-quarter' : ''
  return <div className={`theory-ligne${sizeClass}`} aria-hidden="true" />
}

/** Découpe les cellules séparées par `|` après `{tab:N}` (virgule héritée tolérée). */
function theoryPieces(text: string): TheoryPiece[] {
  const matches = [...text.matchAll(new RegExp(TAB.source, 'gi'))]
  if (matches.length === 0) return [{ kind: 'text', text }]
  const pieces: TheoryPiece[] = []
  let cursor = 0
  let rows: TheoryTabRow[] = []
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
    const rowText = text.slice(start + match[0].length, end).trim()
    const cells = rowText
      .split(rowText.includes('|') ? '|' : ',')
      .map((cell) => cell.trim())
    const markerSequence = match[2]?.toLowerCase() === 'fleche' ? '>' : match[2] ?? (match[3] ? '<' : '')
    const markers = [...markerSequence].map((symbol): TheoryTabMarker =>
      symbol === '>' ? 'arrow' : symbol === '<' ? 'bullet' : symbol === '-' ? 'trait' : null,
    )
    rows.push({ n: Math.max(1, Number(match[1]) || 1), markers, cells })
    cursor = end
  })
  flushRows()
  if (cursor < text.length && text.slice(cursor).trim()) {
    pieces.push({ kind: 'text', text: text.slice(cursor).trim() })
  }
  return pieces
}

export function theoryTabRows(text: string): TheoryTabRow[] | null {
  const pieces = theoryPieces(text)
  return pieces.length === 1 && pieces[0]?.kind === 'tabs' ? pieces[0].rows : null
}

export function TheoryTabs({
  rows,
  marker,
}: {
  rows: TheoryTabRow[]
  marker?: 'puces' | 'numeros' | 'trait'
}) {
  const cols = Math.max(...rows.map((row) => row.cells.length), 1)
  const hasMarkers = rows.some((row) => row.markers.some((tabMarker) => tabMarker !== null))
  return (
    <table className={`theory-tabs${marker ? ` is-${marker}` : ''}${hasMarkers ? ' is-marked' : ''}`}>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {marker ? <td className="theory-tab-marker" aria-hidden="true" /> : null}
            {Array.from({ length: cols }, (_, cellIndex) => (
              <Fragment key={cellIndex}>
                {cellIndex > 0 ? (
                  <td
                    className={`theory-tab${row.markers[cellIndex - 1] ? ` is-${row.markers[cellIndex - 1]}` : ''}`}
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

/** Paragraphes séparés par `{ligne}` / `{ligne/N}`, colonnes par `{tab:N}`. */
export function TheoryFlow({ text, className }: { text: string; className?: string }) {
  const segments = theorySegments(text)
  if (segments.length === 0) return null
  return (
    <>
      {segments.map((segment, index) => {
        if (segment.gap) return <TheoryLigne key={index} divisor={segment.divisor} />
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
  puce = false,
}: {
  rows: string[][]
  tab?: number
  fleche?: boolean
  puce?: boolean
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
                    className={`theory-tab${fleche ? ' is-arrow' : puce ? ' is-bullet' : ''}`}
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
    if (match[0] === '/n') {
      nodes.push(<br key={key} />)
      key += 1
      last = start + match[0].length
      continue
    }
    const kind = match[1]
    const inner = match[2] ?? ''
    const className =
      kind === 'g' ? 'theory-mark-bold' : kind === 'c' ? 'theory-mark-theme' : 'theory-mark-under'
    nodes.push(
      <span key={key} className={className}>
        {inner.split('/n').map((part, index) => (
          <Fragment key={index}>
            {index > 0 ? <br /> : null}
            {part}
          </Fragment>
        ))}
      </span>,
    )
    key += 1
    last = start + match[0].length
  }
  if (last < text.length) nodes.push(text.slice(last))
  if (nodes.length === 0) return text
  return <>{nodes}</>
}
