import { SWISS_DENOMS, isSwissBill, swissMoneyLabel } from '@/math/money-change'
import type { PreviewMode } from '@/math/types'

function MoneyToken({ cents }: { cents: number }) {
  const { main, unit } = swissMoneyLabel(cents)
  if (isSwissBill(cents)) {
    return (
      <svg className="money-bill" viewBox="0 0 64 36" aria-hidden>
        <rect x="1.5" y="1.5" width="61" height="33" rx="3" fill="#fff" stroke="#222" strokeWidth="1.6" />
        <rect x="5" y="5" width="54" height="26" rx="2" fill="none" stroke="#222" strokeWidth="0.6" />
        <text x="32" y="20" textAnchor="middle" fontSize="13" fontWeight="700" fill="#222">
          {main}
        </text>
        <text x="32" y="29" textAnchor="middle" fontSize="7" fill="#222">
          {unit}
        </text>
      </svg>
    )
  }
  return (
    <svg className="money-coin" viewBox="0 0 40 40" aria-hidden>
      <circle cx="20" cy="20" r="17.5" fill="#fff" stroke="#222" strokeWidth="1.6" />
      <circle cx="20" cy="20" r="14" fill="none" stroke="#222" strokeWidth="0.6" />
      <text x="20" y="18" textAnchor="middle" fontSize="11" fontWeight="700" fill="#222">
        {main}
      </text>
      <text x="20" y="28" textAnchor="middle" fontSize="7" fill="#222">
        {unit}
      </text>
    </svg>
  )
}

export function MoneyChangeBoard({
  parts,
  mode,
}: {
  parts: { cents: number; count: number }[]
  mode: PreviewMode
}) {
  const show = mode === 'answers'
  const countOf = (cents: number) => parts.find((part) => part.cents === cents)?.count ?? 0
  const row = (title: string, denoms: number[]) => (
    <>
      <p className="money-change-title">{title}</p>
      <div className="money-change-row">
        {denoms.map((cents) => {
          const count = countOf(cents)
          return (
            <div key={cents} className="money-change-slot">
              <MoneyToken cents={cents} />
              <span className={`answer-line-field compact money-change-count${show ? ' filled' : ''}`}>
                {show ? String(count) : '\u00a0'}
              </span>
            </div>
          )
        })}
      </div>
    </>
  )
  const bills = SWISS_DENOMS.filter((cents) => isSwissBill(cents))
  const coins = SWISS_DENOMS.filter((cents) => !isSwissBill(cents))
  return (
    <div className="money-change" aria-label="Billets et pièces à rendre">
      {row('Billets rendus', [...bills])}
      {row('Pièces rendues', [...coins])}
    </div>
  )
}
