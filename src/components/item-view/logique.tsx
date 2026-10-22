import type { LogiquePuzzle } from '@/logique/types'
import type { MathItem, PreviewMode } from '@/math/types'

function CheckBox({ checked }: { checked?: boolean }) {
  return (
    <span className={`logique-check${checked ? ' is-checked' : ''}`} aria-hidden>
      {checked ? '✓' : ''}
    </span>
  )
}

export function LogiqueBlock({ item, mode }: { item: MathItem; mode: PreviewMode }) {
  const p = item.logique as LogiquePuzzle | undefined
  if (!p) return null
  const show = mode === 'answers'
  const hasChoices = p.choices.length > 0

  return (
    <div className={`logique-block is-${p.mode}`}>
      {p.stem.length ? (
        <ul className={`logique-stem${p.stem.length === 1 ? ' is-single' : ''}`}>
          {p.stem.map((src, i) => (
            <li key={`s-${i}`} className="logique-img-wrap">
              <img className="logique-img" src={src} alt="" />
            </li>
          ))}
        </ul>
      ) : null}

      {hasChoices ? (
        <ul className="logique-choices">
          {p.choices.map((src, i) => {
            const isAnswer = show && p.correctIndex === i
            return (
              <li key={`c-${i}`} className={`logique-choice${isAnswer ? ' is-answer' : ''}`}>
                <CheckBox checked={isAnswer} />
                <span className="logique-choice-lab">
                  {p.choiceLabels?.[i] ?? String.fromCharCode(65 + i)}
                </span>
                <img className="logique-img" src={src} alt="" />
              </li>
            )
          })}
        </ul>
      ) : null}

      {p.answerLine || !hasChoices ? (
        <span className={`answer-line-field${show ? ' is-filled' : ''}`}>
          {show && item.answer && item.answer !== '…' ? item.answer : '\u00a0'}
        </span>
      ) : null}
    </div>
  )
}
