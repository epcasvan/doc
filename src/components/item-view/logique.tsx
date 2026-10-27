import type { LogiquePuzzle } from '@/logique/types'
import type { MathItem, PreviewMode } from '@/math/types'

function CheckBox({ checked }: { checked?: boolean }) {
  return (
    <span className={`logique-check${checked ? ' is-checked' : ''}`} aria-hidden>
      {checked ? '✓' : ''}
    </span>
  )
}

function ChoiceCell({
  src,
  lab,
  isAnswer,
}: {
  src: string
  lab: string
  isAnswer: boolean
}) {
  return (
    <li className={`logique-choice${isAnswer ? ' is-answer' : ''}`}>
      <img className="logique-img" src={src} alt="" />
      <span className="logique-choice-meta">
        <span className="logique-choice-lab">{lab}.</span>
        <CheckBox checked={isAnswer} />
      </span>
    </li>
  )
}

export function LogiqueBlock({ item, mode }: { item: MathItem; mode: PreviewMode }) {
  const p = item.logique as LogiquePuzzle | undefined
  if (!p) return null
  const show = mode === 'answers'
  const hasChoices = p.choices.length > 0
  const isSuite = p.mode === 'suite'
  const isRotation = p.mode === 'rotation'
  const isMatrice = p.mode === 'matrice' || p.mode === 'case-manquante'
  const isAssemblage = p.mode === 'assemblage'
  const isCaseIntrus = p.mode === 'case-intrus'

  if (isCaseIntrus) {
    const src = p.stem[0]
    return (
      <div className="logique-block is-case-intrus">
        {src ? (
          <div className="logique-stem is-single">
            <img className="logique-img" src={src} alt="" />
          </div>
        ) : null}
      </div>
    )
  }

  if (isRotation) {
    const model = p.stem[0]
    return (
      <div className="logique-block is-rotation">
        <ul className="logique-rotation-row">
          <li className="logique-model">
            {model ? <img className="logique-img" src={model} alt="" /> : null}
          </li>
          {p.choices.map((src, i) => {
            const lab = p.choiceLabels?.[i] ?? String.fromCharCode(65 + i)
            return (
              <ChoiceCell
                key={`c-${i}`}
                src={src}
                lab={lab}
                isAnswer={show && p.correctIndex === i}
              />
            )
          })}
        </ul>
      </div>
    )
  }

  if (isMatrice) {
    const model = p.stem[0]
    return (
      <div className={`logique-block is-matrice${p.mode === 'case-manquante' ? ' is-case-manquante' : ''}`}>
        <ul className="logique-matrice-grid">
          <li className="logique-model">
            {model ? <img className="logique-img" src={model} alt="" /> : null}
          </li>
          {p.choices.map((src, i) => {
            const lab = p.choiceLabels?.[i] ?? String.fromCharCode(65 + i)
            return (
              <ChoiceCell
                key={`c-${i}`}
                src={src}
                lab={lab}
                isAnswer={show && p.correctIndex === i}
              />
            )
          })}
        </ul>
      </div>
    )
  }

  if (isAssemblage) {
    const model = p.stem[0]
    return (
      <div className="logique-block is-assemblage">
        <div className="logique-assemblage-stack">
          <div className="logique-model">
            {model ? <img className="logique-img" src={model} alt="" /> : null}
          </div>
          <ul className="logique-assemblage-choices">
            {p.choices.map((src, i) => {
              const lab = p.choiceLabels?.[i] ?? String.fromCharCode(65 + i)
              return (
                <ChoiceCell
                  key={`c-${i}`}
                  src={src}
                  lab={lab}
                  isAnswer={show && p.correctIndex === i}
                />
              )
            })}
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div className={`logique-block is-${p.mode}${isSuite ? ' is-suite-layout' : ''}`}>
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
            const lab = p.choiceLabels?.[i] ?? String.fromCharCode(65 + i)
            return (
              <ChoiceCell
                key={`c-${i}`}
                src={src}
                lab={lab}
                isAnswer={show && p.correctIndex === i}
              />
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
