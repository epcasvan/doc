import type { ReactNode } from 'react'
import { formatPointsLabel } from '@/tcm/test'
import type { PreviewMode } from '@/math/types'
import { TCF_FORME_LABELS } from '@/tcf/formes'
import type { TcfChoixRendu, TcfGrille, TcfLigneTableau, TcfTypeReponse } from '@/tcf/types'
import { TcfImage } from './TexteSupport'

/** Barème « / 1 point », visible seulement en mode évaluation (`.is-eval`). */
export function TcfPoints({ points }: { points?: number }) {
  return points != null ? <span className="tcf-pts">/ {formatPointsLabel(points)}</span> : null
}

/** Toggle Texte / Image / Phrase à droite du titre (aperçu fiche, non imprimé). */
export function TcfFormToggle({
  filled,
  active,
  onSelect,
}: {
  filled: readonly TcfTypeReponse[]
  active: TcfTypeReponse
  onSelect: (form: TcfTypeReponse) => void
}) {
  if (filled.length <= 1) return null
  return (
    <span className="no-print tcf-form-toggle" role="group" aria-label="Forme de réponse">
      {(['qcm_texte', 'qcm_image', 'lignes'] as const)
        .filter((form) => filled.includes(form))
        .map((form) => {
          const on = active === form
          return (
            <button
              key={form}
              type="button"
              className={`draft-grid-chip tcf-form-chip ${on ? 'on' : 'off'}`}
              aria-pressed={on}
              title={`Afficher la réponse « ${TCF_FORME_LABELS[form]} »`}
              onClick={() => onSelect(form)}
            >
              {TCF_FORME_LABELS[form]}
            </button>
          )
        })}
    </span>
  )
}

function Enonce({
  numero,
  enonce,
  audioLabel,
  points,
  image,
  formToggle,
}: {
  numero: number
  enonce: string
  audioLabel?: string
  points?: number
  image?: string
  formToggle?: ReactNode
}) {
  return (
    <>
      <p className="tcf-enonce">
        <span className="tcf-num">{numero}.</span>
        {audioLabel ? <span className="tcf-audio-tag">{audioLabel}</span> : null}
        <span className="tcf-enonce-text">{enonce}</span>
        {formToggle}
        <TcfPoints points={points} />
      </p>
      {image ? <TcfImage src={image} alt={`Document de la question ${numero}`} className="tcf-image is-question" /> : null}
    </>
  )
}

/** Pastille de lettre : entourée au corrigé pour la bonne réponse (lisible en N&B). */
function Lettre({ lettre, on }: { lettre: string; on: boolean }) {
  return <span className={`tcf-lettre${on ? ' is-correct' : ''}`}>{lettre}</span>
}

type QuestionHead = {
  numero: number
  enonce: string
  audioLabel?: string
  points?: number
  image?: string
  formToggle?: ReactNode
}

