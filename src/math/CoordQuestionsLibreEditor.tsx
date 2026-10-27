import type { CoordQuestion, CoordReply } from './types'

export function resizeCoordQuestionsLibre(
  prev: CoordQuestion[] | undefined,
  count: number,
  defaultReply: CoordReply = 'text',
): CoordQuestion[] {
  return Array.from({ length: Math.max(0, count) }, (_, index) => {
    const existing = prev?.[index]
    if (existing) {
      return {
        prompt: existing.prompt,
        answer: existing.answer,
        reply: existing.reply ?? defaultReply,
      }
    }
    return { prompt: '', answer: '', reply: defaultReply }
  })
}

function moveIndex<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length || from === to) return list
  const next = [...list]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item!)
  return next
}

const REPLY_OPTIONS: Array<{ value: CoordReply; label: string }> = [
  { value: 'text', label: 'Texte' },
  { value: 'pair', label: 'Coordonnées ( ; )' },
  { value: 'draw', label: 'Tracer (sans case)' },
]

export function CoordQuestionsLibreEditor({
  questions,
  defaultReply = 'text',
  maxCount = 10,
  onChange,
}: {
  questions: CoordQuestion[]
  defaultReply?: CoordReply
  maxCount?: number
  onChange: (next: CoordQuestion[]) => void
}) {
  const updateAt = (index: number, patch: Partial<CoordQuestion>) => {
    onChange(
      questions.map((question, i) => (i === index ? { ...question, ...patch } : question)),
    )
  }

  return (
    <div className="phrase-libre-editor coord-questions-libre">
      <b>Questions (mode libre)</b>
      <p className="type-hint muted">
        Modifiez les énoncés et les réponses du corrigé. Le repère reste généré automatiquement.
      </p>
      <div className="phrase-libre-list">
        {questions.map((question, index) => (
          <div className="phrase-libre-card" key={`coord-q-${index}`}>
            <span className="phrase-libre-index">{index + 1}.</span>
            <div className="libre-item-body">
            <label className="libre-field is-line">
              <span>Énoncé</span>
              <textarea
                className="libre-line-input is-textarea"
                value={question.prompt}
                rows={2}
                onChange={(event) => updateAt(index, { prompt: event.target.value })}
                aria-label={`Énoncé de la question ${index + 1}`}
              />
            </label>
            <div className="libre-pair">
            <label className="libre-field is-line">
              <span>Réponse</span>
              <input
                className="libre-line-input"
                type="text"
                value={question.answer}
                onChange={(event) => updateAt(index, { answer: event.target.value })}
                aria-label={`Réponse de la question ${index + 1}`}
              />
            </label>
            <label className="libre-field is-line">
              <span>Type de réponse</span>
              <select
                className="libre-line-input is-select"
                value={question.reply ?? defaultReply}
                onChange={(event) =>
                  updateAt(index, { reply: event.target.value as CoordReply })
                }
                aria-label={`Type de réponse de la question ${index + 1}`}
              >
                {REPLY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            </div>
            <div className="phrase-libre-actions">
              <button
                type="button"
                className="phrase-libre-icon-btn"
                disabled={index === 0}
                onClick={() => onChange(moveIndex(questions, index, index - 1))}
                aria-label={`Monter la question ${index + 1}`}
              >
                ↑
              </button>
              <button
                type="button"
                className="phrase-libre-icon-btn"
                disabled={index >= questions.length - 1}
                onClick={() => onChange(moveIndex(questions, index, index + 1))}
                aria-label={`Descendre la question ${index + 1}`}
              >
                ↓
              </button>
              <button
                type="button"
                className="phrase-libre-icon-btn is-danger"
                disabled={questions.length <= 1}
                onClick={() => onChange(questions.filter((_, i) => i !== index))}
                aria-label={`Supprimer la question ${index + 1}`}
              >
                ×
              </button>
            </div>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="phrase-libre-add"
        disabled={questions.length >= maxCount}
        onClick={() =>
          onChange([
            ...questions,
            { prompt: '', answer: '', reply: defaultReply },
          ])
        }
      >
        + Ajouter une question
      </button>
    </div>
  )
}
