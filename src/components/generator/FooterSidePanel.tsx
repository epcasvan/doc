import {
  ALPHA_SOUTIEN_REFERENCE,
  CLASS_LEVELS,
  CLASS_NUMBERS,
  COURSES,
  DEFAULT_INSTITUTIONAL_LOGO,
  type InstitutionalHeader,
} from '@/components/math/PrintDocumentChrome'
import { SelectBox } from '@/components/generator/SelectBox'

export type FooterSidePanelProps = {
  institutional: InstitutionalHeader
  setInstitutional: (next: InstitutionalHeader) => void
  evalMode: boolean
  activeExerciseLabel: string
  referenceLocked: boolean
  onClose: () => void
}

export function FooterSidePanel({
  institutional,
  setInstitutional,
  evalMode,
  activeExerciseLabel,
  referenceLocked,
  onClose,
}: FooterSidePanelProps) {
  return (
    <aside className="side-tool-panel is-footer no-print" aria-label="En-tête et pied de page">
      <div className="side-tool-panel-head">
        <h3>En-tête et pied de page</h3>
        <button
          type="button"
          className="side-tool-close"
          aria-label="Fermer le panneau pied de page"
          title="Fermer"
          onClick={onClose}
        >
          ×
        </button>
      </div>
      <div className="side-tool-panel-body">
        <div className="custom-header-form">
          <label>
            Établissement
            <input
              className="pill-input"
              value={institutional.schoolName}
              onChange={(event) =>
                setInstitutional({ ...institutional, schoolName: event.target.value })
              }
            />
          </label>
          <label>
            Année
            <input
              className="pill-input"
              value={institutional.schoolYear}
              onChange={(event) =>
                setInstitutional({ ...institutional, schoolYear: event.target.value })
              }
            />
          </label>
          <label>
            Mention
            <input
              className="pill-input"
              value={institutional.schoolTagline}
              onChange={(event) =>
                setInstitutional({ ...institutional, schoolTagline: event.target.value })
              }
            />
          </label>
          <label>
            Logo
            <input
              className="pill-input"
              value={institutional.logoSrc}
              onChange={(event) =>
                setInstitutional({ ...institutional, logoSrc: event.target.value })
              }
              placeholder="/lib/logos/etat-du-valais.webp"
            />
            <input
              className="pill-input"
              type="file"
              accept="image/*"
              aria-label="Remplacer le logo"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (!file) return
                const reader = new FileReader()
                reader.onload = () =>
                  setInstitutional({
                    ...institutional,
                    logoSrc: String(reader.result ?? DEFAULT_INSTITUTIONAL_LOGO),
                  })
                reader.readAsDataURL(file)
              }}
            />
          </label>
          <label>
            Organisation (ligne 1)
            <input
              className="pill-input"
              value={institutional.orgLine1}
              onChange={(event) =>
                setInstitutional({ ...institutional, orgLine1: event.target.value })
              }
            />
          </label>
          <label>
            Organisation (ligne 2)
            <input
              className="pill-input"
              value={institutional.orgLine2}
              onChange={(event) =>
                setInstitutional({ ...institutional, orgLine2: event.target.value })
              }
            />
          </label>
          <label>
            Organisation (ligne 3)
            <input
              className="pill-input"
              value={institutional.orgLine3}
              onChange={(event) =>
                setInstitutional({ ...institutional, orgLine3: event.target.value })
              }
            />
          </label>
          <label>
            Organisation (ligne 4)
            <input
              className="pill-input"
              value={institutional.orgLine4}
              onChange={(event) =>
                setInstitutional({ ...institutional, orgLine4: event.target.value })
              }
            />
          </label>
          <SelectBox
            label="Classe"
            value={institutional.classLevel}
            onChange={(value) => setInstitutional({ ...institutional, classLevel: value })}
          >
            <option value="">—</option>
            {CLASS_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </SelectBox>
          <SelectBox
            label="N° de classe"
            value={institutional.classNumber}
            onChange={(value) =>
              setInstitutional({ ...institutional, classNumber: value })
            }
          >
            <option value="">—</option>
            {CLASS_NUMBERS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </SelectBox>
          <SelectBox
            label="Cours"
            value={institutional.course}
            onChange={(value) => setInstitutional({ ...institutional, course: value })}
          >
            {COURSES.map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </SelectBox>
          <label>
            Titre de la fiche
            <input
              className="pill-input"
              value={institutional.documentTitle}
              onChange={(event) =>
                setInstitutional({ ...institutional, documentTitle: event.target.value })
              }
              placeholder={
                evalMode
                  ? 'Évaluation'
                  : (activeExerciseLabel || 'Nom du type d’exercice')
              }
            />
            <small className="muted">Vide = nom du type d’exercice partout sur la fiche.</small>
          </label>
          <label>
            Référence
            <input
              className="pill-input"
              value={referenceLocked ? ALPHA_SOUTIEN_REFERENCE : institutional.reference}
              readOnly={referenceLocked}
              disabled={referenceLocked}
              aria-readonly={referenceLocked}
              onChange={(event) => {
                if (referenceLocked) return
                setInstitutional({ ...institutional, reference: event.target.value })
              }}
              placeholder="Ex. FICHE-12"
            />
            <small className="muted">
              {referenceLocked
                ? 'Fixe pour l’alphabétisation et le soutien.'
                : 'Pied de page, à gauche. Vide = rien.'}
            </small>
          </label>
        </div>
      </div>
    </aside>

  )
}
