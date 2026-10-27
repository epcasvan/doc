import type { InstitutionalHeader } from '@/components/math/PrintDocumentChrome'
import type { Domain, PageConfig } from '@/math/types'

/** Recette qui reproduit la fiche imprimée : config, graine, en-tête, points. */
export type FicheRecipe = {
  version: 1
  pages: PageConfig[]
  seed: number
  institutional: InstitutionalHeader
  evalMode: boolean
  pointsPerQuestion: number
  libreMode: boolean
  libreSnapshot: PageConfig[] | null
  /** Livre complet : la graine reconstruit toutes les lettres. */
  bookKind?: 'alpha' | 'soutien'
}

export type SavedFiche = {
  id: string
  name: string
  domains: Domain[]
  createdAt: string
  updatedAt: string
  recipe: FicheRecipe
}

export type StagedFiche = {
  id: string
  name: string
  recipe: FicheRecipe
}

const HISTORY_KEY = 'clairfleFiche'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isPage(value: unknown): value is PageConfig {
  if (!isRecord(value)) return false
  return typeof value.domain === 'string' && typeof value.exerciseType === 'string'
}

/**
 * Ancien code du test principal (`tcm` → `tpm`).
 * TCM CSC et TCM CFR restent `tcm-csc` / `tcm-cfr`.
 */
export function migrateTpmToken(value: string): string {
  if (value === 'tpm-csc' || value.startsWith('tpm-csc-') || value.startsWith('tpm-csc_')) {
    return `tcm${value.slice(3)}`
  }
  if (value === 'tpm-cfr' || value.startsWith('tpm-cfr-') || value.startsWith('tpm-cfr_')) {
    return `tcm${value.slice(3)}`
  }
  if (value === 'tcm_csc') return 'tcm-csc'
  if (value === 'tcm_cfr') return 'tcm-cfr'
  if (
    value === 'tcm-csc' ||
    value.startsWith('tcm-csc-') ||
    value.startsWith('tcm-csc_') ||
    value === 'tcm-cfr' ||
    value.startsWith('tcm-cfr-') ||
    value.startsWith('tcm-cfr_')
  ) {
    return value
  }
  if (value === 'tcm' || value.startsWith('tcm-') || value.startsWith('tcm_')) {
    return `tpm${value.slice(3)}`
  }
  return value
}

function migratePage(page: PageConfig): PageConfig {
  const extra = page.extraBlocks?.map((block) => ({
    ...block,
    topic: migrateTpmToken(block.topic),
    exerciseType: migrateTpmToken(block.exerciseType),
  }))
  return {
    ...page,
    domain: migrateTpmToken(page.domain) as Domain,
    topic: migrateTpmToken(page.topic),
    exerciseType: migrateTpmToken(page.exerciseType),
    extraBlocks: extra,
  }
}

export function parseFicheRecipe(value: unknown): FicheRecipe | null {
  if (!isRecord(value) || value.version !== 1) return null
  if (!Array.isArray(value.pages) || value.pages.length === 0 || value.pages.length > 60) return null
  if (!value.pages.every(isPage)) return null
  if (typeof value.seed !== 'number' || !Number.isFinite(value.seed)) return null
  if (!isRecord(value.institutional)) return null
  if (typeof value.evalMode !== 'boolean') return null
  if (typeof value.pointsPerQuestion !== 'number' || !Number.isFinite(value.pointsPerQuestion)) {
    return null
  }
  if (typeof value.libreMode !== 'boolean') return null
  if (value.libreSnapshot !== null) {
    if (!Array.isArray(value.libreSnapshot) || !value.libreSnapshot.every(isPage)) return null
  }
  const pages = (value.pages as PageConfig[]).map(migratePage)
  const snapshot = (value.libreSnapshot as PageConfig[] | null) ?? null
  return {
    version: 1,
    pages,
    seed: value.seed,
    institutional: value.institutional as InstitutionalHeader,
    evalMode: value.evalMode,
    pointsPerQuestion: value.pointsPerQuestion,
    libreMode: value.libreMode,
    libreSnapshot: snapshot ? snapshot.map(migratePage) : null,
    bookKind: value.bookKind === 'alpha' || value.bookKind === 'soutien' ? value.bookKind : undefined,
  }
}

export function parseStagedFiche(value: unknown): StagedFiche | null {
  if (!isRecord(value)) return null
  if (typeof value.id !== 'string' || typeof value.name !== 'string') return null
  const recipe = parseFicheRecipe(value.recipe)
  if (!recipe) return null
  return { id: value.id, name: value.name, recipe }
}

export function buildFicheRecipe(input: {
  pages: PageConfig[]
  seed: number
  institutional: InstitutionalHeader
  evalMode: boolean
  pointsPerQuestion: number
  libreMode: boolean
  libreSnapshot: PageConfig[] | null
  bookKind?: 'alpha' | 'soutien'
}): FicheRecipe {
  return { version: 1, ...input }
}

export function domainsOfPages(pages: readonly { domain?: string }[]): Domain[] {
  const domains: Domain[] = []
  for (const page of pages) {
    const domain = page.domain
    if (!domain || domains.includes(domain as Domain)) continue
    domains.push(domain as Domain)
  }
  return domains
}

/** Ouvre le générateur avec cette fiche dans l’historique de navigation. */
export function stageFicheNavigation(fiche: StagedFiche) {
  window.history.pushState({ [HISTORY_KEY]: fiche }, '', '/generateur')
}

export function readStagedFiche(): StagedFiche | null {
  if (typeof window === 'undefined') return null
  const state = window.history.state
  if (!isRecord(state)) return null
  return parseStagedFiche(state[HISTORY_KEY])
}

export function rememberFicheOnHistory(fiche: StagedFiche) {
  const current = isRecord(window.history.state) ? window.history.state : {}
  window.history.replaceState({ ...current, [HISTORY_KEY]: fiche }, '', window.location.pathname)
}
