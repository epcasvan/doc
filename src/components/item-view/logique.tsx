import type { CSSProperties, ReactNode } from 'react'
import type { LogiqueCell, LogiquePuzzle } from '@/logique/types'
import type { MathItem, PreviewMode } from '@/math/types'

function ShapeSvg({
  cell,
  size = 44,
  hatchId = 'logique-hatch',
}: {
  cell: LogiqueCell
  size?: number
  hatchId?: string
}) {
  if (cell.blank) {
    return (
      <svg className="logique-shape" width={size} height={size} viewBox="0 0 40 40" aria-hidden>
        <rect x="2" y="2" width="36" height="36" fill="none" stroke="currentColor" strokeDasharray="4 3" strokeWidth="1.5" />
        <text x="20" y="25" textAnchor="middle" fontSize="16" fill="currentColor">
          ?
        </text>
      </svg>
    )
  }
  const fill = cell.fill ?? 'solid'
  const rot = cell.rot ?? 0
  const stroke = 'currentColor'
  const paint =
    fill === 'solid' ? 'currentColor' : fill === 'hatched' ? `url(#${hatchId})` : 'none'
  const strokeW = fill === 'empty' ? 2 : 1.4
  let body: ReactNode = null
  switch (cell.kind) {
    case 'circle':
      body = <circle cx="20" cy="20" r="12" fill={paint} stroke={stroke} strokeWidth={strokeW} />
      break
    case 'square':
      body = <rect x="8" y="8" width="24" height="24" fill={paint} stroke={stroke} strokeWidth={strokeW} />
      break
    case 'triangle':
      body = <polygon points="20,7 33,32 7,32" fill={paint} stroke={stroke} strokeWidth={strokeW} />
      break
    case 'diamond':
      body = <polygon points="20,6 34,20 20,34 6,20" fill={paint} stroke={stroke} strokeWidth={strokeW} />
      break
    case 'plus':
      body = (
        <path
          d="M16 8h8v8h8v8h-8v8h-8v-8H8v-8h8z"
          fill={paint}
          stroke={stroke}
          strokeWidth={strokeW}
        />
      )
      break
    case 'arrow':
      body = (
        <polygon
          points="20,6 32,18 24,18 24,34 16,34 16,18 8,18"
          fill={paint}
          stroke={stroke}
          strokeWidth={strokeW}
        />
      )
      break
  }
  return (
    <svg className="logique-shape" width={size} height={size} viewBox="0 0 40 40" aria-hidden>
      <g transform={`rotate(${rot} 20 20)`}>{body}</g>
    </svg>
  )
}

function CubeStacks({ stacks }: { stacks: number[] }) {
  const maxH = Math.max(...stacks, 1)
  const cell = 14
  const gap = 4
  const w = stacks.length * (cell + gap) + gap
  const h = maxH * (cell * 0.7) + cell + 8
  return (
    <svg className="logique-cubes" width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden>
      {stacks.map((count, i) => {
        const x = gap + i * (cell + gap)
        return Array.from({ length: count }, (_, k) => {
          const y = h - 4 - (k + 1) * (cell * 0.72)
          return (
            <g key={`${i}-${k}`}>
              <rect
                x={x}
                y={y}
                width={cell}
                height={cell * 0.72}
                fill="#fff"
                stroke="currentColor"
                strokeWidth="1.4"
              />
              <line
                x1={x}
                y1={y + 3}
                x2={x + cell}
                y2={y + 3}
                stroke="currentColor"
                strokeWidth="0.7"
                opacity="0.35"
              />
            </g>
          )
        })
      })}
    </svg>
  )
}

function CellRow({
  cells,
  cols,
  highlight,
  showAnswer,
  hatchId,
  numbered,
}: {
  cells: LogiqueCell[]
  cols?: number
  highlight?: number
  showAnswer?: boolean
  hatchId: string
  numbered?: boolean
}) {
  const style =
    cols && cols > 0
      ? ({ gridTemplateColumns: `repeat(${cols}, auto)` } as CSSProperties)
      : undefined
  return (
    <ul className={`logique-row${cols ? ' is-grid' : ''}`} style={style}>
      {cells.map((c, i) => (
        <li
          key={i}
          className={`logique-cell${showAnswer && highlight === i ? ' is-answer' : ''}`}
        >
          <ShapeSvg cell={c} hatchId={hatchId} />
          {numbered ? <span className="logique-idx">{i + 1}</span> : null}
        </li>
      ))}
    </ul>
  )
}

export function LogiqueBlock({ item, mode }: { item: MathItem; mode: PreviewMode }) {
  const p = item.logique as LogiquePuzzle | undefined
  if (!p) return null
  const show = mode === 'answers'
  const hatchId = `logique-hatch-${item.answer}-${p.mode}-${p.stem.length}`
  return (
    <div className={`logique-block is-${p.mode}`}>
      <svg width="0" height="0" aria-hidden className="logique-defs">
        <defs>
          <pattern
            id={hatchId}
            width="4"
            height="4"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line x1="0" y1="0" x2="0" y2="4" stroke="currentColor" strokeWidth="1.5" />
          </pattern>
        </defs>
      </svg>
      {item.prompt ? <p className="logique-prompt">{item.prompt}</p> : null}
      {p.mode === 'cube' && p.cubeStacks ? (
        <div className="logique-stem">
          <CubeStacks stacks={p.cubeStacks} />
        </div>
      ) : p.stem.length ? (
        <div className="logique-stem">
          {p.mode === 'rotation' ? <span className="logique-label">Modèle</span> : null}
          <CellRow
            cells={p.stem}
            cols={p.stemCols}
            highlight={p.mode === 'intrus' ? p.correctIndex : undefined}
            showAnswer={show && p.mode === 'intrus'}
            hatchId={hatchId}
            numbered={p.mode === 'intrus' || p.mode === 'suite'}
          />
        </div>
      ) : null}
      {p.choices?.length ? (
        <ul className="logique-choices">
          {p.choices.map((c, i) => (
            <li
              key={i}
              className={`logique-choice${show && p.correctIndex === i ? ' is-answer' : ''}`}
            >
              <span className="logique-choice-lab">{p.choiceLabels?.[i] ?? String.fromCharCode(65 + i)}</span>
              <ShapeSvg cell={c} size={40} hatchId={hatchId} />
            </li>
          ))}
        </ul>
      ) : null}
      {p.mode === 'cube' ? (
        <span className={`answer-line-field${show ? ' is-filled' : ''}`}>
          {show ? item.answer : '\u00a0'}
        </span>
      ) : null}
    </div>
  )
}
