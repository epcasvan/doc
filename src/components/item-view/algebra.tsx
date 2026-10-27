import { fmt } from '@/math/column-arith'
import type { MathItem, PreviewMode } from '@/math/types'
import {
  FractionAnswerBlank,
  FractionStack,
  FractionView,
  looksLikeFraction,
  renderMathText,
} from '../math/FractionView'

export function formatOperand(n: number | undefined): string {
  if (n == null) return ''
  return fmt(n)
}

export function parseBinaryEquation(prompt: string): {
  a: string
  op: string
  b: string
  trailing: 'blank' | 'value' | 'none'
  trailingValue?: string
} | null {
  const trimmed = prompt.trim()
  const eq = /^(.*?)\s*=\s*□?\s*$/u.exec(trimmed)
  if (!eq) return null
  const left = eq[1]!.trim()
  if (!left) return null
  // Opérateur binaire au niveau 0 (ignore +/− unaires : (+12), −3/4, × −2/5).
  let depth = 0
  let opAt = -1
  let opChar = ''
  for (let i = 0; i < left.length; i++) {
    const ch = left[i]!
    if (ch === '(' || ch === '[') depth++
    else if (ch === ')' || ch === ']') depth = Math.max(0, depth - 1)
    else if (depth === 0 && /[+\-−×÷]/.test(ch)) {
      if (ch === '+' || ch === '-' || ch === '−') {
        let j = i - 1
        while (j >= 0 && /\s/.test(left[j]!)) j--
        // Unaiare : début, après ouverture, ou après un autre opérateur.
        if (j < 0 || /[([]|[+\-−×÷]/.test(left[j]!)) continue
      }
      opAt = i
      opChar = ch
    }
  }
  if (opAt < 0) return null
  const a = left.slice(0, opAt).trim()
  const b = left.slice(opAt + 1).trim()
  if (!a || !b) return null
  // Évite les phrases (« Dans 12, le chiffre… »)
  if (/[a-zA-Zàâäéèêëïîôùûüç]/u.test(a) || /[a-zA-Zàâäéèêëïîôùûüç]/u.test(b)) return null
  const op = opChar.replace('-', '−')
  const endsBlank = /=\s*□?\s*$/u.test(trimmed) && !/=\s*-?\d/.test(trimmed)
  return { a, op, b, trailing: endsBlank || trimmed.endsWith('=') ? 'blank' : 'none' }
}

export function EquationRow({ item, mode }: { item: MathItem; mode: PreviewMode }) {
  const show = mode === 'answers'
  const missing = item.missing ?? 'result'
  const aText = missing === 'a' && !show ? null : formatOperand(item.a)
  const bText = missing === 'b' && !show ? null : formatOperand(item.b)
  const resultMissing = missing === 'result'
  // Quand le trou est sur a ou b, on affiche le résultat en clair (pas de 2ᵉ trait).
  const resultShown = resultMissing
    ? show
      ? item.answer
      : null
    : formatOperand(item.result) || (show ? item.answer : formatOperand(item.result))

  return (
    <div className="eq-row" aria-label="Calcul">
      <span className="eq-cell eq-num">
        {aText == null ? (
          <span className={`answer-line-field compact ${show ? 'filled' : ''}`}>{show ? formatOperand(item.a) : '\u00a0'}</span>
        ) : (
          aText
        )}
      </span>
      <span className="eq-cell eq-op">{item.op}</span>
      <span className="eq-cell eq-num">
        {bText == null ? (
          <span className={`answer-line-field compact ${show ? 'filled' : ''}`}>{show ? formatOperand(item.b) : '\u00a0'}</span>
        ) : (
          bText
        )}
      </span>
      <span className="eq-cell eq-eq">=</span>
      <span className="eq-cell eq-ans">
        {resultMissing ? (
          <span className={`answer-line-field ${show && resultShown != null ? 'filled' : ''}`}>
            {resultShown ?? '\u00a0'}
          </span>
        ) : (
          <span className={show ? 'filled-answer' : undefined}>{resultShown}</span>
        )}
      </span>
    </div>
  )
}

export function FractionResultSlot({ answer, show }: { answer: string; show: boolean }) {
  if (show) {
    return (
      <span className="filled-answer">
        {looksLikeFraction(answer) ? <FractionView value={answer} /> : answer}
      </span>
    )
  }
  // Élève : barre de fraction centrée (thème) pour écrire num et den — pas de trait dessous.
  return <FractionAnswerBlank />
}

export function ParsedEquationRow({
  a,
  op,
  b,
  answer,
  mode,
}: {
  a: string
  op: string
  b: string
  answer: string
  mode: PreviewMode
}) {
  const show = mode === 'answers'
  const blankA = a === '□'
  const blankB = b === '□'
  const resultBlank = !blankA && !blankB
  const fracContext = looksLikeFraction(a) || looksLikeFraction(b) || looksLikeFraction(answer)
  return (
    <div className="eq-row" aria-label="Calcul">
      <span className="eq-cell eq-num">
        {blankA ? (
          <span className={`answer-line-field compact ${show ? 'filled' : ''}`}>
            {show ? <FractionView value={answer} /> : '\u00a0'}
          </span>
        ) : (
          renderMathText(a)
        )}
      </span>
      <span className="eq-cell eq-op">{op}</span>
      <span className="eq-cell eq-num">
        {blankB ? (
          <span className={`answer-line-field compact ${show ? 'filled' : ''}`}>
            {show ? <FractionView value={answer} /> : '\u00a0'}
          </span>
        ) : (
          renderMathText(b)
        )}
      </span>
      <span className="eq-cell eq-eq">=</span>
      <span className="eq-cell eq-ans">
        {resultBlank && fracContext ? (
          <FractionResultSlot answer={answer} show={show} />
        ) : (
          <span className={`answer-line-field ${show && resultBlank ? 'filled' : ''}`}>
            {show && resultBlank ? <FractionView value={answer} /> : '\u00a0'}
          </span>
        )}
      </span>
    </div>
  )
}

/** Marqueur interne pour une fraction composée (num)/(den) — un seul jeton pour l’alignement. */
const COMPOUND_FRAC_MARK = '\uE000'

export type AlgebraFracToken = { kind: 'frac'; num: string; den: string }
export type AlgebraTokenPart = string | AlgebraFracToken

/**
 * Repère les fractions composées `(…)/(…)` (binômes scolaires, sans parenthèses imbriquées)
 * et les remplace par un marqueur pour le découpage.
 */
function extractCompoundFractions(expression: string): {
  masked: string
  fracs: AlgebraFracToken[]
} {
  const fracs: AlgebraFracToken[] = []
  // (num)/(den) — num et den sans parenthèses internes
  const masked = expression.replace(/\(([^()]*)\)\s*\/\s*\(([^()]*)\)/g, (_, num: string, den: string) => {
    fracs.push({ kind: 'frac', num: num.trim(), den: den.trim() })
    return `${COMPOUND_FRAC_MARK}${fracs.length - 1}${COMPOUND_FRAC_MARK}`
  })
  return { masked, fracs }
}

/** Découpe une expression algébrique en atomes (chiffres, lettres, opérateurs…). */
export function tokenizeAlgebra(expression: string): string[] {
  const { masked, fracs } = extractCompoundFractions(expression)
  const tokens: string[] = []
  const re = new RegExp(
    `${COMPOUND_FRAC_MARK}\\d+${COMPOUND_FRAC_MARK}|√\\d+|√|[-−]?[A-Za-z]\\/\\d+|[-−]?\\d+\\/[-−]?\\d+|\\d+[¹²³⁴]|[A-Za-z][²³⁴]?|\\d+(?:,\\d+)?|[+\\-−×÷·=/()[\\]]`,
    'gu',
  )
  let last = 0
  for (const match of masked.matchAll(re)) {
    const start = match.index ?? 0
    if (start > last) {
      const gap = masked.slice(last, start).trim()
      if (gap) tokens.push(gap)
    }
    const raw = match[0]!
    if (raw.startsWith(COMPOUND_FRAC_MARK)) {
      const idx = Number(raw.slice(1, -1))
      const frac = fracs[idx]
      // Encodage stable pour App.tsx (longueur) et AlgebraToken.
      tokens.push(
        frac
          ? `${COMPOUND_FRAC_MARK}FRAC:${frac.num}\uE001${frac.den}${COMPOUND_FRAC_MARK}`
          : raw,
      )
    } else {
      tokens.push(raw.replace(/-/g, '−'))
    }
    last = start + raw.length
  }
  const tail = masked.slice(last).trim()
  if (tail) tokens.push(tail)
  return tokens
}

function parseCompoundFracToken(token: string): AlgebraFracToken | null {
  if (!token.startsWith(COMPOUND_FRAC_MARK) || !token.endsWith(COMPOUND_FRAC_MARK)) return null
  const inner = token.slice(1, -1)
  if (!inner.startsWith('FRAC:')) return null
  const body = inner.slice(5)
  const sep = body.indexOf('\uE001')
  if (sep < 0) return null
  return { kind: 'frac', num: body.slice(0, sep), den: body.slice(sep + 1) }
}

function isAlgebraLetter(token: string): boolean {
  return /^[A-Za-z][²³⁴]?$/.test(token)
}

function isAlgebraOp(token: string): boolean {
  return /^[+\-−×÷·=/]$/.test(token)
}

export function AlgebraToken({ token }: { token: string }) {
  const compound = parseCompoundFracToken(token)
  if (compound) {
    return (
      <span className="alg-token alg-frac alg-frac-compound">
        <FractionStack
          ariaLabel={`${compound.num} sur ${compound.den}`}
          num={tokenizeAlgebra(compound.num).map((t, i) => (
            <AlgebraToken key={`n-${i}`} token={t} />
          ))}
          den={tokenizeAlgebra(compound.den).map((t, i) => (
            <AlgebraToken key={`d-${i}`} token={t} />
          ))}
        />
      </span>
    )
  }
  if (/^[-−]?(?:[A-Za-z]|\d+)\/[-−]?\d+$/.test(token)) {
    return (
      <span className="alg-token alg-frac">
        <FractionView value={token} />
      </span>
    )
  }
  if (token.startsWith('√') && token.length > 1) {
    return (
      <span className="alg-token alg-sqrt">
        √<span className="alg-sqrt-arg">{token.slice(1)}</span>
      </span>
    )
  }
  if (token === '√') return <span className="alg-token alg-sqrt">√</span>
  if (/^\d+[¹²³⁴]$/.test(token)) {
    return (
      <span className="alg-token alg-num">
        {token.slice(0, -1)}
        <sup>{token.slice(-1)}</sup>
      </span>
    )
  }
  if (isAlgebraLetter(token)) {
    const letter = token[0]!
    const sup = token.slice(1)
    return (
      <span className="alg-token alg-letter">
        {letter}
        {sup ? <sup>{sup}</sup> : null}
      </span>
    )
  }
  if (isAlgebraOp(token)) return <span className={`alg-token alg-op${token === '=' ? ' alg-eq' : ''}`}>{token}</span>
  if (/^[()[\]]$/.test(token)) return <span className="alg-token alg-paren">{token}</span>
  return <span className="alg-token alg-num">{token}</span>
}

export function tokenIsFrac(token: string): boolean {
  return /^[-−]?(?:[A-Za-z]|\d+)\/[-−]?\d+$/.test(token)
}

/** Lignes utiles par colonne dans la grille courte (aligné sur --grid-rows short × 1 col). */
const ALGEBRA_DEV_ROWS_PER_COL = 3

export function AlgebraRow({
  item,
  mode,
  padLeft = 0,
  draftGrid = true,
}: {
  item: MathItem
  mode: PreviewMode
  padLeft?: number
  draftGrid?: boolean
}) {
  const show = mode === 'answers'
  const prompt = item.prompt ?? ''
  const hasEquals = prompt.includes('=')
  const tokens = tokenizeAlgebra(prompt)
  const hasFrac = tokens.some(tokenIsFrac)
  // Équation à résoudre (x = …) vs calcul / réduction (réponse numérique ou polynôme).
  const isSolveEq = Boolean(item.unknowns?.length || item.responseAnswer)
  const answerLabel = isSolveEq
    ? (item.responseAnswer ?? `x = ${item.answer}`)
    : item.answer
  const development =
    item.development ?? (item.calcAnswer ? item.calcAnswer.split('\n').filter(Boolean) : [])
  const operations = item.operations ?? []
  const padCorrection = development.length > 0 || (show && Boolean(item.calcAnswer || item.answer))

  return (
    <div className="algebra-stack">
    <div
      className={`algebra-row${hasEquals ? ' has-inline-eq' : ''}${hasFrac ? ' has-frac' : ''}`}
      aria-label="Expression algébrique"
    >
      <div
        className={`algebra-expr${hasFrac ? ' has-frac' : ''}`}
        style={{ gridTemplateColumns: `repeat(${padLeft + tokens.length}, minmax(1.1ch, max-content))` }}
      >
        {Array.from({ length: padLeft }, (_, i) => (
          <span className="alg-token alg-pad" key={`pad-${i}`} />
        ))}
        {tokens.map((token, i) => (
          <AlgebraToken key={`${token}-${i}`} token={token} />
        ))}
      </div>
      {!hasEquals && <span className="alg-token alg-eq">=</span>}
      <span className={`answer-line-field algebra-answer ${show ? 'filled' : ''}`}>
        {show ? answerLabel : '\u00a0'}
      </span>
    </div>
    <div
      className={`draft-pad draft-pad-short ${draftGrid ? 'with-grid' : 'plain'}${
        show && padCorrection ? ' has-correction' : ''
      }`}
      aria-label="Zone de brouillon"
    >
      {show && development.length > 0 ? (
        <AlgebraDevelopmentLines lines={development} operations={operations} />
      ) : show && (item.calcAnswer || item.answer) ? (
        <strong className="filled-answer draft-pad-answer">{item.calcAnswer ?? item.answer}</strong>
      ) : null}
    </div>
    </div>
  )
}

/**
 * Développement dans la grille : colonne opérations (alignée) + équations.
 * Si ça dépasse le nombre de lignes de la grille, on ouvre une colonne suivante.
 */
function AlgebraDevelopmentLines({
  lines,
  operations,
}: {
  lines: string[]
  operations: string[]
}) {
  const hasOps = operations.some((op) => op.trim().length > 0)
  const rows: { op: string; line: string }[] = lines.map((line, i) => ({
    op: (operations[i] ?? '').trim(),
    line,
  }))
  const colCount = Math.max(1, Math.ceil(rows.length / ALGEBRA_DEV_ROWS_PER_COL))
  const columns: (typeof rows)[] = Array.from({ length: colCount }, (_, c) =>
    rows.slice(c * ALGEBRA_DEV_ROWS_PER_COL, (c + 1) * ALGEBRA_DEV_ROWS_PER_COL),
  )
  const maxOpLen = Math.max(2, ...rows.map((r) => r.op.length))

  return (
    <div
      className={`algebra-dev-columns${hasOps ? ' has-ops' : ''}`}
      style={{ gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))` }}
      aria-label="Développement"
    >
      {columns.map((col, ci) => (
        <div className="algebra-dev-col" key={`dev-col-${ci}`}>
          {col.map((row, ri) => (
            <div className="algebra-dev-row" key={`dev-${ci}-${ri}-${row.line}`}>
              {hasOps ? (
                <span className="algebra-dev-op" style={{ width: `${maxOpLen + 0.5}ch` }}>
                  {row.op || '\u00a0'}
                </span>
              ) : null}
              <strong className="filled-answer algebra-dev-eq">{row.line}</strong>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
