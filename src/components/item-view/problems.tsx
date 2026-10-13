import { Fragment } from 'react'
import type { MathItem, PreviewMode } from '@/math/types'
import {
  computeScale,
  FractionShape,
  preColorFlat,
  ShapesRow,
} from '../math/FractionShape'
import { FractionView, looksLikeFraction, renderMathText } from '../math/FractionView'
import {
  AlgebraToken,
  EquationRow,
  FractionResultSlot,
  ParsedEquationRow,
  parseBinaryEquation,
  tokenizeAlgebra,
  tokenIsFrac,
} from './algebra'

export function SelectPillsRow({ item, mode }: { item: MathItem; mode: PreviewMode }) {
  const options = item.options ?? []
  const selectedSet = new Set(
    (item.labels?.length ? item.labels : item.answer.split(/\s*·\s*|\s*,\s*/)).map((s) => s.trim()).filter(Boolean),
  )
  const answerMode = item.answerMode ?? 'qcm'
  const isOral = item.selectVariant === 'oral'

  if (isOral && answerMode === 'text') {
    return (
      <div className="oral-answer-stack" aria-label="Réponse libre">
        <p className="oral-qcm-prompt">{item.prompt}</p>
        <span className={`answer-line-field ${mode === 'answers' ? 'filled' : ''}`}>
          {mode === 'answers' ? item.answer : '\u00a0'}
        </span>
      </div>
    )
  }

  if (isOral && answerMode === 'images' && item.optionImages?.length === options.length) {
    const letters = ['A', 'B', 'C']
    return (
      <div className="oral-answer-stack oral-qcm-images" aria-label="Choix images">
        <p className="oral-qcm-prompt">{item.prompt}</p>
        <div className="oral-qcm-options images" role="group">
          {options.map((option, index) => {
            const selected = mode === 'answers' && selectedSet.has(option)
            const src = item.optionImages?.[index]
            return (
              <div key={`${option}-${index}`} className={`oral-qcm-option ${selected ? 'selected' : ''}`}>
                {src ? <img className="oral-qcm-img" src={src} alt={option} /> : null}
                <span className="oral-qcm-option-label">{option}</span>
                <span className="oral-qcm-check">
                  {letters[index] ?? String(index + 1)}{' '}
                  <span className={`oral-qcm-box ${selected ? 'checked' : ''}`} aria-hidden>
                    {selected ? '✓' : ''}
                  </span>
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (isOral) {
    const letters = ['A', 'B', 'C']
    return (
      <div className="oral-answer-stack" aria-label="Choix">
        <p className="oral-qcm-prompt">{item.prompt}</p>
        <div className="oral-qcm-options" role="group">
          {options.map((option, index) => {
            const selected = mode === 'answers' && selectedSet.has(option)
            return (
              <div key={`${option}-${index}`} className={`oral-qcm-option ${selected ? 'selected' : ''}`}>
                <span className="oral-qcm-option-text">{option}</span>
                <span className="oral-qcm-check">
                  {letters[index] ?? String(index + 1)}{' '}
                  <span className={`oral-qcm-box ${selected ? 'checked' : ''}`} aria-hidden>
                    {selected ? '✓' : ''}
                  </span>
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (item.selectVariant === 'cards') {
    const letters = ['A', 'B', 'C']
    return (
      <div className="voc-qcm-stack" aria-label="Choix">
        {item.prompt ? <p className="voc-qcm-prompt">{item.prompt}</p> : null}
        <div className="voc-qcm-cards" role="group">
          {options.slice(0, 3).map((option, index) => {
            const selected = mode === 'answers' && selectedSet.has(option)
            return (
              <div key={`${option}-${index}`} className={`voc-qcm-card${selected ? ' selected' : ''}`}>
                <span className="voc-qcm-card-text">{option}</span>
                <span className="voc-qcm-card-check">
                  {letters[index] ?? String(index + 1)}{' '}
                  <span className={`oral-qcm-box ${selected ? 'checked' : ''}`} aria-hidden>
                    {selected ? '✓' : ''}
                  </span>
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const stacked = (item.prompt?.length ?? 0) > 28
  return (
    <div className={`select-pills-row${stacked ? ' stacked' : ''}`} aria-label="Choix">
      <span className="select-pills-prompt">{item.prompt}</span>
      <div className="select-pills" role="group">
        {options.map((option) => {
          const selected = mode === 'answers' && selectedSet.has(option)
          return (
            <span key={option} className={`select-pill ${selected ? 'selected' : ''}`}>
              {option}
            </span>
          )
        })}
      </div>
    </div>
  )
}

export function TheoryBlockView({ item }: { item: MathItem }) {
  const block = item.theoryBlock
  if (!block) return null
  if (block.kind === 'heading') {
    return <h3 className={`theory-heading${block.sub ? ' is-sub' : ''}`}>{block.text}</h3>
  }
  if (block.kind === 'paragraph') {
    return <p className="theory-paragraph">{block.text}</p>
  }
  if (block.kind === 'note') {
    return <p className="theory-note">{block.text}</p>
  }
  if (block.kind === 'rule') {
    return (
      <div className="theory-rule">
        <p className="theory-paragraph">{block.text}</p>
        {block.examples?.length ? (
          <ul className="theory-examples">
            {block.examples.map((ex, index) => (
              <li key={`${ex.correct}-${index}`}>
                <span className="theory-ex-ok">{ex.correct}</span>
                {ex.wrong ? (
                  <>
                    {' '}
                    <span className="theory-ex-bad" aria-label="à éviter">
                      (pas : {ex.wrong})
                    </span>
                  </>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    )
  }
  if (block.kind === 'list') {
    return (
      <div className="theory-list-block">
        {block.title ? <p className="theory-list-title">{block.title}</p> : null}
        <ul className="theory-list">
          {(block.items ?? []).map((entry, index) => (
            <li key={`${entry}-${index}`}>{entry}</li>
          ))}
        </ul>
      </div>
    )
  }
  if (block.kind === 'table') {
    const headers = block.headers ?? []
    const rows = block.rows ?? []
    return (
      <table className="theory-table">
        {headers.some(Boolean) ? (
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th key={`${header}-${index}`}>{header}</th>
              ))}
            </tr>
          </thead>
        ) : null}
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={`${rowIndex}-${cellIndex}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    )
  }
  return null
}

/** TCM ex. 21/22 — formes fractionnaires (port soutien-scolaire). */
export function FractionShapeBlock({ item, mode }: { item: MathItem; mode: PreviewMode }) {
  const fs = item.fracShape
  if (!fs) return null
  const show = mode === 'answers'
  const colored =
    fs.mode === 'read' || show
      ? fs.multi
        ? preColorFlat(fs.n, fs.d)
        : new Set(Array.from({ length: fs.n }, (_, k) => k))
      : new Set<number>()
  // Colorier (ex. 12) : pas de remplissage pour l’élève ; corrigé clair (comme lire).
  // Lire (ex. 13) : remplissage clair (pas aussi foncé que la bordure).
  const fillVariant =
    fs.mode === 'color' ? (show ? 'light' : 'none') : 'light'
  const scale = fs.multi ? computeScale(fs.kind, fs.copies) * 0.85 : 0.85
  return (
    <div className="frac-shape-card" aria-label={`Fraction ${fs.n}/${fs.d}`}>
      <div className="frac-shape-inner">
        <div className="frac-shape-frac">
          {fs.mode === 'color' ? (
            <span className="frac-shape-display">
              <span className="frac-shape-num">{fs.n}</span>
              <span className="frac-shape-bar" aria-hidden />
              <span className="frac-shape-den">{fs.d}</span>
            </span>
          ) : (
            <span className="frac-shape-display">
              <span className="frac-shape-slot">{show ? fs.n : '\u00a0'}</span>
              <span className="frac-shape-bar" aria-hidden />
              <span className="frac-shape-slot">{show ? fs.d : '\u00a0'}</span>
            </span>
          )}
        </div>
        <div className="frac-shape-figure">
          {fs.multi ? (
            <ShapesRow
              kind={fs.kind}
              d={fs.d}
              copies={fs.copies}
              colored={colored}
              scale={scale}
              fillVariant={fillVariant}
            />
          ) : (
            <FractionShape
              kind={fs.kind}
              d={fs.d}
              colored={colored}
              scale={scale}
              fillVariant={fillVariant}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export function PlaceValueRow({ item, mode }: { item: MathItem; mode: PreviewMode }) {
  const show = mode === 'answers'
  const labels = item.labels ?? []
  const parts = item.placeParts ?? []
  const slots = labels.length > 0 ? labels.length : Math.max(parts.length, 3)
  return (
    <div className="place-value-row" aria-label="Décomposition">
      <span className="place-value-num">{item.prompt}</span>
      <span className="place-value-eq">=</span>
      <div className="place-value-slots">
        {Array.from({ length: slots }, (_, i) => (
          <Fragment key={i}>
            {i > 0 && <span className="place-value-plus">+</span>}
            <div className="place-value-slot">
              <span className={`answer-line-field place-value-line ${show ? 'filled' : ''}`}>
                {show ? (parts[i] ?? '\u00a0') : '\u00a0'}
              </span>
              {labels[i] ? <span className="place-value-label">{labels[i]}</span> : null}
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  )
}

/** Texte de correction sur la ligne : développement (étapes) ou réponse seule. */
function stackedLineAnswer(item: MathItem): string {
  const steps = item.development?.filter(Boolean) ?? []
  if (steps.length > 0) return steps.join(' = ')
  return item.answer ?? ''
}

export function StackedPrompt({ item, mode }: { item: MathItem; mode: PreviewMode }) {
  const show = mode === 'answers'
  const prompt = item.prompt ?? ''
  const lines = prompt.split('\n')
  const lineAnswer = stackedLineAnswer(item)
  // Style rule de trois kg : « n kg … → p francs » puis « m kg … → ____ ».
  const lastTrim = lines.length >= 2 ? lines[lines.length - 1]!.trimEnd() : ''
  const isProportionArrow =
    lastTrim.endsWith('=') || lastTrim.endsWith('→') || lastTrim.endsWith('->')
  if (lines.length >= 2 && isProportionArrow) {
    const head = lines.slice(0, -1)
    const last = lastTrim
    const answer = item.answer ?? ''
    const unitMatch = answer.match(/^(.*?)\s+(francs?|CHF)\s*$/i)
    const unitLabel = unitMatch ? unitMatch[2] : null
    // Développement sur la ligne (ex. « (28 × 30) ÷ 15 = 56 ») ; sinon valeur seule.
    const shown = lineAnswer.replace(/\s+francs?\s*$/i, '').trim()
    return (
      <div className="prompt-stack proportion-kg-stack">
        {head.map((line, i) => (
          <p className="prompt-stack-text" key={`pkg-h-${i}`}>
            {line}
          </p>
        ))}
        <div className="proportion-kg-question" aria-label="Question">
          <span className="prompt-stack-text">{last}</span>
          <span className={`answer-line-field ${show ? 'filled' : ''}`}>
            {show ? shown : '\u00a0'}
          </span>
          {unitLabel ? <span className="proportion-kg-unit">{unitLabel}</span> : null}
        </div>
      </div>
    )
  }
  return (
    <div className="prompt-stack">
      <p className="prompt-stack-text">{prompt}</p>
      <span className={`answer-line-field ${show ? 'filled' : ''}`}>
        {show ? lineAnswer : '\u00a0'}
      </span>
    </div>
  )
}

export function ConvertRow({ item, mode }: { item: MathItem; mode: PreviewMode }) {
  const show = mode === 'answers'
  const convert = item.convert!
  const answer = item.answer.replace(new RegExp(`\\s*${convert.to.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`), '')
  return (
    <div className="convert-row" aria-label="Conversion">
      <span className="convert-value">{convert.value}</span>
      <span className="convert-unit">{convert.from}</span>
      <span className="convert-eq">=</span>
      <span className={`answer-line-field ${show ? 'filled' : ''}`}>{show ? answer : '\u00a0'}</span>
      <span className="convert-unit">{convert.to}</span>
    </div>
  )
}

const OP_NAME_SYMBOLS = new Set(['+', '−', '-', '×', '÷', '*', '/'])

export function InlinePrompt({ item, mode }: { item: MathItem; mode: PreviewMode }) {
  const prompt = item.prompt ?? ''
  const show = mode === 'answers'

  // Fractions (TCM ex. 30) : ne pas passer par EquationRow (qui n’affiche que a op b).
  const isFracItem =
    item.labels?.some((l) => l.startsWith('frac-')) ||
    /[-−]?\d+\s*\/\s*[-−]?\d+/.test(prompt)
  if (item.op && item.a != null && item.b != null && !isFracItem) {
    return <EquationRow item={item} mode={mode} />
  }

  // Nommer l’opération : [+] ________ (signe encadré, trait sur la même ligne).
  const opSymbol = (item.op ?? prompt.trim()).replace(/-/g, '−').replace(/\*/g, '×').replace(/\//g, '÷')
  if (
    (item.op && item.a == null && item.b == null) ||
    (OP_NAME_SYMBOLS.has(prompt.trim()) && !prompt.includes('='))
  ) {
    return (
      <div className="op-name-row" aria-label="Nommer l’opération">
        <span className="op-name-box">{opSymbol}</span>
        <span className={`answer-line-field ${show ? 'filled' : ''}`}>
          {show ? item.answer : '\u00a0'}
        </span>
      </div>
    )
  }

  const parsed = parseBinaryEquation(prompt)
  if (parsed) {
    return (
      <ParsedEquationRow a={parsed.a} op={parsed.op} b={parsed.b} answer={item.answer} mode={mode} />
    )
  }

  const endsWithEq = prompt.trimEnd().endsWith('=')
  const hasEq = prompt.includes('=')
  // Fraction dans l’énoncé sans « = » final (ou avec □) : rendu empilé + éventuel trou.
  // « n/d = » (réponse décimale ou fraction) passe par le bloc aligned-eq plus bas.
  if (prompt.includes('□') || (/[-−]?\d+\/[-−]?\d+/.test(prompt) && !endsWithEq)) {
    const filledFrac = show ? (
      <span className="filled-answer">
        <FractionView value={item.answer} />
      </span>
    ) : (
      '\u00a0'
    )
    return (
      <div className="inline-prompt equation">
        {renderMathText(prompt, filledFrac)}
        {!prompt.includes('□') && (
          <>
            <span className="eq-space" />
            <FractionResultSlot answer={item.answer} show={show} />
          </>
        )}
      </div>
    )
  }
  // Phrase / consigne sans « = » : énoncé au-dessus, trait pleine largeur dessous.
  if (!hasEq) {
    return (
      <div className="prompt-stack">
        <p className="prompt-stack-text">{renderMathText(prompt)}</p>
        <span className={`answer-line-field ${show ? 'filled' : ''}`}>
          {show ? <FractionView value={item.answer} /> : '\u00a0'}
        </span>
      </div>
    )
  }

  // « expr = » : expression à droite d’une colonne commune → = et traits alignés entre questions.
  if (endsWithEq) {
    const expr = prompt.trimEnd().replace(/=\s*$/, '').trimEnd()
    // Sans opérateur binaire (ex. 2³, √144) : même largeur de trait que eq-row (× / ÷).
    const unaryEq = !/[+\-−×÷]/.test(expr)
    const fracAnswer = looksLikeFraction(item.answer)
    const lhsIsFrac = looksLikeFraction(expr)
    // « n/d = ____ » (ex. fractions → décimal) : fraction empilée + trait sur la même ligne.
    if (lhsIsFrac && !fracAnswer) {
      return (
        <div className="inline-prompt equation frac-eq-decimal" aria-label="Fraction et réponse">
          <span className="frac-eq-lhs">
            <FractionView value={expr.trim()} />
          </span>
          <span className="eq-sign">=</span>
          <span className={`answer-line-field ${show ? 'filled' : ''}`}>
            {show ? item.answer : '\u00a0'}
          </span>
        </div>
      )
    }
    return (
      <div
        className={`inline-prompt equation aligned-eq${unaryEq ? ' fixed-ans' : ''}${fracAnswer ? ' frac-ans' : ''}`}
      >
        <span className="eq-text">{renderMathText(expr)}</span>
        <span className="eq-sign">=</span>
        {fracAnswer ? (
          <FractionResultSlot answer={item.answer} show={show} />
        ) : (
          <span className={`answer-line-field ${show ? 'filled' : ''}`}>
            {show ? <FractionView value={item.answer} /> : '\u00a0'}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="inline-prompt equation">
      <span className="eq-text">{renderMathText(prompt)}</span>
      {show && <span className="filled-answer">{item.answer}</span>}
    </div>
  )
}

export function ProblemBlock({
  item,
  mode,
  draftGrid = true,
}: {
  item: MathItem
  mode: PreviewMode
  draftGrid?: boolean
}) {
  const show = mode === 'answers'
  return (
    <div className="problem-block">
      <p className="problem-prompt">{item.prompt}</p>
      <div className="problem-field">
        <span className="field-label">Calcul</span>
        <div className={`draft-pad ${draftGrid ? 'with-grid' : 'plain'}`} aria-label="Zone de calcul">
          {show && item.calcAnswer ? (
            <strong className="filled-answer draft-pad-answer">{item.calcAnswer}</strong>
          ) : null}
        </div>
      </div>
      <div className="problem-response-line">
        <span className="response-label">Phrase réponse :</span>
        {show ? (
          <strong className="filled-answer response-value">{item.responseAnswer ?? item.answer}</strong>
        ) : (
          <span className="answer-line-field">{'\u00a0'}</span>
        )}
      </div>
    </div>
  )
}

function EquationCorrectionLines({
  lines,
  operations = [],
}: {
  lines: string[]
  operations?: string[]
}) {
  const PHASES = new Set([
    'Isoler une inconnue',
    'Substituer sa valeur',
    "Chercher l'autre inconnue",
  ])
  const rows = lines.map((line, i) => ({
    line,
    op: (operations[i] ?? '').trim(),
  }))

  const parsed = rows.map(({ line, op }) => {
    const equalIndex = line.indexOf('=')
    const hasEquation = equalIndex > 0
    const isPhase = PHASES.has(line) || /^(I|II|dans I|dans II)$/i.test(line.trim())
    return {
      op,
      hasEquation,
      isPhase: isPhase && !hasEquation,
      lhs: hasEquation ? line.slice(0, equalIndex).trim() : '',
      rhs: hasEquation ? line.slice(equalIndex + 1).trim() : '',
      full: line,
    }
  })

  const maxLhsLen = parsed.reduce(
    (max, r) => (r.hasEquation ? Math.max(max, r.lhs.length) : max),
    0,
  )
  const lhsWidthCh = Math.max(maxLhsLen + 0.5, 2)
  const maxOpLen = parsed.reduce((max, r) => Math.max(max, r.op.length), 0)
  const opWidthCh = Math.max(maxOpLen + 0.5, 3)

  return (
    <table className="equation-correction" aria-label="Correction du développement">
      <tbody>
        {parsed.map(({ hasEquation, isPhase, lhs, rhs, full, op }, i) => (
          <tr key={`${full}-${i}`}>
            <td className="eq-corr-op" style={{ width: `${opWidthCh}ch` }}>
              {op || '\u00a0'}
            </td>
            <td className="eq-corr-body">
              {hasEquation ? (
                <span className="eq-corr-eq">
                  <span className="eq-corr-lhs" style={{ width: `${lhsWidthCh}ch` }}>
                    {renderMathText(lhs)}
                  </span>
                  <span className="eq-corr-eq-sign">=</span>
                  <span className="eq-corr-rhs">{renderMathText(rhs)}</span>
                </span>
              ) : (
                <span className={isPhase ? 'eq-corr-phase' : 'eq-corr-note'}>
                  {renderMathText(full)}
                </span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function EquationBlock({
  item,
  mode,
  draftGrid = true,
}: {
  item: MathItem
  mode: PreviewMode
  draftGrid?: boolean
}) {
  const show = mode === 'answers'
  const unknowns = item.unknowns ?? ['x']
  const values = new Map<string, string>()
  const raw = item.responseAnswer ?? item.answer ?? ''
  for (const part of raw.split(';')) {
    const m = part.trim().match(/^([a-z])\s*=\s*(.+)$/i)
    if (m) values.set(m[1]!.toLowerCase(), m[2]!.trim())
  }

  const promptLines = (item.prompt ?? '').split('\n').filter(Boolean)
  const development = item.development ?? (item.calcAnswer ? item.calcAnswer.split('\n') : [])
  const operations = item.operations ?? []

  return (
    <div className="equation-block">
      {item.systemBrace && promptLines.length >= 2 ? (
        <div className="equation-system" aria-label="Système d’équations">
          <div className="equation-system-labels">
            <span>I</span>
            <span>II</span>
          </div>
          <span className="equation-system-brace" aria-hidden>
            {'{'}
          </span>
          <div className="equation-system-eqs">
            {promptLines.map((line, i) => {
              const tokens = tokenizeAlgebra(line)
              const hasFrac = tokens.some(tokenIsFrac)
              return (
                <div
                  className={`algebra-expr equation-line${hasFrac ? ' has-frac' : ''}`}
                  key={`sys-${i}`}
                  style={{
                    gridTemplateColumns: `repeat(${tokens.length}, minmax(1.1ch, max-content))`,
                  }}
                >
                  {tokens.map((token, ti) => (
                    <AlgebraToken key={`${token}-${ti}`} token={token} />
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="equation-prompt" aria-label="Équation">
          {promptLines.map((line, i) => {
            const tokens = tokenizeAlgebra(line)
            const hasFrac = tokens.some(tokenIsFrac)
            return (
              <div
                className={`algebra-expr equation-line${hasFrac ? ' has-frac' : ''}`}
                key={`eq-${i}`}
                style={{
                  gridTemplateColumns: `repeat(${tokens.length}, minmax(1.1ch, max-content))`,
                }}
              >
                {tokens.map((token, ti) => (
                  <AlgebraToken key={`${token}-${ti}`} token={token} />
                ))}
              </div>
            )
          })}
        </div>
      )}
      <div className="problem-field">
        <span className="field-label">{show ? 'Correction' : 'Développement'}</span>
        <div
          className={`draft-pad ${draftGrid ? 'with-grid' : 'plain'}${show ? ' has-correction' : ''}`}
          aria-label="Zone de développement"
        >
          {show && development.length > 0 ? (
            <EquationCorrectionLines lines={development} operations={operations} />
          ) : null}
        </div>
      </div>
      <div className="equation-answer-lines">
        {unknowns.map((u) => (
          <div className="equation-answer-line" key={u}>
            <span className="response-label">{u} =</span>
            {show ? (
              <strong className="filled-answer response-value">{values.get(u) ?? '\u00a0'}</strong>
            ) : (
              <span className="answer-line-field">{'\u00a0'}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
