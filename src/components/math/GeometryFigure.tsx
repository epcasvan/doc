import type { ReactNode } from 'react'
import { fmt } from '@/math/column-arith'
import type { Figure, FigureDims } from '@/math/types'

const ALL: Figure[] = [
  'rectangle',
  'square',
  'triangle',
  'circle',
  'rhombus',
  'parallelogram',
  'trapezoid',
  'cube',
  'cuboid',
  'cylinder',
  'cone',
  'sphere',
  'oval',
  'pentagon',
]

function u(dims?: FigureDims) {
  return dims?.unit ?? 'cm'
}

function L({
  x,
  y,
  children,
  anchor = 'middle',
  rotate,
  baseline,
}: {
  x: number
  y: number
  children: ReactNode
  anchor?: 'start' | 'middle' | 'end'
  rotate?: number
  baseline?: 'auto' | 'middle' | 'hanging'
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      dominantBaseline={baseline}
      className="dim-label"
      fill="currentColor"
      fillOpacity={1}
      stroke="none"
      transform={rotate != null ? `rotate(${rotate} ${x} ${y})` : undefined}
    >
      {children}
    </text>
  )
}

/** Crochet de hauteur à droite (style placement soutien-scolaire). */
function HeightBracket({
  shapeRightX,
  yTop,
  yBot,
  bracketX,
  label,
}: {
  shapeRightX: number
  yTop: number
  yBot: number
  bracketX: number
  label: string
}) {
  const tick = 5
  return (
    <g fill="none" stroke="currentColor" strokeOpacity={0.85}>
      <line
        x1={shapeRightX}
        y1={yBot}
        x2={bracketX - 2}
        y2={yBot}
        strokeWidth={1}
        strokeDasharray="4 3"
      />
      <line
        x1={shapeRightX}
        y1={yTop}
        x2={bracketX - 2}
        y2={yTop}
        strokeWidth={1}
        strokeDasharray="4 3"
      />
      <line x1={bracketX} y1={yTop} x2={bracketX} y2={yBot} strokeWidth={1.5} />
      <line x1={bracketX - tick} y1={yTop} x2={bracketX + tick} y2={yTop} strokeWidth={1.5} />
      <line x1={bracketX - tick} y1={yBot} x2={bracketX + tick} y2={yBot} strokeWidth={1.5} />
      <L x={bracketX + tick + 14} y={(yTop + yBot) / 2} anchor="start" baseline="middle">
        {label}
      </L>
    </g>
  )
}

/**
 * Figures cotées — géométrie calquée sur soutien-scolaire
 * (placement Ex. 25–27 / 37–38 + G2/G3), lisibles en N&B.
 */
