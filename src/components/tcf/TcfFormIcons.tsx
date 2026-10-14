import type { ReactElement } from 'react'
import { TCF_FORME_LABELS } from '@/tcf/formes'
import type { TcfTypeReponse } from '@/tcf/types'

function IconTexte() {
  return (
    <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden>
      <path
        d="M3 4h10M3 8h10M3 12h7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconImage() {
  return (
    <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden>
      <rect
        x="2.5"
        y="3.5"
        width="11"
        height="9"
        rx="1.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="6" cy="7" r="1.1" fill="currentColor" />
      <path
        d="M3.5 11.2 6.2 8.8l2.2 2 2-2.4 2.1 2.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconPhrase() {
  return (
    <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden>
      <path
        d="M3 12.5 4.2 9.2 11.8 2.8a1.2 1.2 0 0 1 1.7 1.7L6 11l-3 1.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M10.6 4.2 12.2 5.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

const FORM_ICONS: Record<TcfTypeReponse, () => ReactElement> = {
  qcm_texte: IconTexte,
  qcm_image: IconImage,
  lignes: IconPhrase,
}

/** Icônes Texte / Image / Phrase — marge gauche, colonne verticale (aperçu). */
export function TcfFormMarginIcons({
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
    <div
      className="no-print draft-grid-chip-margin tcf-margin-form-icons"
      role="group"
      aria-label="Forme de réponse"
    >
      {(['qcm_texte', 'qcm_image', 'lignes'] as const)
        .filter((form) => filled.includes(form))
        .map((form) => {
          const on = active === form
          const Icon = FORM_ICONS[form]
          return (
            <button
              key={form}
              type="button"
              className={`draft-grid-chip tcf-form-icon-btn ${on ? 'on' : 'off'}`}
              aria-pressed={on}
              aria-label={`Forme ${TCF_FORME_LABELS[form]}`}
              title={TCF_FORME_LABELS[form]}
              onClick={() => onSelect(form)}
            >
              <Icon />
            </button>
          )
        })}
    </div>
  )
}
