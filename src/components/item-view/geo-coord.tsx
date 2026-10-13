import type { CoordShape, MathItem, PreviewMode } from '@/math/types'
import { resolvePromptPlaceholders } from '@/tcm/libre-recalc'
import { CompositeFigure } from '../math/CompositeFigure'
import { CoordGrid, CoordShapeButton } from '../math/CoordGrid'
import { GeometryFigure } from '../math/GeometryFigure'

export function GeoBlock({
  item,
  mode,
  draftGrid = true,
}: {
  item: MathItem
  mode: PreviewMode
  draftGrid?: boolean
}) {
  const show = mode === 'answers'
  if (item.geoDualPads) {
    const lines = item.propertyLines ?? []
    const promptText = resolvePromptPlaceholders(item)
    const padCorrection =
      show && (item.calcAnswer || item.calcAnswerSecondary)
        ? [item.calcAnswer, item.calcAnswerSecondary].filter(Boolean).join('\n')
        : null
    return (
      <div className={`geo-block geo-dual${item.geoDualTight ? ' is-tight' : ''}`} aria-label="Figure et calcul">
        {promptText ? <p className="column-prompt">{promptText}</p> : null}
        <div className="geo-dual-top">
          <div className="geo-dual-figure">
            {item.compositeScene ? (
              <CompositeFigure scene={item.compositeScene} />
            ) : (
              <GeometryFigure type={item.figure} dims={item.dims} />
            )}
          </div>
          <div className="geo-dual-pad">
            <div
              className={`draft-pad draft-pad-geo ${draftGrid ? 'with-grid' : 'plain'}${
                padCorrection ? ' has-correction' : ''
              }`}
              aria-label="Zone de brouillon"
            >
              {padCorrection ? (
                <strong className="filled-answer draft-pad-answer">{padCorrection}</strong>
              ) : null}
            </div>
          </div>
        </div>
        <div className="geo-dual-answers">
          {lines.map((line) => (
            <div className="geo-dual-answer" key={line.label}>
              <span className="property-label">{line.label} =</span>
              {show ? (
                <strong className="filled-answer property-answer">{line.answer}</strong>
              ) : (
                <span className="answer-line-field property-blank">{'\u00a0'}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }
  if (item.geoNameCard) {
    const lines = item.propertyLines ?? []
    return (
      <div className="geo-block geo-name-card" aria-label="Forme et réponses">
        <div className="geo-name-card-inner">
          <div className="geo-name-card-figure">
            {item.compositeScene ? (
              <CompositeFigure scene={item.compositeScene} />
            ) : (
              <GeometryFigure type={item.figure} dims={item.dims} />
            )}
          </div>
          <div className="geo-name-card-answers">
            {lines.map((line) => (
              <div className="property-line" key={line.label}>
                <span className="property-label">{line.label} :</span>
                {show ? (
                  <strong className="filled-answer property-answer">{line.answer}</strong>
                ) : (
                  <span className="answer-line-field property-blank">{'\u00a0'}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="geo-block">
      {item.compositeScene ? (
        <CompositeFigure scene={item.compositeScene} />
      ) : (
        <GeometryFigure type={item.figure} dims={item.dims} />
      )}
      {(item.calcAnswer || item.responseAnswer) && !item.propertyLines ? (
        <div className={`draft-pad draft-pad-geo ${draftGrid ? 'with-grid' : 'plain'}`} aria-label="Zone de calcul">
          {show && item.calcAnswer ? (
            <strong className="filled-answer draft-pad-answer">{item.calcAnswer}</strong>
          ) : null}
        </div>
      ) : null}
      <div className="geo-side">
        {item.prompt && <p className="column-prompt">{item.prompt}</p>}
        {item.propertyLines ? (
          <div className="property-lines">
            {item.propertyLines.map((line) => (
              <div className="property-line" key={line.label}>
                <span className="property-label">{line.label} :</span>
                {show ? (
                  <strong className="filled-answer property-answer">{line.answer}</strong>
                ) : (
                  <span className="answer-line-field property-blank">{'\u00a0'}</span>
                )}
              </div>
            ))}
          </div>
        ) : null}
        {(item.calcAnswer || item.responseAnswer) && !item.propertyLines ? (
          <div className="problem-response-line">
            <span className="response-label">Réponse :</span>
            {show ? (
              <strong className="filled-answer response-value">{item.responseAnswer ?? item.answer}</strong>
            ) : (
              <span className="answer-line-field">{'\u00a0'}</span>
            )}
          </div>
        ) : null}
        {!item.calcAnswer && !item.propertyLines && (
          <div className="problem-field">
            {show ? (
              <strong className="filled-answer">{item.answer}</strong>
            ) : (
              <span className="answer-line-field">{'\u00a0'}</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function CoordBlock({
  item,
  mode,
  coordEdit,
}: {
  item: MathItem
  mode: PreviewMode
  coordEdit?: {
    selectedKind: CoordShape | null
    placingOrigin?: boolean
    onPlace: (x: number, y: number, kind: CoordShape) => void
    onPlaceOrigin?: (col: number, row: number) => void
    onRemove: (x: number, y: number) => void
  }
}) {
  const show = mode === 'answers'
  const isPlace = item.coordTask === 'place'
  const isConstruct = item.coordTask === 'construct'
  const questions = item.coordQuestions ?? []
  const columns = item.coordColumns
  const scene = item.coordScene
  const hasLines = Boolean(scene?.lines?.length)
  const numbered = hasLines || (isConstruct && questions.length > 0)
  const displayScene = !scene
    ? scene
    : isConstruct && !show
      ? {
          ...scene,
          marks: scene.marks.filter((mark) => mark.reveal !== 'answer'),
          // Seulement les traits explicitement « always » (figures de transformations).
          // Les tracés de « Construire » restent au corrigé.
          paths: (scene.paths ?? []).filter((path) => path.reveal === 'always'),
          lines: [],
        }
      : (isPlace || hasLines) && !show
        ? { ...scene, marks: [] as typeof scene.marks }
        : scene.hideAxes
          ? {
              ...scene,
              showOrigin: show,
              marks: scene.marks.map((mark) => ({
                ...mark,
                showCoord: Boolean(mark.given || show),
              })),
            }
          : {
              ...scene,
              // Corrigé : montrer les graduations même si l’élève doit les tracer.
              hideAxisLabels: show ? false : scene.hideAxisLabels,
              showOrigin: Boolean(scene.showOrigin || (show && scene.originZeroInNegCell)),
              marks: scene.marks.filter((mark) => show || mark.reveal !== 'answer'),
            }
  const promptAbove = Boolean(scene?.variant === 'axes' && item.prompt && scene.hideAxisLabels)
  const placeList = questions.filter((q) => /Placez|placez/.test(q.prompt))
  const readList = questions.filter((q) => /Écrivez|coordonnées/.test(q.prompt) && !/Placez|placez/.test(q.prompt))
  const useCfrPlan = promptAbove && (placeList.length > 0 || readList.length > 0)
  return (
    <div
      className={`coord-block${scene ? ' has-scene' : ''}${hasLines || isConstruct ? ' has-lines' : ''}${
        (hasLines || isConstruct) && questions.length >= 7 ? ' is-dense' : ''
      }${scene ? ' is-centered' : ''}${useCfrPlan ? ' is-cfr-plan' : ''}`}
    >
      {useCfrPlan ? (
        <div className="coord-cfr-briefing">
          <p className="column-prompt">
            <span className="coord-cfr-step-num">1.</span> Graduez et nommez les axes du plan.
          </p>
          <p className="column-prompt">
            <span className="coord-cfr-step-num">2.</span> Placez les points suivants sur le plan.
          </p>
          <div className="coord-cfr-place-boxes">
            {placeList.map((q, i) => {
              const m = q.prompt.match(/([A-Z])\s*\(([^)]+)\)/i)
              const label = m?.[1] ?? String.fromCharCode(65 + i)
              const coords = m?.[2] ?? q.answer.replace(/[()]/g, '')
              return (
                <span className="coord-cfr-place-box" key={`place-${label}-${i}`}>
                  <span className="coord-cfr-letter">{label}</span>({coords.trim()})
                </span>
              )
            })}
          </div>
          <p className="column-prompt">
            <span className="coord-cfr-step-num">3.</span> Écrivez les coordonnées des points suivants.
          </p>
          <div className="coord-cfr-read-boxes">
            {readList.map((q, i) => {
              const m = q.prompt.match(/point\s+([A-Z])/i)
              const label = m?.[1] ?? q.prompt.trim().slice(-1)
              return (
                <span className="coord-cfr-read-box" key={`read-${label}-${i}`}>
                  <span className="coord-cfr-letter">{label}</span>({' '}
                  {show ? (
                    <strong className="filled-answer">{q.answer.replace(/[()]/g, '').split(';')[0]?.trim()}</strong>
                  ) : (
                    <span className="answer-line-field compact">{'\u00a0'}</span>
                  )}
                  {' ; '}
                  {show ? (
                    <strong className="filled-answer">{q.answer.replace(/[()]/g, '').split(';')[1]?.trim()}</strong>
                  ) : (
                    <span className="answer-line-field compact">{'\u00a0'}</span>
                  )}
                  {' )'}
                </span>
              )
            })}
          </div>
        </div>
      ) : null}
      <CoordGrid
        point={item.point}
        pointImage={item.pointImage}
        showImage={show && Boolean(item.pointImage)}
        scene={displayScene}
        editable={Boolean(coordEdit && (scene?.variant === 'cells' || scene?.variant === 'axes') && !hasLines)}
        placingOrigin={coordEdit?.placingOrigin}
        onPlace={
          coordEdit
            ? (x, y) => {
                if (scene?.variant === 'axes') {
                  coordEdit.onPlace(x, y, 'point')
                  return
                }
                const kind = coordEdit.selectedKind
                if (kind) coordEdit.onPlace(x, y, kind)
              }
            : undefined
        }
        onPlaceOrigin={coordEdit?.onPlaceOrigin}
        onRemove={coordEdit?.onRemove}
      />
      {useCfrPlan ? null : columns || questions.length > 0 || (!isConstruct && Boolean(item.prompt || item.answer)) ? (
      <div className="coord-side">
        {columns ? (
          <div className="coord-transform-cols">
            <div className="coord-transform-col">
              <b>{columns.leftTitle}</b>
              <ul>
                {columns.left.map((row) => (
                  <li key={`L-${row.label}`}>{row.text}</li>
                ))}
              </ul>
            </div>
            <div className="coord-transform-col">
              <b>{columns.rightTitle}</b>
              <ul>
                {columns.right.map((row) => (
                  <li key={`R-${row.label}`}>
                    <span className="coord-transform-label">{row.label}</span>
                    {show ? (
                      <strong className="filled-answer">{row.answer}</strong>
                    ) : (
                      <span className="coord-pair">
                        (
                        <span className="answer-line-field compact">{'\u00a0'}</span>
                        <span className="coord-pair-sep">;</span>
                        <span className="answer-line-field compact">{'\u00a0'}</span>
                        )
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
        {item.prompt && questions.length === 0 && !columns && !isConstruct ? (
          <p className="column-prompt">{item.prompt}</p>
        ) : null}
        {questions.length > 0 ? (
          <div
            className={`coord-questions${numbered ? ' is-lines' : ''}${
              scene?.variant === 'cells' ? ' is-shapes' : ''
            }`}
          >
            {questions.map((question, index) => {
              const isAxesPoint = scene?.variant === 'axes' && !hasLines && !isConstruct
              const isDraw = question.reply === 'draw'
              const isPair =
                question.reply === 'pair' ||
                (isAxesPoint && question.reply !== 'text' && !isDraw) ||
                (!isPlace &&
                  !isConstruct &&
                  !hasLines &&
                  !isDraw &&
                  question.reply !== 'text' &&
                  (scene?.variant === 'cells' || scene?.variant === 'polygon' || scene?.variant === 'polar'))
              const showShape = Boolean(question.kind && question.kind !== 'point')
              return (
                <div
                  className={`coord-question${isDraw ? ' is-draw' : ''}`}
                  key={`${question.prompt}-${index}`}
                >
                  {numbered ? <span className="coord-question-num">{index + 1}.</span> : null}
                  {showShape ? (
                    <span className="coord-question-icon">
                      <CoordShapeButton kind={question.kind!} size={16} />
                    </span>
                  ) : null}
                  <span className="coord-question-label">
                    {isAxesPoint ? `${question.prompt} est en` : question.prompt}
                  </span>
                  {isDraw ? null : isPlace || (isPair && show) ? (
                    <strong className={isPlace ? 'coord-given' : 'filled-answer'}>{question.answer}</strong>
                  ) : isPair ? (
                    <span className="coord-pair">
                      (
                      <span className="answer-line-field compact">{'\u00a0'}</span>
                      <span className="coord-pair-sep">;</span>
                      <span className="answer-line-field compact">{'\u00a0'}</span>
                      )
                    </span>
                  ) : show ? (
                    <strong className="filled-answer">{question.answer}</strong>
                  ) : (
                    <span className={`answer-line-field${question.reply === 'text' ? ' compact' : ''}`}>
                      {'\u00a0'}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        ) : !columns && !isConstruct ? (
          <div className="problem-field">
            <span className="field-label">Réponse</span>
            {show ? (
              <strong className="filled-answer">{item.answer}</strong>
            ) : (
              <span className="answer-line-field">{'\u00a0'}</span>
            )}
          </div>
        ) : null}
      </div>
      ) : null}
    </div>
  )
}
