/**
 * Éditeur libre TCM / TCM CFR / TCM CSC :
 * numérotation à gauche (couleur), champs à droite, traits (pas pastilles),
 * sélecteurs selon le type, sans libellé « Énoncé ».
 * Corrigés en lecture seule (recalcul à la validation) ; nombres saisissables
 * avec brouillon local (retour arrière OK ; vide → valeur précédente).
 */
import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { ArithOp, MathItem } from '@/math/types'
import { fmt } from '@/math/column-arith'
import type { ShapeKind } from '@/components/math/FractionShape'
import {
  buildSymmetryFigure,
  SYMMETRY_FIGURE_LABELS,
  SYMMETRY_TEMPLATES,
  type SymRotation,
} from '@/tcm-cfr/symetrie'
import {
  METRO_MAPS,
  allMetroCells,
  buildMetroQuestion,
  generateMetroQuestions,
  hydrateMetroQuestion,
  inferMetroQuestionKind,
  metroMapLabel,
  type MetroQuestion,
  type MetroQuestionKind,
} from '@/tcm-cfr/metro'
import { createRng } from '@/math/rng'
import { fractionPartsFromItem, fractionTermFr } from '@/tcm/fraction-words'
import { mulAudioParts, numberAudioParts } from '@/tcm-cfr/audio-nombres'
import { parseFrNumber } from '@/tcm/libre-parse'
import {
  applyNamedFigure,
  NAMED_FIGURE_OPTIONS,
  namedFigureKey,
} from '@/tcm/libre-recalc'

const NUM_1_100_LIST_ID = 'tcm-libre-num-1-100'
const NUM_1_100_OPTIONS = Array.from({ length: 100 }, (_, i) => String(i + 1))

function clampInt1to100(n: number): number {
  return Math.max(1, Math.min(100, Math.round(n)))
}

/** Facteurs a×b depuis left/right ou les fichiers audio. */
function mulFactorsFromItem(item: MathItem): { a: number; b: number } {
  const left = parseFrNumber(item.left ?? '')
  const right = parseFrNumber(item.right ?? '')
  if (left != null && right != null) {
    return { a: clampInt1to100(left), b: clampInt1to100(right) }
  }
  const nums = (item.audioParts ?? [])
    .map((p) => {
      const m = /\/nombre\/(\d+)\.mp3$/.exec(p)
      return m ? Number(m[1]) : null
    })
    .filter((n): n is number => n != null && n >= 1 && n <= 100)
  if (nums.length >= 2) return { a: nums[0]!, b: nums[nums.length - 1]! }
  return { a: 2, b: 2 }
}

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

