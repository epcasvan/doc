import { CoordGrid } from '@/components/math/CoordGrid'
import { SelectBox } from '@/components/generator/SelectBox'
import { ReperageAxesFields } from '@/components/generator/FormesPalette'
import { defaultCoordQuestionReply } from '@/components/generator/WorksheetSheet'
import {
  CoordQuestionsLibreEditor,
  resizeCoordQuestionsLibre,
} from '@/math/CoordQuestionsLibreEditor'
import {
  COORD_SHAPES,
  FORMES_CELL_MM_OPTIONS,
  clampFormesCellMm,
  clampFormesCols,
  clampFormesRows,
  coordSizeFor,
  FORMES_MAX_BY_MM,
  maxFormesColsForCell,
  maxFormesRowsForCell,
  resolveAxesGrid,
  sceneFromAxesLibre,
} from '@/math/coord-reperage'
import { TRANSFORM_MAX_POINTS } from '@/math/coord-transformations'
import type { CoordAxis, ExerciseBlock, PageConfig, WorksheetPage } from '@/math/types'
import type { CoordTool } from '@/components/generator/useCoordEditing'
import type { Dispatch, SetStateAction } from 'react'

export type CoordLibreSettingsProps = {
  activeBlock: ExerciseBlock
  activeAsPage: PageConfig
  updatePage: (patch: Partial<ExerciseBlock>) => void
  isFormes: boolean
  isCadrans: boolean
  isComposer: boolean
  isDroites: boolean
  isConstruire: boolean
  isTransform: boolean
  isTransformCentrale: boolean
  isTransformPlacer: boolean
  axesGrid: ReturnType<typeof resolveAxesGrid>
  updateAxesGrid: (patch: Partial<ExerciseBlock>) => void
  coordTool: CoordTool
  setCoordTool: Dispatch<SetStateAction<CoordTool>>
  placeCoordMark: (x: number, y: number, kind: import('@/math/types').CoordShape) => void
  placeOrigin: (col: number, row: number) => void
  removeCoordMark: (x: number, y: number) => void
  activeSheet: WorksheetPage | undefined
  safeBlockIndex: number
}

