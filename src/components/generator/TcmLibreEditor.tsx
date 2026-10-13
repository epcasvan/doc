/**
 * Éditeur libre TCM / TCM CFR / TCM CSC :
 * numérotation à gauche (couleur), champs à droite, traits (pas pastilles),
 * sélecteurs selon le type, sans libellé « Énoncé ».
 */
import type { ReactNode } from 'react'
import type { ArithOp, MathItem } from '@/math/types'
import { fmt } from '@/math/column-arith'
import type { ShapeKind } from '@/components/math/FractionShape'
import { SYMMETRY_TEMPLATES } from '@/tcm-cfr/symetrie'
import {
  applyNamedFigure,
  NAMED_FIGURE_OPTIONS,
  namedFigureKey,
} from '@/tcm/libre-recalc'

const OPS: ArithOp[] = ['+', '−', '×', '÷']
const LENGTH_UNITS = ['m', 'dm', 'cm', 'mm'] as const
const FRAC_KINDS: { value: ShapeKind; label: string }[] = [
  { value: 'rect', label: 'rectangle' },
  { value: 'square', label: 'carré' },
  { value: 'triangle', label: 'triangle' },
  { value: 'circle', label: 'cercle' },
  { value: 'semicircle', label: 'demi-cercle' },
  { value: 'quartercircle', label: 'quart de cercle' },
  { value: 'hexagon', label: 'hexagone' },
]

