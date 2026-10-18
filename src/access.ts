import type { Domain } from '@/math/types'

/**
 * Comptes d’accès (le mot de passe détermine le rôle).
 * - admin  ← VITE_ACCESS_ADMIN  (ex. jesuisleboss)
 * - full   ← VITE_ACCESS_FULL   (ex. jebosseplus)
 * - partial← VITE_ACCESS_PARTIAL (ex. synecom)
 */
export type AccessAccount = 'admin' | 'full' | 'partial'

/**
 * Domaines « réguliers » — ordre alphabétique par libellé.
 * (Les tests TCF / TCM CSC / TCM CFR / TPM sont pinés en bas de liste.)
 */
export const REGULAR_DOMAIN_OPTIONS: readonly { id: Domain; label: string }[] = [
  { id: 'acm', label: 'ACM' },
  { id: 'algèbre', label: 'Algèbre' },
  { id: 'alphabetisation', label: 'Alphabétisation' },
  { id: 'calligraphie', label: 'Calligraphie' },
  { id: 'gattegno', label: 'Gattegno' },
  { id: 'géométrie', label: 'Géométrie' },
  { id: 'grammaire', label: 'Grammaire' },
  { id: 'jeux', label: 'Grilles de cartes' },
  { id: 'santé', label: 'Sciences et santé' },
  { id: 'société', label: 'Société' },
  { id: 'soutien-fr', label: 'Soutien FR' },
  { id: 'vocabulaire', label: 'Vocabulaire' },
]

/**
 * Domaines réservés au compte admin (tests).
 * Ordre d’affichage exact : tcf → tcm-csc → tcm-cfr → tpm.
 */
export const ADMIN_ONLY_DOMAIN_OPTIONS: readonly { id: Domain; label: string }[] = [
  { id: 'tcf', label: 'TCF' },
  { id: 'tcm-csc', label: 'TCM CSC' },
  { id: 'tcm-cfr', label: 'TCM CFR' },
  { id: 'tpm', label: 'TPM' },
]

export const ADMIN_ONLY_DOMAINS: readonly Domain[] = ADMIN_ONLY_DOMAIN_OPTIONS.map((d) => d.id)

/** Tous les domaines sélectionnables (ordre d’affichage final). */
export const ACCESS_DOMAIN_OPTIONS: readonly { id: Domain; label: string }[] = [
  ...REGULAR_DOMAIN_OPTIONS,
  ...ADMIN_ONLY_DOMAIN_OPTIONS,
]

const REGULAR_DOMAIN_IDS: Domain[] = REGULAR_DOMAIN_OPTIONS.map((d) => d.id)
const ALL_DOMAIN_IDS: Domain[] = ACCESS_DOMAIN_OPTIONS.map((d) => d.id)

/** Alias ASCII / variantes acceptées dans les listes d’env. */
const DOMAIN_ALIASES: Readonly<Record<string, Domain>> = {
  algebre: 'algèbre',
  geometrie: 'géométrie',
  francais: 'français',
  societe: 'société',
  sante: 'santé',
  lecture: 'alphabetisation',
  alphabetization: 'alphabetisation',
  tcm_csc: 'tcm-csc',
  tcm_cfr: 'tcm-cfr',
  tpm_csc: 'tcm-csc',
  tpm_cfr: 'tcm-cfr',
  'tpm-csc': 'tcm-csc',
  'tpm-cfr': 'tcm-cfr',
  tcm: 'tpm',
}

const ACCESS_COOKIE = 'clairfle-fiche-access'
const ACCESS_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

function envString(key: keyof ImportMetaEnv, fallback: string): string {
  const raw = import.meta.env[key]
  return typeof raw === 'string' && raw.trim() ? raw.trim() : fallback
}

function passwordMap(): Readonly<Record<string, AccessAccount>> {
  const admin = envString('VITE_ACCESS_ADMIN', 'jesuisleboss')
  const full = envString('VITE_ACCESS_FULL', 'jebosseplus')
  const partial = envString('VITE_ACCESS_PARTIAL', 'synecom')
  return {
    [admin]: 'admin',
    [full]: 'full',
    [partial]: 'partial',
  }
}

