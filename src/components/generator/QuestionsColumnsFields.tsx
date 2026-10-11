import {
  blockPointsTotal,
  formatPointsLabel,
  isTcmConsignesType,
} from '@/tcm/test'
import { isTcmCfrConsignesType } from '@/tcm-cfr/test'
import { isTcfConsignesType } from '@/tcf/catalog'
import { isOralComprehensionExercise } from '@/components/generator/page-helpers'
import type { ExerciseBlock, WorksheetPage } from '@/math/types'
import { SOUTIEN_LEVEL_FILTERS } from '@/francais/soutien/phrases-data'

export type QuestionsColumnsFieldsProps = {
  activeBlock: ExerciseBlock
  updatePage: (patch: Partial<ExerciseBlock>) => void
  isTransform: boolean
  isReperage: boolean
  isSoutienLignes: boolean
  isSoutienMotsCount: boolean
  isSoutienRelier: boolean
  isSoutienCompleter: boolean
  isSoutienCols123: boolean
  isSoutienCols345: boolean
  soutienKind: string | undefined
  questionsInputOverflow: boolean
  bankOverflow: boolean
  bankQuestionCap: number | undefined
  questionsOverflow: boolean
  maxQuestions: number
  isPhraseChart: boolean
  isVocabLearn: boolean
  isVocabPool: boolean
  isGramTheory: boolean
  isJeuxDomain: boolean
  isCalliDomain: boolean
  isSoutienFr: boolean
  isTcf: boolean
  isTcmInfoPage: boolean
  isSoutienMots: boolean
  isSoutienMotsMeles: boolean
  isTcmLike: boolean
  evalMode: boolean
  activeSheet: WorksheetPage | undefined
  safeBlockIndex: number
  firstExerciseNo: number
  sheetTotalPoints: number
}

