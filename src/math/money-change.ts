function francs(amount: number): string {
  return (Math.round(amount * 100) / 100).toFixed(2).replace('.', ',')
}

/** Valeur en centimes, du plus grand billet à la plus petite pièce. */
export const SWISS_DENOMS = [100000, 20000, 10000, 5000, 2000, 1000, 500, 200, 100, 50, 20, 10, 5] as const

export type ChangePart = { cents: number; count: number }

export function isSwissBill(cents: number): boolean {
  return cents >= 1000
}

export function swissMoneyLabel(cents: number): { main: string; unit: string } {
  if (cents >= 100) return { main: String(cents / 100), unit: 'fr.' }
  return { main: String(cents), unit: 'ct' }
}

/** Décomposition gloutonne en billets et pièces suisses (pas de 5 centimes). */
export function swissChange(amountFr: number): ChangePart[] {
  let left = Math.round(amountFr * 100)
  if (left <= 0) return []
  const parts: ChangePart[] = []
  for (const cents of SWISS_DENOMS) {
    const count = Math.floor(left / cents)
    if (count > 0) parts.push({ cents, count })
    left -= count * cents
  }
  return parts
}

function pieceName(cents: number, count: number): string {
  const n = count > 1
  if (cents >= 1000) {
    const fr = cents / 100
    return n ? `billets de ${fr} francs` : `billet de ${fr} francs`
  }
  if (cents >= 100) {
    const fr = cents / 100
    const unit = fr > 1 ? 'francs' : 'franc'
    return n ? `pièces de ${fr} ${unit}` : `pièce de ${fr} ${unit}`
  }
  return n ? `pièces de ${cents} centimes` : `pièce de ${cents} centimes`
}

export function describeSwissChange(amountFr: number): { parts: ChangePart[]; sentence: string } {
  if (amountFr < 0) return { parts: [], sentence: 'Le billet ne suffit pas pour payer.' }
  const parts = swissChange(amountFr)
  if (parts.length === 0) return { parts: [], sentence: 'On ne rend rien.' }
  const bits = parts.map((part) => `${part.count} ${pieceName(part.cents, part.count)}`)
  const list = bits.length === 1 ? bits[0]! : `${bits.slice(0, -1).join(', ')} et ${bits[bits.length - 1]}`
  const covered = parts.reduce((sum, part) => sum + part.cents * part.count, 0)
  const left = Math.round(amountFr * 100) - covered
  const rest = left > 0 ? ` Il reste ${left} centime${left > 1 ? 's' : ''}.` : ''
  return { parts, sentence: `On rend ${francs(amountFr)} francs : ${list}.${rest}` }
}
