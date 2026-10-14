import { TCF_REPONSES } from './catalog'
import { ImageField, NumberField, TextField } from './fields'
import { filledForms, switchQuestionForm, TCF_FORME_LABELS } from './formes'
import { TCF_LETTRES, TCF_QCM_MAX, TCF_QCM_MIN } from './templates'
import type { TcfQuestion, TcfTypeReponse } from './types'

const CHOICE_IDS = ['a', 'b', 'c', 'd'] as const

/**
 * Édition d’une question CE / CO : type de réponse, énoncé (au-dessus),
 * puis réponse (QCM texte / images : 3 choix, 4e optionnel ; ou lignes).
 * Chaque question peut avoir jusqu’à 3 formes (Texte / Image / Phrase) ;
 * le basculement préserve les formes déjà saisies.
 */
export function QuestionEditor({
  index,
  question: q,
  reponses,
  audioCount,
  onChange,
  onRemove,
}: {
  index: number
  question: TcfQuestion
  reponses: readonly TcfTypeReponse[]
  /** CO 6 / 3 audios : choix du n° d’audio. */
  audioCount?: number
  onChange: (next: TcfQuestion) => void
  onRemove: () => void
}) {
  function changeType(type: TcfTypeReponse) {
    if (type === q.type_reponse) return
    onChange(switchQuestionForm(q, type))
  }
  const filled = filledForms(q)

  return (
    <fieldset className="tcf-question-editor">
      <legend>
        <span className="tcf-q-legend-title">
          Question {index + 1}
          <button
            type="button"
            className="calli-field-remove"
            aria-label={`Supprimer la question ${index + 1}`}
            onClick={onRemove}
          >
            ×
          </button>
        </span>
        <div className="mode-toggle is-3" role="group" aria-label="Type de réponse">
          {TCF_REPONSES.filter((r) => reponses.includes(r.id)).map((r) => (
            <button
              key={r.id}
              type="button"
              className={q.type_reponse === r.id ? 'active' : ''}
              onClick={() => changeType(r.id)}
              title={
                filled.includes(r.id) || r.id === q.type_reponse
                  ? `Forme ${TCF_FORME_LABELS[r.id]}`
                  : `Créer la forme ${TCF_FORME_LABELS[r.id]} (vide pour l’instant)`
              }
            >
              {TCF_FORME_LABELS[r.id]}
              {filled.includes(r.id) && r.id !== q.type_reponse ? ' ·' : ''}
            </button>
          ))}
        </div>
      </legend>
      <p className="muted" style={{ margin: 0, fontSize: 11 }}>
        Trois formes (Texte / Image / Phrase) : basculez pour les remplir. Sur la fiche, les
        icônes sont en colonne dans la marge gauche ; seules les formes remplies sont actives.
      </p>
      {audioCount ? (
        <label className="tcf-field is-number">
          <span>Audio n°</span>
          <select
            className="pill-input"
            value={q.audio ?? 1}
            onChange={(event) => onChange({ ...q, audio: Number(event.target.value) })}
          >
            {Array.from({ length: audioCount }, (_, i) => (
              <option key={i} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <TextField label="Énoncé" value={q.enonce} multiline rows={2} onChange={(enonce) => onChange({ ...q, enonce })} />
      <div className="tcf-row">
        <NumberField
          label="Points (0 = page)"
          value={q.points ?? 0}
          min={0}
          max={20}
          step={0.5}
          onChange={(points) => onChange({ ...q, points: points > 0 ? points : undefined })}
        />
        <ImageField
          label="Image sous l’énoncé (optionnelle)"
          value={q.image ?? ''}
          onChange={(image) => onChange({ ...q, image: image || undefined })}
        />
      </div>

      {q.type_reponse === 'lignes' ? (
        <>
          <NumberField
            label="Nombre de lignes"
            value={q.nb_lignes ?? 2}
            min={q.image || q.tableau?.length ? 0 : 1}
            max={12}
            onChange={(nb_lignes) => onChange({ ...q, nb_lignes })}
          />
          <TextField
            label="Tableau à compléter (une ligne par case : libellé | réponse)"
            value={(q.tableau ?? []).map((row) => `${row.label} | ${row.reponse}`).join('\n')}
            multiline
            rows={Math.max(2, (q.tableau?.length ?? 0) + 1)}
            onChange={(text) => {
              const tableau = text.trim()
                ? text.split('\n').map((line) => {
                    const [label = '', ...rest] = line.split('|')
                    return { label: label.trim(), reponse: rest.join('|').trim() }
                  })
                : undefined
              onChange({ ...q, tableau })
            }}
          />
          <TextField
            label="Réponse modèle (corrigé)"
            value={q.reponse_modele ?? ''}
            multiline
            rows={2}
            onChange={(reponse_modele) => onChange({ ...q, reponse_modele })}
          />
        </>
      ) : (
        <>
          <ul className="tcf-choix-list">
            {q.choix.map((c, i) => {
              const setChoice = (patch: { texte?: string; image?: string; correct?: boolean; fixe?: boolean }) => {
                if (q.type_reponse === 'qcm_texte') {
                  onChange({
                    ...q,
                    choix: q.choix.map((x, k) =>
                      k === i ? { ...x, ...patch } : patch.correct ? { ...x, correct: false } : x,
                    ),
                  })
                } else {
                  onChange({
                    ...q,
                    choix: q.choix.map((x, k) =>
                      k === i ? { ...x, ...patch } : patch.correct ? { ...x, correct: false } : x,
                    ),
                  })
                }
              }
              return (
                <li key={c.id} className="tcf-choix-row">
                  <label className="tcf-choix-correct" title="Bonne réponse">
                    <input
                      type="radio"
                      name={`tcf-q${index}-correct`}
                      checked={c.correct === true}
                      onChange={() => setChoice({ correct: true })}
                    />
                    <span>{TCF_LETTRES[i]}</span>
                  </label>
                  {'texte' in c ? (
                    <input
                      className="pill-input"
                      type="text"
                      value={c.texte}
                      placeholder={`Choix ${TCF_LETTRES[i]}`}
                      aria-label={`Choix ${TCF_LETTRES[i]}`}
                      onChange={(event) => setChoice({ texte: event.target.value })}
                    />
                  ) : (
                    <ImageField
                      label={`Image ${TCF_LETTRES[i]}`}
                      value={c.image}
                      onChange={(image) => setChoice({ image })}
                    />
                  )}
                  <label className="tcf-choix-fixe" title="Garde sa place lors du mélange">
                    <input
                      type="checkbox"
                      checked={c.fixe === true}
                      onChange={(event) => setChoice({ fixe: event.target.checked || undefined })}
                    />
                    fixe
                  </label>
                  {i >= TCF_QCM_MIN ? (
                    <button
                      type="button"
                      className="calli-field-remove"
                      aria-label={`Supprimer le choix ${TCF_LETTRES[i]}`}
                      onClick={() => {
                        const removedCorrect = c.correct === true
                        if (q.type_reponse === 'qcm_texte') {
                          const choix = q.choix.filter((_, k) => k !== i)
                          if (removedCorrect) choix[0] = { ...choix[0]!, correct: true }
                          onChange({ ...q, choix })
                        } else {
                          const choix = q.choix.filter((_, k) => k !== i)
                          if (removedCorrect) choix[0] = { ...choix[0]!, correct: true }
                          onChange({ ...q, choix })
                        }
                      }}
                    >
                      ×
                    </button>
                  ) : null}
                </li>
              )
            })}
          </ul>
          <div className="tcf-row">
            <button
              type="button"
              className="tcf-btn"
              disabled={q.choix.length >= TCF_QCM_MAX}
              onClick={() => {
                const used = new Set(q.choix.map((c) => c.id))
                const id = CHOICE_IDS.find((x) => !used.has(x)) ?? `c${q.choix.length + 1}`
                if (q.type_reponse === 'qcm_texte') onChange({ ...q, choix: [...q.choix, { id, texte: '' }] })
                else onChange({ ...q, choix: [...q.choix, { id, image: '' }] })
              }}
            >
              + ajouter un choix
            </button>
            <label className="tcf-choix-fixe">
              <input
                type="checkbox"
                checked={q.melanger !== false}
                onChange={(event) => onChange({ ...q, melanger: event.target.checked })}
              />
              Mélanger les choix
            </label>
          </div>
        </>
      )}
    </fieldset>
  )
}
