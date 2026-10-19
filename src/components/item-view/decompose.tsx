import { fmt } from '@/math/column-arith'
import { decomposeExample } from '@/math/decompose'
import type { DecomposeCalc, DecomposeTerm, PreviewMode } from '@/math/types'

function shown(value: number, show: boolean): string {
  return show ? fmt(value) : '\u00a0'
}

function Slot({ value, show }: { value: number; show: boolean }) {
  return (
    <span className={`answer-line-field compact decompose-slot${show ? ' filled' : ''}`}>
      {shown(value, show)}
    </span>
  )
}

function Plain({ value }: { value: number }) {
  return <span className="decompose-num">{fmt(value)}</span>
}

function Terms({
  terms,
  show,
  example,
  grouped,
}: {
  terms: DecomposeTerm[]
  show: boolean
  example: boolean
  grouped?: boolean
}) {
  const piece = (term: DecomposeTerm, key: number) => (
    <span key={key} className="decompose-term">
      {term.op ? <span className="decompose-op">{term.op}</span> : null}
      {example ? <Plain value={term.value} /> : <Slot value={term.value} show={show} />}
    </span>
  )
  if (!grouped) return <>{terms.map(piece)}</>
  return (
    <>
      <span className="decompose-group">
        {piece(terms[0]!, 0)}
        {piece(terms[1]!, 1)}
      </span>
      <span className="decompose-group">
        {piece(terms[2]!, 2)}
        {piece(terms[3]!, 3)}
      </span>
    </>
  )
}

export function DecomposeView({
  calc,
  mode,
  example = false,
}: {
  calc: DecomposeCalc
  mode: PreviewMode
  example?: boolean
}) {
  const show = example || mode === 'answers'
  return (
    <span className={`decompose-line${example ? ' is-example' : ''}`}>
      <span className="decompose-given">
        {fmt(calc.a)} {calc.op} {fmt(calc.b)} =
      </span>
      <Terms terms={calc.parts} show={show} example={example} grouped={example} />
      <span className="decompose-op">=</span>
      <Terms terms={calc.partials} show={show} example={example} />
      <span className="decompose-op">=</span>
      {example ? <Plain value={calc.result} /> : <Slot value={calc.result} show={show} />}
    </span>
  )
}

export function DecomposeExample({ op }: { op: '+' | '−' }) {
  return (
    <p className="decompose-example" aria-label="Exemple">
      <DecomposeView calc={decomposeExample(op)} mode="answers" example />
    </p>
  )
}

export function DecomposeBlock({ item, mode }: { item: { decompose?: DecomposeCalc }; mode: PreviewMode }) {
  if (!item.decompose) return null
  return <DecomposeView calc={item.decompose} mode={mode} />
}