export function GeometryFigure({ type, dims }: { type?: Figure; dims?: FigureDims }) {
  if (!type || !ALL.includes(type)) return null
  const d = dims ?? {}
  const bare = Boolean(d.bare)
  const unit = u(dims)
  const kind = d.triangleKind ?? 'scalene'
  const hasHeight = !bare && d.height != null
  const forArea = !bare && (hasHeight || (type === 'triangle' && d.base != null && d.a == null))

  /** Styles placement TCM : toutes les cotes utiles sur une figure. */
  const paraPlacement =
    !bare && type === 'parallelogram' && d.base != null && d.side != null && d.height != null
  const triPlacement =
    !bare && type === 'triangle' && d.a != null && d.b != null && d.c != null && d.height != null
  const rhombusPlacement =
    !bare && type === 'rhombus' && d.side != null && d.d1 != null && d.d2 != null
  const trapPlacement =
    !bare &&
    type === 'trapezoid' &&
    d.top != null &&
    d.bottom != null &&
    (d.c != null || d.side != null) &&
    d.height != null
  const circleDiameter =
    !bare && type === 'circle' && (d.diameter != null || (d.length != null && d.radius == null))

  const viewBox = paraPlacement
    ? '0 0 350 168'
    : triPlacement
      ? '0 0 390 180'
      : rhombusPlacement
        ? '0 0 340 200'
        : trapPlacement
          ? '0 0 370 178'
          : '0 0 260 190'

  return (
    <svg
      className="geometry-figure cotee"
      viewBox={viewBox}
      role="img"
      aria-label="Figure géométrique"
    >
      <g fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round">
        {type === 'square' && (
          <>
            <rect x="75" y="42" width="110" height="110" />
            {(d.side != null || d.ask === 'side') && (
              <L x={130} y={32}>
                {d.ask === 'side' ? '?' : `${fmt(d.side!)} ${unit}`}
              </L>
            )}
          </>
        )}

        {type === 'rectangle' && (
          <>
            <rect x="28" y="40" width="190" height="100" />
            {(d.length != null || d.ask === 'length') && (
              <L x={123} y={22}>
                {d.ask === 'length' ? '?' : `${fmt(d.length!)} ${unit}`}
              </L>
            )}
            {(d.width != null || d.ask === 'width') && (
              <L x={232} y={90} anchor="start">
                {d.ask === 'width' ? '?' : `${fmt(d.width!)} ${unit}`}
              </L>
            )}
          </>
        )}

        {paraPlacement && (
          <>
            {/* Coords placement soutien Ex. 25 */}
            <polygon points="76,118 216,118 248,38 108,38" />
            <L x={(108 + 248) / 2} y={18}>
              {fmt(d.base!)} {unit}
            </L>
            <L x={50} y={(118 + 38) / 2} anchor="end" baseline="middle">
              {fmt(d.side!)} {unit}
            </L>
            <HeightBracket
              shapeRightX={248}
              yTop={38}
              yBot={118}
              bracketX={286}
              label={`h = ${fmt(d.height!)} ${unit}`}
            />
          </>
        )}

        {type === 'parallelogram' && !paraPlacement && (
          <>
            <polygon points="70,40 220,40 185,145 35,145" />
            {hasHeight && (
              <line
                x1="220"
                y1="40"
                x2="220"
                y2="145"
                fill="none"
                strokeDasharray="5 4"
                strokeWidth="1.4"
                strokeOpacity="0.85"
              />
            )}
            {(d.base != null || d.length != null) && (
              <L x={110} y={168}>
                {fmt(d.base ?? d.length!)} {unit}
              </L>
            )}
            {(d.height != null || d.ask === 'height') && (
              <L x={230} y={96} anchor="start">
                {d.ask === 'height' ? 'h = ?' : `h = ${fmt(d.height!)} ${unit}`}
              </L>
            )}
            {(d.side != null || d.a != null || d.ask === 'side') && (
              <L x={42} y={92} anchor="end">
                {d.ask === 'side' ? '?' : `${fmt(d.side ?? d.a!)} ${unit}`}
              </L>
            )}
          </>
        )}

        {triPlacement && (
          <>
            {/* Scalène + a / b / c / h — b hors figure, h décalé vers la droite (cadre). */}
            <polygon points="72,28 22,122 185,122" />
            <L x={(22 + 185) / 2} y={148} baseline="hanging">
              a = {fmt(d.a!)} {unit}
            </L>
            {/* Cote b à l’extérieur du côté droit (hors polygone). */}
            <L x={(72 + 185) / 2 + 28} y={(28 + 122) / 2 - 14} anchor="start">
              b = {fmt(d.b!)} {unit}
            </L>
            <L x={(72 + 22) / 2 - 20} y={(28 + 122) / 2 - 4} anchor="end">
              c = {fmt(d.c!)} {unit}
            </L>
            <HeightBracket
              shapeRightX={185}
              yTop={28}
              yBot={122}
              bracketX={300}
              label={`h = ${fmt(d.height!)} ${unit}`}
            />
          </>
        )}

        {type === 'triangle' && !triPlacement && kind === 'right' && (
          <>
            <polygon points="48,152 210,152 48,42" />
            {!bare ? (
              <polyline points="48,136 64,136 64,152" fill="none" strokeWidth="1.6" />
            ) : null}
            {forArea && d.base != null && d.height != null ? (
              <>
                <line
                  x1="48"
                  y1="42"
                  x2="48"
                  y2="152"
                  fill="none"
                  strokeDasharray="5 4"
                  strokeWidth="1.4"
                  strokeOpacity="0.85"
                />
                <L x={130} y={172}>
                  {fmt(d.base)} {unit}
                </L>
                <L x={58} y={100} anchor="start">
                  h = {fmt(d.height)} {unit}
                </L>
              </>
            ) : (
              <>
                {d.a != null && (
                  <L x={36} y={100} anchor="end">
                    {fmt(d.a)} {unit}
                  </L>
                )}
                {d.b != null && (
                  <L x={130} y={172}>
                    {fmt(d.b)} {unit}
                  </L>
                )}
                {d.c != null && (
                  <L x={148} y={88} anchor="start">
                    {fmt(d.c)} {unit}
                  </L>
                )}
              </>
            )}
          </>
        )}

        {type === 'triangle' && !triPlacement && kind === 'equilateral' && (
          <>
            <polygon points="130,32 220,152 40,152" />
            {forArea && (d.base != null || d.side != null) && d.height != null ? (
              <>
                <line
                  x1="130"
                  y1="32"
                  x2="130"
                  y2="152"
                  fill="none"
                  strokeDasharray="5 4"
                  strokeWidth="1.4"
                  strokeOpacity="0.85"
                />
                <L x={130} y={172}>
                  {fmt(d.base ?? d.side!)} {unit}
                </L>
                <L x={140} y={100} anchor="start">
                  h = {fmt(d.height)} {unit}
                </L>
              </>
            ) : (
              (d.side ?? d.a) != null && (
                <>
                  <L x={70} y={88} anchor="end">
                    {fmt(d.side ?? d.a!)} {unit}
                  </L>
                  <L x={196} y={88} anchor="start">
                    {fmt(d.side ?? d.b ?? d.a!)} {unit}
                  </L>
                  <L x={130} y={172}>
                    {fmt(d.side ?? d.c ?? d.a!)} {unit}
                  </L>
                </>
              )
            )}
          </>
        )}

        {type === 'triangle' && !triPlacement && kind === 'isosceles' && (
          <>
            <polygon points="130,28 235,152 25,152" />
            {forArea && d.base != null && d.height != null ? (
              <>
                <line
                  x1="130"
                  y1="28"
                  x2="130"
                  y2="152"
                  fill="none"
                  strokeDasharray="5 4"
                  strokeWidth="1.4"
                  strokeOpacity="0.85"
                />
                <L x={130} y={172}>
                  {fmt(d.base)} {unit}
                </L>
                <L x={140} y={98} anchor="start">
                  h = {fmt(d.height)} {unit}
                </L>
              </>
            ) : (
              <>
                {(d.a ?? d.side) != null && (
                  <L x={60} y={86} anchor="end">
                    {fmt(d.a ?? d.side!)} {unit}
                  </L>
                )}
                {(d.b ?? d.side) != null && (
                  <L x={206} y={86} anchor="start">
                    {fmt(d.b ?? d.side!)} {unit}
                  </L>
                )}
                {(d.c ?? d.base) != null && (
                  <L x={130} y={172}>
                    {fmt(d.c ?? d.base!)} {unit}
                  </L>
                )}
              </>
            )}
          </>
        )}

        {type === 'triangle' &&
          !triPlacement &&
          (kind === 'scalene' || !['right', 'equilateral', 'isosceles'].includes(kind)) && (
            <>
              <polygon points="135,28 246,152 42,152" />
              {forArea && d.base != null && (d.height != null || d.ask === 'height') ? (
                <>
                  <line
                    x1="142"
                    y1="28"
                    x2="142"
                    y2="152"
                    fill="none"
                    strokeDasharray="5 4"
                    strokeWidth="1.4"
                    strokeOpacity="0.85"
                  />
                  <L x={144} y={172}>
                    {fmt(d.base)} {unit}
                  </L>
                  <L x={152} y={100} anchor="start">
                    {d.ask === 'height' ? 'h = ?' : `h = ${fmt(d.height!)} ${unit}`}
                  </L>
                  {d.side != null && (
                    <L x={72} y={92} anchor="end">
                      {fmt(d.side)} {unit}
                    </L>
                  )}
                </>
              ) : (
                <>
                  {d.a != null && (
                    <L x={68} y={82} anchor="middle">
                      {fmt(d.a)} {unit}
                    </L>
                  )}
                  {d.b != null && (
                    <L x={228} y={90} anchor="start">
                      {fmt(d.b)} {unit}
                    </L>
                  )}
                  {(d.c != null || d.ask === 'c') && (
                    <L x={144} y={172}>
                      {d.ask === 'c' ? '?' : `${fmt(d.c!)} ${unit}`}
                    </L>
                  )}
                </>
              )}
            </>
          )}

        {trapPlacement && (
          <>
            {/* Coords placement soutien Ex. 37 — a / b / c / h */}
            <polygon points="92,32 202,32 244,120 54,120" />
            <L x={(92 + 202) / 2} y={16}>
              a = {fmt(d.top!)} {unit}
            </L>
            <L x={(54 + 244) / 2} y={146} baseline="hanging">
              b = {fmt(d.bottom!)} {unit}
            </L>
            <L x={(54 + 92) / 2 - 20} y={(120 + 32) / 2} anchor="end" baseline="middle">
              c = {fmt(d.c ?? d.side!)} {unit}
            </L>
            <HeightBracket
              shapeRightX={244}
              yTop={32}
              yBot={120}
              bracketX={270}
              label={`h = ${fmt(d.height!)} ${unit}`}
            />
          </>
        )}

        {type === 'trapezoid' && !trapPlacement && (
          <>
            <polygon
              points={
                d.trapezoidKind === 'rectangle'
                  ? '48,42 175,42 210,150 48,150'
                  : d.trapezoidKind === 'scalene'
                    ? '55,42 195,42 235,150 28,150'
                    : '85,42 185,42 225,150 45,150'
              }
            />
            {!bare && d.trapezoidKind === 'rectangle' && (
              <polyline points="48,134 64,134 64,150" fill="none" strokeWidth="1.6" />
            )}
            {hasHeight && (
              <line
                x1="185"
                y1="42"
                x2="185"
                y2="150"
                fill="none"
                strokeDasharray="5 4"
                strokeWidth="1.4"
                strokeOpacity="0.85"
              />
            )}
            {!bare && d.top != null && (
              <L x={135} y={30}>
                {fmt(d.top)} {unit}
              </L>
            )}
            {!bare && (d.bottom != null || d.base != null) && (
              <L x={135} y={172}>
                {fmt(d.bottom ?? d.base!)} {unit}
              </L>
            )}
            {!bare && (d.height != null || d.ask === 'height') && (
              <L x={196} y={100} anchor="start">
                {d.ask === 'height' ? 'h = ?' : `h = ${fmt(d.height!)} ${unit}`}
              </L>
            )}
            {!bare && d.a != null && (
              <L x={52} y={100} anchor="end">
                {fmt(d.a)} {unit}
              </L>
            )}
            {!bare && (d.b != null || d.ask === 'b') && (
              <L x={220} y={100} anchor="start">
                {d.ask === 'b' ? '?' : `${fmt(d.b!)} ${unit}`}
              </L>
            )}
          </>
        )}

        {rhombusPlacement && (
          <>
            {/* Coords placement soutien Ex. 27 — c / d₁ / d₂ */}
            <polygon points="125,21 203,73 125,125 47,73" />
            <L x={(125 + 47) / 2 - 24} y={(21 + 73) / 2} anchor="end" baseline="middle">
              c = {fmt(d.side!)} {unit}
            </L>
            {/* Bracket d₂ (vertical, droite) */}
            <g fill="none" stroke="currentColor" strokeOpacity={0.85}>
              <line x1={203} y1={21} x2={233} y2={21} strokeWidth={1} strokeDasharray="4 3" />
              <line x1={203} y1={125} x2={233} y2={125} strokeWidth={1} strokeDasharray="4 3" />
              <line x1={235} y1={21} x2={235} y2={125} strokeWidth={1.5} />
              <line x1={230} y1={21} x2={240} y2={21} strokeWidth={1.5} />
              <line x1={230} y1={125} x2={240} y2={125} strokeWidth={1.5} />
            </g>
            <L x={256} y={73} anchor="start" baseline="middle">
              d₂ = {fmt(d.d2!)} {unit}
            </L>
            {/* Bracket d₁ (horizontal, bas) */}
            <g fill="none" stroke="currentColor" strokeOpacity={0.85}>
              <line x1={47} y1={75} x2={47} y2={150} strokeWidth={1} strokeDasharray="4 3" />
              <line x1={203} y1={75} x2={203} y2={150} strokeWidth={1} strokeDasharray="4 3" />
              <line x1={47} y1={152} x2={203} y2={152} strokeWidth={1.5} />
              <line x1={47} y1={147} x2={47} y2={157} strokeWidth={1.5} />
              <line x1={203} y1={147} x2={203} y2={157} strokeWidth={1.5} />
            </g>
            <L x={125} y={176} baseline="hanging">
              d₁ = {fmt(d.d1!)} {unit}
            </L>
          </>
        )}

        {type === 'rhombus' && !rhombusPlacement && (
          <>
            {/* Diagonales inégales (170 × 90) : losange distinct du carré. */}
            <polygon points="130,50 215,95 130,140 45,95" />
            {hasHeight && (
              <line
                x1="215"
                y1="95"
                x2="45"
                y2="95"
                fill="none"
                strokeDasharray="5 4"
                strokeWidth="1.4"
                strokeOpacity="0.85"
              />
            )}
            {(d.side != null || d.ask === 'side') && (
              <L x={130} y={168}>
                {d.ask === 'side' ? '?' : `${fmt(d.side!)} ${unit}`}
              </L>
            )}
            {(d.height != null || d.ask === 'height') && (
              <L x={222} y={92} anchor="start">
                {d.ask === 'height' ? 'h = ?' : `h = ${fmt(d.height!)} ${unit}`}
              </L>
            )}
          </>
        )}

        {circleDiameter && (
          <>
            {/* TCM ex. 37 — diamètre (−30 %) ; trait ~équivalent visuel au trapèze (viewBox plus étroit). */}
            <g strokeWidth="1.7" strokeLinejoin="round">
              <circle cx="130" cy="78" r={41} />
              <line x1={130 - 41} y1={78} x2={130 + 41} y2={78} fill="none" strokeWidth={1.1} />
              <circle cx="130" cy="78" r="1.8" fillOpacity={1} stroke="none" />
            </g>
            <L x={130} y={132} baseline="hanging">
              d = {fmt(d.diameter ?? d.length!)} {unit}
            </L>
          </>
        )}

        {type === 'circle' && !circleDiameter && (
          <>
            <circle cx="130" cy="88" r="58" />
            {!bare ? (
              <>
                <line x1="130" y1="88" x2="188" y2="88" fill="none" strokeWidth="2" />
                <line
                  x1="130"
                  y1="30"
                  x2="130"
                  y2="146"
                  fill="none"
                  strokeWidth="1.5"
                  strokeDasharray="5 4"
                  strokeOpacity="0.7"
                />
                <circle cx="130" cy="88" r="2.4" fillOpacity="1" stroke="none" />
              </>
            ) : null}
            {!bare && (d.radius != null || d.ask === 'radius') && (
              <L x={130} y={172}>
                {d.ask === 'radius' ? 'r = ?' : `r = ${fmt(d.radius!)} ${unit}`}
              </L>
            )}
          </>
        )}

        {type === 'cube' && (
          <>
            <path d="M70 78 h76 v76 H70 Z" />
            <path d="M70 78 L102 48 h76 l-32 30" fill="none" />
            <path d="M178 48 v76 l-32 30" fill="none" />
            {(d.side != null || d.ask === 'side') && (
              <>
                <L x={108} y={172}>
                  {d.ask === 'side' ? '?' : `${fmt(d.side!)} ${unit}`}
                </L>
                <L x={58} y={120} anchor="end">
                  {d.ask === 'side' ? '?' : `${fmt(d.side!)} ${unit}`}
                </L>
                <L x={140} y={38}>
                  {d.ask === 'side' ? '?' : `${fmt(d.side!)} ${unit}`}
                </L>
              </>
            )}
          </>
        )}

        {type === 'cuboid' && (
          <>
            <path d="M55 82 h118 v62 H55 Z" />
            <path d="M55 82 L92 52 h118 l-37 30" fill="none" />
            <path d="M210 52 v62 l-37 30" fill="none" />
            {d.length != null && (
              <L x={114} y={168}>
                {fmt(d.length)} {unit}
              </L>
            )}
            {d.width != null && (
              <L x={220} y={86} anchor="start">
                {fmt(d.width)} {unit}
              </L>
            )}
            {(d.height != null || d.ask === 'height') && (
              <L x={42} y={118} anchor="end">
                {d.ask === 'height' ? '?' : `${fmt(d.height!)} ${unit}`}
              </L>
            )}
          </>
        )}

        {type === 'cylinder' && (
          <>
            <ellipse cx="120" cy="48" rx="55" ry="18" />
            <path d="M65 48 v86" fill="none" />
            <path d="M175 48 v86" fill="none" />
            <ellipse cx="120" cy="134" rx="55" ry="18" fillOpacity="0.05" />
            <line x1="120" y1="48" x2="175" y2="48" fill="none" strokeWidth="2" />
            {d.radius != null && (
              <L x={148} y={40} anchor="start">
                r = {fmt(d.radius)} {unit}
              </L>
            )}
            {(d.height != null || d.ask === 'height') && (
              <L x={190} y={100} anchor="start">
                {d.ask === 'height' ? 'h = ?' : `h = ${fmt(d.height!)} ${unit}`}
              </L>
            )}
          </>
        )}

        {type === 'oval' && <ellipse cx="130" cy="95" rx="78" ry="48" />}

        {type === 'pentagon' && (
          <>
            <polygon points="130,28 210,88 178,168 82,168 50,88" />
            {d.side != null && (
              <L x={130} y={178}>
                {fmt(d.side)} {unit}
              </L>
            )}
          </>
        )}

        {type === 'cone' && (
          <>
            <ellipse cx="130" cy="150" rx="62" ry="16" />
            <path d="M68 150 L130 28 L192 150" fill="none" />
            {(d.radius != null || d.ask === 'radius') && (
              <L x={160} y={168}>
                {d.ask === 'radius' ? 'r = ?' : `r = ${fmt(d.radius!)} ${unit}`}
              </L>
            )}
            {(d.height != null || d.ask === 'height') && (
              <L x={210} y={90} anchor="start">
                {d.ask === 'height' ? 'h = ?' : `h = ${fmt(d.height!)} ${unit}`}
              </L>
            )}
          </>
        )}

        {type === 'sphere' && (
          <>
            <circle cx="130" cy="95" r="62" />
            <ellipse cx="130" cy="95" rx="62" ry="18" fill="none" />
            {(d.radius != null || d.ask === 'radius') && (
              <L x={130} y={176}>
                {d.ask === 'radius' ? 'r = ?' : `r = ${fmt(d.radius!)} ${unit}`}
              </L>
            )}
          </>
        )}
      </g>
    </svg>
  )
}
