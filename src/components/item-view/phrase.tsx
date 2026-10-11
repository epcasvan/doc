import type { MathItem, PhraseCategory, PreviewMode } from '@/math/types'
import { PHRASE_COLORS } from '@/francais/phrase-banks'
import { highlightThemeLetters } from './highlights'

function isDarkPhraseColor(color: string): boolean {
  return color === '#1a1a1a' || color === '#111' || color === '#111111'
}

function PhrasePastille({ category, filled }: { category?: PhraseCategory; filled?: boolean }) {
  const color = category ? PHRASE_COLORS[category] : '#111'
  return (
    <span
      className={`phrase-pastille${filled ? ' filled' : ''}`}
      style={
        filled
          ? {
              backgroundColor: color,
              borderColor: color,
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact',
            }
          : undefined
      }
      aria-hidden
    />
  )
}

function PhraseAnswerSlot({
  show,
  answer,
}: {
  show: boolean
  answer?: string
}) {
  return (
    <div className="phrase-answer-slot">
      {show && answer ? (
        <strong className="filled-answer phrase-slot-answer">{answer}</strong>
      ) : (
        <span className="phrase-write-line" aria-hidden={!show} />
      )}
    </div>
  )
}

export function PhraseColorBlock({ item, mode }: { item: MathItem; mode: PreviewMode }) {
  const show = mode === 'answers'
  const tokens = item.tokens ?? []
  return (
    <div className="phrase-color-block">
      <div className="phrase-word-row">
        {tokens.map((token, i) => (
          <div className="phrase-word-slot" key={`${token.text}-${i}`}>
            <span className="phrase-word">{token.text}</span>
            <PhrasePastille category={token.category} filled={show} />
          </div>
        ))}
        <span className="phrase-period">.</span>
      </div>
    </div>
  )
}

export function PhraseOrderBlock({ item, mode }: { item: MathItem; mode: PreviewMode }) {
  const show = mode === 'answers'
  const tokens = item.tokens ?? []
  const graphemes = item.themeGraphemes ?? []
  const labelOf = (text: string) =>
    graphemes.length ? highlightThemeLetters(text, graphemes) : text
  /** Corrigé = phrase écrite sur la ligne, pas les pastilles colorées. */
  const answerText =
    item.responseAnswer ??
    (item.labels && item.labels.length > 0 ? item.labels.join(' ') : undefined) ??
    item.answer
  return (
    <div className="phrase-order-block">
      <div className="phrase-bubble-row">
        {tokens.map((token, i) => {
          const fill = PHRASE_COLORS[token.category]
          const ink = isDarkPhraseColor(fill) ? '#fff' : '#111'
          return (
            <span
              className="phrase-bubble"
              key={`${token.text}-${i}`}
              style={{
                backgroundColor: fill,
                borderColor: '#111',
                color: ink,
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact',
              }}
            >
              {labelOf(token.text)}
            </span>
          )
        })}
      </div>
      <PhraseAnswerSlot show={show} answer={answerText} />
    </div>
  )
}

export function PhraseBuildBlock({ item, mode }: { item: MathItem; mode: PreviewMode }) {
  const show = mode === 'answers'
  const pastilles = item.pastilles ?? []
  const answer = item.responseAnswer ?? (item.answer && !item.answer.includes(' · ') ? item.answer : undefined)
  return (
    <div className="phrase-build-block">
      <p className="phrase-verb-prompt">{item.prompt}</p>
      <PhraseAnswerSlot show={show} answer={answer} />
      <div className="phrase-pastille-row">
        {pastilles.map((cat, i) => (
          <PhrasePastille key={`${cat}-${i}`} category={cat} filled />
        ))}
      </div>
    </div>
  )
}

export function PhraseWriteBlock({ item, mode }: { item: MathItem; mode: PreviewMode }) {
  const show = mode === 'answers'
  const lines = Math.max(1, item.writeLines ?? 1)
  const answers = (item.responseAnswer ?? item.answer ?? '')
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean)
  return (
    <div className="phrase-write-block">
      {item.prompt ? <p className="phrase-write-prompt">{item.prompt}</p> : null}
      {lines === 1 ? (
        <PhraseAnswerSlot show={show} answer={answers[0]} />
      ) : (
        <ol className="phrase-write-lines">
          {Array.from({ length: lines }, (_, index) => (
            <li key={index}>
              <PhraseAnswerSlot show={show} answer={answers[index]} />
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
