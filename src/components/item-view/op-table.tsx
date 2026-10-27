import { fmt } from '@/math/column-arith'
import { opTableCell } from '@/math/op-table'
import type { MathItem, PreviewMode } from '@/math/types'

function shown(n: number, blank: boolean, answers: boolean): string {
  if (blank && !answers) return ''
  return fmt(n).replace('-', '−')
}

export function OpTableBlock({ item, mode }: { item: MathItem; mode: PreviewMode }) {
  const table = item.opTable
  if (!table) return null
  const answers = mode === 'answers'
  return (
    <table className="op-table">
      <tbody>
        <tr>
          <th className="op-table-corner">{table.op}</th>
          {table.cols.map((col, c) => (
            <th
              key={`c-${c}`}
              className={`op-table-col${table.colBlank[c] && answers ? ' is-answer' : ''}`}
            >
              {shown(col, Boolean(table.colBlank[c]), answers)}
            </th>
          ))}
        </tr>
        {table.rows.map((row, r) => (
          <tr key={`r-${r}`}>
            <th className={`op-table-row${table.rowBlank[r] && answers ? ' is-answer' : ''}`}>
              {shown(row, Boolean(table.rowBlank[r]), answers)}
            </th>
            {table.cols.map((col, c) => {
              const blank = table.cellBlank[r]?.[c] ?? true
              return (
                <td key={`cell-${r}-${c}`} className={blank && answers ? 'is-answer' : undefined}>
                  {shown(opTableCell(table.op, row, col), blank, answers)}
                </td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
