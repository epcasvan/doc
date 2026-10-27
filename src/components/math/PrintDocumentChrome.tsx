import type { ReactNode } from 'react'
import valaisLogo from '@/assets/logos/etat-du-valais.webp'

export type InstitutionalHeader = {
  schoolName: string
  schoolYear: string
  schoolTagline: string
  orgLine1: string
  orgLine2: string
  orgLine3: string
  orgLine4: string
  classLevel: string
  classNumber: string
  course: string
  documentTitle: string
  /** Pied de page : vide = rien ; sinon « Référence : … ». */
  reference: string
  /** Chemin, URL ou data URL du logo. Vide = emplacement sans image. */
  logoSrc: string
}

export const DEFAULT_INSTITUTIONAL_LOGO = valaisLogo

/** Référence imposée sur les fiches et livres d’alphabétisation et de soutien. */
export const ALPHA_SOUTIEN_REFERENCE = 'Melina Schröter et Phuoc Van'

export function isAlphaSoutienDomain(domain: string | undefined): boolean {
  return domain === 'alphabetisation' || domain === 'soutien-fr'
}

/**
 * Année scolaire en cours (Suisse / rentrée août) : à partir d’août → A/(A+1),
 * sinon (janvier–juillet) → (A−1)/A. Ex. octobre 2026 → « 2026-2027 ».
 */
export function currentSchoolYear(date = new Date()): string {
  const year = date.getFullYear()
  const start = date.getMonth() >= 7 ? year : year - 1 // mois 0-index : 7 = août
  return `${start}-${start + 1}`
}

export const DEFAULT_INSTITUTIONAL: InstitutionalHeader = {
  schoolName: "Classe d'accueil",
  schoolYear: currentSchoolYear(),
  schoolTagline: '',
  orgLine1: 'Département de la santé, des affaires sociales et de la culture',
  orgLine2: "Service de l'action sociale",
  orgLine3: "Office de l'asile",
  orgLine4: 'Centre de formation "Le Botza"',
  classLevel: '',
  classNumber: '',
  course: 'Mathématiques',
  documentTitle: '',
  reference: '',
  logoSrc: DEFAULT_INSTITUTIONAL_LOGO,
}

export const CLASS_LEVELS = ['CSC', 'CFR', 'EPL', 'CPR', 'HSS'] as const
export const CLASS_NUMBERS = Array.from({ length: 20 }, (_, i) => String(i + 1).padStart(2, '0'))
export const COURSES = [
  'Mathématiques',
  'Math soutien',
  'Français',
  'Français soutien',
  'Calligraphie',
  'Découverte de la vie scolaire',
  'Découverte de la société',
  'Sciences et santé',
  'Informatique',
  'Sport',
]

function formatPrintDate(date = new Date()): string {
  return new Intl.DateTimeFormat('fr-CH', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
}

export function InstitutionalDocumentHeader({
  config,
  evalMode,
  totalPoints,
  fallbackTitle,
}: {
  config: InstitutionalHeader
  evalMode: boolean
  totalPoints?: number
  fallbackTitle?: string
}) {
  const title = config.documentTitle.trim() || fallbackTitle || ''
  return (
    <div className="doc-header institutional">
      <div className="doc-header-top">
        <div className="doc-header-school">
          <p className="doc-school-name">{config.schoolName}</p>
          <p>{config.schoolYear}</p>
          {config.schoolTagline ? <p className="doc-school-tag">{config.schoolTagline}</p> : null}
        </div>
        <div className="doc-header-org">
          <div className="doc-logo-slot">
            {config.logoSrc ? (
              <img src={config.logoSrc} alt="" />
            ) : (
              <span aria-hidden>Logo</span>
            )}
          </div>
          <div className="doc-org-lines">
            {config.orgLine1 ? <p>{config.orgLine1}</p> : null}
            {config.orgLine2 ? <p>{config.orgLine2}</p> : null}
            {config.orgLine3 ? <p>{config.orgLine3}</p> : null}
            {config.orgLine4 ? <p>{config.orgLine4}</p> : null}
          </div>
        </div>
      </div>
      <div className="doc-header-course">
        {(config.classLevel.trim() || config.classNumber.trim()) ? (
          <p>{[config.classLevel.trim(), config.classNumber.trim()].filter(Boolean).join(' ')}</p>
        ) : null}
        <p>Cours {config.course}</p>
      </div>
      <div className="doc-student-block">
        <div className="doc-student-fields">
          {(['Nom', 'Prénom', 'Date'] as const).map((label) => (
            <p key={label} className="doc-student-row">
              <span className="doc-student-label">{label}</span>
              <span className="doc-student-colon">:</span>
              <span className="doc-student-line" />
            </p>
          ))}
        </div>
        {evalMode ? (
          <div className="doc-eval-grid">
            {(['Pts', 'Total', 'Note', 'N°'] as const).map((heading) => (
              <div key={heading} className="doc-eval-cell head">
                {heading}
              </div>
            ))}
            <div className="doc-eval-cell" />
            <div className="doc-eval-cell strong">{totalPoints ?? ''}</div>
            <div className="doc-eval-cell" />
            <div className="doc-eval-cell" />
          </div>
        ) : (
          <div className="doc-numero-box">
            <div className="doc-eval-cell head">N°</div>
            <div className="doc-eval-cell" />
          </div>
        )}
      </div>
      {title ? <p className="doc-document-title">{title}</p> : null}
    </div>
  )
}

export function DocumentFooter({
  pageNumber,
  total,
  reference,
}: {
  pageNumber: number
  total: number
  /** Pied : affiché à gauche sur la ligne « Imprimé le… » si non vide. */
  reference?: string
  /** @deprecated Pied fixe ; ignoré. */
  text?: string
  printedBy?: string
}) {
  const ref = reference?.trim() ?? ''
  return (
    <footer className="sheet-footer doc-footer">
      <div className="doc-footer-brand">
        <strong>ClairFLE - Support imprimable</strong>
      </div>
      <div className="doc-footer-page">
        Page {pageNumber} / {total}
      </div>
      <div className="doc-footer-ref">
        {ref ? <span>Référence : {ref}</span> : null}
      </div>
      <div className="doc-footer-printed">
        <span>Imprimé le {formatPrintDate()}</span>
      </div>
    </footer>
  )
}

export function QuestionPoints({ points }: { points: number }) {
  const label = Number.isInteger(points) ? String(points) : String(points).replace('.', ',')
  return (
    <span className="question-points">
      {label} pt{points > 1 ? 's' : ''}
    </span>
  )
}

export function SheetBody({ children }: { children: ReactNode }) {
  return <div className="sheet-body">{children}</div>
}
