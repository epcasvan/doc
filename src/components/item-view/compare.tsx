import { Fragment } from 'react'
import type { MathItem, PreviewMode } from '@/math/types'
import { renderMathText } from '../math/FractionView'
import { formatOperand } from './algebra'

export function EncadrementRow({ item, mode }: { item: MathItem; mode: PreviewMode }) {
  const show = mode === 'answers'
  return (
    <div className="encadrement-row" aria-label="Encadrement">
      <span className={`answer-line-field encadrement-blank ${show ? 'filled' : ''}`}>
        {show ? formatOperand(item.a) : '\u00a0'}
      </span>
      <span className="encadrement-op">&lt;</span>
      <span className="encadrement-mid">{item.prompt}</span>
      <span className="encadrement-op">&lt;</span>
      <span className={`answer-line-field encadrement-blank ${show ? 'filled' : ''}`}>
        {show ? formatOperand(item.b) : '\u00a0'}
      </span>
    </div>
  )
}

export function CompareRow({ item, mode }: { item: MathItem; mode: PreviewMode }) {
  const symbols = ['<', '=', '>'] as const
  return (
    <div className="compare-row school" aria-label="Comparer">
      <span className="compare-side left">{renderMathText(item.left ?? '')}</span>
      <div className="compare-choices" role="group" aria-label="Choisissez le symbole correct">
        {symbols.map((sym) => {
          const selected = mode === 'answers' && item.answer === sym
          return (
            <span
              key={sym}
              className={`compare-choice ${selected ? 'selected' : ''}`}
              aria-label={sym}
            >
              <span className="compare-circle">{sym}</span>
            </span>
          )
        })}
      </div>
      <span className="compare-side right">{renderMathText(item.right ?? '')}</span>
    </div>
  )
}

export function OrderRow({ item, mode }: { item: MathItem; mode: PreviewMode }) {
  const show = mode === 'answers'
  const given = item.sequence ?? []
  const parts = item.placeParts ?? []
  const sep = item.orderOp === '>' ? '>' : '<'
  const slots = Math.max(parts.length, given.length, 5)
  const compact = Boolean(item.orderCompact)
  return (
    <div className={`order-block${compact ? ' order-compact' : ''}`}>
      {item.prompt && <p className="column-prompt">{item.prompt}</p>}
      {item.orderBoxed ? (
        <div className="order-answer-row order-given-boxes" aria-label="Nombres à ranger">
          {Array.from({ length: slots }, (_, i) => (
            <Fragment key={i}>
              {i > 0 && (
                <span className="order-sep is-ghost" aria-hidden>
                  {sep}
                </span>
              )}
              {given[i] != null ? <span className="order-given-box">{given[i]}</span> : <span />}
            </Fragment>
          ))}
        </div>
      ) : (
        <div className="order-given" aria-label="Nombres à ranger">
          {given.map((term, index) => (
            <span className="order-given-term" key={`${term}-${index}`}>
              {term}
              {index < given.length - 1 ? <span className="order-given-sep">·</span> : null}
            </span>
          ))}
        </div>
      )}
      <div className="order-answer-row" aria-label="Réponse">
        {Array.from({ length: slots }, (_, i) => (
          <Fragment key={i}>
            {i > 0 && <span className="order-sep">{sep}</span>}
            <span className={`answer-line-field order-blank ${show ? 'filled' : ''}`}>
              {show ? (parts[i] ?? '\u00a0') : '\u00a0'}
            </span>
          </Fragment>
        ))}
      </div>
    </div>
  )
}

export function SequenceRow({ item, mode }: { item: MathItem; mode: PreviewMode }) {
  const blanks = new Set(item.blankIndexes ?? [])
  const answers = item.answer.split(' ; ')
  let blankAt = 0
  const digitsClass =
    item.sequenceDigits === 5 ? ' sequence-digits-5' : item.sequenceDigits ? ` sequence-digits-${item.sequenceDigits}` : ''
  return (
    <div className="sequence-block">
      {item.prompt && <p className="column-prompt">{item.prompt}</p>}
      <div className={`sequence-row${digitsClass}`}>
        {(item.sequence ?? []).map((term, index) => {
          const isBlank = term === '□' || blanks.has(index)
          if (isBlank) {
            const fromAnswer = answers[blankAt++]
            const value =
              mode === 'answers'
                ? (fromAnswer && fromAnswer.length > 0
                    ? fromAnswer
                    : term !== '□'
                      ? term
                      : '')
                : null
            return (
              <span className={`sequence-term blank ${mode === 'answers' ? 'filled' : ''}`} key={index}>
                {value ?? '\u00a0'}
              </span>
            )
          }
          return (
            <span className="sequence-term" key={index}>
              {renderMathText(term)}
            </span>
          )
        })}
      </div>
    </div>
  )
}