function LineInput({
  value,
  onChange,
  ariaLabel,
  wide,
  answer,
  compact,
}: {
  value: string
  onChange: (v: string) => void
  ariaLabel: string
  wide?: boolean
  /** Champ réponse / corrigé : fond blanc. */
  answer?: boolean
  compact?: boolean
}) {
  return (
    <input
      className={`libre-line-input${wide ? ' is-wide' : ''}${answer ? ' is-answer' : ''}${compact ? ' is-num' : ''}`}
      type="text"
      value={value}
      aria-label={ariaLabel}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

/** Suite de nombres : un champ par nombre, + pour ajouter, × pour retirer. */
function NumberListEditor({
  values,
  onChange,
  ariaLabel,
  min = 1,
  max = 12,
}: {
  values: string[]
  onChange: (next: string[]) => void
  ariaLabel: string
  min?: number
  max?: number
}) {
  const list = values.length > 0 ? values : ['']
  return (
    <div className="libre-number-list" role="group" aria-label={ariaLabel}>
      {list.map((v, i) => (
        <span key={i} className="libre-number-chip">
          <input
            className="libre-line-input is-num"
            type="text"
            value={v}
            aria-label={`${ariaLabel} ${i + 1}`}
            onChange={(e) => {
              const next = [...list]
              next[i] = e.target.value
              onChange(next)
            }}
          />
          <button
            type="button"
            className="libre-num-remove"
            aria-label={`Supprimer le nombre ${i + 1}`}
            disabled={list.length <= min}
            onClick={() => onChange(list.filter((_, j) => j !== i))}
          >
            ×
          </button>
        </span>
      ))}
      <button
        type="button"
        className="libre-num-add"
        aria-label="Ajouter un nombre"
        disabled={list.length >= max}
        onClick={() => onChange([...list, ''])}
      >
        +
      </button>
    </div>
  )
}

function LineSelect({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  ariaLabel: string
}) {
  return (
    <select
      className="libre-line-input is-select"
      value={value}
      aria-label={ariaLabel}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

function Field({
  label,
  children,
}: {
  label?: string
  children: ReactNode
}) {
  return (
    <label className="libre-field is-line">
      {label ? <span>{label}</span> : null}
      {children}
    </label>
  )
}

export function TcmLibreEditor({
  instruction,
  items,
  exerciseType,
  onChangeInstruction,
  onChangeItems,
}: {
  instruction: string
  items: MathItem[]
  exerciseType: string
  onChangeInstruction: (value: string) => void
  onChangeItems: (items: MathItem[]) => void
}) {
  const patch = (index: number, next: MathItem) => {
    onChangeItems(items.map((item, i) => (i === index ? next : item)))
  }

  const withProps = exerciseType.includes('ex16')

  return (
    <div className="quad-libre-block tcm-libre-editor">
      <b>Contenu de la fiche (mode libre)</b>
      <p className="type-hint muted">
        Modifiez les valeurs puis validez (✓) : les réponses se recalculent automatiquement.
      </p>
      <label className="libre-field is-line">
        <span>Consigne</span>
        <textarea
          className="libre-line-input is-textarea"
          rows={2}
          value={instruction}
          onChange={(e) => onChangeInstruction(e.target.value)}
        />
      </label>
      <ul className="libre-item-list is-tcm" aria-label="Questions">
        {items.map((item, index) => (
          <li key={`tcm-libre-${index}`} className="libre-item-card is-tcm-row">
            <span className="libre-item-num is-accent">{index + 1}.</span>
            <div className="libre-item-body">{renderFields(item, index, patch, withProps, exerciseType)}</div>
          </li>
        ))}
      </ul>
      {items.length === 0 ? (
        <p className="type-hint muted">Aucun item — générez d’abord un contenu.</p>
      ) : null}
    </div>
  )
}

function renderFields(
  item: MathItem,
  index: number,
  patch: (i: number, next: MathItem) => void,
  withProps: boolean,
  exerciseType: string,
) {
  if (item.layout === 'audio-dictation') {
    return (
      <Field label="Réponse">
        <LineInput
          answer
          value={item.answer ?? ''}
          ariaLabel={`Réponse ${index + 1}`}
          onChange={(answer) => patch(index, { ...item, answer })}
        />
      </Field>
    )
  }

  if (item.layout === 'order') {
    return (
      <>
        <Field label="Nombres (dans le désordre)">
          <NumberListEditor
            values={item.sequence ?? []}
            ariaLabel={`Nombres ${index + 1}`}
            min={2}
            max={12}
            onChange={(sequence) => patch(index, { ...item, sequence })}
          />
        </Field>
        <Field label="Ordre">
          <LineSelect
            value={item.orderOp ?? '<'}
            ariaLabel={`Ordre ${index + 1}`}
            options={[
              { value: '<', label: 'croissant (<)' },
              { value: '>', label: 'décroissant (>)' },
            ]}
            onChange={(orderOp) =>
              patch(index, {
                ...item,
                orderOp: orderOp as '<' | '>',
                prompt:
                  orderOp === '<'
                    ? 'Du plus petit au plus grand :'
                    : 'Du plus grand au plus petit :',
              })
            }
          />
        </Field>
        <Field label="Corrigé">
          <LineInput
            answer
            wide
            value={item.answer ?? ''}
            ariaLabel={`Corrigé ${index + 1}`}
            onChange={(answer) => patch(index, { ...item, answer })}
          />
        </Field>
      </>
    )
  }

  if (item.layout === 'compare') {
    return (
      <div className="libre-inline-triple is-compare">
        <LineInput
          compact
          value={item.left ?? ''}
          ariaLabel={`Gauche ${index + 1}`}
          onChange={(left) => patch(index, { ...item, left, prompt: left })}
        />
        <LineSelect
          value={item.answer === '=' || item.answer === '<' || item.answer === '>' ? item.answer : '<'}
          ariaLabel={`Signe ${index + 1}`}
          options={[
            { value: '<', label: '<' },
            { value: '=', label: '=' },
            { value: '>', label: '>' },
          ]}
          onChange={(answer) => patch(index, { ...item, answer })}
        />
        <LineInput
          compact
          value={item.right ?? ''}
          ariaLabel={`Droite ${index + 1}`}
          onChange={(right) => patch(index, { ...item, right })}
        />
      </div>
    )
  }

  if (item.layout === 'place-value') {
    return (
      <>
        <Field label="Nombre">
          <LineInput
            value={item.prompt ?? ''}
            ariaLabel={`Nombre ${index + 1}`}
            onChange={(prompt) => patch(index, { ...item, prompt })}
          />
        </Field>
        <Field label="Corrigé">
          <LineInput
            answer
            wide
            value={item.answer ?? ''}
            ariaLabel={`Corrigé ${index + 1}`}
            onChange={(answer) => patch(index, { ...item, answer })}
          />
        </Field>
      </>
    )
  }

  if (
    item.layout === 'column' ||
    item.layout === 'column-empty' ||
    item.layout === 'division-column'
  ) {
    return (
      <>
        <div className="libre-inline-triple is-op">
          <LineInput
            compact
            value={item.a != null ? fmt(item.a) : ''}
            ariaLabel={`Operande A ${index + 1}`}
            onChange={(raw) => {
              const a = Number(raw.replace(',', '.'))
              patch(index, {
                ...item,
                a: Number.isFinite(a) ? a : item.a,
                prompt:
                  item.layout === 'column-empty' || item.blankOperands
                    ? `${raw} ${item.op ?? '+'} ${item.b != null ? fmt(item.b) : ''}`
                    : item.prompt,
              })
            }}
          />
          <LineSelect
            value={(item.op as string) ?? '+'}
            ariaLabel={`Opération ${index + 1}`}
            options={OPS.map((op) => ({ value: op, label: op }))}
            onChange={(op) => patch(index, { ...item, op: op as ArithOp })}
          />
          <LineInput
            compact
            value={item.b != null ? fmt(item.b) : ''}
            ariaLabel={`Operande B ${index + 1}`}
            onChange={(raw) => {
              const b = Number(raw.replace(',', '.'))
              patch(index, {
                ...item,
                b: Number.isFinite(b) ? b : item.b,
                prompt:
                  item.layout === 'column-empty' || item.blankOperands
                    ? `${item.a != null ? fmt(item.a) : ''} ${item.op ?? '+'} ${raw}`
                    : item.prompt,
              })
            }}
          />
        </div>
        <Field label="Corrigé">
          <LineInput
            answer
            value={item.answer ?? ''}
            ariaLabel={`Corrigé ${index + 1}`}
            onChange={(answer) => patch(index, { ...item, answer })}
          />
        </Field>
      </>
    )
  }

  if (item.layout === 'fraction-shape' && item.fracShape) {
    const fs = item.fracShape
    return (
      <>
        <Field label="Forme">
          <LineSelect
            value={fs.kind}
            ariaLabel={`Forme ${index + 1}`}
            options={FRAC_KINDS.map((k) => ({ value: k.value, label: k.label }))}
            onChange={(kind) =>
              patch(index, {
                ...item,
                fracShape: { ...fs, kind: kind as ShapeKind },
              })
            }
          />
        </Field>
        <div className="libre-inline-triple">
          <Field label="Parts colorées (n)">
            <LineInput
              value={String(fs.n)}
              ariaLabel={`Numérateur ${index + 1}`}
              onChange={(raw) => {
                const n = Math.max(1, Math.round(Number(raw)) || fs.n)
                patch(index, {
                  ...item,
                  fracShape: { ...fs, n },
                  answer: `${n}/${fs.d}`,
                })
              }}
            />
          </Field>
          <Field label="Parts totales (d)">
            <LineInput
              value={String(fs.d)}
              ariaLabel={`Dénominateur ${index + 1}`}
              onChange={(raw) => {
                const d = Math.max(2, Math.round(Number(raw)) || fs.d)
                patch(index, {
                  ...item,
                  fracShape: { ...fs, d },
                  answer: `${fs.n}/${d}`,
                })
              }}
            />
          </Field>
        </div>
        <Field label="Corrigé">
          <LineInput
            answer
            value={item.answer ?? ''}
            ariaLabel={`Corrigé ${index + 1}`}
            onChange={(answer) => patch(index, { ...item, answer })}
          />
        </Field>
      </>
    )
  }

  if (item.layout === 'symmetry-grid' && item.symmetryFigure) {
    const tpl = item.symmetryFigure
    return (
      <>
        <Field label="Figure">
          <LineSelect
            value={tpl.id}
            ariaLabel={`Figure symétrie ${index + 1}`}
            options={SYMMETRY_TEMPLATES.map((t) => ({
              value: t.id,
              label: t.id.replace(/-/g, ' '),
            }))}
            onChange={(id) => {
              const found = SYMMETRY_TEMPLATES.find((t) => t.id === id)
              if (!found) return
              patch(index, {
                ...item,
                symmetryFigure: { ...found, side: tpl.side },
                answer: found.id,
              })
            }}
          />
        </Field>
        <Field label="Côté">
          <LineSelect
            value={tpl.side}
            ariaLabel={`Côté ${index + 1}`}
            options={[
              { value: 'left', label: 'gauche' },
              { value: 'right', label: 'droite' },
            ]}
            onChange={(side) =>
              patch(index, {
                ...item,
                symmetryFigure: { ...tpl, side: side as 'left' | 'right' },
              })
            }
          />
        </Field>
      </>
    )
  }

  if (item.layout === 'text') {
    return (
      <>
        <Field label="Problème / question">
          <textarea
            className="libre-line-input is-textarea"
            rows={3}
            value={item.prompt ?? ''}
            aria-label={`Problème ${index + 1}`}
            onChange={(e) => patch(index, { ...item, prompt: e.target.value })}
          />
        </Field>
        <Field label="Calcul (corrigé)">
          <LineInput
            answer
            wide
            value={item.calcAnswer ?? ''}
            ariaLabel={`Calcul ${index + 1}`}
            onChange={(calcAnswer) => patch(index, { ...item, calcAnswer })}
          />
        </Field>
        <Field label="Phrase réponse">
          <LineInput
            answer
            wide
            value={item.responseAnswer ?? ''}
            ariaLabel={`Phrase ${index + 1}`}
            onChange={(responseAnswer) => patch(index, { ...item, responseAnswer })}
          />
        </Field>
        <Field label="Réponse">
          <LineInput
            answer
            value={item.answer ?? ''}
            ariaLabel={`Réponse ${index + 1}`}
            onChange={(answer) => patch(index, { ...item, answer })}
          />
        </Field>
      </>
    )
  }

  if (item.layout === 'geo' && item.geoNameCard) {
    return (
      <>
        <Field label="Forme">
          <LineSelect
            value={namedFigureKey(item)}
            ariaLabel={`Forme ${index + 1}`}
            options={NAMED_FIGURE_OPTIONS.map((o) => ({
              value: o.key,
              label: o.label,
            }))}
            onChange={(key) => patch(index, applyNamedFigure(item, key, withProps))}
          />
        </Field>
        {(item.propertyLines ?? []).map((line, li) => (
          <Field key={`prop-${li}`} label={line.label}>
            <LineInput
              value={line.answer}
              ariaLabel={`${line.label} ${index + 1}`}
              onChange={(answer) => {
                const propertyLines = [...(item.propertyLines ?? [])]
                propertyLines[li] = { ...line, answer }
                patch(index, {
                  ...item,
                  propertyLines,
                  answer: propertyLines.map((p) => p.answer).join(' ; '),
                })
              }}
            />
          </Field>
        ))}
      </>
    )
  }

  if (item.layout === 'segment-measure' && item.segments) {
    return (
      <>
        {item.segments.map((seg, si) => (
          <div key={`seg-${si}`} className="libre-inline-triple">
            <Field label={`Segment ${String.fromCharCode(97 + si)}`}>
              <LineInput
                value={seg.display}
                ariaLabel={`Longueur ${si + 1}`}
                onChange={(display) => {
                  const segments = item.segments!.map((s, j) =>
                    j === si ? { ...s, display } : s,
                  )
                  patch(index, { ...item, segments })
                }}
              />
            </Field>
            <Field label="Unité">
              <LineSelect
                value={seg.unit}
                ariaLabel={`Unité ${si + 1}`}
                options={[
                  { value: 'mm', label: 'mm' },
                  { value: 'cm', label: 'cm' },
                ]}
                onChange={(unit) => {
                  const segments = item.segments!.map((s, j) =>
                    j === si ? { ...s, unit: unit as 'mm' | 'cm' } : s,
                  )
                  patch(index, { ...item, segments })
                }}
              />
            </Field>
          </div>
        ))}
        {(item.options ?? []).map((q, qi) => (
          <Field key={`q-${qi}`} label={`Question ${qi + 1}`}>
            <LineInput
              wide
              value={q}
              ariaLabel={`Question ${qi + 1}`}
              onChange={(raw) => {
                const options = [...(item.options ?? [])]
                options[qi] = raw
                patch(index, { ...item, options })
              }}
            />
          </Field>
        ))}
        <Field label="Corrigé (ex. a ; c)">
          <LineInput
            answer
            value={item.answer ?? ''}
            ariaLabel={`Corrigé segments ${index + 1}`}
            onChange={(answer) => patch(index, { ...item, answer })}
          />
        </Field>
      </>
    )
  }

  if (item.convert) {
    return (
      <div className="libre-inline-triple">
        <Field label="Valeur">
          <LineInput
            value={item.convert.value}
            ariaLabel={`Valeur ${index + 1}`}
            onChange={(value) =>
              patch(index, { ...item, convert: { ...item.convert!, value } })
            }
          />
        </Field>
        <Field label="De">
          <LineSelect
            value={item.convert.from}
            ariaLabel={`Unité départ ${index + 1}`}
            options={LENGTH_UNITS.map((u) => ({ value: u, label: u }))}
            onChange={(from) =>
              patch(index, { ...item, convert: { ...item.convert!, from } })
            }
          />
        </Field>
        <Field label="Vers">
          <LineSelect
            value={item.convert.to}
            ariaLabel={`Unité arrivée ${index + 1}`}
            options={LENGTH_UNITS.map((u) => ({ value: u, label: u }))}
            onChange={(to) =>
              patch(index, { ...item, convert: { ...item.convert!, to } })
            }
          />
        </Field>
        <Field label="Corrigé">
          <LineInput
            answer
            value={item.answer ?? ''}
            ariaLabel={`Corrigé conversion ${index + 1}`}
            onChange={(answer) => patch(index, { ...item, answer })}
          />
        </Field>
      </div>
    )
  }

  if (item.layout === 'inline' && /\/\s*\d/.test(item.prompt ?? '')) {
    const m = (item.prompt ?? '').match(/(-?\d+)\s*\/\s*(-?\d+)/)
    const n = m?.[1] ?? '1'
    const d = m?.[2] ?? '2'
    return (
      <div className="libre-inline-triple">
        <Field label="Numérateur">
          <LineInput
            value={n}
            ariaLabel={`Numérateur ${index + 1}`}
            onChange={(nn) =>
              patch(index, { ...item, prompt: `${nn}/${d} =` })
            }
          />
        </Field>
        <Field label="Dénominateur">
          <LineInput
            value={d}
            ariaLabel={`Dénominateur ${index + 1}`}
            onChange={(dd) =>
              patch(index, { ...item, prompt: `${n}/${dd} =` })
            }
          />
        </Field>
        <Field label="Corrigé">
          <LineInput
            answer
            value={item.answer ?? ''}
            ariaLabel={`Corrigé fraction ${index + 1}`}
            onChange={(answer) => patch(index, { ...item, answer })}
          />
        </Field>
      </div>
    )
  }

  if (item.layout === 'geo' && item.geoDualPads) {
    const dims = item.dims ?? {}
    const isAreaProblem = /aire/i.test(item.prompt ?? '') || exerciseType.includes('ex25') || exerciseType.includes('ex26')
    if (isAreaProblem) {
      return (
        <>
          <Field label="Énoncé (phrase)">
            <textarea
              className="libre-line-input is-textarea"
              rows={2}
              value={item.prompt ?? ''}
              aria-label={`Énoncé ${index + 1}`}
              onChange={(e) => patch(index, { ...item, prompt: e.target.value })}
            />
          </Field>
          {item.figure === 'rectangle' ? (
            <div className="libre-inline-triple">
              <Field label="Longueur connue">
                <LineInput
                  value={dims.length != null ? fmt(dims.length) : dims.width != null ? '' : ''}
                  ariaLabel={`Longueur ${index + 1}`}
                  onChange={(raw) => {
                    const length = Number(raw.replace(',', '.'))
                    patch(index, {
                      ...item,
                      dims: {
                        ...dims,
                        length: Number.isFinite(length) ? length : dims.length,
                        width: undefined,
                      },
                    })
                  }}
                />
              </Field>
              <Field label="Largeur connue">
                <LineInput
                  value={dims.width != null ? fmt(dims.width) : ''}
                  ariaLabel={`Largeur ${index + 1}`}
                  onChange={(raw) => {
                    const width = Number(raw.replace(',', '.'))
                    patch(index, {
                      ...item,
                      dims: {
                        ...dims,
                        width: Number.isFinite(width) ? width : dims.width,
                        length: undefined,
                      },
                    })
                  }}
                />
              </Field>
            </div>
          ) : null}
          <Field label="Corrigé (côté)">
            <LineInput
              answer
              value={item.answer ?? ''}
              ariaLabel={`Corrigé ${index + 1}`}
              onChange={(answer) => patch(index, { ...item, answer })}
            />
          </Field>
        </>
      )
    }
    return (
      <>
        {item.figure === 'square' ? (
          <Field label="Côté">
            <LineInput
              value={dims.side != null ? fmt(dims.side) : dims.length != null ? fmt(dims.length) : ''}
              ariaLabel={`Côté ${index + 1}`}
              onChange={(raw) => {
                const side = Number(raw.replace(',', '.'))
                if (!Number.isFinite(side)) return
                patch(index, { ...item, dims: { ...dims, side, length: side } })
              }}
            />
          </Field>
        ) : null}
        {item.figure === 'rectangle' ? (
          <div className="libre-inline-triple">
            <Field label="Longueur">
              <LineInput
                value={dims.length != null ? fmt(dims.length) : ''}
                ariaLabel={`Longueur ${index + 1}`}
                onChange={(raw) => {
                  const length = Number(raw.replace(',', '.'))
                  patch(index, {
                    ...item,
                    dims: { ...dims, length: Number.isFinite(length) ? length : dims.length },
                  })
                }}
              />
            </Field>
            <Field label="Largeur">
              <LineInput
                value={dims.width != null ? fmt(dims.width) : ''}
                ariaLabel={`Largeur ${index + 1}`}
                onChange={(raw) => {
                  const width = Number(raw.replace(',', '.'))
                  patch(index, {
                    ...item,
                    dims: { ...dims, width: Number.isFinite(width) ? width : dims.width },
                  })
                }}
              />
            </Field>
          </div>
        ) : null}
        {item.figure === 'triangle' ? (
          <div className="libre-inline-triple">
            {(['a', 'b', 'c', 'height'] as const).map((key) => (
              <Field key={key} label={key === 'height' ? 'Hauteur h' : `Côté ${key}`}>
                <LineInput
                  value={dims[key] != null ? fmt(Number(dims[key])) : ''}
                  ariaLabel={`${key} ${index + 1}`}
                  onChange={(raw) => {
                    const v = Number(raw.replace(',', '.'))
                    patch(index, {
                      ...item,
                      dims: { ...dims, [key]: Number.isFinite(v) ? v : dims[key] },
                    })
                  }}
                />
              </Field>
            ))}
          </div>
        ) : null}
        <Field label="Périmètre">
          <LineInput
            answer
            value={item.propertyLines?.find((l) => /Périmètre/i.test(l.label))?.answer ?? ''}
            ariaLabel={`Périmètre ${index + 1}`}
            onChange={(answer) => {
              const propertyLines = [...(item.propertyLines ?? [])]
              const i = propertyLines.findIndex((l) => /Périmètre/i.test(l.label))
              if (i >= 0) propertyLines[i] = { ...propertyLines[i]!, answer }
              else propertyLines.unshift({ label: 'Périmètre', answer })
              patch(index, { ...item, propertyLines })
            }}
          />
        </Field>
        <Field label="Aire">
          <LineInput
            answer
            value={item.propertyLines?.find((l) => /Aire/i.test(l.label))?.answer ?? ''}
            ariaLabel={`Aire ${index + 1}`}
            onChange={(answer) => {
              const propertyLines = [...(item.propertyLines ?? [])]
              const i = propertyLines.findIndex((l) => /Aire/i.test(l.label))
              if (i >= 0) propertyLines[i] = { ...propertyLines[i]!, answer }
              else propertyLines.push({ label: 'Aire', answer })
              patch(index, { ...item, propertyLines })
            }}
          />
        </Field>
      </>
    )
  }

  if (item.layout === 'coord' && item.coordScene) {
    const scene = item.coordScene
    const unitSquares = scene.unitSquares === 2 ? 2 : 1
    const marks = scene.marks ?? []
    const syncFromMarks = (nextMarks: NonNullable<typeof scene.marks>) => {
      const place = nextMarks.filter((m) => m.reveal === 'answer')
      const read = nextMarks.filter((m) => m.reveal !== 'answer')
      const coordQuestions = [
        ...place.map((p) => ({
          prompt: `Placez ${p.label ?? ''}(${p.x} ; ${p.y})`,
          answer: `(${p.x} ; ${p.y})`,
          reply: 'pair' as const,
        })),
        ...read.map((p) => ({
          prompt: `Écrivez les coordonnées du point ${p.label ?? ''}.`,
          answer: `(${p.x} ; ${p.y})`,
          reply: 'pair' as const,
        })),
      ]
      patch(index, {
        ...item,
        coordScene: { ...scene, marks: nextMarks },
        coordQuestions,
        answer: nextMarks.map((p) => `${p.label}(${p.x};${p.y})`).join(' ; '),
      })
    }
    return (
      <>
        <Field label="Graduation">
          <LineSelect
            value={String(unitSquares)}
            ariaLabel="Type de plan"
            options={[
              { value: '1', label: '1 / carré (1 u = 1 case)' },
              { value: '2', label: '2 / carré (1 u = 2 cases)' },
            ]}
            onChange={(v) => {
              const us = Number(v) as 1 | 2
              patch(index, {
                ...item,
                coordScene: {
                  ...scene,
                  unitSquares: us,
                  labelStep: us === 1 ? 2 : 1,
                },
              })
            }}
          />
        </Field>
        {marks.map((m, mi) => (
          <div key={`mk-${mi}`} className="libre-inline-triple">
            <Field label={`Point ${mi + 1}`}>
              <LineInput
                value={m.label ?? ''}
                ariaLabel={`Lettre ${mi + 1}`}
                onChange={(label) => {
                  const next = marks.map((p, j) => (j === mi ? { ...p, label } : p))
                  syncFromMarks(next)
                }}
              />
            </Field>
            <Field label="x">
              <LineInput
                value={String(m.x)}
                ariaLabel={`x ${mi + 1}`}
                onChange={(raw) => {
                  const x = Number(raw.replace(',', '.'))
                  if (!Number.isFinite(x)) return
                  const next = marks.map((p, j) => (j === mi ? { ...p, x } : p))
                  syncFromMarks(next)
                }}
              />
            </Field>
            <Field label="y">
              <LineInput
                value={String(m.y)}
                ariaLabel={`y ${mi + 1}`}
                onChange={(raw) => {
                  const y = Number(raw.replace(',', '.'))
                  if (!Number.isFinite(y)) return
                  const next = marks.map((p, j) => (j === mi ? { ...p, y } : p))
                  syncFromMarks(next)
                }}
              />
            </Field>
          </div>
        ))}
      </>
    )
  }

  if (item.layout === 'metro-map' && item.metroQuestions) {
    return (
      <>
        {(item.metroQuestions ?? []).map((q, qi) => (
          <div key={`mq-${qi}`} className="libre-inline-triple">
            <Field label={`Q${qi + 1}`}>
              <LineInput
                wide
                value={q.prompt ?? ''}
                ariaLabel={`Question métro ${qi + 1}`}
                onChange={(prompt) => {
                  const metroQuestions = [...(item.metroQuestions ?? [])]
                  metroQuestions[qi] = { ...q, prompt }
                  patch(index, { ...item, metroQuestions })
                }}
              />
            </Field>
            <Field label="Réponse">
              <LineInput
                answer
                value={q.answer ?? ''}
                ariaLabel={`Réponse métro ${qi + 1}`}
                onChange={(answer) => {
                  const metroQuestions = [...(item.metroQuestions ?? [])]
                  metroQuestions[qi] = { ...q, answer }
                  patch(index, {
                    ...item,
                    metroQuestions,
                    answer: metroQuestions.map((m) => m.answer).join(' ; '),
                  })
                }}
              />
            </Field>
          </div>
        ))}
      </>
    )
  }

  // Défaut : prompt + answer sans libellé « Énoncé »
  return (
    <>
      <Field>
        <LineInput
          wide
          value={item.prompt ?? item.left ?? ''}
          ariaLabel={`Question ${index + 1}`}
          onChange={(prompt) =>
            patch(index, {
              ...item,
              prompt,
              ...(item.left != null ? { left: prompt } : {}),
            })
          }
        />
      </Field>
      <Field label="Corrigé">
        <LineInput
          answer
          wide
          value={item.answer ?? ''}
          ariaLabel={`Corrigé ${index + 1}`}
          onChange={(answer) => patch(index, { ...item, answer })}
        />
      </Field>
      {item.options && item.options.length > 0 ? (
        <div className="libre-options">
          {item.options.map((opt, oi) => (
            <Field key={`opt-${oi}`} label={String.fromCharCode(65 + oi)}>
              <LineInput
                value={opt}
                ariaLabel={`Choix ${oi + 1}`}
                onChange={(raw) => {
                  const options = [...(item.options ?? [])]
                  options[oi] = raw
                  patch(index, { ...item, options })
                }}
              />
            </Field>
          ))}
        </div>
      ) : null}
    </>
  )
}
