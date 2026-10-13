/**
 * Éditeur libre TCM / TCM CFR / TCM CSC :
 * numérotation à gauche (couleur), champs à droite, traits (pas pastilles),
 * sélecteurs selon le type, sans libellé « Énoncé ».
 * Corrigés en lecture seule (recalcul à la validation) ; nombres saisissables
 * avec brouillon local (retour arrière OK ; vide → valeur précédente).
 */
import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { ArithOp, MathItem, MissingPos } from '@/math/types'
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
  metroCrossingWarning,
  metroMapLabel,
  type MetroQuestion,
  type MetroQuestionKind,
} from '@/tcm-cfr/metro'
import {
  COUNT_ICON_OPTIONS,
  countIconMeta,
  rebuildCountIconsItem,
} from '@/math/count-icons'
import { createRng } from '@/math/rng'
import type { CountIconKind } from '@/math/types'
import { fractionPartsFromItem, fractionTermFr } from '@/tcm/fraction-words'
import { mulAudioParts, numberAudioParts } from '@/tcm-cfr/audio-nombres'
import { clampFracShapeCfr } from '@/math/fraction-shapes'
import {
  CONVERT_FAMILY_OPTIONS,
  inferConvertFamily,
  unitSelectOptions,
  unitsForFamily,
  type ConvertFamily,
} from '@/tcm/convert-units'
import { parseFrNumber, parseRelatifNumber, parseRelatifPrompt } from '@/tcm/libre-parse'
import {
  equationKindForTemplate,
  equationTemplateById,
  fillEquationTemplateWithVars,
  TCM_EQUATIONS_Q1,
  TCM_EQUATIONS_Q2,
} from '@/tcm/equations'
import {
  evaluerKindForTemplate,
  evaluerTemplateById,
  fillEvaluerTemplateWithVars,
  TCM_EVALUER_Q1,
  TCM_EVALUER_Q2,
} from '@/tcm/evaluer'
import {
  fillPrioriteTemplate,
  fillPrioriteTemplateWithVars,
  prioriteKeysInPattern,
  prioriteTemplateById,
  TCM_PRIORITE_FRAC_POW,
  TCM_PRIORITE_OPS,
} from '@/tcm/priorite'
import {
  fillReduireQ1WithVars,
  fillReduireQ2WithVars,
  reduireTemplateById,
  TCM_REDUIRE_Q2,
} from '@/tcm/reduire'
import { TCM_PROPORTION_KG_TEMPLATES } from '@/tcm/proportion-kg'
import {
  problemOptionsForExercise,
  rebuildProblemItems,
  rollProblemItems,
} from '@/tcm-cfr/problems'
import {
  applyNamedFigure,
  NAMED_FIGURE_OPTIONS,
  namedFigureKey,
} from '@/tcm/libre-recalc'

const NUM_1_100_LIST_ID = 'tcm-libre-num-1-100'
const NUM_1_100_OPTIONS = Array.from({ length: 100 }, (_, i) => String(i + 1))
const NUM_1_12_LIST_ID = 'tcm-libre-num-1-12'
const NUM_1_12_OPTIONS = Array.from({ length: 12 }, (_, i) => String(i + 1))

/** Graine locale pour re-tirer un problème choisi en mode libre. */
let libreProblemRoll = 1

function clampInt1to100(n: number): number {
  return Math.max(1, Math.min(100, Math.round(n)))
}

function clampInt1to12(n: number): number {
  return Math.max(1, Math.min(12, Math.round(n)))
}

/** Facteurs a×b (ex. 2 : tables 1–12) depuis left/right ou les fichiers audio. */
function mulFactorsFromItem(item: MathItem): { a: number; b: number } {
  const left = parseFrNumber(item.left ?? '')
  const right = parseFrNumber(item.right ?? '')
  if (left != null && right != null) {
    return { a: clampInt1to12(left), b: clampInt1to12(right) }
  }
  const nums = (item.audioParts ?? [])
    .map((p) => {
      const m = /\/nombre\/(\d+)\.mp3$/.exec(p)
      return m ? Number(m[1]) : null
    })
    .filter((n): n is number => n != null && n >= 1 && n <= 12)
  if (nums.length >= 2) return { a: nums[0]!, b: nums[nums.length - 1]! }
  return { a: 2, b: 2 }
}

const OPS: ArithOp[] = ['+', '−', '×', '÷']
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

const EQUATION_TEMPLATE_LABELS = new Map<string, string>()
function equationTemplateLabel(t: { id: string; build: (rng: ReturnType<typeof createRng>) => { equation: string } }): string {
  const cached = EQUATION_TEMPLATE_LABELS.get(t.id)
  if (cached) return cached
  const label = `${t.id} — ${t.build(createRng(t.id.length * 1009 + 17)).equation}`
  EQUATION_TEMPLATE_LABELS.set(t.id, label)
  return label
}

/** Complète problemTemplateId / problemVars pour ex.32–34 (et 28) si absents. */
function hydrateAlgebraTemplateItem(item: MathItem, exerciseType: string, index: number): MathItem {
  const needs =
    !item.problemTemplateId ||
    !item.problemVars ||
    Object.keys(item.problemVars).length === 0 ||
    !item.problemVarDefs?.length
  if (!needs) return item

  if (exerciseType === 'tcm-expressions-reduire' || item.labels?.includes('reduire')) {
    const isQ2 =
      item.labels?.includes('q2') ||
      (item.problemTemplateId != null && item.problemTemplateId !== 'sum') ||
      (item.prompt ?? '').includes('·')
    if (isQ2) {
      const tpl = reduireTemplateById(item.problemTemplateId ?? '') ?? TCM_REDUIRE_Q2[index % TCM_REDUIRE_Q2.length]!
      return (
        fillReduireQ2WithVars(tpl, {
          k0: tpl.slots[0] === 'paren' ? 1 : 0,
          k1: tpl.slots[1] === 'paren' ? 1 : 0,
          k2: tpl.slots[2] === 'paren' ? 1 : 0,
          c0: 5,
          c1: 4,
          c2: 2,
          c0a: 3,
          c0b: 2,
          c1a: 3,
          c1b: 2,
          c2a: 3,
          c2b: 2,
          p0: 0,
          p1: 1,
          p2: tpl.slots[2] === 'const' ? -1 : 0,
          nLetters: 3,
          L0: 0,
          L1: 1,
          L2: 2,
          ...(item.problemVars ?? {}),
        }) ?? item
      )
    }
    return (
      fillReduireQ1WithVars({
        n: 4,
        L0: 0,
        L1: 1,
        t0: 3,
        t1: -2,
        t2: 5,
        t3: 1,
        p0: 0,
        p1: 0,
        p2: 1,
        p3: -1,
        ...(item.problemVars ?? {}),
      }) ?? item
    )
  }

  if (exerciseType === 'tcm-equations' || item.labels?.includes('equations')) {
    const kind =
      item.labels?.includes('q2') || (item.problemTemplateId ?? '').startsWith('q2') || index === 1
        ? 'q2'
        : 'q1'
    const pool = kind === 'q2' ? TCM_EQUATIONS_Q2 : TCM_EQUATIONS_Q1
    const tpl = equationTemplateById(item.problemTemplateId ?? '') ?? pool[0]!
    const built =
      fillEquationTemplateWithVars(tpl, item.problemVars ?? {}) ??
      tpl.build(createRng(index * 997 + 13))
    const keys = Object.keys(built.vars).sort((a, b) => a.localeCompare(b))
    return {
      ...item,
      problemTemplateId: tpl.id,
      problemVars: built.vars,
      problemVarDefs: keys.map((k) => ({
        key: k,
        label: k === 'x' ? 'Solution x' : `Paramètre ${k}`,
        editOn: 'both' as const,
      })),
      labels: ['equations', kind],
      prompt: built.equation,
      development: built.development,
      operations: built.operations,
      calcAnswer: built.development.join('\n'),
      responseAnswer: `x = ${fmt(built.x)}`,
      answer: fmt(built.x),
      unknowns: ['x'],
    }
  }

  if (exerciseType === 'tcm-expressions-evaluer' || item.labels?.includes('evaluer')) {
    const kind =
      item.labels?.includes('q2') || (item.problemTemplateId ?? '').startsWith('q2') || index === 1
        ? 'q2'
        : 'q1'
    const pool = kind === 'q2' ? TCM_EVALUER_Q2 : TCM_EVALUER_Q1
    const tpl = evaluerTemplateById(item.problemTemplateId ?? '') ?? pool[index % pool.length]!
    const letters = (item.unknowns?.length === 3
      ? (item.unknowns as [string, string, string])
      : ['x', 'y', 'z']) as [string, string, string]
    const baseVars: Record<string, number> = {
      [letters[0]]: 3,
      [letters[1]]: -2,
      [letters[2]]: 4,
      a: 2,
      b: 3,
      c: 4,
      d: 5,
      e: 2,
      f: 3,
      ...(item.problemVars ?? {}),
    }
    const filled = fillEvaluerTemplateWithVars(tpl, letters, baseVars, false)
    if (!filled) return item
    const coefKeys = Object.keys(filled.vars).filter((k) => 'abcdefghij'.includes(k))
    const letterKeys = [...filled.letters]
    const keys = [...coefKeys, ...letterKeys]
    return {
      ...item,
      problemTemplateId: tpl.id,
      problemVars: filled.vars,
      problemVarDefs: keys.map((k) => ({
        key: k,
        label: letterKeys.includes(k) ? `Valeur ${k}` : `Coeff. ${k}`,
        editOn: 'both' as const,
      })),
      unknowns: letterKeys,
      labels: ['evaluer', kind],
      prompt: filled.prompt,
      answer: filled.answer,
      development: filled.development,
      calcAnswer: filled.development.join('\n'),
    }
  }

  if (exerciseType === 'tcm-priorite-ops' || item.labels?.includes('priorite')) {
    const byId = prioriteTemplateById(item.problemTemplateId ?? '')
    const kind =
      byId?.kind ??
      (item.labels?.includes('frac-pow') || index === 1 ? 'frac-pow' : 'ops')
    const pool = kind === 'frac-pow' ? TCM_PRIORITE_FRAC_POW : TCM_PRIORITE_OPS
    const tpl = byId && pool.some((t) => t.id === byId.id) ? byId : pool[0]!
    const filled =
      fillPrioriteTemplateWithVars(tpl, item.problemVars ?? {}) ??
      fillPrioriteTemplate(tpl, createRng(index * 1009 + 28))
    if (!filled) return item
    const keys = prioriteKeysInPattern(tpl.pattern)
    return {
      ...item,
      problemTemplateId: tpl.id,
      problemVars: Object.fromEntries(keys.map((k) => [k, filled.vars[k] ?? 2])),
      problemVarDefs: keys.map((k) => ({
        key: k,
        label: 'pqr'.includes(k) ? `Exposant ${k}` : `Valeur ${k}`,
        editOn: 'both' as const,
      })),
      labels: ['priorite', tpl.kind],
      prompt: filled.prompt,
      answer: filled.answer,
      development: filled.development,
      calcAnswer: filled.development.join('\n'),
    }
  }

  return item
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

  // Hydrate ex.28 / 32–34 : modèle + variables visibles dès l’ouverture du mode libre.
  useEffect(() => {
    if (
      exerciseType !== 'tcm-priorite-ops' &&
      exerciseType !== 'tcm-expressions-reduire' &&
      exerciseType !== 'tcm-expressions-evaluer' &&
      exerciseType !== 'tcm-equations'
    ) {
      return
    }
    let changed = false
    const next = items.map((item, index) => {
      const hydrated = hydrateAlgebraTemplateItem(item, exerciseType, index)
      if (hydrated !== item) changed = true
      return hydrated
    })
    if (changed) onChangeItems(next)
  }, [exerciseType, items, onChangeItems])

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
      <datalist id={NUM_1_12_LIST_ID}>
        {NUM_1_12_OPTIONS.map((n) => (
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
            <div className="libre-item-body">
              {renderFields(item, index, patch, withProps, exerciseType, onChangeItems, items)}
            </div>
          </li>
        ))}
      </ul>
      {items.length === 0 ? (
        <p className="type-hint muted">Aucun item — générez d’abord un contenu.</p>
      ) : null}
    </div>
  )
}