/** Corrigé / réponse : cadre gris non modifiable. */
function CorrigeBox({
  value,
  ariaLabel,
  wide,
  compact,
}: {
  value: string
  ariaLabel: string
  wide?: boolean
  compact?: boolean
}) {
  return (
    <div
      className={`libre-corrige-box${wide ? ' is-wide' : ''}${compact ? ' is-num' : ''}`}
      aria-label={ariaLabel}
      role="status"
    >
      {value?.trim() ? value : '\u00a0'}
    </div>
  )
}

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
  /** Corrigé : affichage gris, non éditable. */
  answer?: boolean
  compact?: boolean
}) {
  if (answer) {
    return <CorrigeBox value={value} ariaLabel={ariaLabel} wide={wide} compact={compact} />
  }
  return (
    <input
      className={`libre-line-input${wide ? ' is-wide' : ''}${compact ? ' is-num' : ''}`}
      type="text"
      value={value}
      aria-label={ariaLabel}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

/**
 * Champ nombre : brouillon local (effacement / retour arrière possibles).
 * Au blur / Entrée : si vide ou invalide → restaure la valeur précédente.
 */
function NumInput({
  value,
  onCommit,
  ariaLabel,
  compact,
  wide,
  requireNumber = true,
  listId,
}: {
  value: string
  onCommit: (next: string) => void
  ariaLabel: string
  compact?: boolean
  wide?: boolean
  /** Si true, refuse les textes non numériques (restaure). */
  requireNumber?: boolean
  /** datalist partagée (ex. 1–100) : choisir ou saisir. */
  listId?: string
}) {
  const [draft, setDraft] = useState(value)
  const prevRef = useRef(value)

  useEffect(() => {
    setDraft(value)
    prevRef.current = value
  }, [value])

  const finish = () => {
    const trimmed = draft.trim()
    if (!trimmed) {
      setDraft(prevRef.current)
      return
    }
    if (requireNumber && parseFrNumber(trimmed) == null) {
      setDraft(prevRef.current)
      return
    }
    onCommit(trimmed)
  }

  return (
    <input
      className={`libre-line-input${wide ? ' is-wide' : ''}${compact ? ' is-num' : ''}`}
      type="text"
      inputMode="decimal"
      list={listId}
      value={draft}
      aria-label={ariaLabel}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={finish}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          ;(e.target as HTMLInputElement).blur()
        }
      }}
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
          <NumInput
            compact
            value={v}
            ariaLabel={`${ariaLabel} ${i + 1}`}
            onCommit={(next) => {
              const copy = [...list]
              copy[i] = next
              onChange(copy)
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
        Modifiez les nombres puis validez (✓) : les corrigés (cadre gris) se recalculent seuls et
        ne sont pas modifiables. Un champ nombre laissé vide retrouve sa valeur précédente.
      </p>
      <datalist id={NUM_1_100_LIST_ID}>
        {NUM_1_100_OPTIONS.map((n) => (
          <option key={n} value={n} />
        ))}
      </datalist>
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
    if (exerciseType.includes('ex02')) {
      const { a, b } = mulFactorsFromItem(item)
      const commitMul = (na: number, nb: number) => {
        const parts = mulAudioParts(na, nb)
        patch(index, {
          ...item,
          left: String(na),
          right: String(nb),
          answer: String(na * nb),
          audioParts: parts,
          audioSrc: parts[0],
        })
      }
      return (
        <div className="libre-inline-triple is-op">
          <Field label="Nombre 1">
            <NumInput
              compact
              listId={NUM_1_100_LIST_ID}
              value={String(a)}
              ariaLabel={`Facteur 1 question ${index + 1}`}
              onCommit={(raw) => {
                const parsed = parseFrNumber(raw)
                if (parsed == null) return
                commitMul(clampInt1to100(parsed), b)
              }}
            />
          </Field>
          <span className="libre-mul-sign" aria-hidden>
            ×
          </span>
          <Field label="Nombre 2">
            <NumInput
              compact
              listId={NUM_1_100_LIST_ID}
              value={String(b)}
              ariaLabel={`Facteur 2 question ${index + 1}`}
              onCommit={(raw) => {
                const parsed = parseFrNumber(raw)
                if (parsed == null) return
                commitMul(a, clampInt1to100(parsed))
              }}
            />
          </Field>
          <Field label="Corrigé">
            <CorrigeBox
              compact
              value={item.answer ?? String(a * b)}
              ariaLabel={`Produit question ${index + 1}`}
            />
          </Field>
        </div>
      )
    }
    const current = parseFrNumber(item.answer ?? '') ?? 1
    return (
      <Field label="Nombre (1–100)">
        <NumInput
          listId={NUM_1_100_LIST_ID}
          value={String(clampInt1to100(current))}
          ariaLabel={`Nombre entendu ${index + 1}`}
          onCommit={(raw) => {
            const parsed = parseFrNumber(raw)
            if (parsed == null) return
            const n = clampInt1to100(parsed)
            const parts = numberAudioParts(n)
            patch(index, {
              ...item,
              answer: String(n),
              audioParts: parts,
              audioSrc: parts[0],
            })
          }}
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
        <NumInput
          compact
          value={item.left ?? ''}
          ariaLabel={`Gauche ${index + 1}`}
          onCommit={(left) => patch(index, { ...item, left, prompt: left })}
        />
        <CorrigeBox
          compact
          value={item.answer === '=' || item.answer === '<' || item.answer === '>' ? item.answer : '·'}
          ariaLabel={`Corrigé signe ${index + 1}`}
        />
        <NumInput
          compact
          value={item.right ?? ''}
          ariaLabel={`Droite ${index + 1}`}
          onCommit={(right) => patch(index, { ...item, right })}
        />
      </div>
    )
  }

  if (item.layout === 'place-value') {
    return (
      <>
        <Field label="Nombre">
          <NumInput
            value={item.prompt ?? ''}
            ariaLabel={`Nombre ${index + 1}`}
            onCommit={(prompt) => patch(index, { ...item, prompt })}
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
    const checkSubOrder =
      (exerciseType.includes('ex07') || exerciseType.includes('ex08')) &&
      item.op === '−'
    return (
      <>
        <div className="libre-inline-triple is-op">
          <NumInput
            compact
            value={item.a != null ? fmt(item.a) : ''}
            ariaLabel={`Operande A ${index + 1}`}
            onCommit={(raw) => {
              const a = Number(raw.replace(',', '.'))
              if (!Number.isFinite(a)) return
              const b = item.b
              const badSub = checkSubOrder && typeof b === 'number' && a <= b
              patch(index, {
                ...item,
                a,
                libreError: badSub
                  ? 'Pour une soustraction, le premier nombre doit être plus grand que le second.'
                  : undefined,
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
            onChange={(op) => {
              const badSub =
                (exerciseType.includes('ex07') || exerciseType.includes('ex08')) &&
                op === '−' &&
                typeof item.a === 'number' &&
                typeof item.b === 'number' &&
                item.a <= item.b
              patch(index, {
                ...item,
                op: op as ArithOp,
                libreError: badSub
                  ? 'Pour une soustraction, le premier nombre doit être plus grand que le second.'
                  : undefined,
              })
            }}
          />
          <NumInput
            compact
            value={item.b != null ? fmt(item.b) : ''}
            ariaLabel={`Operande B ${index + 1}`}
            onCommit={(raw) => {
              const b = Number(raw.replace(',', '.'))
              if (!Number.isFinite(b)) return
              const a = item.a
              const badSub = checkSubOrder && typeof a === 'number' && a <= b
              patch(index, {
                ...item,
                b,
                libreError: badSub
                  ? 'Pour une soustraction, le premier nombre doit être plus grand que le second.'
                  : undefined,
                prompt:
                  item.layout === 'column-empty' || item.blankOperands
                    ? `${item.a != null ? fmt(item.a) : ''} ${item.op ?? '+'} ${raw}`
                    : item.prompt,
              })
            }}
          />
        </div>
        {item.libreError ? (
          <p className="libre-field-error" role="alert">
            {item.libreError}
          </p>
        ) : null}
        <Field label="Corrigé">
          <CorrigeBox value={item.answer ?? ''} ariaLabel={`Corrigé ${index + 1}`} />
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
            <NumInput
              value={String(fs.n)}
              ariaLabel={`Numérateur ${index + 1}`}
              onCommit={(raw) => {
                const n = Math.max(1, Math.round(Number(raw.replace(',', '.'))) || fs.n)
                patch(index, {
                  ...item,
                  fracShape: { ...fs, n },
                  answer: `${n}/${fs.d}`,
                })
              }}
            />
          </Field>
          <Field label="Parts totales (d)">
            <NumInput
              value={String(fs.d)}
              ariaLabel={`Dénominateur ${index + 1}`}
              onCommit={(raw) => {
                const d = Math.max(2, Math.round(Number(raw.replace(',', '.'))) || fs.d)
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
    const baseId = tpl.id.replace(/-droite$/, '')
    const rotation = (tpl.rotation ?? 0) as SymRotation
    const applyFigure = (id: string, side: 'left' | 'right', rot: SymRotation) => {
      const next = buildSymmetryFigure(id, side, rot)
      if (!next) return
      patch(index, {
        ...item,
        symmetryFigure: next,
        answer: next.id,
      })
    }
    return (
      <>
        <Field label="Figure">
          <LineSelect
            value={baseId}
            ariaLabel={`Figure symétrie ${index + 1}`}
            options={SYMMETRY_TEMPLATES.map((t) => ({
              value: t.id,
              label: SYMMETRY_FIGURE_LABELS[t.id] ?? t.id.replace(/-/g, ' '),
            }))}
            onChange={(id) => applyFigure(id, tpl.side, rotation)}
          />
        </Field>
        <div className="libre-inline-triple is-op">
          <Field label="Côté">
            <LineSelect
              value={tpl.side}
              ariaLabel={`Côté ${index + 1}`}
              options={[
                { value: 'left', label: 'gauche' },
                { value: 'right', label: 'droite' },
              ]}
              onChange={(side) => applyFigure(baseId, side as 'left' | 'right', rotation)}
            />
          </Field>
          <Field label="Rotation">
            <LineSelect
              value={String(rotation)}
              ariaLabel={`Rotation ${index + 1}`}
              options={[
                { value: '0', label: '0° (normal)' },
                { value: '90', label: '+90°' },
                { value: '180', label: '180°' },
                { value: '270', label: '270°' },
              ]}
              onChange={(raw) => {
                const rot = Number(raw) as SymRotation
                applyFigure(baseId, tpl.side, rot)
              }}
            />
          </Field>
        </div>
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
              answer
              value={line.answer}
              ariaLabel={`${line.label} ${index + 1}`}
              onChange={() => {}}
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
              <NumInput
                value={seg.display}
                ariaLabel={`Longueur ${si + 1}`}
                onCommit={(display) => {
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
        {(item.options ?? []).map((q, qi) => {
          const answers = (item.answer ?? '').split(';').map((s) => s.trim())
          while (answers.length < (item.options?.length ?? 0)) answers.push('')
          return (
            <div key={`q-${qi}`} className="libre-inline-triple is-op">
              <Field label={`Question ${qi + 1}`}>
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
              <Field label={`Corrigé ${qi + 1}`}>
                <LineInput
                  answer
                  compact
                  value={answers[qi] ?? ''}
                  ariaLabel={`Corrigé question ${qi + 1}`}
                  onChange={(raw) => {
                    const next = [...answers]
                    next[qi] = raw.trim()
                    patch(index, { ...item, answer: next.join(' ; ') })
                  }}
                />
              </Field>
            </div>
          )
        })}
      </>
    )
  }

  // Ex. 11 — fractions en lettres : n et d sur une ligne → texte FR + fraction.
  if (item.layout === 'inline' && exerciseType.includes('ex11')) {
    const parts = fractionPartsFromItem(item)
    const n = parts?.n ?? 1
    const d = parts?.d ?? 2
    const term = (item.prompt ?? '').replace(/\s*=\s*$/, '') || fractionTermFr(n, d)
    const applyNd = (nn: number, dd: number) => {
      const safeN = Math.max(1, Math.round(nn) || 1)
      const safeD = Math.max(2, Math.round(dd) || 2)
      const nextTerm = fractionTermFr(safeN, safeD)
      patch(index, {
        ...item,
        a: safeN,
        b: safeD,
        prompt: `${nextTerm} =`,
        answer: `${safeN}/${safeD}`,
      })
    }
    return (
      <>
        <div className="libre-inline-triple is-frac">
          <Field label="Numérateur">
            <NumInput
              compact
              value={String(n)}
              ariaLabel={`Numérateur ${index + 1}`}
              onCommit={(raw) => {
                const nn = Number(raw.replace(',', '.'))
                if (!Number.isFinite(nn)) return
                applyNd(nn, d)
              }}
            />
          </Field>
          <Field label="Dénominateur">
            <NumInput
              compact
              value={String(d)}
              ariaLabel={`Dénominateur ${index + 1}`}
              onCommit={(raw) => {
                const dd = Number(raw.replace(',', '.'))
                if (!Number.isFinite(dd)) return
                applyNd(n, dd)
              }}
            />
          </Field>
        </div>
        <Field label="Texte">
          <LineInput
            answer
            wide
            value={term}
            ariaLabel={`Texte ${index + 1}`}
            onChange={() => {}}
          />
        </Field>
        <Field label="Corrigé">
          <LineInput
            answer
            value={item.answer ?? `${n}/${d}`}
            ariaLabel={`Corrigé ${index + 1}`}
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
          <NumInput
            value={item.convert.value}
            ariaLabel={`Valeur ${index + 1}`}
            onCommit={(value) =>
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
          <NumInput
            value={n}
            ariaLabel={`Numérateur ${index + 1}`}
            onCommit={(nn) =>
              patch(index, { ...item, prompt: `${nn}/${d} =` })
            }
          />
        </Field>
        <Field label="Dénominateur">
          <NumInput
            value={d}
            ariaLabel={`Dénominateur ${index + 1}`}
            onCommit={(dd) =>
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
                <NumInput
                  value={dims.length != null ? fmt(dims.length) : ''}
                  ariaLabel={`Longueur ${index + 1}`}
                  onCommit={(raw) => {
                    const length = Number(raw.replace(',', '.'))
                    if (!Number.isFinite(length)) return
                    patch(index, {
                      ...item,
                      dims: {
                        ...dims,
                        length,
                        width: undefined,
                      },
                    })
                  }}
                />
              </Field>
              <Field label="Largeur connue">
                <NumInput
                  value={dims.width != null ? fmt(dims.width) : ''}
                  ariaLabel={`Largeur ${index + 1}`}
                  onCommit={(raw) => {
                    const width = Number(raw.replace(',', '.'))
                    if (!Number.isFinite(width)) return
                    patch(index, {
                      ...item,
                      dims: {
                        ...dims,
                        width,
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
            <NumInput
              value={dims.side != null ? fmt(dims.side) : dims.length != null ? fmt(dims.length) : ''}
              ariaLabel={`Côté ${index + 1}`}
              onCommit={(raw) => {
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
              <NumInput
                value={dims.length != null ? fmt(dims.length) : ''}
                ariaLabel={`Longueur ${index + 1}`}
                onCommit={(raw) => {
                  const length = Number(raw.replace(',', '.'))
                  if (!Number.isFinite(length)) return
                  patch(index, {
                    ...item,
                    dims: { ...dims, length },
                  })
                }}
              />
            </Field>
            <Field label="Largeur">
              <NumInput
                value={dims.width != null ? fmt(dims.width) : ''}
                ariaLabel={`Largeur ${index + 1}`}
                onCommit={(raw) => {
                  const width = Number(raw.replace(',', '.'))
                  if (!Number.isFinite(width)) return
                  patch(index, {
                    ...item,
                    dims: { ...dims, width },
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
                <NumInput
                  value={dims[key] != null ? fmt(Number(dims[key])) : ''}
                  ariaLabel={`${key} ${index + 1}`}
                  onCommit={(raw) => {
                    const v = Number(raw.replace(',', '.'))
                    if (!Number.isFinite(v)) return
                    patch(index, {
                      ...item,
                      dims: { ...dims, [key]: v },
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
    const positiveCells = 24
    const maxUnit = positiveCells / unitSquares
    const step = unitSquares === 2 ? 0.5 : 1
    const clampAxis = (n: number) => {
      const snapped = Math.round(n / step) * step
      return Math.round(Math.max(0, Math.min(maxUnit, snapped)) * 1000) / 1000
    }
    const pair = (x: number, y: number) => `(${fmt(x)} ; ${fmt(y)})`
    const marks = scene.marks ?? []
    const syncFromMarks = (
      nextMarks: NonNullable<typeof scene.marks>,
      scenePatch?: Partial<typeof scene>,
    ) => {
      const place = nextMarks.filter((m) => m.reveal === 'answer')
      const read = nextMarks.filter((m) => m.reveal !== 'answer')
      const coordQuestions = [
        ...place.map((p) => ({
          prompt: `Placez ${p.label ?? ''}${pair(p.x, p.y)}`,
          answer: pair(p.x, p.y),
          reply: 'pair' as const,
        })),
        ...read.map((p) => ({
          prompt: `Écrivez les coordonnées du point ${p.label ?? ''}.`,
          answer: pair(p.x, p.y),
          reply: 'pair' as const,
        })),
      ]
      patch(index, {
        ...item,
        coordScene: { ...scene, ...scenePatch, marks: nextMarks },
        coordQuestions,
        answer: nextMarks.map((p) => `${p.label ?? ''}${pair(p.x, p.y)}`).join(' ; '),
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
              const nextMax = positiveCells / us
              const nextStep = us === 2 ? 0.5 : 1
              const snap = (n: number) => {
                const s = Math.round(n / nextStep) * nextStep
                return Math.round(Math.max(0, Math.min(nextMax, s)) * 1000) / 1000
              }
              const nextMarks = marks.map((p) => ({ ...p, x: snap(p.x), y: snap(p.y) }))
              syncFromMarks(nextMarks, {
                unitSquares: us,
                labelStep: us === 1 ? 2 : 1,
                step: nextStep,
                rangeX: nextMax + 1,
                rangeY: nextMax + 1,
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
              <NumInput
                value={fmt(m.x)}
                ariaLabel={`x ${mi + 1}`}
                onCommit={(raw) => {
                  const parsed = parseFrNumber(raw)
                  if (parsed == null) return
                  const x = clampAxis(parsed)
                  const next = marks.map((p, j) => (j === mi ? { ...p, x } : p))
                  syncFromMarks(next)
                }}
              />
            </Field>
            <Field label="y">
              <NumInput
                value={fmt(m.y)}
                ariaLabel={`y ${mi + 1}`}
                onCommit={(raw) => {
                  const parsed = parseFrNumber(raw)
                  if (parsed == null) return
                  const y = clampAxis(parsed)
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
    const map = item.metroMap ?? METRO_MAPS[0]!
    const questions = (item.metroQuestions ?? []).map((q) => hydrateMetroQuestion(q, map))
    const lineOpts = map.lines.map((l) => ({ value: l.name, label: l.name }))
    const cellOpts = allMetroCells(map).map((c) => ({ value: c, label: c }))
    const commitQuestions = (metroQuestions: MetroQuestion[]) => {
      patch(index, {
        ...item,
        metroMap: map,
        metroQuestions,
        answer: metroQuestions.map((m) => m.answer).join(' ; '),
      })
    }
    const moveQuestion = (from: number, to: number) => {
      if (to < 0 || to >= questions.length) return
      const next = [...questions]
      const [row] = next.splice(from, 1)
      if (!row) return
      next.splice(to, 0, row)
      commitQuestions(next)
    }
    const replaceAt = (qi: number, nextQ: MetroQuestion) => {
      const metroQuestions = questions.map((q, i) => (i === qi ? nextQ : q))
      commitQuestions(metroQuestions)
    }
    const kindLabel = (kind: MetroQuestionKind): string => {
      if (kind === 'crossing') return 'Croisement'
      if (kind === 'gare-where') return 'Gare → case'
      if (kind === 'gare-which') return 'Case → gare'
      if (kind === 'path') return 'Parcours'
      return 'Départ / arrivée'
    }
    return (
      <>
        <Field label="Plan">
          <LineSelect
            value={map.id}
            ariaLabel="Plan de métro"
            options={METRO_MAPS.map((m, i) => ({
              value: m.id,
              label: metroMapLabel(m, i),
            }))}
            onChange={(id) => {
              const nextMap = METRO_MAPS.find((m) => m.id === id) ?? METRO_MAPS[0]!
              const metroQuestions = generateMetroQuestions(
                createRng((id.length * 997 + questions.length * 13 + 1) >>> 0),
                nextMap,
              )
              patch(index, {
                ...item,
                metroMap: nextMap,
                metroQuestions,
                answer: metroQuestions.map((m) => m.answer).join(' ; '),
              })
            }}
          />
        </Field>
        <div className="libre-metro-toolbar">
          <button
            type="button"
            className="button secondary"
            onClick={() => {
              const shuffled = [...questions]
              for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1))
                ;[shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!]
              }
              commitQuestions(shuffled)
            }}
          >
            Mélanger l’ordre
          </button>
        </div>
        {questions.map((q, qi) => {
          const kind = inferMetroQuestionKind(q)
          const names = q.lineNames ?? []
          return (
            <div
              key={`mq-${qi}`}
              className="libre-metro-question"
              onDragOver={(e) => {
                e.preventDefault()
                e.dataTransfer.dropEffect = 'move'
              }}
              onDrop={(e) => {
                e.preventDefault()
                const from = Number(e.dataTransfer.getData('text/plain'))
                if (!Number.isFinite(from) || from === qi) return
                moveQuestion(from, qi)
              }}
            >
              <div
                className="libre-metro-order"
                aria-label={`Ordre question ${qi + 1}`}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', String(qi))
                  e.dataTransfer.effectAllowed = 'move'
                }}
              >
                <button
                  type="button"
                  className="button secondary libre-metro-move"
                  aria-label={`Monter la question ${qi + 1}`}
                  disabled={qi === 0}
                  onClick={() => moveQuestion(qi, qi - 1)}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="button secondary libre-metro-move"
                  aria-label={`Descendre la question ${qi + 1}`}
                  disabled={qi >= questions.length - 1}
                  onClick={() => moveQuestion(qi, qi + 1)}
                >
                  ↓
                </button>
              </div>
              <div className="libre-metro-body">
                <p className="libre-metro-kind muted">
                  Q{qi + 1} — {kindLabel(kind)}
                </p>
                <p className="libre-metro-prompt">{q.prompt}</p>
                <div className="libre-inline-triple">
                  {kind === 'crossing' ? (
                    <>
                      <Field label="Métro 1">
                        <LineSelect
                          value={names[0] ?? lineOpts[0]?.value ?? ''}
                          ariaLabel={`Métro 1 question ${qi + 1}`}
                          options={lineOpts}
                          onChange={(name) => {
                            const other =
                              names[1] && names[1] !== name
                                ? names[1]
                                : (lineOpts.find((o) => o.value !== name)?.value ?? name)
                            replaceAt(
                              qi,
                              buildMetroQuestion('crossing', map, {
                                lineNames: [name, other],
                              }),
                            )
                          }}
                        />
                      </Field>
                      <Field label="Métro 2">
                        <LineSelect
                          value={names[1] ?? lineOpts[1]?.value ?? lineOpts[0]?.value ?? ''}
                          ariaLabel={`Métro 2 question ${qi + 1}`}
                          options={lineOpts}
                          onChange={(name) => {
                            const first =
                              names[0] && names[0] !== name
                                ? names[0]
                                : (lineOpts.find((o) => o.value !== name)?.value ?? name)
                            replaceAt(
                              qi,
                              buildMetroQuestion('crossing', map, {
                                lineNames: [first, name],
                              }),
                            )
                          }}
                        />
                      </Field>
                    </>
                  ) : null}
                  {kind === 'gare-where' ? (
                    <Field label="Gare">
                      <LineSelect
                        value={names[0] ?? lineOpts[0]?.value ?? ''}
                        ariaLabel={`Gare question ${qi + 1}`}
                        options={lineOpts}
                        onChange={(name) =>
                          replaceAt(
                            qi,
                            buildMetroQuestion('gare-where', map, { lineNames: [name] }),
                          )
                        }
                      />
                    </Field>
                  ) : null}
                  {kind === 'gare-which' ? (
                    <Field label="Case">
                      <LineSelect
                        value={q.cell ?? cellOpts[0]?.value ?? ''}
                        ariaLabel={`Case question ${qi + 1}`}
                        options={cellOpts}
                        onChange={(cell) =>
                          replaceAt(qi, buildMetroQuestion('gare-which', map, { cell }))
                        }
                      />
                    </Field>
                  ) : null}
                  {kind === 'path' || kind === 'termini' ? (
                    <Field label="Métro">
                      <LineSelect
                        value={names[0] ?? lineOpts[0]?.value ?? ''}
                        ariaLabel={`Métro question ${qi + 1}`}
                        options={lineOpts}
                        onChange={(name) =>
                          replaceAt(qi, buildMetroQuestion(kind, map, { lineNames: [name] }))
                        }
                      />
                    </Field>
                  ) : null}
                  <Field label="Corrigé">
                    <CorrigeBox value={q.answer ?? ''} ariaLabel={`Corrigé métro ${qi + 1}`} />
                  </Field>
                </div>
              </div>
            </div>
          )
        })}
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
