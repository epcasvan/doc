import { PHRASE_CATEGORY_LABELS, PHRASE_COLORS } from '@/francais/phrase-banks'
import { joinPhrase } from '@/francais/phrase-sentences'
import type { MathItem, PhraseCategory, PhraseToken } from '@/math/types'

const CATEGORIES = Object.keys(PHRASE_CATEGORY_LABELS) as PhraseCategory[]

function parsePhraseKind(typeId: string): 'colorier' | 'ordre' | 'construire' | 'ecrire' | null {
  if (/-colorier$/.test(typeId)) return 'colorier'
  if (/-ordre$/.test(typeId)) return 'ordre'
  if (/-construire$/.test(typeId)) return 'construire'
  if (/-ecrire$/.test(typeId)) return 'ecrire'
  return null
}

function inkFor(category: PhraseCategory): string {
  const color = PHRASE_COLORS[category]
  return color === '#1a1a1a' || color === '#111' || color === '#111111' ? '#fff' : '#111'
}

function withFinalDot(sentence: string): string {
  const trimmed = sentence.trim()
  if (!trimmed) return ''
  return trimmed.endsWith('.') ? trimmed : `${trimmed}.`
}

function rebuildColorItem(item: MathItem, tokens: PhraseToken[]): MathItem {
  return {
    ...item,
    tokens,
    answer: tokens.map((token) => token.category).join(' · '),
    responseAnswer: undefined,
  }
}

function rebuildOrderItem(item: MathItem, tokens: PhraseToken[], correct?: string): MathItem {
  const sentence = withFinalDot(correct ?? item.responseAnswer ?? item.answer ?? joinPhrase(tokens))
  return {
    ...item,
    tokens,
    labels: tokens.map((token) => token.text),
    answer: sentence,
    responseAnswer: sentence,
  }
}

function rebuildBuildItem(
  item: MathItem,
  pastilles: PhraseCategory[],
  verb?: string,
  response?: string,
): MathItem {
  const nextVerb = verb ?? item.prompt ?? item.calcAnswer ?? ''
  const sentence = withFinalDot(
    response ?? item.responseAnswer ?? (item.answer?.includes(' · ') ? '' : (item.answer ?? '')),
  )
  return {
    ...item,
    prompt: nextVerb,
    calcAnswer: nextVerb,
    pastilles,
    answer: sentence || pastilles.join(' · '),
    responseAnswer: sentence || undefined,
  }
}

function rebuildWriteItem(item: MathItem, response: string): MathItem {
  const sentence = withFinalDot(response)
  return {
    ...item,
    answer: sentence,
    responseAnswer: sentence,
  }
}

function moveIndex<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length || from === to) return list
  const next = [...list]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item!)
  return next
}

function CategorySelect({
  value,
  onChange,
  ariaLabel,
}: {
  value: PhraseCategory
  onChange: (category: PhraseCategory) => void
  ariaLabel: string
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value as PhraseCategory)}
      aria-label={ariaLabel}
    >
      {CATEGORIES.map((cat) => (
        <option value={cat} key={cat}>
          {PHRASE_CATEGORY_LABELS[cat]}
        </option>
      ))}
    </select>
  )
}