export function QuestionsColumnsFields(props: QuestionsColumnsFieldsProps) {
  const {
    activeBlock,
    updatePage,
    isTransform,
    isReperage,
    isSoutienLignes,
    isSoutienMotsCount,
    isSoutienRelier,
    isSoutienCompleter,
    isSoutienCols123,
    isSoutienCols345,
    soutienKind,
    questionsInputOverflow,
    bankOverflow,
    bankQuestionCap,
    questionsOverflow,
    maxQuestions,
    isPhraseChart,
    isVocabLearn,
    isVocabPool,
    isGramTheory,
    isJeuxDomain,
    isCalliDomain,
    isSoutienFr,
    isTcf,
    isTcmInfoPage,
    isSoutienMots,
    isSoutienMotsMeles,
    isTcmLike,
    evalMode,
    activeSheet,
    safeBlockIndex,
    firstExerciseNo,
    sheetTotalPoints,
  } = props
  return (
    <>
              {isPhraseChart ||
              isVocabLearn ||
              isGramTheory ||
              isJeuxDomain ||
              isCalliDomain ||
              isSoutienMots ||
              isTcf ||
              isTcmInfoPage ||
              isSoutienMotsMeles ? null : (
              <label className="select-shell">
                <span>
                  {isTransform
                    ? 'Points'
                    : isReperage
                      ? 'Questions'
                      : isSoutienLignes
                        ? 'Lignes'
                        : isSoutienMotsCount
                          ? 'Mots'
                          : 'QUESTIONS'}
                </span>
                <input
                  className={`pill-input${questionsInputOverflow ? ' is-overflow' : ''}`}
                  aria-label={
                    isSoutienLignes
                      ? 'Nombre de lignes'
                      : isSoutienMotsCount
                        ? 'Nombre de mots'
                        : 'Nombre de questions'
                  }
                  aria-invalid={questionsInputOverflow}
                  title={
                    bankOverflow
                      ? `La banque de cet enregistrement ne contient que ${bankQuestionCap} questions.`
                      : questionsOverflow
                        ? 'Trop de questions pour une seule fiche A4. Réduisez le nombre ou ajoutez une page.'
                        : undefined
                  }
                  type="number"
                  min={1}
                  max={maxQuestions}
                  step={1}
                  value={activeBlock.count}
                  onChange={(event) => {
                    const next = Math.max(
                      1,
                      Math.min(maxQuestions, Number(event.target.value) || 1),
                    )
                    updatePage({ count: next })
                  }}
                />
                {soutienKind === 'lettres' ? (
                  <small className="muted">
                    Nombre de lignes du tableau (8 lettres par ligne, max. 15 · défaut 5).
                  </small>
                ) : null}
                {soutienKind === 'syllabes' ? (
                  <small className="muted">
                    Lignes par bloc (script et Playwrite · 5 syllabes par ligne · défaut 3).
                  </small>
                ) : null}
                {isSoutienRelier ? (
                  <small className="muted">
                    Mots du type 1 uniquement (max. 16 · défaut 12 · 2 colonnes).
                  </small>
                ) : null}
                {isSoutienCompleter && !activeBlock.soutienCompleterLibre ? (
                  <small className="muted">
                    Nombre de mots à compléter (défaut 12 · 2 colonnes · max. 18).
                  </small>
                ) : null}
                {soutienKind === 'ecouter' ? (
                  <small className="muted">
                    Mots à écouter / écrire (défaut 9 · max. 30).
                  </small>
                ) : null}
                {soutienKind === 'ecouter-image' ? (
                  <small className="muted">
                    Images à écouter / cocher (défaut 15 · 5 colonnes · max. 30).
                  </small>
                ) : null}
                {soutienKind === 'syllabe-son' ? (
                  <small className="muted">
                    Cartes (défaut 18 · mots ≥ 2 syllabes · max. 18 · audio téléchargeable).
                  </small>
                ) : null}
                {soutienKind === 'lettres-phrase' ? (
                  <small className="muted">
                    Nombre de phrases (défaut 8 · max. 16). Téléchargez le JSON pour corriger.
                  </small>
                ) : null}
                {soutienKind === 'determinants' ? (
                  <small className="muted">
                    Nombre de phrases (défaut 9 · max. 16). Téléchargez le JSON pour corriger.
                  </small>
                ) : null}
                {soutienKind === 'dictee' ? (
                  <small className="muted">Nombre de mots à écrire (défaut 8 · max. 16).</small>
                ) : null}
                {soutienKind === 'compter' ? (
                  <small className="muted">
                    Nombre de phrases (défaut 9 · max. 12) — une histoire A2–B1. Téléchargez le JSON
                    pour corriger.
                  </small>
                ) : null}
                {soutienKind === 'ordre' ? (
                  <small className="muted">
                    Nombre de phrases à remettre en ordre (défaut 9 · max. 12).
                  </small>
                ) : null}
                {soutienKind === 'lire' ? (
                  <small className="muted">
                    Nombre de phrases (défaut 19 · max. 20) — une histoire A2–B1. Téléchargez le JSON
                    pour corriger.
                  </small>
                ) : null}
                {soutienKind === 'associer-audio' ? (
                  <small className="muted">
                    Nombre de séries (5 QR + 5 mots cadrés · défaut 2 · max. 3).
                  </small>
                ) : null}
                {soutienKind === 'associer-image' ? (
                  <small className="muted">
                    Nombre de séries (5 QR + 5 images type 1 · défaut 2 · max. 3).
                  </small>
                ) : null}
                {bankOverflow ? (
                  <p className="questions-overflow-hint" role="status">
                    La banque ne contient que {bankQuestionCap} question
                    {(bankQuestionCap ?? 0) > 1 ? 's' : ''} pour cet enregistrement. Réduisez le
                    nombre ou générez une nouvelle fiche.
                  </p>
                ) : questionsOverflow && !activeBlock.continueOnNextPage ? (
                  <p className="questions-overflow-hint" role="status">
                    Les questions suivantes dépassent de la fiche. Réduisez le nombre, activez le
                    saut de page, ou ajoutez une page.
                  </p>
                ) : null}
              </label>
              )}
              {(isTcmLike &&
                !(
                  isTcmConsignesType(activeBlock.exerciseType) ||
                  isTcmCfrConsignesType(activeBlock.exerciseType)
                )) ||
              (isTcf && evalMode && !isTcfConsignesType(activeBlock.exerciseType)) ? (
                <label className="select-shell">
                  <span>Points par question</span>
                  <input
                    className="pill-input"
                    type="number"
                    inputMode="decimal"
                    min={0.5}
                    max={20}
                    step={0.5}
                    aria-label="Points par question de l’exercice sélectionné"
                    value={activeBlock.pointsPerQuestion ?? 1}
                    onChange={(event) => {
                      const raw = Number(event.target.value.replace(',', '.'))
                      if (!Number.isFinite(raw)) return
                      const next = Math.max(0.5, Math.min(20, Math.round(raw * 2) / 2))
                      updatePage({ pointsPerQuestion: next })
                    }}
                  />
                  <small className="muted">
                    Exercice{' '}
                    {activeSheet?.blocks?.[safeBlockIndex]?.exerciseIndex ?? firstExerciseNo + safeBlockIndex} :{' '}
                    {formatPointsLabel(
                      blockPointsTotal(
                        activeSheet?.blocks?.[safeBlockIndex]?.items ?? [],
                        activeBlock.pointsPerQuestion ?? 1,
                      ),
                    )}{' '}
                    · total du test : {formatPointsLabel(sheetTotalPoints)}
                  </small>
                </label>
              ) : null}
              {isOralComprehensionExercise(activeBlock.exerciseType) ||
              activeBlock.exerciseType.includes('-com-ecrite') ||
              isGramTheory ? (
                <div className="mode-toggle-block">
                  <b>Saut de page</b>
                  <div className="mode-toggle" role="group" aria-label="Saut de page pour les questions">
                    <button
                      type="button"
                      className={!activeBlock.continueOnNextPage ? 'active' : ''}
                      onClick={() => updatePage({ continueOnNextPage: false })}
                    >
                      Une fiche
                    </button>
                    <button
                      type="button"
                      className={activeBlock.continueOnNextPage ? 'active' : ''}
                      onClick={() => updatePage({ continueOnNextPage: true })}
                      title={
                        isGramTheory
                          ? 'La suite de la théorie passe sur la feuille suivante'
                          : 'Les questions au-delà de 4 passent sur la feuille suivante'
                      }
                    >
                      Suite auto
                    </button>
                  </div>
                  {activeBlock.continueOnNextPage ? (
                    <small className="muted">
                      {isGramTheory
                        ? 'Si la théorie dépasse, une feuille « suite » est ajoutée automatiquement.'
                        : 'Au-delà de 4 questions, une feuille « suite » est ajoutée automatiquement.'}
                    </small>
                  ) : null}
                </div>
              ) : null}
              {soutienKind === 'lettres-phrase' ||
              soutienKind === 'determinants' ||
              soutienKind === 'compter' ||
              soutienKind === 'lire' ? (
                <div className="mode-toggle-block">
                  <b>Niveau des phrases</b>
                  <div className="mode-toggle is-4" role="group" aria-label="Niveau des phrases">
                    {SOUTIEN_LEVEL_FILTERS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        className={(activeBlock.soutienLevel ?? 'all') === opt.id ? 'active' : ''}
                        onClick={() => updatePage({ soutienLevel: opt.id })}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <small className="muted">
                    Tous = mélange A1 / A2 / B1 (A1 : 5–7 mots · A2 : 8–12 · B1 : 13–15).
                  </small>
                </div>
              ) : null}
              {isSoutienRelier ? (
                <div className="mode-toggle-block">
                  <b>Colonnes</b>
                  <div className="mode-toggle is-2" role="group" aria-label="Nombre de colonnes">
                    {[1, 2].map((value) => (
                      <button
                        key={value}
                        type="button"
                        className={(activeBlock.columns ?? 1) === value ? 'active' : ''}
                        onClick={() => updatePage({ columns: value })}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                  <small className="muted">
                    En 2 colonnes, chaque colonne mélange ses propres mots (sans mélange croisé).
                  </small>
                </div>
              ) : null}
              {isSoutienCols123 ? (
                <div className="mode-toggle-block">
                  <b>Colonnes</b>
                  <div className="mode-toggle is-3" role="group" aria-label="Nombre de colonnes">
                    {[1, 2, 3].map((value) => (
                      <button
                        key={value}
                        type="button"
                        className={
                          (activeBlock.columns ?? (soutienKind === 'completer' ? 2 : 3)) ===
                          value
                            ? 'active'
                            : ''
                        }
                        onClick={() => updatePage({ columns: value })}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                  <small className="muted">Grille fluide : 1, 2 ou 3 colonnes.</small>
                </div>
              ) : null}
              {isSoutienCols345 ? (
                <div className="mode-toggle-block">
                  <b>Colonnes</b>
                  <div className="mode-toggle is-3" role="group" aria-label="Nombre de colonnes">
                    {[3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        className={(activeBlock.columns ?? 3) === value ? 'active' : ''}
                        onClick={() => updatePage({ columns: value })}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                  <small className="muted">
                    Grille fluide (pas un tableau fixe) : 3, 4 ou 5 colonnes.
                  </small>
                </div>
              ) : null}
              {isPhraseChart || isVocabLearn || isVocabPool || isGramTheory || isJeuxDomain || isCalliDomain || isSoutienFr || isTcf || isTcmInfoPage ? null : (
              <div className="mode-toggle-block">
                <b>Colonnes</b>
                <div className="mode-toggle is-3" role="group" aria-label="Nombre de colonnes">
                  {[1, 2, 3].map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={activeBlock.columns === value ? 'active' : ''}
                      onClick={() => updatePage({ columns: value })}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
              )}

    </>
  )
}
