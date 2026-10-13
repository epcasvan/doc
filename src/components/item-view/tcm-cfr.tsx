import { useMemo } from 'react'
import type { MathItem, PreviewMode } from '@/math/types'
import { mirrorPoint, type GridPt } from '@/tcm-cfr/symetrie'

/**
 * Dictée audio TCM CFR (ex. 1–2) : uniquement la zone de réponse sur la fiche.
 * Écoute / téléchargement via le bouton de la barre d’aperçu (à côté de Générer).
 */
export function AudioDictationBlock({
  item,
  mode,
}: {
  item: MathItem
  mode: PreviewMode
}) {
  const show = mode === 'answers'
  return (
    <div className="tcm-cfr-audio-dictation">
      <span className={`answer-line-field ${show ? 'filled' : ''}`}>
        {show ? item.answer : '\u00a0'}
      </span>
    </div>
  )
}

function toSvg(p: GridPt, cols: number, rows: number, size: number, pad: number) {
  const cell = (size - 2 * pad) / Math.max(cols, rows)
  return {
    x: pad + p.x * cell,
    y: pad + (rows - p.y) * cell,
  }
}

export function SymmetryGridBlock({
  item,
  mode,
}: {
  item: MathItem
  mode: PreviewMode
}) {
  const show = mode === 'answers'
  const tpl = item.symmetryFigure
  const mirrorPolys = useMemo(() => {
    if (!tpl) return []
    return tpl.polylines.map((poly) => poly.map((p) => mirrorPoint(p, tpl.axisX)))
  }, [tpl])
  if (!tpl) return null
  const size = 280
  const pad = 12
  const cell = (size - 2 * pad) / Math.max(tpl.cols, tpl.rows)
  const axisColor = 'var(--purple, #5b3a8c)'

  const drawPoly = (poly: GridPt[], key: string, className: string) => {
    if (poly.length === 0) return null
    const d = poly
      .map((p, i) => {
        const s = toSvg(p, tpl.cols, tpl.rows, size, pad)
        return `${i === 0 ? 'M' : 'L'}${s.x},${s.y}`
      })
      .join(' ')
    return <path key={key} d={d} className={className} fill="none" />
  }

  return (
    <div className="tcm-cfr-symmetry">
      {item.prompt ? <p className="column-prompt">{item.prompt}</p> : null}
      <svg
        className="tcm-cfr-symmetry-svg"
        viewBox={`0 0 ${size} ${size * (tpl.rows / tpl.cols)}`}
        role="img"
        aria-label="Quadrillage de symétrie axiale"
      >
        {Array.from({ length: tpl.cols + 1 }, (_, i) => {
          const x = pad + i * cell
          return (
            <line
              key={`v${i}`}
              x1={x}
              y1={pad}
              x2={x}
              y2={pad + tpl.rows * cell}
              className="tcm-cfr-grid-line"
            />
          )
        })}
        {Array.from({ length: tpl.rows + 1 }, (_, j) => {
          const y = pad + j * cell
          return (
            <line
              key={`h${j}`}
              x1={pad}
              y1={y}
              x2={pad + tpl.cols * cell}
              y2={y}
              className="tcm-cfr-grid-line"
            />
          )
        })}
        <line
          x1={pad + tpl.axisX * cell}
          y1={pad}
          x2={pad + tpl.axisX * cell}
          y2={pad + tpl.rows * cell}
          stroke={axisColor}
          strokeWidth={2.5}
        />
        {tpl.polylines.map((poly, i) => drawPoly(poly, `src-${i}`, 'tcm-cfr-figure-line'))}
        {show
          ? mirrorPolys.map((poly, i) => drawPoly(poly, `img-${i}`, 'tcm-cfr-figure-image'))
          : null}
      </svg>
    </div>
  )
}

const SEGMENT_LETTERS = ['a', 'b', 'c'] as const

export function SegmentMeasureBlock({
  item,
  mode,
}: {
  item: MathItem
  mode: PreviewMode
}) {
  const show = mode === 'answers'
  const segments = item.segments ?? []
  const qPrompts = item.options ?? []
  const answers = (item.answer ?? '').split(';').map((s) => s.trim())

  return (
    <div className="tcm-cfr-segments">
      <div className="tcm-cfr-segment-frame">
        {segments.map((seg, i) => {
          const widthMm = Math.min(160, seg.mm)
          const letter = SEGMENT_LETTERS[i] ?? String.fromCharCode(97 + i)
          return (
            <div className="tcm-cfr-segment-row" key={`seg-${i}`}>
              <span className="tcm-cfr-segment-num">{letter}.</span>
              <div className="tcm-cfr-segment-line-wrap">
                <div className="tcm-cfr-segment-line" style={{ width: `${widthMm}mm` }} />
              </div>
              <span className="tcm-cfr-segment-answer">
                <span className={`answer-line-field compact ${show ? 'filled' : ''}`}>
                  {show ? seg.display : '\u00a0'}
                </span>
                <span className="tcm-cfr-segment-unit">{seg.unit}</span>
              </span>
            </div>
          )
        })}
      </div>
      {qPrompts.map((q, qi) => (
        <div className="tcm-cfr-segment-q-line" key={`q-${qi}`}>
          <span className="tcm-cfr-segment-q-num" aria-hidden>
            {qi + 1}.
          </span>
          <p className="prompt-stack-text">{q}</p>
          <span
            className={`answer-line-field compact tcm-cfr-segment-q-answer${show ? ' filled' : ''}`}
            aria-label={`Réponse question ${qi + 1}`}
          >
            {show ? answers[qi] || '\u00a0' : '\u00a0'}
          </span>
        </div>
      ))}
    </div>
  )
}

