import type { MathItem } from '@/math/types'

/**
 * Éditeur libre générique : consigne + énoncé / réponse / choix pour chaque item.
 * Sert de secours pour tous les domaines sans éditeur spécialisé.
 */
export function GenericLibreEditor({
  instruction,
  items,
  onChangeInstruction,
  onChangeItems,
}: {
  instruction: string
  items: MathItem[]
  onChangeInstruction: (value: string) => void
  onChangeItems: (items: MathItem[]) => void
}) {
  const patchItem = (index: number, patch: Partial<MathItem>) => {
    onChangeItems(items.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  return (
    <div className="quad-libre-block generic-libre-editor">
      <b>Contenu de la fiche</b>
      <p className="type-hint muted">
        La consigne est en haut. Chaque question a son énoncé, puis la réponse du corrigé.
      </p>
      <label className="libre-field is-line">
        <span>Consigne</span>
        <textarea
          className="libre-line-input is-textarea"
          rows={2}
          value={instruction}
          onChange={(event) => onChangeInstruction(event.target.value)}
        />
      </label>
      <ul className="libre-item-list" aria-label="Questions">
        {items.map((item, index) => (
          <li key={`libre-item-${index}`} className="libre-item-card is-libre-row">
            <span className="libre-item-num is-accent">{index + 1}.</span>
            <div className="libre-item-body">
              <div className="libre-pair">
                <label className="libre-field is-line">
                  <span>Énoncé</span>
                  <input
                    className="libre-line-input"
                    type="text"
                    value={item.prompt ?? item.left ?? ''}
                    onChange={(event) =>
                      patchItem(index, {
                        prompt: event.target.value,
                        ...(item.left != null ? { left: event.target.value } : {}),
                      })
                    }
                  />
                </label>
                <label className="libre-field is-line">
                  <span>Réponse</span>
                  <input
                    className="libre-line-input"
                    type="text"
                    value={item.answer ?? ''}
                    onChange={(event) => patchItem(index, { answer: event.target.value })}
                  />
                </label>
              </div>
              {item.options && item.options.length > 0 ? (
                <div className="libre-options">
                  <b>Choix</b>
                  {item.options.map((opt, oi) => (
                    <label key={`opt-${index}-${oi}`} className="libre-field is-line">
                      <span>{String.fromCharCode(65 + oi)}</span>
                      <input
                        className="libre-line-input"
                        type="text"
                        value={opt}
                        onChange={(event) => {
                          const options = [...(item.options ?? [])]
                          options[oi] = event.target.value
                          patchItem(index, { options })
                        }}
                      />
                    </label>
                  ))}
                </div>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
      {items.length === 0 ? (
        <p className="type-hint muted">Aucun item sur cette fiche — générez d’abord un contenu.</p>
      ) : null}
    </div>
  )
}