export function QuestionQCMTexte({
  choix,
  mode,
  ...head
}: QuestionHead & {
  choix: TcfChoixRendu[]
  mode: PreviewMode
}) {
  const show = mode === 'answers'
  return (
    <div className="tcf-question">
      <Enonce {...head} />
      <ul className="tcf-qcm-texte">
        {choix.map((c) => (
          <li key={c.lettre} className={show && c.correct ? 'is-correct' : undefined}>
            <span className="tcf-case" aria-hidden>
              {show && c.correct ? '✔' : ''}
            </span>
            <Lettre lettre={c.lettre} on={show && c.correct} />
            <span>{c.texte}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function QuestionQCMImage({
  choix,
  mode,
  ...head
}: QuestionHead & {
  choix: TcfChoixRendu[]
  mode: PreviewMode
}) {
  const show = mode === 'answers'
  return (
    <div className="tcf-question">
      <Enonce {...head} />
      <ul className={`tcf-qcm-images is-${choix.length}`}>
        {choix.map((c) => (
          <li key={c.lettre} className={show && c.correct ? 'is-correct' : undefined}>
            <TcfImage src={c.image ?? ''} alt={`Choix ${c.lettre}`} />
            <span className="tcf-qcm-image-foot">
              <span className="tcf-case" aria-hidden>
                {show && c.correct ? '✔' : ''}
              </span>
              <Lettre lettre={c.lettre} on={show && c.correct} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Traits de réponse pleine largeur (couleur du thème). Le modèle s’affiche au corrigé. */
export function QuestionLignes({
  nbLignes,
  reponseModele,
  tableau,
  mode,
  ...head
}: QuestionHead & {
  nbLignes: number
  reponseModele?: string
  tableau?: TcfLigneTableau[]
  mode: PreviewMode
}) {
  const show = mode === 'answers'
  return (
    <div className="tcf-question">
      <Enonce {...head} />
      {tableau?.length ? (
        <table className="tcf-tableau">
          <tbody>
            {tableau.map((row, i) => (
              <tr key={i}>
                <th scope="row">{row.label}</th>
                <td>{show ? row.reponse : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
      {nbLignes > 0 ? (
        <LignesReponse nbLignes={nbLignes} texte={show ? reponseModele : undefined} />
      ) : show && reponseModele?.trim() ? (
        <p className="tcf-lignes-modele">{reponseModele}</p>
      ) : null}
    </div>
  )
}

export function LignesReponse({ nbLignes, texte }: { nbLignes: number; texte?: string }) {
  const n = Math.max(1, nbLignes)
  return (
    <div className="tcf-lignes">
      {texte?.trim() ? <p className="tcf-lignes-modele">{texte}</p> : null}
      {Array.from({ length: n }, (_, i) => (
        <span key={i} className="answer-line-field tcf-ligne" aria-hidden />
      ))}
    </div>
  )
}

/** CO : situations illustrées, « Situation n° … » sous chaque image ; corrigé = n° ou « — ». */
export function AssociationSituations({
  situations,
  mode,
}: {
  situations: Array<{ lettre: string; image: string; dialogue: number | null }>
  mode: PreviewMode
}) {
  const show = mode === 'answers'
  return (
    <ul className="tcf-situations">
      {situations.map((s) => (
        <li key={s.lettre}>
          <TcfImage src={s.image} alt={`Situation ${s.lettre}`} />
          <span className="tcf-situation-foot">
            <b>{s.lettre}.</b> Situation n°
            <span className="answer-line-field compact tcf-situation-num">
              {show ? (s.dialogue ?? '—') : ''}
            </span>
          </span>
        </li>
      ))}
    </ul>
  )
}

/** Grille de l’oral (critères notés globalement). */
export function GrilleOral({ grille }: { grille: TcfGrille }) {
  return (
    <table className="tcf-grille">
      <tbody>
        {grille.criteres.map((critere, i) => (
          <tr key={critere}>
            <th scope="row">{critere}</th>
            {i === 0 ? (
              <td rowSpan={grille.criteres.length} className="tcf-grille-points">
                … / {formatPointsLabel(grille.points)}
              </td>
            ) : null}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/** CO : 5 images, case sous chacune ; corrigé ✔ (à cocher) / ✘ (à laisser vide). */
export function ImagesACocher({
  numero,
  consigne,
  images,
  score,
  mode,
}: {
  numero: number
  consigne: string
  images: Array<{ id: string; image: string; correct: boolean }>
  score: 'par_image' | 'tout_ou_rien'
  mode: PreviewMode
}) {
  const show = mode === 'answers'
  return (
    <div className="tcf-question">
      {consigne ? <Enonce numero={numero} enonce={consigne} /> : null}
      <ul className="tcf-images-cocher">
        {images.map((img, i) => (
          <li
            key={img.id}
            className={show ? (img.correct ? 'is-correct' : 'is-wrong') : undefined}
          >
            <TcfImage src={img.image} alt={`Image ${i + 1}`} />
            <span className="tcf-case is-large" aria-label={show ? (img.correct ? 'à cocher' : 'à laisser vide') : undefined}>
              {show ? (img.correct ? '✔' : '✘') : ''}
            </span>
          </li>
        ))}
      </ul>
      {show ? (
        <p className="tcf-score-note">
          {score === 'tout_ou_rien'
            ? 'Notation : tout ou rien (les 5 images justes).'
            : 'Notation : 1 point par image juste (sur 5).'}
        </p>
      ) : null}
    </div>
  )
}