export function PhraseLibreEditor({
  exerciseType,
  items,
  instruction,
  onChangeItems,
  onChangeInstruction,
}: {
  exerciseType: string
  items: MathItem[]
  instruction: string
  onChangeItems: (items: MathItem[]) => void
  onChangeInstruction: (instruction: string) => void
}) {
  const kind = parsePhraseKind(exerciseType)
  if (!kind) return null

  function updateItem(index: number, next: MathItem) {
    const copy = [...items]
    copy[index] = next
    onChangeItems(copy)
  }

  if (kind === 'ecrire') {
    return (
      <div className="phrase-libre-editor">
        <b>Consigne et phrases exemples (mode libre)</b>
        <label className="phrase-libre-field">
          <span>Texte de la consigne</span>
          <textarea
            rows={3}
            value={instruction}
            onChange={(event) => onChangeInstruction(event.target.value)}
            aria-label="Consigne de production écrite"
          />
        </label>
        <small className="muted">
          Une phrase exemple par ligne d’écriture : elle apparaît au corrigé.
        </small>
        <div className="phrase-libre-list">
          {items.map((item, itemIndex) => {
            const lineCount = Math.max(1, item.writeLines ?? 1)
            const answers = (item.responseAnswer ?? item.answer ?? '')
              .split(/\n/)
              .map((line) => line.trim())
            while (answers.length < lineCount) answers.push('')
            return (
              <div className="phrase-libre-card" key={`phrase-libre-write-${itemIndex}`}>
                <span className="phrase-libre-index">{itemIndex + 1}.</span>
                {Array.from({ length: lineCount }, (_, lineIndex) => (
                  <label className="phrase-libre-field" key={`${itemIndex}-l-${lineIndex}`}>
                    <span>
                      Phrase exemple
                      {lineCount > 1 ? ` ${lineIndex + 1}` : ''}
                    </span>
                    <textarea
                      rows={2}
                      value={answers[lineIndex] ?? ''}
                      onChange={(event) => {
                        const next = [...answers]
                        next[lineIndex] = event.target.value
                        updateItem(
                          itemIndex,
                          rebuildWriteItem(item, next.slice(0, lineCount).join('\n')),
                        )
                      }}
                      aria-label={`Phrase exemple ${itemIndex + 1}${
                        lineCount > 1 ? `, ligne ${lineIndex + 1}` : ''
                      }`}
                    />
                  </label>
                ))}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  function setTokens(itemIndex: number, tokens: PhraseToken[], correct?: string) {
    const item = items[itemIndex]
    if (!item) return
    if (item.layout === 'phrase-order' || kind === 'ordre') {
      updateItem(itemIndex, rebuildOrderItem(item, tokens, correct))
    } else {
      updateItem(itemIndex, rebuildColorItem(item, tokens))
    }
  }

  function updateToken(itemIndex: number, tokenIndex: number, patch: Partial<PhraseToken>) {
    const item = items[itemIndex]
    if (!item?.tokens) return
    const tokens = item.tokens.map((token, i) => (i === tokenIndex ? { ...token, ...patch } : token))
    setTokens(itemIndex, tokens)
  }

  function addToken(itemIndex: number) {
    const item = items[itemIndex]
    if (!item) return
    const tokens = [...(item.tokens ?? []), { text: '', category: 'nom' as PhraseCategory }]
    setTokens(itemIndex, tokens)
  }

  function removeToken(itemIndex: number, tokenIndex: number) {
    const item = items[itemIndex]
    if (!item?.tokens || item.tokens.length <= 1) return
    setTokens(
      itemIndex,
      item.tokens.filter((_, i) => i !== tokenIndex),
    )
  }

  function moveToken(itemIndex: number, tokenIndex: number, delta: number) {
    const item = items[itemIndex]
    if (!item?.tokens) return
    setTokens(itemIndex, moveIndex(item.tokens, tokenIndex, tokenIndex + delta))
  }

  function setPastilles(itemIndex: number, pastilles: PhraseCategory[]) {
    const item = items[itemIndex]
    if (!item) return
    updateItem(itemIndex, rebuildBuildItem(item, pastilles))
  }

  return (
    <div className="phrase-libre-editor">
      <b>
        {kind === 'construire'
          ? 'Verbe, pastilles et phrase (mode libre)'
          : kind === 'ordre'
            ? 'Phrases et couleurs (mode libre)'
            : 'Mots et couleurs (mode libre)'}
      </b>
      <small className="muted">
        Contenu tiré de la banque : corrigez les mots, les couleurs ou les pastilles si besoin.
      </small>
      <div className="phrase-libre-list">
        {items.map((item, itemIndex) => (
          <div className="phrase-libre-card" key={`phrase-libre-${itemIndex}`}>
            <span className="phrase-libre-index">{itemIndex + 1}.</span>

            {kind === 'construire' ? (
              <>
                <label className="phrase-libre-field">
                  <span>Verbe</span>
                  <input
                    type="text"
                    value={item.prompt ?? item.calcAnswer ?? ''}
                    onChange={(event) => {
                      updateItem(
                        itemIndex,
                        rebuildBuildItem(item, item.pastilles ?? [], event.target.value),
                      )
                    }}
                    aria-label={`Verbe de la phrase ${itemIndex + 1}`}
                  />
                </label>
                <div className="phrase-libre-pastilles">
                  {(item.pastilles ?? []).map((cat, pastilleIndex) => (
                    <div className="phrase-libre-pastille-row" key={`${itemIndex}-p-${pastilleIndex}`}>
                      <select
                        className="phrase-libre-word-fill"
                        value={cat}
                        onChange={(event) => {
                          const next = [...(item.pastilles ?? [])]
                          next[pastilleIndex] = event.target.value as PhraseCategory
                          setPastilles(itemIndex, next)
                        }}
                        style={{
                          backgroundColor: PHRASE_COLORS[cat],
                          color: inkFor(cat),
                          borderColor: '#111',
                        }}
                        aria-label={`Catégorie de la pastille ${pastilleIndex + 1}`}
                      >
                        {CATEGORIES.map((option) => (
                          <option value={option} key={option}>
                            {PHRASE_CATEGORY_LABELS[option]}
                          </option>
                        ))}
                      </select>
                      <div className="phrase-libre-actions">
                        <button
                          type="button"
                          className="phrase-libre-icon-btn"
                          aria-label="Monter la pastille"
                          disabled={pastilleIndex === 0}
                          onClick={() =>
                            setPastilles(
                              itemIndex,
                              moveIndex(item.pastilles ?? [], pastilleIndex, pastilleIndex - 1),
                            )
                          }
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className="phrase-libre-icon-btn"
                          aria-label="Descendre la pastille"
                          disabled={pastilleIndex >= (item.pastilles?.length ?? 0) - 1}
                          onClick={() =>
                            setPastilles(
                              itemIndex,
                              moveIndex(item.pastilles ?? [], pastilleIndex, pastilleIndex + 1),
                            )
                          }
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          className="phrase-libre-icon-btn is-danger"
                          aria-label="Supprimer la pastille"
                          disabled={(item.pastilles?.length ?? 0) <= 1}
                          onClick={() =>
                            setPastilles(
                              itemIndex,
                              (item.pastilles ?? []).filter((_, i) => i !== pastilleIndex),
                            )
                          }
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="phrase-libre-add"
                  onClick={() => setPastilles(itemIndex, [...(item.pastilles ?? []), 'nom'])}
                >
                  + Pastille
                </button>
                <label className="phrase-libre-field">
                  <span>Phrase réponse (corrigé)</span>
                  <input
                    type="text"
                    value={item.responseAnswer ?? (item.answer?.includes(' · ') ? '' : (item.answer ?? ''))}
                    onChange={(event) =>
                      updateItem(
                        itemIndex,
                        rebuildBuildItem(
                          item,
                          item.pastilles ?? [],
                          item.prompt ?? item.calcAnswer,
                          event.target.value,
                        ),
                      )
                    }
                    aria-label={`Phrase réponse ${itemIndex + 1}`}
                  />
                </label>
              </>
            ) : (
              <>
                <div className="phrase-libre-tokens">
                  {(item.tokens ?? []).map((token, tokenIndex) => (
                    <div className="phrase-libre-token" key={`${itemIndex}-${tokenIndex}`}>
                      <input
                        type="text"
                        className="phrase-libre-word-fill"
                        value={token.text}
                        onChange={(event) =>
                          updateToken(itemIndex, tokenIndex, { text: event.target.value })
                        }
                        style={{
                          backgroundColor: PHRASE_COLORS[token.category],
                          color: inkFor(token.category),
                          borderColor: '#111',
                        }}
                        aria-label={`Mot ${tokenIndex + 1} de la phrase ${itemIndex + 1}`}
                      />
                      <CategorySelect
                        value={token.category}
                        ariaLabel={`Catégorie du mot ${tokenIndex + 1}`}
                        onChange={(category) =>
                          updateToken(itemIndex, tokenIndex, { category })
                        }
                      />
                      <div className="phrase-libre-actions">
                        {kind === 'ordre' ? (
                          <>
                            <button
                              type="button"
                              className="phrase-libre-icon-btn"
                              aria-label="Monter le mot"
                              disabled={tokenIndex === 0}
                              onClick={() => moveToken(itemIndex, tokenIndex, -1)}
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              className="phrase-libre-icon-btn"
                              aria-label="Descendre le mot"
                              disabled={tokenIndex >= (item.tokens?.length ?? 0) - 1}
                              onClick={() => moveToken(itemIndex, tokenIndex, 1)}
                            >
                              ↓
                            </button>
                          </>
                        ) : null}
                        <button
                          type="button"
                          className="phrase-libre-icon-btn is-danger"
                          aria-label="Supprimer le mot"
                          disabled={(item.tokens?.length ?? 0) <= 1}
                          onClick={() => removeToken(itemIndex, tokenIndex)}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button type="button" className="phrase-libre-add" onClick={() => addToken(itemIndex)}>
                  + Mot
                </button>
                {kind === 'ordre' ? (
                  <label className="phrase-libre-field">
                    <span>Phrase correcte</span>
                    <input
                      type="text"
                      value={item.responseAnswer ?? item.answer ?? ''}
                      onChange={(event) =>
                        updateItem(
                          itemIndex,
                          rebuildOrderItem(item, item.tokens ?? [], event.target.value),
                        )
                      }
                      aria-label={`Phrase correcte ${itemIndex + 1}`}
                    />
                  </label>
                ) : null}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export function isPhraseLibreEditable(typeId: string): boolean {
  return parsePhraseKind(typeId) != null
}
