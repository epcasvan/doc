/**
 * Familles d’unités pour conversions (TCM ex. 35, conversions longueur…).
 * Chaque unité a un facteur vers l’unité de base de la famille.
 */
export type ConvertFamily =
  | 'poids'
  | 'litre'
  | 'densite'
  | 'longueur'
  | 'aire'
  | 'volume'
  | 'temps'

export type ConvertFamilyDef = {
  id: ConvertFamily
  label: string
  units: readonly string[]
  /** Facteur : 1 unité = factor × unité de base. */
  factor: Record<string, number>
}

/** Chaînes scolaires complètes (base = plus petite unité de la liste). */
export const CONVERT_FAMILIES: readonly ConvertFamilyDef[] = [
  {
    id: 'poids',
    label: 'Poids',
    units: ['t', 'kg', 'hg', 'dag', 'g', 'dg', 'cg', 'mg'],
    // base = mg
    factor: {
      t: 1_000_000_000,
      kg: 1_000_000,
      hg: 100_000,
      dag: 10_000,
      g: 1000,
      dg: 100,
      cg: 10,
      mg: 1,
    },
  },
  {
    id: 'litre',
    label: 'Litre',
    units: ['kL', 'hL', 'daL', 'L', 'dL', 'cL', 'mL'],
    // base = mL
    factor: {
      kL: 1_000_000,
      hL: 100_000,
      daL: 10_000,
      L: 1000,
      dL: 100,
      cL: 10,
      mL: 1,
    },
  },
  {
    id: 'densite',
    label: 'Densité',
    units: ['kg/m³', 'g/L', 'kg/L', 'g/cm³'],
    // base = kg/m³ (1 g/cm³ = 1000 kg/m³ ; 1 kg/L = 1000 kg/m³ ; 1 g/L = 1 kg/m³)
    factor: {
      'kg/m³': 1,
      'g/L': 1,
      'kg/L': 1000,
      'g/cm³': 1000,
    },
  },
  {
    id: 'longueur',
    label: 'Longueur',
    units: ['km', 'hm', 'dam', 'm', 'dm', 'cm', 'mm'],
    // base = mm
    factor: {
      km: 1_000_000,
      hm: 100_000,
      dam: 10_000,
      m: 1000,
      dm: 100,
      cm: 10,
      mm: 1,
    },
  },
  {
    id: 'aire',
    label: 'Aire',
    units: ['km²', 'hm²', 'dam²', 'm²', 'dm²', 'cm²', 'mm²'],
    // base = mm² (×100 par pas)
    factor: {
      'km²': 1_000_000_000_000,
      'hm²': 10_000_000_000,
      'dam²': 100_000_000,
      'm²': 1_000_000,
      'dm²': 10_000,
      'cm²': 100,
      'mm²': 1,
    },
  },
  {
    id: 'volume',
    label: 'Volume',
    units: ['km³', 'hm³', 'dam³', 'm³', 'dm³', 'cm³', 'mm³'],
    // base = mm³ (×1000 par pas)
    factor: {
      'km³': 1e18,
      'hm³': 1e15,
      'dam³': 1e12,
      'm³': 1e9,
      'dm³': 1e6,
      'cm³': 1000,
      'mm³': 1,
    },
  },
  {
    id: 'temps',
    label: 'Temps',
    units: ['h', 'min', 's'],
    // base = s
    factor: {
      h: 3600,
      min: 60,
      s: 1,
    },
  },
]

export const CONVERT_FAMILY_OPTIONS = CONVERT_FAMILIES.map((f) => ({
  value: f.id,
  label: f.label,
}))

const BY_ID = Object.fromEntries(CONVERT_FAMILIES.map((f) => [f.id, f])) as Record<
  ConvertFamily,
  ConvertFamilyDef
>

export function convertFamilyDef(id: ConvertFamily): ConvertFamilyDef {
  return BY_ID[id]
}

/** Déduit la famille depuis une unité (from ou to). */
export function inferConvertFamily(from: string, to?: string): ConvertFamily {
  for (const fam of CONVERT_FAMILIES) {
    if (fam.units.includes(from) && (to == null || fam.units.includes(to))) return fam.id
  }
  for (const fam of CONVERT_FAMILIES) {
    if (fam.units.includes(from) || (to != null && fam.units.includes(to))) return fam.id
  }
  return 'longueur'
}

export function unitsForFamily(family: ConvertFamily): readonly string[] {
  return convertFamilyDef(family).units
}

/** Libellés d’affichage (sélecteurs De / Vers) — symbole scolaire + nom si utile. */
const UNIT_LABELS: Record<string, string> = {
  t: 'tonne',
  kg: 'kg',
  hg: 'hg',
  dag: 'dag',
  g: 'g',
  dg: 'dg',
  cg: 'cg',
  mg: 'mg',
  kL: 'kL',
  hL: 'hL',
  daL: 'daL',
  L: 'L',
  dL: 'dL',
  cL: 'cL',
  mL: 'mL',
  km: 'km',
  hm: 'hm',
  dam: 'dam',
  m: 'm',
  dm: 'dm',
  cm: 'cm',
  mm: 'mm',
  'km²': 'km²',
  'hm²': 'hm²',
  'dam²': 'dam²',
  'm²': 'm²',
  'dm²': 'dm²',
  'cm²': 'cm²',
  'mm²': 'mm²',
  'km³': 'km³',
  'hm³': 'hm³',
  'dam³': 'dam³',
  'm³': 'm³',
  'dm³': 'dm³',
  'cm³': 'cm³',
  'mm³': 'mm³',
  'kg/m³': 'kg/m³',
  'g/L': 'g/L',
  'kg/L': 'kg/L',
  'g/cm³': 'g/cm³',
  h: 'h',
  min: 'min',
  s: 's',
}

export function unitOptionLabel(unit: string): string {
  return UNIT_LABELS[unit] ?? unit
}

/** Options De / Vers : toutes les unités de la famille (km→mm, tonne→mg, etc.). */
export function unitSelectOptions(
  family: ConvertFamily,
): Array<{ value: string; label: string }> {
  return unitsForFamily(family).map((u) => ({ value: u, label: unitOptionLabel(u) }))
}

/** Convertit value(from) → to ; null si unités incompatibles. */
export function convertValue(
  value: number,
  from: string,
  to: string,
  family?: ConvertFamily,
): number | null {
  const fam = convertFamilyDef(family ?? inferConvertFamily(from, to))
  const fFrom = fam.factor[from]
  const fTo = fam.factor[to]
  if (fFrom == null || fTo == null || fTo === 0) return null
  return (value * fFrom) / fTo
}

export function formatConvertNumber(n: number): string {
  if (!Number.isFinite(n)) return '0'
  const r = Math.round(n * 1_000_000) / 1_000_000
  if (Math.abs(r - Math.round(r)) < 1e-9) return String(Math.round(r))
  return String(r)
    .replace(/(\.\d*?[1-9])0+$/, '$1')
    .replace(/\.$/, '')
    .replace('.', ',')
}