function cellCenter(
  cell: string,
  cols: string[],
  rows: number[],
  width: number,
  height: number,
  pad: number,
) {
  const letter = cell[0]!
  const num = Number(cell.slice(1))
  const ci = cols.indexOf(letter)
  const ri = rows.indexOf(num)
  const cw = (width - 2 * pad) / cols.length
  const rh = (height - 2 * pad) / rows.length
  return {
    x: pad + (ci + 0.5) * cw,
    y: pad + (rows.length - 1 - ri + 0.5) * rh,
    cw,
    rh,
  }
}

/** Décalage d’étiquette pour éviter les chevauchements (ordre de priorité). */
function metroLabelOffsets(
  map: NonNullable<MathItem['metroMap']>,
  width: number,
  height: number,
  pad: number,
): Map<string, { dx: number; dy: number; boxW: number }> {
  const placed: Array<{ id: string; x: number; y: number; w: number; h: number }> = []
  const out = new Map<string, { dx: number; dy: number; boxW: number }>()
  const candidates = [
    { dx: 0, dy: -16 },
    { dx: 0, dy: 14 },
    { dx: 22, dy: -4 },
    { dx: -22, dy: -4 },
    { dx: 18, dy: 12 },
    { dx: -18, dy: 12 },
    { dx: 0, dy: -28 },
    { dx: 0, dy: 26 },
  ]
  for (const line of map.lines) {
    const anchor = cellCenter(line.cells[0]!, map.cols, map.rows, width, height, pad)
    const boxW = Math.max(40, Math.min(72, 8 + line.name.length * 5.2))
    const boxH = 13
    let best = candidates[0]!
    for (const cand of candidates) {
      const x = anchor.x + cand.dx
      const y = anchor.y + cand.dy
      const box = { x: x - boxW / 2, y: y - boxH / 2, w: boxW, h: boxH }
      const hits = placed.some(
        (p) =>
          box.x < p.x + p.w + 2 &&
          box.x + box.w + 2 > p.x &&
          box.y < p.y + p.h + 2 &&
          box.y + box.h + 2 > p.y,
      )
      if (!hits) {
        best = cand
        placed.push({ id: line.id, ...box })
        break
      }
      if (cand === candidates[candidates.length - 1]) {
        placed.push({ id: line.id, x: box.x, y: box.y, w: box.w, h: box.h })
      }
    }
    out.set(line.id, { ...best, boxW })
  }
  return out
}

export function MetroMapBlock({
  item,
  mode,
}: {
  item: MathItem
  mode: PreviewMode
}) {
  const show = mode === 'answers'
  const map = item.metroMap
  const questions = item.metroQuestions ?? []
  if (!map) return null
  const width = 420
  const height = 280
  const pad = 28
  const labelPos = metroLabelOffsets(map, width, height, pad)

  return (
    <div className="tcm-cfr-metro">
      <svg className="tcm-cfr-metro-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Plan de métro">
        {/* Grille */}
        {map.cols.map((col, ci) => {
          const x = pad + (ci + 0.5) * ((width - 2 * pad) / map.cols.length)
          return (
            <text key={`c-${col}`} x={x} y={pad - 10} textAnchor="middle" className="tcm-cfr-metro-label">
              {col}
            </text>
          )
        })}
        {map.rows.map((row, ri) => {
          const y = pad + (map.rows.length - 1 - ri + 0.5) * ((height - 2 * pad) / map.rows.length)
          return (
            <text key={`r-${row}`} x={pad - 12} y={y + 4} textAnchor="end" className="tcm-cfr-metro-label">
              {row}
            </text>
          )
        })}
        {map.cols.map((_, ci) =>
          map.rows.map((_, ri) => {
            const cw = (width - 2 * pad) / map.cols.length
            const rh = (height - 2 * pad) / map.rows.length
            return (
              <rect
                key={`cell-${ci}-${ri}`}
                x={pad + ci * cw}
                y={pad + ri * rh}
                width={cw}
                height={rh}
                className="tcm-cfr-metro-cell"
              />
            )
          }),
        )}
        {map.lines.map((line) => {
          const pts = line.cells.map((c) => cellCenter(c, map.cols, map.rows, width, height, pad))
          const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
          const anchor = pts[0]!
          const off = labelPos.get(line.id) ?? { dx: 0, dy: -16, boxW: 56 }
          const lx = anchor.x + off.dx
          const ly = anchor.y + off.dy
          return (
            <g key={line.id}>
              <path d={d} fill="none" stroke={line.color} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round" />
              {pts.map((p, i) => (
                <circle key={`${line.id}-n${i}`} cx={p.x} cy={p.y} r={3.5} fill={line.color} stroke="#fff" strokeWidth={1} />
              ))}
              <rect
                x={lx - off.boxW / 2}
                y={ly - 7}
                width={off.boxW}
                height={13}
                rx={2}
                fill="#fff"
                stroke={line.color}
                strokeWidth={1.2}
              />
              <text x={lx} y={ly + 3} textAnchor="middle" className="tcm-cfr-metro-station" fill={line.color}>
                {line.name}
              </text>
            </g>
          )
        })}
      </svg>
      <ol className="tcm-cfr-metro-questions">
        {questions.map((q, i) => (
          <li key={`mq-${i}`}>
            <div className="tcm-cfr-metro-q-head">
              <span className="tcm-cfr-metro-q-num" aria-hidden>
                {i + 1}.
              </span>
              <p className="prompt-stack-text">{q.prompt}</p>
            </div>
            <span className={`answer-line-field ${show ? 'filled' : ''}`}>
              {show ? q.answer : '\u00a0'}
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}