const POW_SUP = ['', '¹', '²', '³', '⁴'] as const
const POW_EXP_OPTS = [1, 2, 3, 4].map((n) => ({ value: String(n), label: String(n) }))
const PCT_OPTS = [10, 20, 25, 40, 60, 75, 80].map((n) => ({
  value: String(n),
  label: `${n} %`,
}))

function renderFields(
  item: MathItem,
  index: number,
  patch: (i: number, next: MathItem) => void,
  withProps: boolean,
  exerciseType: string,
  onChangeItems: (items: MathItem[]) => void,
  items: MathItem[] = [],
) {
  // TCM ex. 1 — compter les icônes : cible, 2 distracteurs, quantités.
  if (
    item.layout === 'count-icons' ||
    exerciseType === 'nombres-compter-formes' ||
    item.countIcons
  ) {
    const scene = item.countIcons
    const targetKind = (scene?.targetKind ?? 'notes') as CountIconKind
    const distractorA = (scene?.distractorA ??
      COUNT_ICON_OPTIONS.find((o) => o.value !== targetKind)?.value ??
      'star') as CountIconKind
    const distractorB = (scene?.distractorB ??
      COUNT_ICON_OPTIONS.find((o) => o.value !== targetKind && o.value !== distractorA)?.value ??
      'moon') as CountIconKind
    const targetCount = scene?.targetCount ?? 12
    const distractorACount = scene?.distractorACount ?? 6
    const distractorBCount = scene?.distractorBCount ?? 6
    const apply = (next: {
      targetKind?: CountIconKind
      distractorA?: CountIconKind
      distractorB?: CountIconKind
      targetCount?: number
      distractorACount?: number
      distractorBCount?: number
    }) => {
      let t = next.targetKind ?? targetKind
      let a = next.distractorA ?? distractorA
      let b = next.distractorB ?? distractorB
      if (a === t) a = (COUNT_ICON_OPTIONS.find((o) => o.value !== t)?.value ?? 'star') as CountIconKind
      if (b === t || b === a) {
        b = (COUNT_ICON_OPTIONS.find((o) => o.value !== t && o.value !== a)?.value ??
          'moon') as CountIconKind
      }
      const rebuilt = rebuildCountIconsItem(createRng(++libreProblemRoll), {
        targetKind: t,
        distractorA: a,
        distractorB: b,
        targetCount: Math.max(3, Math.min(24, next.targetCount ?? targetCount)),
        distractorACount: Math.max(2, Math.min(14, next.distractorACount ?? distractorACount)),
        distractorBCount: Math.max(2, Math.min(14, next.distractorBCount ?? distractorBCount)),
      })
      patch(index, { ...item, ...rebuilt })
    }
    const otherOpts = COUNT_ICON_OPTIONS.filter((o) => o.value !== targetKind)
    return (
      <div className="libre-frac-stack">
        <Field label="Icône à compter">
          <LineSelect
            value={targetKind}
            ariaLabel={`Icône à compter ${index + 1}`}
            options={[...COUNT_ICON_OPTIONS]}
            onChange={(v) => apply({ targetKind: v as CountIconKind })}
          />
        </Field>
        <Field label="Nombre d’icônes à compter">
          <NumInput
            value={String(targetCount)}
            ariaLabel={`Nombre d’icônes à compter ${index + 1}`}
            onCommit={(raw) => {
              const n = parseFrNumber(raw)
              if (n == null) return
              apply({ targetCount: Math.round(n) })
            }}
          />
        </Field>
        <Field label="Icône à ne pas compter (1)">
          <LineSelect
            value={distractorA}
            ariaLabel={`Icône à ne pas compter 1 — item ${index + 1}`}
            options={otherOpts.length ? otherOpts : [...COUNT_ICON_OPTIONS]}
            onChange={(v) => apply({ distractorA: v as CountIconKind })}
          />
        </Field>
        <Field label="Nombre d’icônes (1)">
          <NumInput
            value={String(distractorACount)}
            ariaLabel={`Nombre d’icônes distracteur 1 — item ${index + 1}`}
            onCommit={(raw) => {
              const n = parseFrNumber(raw)
              if (n == null) return
              apply({ distractorACount: Math.round(n) })
            }}
          />
        </Field>
        <Field label="Icône à ne pas compter (2)">
          <LineSelect
            value={distractorB}
            ariaLabel={`Icône à ne pas compter 2 — item ${index + 1}`}
            options={
              COUNT_ICON_OPTIONS.filter((o) => o.value !== targetKind && o.value !== distractorA)
                .length
                ? COUNT_ICON_OPTIONS.filter(
                    (o) => o.value !== targetKind && o.value !== distractorA,
                  )
                : [...COUNT_ICON_OPTIONS]
            }
            onChange={(v) => apply({ distractorB: v as CountIconKind })}
          />
        </Field>
        <Field label="Nombre d’icônes (2)">
          <NumInput
            value={String(distractorBCount)}
            ariaLabel={`Nombre d’icônes distracteur 2 — item ${index + 1}`}
            onCommit={(raw) => {
              const n = parseFrNumber(raw)
              if (n == null) return
              apply({ distractorBCount: Math.round(n) })
            }}
          />
        </Field>
        <Field label="Corrigé">
          <CorrigeBox
            value={`${targetCount} ${countIconMeta(targetKind).label}`}
            ariaLabel={`Corrigé ${index + 1}`}
          />
        </Field>
      </div>
    )
  }

  // TCM ex. 27 — base / exposant / racine / ×÷ 10^p.
  if (
    exerciseType === 'tcm-puissances-mixte' ||
    item.labels?.some((l) => l === 'power' || l === 'root' || l === 'sci-mul' || l === 'sci-div')
  ) {
    const kind =
      item.labels?.find((l) => l === 'power' || l === 'root' || l === 'sci-mul' || l === 'sci-div') ??
      (item.prompt?.startsWith('√')
        ? 'root'
        : /×\s*10/.test(item.prompt ?? '')
          ? 'sci-mul'
          : /÷\s*10/.test(item.prompt ?? '')
            ? 'sci-div'
            : 'power')
    const a = item.a ?? 2
    const b = item.b ?? 2
    if (kind === 'power') {
      return (
        <div className="libre-frac-stack">
          <Field label="Base">
            <NumInput
              value={fmt(a)}
              ariaLabel={`Base ${index + 1}`}
              onCommit={(raw) => {
                const base = parseFrNumber(raw)
                if (base == null) return
                const exp = Math.max(2, Math.min(4, Math.round(b)))
                const safeBase = exp === 4 ? Math.max(1, Math.min(5, Math.round(base))) : Math.max(1, Math.min(9, Math.round(base)))
                patch(index, {
                  ...item,
                  a: safeBase,
                  b: exp,
                  labels: ['power'],
                  prompt: `${safeBase}${POW_SUP[exp] ?? ''} =`,
                  answer: String(safeBase ** exp),
                })
              }}
            />
          </Field>
          <Field label="Exposant">
            <LineSelect
              value={String(Math.max(2, Math.min(4, Math.round(b))))}
              ariaLabel={`Exposant ${index + 1}`}
              options={POW_EXP_OPTS.filter((o) => o.value !== '1')}
              onChange={(raw) => {
                const exp = Math.max(2, Math.min(4, Number(raw)))
                const safeBase =
                  exp === 4 ? Math.max(1, Math.min(5, Math.round(a))) : Math.max(1, Math.min(9, Math.round(a)))
                patch(index, {
                  ...item,
                  a: safeBase,
                  b: exp,
                  labels: ['power'],
                  prompt: `${safeBase}${POW_SUP[exp] ?? ''} =`,
                  answer: String(safeBase ** exp),
                })
              }}
            />
          </Field>
          <Field label="Corrigé">
            <CorrigeBox value={item.answer ?? ''} ariaLabel={`Corrigé ${index + 1}`} />
          </Field>
        </div>
      )
    }
    if (kind === 'root') {
      const under = item.a ?? 4
      return (
        <div className="libre-frac-stack">
          <Field label="Sous le radical (√n)">
            <NumInput
              value={fmt(under)}
              ariaLabel={`Sous le radical ${index + 1}`}
              onCommit={(raw) => {
                const n = parseFrNumber(raw)
                if (n == null || n <= 0) return
                const root = Math.round(Math.sqrt(n))
                const perfect = root * root
                patch(index, {
                  ...item,
                  a: perfect,
                  b: root,
                  labels: ['root'],
                  prompt: `√${perfect} =`,
                  answer: String(root),
                })
              }}
            />
          </Field>
          <Field label="Corrigé (racine)">
            <CorrigeBox value={item.answer ?? ''} ariaLabel={`Corrigé ${index + 1}`} />
          </Field>
        </div>
      )
    }
    if (kind === 'sci-mul') {
      return (
        <div className="libre-frac-stack">
          <Field label="Nombre décimal">
            <NumInput
              value={fmt(a)}
              ariaLabel={`Décimal ${index + 1}`}
              onCommit={(raw) => {
                const dec = parseFrNumber(raw)
                if (dec == null) return
                const exp = Math.max(1, Math.min(4, Math.round(b)))
                const tenths = Math.round(dec * 10)
                patch(index, {
                  ...item,
                  a: tenths / 10,
                  b: exp,
                  labels: ['sci-mul'],
                  prompt: `${fmt(tenths / 10)} × 10${POW_SUP[exp] ?? ''} =`,
                  answer: fmt(tenths * 10 ** (exp - 1)),
                })
              }}
            />
          </Field>
          <Field label="Exposant de 10">
            <LineSelect
              value={String(Math.max(1, Math.min(4, Math.round(b))))}
              ariaLabel={`Exposant 10 ${index + 1}`}
              options={POW_EXP_OPTS}
              onChange={(raw) => {
                const exp = Math.max(1, Math.min(4, Number(raw)))
                const tenths = Math.round(a * 10)
                patch(index, {
                  ...item,
                  a: tenths / 10,
                  b: exp,
                  labels: ['sci-mul'],
                  prompt: `${fmt(tenths / 10)} × 10${POW_SUP[exp] ?? ''} =`,
                  answer: fmt(tenths * 10 ** (exp - 1)),
                })
              }}
            />
          </Field>
          <Field label="Corrigé">
            <CorrigeBox value={item.answer ?? ''} ariaLabel={`Corrigé ${index + 1}`} />
          </Field>
        </div>
      )
    }
    // sci-div
    return (
      <div className="libre-frac-stack">
        <Field label="Nombre entier">
          <NumInput
            value={fmt(a)}
            ariaLabel={`Entier ${index + 1}`}
            onCommit={(raw) => {
              const whole = parseFrNumber(raw)
              if (whole == null) return
              const exp = Math.max(1, Math.min(4, Math.round(b)))
              const w = Math.max(100, Math.min(9999, Math.round(whole)))
              patch(index, {
                ...item,
                a: w,
                b: exp,
                labels: ['sci-div'],
                prompt: `${w} ÷ 10${POW_SUP[exp] ?? ''} =`,
                answer: fmt(Number((w / 10 ** exp).toFixed(exp))),
              })
            }}
          />
        </Field>
        <Field label="Exposant de 10">
          <LineSelect
            value={String(Math.max(1, Math.min(4, Math.round(b))))}
            ariaLabel={`Exposant 10 ${index + 1}`}
            options={POW_EXP_OPTS}
            onChange={(raw) => {
              const exp = Math.max(1, Math.min(4, Number(raw)))
              const w = Math.max(100, Math.min(9999, Math.round(a)))
              patch(index, {
                ...item,
                a: w,
                b: exp,
                labels: ['sci-div'],
                prompt: `${w} ÷ 10${POW_SUP[exp] ?? ''} =`,
                answer: fmt(Number((w / 10 ** exp).toFixed(exp))),
              })
            }}
          />
        </Field>
        <Field label="Corrigé">
          <CorrigeBox value={item.answer ?? ''} ariaLabel={`Corrigé ${index + 1}`} />
        </Field>
      </div>
    )
  }

  // TCM ex. 31 — pourcentage / règle de trois (variables éditables).
  if (
    exerciseType === 'tcm-proportion-kg' ||
    item.labels?.includes('percent') ||
    item.labels?.includes('kg-francs')
  ) {
    const isPct = item.labels?.includes('percent') || (item.prompt ?? '').includes('% de')
    if (isPct) {
      const pct = item.a ?? 25
      const n = item.b ?? 200
      return (
        <div className="libre-frac-stack">
          <Field label="Pourcentage">
            <LineSelect
              value={String(pct)}
              ariaLabel={`Pourcentage ${index + 1}`}
              options={PCT_OPTS}
              onChange={(raw) => {
                const p = Number(raw)
                const value = (p * n) / 100
                patch(index, {
                  ...item,
                  a: p,
                  b: n,
                  result: value,
                  labels: ['percent'],
                  prompt: `${p} % de ${n} est égal à`,
                  answer: fmt(value),
                  development: [`${p}/100 × ${n}`, fmt(value)],
                })
              }}
            />
          </Field>
          <Field label="Nombre">
            <NumInput
              value={fmt(n)}
              ariaLabel={`Nombre ${index + 1}`}
              onCommit={(raw) => {
                const nn = parseFrNumber(raw)
                if (nn == null) return
                const value = (pct * nn) / 100
                patch(index, {
                  ...item,
                  a: pct,
                  b: nn,
                  result: value,
                  labels: ['percent'],
                  prompt: `${pct} % de ${nn} est égal à`,
                  answer: fmt(value),
                  development: [`${pct}/100 × ${nn}`, fmt(value)],
                })
              }}
            />
          </Field>
          <Field label="Corrigé">
            <CorrigeBox value={item.answer ?? ''} ariaLabel={`Corrigé ${index + 1}`} />
          </Field>
        </div>
      )
    }
    const kgA = item.a ?? 15
    const priceA = item.b ?? 30
    const kgB = item.result ?? 28
    const tpl =
      TCM_PROPORTION_KG_TEMPLATES.find((t) => t.id === item.left) ?? TCM_PROPORTION_KG_TEMPLATES[0]!
    const priceB = Math.round(((priceA * kgB) / kgA) * 1000) / 1000
    return (
      <div className="libre-frac-stack">
        <Field label="Produit">
          <LineSelect
            value={tpl.id}
            ariaLabel={`Produit ${index + 1}`}
            options={TCM_PROPORTION_KG_TEMPLATES.map((t) => ({
              value: t.id,
              label: t.product,
            }))}
            onChange={(id) => {
              const next = TCM_PROPORTION_KG_TEMPLATES.find((t) => t.id === id) ?? tpl
              const pb = Math.round(((priceA * kgB) / kgA) * 1000) / 1000
              patch(index, {
                ...item,
                left: next.id,
                labels: ['kg-francs'],
                prompt: `${kgA} kg ${next.ofProduct} → ${priceA} francs\n${kgB} kg ${next.ofProduct} →`,
                answer: `${pb} francs`,
                development: [`(${kgB} × ${priceA}) ÷ ${kgA}`, String(pb)],
              })
            }}
          />
        </Field>
        <div className="libre-inline-triple is-op">
          <Field label="Masse connue (kg)">
            <NumInput
              compact
              value={fmt(kgA)}
              ariaLabel={`Masse A ${index + 1}`}
              onCommit={(raw) => {
                const ka = parseFrNumber(raw)
                if (ka == null || ka === 0) return
                const pb = Math.round(((priceA * kgB) / ka) * 1000) / 1000
                patch(index, {
                  ...item,
                  a: ka,
                  labels: ['kg-francs'],
                  prompt: `${ka} kg ${tpl.ofProduct} → ${priceA} francs\n${kgB} kg ${tpl.ofProduct} →`,
                  answer: `${pb} francs`,
                  development: [`(${kgB} × ${priceA}) ÷ ${ka}`, String(pb)],
                })
              }}
            />
          </Field>
          <Field label="Prix connu (fr)">
            <NumInput
              compact
              value={fmt(priceA)}
              ariaLabel={`Prix A ${index + 1}`}
              onCommit={(raw) => {
                const pa = parseFrNumber(raw)
                if (pa == null) return
                const pb = Math.round(((pa * kgB) / kgA) * 1000) / 1000
                patch(index, {
                  ...item,
                  b: pa,
                  labels: ['kg-francs'],
                  prompt: `${kgA} kg ${tpl.ofProduct} → ${pa} francs\n${kgB} kg ${tpl.ofProduct} →`,
                  answer: `${pb} francs`,
                  development: [`(${kgB} × ${pa}) ÷ ${kgA}`, String(pb)],
                })
              }}
            />
          </Field>
          <Field label="Masse cherchée (kg)">
            <NumInput
              compact
              value={fmt(kgB)}
              ariaLabel={`Masse B ${index + 1}`}
              onCommit={(raw) => {
                const kb = parseFrNumber(raw)
                if (kb == null) return
                const pb = Math.round(((priceA * kb) / kgA) * 1000) / 1000
                patch(index, {
                  ...item,
                  result: kb,
                  labels: ['kg-francs'],
                  prompt: `${kgA} kg ${tpl.ofProduct} → ${priceA} francs\n${kb} kg ${tpl.ofProduct} →`,
                  answer: `${pb} francs`,
                  development: [`(${kb} × ${priceA}) ÷ ${kgA}`, String(pb)],
                })
              }}
            />
          </Field>
        </div>
        <Field label="Corrigé">
          <CorrigeBox value={item.answer ?? `${priceB} francs`} ariaLabel={`Corrigé ${index + 1}`} />
        </Field>
      </div>
    )
  }

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
        <div className="libre-inline-triple">
          <Field label="Nombre 1 (1–12)">
            <NumInput
              compact
              listId={NUM_1_12_LIST_ID}
              value={String(a)}
              ariaLabel={`Facteur 1 question ${index + 1}`}
              onCommit={(raw) => {
                const parsed = parseFrNumber(raw)
                if (parsed == null) return
                commitMul(clampInt1to12(parsed), b)
              }}
            />
          </Field>
          <Field label="Nombre 2 (1–12)">
            <NumInput
              compact
              listId={NUM_1_12_LIST_ID}
              value={String(b)}
              ariaLabel={`Facteur 2 question ${index + 1}`}
              onCommit={(raw) => {
                const parsed = parseFrNumber(raw)
                if (parsed == null) return
                commitMul(a, clampInt1to12(parsed))
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

  if (item.layout === 'sequence') {
    const terms = (item.sequence ?? []).map((t) => (t === '□' ? '' : t))
    const blanks = new Set(item.blankIndexes ?? [])
    const commitSequence = (nextTerms: string[], nextBlanks: number[]) => {
      const sorted = [...nextBlanks].filter((i) => i >= 0 && i < nextTerms.length).sort((a, b) => a - b)
      patch(index, {
        ...item,
        sequence: nextTerms,
        blankIndexes: sorted,
        answer: sorted.map((i) => nextTerms[i] ?? '').join(' ; '),
      })
    }
    return (
      <div className="libre-sequence-row" role="group" aria-label={`Suite ${index + 1}`}>
        {terms.map((term, ti) => {
          const isBlank = blanks.has(ti)
          return (
            <div
              key={`seq-${ti}`}
              className={`libre-seq-chip${isBlank ? ' is-blank' : ''}`}
            >
              <NumInput
                compact
                value={term}
                ariaLabel={isBlank ? `Corrigé terme ${ti + 1}` : `Terme ${ti + 1}`}
                onCommit={(raw) => {
                  const next = [...terms]
                  next[ti] = raw
                  commitSequence(next, [...blanks])
                }}
              />
              <button
                type="button"
                className={`libre-seq-toggle${isBlank ? ' is-on' : ''}`}
                aria-pressed={isBlank}
                aria-label={
                  isBlank
                    ? `Terme ${ti + 1} à saisir — cliquer pour afficher le nombre`
                    : `Terme ${ti + 1} — cliquer pour le faire saisir par l’élève`
                }
                onClick={() => {
                  const nextBlanks = isBlank
                    ? [...blanks].filter((i) => i !== ti)
                    : [...blanks, ti]
                  commitSequence(terms, nextBlanks)
                }}
              >
                {isBlank ? 'À saisir' : 'Nombre'}
              </button>
            </div>
          )
        })}
      </div>
    )
  }

  if (
    item.layout === 'inline' &&
    item.op &&
    item.a != null &&
    item.b != null &&
    !exerciseType.includes('ex11') &&
    !item.labels?.includes('relatif') &&
    !item.labels?.some((l) => l.startsWith('frac-')) &&
    exerciseType !== 'tcm-relatifs-ops' &&
    exerciseType !== 'tcm-fractions-mixte' &&
    !/\/\s*\d/.test(item.prompt ?? '')
  ) {
    const op = (item.op ?? '+') as ArithOp
    const missing = (item.missing ?? 'result') as MissingPos
    const a = item.a
    const b = item.b
    const result =
      typeof item.result === 'number'
        ? item.result
        : op === '+'
          ? a + b
          : op === '−'
            ? a - b
            : op === '×'
              ? a * b
              : b !== 0
                ? a / b
                : a
    const computeForward = (na: number, nb: number, nop: ArithOp): number =>
      nop === '+'
        ? na + nb
        : nop === '−'
          ? na - nb
          : nop === '×'
            ? na * nb
            : nb !== 0
              ? na / nb
              : na

    const solveMissing = (
      miss: MissingPos,
      na: number,
      nb: number,
      r: number,
      nop: ArithOp,
    ): { a: number; b: number; r: number } => {
      if (miss === 'a') {
        if (nop === '+') return { a: r - nb, b: nb, r }
        if (nop === '−') return { a: r + nb, b: nb, r }
        if (nop === '×') return { a: nb !== 0 ? r / nb : na, b: nb, r }
        return { a: r * nb, b: nb, r }
      }
      if (miss === 'b') {
        if (nop === '+') return { a: na, b: r - na, r }
        if (nop === '−') return { a: na, b: na - r, r }
        if (nop === '×') return { a: na, b: na !== 0 ? r / na : nb, r }
        return { a: na, b: na !== 0 && r !== 0 ? na / r : nb, r }
      }
      return { a: na, b: nb, r: computeForward(na, nb, nop) }
    }

    const applyOp = (next: {
      a?: number
      b?: number
      op?: ArithOp
      result?: number
      missing?: MissingPos
    }) => {
      const nop = next.op ?? op
      const miss = next.missing ?? missing
      let na = next.a ?? a
      let nb = next.b ?? b
      let r = next.result ?? result
      const toggleOnly =
        next.missing != null && next.a == null && next.b == null && next.result == null && next.op == null
      const editedMissingCorrige =
        (miss === 'a' && next.a != null) || (miss === 'b' && next.b != null)

      if (!toggleOnly) {
        if (miss === 'result' || editedMissingCorrige) {
          r = computeForward(na, nb, nop)
        } else {
          // Opérande ou résultat visible modifié → résoudre la case « à saisir ».
          const solved = solveMissing(miss, na, nb, r, nop)
          na = solved.a
          nb = solved.b
          r = solved.r
        }
      }

      if (!Number.isFinite(na) || !Number.isFinite(nb) || !Number.isFinite(r)) return
      const leftA = miss === 'a' ? '□' : fmt(na)
      const leftB = miss === 'b' ? '□' : fmt(nb)
      const right = miss === 'result' ? '□' : fmt(r)
      const answer = miss === 'a' ? fmt(na) : miss === 'b' ? fmt(nb) : fmt(r)
      patch(index, {
        ...item,
        a: na,
        b: nb,
        op: nop,
        result: r,
        missing: miss,
        prompt: `${leftA} ${nop} ${leftB} = ${right}`,
        answer,
      })
    }
    const slot = (
      key: MissingPos,
      label: string,
      value: number,
      onCommit: (n: number) => void,
    ) => {
      const isMissing = missing === key
      return (
        <div className={`libre-seq-chip${isMissing ? ' is-blank' : ''}`}>
          <NumInput
            compact
            value={fmt(value)}
            ariaLabel={isMissing ? `Corrigé ${label}` : label}
            onCommit={(raw) => {
              const n = parseFrNumber(raw)
              if (n == null) return
              onCommit(n)
            }}
          />
          <button
            type="button"
            className={`libre-seq-toggle${isMissing ? ' is-on' : ''}`}
            aria-pressed={isMissing}
            aria-label={
              isMissing
                ? `${label} à saisir — cliquer pour afficher le nombre`
                : `Faire saisir ${label} par l’élève`
            }
            onClick={() => applyOp({ missing: key })}
          >
            {isMissing ? 'À saisir' : label}
          </button>
        </div>
      )
    }
    return (
      <div className="libre-inline-triple is-op is-eq-line" role="group" aria-label={`Calcul ${index + 1}`}>
        {slot('a', '1ʳᵉ', a, (n) => applyOp({ a: n }))}
        <LineSelect
          value={op}
          ariaLabel={`Opération ${index + 1}`}
          options={OPS.map((o) => ({ value: o, label: o }))}
          onChange={(nextOp) => applyOp({ op: nextOp as ArithOp })}
        />
        {slot('b', '2ᵉ', b, (n) => applyOp({ b: n }))}
        <span className="libre-mul-sign" aria-hidden>
          =
        </span>
        {slot('result', 'Résultat', result, (n) => applyOp({ result: n }))}
      </div>
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
    // CFR 9–10 / TCM 18 : multiplicateur ≤ 99.
    const capsMulB =
      exerciseType.includes('ex09') ||
      exerciseType.includes('ex10') ||
      exerciseType === 'tcm-mul-mixte'
    // CFR 7–8 / TCM 17 : soustraction a > b.
    const requiresSubAgtB =
      exerciseType.includes('ex07') ||
      exerciseType.includes('ex08') ||
      exerciseType === 'tcm-dec-add-sub'
    const columnError = (op: ArithOp, a: number | undefined, b: number | undefined) => {
      if (
        requiresSubAgtB &&
        op === '−' &&
        typeof a === 'number' &&
        typeof b === 'number' &&
        a <= b
      ) {
        return 'Pour une soustraction, le premier nombre doit être plus grand que le second.'
      }
      return undefined
    }
    const clampB = (op: ArithOp, b: number) => (capsMulB && op === '×' && b > 99 ? 99 : b)
    // TCM ex. 5 / 11 : a op b = corrigé sur une ligne.
    const sameLineCorrige =
      exerciseType === 'tcm-add-sub-col-3' || exerciseType === 'tcm-add-sub-col-4'
    return (
      <>
        <div
          className={`libre-inline-triple is-op${sameLineCorrige ? ' is-eq-line' : ''}`}
          role="group"
          aria-label={`Calcul colonne ${index + 1}`}
        >
          <NumInput
            compact
            value={
              item.a != null
                ? fmt(item.a)
                : item.dividend != null
                  ? fmt(item.dividend)
                  : ''
            }
            ariaLabel={`Operande A ${index + 1}`}
            onCommit={(raw) => {
              const a = Number(raw.replace(',', '.'))
              if (!Number.isFinite(a)) return
              const op = (item.op ?? '+') as ArithOp
              const bSrc =
                typeof item.b === 'number'
                  ? item.b
                  : typeof item.divisor === 'number'
                    ? item.divisor
                    : undefined
              const b = typeof bSrc === 'number' ? clampB(op, bSrc) : bSrc
              patch(index, {
                ...item,
                a,
                ...(op === '÷' ? { dividend: a } : {}),
                ...(typeof b === 'number' ? { b, ...(op === '÷' ? { divisor: b } : {}) } : {}),
                libreError: columnError(op, a, typeof b === 'number' ? b : undefined),
                prompt:
                  item.layout === 'column-empty' || item.blankOperands
                    ? `${raw} ${item.op ?? '+'} ${b != null ? fmt(b) : ''}`
                    : item.prompt,
              })
            }}
          />
          <LineSelect
            value={(item.op as string) ?? '+'}
            ariaLabel={`Opération ${index + 1}`}
            options={OPS.map((op) => ({ value: op, label: op }))}
            onChange={(opRaw) => {
              const op = opRaw as ArithOp
              const a =
                typeof item.a === 'number'
                  ? item.a
                  : typeof item.dividend === 'number'
                    ? item.dividend
                    : undefined
              const bSrc =
                typeof item.b === 'number'
                  ? item.b
                  : typeof item.divisor === 'number'
                    ? item.divisor
                    : undefined
              const b = typeof bSrc === 'number' ? clampB(op, bSrc) : bSrc
              patch(index, {
                ...item,
                op,
                ...(typeof a === 'number' ? { a } : {}),
                ...(typeof b === 'number' ? { b } : {}),
                libreError: columnError(op, a, typeof b === 'number' ? b : undefined),
              })
            }}
          />
          <NumInput
            compact
            value={
              item.b != null
                ? fmt(item.b)
                : item.divisor != null
                  ? fmt(item.divisor)
                  : ''
            }
            ariaLabel={`Operande B ${index + 1}`}
            onCommit={(raw) => {
              const parsed = Number(raw.replace(',', '.'))
              if (!Number.isFinite(parsed)) return
              const op = (item.op ?? '+') as ArithOp
              const b = clampB(op, parsed)
              const a =
                typeof item.a === 'number'
                  ? item.a
                  : typeof item.dividend === 'number'
                    ? item.dividend
                    : undefined
              patch(index, {
                ...item,
                b,
                ...(op === '÷' ? { divisor: b } : {}),
                ...(typeof a === 'number' && op === '÷' ? { a, dividend: a } : {}),
                libreError: columnError(op, typeof a === 'number' ? a : undefined, b),
                prompt:
                  item.layout === 'column-empty' || item.blankOperands
                    ? `${a != null ? fmt(a) : ''} ${item.op ?? '+'} ${fmt(b)}`
                    : item.prompt,
              })
            }}
          />
          {sameLineCorrige ? (
            <>
              <span className="libre-mul-sign" aria-hidden>
                =
              </span>
              <CorrigeBox value={item.answer ?? ''} ariaLabel={`Corrigé ${index + 1}`} />
            </>
          ) : null}
        </div>
        {item.libreError ? (
          <p className="libre-field-error" role="alert">
            {item.libreError}
          </p>
        ) : null}
        {!sameLineCorrige ? (
          <Field label="Corrigé">
            <CorrigeBox value={item.answer ?? ''} ariaLabel={`Corrigé ${index + 1}`} />
          </Field>
        ) : null}
      </>
    )
  }

  if (item.layout === 'fraction-shape' && item.fracShape) {
    const fs = item.fracShape
    const applyFrac = (kind: ShapeKind, n: number, d: number) => {
      const clamped = clampFracShapeCfr(kind, n, d)
      const answer = `${clamped.n}/${clamped.d}`
      patch(index, {
        ...item,
        fracShape: {
          ...fs,
          kind,
          ...clamped,
        },
        answer,
        prompt: fs.mode === 'color' ? `Coloriez ${answer}` : item.prompt,
      })
    }
    return (
      <div className="libre-frac-stack" role="group" aria-label={`Fraction ${index + 1}`}>
        <Field label="Forme">
          <LineSelect
            value={fs.kind}
            ariaLabel={`Forme ${index + 1}`}
            options={FRAC_KINDS.map((k) => ({ value: k.value, label: k.label }))}
            onChange={(kind) => applyFrac(kind as ShapeKind, fs.n, fs.d)}
          />
        </Field>
        <Field label="Parts colorées (n)">
          <NumInput
            value={String(fs.n)}
            ariaLabel={`Numérateur ${index + 1}`}
            onCommit={(raw) => {
              const n = Math.round(Number(raw.replace(',', '.')))
              if (!Number.isFinite(n)) return
              applyFrac(fs.kind, n, fs.d)
            }}
          />
        </Field>
        <Field label="Parts totales (d)">
          <NumInput
            value={String(fs.d)}
            ariaLabel={`Dénominateur ${index + 1}`}
            onCommit={(raw) => {
              const d = Math.round(Number(raw.replace(',', '.')))
              if (!Number.isFinite(d)) return
              applyFrac(fs.kind, fs.n, d)
            }}
          />
        </Field>
        <Field label="Corrigé">
          <CorrigeBox value={item.answer ?? ''} ariaLabel={`Corrigé ${index + 1}`} />
        </Field>
      </div>
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
    const defs = item.problemVarDefs ?? []
    const part = item.problemPart ?? 0
    const editDefs = defs.filter((d) => d.editOn === 'both' || d.editOn === part)
    const vars = item.problemVars ?? {}
    const problemOptions = problemOptionsForExercise(exerciseType)
    const commitVar = (key: string, raw: string) => {
      const n = parseFrNumber(raw)
      if (n == null || !item.problemTemplateId) return
      const nextVars = { ...vars, [key]: n }
      const rebuilt = rebuildProblemItems(item.problemTemplateId, nextVars)
      if (rebuilt) onChangeItems(rebuilt)
    }
    return (
      <>
        {problemOptions && part === 0 ? (
          <Field label="Problème disponible">
            <LineSelect
              value={item.problemTemplateId ?? problemOptions[0]?.id ?? ''}
              ariaLabel={`Choisir le problème ${index + 1}`}
              options={problemOptions.map((o) => ({ value: o.id, label: o.label }))}
              onChange={(id) => {
                libreProblemRoll = (libreProblemRoll + 1) >>> 0
                const rolled = rollProblemItems(
                  id,
                  createRng((id.length * 997 + libreProblemRoll * 2654435761) >>> 0),
                )
                if (rolled) onChangeItems(rolled)
              }}
            />
          </Field>
        ) : null}
        {editDefs.length > 0 ? (
          <div className="libre-inline-triple is-op">
            {editDefs.map((d) => (
              <Field key={d.key} label={d.label}>
                <NumInput
                  compact
                  value={vars[d.key] != null ? fmt(vars[d.key]!) : ''}
                  ariaLabel={`${d.label} ${index + 1}`}
                  onCommit={(raw) => commitVar(d.key, raw)}
                />
              </Field>
            ))}
          </div>
        ) : null}
        <Field label="Problème / question">
          <textarea
            className="libre-line-input is-textarea"
            rows={3}
            value={item.prompt ?? ''}
            aria-label={`Problème ${index + 1}`}
            readOnly={editDefs.length > 0}
            onChange={(e) => {
              if (editDefs.length > 0) return
              patch(index, { ...item, prompt: e.target.value })
            }}
          />
        </Field>
        <Field label="Calcul (corrigé)">
          <CorrigeBox value={item.calcAnswer ?? ''} ariaLabel={`Calcul ${index + 1}`} wide />
        </Field>
        <Field label="Phrase réponse">
          <CorrigeBox value={item.responseAnswer ?? ''} ariaLabel={`Phrase ${index + 1}`} wide />
        </Field>
        <Field label="Réponse">
          <CorrigeBox value={item.answer ?? ''} ariaLabel={`Réponse ${index + 1}`} />
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
    const family: ConvertFamily =
      item.convert.family ?? inferConvertFamily(item.convert.from, item.convert.to)
    // Toutes les unités de la famille (poids : tonne…mg ; longueur : km…mm ; etc.).
    const unitOpts = unitSelectOptions(family)
    const applyConvert = (next: {
      value?: string
      from?: string
      to?: string
      family?: ConvertFamily
    }) => {
      const nextFamily = next.family ?? family
      const units = unitsForFamily(nextFamily)
      let from = next.from ?? item.convert!.from
      let to = next.to ?? item.convert!.to
      if (!units.includes(from)) from = units[Math.min(3, units.length - 1)] ?? units[0]!
      if (!units.includes(to) || to === from) {
        to = units.find((u) => u !== from) ?? units[0]!
      }
      patch(index, {
        ...item,
        convert: {
          value: next.value ?? item.convert!.value,
          from,
          to,
          family: nextFamily,
        },
      })
    }
    return (
      <div className="libre-frac-stack" role="group" aria-label={`Conversion ${index + 1}`}>
        <Field label="Unité">
          <LineSelect
            value={family}
            ariaLabel={`Famille d’unités ${index + 1}`}
            options={[...CONVERT_FAMILY_OPTIONS]}
            onChange={(fam) => applyConvert({ family: fam as ConvertFamily })}
          />
        </Field>
        <Field label="Valeur">
          <NumInput
            value={item.convert.value}
            ariaLabel={`Valeur ${index + 1}`}
            onCommit={(value) => applyConvert({ value })}
          />
        </Field>
        <div className="libre-inline-triple is-op">
          <Field label="De">
            <LineSelect
              value={item.convert.from}
              ariaLabel={`Unité départ ${index + 1}`}
              options={unitOpts}
              onChange={(from) => applyConvert({ from })}
            />
          </Field>
          <Field label="Vers">
            <LineSelect
              value={item.convert.to}
              ariaLabel={`Unité arrivée ${index + 1}`}
              options={unitOpts}
              onChange={(to) => applyConvert({ to })}
            />
          </Field>
        </div>
        <Field label="Corrigé">
          <CorrigeBox value={item.answer ?? ''} ariaLabel={`Corrigé conversion ${index + 1}`} />
        </Field>
      </div>
    )
  }

  if (
    item.layout === 'inline' &&
    /\/\s*\d/.test(item.prompt ?? '') &&
    exerciseType !== 'tcm-fractions-mixte' &&
    !item.labels?.some((l) => l.startsWith('frac-'))
  ) {
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
    const isSideFromPerim =
      exerciseType.includes('ex25') ||
      exerciseType.includes('ex26') ||
      dims.perimeter != null ||
      /\[périmètre\]|\[perimetre\]/i.test(item.prompt ?? '')
    if (isSideFromPerim) {
      return (
        <>
          <Field label="Énoncé (utilisez [périmètre] et [côté])">
            <textarea
              className="libre-line-input is-textarea"
              rows={2}
              value={item.prompt ?? ''}
              aria-label={`Énoncé ${index + 1}`}
              onChange={(e) => patch(index, { ...item, prompt: e.target.value })}
            />
          </Field>
          <div className="libre-inline-triple is-op">
            <Field label="Périmètre (cm)">
              <NumInput
                compact
                value={dims.perimeter != null ? fmt(dims.perimeter) : ''}
                ariaLabel={`Périmètre ${index + 1}`}
                onCommit={(raw) => {
                  const perimeter = Number(raw.replace(',', '.'))
                  if (!Number.isFinite(perimeter)) return
                  patch(index, {
                    ...item,
                    dims: { ...dims, perimeter },
                  })
                }}
              />
            </Field>
            {item.figure === 'rectangle' ? (
              <>
                <Field label="Longueur connue">
                  <NumInput
                    compact
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
                    compact
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
              </>
            ) : null}
          </div>
          <Field label="Corrigé (côté)">
            <CorrigeBox value={item.answer ?? ''} ariaLabel={`Corrigé ${index + 1}`} />
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
        {item.figure === 'parallelogram' ? (
          <div className="libre-inline-triple">
            {(
              [
                { key: 'base', label: 'Base' },
                { key: 'side', label: 'Côté' },
                { key: 'height', label: 'Hauteur h' },
              ] as const
            ).map(({ key, label }) => (
              <Field key={key} label={label}>
                <NumInput
                  value={dims[key] != null ? fmt(Number(dims[key])) : ''}
                  ariaLabel={`${label} ${index + 1}`}
                  onCommit={(raw) => {
                    const v = Number(raw.replace(',', '.'))
                    if (!Number.isFinite(v)) return
                    patch(index, { ...item, dims: { ...dims, [key]: v } })
                  }}
                />
              </Field>
            ))}
          </div>
        ) : null}
        {item.figure === 'rhombus' ? (
          <div className="libre-inline-triple">
            {(
              [
                { key: 'side', label: 'Côté c' },
                { key: 'd1', label: 'Diagonale d₁' },
                { key: 'd2', label: 'Diagonale d₂' },
              ] as const
            ).map(({ key, label }) => (
              <Field key={key} label={label}>
                <NumInput
                  value={dims[key] != null ? fmt(Number(dims[key])) : ''}
                  ariaLabel={`${label} ${index + 1}`}
                  onCommit={(raw) => {
                    const v = Number(raw.replace(',', '.'))
                    if (!Number.isFinite(v)) return
                    patch(index, { ...item, dims: { ...dims, [key]: v } })
                  }}
                />
              </Field>
            ))}
          </div>
        ) : null}
        {item.figure === 'trapezoid' ? (
          <div className="libre-inline-triple">
            {(
              [
                { key: 'top', label: 'Base a' },
                { key: 'bottom', label: 'Base b' },
                { key: 'c', label: 'Côté c' },
                { key: 'height', label: 'Hauteur h' },
              ] as const
            ).map(({ key, label }) => (
              <Field key={key} label={label}>
                <NumInput
                  value={
                    key === 'c'
                      ? dims.c != null
                        ? fmt(Number(dims.c))
                        : dims.side != null
                          ? fmt(Number(dims.side))
                          : ''
                      : dims[key] != null
                        ? fmt(Number(dims[key]))
                        : ''
                  }
                  ariaLabel={`${label} ${index + 1}`}
                  onCommit={(raw) => {
                    const v = Number(raw.replace(',', '.'))
                    if (!Number.isFinite(v)) return
                    patch(index, { ...item, dims: { ...dims, [key]: v } })
                  }}
                />
              </Field>
            ))}
          </div>
        ) : null}
        {item.figure === 'circle' ? (
          <Field label="Diamètre">
            <NumInput
              value={dims.diameter != null ? fmt(dims.diameter) : ''}
              ariaLabel={`Diamètre ${index + 1}`}
              onCommit={(raw) => {
                const diameter = Number(raw.replace(',', '.'))
                if (!Number.isFinite(diameter)) return
                patch(index, {
                  ...item,
                  dims: { ...dims, diameter, radius: diameter / 2 },
                })
              }}
            />
          </Field>
        ) : null}
        <Field label="Périmètre">
          <CorrigeBox
            value={item.propertyLines?.find((l) => /Périmètre/i.test(l.label))?.answer ?? ''}
            ariaLabel={`Périmètre ${index + 1}`}
          />
        </Field>
        <Field label="Aire">
          <CorrigeBox
            value={item.propertyLines?.find((l) => /Aire/i.test(l.label))?.answer ?? ''}
            ariaLabel={`Aire ${index + 1}`}
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
          const crossingWarn =
            kind === 'crossing'
              ? metroCrossingWarning(map, names[0] ?? '', names[1] ?? '')
              : undefined
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
                {crossingWarn ? (
                  <p className="libre-field-error" role="alert">
                    {crossingWarn}
                  </p>
                ) : null}
              </div>
            </div>
          )
        })}
      </>
    )
  }

  // TCM ex. 32 — réduire : modèle (Q2) / termes (Q1) + variables.
  if (
    item.layout === 'algebra' &&
    (exerciseType === 'tcm-expressions-reduire' || item.labels?.includes('reduire'))
  ) {
    const isQ2 =
      item.labels?.includes('q2') ||
      (item.problemTemplateId != null && item.problemTemplateId !== 'sum')
    if (isQ2) {
      const tpl = reduireTemplateById(item.problemTemplateId ?? '') ?? TCM_REDUIRE_Q2[0]!
      const vars = { ...(item.problemVars ?? {}) }
      const keys = item.problemVarDefs?.map((d) => d.key) ?? Object.keys(vars).filter((k) => k.startsWith('c') || k.startsWith('op'))
      const apply = (nextId: string, nextVars: Record<string, number>) => {
        const nextTpl = reduireTemplateById(nextId) ?? tpl
        const merged = {
          ...nextVars,
          k0: nextTpl.slots[0] === 'paren' ? 1 : 0,
          k1: nextTpl.slots[1] === 'paren' ? 1 : 0,
          k2: nextTpl.slots[2] === 'paren' ? 1 : 0,
          c0: nextVars.c0 ?? 5,
          c1: nextVars.c1 ?? 4,
          c2: nextVars.c2 ?? 2,
          c0a: nextVars.c0a ?? 3,
          c0b: nextVars.c0b ?? 2,
          c1a: nextVars.c1a ?? 3,
          c1b: nextVars.c1b ?? 2,
          c2a: nextVars.c2a ?? 3,
          c2b: nextVars.c2b ?? 2,
          p0: nextVars.p0 ?? 0,
          p1: nextVars.p1 ?? 1,
          p2: nextVars.p2 ?? (nextTpl.slots[2] === 'const' ? -1 : 0),
          p0a: nextVars.p0a ?? 0,
          p0b: nextVars.p0b ?? -1,
          p1a: nextVars.p1a ?? 0,
          p1b: nextVars.p1b ?? -1,
          p2a: nextVars.p2a ?? 0,
          p2b: nextVars.p2b ?? -1,
          nLetters: nextVars.nLetters ?? 3,
          L0: nextVars.L0 ?? 0,
          L1: nextVars.L1 ?? 1,
          L2: nextVars.L2 ?? 2,
        }
        const rebuilt = fillReduireQ2WithVars(nextTpl, merged)
        if (rebuilt) patch(index, { ...item, ...rebuilt })
      }
      return (
        <div className="libre-frac-stack">
          <Field label="Modèle">
            <LineSelect
              value={tpl.id}
              ariaLabel={`Modèle ${index + 1}`}
              options={TCM_REDUIRE_Q2.map((t) => ({
                value: t.id,
                label: `${t.id} — ${t.slots.join(' · ')}`,
              }))}
              onChange={(id) => apply(id, vars)}
            />
          </Field>
          <div className="libre-inline-triple is-op">
            {keys.map((key) => (
              <Field key={key} label={key.startsWith('op') ? `Signe ${key.slice(2)}` : `Coef. ${key.slice(1)}`}>
                <NumInput
                  compact
                  value={vars[key] != null ? String(vars[key]) : ''}
                  ariaLabel={`${key} ${index + 1}`}
                  onCommit={(raw) => {
                    const n = parseFrNumber(raw)
                    if (n == null) return
                    apply(tpl.id, { ...vars, [key]: n })
                  }}
                />
              </Field>
            ))}
          </div>
          <Field label="Corrigé">
            <CorrigeBox value={item.answer ?? ''} ariaLabel={`Corrigé ${index + 1}`} />
          </Field>
        </div>
      )
    }
    // Q1 somme
    const vars = { ...(item.problemVars ?? {}) }
    const keys = item.problemVarDefs?.map((d) => d.key) ?? Object.keys(vars).filter((k) => k.startsWith('t'))
    return (
      <div className="libre-frac-stack">
        <Field label="Modèle">
          <LineSelect
            value="sum"
            ariaLabel={`Modèle ${index + 1}`}
            options={[{ value: 'sum', label: 'sum — somme de monômes' }]}
            onChange={() => {
              const rebuilt = fillReduireQ1WithVars(vars)
              if (rebuilt) patch(index, { ...item, ...rebuilt })
            }}
          />
        </Field>
        <div className="libre-inline-triple is-op">
          {(keys.length ? keys : Object.keys(vars).filter((k) => k.startsWith('t'))).map((key) => (
            <Field key={key} label={`Terme ${Number(key.slice(1)) + 1}`}>
              <NumInput
                compact
                value={vars[key] != null ? String(vars[key]) : ''}
                ariaLabel={`${key} ${index + 1}`}
                onCommit={(raw) => {
                  const n = parseFrNumber(raw)
                  if (n == null) return
                  const rebuilt = fillReduireQ1WithVars({ ...vars, [key]: n })
                  if (rebuilt) patch(index, { ...item, ...rebuilt })
                }}
              />
            </Field>
          ))}
        </div>
        <Field label="Corrigé">
          <CorrigeBox value={item.answer ?? ''} ariaLabel={`Corrigé ${index + 1}`} />
        </Field>
      </div>
    )
  }

  // TCM ex. 34 — équations : modèle + paramètres.
  if (
    item.layout === 'algebra' &&
    (exerciseType === 'tcm-equations' || item.labels?.includes('equations'))
  ) {
    const kind =
      item.labels?.includes('q2') || (item.problemTemplateId ?? '').startsWith('q2')
        ? 'q2'
        : 'q1'
    const pool = kind === 'q2' ? TCM_EQUATIONS_Q2 : TCM_EQUATIONS_Q1
    const tpl = equationTemplateById(item.problemTemplateId ?? '') ?? pool[0]!
    const vars = { ...(item.problemVars ?? {}) }
    const keys = item.problemVarDefs?.map((d) => d.key) ?? Object.keys(vars)
    const apply = (nextId: string, nextVars: Record<string, number>) => {
      const nextTpl = equationTemplateById(nextId) ?? tpl
      const nextKind = equationKindForTemplate(nextTpl.id)
      const filled =
        Object.keys(nextVars).length > 0
          ? (fillEquationTemplateWithVars(nextTpl, nextVars) ??
            nextTpl.build(createRng(++libreProblemRoll)))
          : nextTpl.build(createRng(++libreProblemRoll))
      const vkeys = Object.keys(filled.vars).sort((a, b) => a.localeCompare(b))
      patch(index, {
        ...item,
        problemTemplateId: nextTpl.id,
        problemVars: filled.vars,
        problemVarDefs: vkeys.map((k) => ({
          key: k,
          label: k === 'x' ? 'Solution x' : `Paramètre ${k}`,
          editOn: 'both' as const,
        })),
        labels: ['equations', nextKind],
        prompt: filled.equation,
        development: filled.development,
        operations: filled.operations,
        calcAnswer: filled.development.join('\n'),
        responseAnswer: `x = ${fmt(filled.x)}`,
        answer: fmt(filled.x),
        unknowns: ['x'],
      })
    }
    return (
      <div className="libre-frac-stack">
        <Field label="Modèle">
          <LineSelect
            value={tpl.id}
            ariaLabel={`Modèle ${index + 1}`}
            options={pool.map((t) => ({
              value: t.id,
              label: equationTemplateLabel(t),
            }))}
            onChange={(id) => apply(id, {})}
          />
        </Field>
        <div className="libre-inline-triple is-op">
          {(keys.length ? keys : Object.keys(vars)).map((key) => (
            <Field key={key} label={key === 'x' ? 'Solution x' : `Paramètre ${key}`}>
              <NumInput
                compact
                value={vars[key] != null ? String(vars[key]) : ''}
                ariaLabel={`${key} ${index + 1}`}
                onCommit={(raw) => {
                  const n = parseFrNumber(raw)
                  if (n == null) return
                  apply(tpl.id, { ...vars, [key]: n })
                }}
              />
            </Field>
          ))}
        </div>
        <Field label="Corrigé">
          <CorrigeBox value={item.answer ?? ''} ariaLabel={`Corrigé ${index + 1}`} />
        </Field>
      </div>
    )
  }

  // TCM ex. 33 — évaluer : modèle + coefficients / valeurs des lettres.
  if (
    item.layout === 'algebra' &&
    (exerciseType === 'tcm-expressions-evaluer' || item.labels?.includes('evaluer'))
  ) {
    const kind =
      item.labels?.includes('q2') || (item.problemTemplateId ?? '').startsWith('q2')
        ? 'q2'
        : 'q1'
    const pool = kind === 'q2' ? TCM_EVALUER_Q2 : TCM_EVALUER_Q1
    const tpl =
      evaluerTemplateById(item.problemTemplateId ?? '') ?? pool[0]!
    const letters = (item.unknowns?.length === 3
      ? (item.unknowns as [string, string, string])
      : ['x', 'y', 'z']) as [string, string, string]
    const vars = { ...(item.problemVars ?? {}) }
    const keys = item.problemVarDefs?.map((d) => d.key) ?? Object.keys(vars)
    const applyTpl = (nextId: string, nextVars: Record<string, number>, syncLetters = false) => {
      const nextTpl = evaluerTemplateById(nextId) ?? tpl
      const nextKind = evaluerKindForTemplate(nextTpl.id)
      // En libre : pas de contrainte d’entier (le prof choisit les valeurs).
      const filled = fillEvaluerTemplateWithVars(nextTpl, letters, nextVars, false)
      if (!filled) return
      const coefKeys = Object.keys(filled.vars).filter((k) => 'abcdefghij'.includes(k))
      const letterKeys = [...filled.letters]
      const nextKeys = [...coefKeys, ...letterKeys]
      const rebuilt: MathItem = {
        ...item,
        problemTemplateId: nextTpl.id,
        problemVars: filled.vars,
        problemVarDefs: nextKeys.map((k) => ({
          key: k,
          label: letterKeys.includes(k) ? `Valeur ${k}` : `Coeff. ${k}`,
          editOn: 'both' as const,
        })),
        unknowns: letterKeys,
        labels: ['evaluer', nextKind],
        prompt: filled.prompt,
        answer: filled.answer,
        development: filled.development,
        calcAnswer: filled.development.join('\n'),
      }
      if (!syncLetters) {
        patch(index, rebuilt)
        return
      }
      // Les 3 lettres sont partagées entre Q1 et Q2.
      const letterPatch = Object.fromEntries(letterKeys.map((k) => [k, filled.vars[k]!]))
      onChangeItems(
        (items.length ? items : [item]).map((it, i) => {
          if (i === index) return rebuilt
          if (!it.labels?.includes('evaluer') || !it.problemTemplateId) return it
          const otherTpl = evaluerTemplateById(it.problemTemplateId)
          if (!otherTpl) return it
          const otherLetters = (it.unknowns?.length === 3
            ? (it.unknowns as [string, string, string])
            : letters) as [string, string, string]
          const otherFilled = fillEvaluerTemplateWithVars(
            otherTpl,
            otherLetters,
            { ...(it.problemVars ?? {}), ...letterPatch },
            false,
          )
          if (!otherFilled) return it
          const oCoef = Object.keys(otherFilled.vars).filter((k) => 'abcdefghij'.includes(k))
          const oKeys = [...oCoef, ...otherFilled.letters]
          return {
            ...it,
            problemVars: otherFilled.vars,
            problemVarDefs: oKeys.map((k) => ({
              key: k,
              label: otherFilled.letters.includes(k) ? `Valeur ${k}` : `Coeff. ${k}`,
              editOn: 'both' as const,
            })),
            unknowns: [...otherFilled.letters],
            prompt: otherFilled.prompt,
            answer: otherFilled.answer,
            development: otherFilled.development,
            calcAnswer: otherFilled.development.join('\n'),
          }
        }),
      )
    }
    return (
      <div className="libre-frac-stack">
        <Field label="Modèle">
          <LineSelect
            value={tpl.id}
            ariaLabel={`Modèle ${index + 1}`}
            options={pool.map((t) => ({ value: t.id, label: `${t.id} — ${t.pattern}` }))}
            onChange={(id) => applyTpl(id, vars, false)}
          />
        </Field>
        <div className="libre-inline-triple is-op">
          {keys.map((key) => (
            <Field
              key={key}
              label={letters.includes(key) ? `Valeur ${key}` : `Coeff. ${key}`}
            >
              <NumInput
                compact
                value={vars[key] != null ? String(vars[key]) : ''}
                ariaLabel={`${key} ${index + 1}`}
                onCommit={(raw) => {
                  const n = parseFrNumber(raw)
                  if (n == null) return
                  applyTpl(tpl.id, { ...vars, [key]: n }, letters.includes(key))
                }}
              />
            </Field>
          ))}
        </div>
        <Field label="Corrigé">
          <CorrigeBox value={item.answer ?? ''} ariaLabel={`Corrigé ${index + 1}`} />
        </Field>
      </div>
    )
  }

  // TCM ex. 28 — modèle + variables saisissables.
  if (
    item.layout === 'algebra' &&
    (exerciseType === 'tcm-priorite-ops' || item.labels?.includes('priorite'))
  ) {
    const byId = prioriteTemplateById(item.problemTemplateId ?? '')
    const kind =
      byId?.kind ??
      (item.labels?.includes('frac-pow') || index === 1 ? 'frac-pow' : 'ops')
    const pool = kind === 'frac-pow' ? TCM_PRIORITE_FRAC_POW : TCM_PRIORITE_OPS
    const tpl = byId && pool.some((t) => t.id === byId.id) ? byId : pool[0]!
    const vars = { ...(item.problemVars ?? {}) }
    const keys =
      item.problemVarDefs?.map((d) => d.key) ??
      (Object.keys(vars).length ? Object.keys(vars) : prioriteKeysInPattern(tpl.pattern))
    const applyTpl = (nextId: string, nextVars: Record<string, number>, reroll = false) => {
      const nextTpl = prioriteTemplateById(nextId) ?? tpl
      const filled =
        (!reroll ? fillPrioriteTemplateWithVars(nextTpl, nextVars) : null) ??
        fillPrioriteTemplate(nextTpl, createRng(++libreProblemRoll)) ??
        fillPrioriteTemplateWithVars(nextTpl, {})
      if (!filled) return
      const nextKeys = prioriteKeysInPattern(nextTpl.pattern)
      patch(index, {
        ...item,
        problemTemplateId: nextTpl.id,
        problemVars: Object.fromEntries(nextKeys.map((k) => [k, filled.vars[k] ?? 2])),
        problemVarDefs: nextKeys.map((k) => ({
          key: k,
          label: 'pqr'.includes(k) ? `Exposant ${k}` : `Valeur ${k}`,
          editOn: 'both' as const,
        })),
        labels: ['priorite', nextTpl.kind],
        prompt: filled.prompt,
        answer: filled.answer,
        development: filled.development,
        calcAnswer: filled.development.join('\n'),
      })
    }
    return (
      <div className="libre-frac-stack">
        <Field label="Modèle">
          <LineSelect
            value={tpl.id}
            ariaLabel={`Modèle ${index + 1}`}
            options={pool.map((t) => ({ value: t.id, label: `${t.id} — ${t.pattern}` }))}
            onChange={(id) => applyTpl(id, {}, true)}
          />
        </Field>
        <div className="libre-inline-triple is-op">
          {keys.map((key) => (
            <Field key={key} label={'pqr'.includes(key) ? `Exposant ${key}` : `Valeur ${key}`}>
              <NumInput
                compact
                value={vars[key] != null ? String(vars[key]) : ''}
                ariaLabel={`${key} ${index + 1}`}
                onCommit={(raw) => {
                  const n = parseFrNumber(raw)
                  if (n == null) return
                  applyTpl(tpl.id, { ...vars, [key]: n }, false)
                }}
              />
            </Field>
          ))}
        </div>
        <Field label="Énoncé">
          <CorrigeBox value={item.prompt ?? ''} ariaLabel={`Énoncé ${index + 1}`} />
        </Field>
        <Field label="Corrigé">
          <CorrigeBox value={item.answer ?? ''} ariaLabel={`Corrigé ${index + 1}`} />
        </Field>
      </div>
    )
  }

  // TCM ex. 29 — relatifs : champs valeurs + opération.
  if (
    exerciseType === 'tcm-relatifs-ops' ||
    item.labels?.includes('relatif')
  ) {
    const parsed = parseRelatifPrompt(item.prompt ?? '')
    const op = (item.op ?? parsed?.op ?? '+') as ArithOp
    const a = typeof item.a === 'number' ? item.a : (parsed?.a ?? 10)
    const b = typeof item.b === 'number' ? item.b : (parsed?.b ?? -10)
    const fmtR = (n: number) => (n >= 0 ? `(+${fmt(n)})` : `(−${fmt(Math.abs(n))})`)
    const applyRel = (na: number, nop: ArithOp, nb: number) => {
      const r =
        nop === '+'
          ? na + nb
          : nop === '−'
            ? na - nb
            : nop === '×'
              ? na * nb
              : nb !== 0
                ? na / nb
                : na
      const ans =
        Math.abs(r - Math.round(r)) < 1e-8
          ? Math.round(r) >= 0
            ? `(+${Math.round(r)})`
            : `(−${Math.abs(Math.round(r))})`
          : r >= 0
            ? `(+${fmt(r)})`
            : `(−${fmt(Math.abs(r))})`
      patch(index, {
        ...item,
        a: na,
        b: nb,
        op: nop,
        result: r,
        labels: ['relatif'],
        prompt: `${fmtR(na)} ${nop} ${fmtR(nb)} =`,
        answer: ans,
      })
    }
    return (
      <div className="libre-frac-stack">
        <div className="libre-inline-triple is-op is-eq-line">
          <Field label="1ʳᵉ valeur">
            <NumInput
              compact
              value={fmt(a)}
              ariaLabel={`1ʳᵉ valeur ${index + 1}`}
              onCommit={(raw) => {
                const n = parseRelatifNumber(raw) ?? parseFrNumber(raw)
                if (n == null) return
                applyRel(n, op, b)
              }}
            />
          </Field>
          <Field label="Opération">
            <LineSelect
              value={OPS.includes(op) ? op : '+'}
              ariaLabel={`Opération ${index + 1}`}
              options={OPS.map((o) => ({ value: o, label: o }))}
              onChange={(nextOp) => applyRel(a, nextOp as ArithOp, b)}
            />
          </Field>
          <Field label="2ᵉ valeur">
            <NumInput
              compact
              value={fmt(b)}
              ariaLabel={`2ᵉ valeur ${index + 1}`}
              onCommit={(raw) => {
                const n = parseRelatifNumber(raw) ?? parseFrNumber(raw)
                if (n == null) return
                applyRel(a, op, n)
              }}
            />
          </Field>
        </div>
        <Field label="Énoncé">
          <CorrigeBox value={`${fmtR(a)} ${op} ${fmtR(b)} =`} ariaLabel={`Énoncé ${index + 1}`} />
        </Field>
        <Field label="Corrigé">
          <CorrigeBox value={item.answer ?? ''} ariaLabel={`Corrigé ${index + 1}`} />
        </Field>
      </div>
    )
  }

  // TCM ex. 30 — fractions (réduction / opérations).
  if (
    exerciseType === 'tcm-fractions-mixte' ||
    item.labels?.some((l) => l.startsWith('frac-'))
  ) {
    const gcdFr = (x: number, y: number): number => (y ? gcdFr(y, x % y) : Math.abs(x) || 1)
    const kind =
      item.labels?.find((l) => l.startsWith('frac-')) ??
      (/□/.test(item.prompt ?? '')
        ? 'frac-reduce-partial'
        : item.op
          ? 'frac-op'
          : index === 0
            ? 'frac-reduce-partial'
            : 'frac-reduce')
    if (kind === 'frac-reduce-partial' || kind === 'frac-reduce') {
      const n = item.a ?? 2
      const d = Math.max(1, item.b ?? 4)
      const gg0 = gcdFr(n, d)
      const sn0 = n / gg0
      const sd0 = d / gg0
      // Q1 : toujours une case (num ou den de la réponse) à saisir.
      const isPartial = kind === 'frac-reduce-partial' || index === 0 || /□/.test(item.prompt ?? '')
      const missNum =
        item.missing === 'a' ||
        (item.missing !== 'b' && (item.prompt ?? '').includes('□/'))
      const applyReduce = (nn: number, dd: number, partial: boolean, missIsNum: boolean) => {
        const safeD = Math.max(1, dd)
        const g = gcdFr(nn, safeD)
        const sn = nn / g
        const sd = safeD / g
        if (!partial) {
          patch(index, {
            ...item,
            a: nn,
            b: safeD,
            op: undefined,
            missing: undefined,
            labels: ['frac-reduce'],
            left: String(sn),
            right: String(sd),
            prompt: `${nn}/${safeD} =`,
            answer: sd === 1 ? String(sn) : `${sn}/${sd}`,
          })
          return
        }
        patch(index, {
          ...item,
          a: nn,
          b: safeD,
          op: undefined,
          missing: missIsNum ? 'a' : 'b',
          labels: ['frac-reduce-partial'],
          left: String(sn),
          right: String(sd),
          prompt: missIsNum ? `${nn}/${safeD} = □/${sd}` : `${nn}/${safeD} = ${sn}/□`,
          answer: missIsNum ? String(sn) : String(sd),
          result: missIsNum ? sn : sd,
        })
      }
      return (
        <div className="libre-frac-stack">
          <div className="libre-inline-triple is-frac">
            <Field label="Numérateur">
              <NumInput
                compact
                value={String(n)}
                ariaLabel={`Numérateur ${index + 1}`}
                onCommit={(raw) => {
                  const nn = Math.round(Number(raw.replace(',', '.')))
                  if (!Number.isFinite(nn)) return
                  applyReduce(nn, d, isPartial, missNum)
                }}
              />
            </Field>
            <Field label="Dénominateur">
              <NumInput
                compact
                value={String(d)}
                ariaLabel={`Dénominateur ${index + 1}`}
                onCommit={(raw) => {
                  const dd = Math.max(1, Math.round(Number(raw.replace(',', '.'))))
                  if (!Number.isFinite(dd)) return
                  applyReduce(n, dd, isPartial, missNum)
                }}
              />
            </Field>
          </div>
          {isPartial ? (
            <>
              <Field label="Case à saisir (réponse)">
                <LineSelect
                  value={missNum ? 'a' : 'b'}
                  ariaLabel={`Case à saisir ${index + 1}`}
                  options={[
                    { value: 'a', label: 'Numérateur de la réponse (□ / den)' },
                    { value: 'b', label: 'Dénominateur de la réponse (num / □)' },
                  ]}
                  onChange={(raw) => applyReduce(n, d, true, raw === 'a')}
                />
              </Field>
              <div className="libre-inline-triple is-frac">
                <Field label={missNum ? 'Réponse □' : 'Réponse num.'}>
                  {missNum ? (
                    <CorrigeBox value="□" ariaLabel={`Case numérateur ${index + 1}`} />
                  ) : (
                    <CorrigeBox value={String(sn0)} ariaLabel={`Numérateur réponse ${index + 1}`} />
                  )}
                </Field>
                <Field label={missNum ? 'Réponse den.' : 'Réponse □'}>
                  {missNum ? (
                    <CorrigeBox value={String(sd0)} ariaLabel={`Dénominateur réponse ${index + 1}`} />
                  ) : (
                    <CorrigeBox value="□" ariaLabel={`Case dénominateur ${index + 1}`} />
                  )}
                </Field>
              </div>
            </>
          ) : (
            <Field label="Forme">
              <LineSelect
                value="full"
                ariaLabel={`Forme ${index + 1}`}
                options={[
                  { value: 'full', label: 'Réduction sans case' },
                  { value: 'partial', label: 'Réduction avec case (num ou den)' },
                ]}
                onChange={(raw) => applyReduce(n, d, raw === 'partial', false)}
              />
            </Field>
          )}
          <Field label="Corrigé">
            <CorrigeBox value={item.answer ?? ''} ariaLabel={`Corrigé ${index + 1}`} />
          </Field>
        </div>
      )
    }
    // frac-op — opération au choix (+ − × ÷).
    const op = (item.op ?? '+') as ArithOp
    const n1 = item.a ?? 1
    const n2 = item.b ?? 1
    const d1 = parseFrNumber(item.left ?? '') ?? 2
    const d2 = parseFrNumber(item.right ?? '') ?? 2
    const applyFracOp = (nn1: number, dd1: number, nop: ArithOp, nn2: number, dd2: number) => {
      const safeD1 = Math.max(1, dd1)
      const safeD2 = Math.max(1, dd2)
      let rn = 0
      let rd = 1
      if (nop === '+') {
        rn = nn1 * safeD2 + nn2 * safeD1
        rd = safeD1 * safeD2
      } else if (nop === '−') {
        rn = nn1 * safeD2 - nn2 * safeD1
        rd = safeD1 * safeD2
      } else if (nop === '×') {
        rn = nn1 * nn2
        rd = safeD1 * safeD2
      } else {
        rn = nn1 * safeD2
        rd = safeD1 * nn2
      }
      if (rd === 0) rd = 1
      if (rd < 0) {
        rn = -rn
        rd = -rd
      }
      const gg = gcdFr(rn, rd)
      const sn = rn / gg
      const sd = rd / gg
      const show = (num: number, den: number) =>
        num < 0 ? `−${Math.abs(num)}/${den}` : `${num}/${den}`
      patch(index, {
        ...item,
        op: nop,
        a: nn1,
        b: nn2,
        left: String(safeD1),
        right: String(safeD2),
        labels: ['frac-op'],
        prompt: `${show(nn1, safeD1)} ${nop} ${show(nn2, safeD2)} =`,
        answer: sd === 1 ? String(sn) : show(sn, sd),
      })
    }
    return (
      <div className="libre-frac-stack">
        <div className="libre-inline-triple is-frac">
          <Field label="Num. 1">
            <NumInput
              compact
              value={String(n1)}
              ariaLabel={`Numérateur 1 ${index + 1}`}
              onCommit={(raw) => {
                const n = Math.round(Number(raw.replace(',', '.')))
                if (!Number.isFinite(n)) return
                applyFracOp(n, d1, op, n2, d2)
              }}
            />
          </Field>
          <Field label="Dén. 1">
            <NumInput
              compact
              value={String(d1)}
              ariaLabel={`Dénominateur 1 ${index + 1}`}
              onCommit={(raw) => {
                const n = Math.max(1, Math.round(Number(raw.replace(',', '.'))))
                if (!Number.isFinite(n)) return
                applyFracOp(n1, n, op, n2, d2)
              }}
            />
          </Field>
        </div>
        <Field label="Opération">
          <LineSelect
            value={OPS.includes(op) ? op : '+'}
            ariaLabel={`Opération ${index + 1}`}
            options={OPS.map((o) => ({ value: o, label: o }))}
            onChange={(nextOp) => applyFracOp(n1, d1, nextOp as ArithOp, n2, d2)}
          />
        </Field>
        <div className="libre-inline-triple is-frac">
          <Field label="Num. 2">
            <NumInput
              compact
              value={String(n2)}
              ariaLabel={`Numérateur 2 ${index + 1}`}
              onCommit={(raw) => {
                const n = Math.round(Number(raw.replace(',', '.')))
                if (!Number.isFinite(n)) return
                applyFracOp(n1, d1, op, n, d2)
              }}
            />
          </Field>
          <Field label="Dén. 2">
            <NumInput
              compact
              value={String(d2)}
              ariaLabel={`Dénominateur 2 ${index + 1}`}
              onCommit={(raw) => {
                const n = Math.max(1, Math.round(Number(raw.replace(',', '.'))))
                if (!Number.isFinite(n)) return
                applyFracOp(n1, d1, op, n2, n)
              }}
            />
          </Field>
        </div>
        <Field label="Corrigé">
          <CorrigeBox value={item.answer ?? ''} ariaLabel={`Corrigé ${index + 1}`} />
        </Field>
      </div>
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