function resolveDomainToken(raw: string): Domain | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  if (ALL_DOMAIN_IDS.includes(trimmed as Domain)) return trimmed as Domain
  const lower = trimmed.toLowerCase()
  if (ALL_DOMAIN_IDS.includes(lower as Domain)) return lower as Domain
  const aliased = DOMAIN_ALIASES[lower]
  return aliased ?? null
}

function parseDomainList(raw: string | undefined, fallback: Domain[]): Domain[] {
  if (!raw?.trim()) return [...fallback]
  const parts = raw
    .split(/[,;|]/)
    .map((part) => part.trim())
    .filter(Boolean)
  const domains: Domain[] = []
  const seen = new Set<Domain>()
  for (const part of parts) {
    const domain = resolveDomainToken(part)
    if (!domain || seen.has(domain)) continue
    seen.add(domain)
    domains.push(domain)
  }
  return domains.length > 0 ? domains : [...fallback]
}

/**
 * Domaines FULL / PARTIAL.
 * - **full** : toujours tous les domaines réguliers du catalogue (alphabetisation,
 *   grammaire, acm…), même si `VITE_ACCESS_DOMAINS_FULL` est une ancienne liste
 *   incomplète. Jamais TCF / TPM / TCM CSC / TCM CFR.
 * - **partial** : liste env (défaut algèbre + géométrie) ; admin-only filtrés.
 */
function domainsFromEnv(account: 'full' | 'partial'): Domain[] {
  if (account === 'full') {
    return [...REGULAR_DOMAIN_IDS]
  }
  const list = parseDomainList(import.meta.env.VITE_ACCESS_DOMAINS_PARTIAL, [
    'algèbre',
    'géométrie',
  ])
  return list.filter((d) => !ADMIN_ONLY_DOMAINS.includes(d))
}

/**
 * Admin : tous les domaines du catalogue (réguliers + tests).
 * Si `VITE_ACCESS_DOMAINS_ADMIN` est défini, on fait l’union avec le catalogue
 * pour ne pas oublier un domaine ajouté récemment (ex. alphabetisation).
 */
function adminDomainsFromEnv(): Domain[] {
  const fromEnv = parseDomainList(import.meta.env.VITE_ACCESS_DOMAINS_ADMIN, [])
  if (fromEnv.length === 0) return [...ALL_DOMAIN_IDS]
  const merged = new Set<Domain>([...ALL_DOMAIN_IDS, ...fromEnv])
  return [...merged]
}

/** Réordonne selon `ACCESS_DOMAIN_OPTIONS` (alpha + pin tests en bas). */
function orderDomains(domains: Domain[]): Domain[] {
  const allowed = new Set(domains)
  return ACCESS_DOMAIN_OPTIONS.map((d) => d.id).filter((id) => allowed.has(id))
}

export function resolveAccountFromPassword(password: string): AccessAccount | null {
  const key = password.trim()
  return passwordMap()[key] ?? null
}

export function readAccessAccount(): AccessAccount | null {
  if (typeof document === 'undefined') return null
  for (const part of document.cookie.split(';')) {
    const trimmed = part.trim()
    if (!trimmed.startsWith(`${ACCESS_COOKIE}=`)) continue
    const value = decodeURIComponent(trimmed.slice(ACCESS_COOKIE.length + 1))
    if (value === '1' || value === 'jebosseplus' || value === 'full') return 'full'
    if (value === 'synecom' || value === 'partial') return 'partial'
    if (value === 'admin') return 'admin'
  }
  return null
}

export function writeAccessAccount(account: AccessAccount) {
  document.cookie = `${ACCESS_COOKIE}=${encodeURIComponent(account)}; path=/; max-age=${ACCESS_COOKIE_MAX_AGE}; SameSite=Lax`
}

export function clearAccessAccount() {
  document.cookie = `${ACCESS_COOKIE}=; path=/; max-age=0; SameSite=Lax`
}

export function hasAccessCookie(): boolean {
  return readAccessAccount() != null
}

/** Domaines autorisés pour le compte connecté (ordre d’affichage). */
export function domainsForAccount(account: AccessAccount | null): Domain[] {
  if (!account) return []
  if (account === 'admin') return orderDomains(adminDomainsFromEnv())
  return orderDomains(domainsFromEnv(account))
}

export function accountCanAccessDomain(account: AccessAccount | null, domain: Domain): boolean {
  if (ADMIN_ONLY_DOMAINS.includes(domain) && account !== 'admin') return false
  return domainsForAccount(account).includes(domain)
}