export function CoordLibreSettings({
  activeBlock,
  activeAsPage,
  updatePage,
  isFormes,
  isCadrans,
  isComposer,
  isDroites,
  isConstruire,
  isTransform,
  isTransformCentrale,
  isTransformPlacer,
  axesGrid,
  updateAxesGrid,
  coordTool,
  setCoordTool,
  placeCoordMark,
  placeOrigin,
  removeCoordMark,
  activeSheet,
  safeBlockIndex,
}: CoordLibreSettingsProps) {
  return (
    <>
              {isFormes ? (
                <div className="coord-libre-panel">
                  <b>Composition du tableau</b>
                  <div className="mode-toggle" role="group" aria-label="Mode du tableau">
                    <button
                      type="button"
                      className={!activeBlock.coordLibre ? 'active' : ''}
                      onClick={() => updatePage({ coordLibre: false })}
                    >
                      Automatique
                    </button>
                    <button
                      type="button"
                      className={activeBlock.coordLibre ? 'active' : ''}
                      onClick={() => {
                        const size = coordSizeFor(activeBlock.difficulty)
                        const empty = !activeBlock.coordMarks?.length
                        updatePage({
                          coordLibre: true,
                          coordCols: empty ? size.cols : (activeBlock.coordCols ?? size.cols),
                          coordRows: empty ? size.rows : (activeBlock.coordRows ?? size.rows),
                          coordAxis: activeBlock.coordAxis ?? 'letters',
                          coordMarks: activeBlock.coordMarks ?? [],
                        })
                      }}
                    >
                      Libre
                    </button>
                    </div>
                  <SelectBox
                    label="Axes"
                    value={activeBlock.coordAxis ?? 'letters'}
                    onChange={(value) => updatePage({ coordAxis: value as CoordAxis })}
                  >
                    <option value="letters">Lettres en bas</option>
                    <option value="letters-y">Lettres à gauche</option>
                    <option value="numeric">Nombres seulement</option>
                  </SelectBox>
                  <div className="coord-size-row">
                    <label>
                      Largeur · max {maxFormesColsForCell(clampFormesCellMm(activeBlock.coordCellMm))}
                      <input
                        className="pill-input"
                        type="number"
                        min={3}
                        max={maxFormesColsForCell(clampFormesCellMm(activeBlock.coordCellMm))}
                        value={activeBlock.coordCols ?? coordSizeFor(activeBlock.difficulty).cols}
                        onChange={(event) => {
                          const cols = clampFormesCols(
                            Number(event.target.value),
                            clampFormesCellMm(activeBlock.coordCellMm),
                          )
                          updatePage({
                            coordCols: cols,
                            coordMarks: (activeBlock.coordMarks ?? []).filter((mark) => mark.x <= cols),
                          })
                        }}
                      />
                    </label>
                    <label>
                      Hauteur · max {maxFormesRowsForCell(clampFormesCellMm(activeBlock.coordCellMm))}
                      <input
                        className="pill-input"
                        type="number"
                        min={3}
                        max={maxFormesRowsForCell(clampFormesCellMm(activeBlock.coordCellMm))}
                        value={activeBlock.coordRows ?? coordSizeFor(activeBlock.difficulty).rows}
                        onChange={(event) => {
                          const rows = clampFormesRows(
                            Number(event.target.value),
                            clampFormesCellMm(activeBlock.coordCellMm),
                          )
                          updatePage({
                            coordRows: rows,
                            coordMarks: (activeBlock.coordMarks ?? []).filter((mark) => mark.y <= rows),
                          })
                        }}
                      />
                    </label>
                  </div>
                  <div className="coord-param-label">
                    Côté du carré
                    <div className="mode-toggle is-3" role="group" aria-label="Côté du carré">
                      {FORMES_CELL_MM_OPTIONS.map((mm) => (
                        <button
                          key={mm}
                          type="button"
                          className={clampFormesCellMm(activeBlock.coordCellMm) === mm ? 'active' : ''}
                          onClick={() => {
                            const cols = clampFormesCols(
                              activeBlock.coordCols ?? coordSizeFor(activeBlock.difficulty).cols,
                              mm,
                            )
                            const rows = clampFormesRows(
                              activeBlock.coordRows ?? coordSizeFor(activeBlock.difficulty).rows,
                              mm,
                            )
                            updatePage({
                              coordCellMm: mm,
                              coordCols: cols,
                              coordRows: rows,
                              coordMarks: (activeBlock.coordMarks ?? []).filter(
                                (mark) => mark.x <= cols && mark.y <= rows,
                              ),
                            })
                          }}
                        >
                          {mm} mm
                        </button>
                      ))}
                    </div>
                  </div>
                  {activeBlock.coordLibre ? (
                    <>
                      <p className="type-hint muted">
                        Les formes sont à droite de la fiche. Cliquez une forme puis une case, ou glissez-la sur le
                        tableau. Chaque forme n’apparaît qu’une fois.
                      </p>
                      <p className="type-hint muted">
                        {(activeBlock.coordMarks?.length ?? 0)} / {COORD_SHAPES.length} forme
                        {COORD_SHAPES.length > 1 ? 's' : ''}
                        {' · '}
                        {FORMES_MAX_BY_MM[clampFormesCellMm(activeBlock.coordCellMm)].cols} ×{' '}
                        {FORMES_MAX_BY_MM[clampFormesCellMm(activeBlock.coordCellMm)].rows} au plus à{' '}
                        {clampFormesCellMm(activeBlock.coordCellMm)} mm.
                      </p>
                      {(activeBlock.coordMarks?.length ?? 0) > 0 ? (
                        <button
                          type="button"
                          className="button secondary"
                          onClick={() => updatePage({ coordMarks: [] })}
                        >
                          Vider le tableau
                        </button>
                      ) : null}
                    </>
                  ) : (
                    <p className="type-hint muted">
                      Une seule grille centrée. Chaque forme n’apparaît qu’une fois. Le champ Questions ajoute des
                      formes. Maximum : 16 × 12 à 10 mm, 21 × 15 à 8 mm, 26 × 20 à 6 mm. Les colonnes 1 / 2 / 3
                      séparent les questions, pas le tableau.
                    </p>
                  )}
                </div>
              ) : isCadrans ? (
                <div className="coord-libre-panel">
                  <b>{isComposer ? 'Composer les points' : 'Repère (4 cadrans)'}</b>
                  <div className="mode-toggle" role="group" aria-label="Mode du repère">
                    <button
                      type="button"
                      className={!activeBlock.coordLibre ? 'active' : ''}
                      onClick={() => updatePage({ coordLibre: false })}
                    >
                      Automatique
                    </button>
                    <button
                      type="button"
                      className={activeBlock.coordLibre ? 'active' : ''}
                      onClick={() => {
                        const grid = resolveAxesGrid(activeAsPage, activeBlock.difficulty)
                        updatePage({
                          coordLibre: true,
                          coordCols: grid.cols,
                          coordRows: grid.rows,
                          coordCellMm: grid.cellMm,
                          coordUnitSquares: grid.unitSquares,
                          coordMarks: activeBlock.coordMarks ?? [],
                          coordOriginCol: activeBlock.coordOriginCol ?? Math.round(grid.cols / 2),
                          coordOriginRow: activeBlock.coordOriginRow ?? Math.round(grid.rows / 2),
                        })
                      }}
                    >
                      Libre
                    </button>
                  </div>
                  <ReperageAxesFields
                    cols={activeBlock.coordCols ?? axesGrid.cols}
                    rows={activeBlock.coordRows ?? axesGrid.rows}
                    cellMm={axesGrid.cellMm}
                    unitSquares={axesGrid.unitSquares}
                    onChange={updateAxesGrid}
                    onLiveCols={(n) => updatePage({ coordCols: n })}
                    onLiveRows={(n) => updatePage({ coordRows: n })}
                  />
                  {activeBlock.coordLibre ? (
                    <>
                      {isComposer ? (
                        <div className="mode-toggle is-3" role="group" aria-label="Outil de placement">
                          <button
                            type="button"
                            className={coordTool === 'origin' ? 'active' : ''}
                            onClick={() => setCoordTool('origin')}
                          >
                            Origine
                          </button>
                          <button
                            type="button"
                            className={coordTool === 'given' ? 'active' : ''}
                            onClick={() => setCoordTool('given')}
                          >
                            Point donné
                          </button>
                          <button
                            type="button"
                            className={coordTool === 'points' ? 'active' : ''}
                            onClick={() => setCoordTool('points')}
                          >
                            Autres points
                          </button>
                        </div>
                      ) : null}
                      <div className="coord-axes-editor">
                        <CoordGrid
                          scene={sceneFromAxesLibre(activeAsPage, activeBlock.difficulty)}
                          editable
                          placingOrigin={isComposer && coordTool === 'origin'}
                          onPlace={(x, y) => placeCoordMark(x, y, 'point')}
                          onPlaceOrigin={placeOrigin}
                          onRemove={removeCoordMark}
                        />
                      </div>
                      <p className="type-hint muted">
                        {isComposer
                          ? 'Placez l’origine (invisible sur la fiche), un point donné avec ses coordonnées, puis les autres points à lire. Le champ Questions limite les points à compléter (26 lettres au plus).'
                          : 'Cliquez une intersection pour poser A, B, C… Le champ Questions limite le nombre de points. Cliquez un point pour le retirer. Colonnes et lignes restent paires.'}
                      </p>
                      <p className="type-hint muted">
                        {isComposer
                          ? `${(activeBlock.coordMarks ?? []).filter((mark) => !mark.given).length} / ${activeBlock.count} point${activeBlock.count > 1 ? 's' : ''} à lire`
                          : `${activeBlock.coordMarks?.length ?? 0} / ${activeBlock.count} point${activeBlock.count > 1 ? 's' : ''}`}
                      </p>
                      {(activeBlock.coordMarks?.length ?? 0) > 0 ? (
                        <button
                          type="button"
                          className="button secondary"
                          onClick={() => updatePage({ coordMarks: [] })}
                        >
                          Vider le repère
                        </button>
                      ) : null}
                    </>
                  ) : (
                    <p className="type-hint muted">
                      {isComposer
                        ? 'Une grille sans axes x / y. L’origine est placée au hasard. Un point est donné avec ses coordonnées ; les autres se complètent comme pour lire les cadrans.'
                        : 'Une seule grille à 4 cadrans, centrée. Colonnes et lignes (nombres pairs) font grandir le tableau ; les carrés restent à 3, 4 ou 5 mm (56, 42 ou 34 colonnes au plus). Les colonnes 1 / 2 / 3 séparent les questions, pas le tableau.'}
                    </p>
                  )}
                </div>
              ) : isDroites || isConstruire || isTransform ? (
                <div className="coord-libre-panel">
                  <b>
                    {isDroites
                      ? 'Repère (droites)'
                      : isTransform
                        ? 'Repère (transformations)'
                        : 'Repère (construction)'}
                  </b>
                  {isTransform || isDroites || isConstruire ? (
                    <div
                      className="mode-toggle"
                      role="group"
                      aria-label={
                        isTransform
                          ? 'Mode de la figure'
                          : 'Mode des questions'
                      }
                    >
                      <button
                        type="button"
                        className={!activeBlock.coordLibre ? 'active' : ''}
                        onClick={() =>
                          updatePage({
                            coordLibre: false,
                            coordMarks: isTransform ? [] : activeBlock.coordMarks,
                            coordQuestionsLibre: undefined,
                          })
                        }
                      >
                        Automatique
                      </button>
                      <button
                        type="button"
                        className={activeBlock.coordLibre ? 'active' : ''}
                        onClick={() => {
                          if (isTransform) {
                            const sceneMarks =
                              activeSheet?.blocks[safeBlockIndex]?.items[0]?.coordScene?.marks ?? []
                            const fromScene = sceneMarks
                              .filter(
                                (mark) =>
                                  mark.kind === 'point' &&
                                  mark.label &&
                                  !String(mark.label).endsWith('′'),
                              )
                              .map((mark) => ({
                                x: mark.x,
                                y: mark.y,
                                kind: 'point' as const,
                                label: mark.label,
                                given: mark.label === 'Ω' ? true : undefined,
                                showCoord: mark.label === 'Ω' ? true : undefined,
                              }))
                            const seed =
                              activeBlock.coordMarks?.length ? activeBlock.coordMarks : fromScene
                            const hasOmega = seed.some((mark) => mark.label === 'Ω')
                            updatePage({
                              coordLibre: true,
                              coordMarks:
                                isTransformCentrale && !hasOmega
                                  ? [
                                      ...seed,
                                      {
                                        x: 0,
                                        y: 0,
                                        kind: 'point',
                                        label: 'Ω',
                                        given: true,
                                        showCoord: true,
                                      },
                                    ]
                                  : seed,
                              count: Math.max(
                                3,
                                Math.min(
                                  TRANSFORM_MAX_POINTS,
                                  seed.filter((mark) => mark.label !== 'Ω').length ||
                                    activeBlock.count,
                                ),
                              ),
                            })
                            setCoordTool(isTransformCentrale ? 'points' : 'points')
                            return
                          }
                          const fromSheet =
                            activeSheet?.blocks[safeBlockIndex]?.items[0]?.coordQuestions
                          updatePage({
                            coordLibre: true,
                            coordQuestionsLibre: resizeCoordQuestionsLibre(
                              activeBlock.coordQuestionsLibre?.length
                                ? activeBlock.coordQuestionsLibre
                                : fromSheet,
                              activeBlock.count,
                              defaultCoordQuestionReply(activeBlock.exerciseType),
                            ),
                          })
                        }}
                      >
                        Libre
                      </button>
                    </div>
                  ) : null}
                  <ReperageAxesFields
                    cols={activeBlock.coordCols ?? axesGrid.cols}
                    rows={activeBlock.coordRows ?? axesGrid.rows}
                    cellMm={axesGrid.cellMm}
                    unitSquares={axesGrid.unitSquares}
                    onChange={updateAxesGrid}
                    onLiveCols={(n) => updatePage({ coordCols: n })}
                    onLiveRows={(n) => updatePage({ coordRows: n })}
                  />
                  {isTransform && activeBlock.coordLibre ? (
                    <>
                      {isTransformCentrale ? (
                        <div className="mode-toggle" role="group" aria-label="Outil de placement">
                          <button
                            type="button"
                            className={coordTool === 'points' ? 'active' : ''}
                            onClick={() => setCoordTool('points')}
                          >
                            Points
                          </button>
                          <button
                            type="button"
                            className={coordTool === 'center' ? 'active' : ''}
                            onClick={() => setCoordTool('center')}
                          >
                            Centre Ω
                          </button>
                        </div>
                      ) : null}
                      <p className="type-hint muted">
                        {isTransformCentrale
                          ? 'Cliquez sur l’aperçu pour placer les sommets (A, B, C…) ou le centre Ω. Cliquez un point pour le retirer. Jusqu’à 10 points.'
                          : 'Cliquez sur l’aperçu pour placer les sommets de la figure (A, B, C…). Cliquez un point pour le retirer. Jusqu’à 10 points.'}
                      </p>
                      <p className="type-hint muted">
                        {(activeBlock.coordMarks ?? []).filter((mark) => mark.label !== 'Ω').length} /{' '}
                        {Math.min(activeBlock.count, TRANSFORM_MAX_POINTS)} point
                        {activeBlock.count > 1 ? 's' : ''}
                        {isTransformCentrale
                          ? (activeBlock.coordMarks ?? []).some((mark) => mark.label === 'Ω')
                            ? ' · centre Ω placé'
                            : ' · centre Ω manquant'
                          : ''}
                      </p>
                      {(activeBlock.coordMarks?.length ?? 0) > 0 ? (
                        <button
                          type="button"
                          className="button secondary"
                          onClick={() =>
                            updatePage({
                              coordMarks: isTransformCentrale
                                ? [
                                    {
                                      x: 0,
                                      y: 0,
                                      kind: 'point',
                                      label: 'Ω',
                                      given: true,
                                      showCoord: true,
                                    },
                                  ]
                                : [],
                            })
                          }
                        >
                          Vider les points
                        </button>
                      ) : null}
                    </>
                  ) : null}
                  {(isDroites || isConstruire) && activeBlock.coordLibre ? (
                    <CoordQuestionsLibreEditor
                      questions={
                        activeBlock.coordQuestionsLibre ??
                        resizeCoordQuestionsLibre(
                          undefined,
                          activeBlock.count,
                          defaultCoordQuestionReply(activeBlock.exerciseType),
                        )
                      }
                      defaultReply={defaultCoordQuestionReply(activeBlock.exerciseType)}
                      maxCount={isConstruire ? 8 : 10}
                      onChange={(next) => {
                        const capped = next.slice(0, isConstruire ? 8 : 10)
                        updatePage({
                          coordQuestionsLibre: capped,
                          count: Math.max(1, capped.length),
                        })
                      }}
                    />
                  ) : null}
                  <p className="type-hint muted">
                    {isDroites
                      ? activeBlock.coordLibre
                        ? 'Mode libre : le repère (droites) reste généré ; vous rédigez ou modifiez les questions et les réponses du corrigé.'
                        : 'Une seule grille centrée. Colonnes et lignes (nombres pairs) font grandir le tableau ; les carrés restent à 3, 4 ou 5 mm (56, 42 ou 34 colonnes au plus). Chaque droite a une couleur et un tracé distinct, lisible en noir et blanc.'
                      : isTransform
                        ? activeBlock.coordLibre
                          ? isTransformPlacer
                            ? 'Mode libre : placez jusqu’à 10 sommets. Sur la fiche : colonne 1 = points à placer, colonne 2 = coordonnées des images. Pas de bloc questions.'
                            : 'Mode libre : placez les sommets de la figure (et Ω en symétrie centrale). Pas de bloc questions : la consigne suffit.'
                          : isTransformPlacer
                            ? 'Types 3 et 4 : un point est donné sur le repère. Colonne 1 = points à placer, colonne 2 = coordonnées des nouveaux points. Jusqu’à 10 sommets.'
                            : 'Types 1 et 2 : figure fermée déjà tracée. Construisez l’image (pas de liste de questions).'
                        : activeBlock.coordLibre
                          ? 'Mode libre : la figure du repère reste générée ; vous rédigez ou modifiez les questions et les réponses du corrigé.'
                          : 'Une grille vide centrée, avec deux points donnés. Colonnes et lignes (nombres pairs) font grandir le tableau ; les carrés restent à 3, 4 ou 5 mm (56, 42 ou 34 colonnes au plus). Le corrigé montre les tracés.'}
                  </p>
                </div>
              ) : null}

    </>
  )
}
