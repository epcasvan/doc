interface D1Prepared {
  bind(...values: unknown[]): D1Prepared
  run(): Promise<unknown>
  all<T>(): Promise<{ results?: T[] }>
  first<T>(): Promise<T | null>
}

interface D1Database {
  prepare(query: string): D1Prepared
}

interface Env {
  DB: D1Database
  ACCESS_ADMIN?: string
  ACCESS_FULL?: string
  ACCESS_PARTIAL?: string
  ACCESS_DOMAINS_PARTIAL?: string
}

type Account = 'admin' | 'full' | 'partial'

const ADMIN_ONLY = new Set(['tcf', 'tcm-csc', 'tcm-cfr', 'tcm'])

const ALL_DOMAINS = [
  'français',
  'algèbre',
  'géométrie',
  'alphabetisation',
  'soutien-fr',
  'gattegno',
  'jeux',
  'calligraphie',
  'grammaire',
  'vocabulaire',
  'société',
  'santé',
  'acm',
  'tcm',
  'tcm-csc',
  'tcm-cfr',
  'tcf',
] as const

const MAX_BODY = 800_000

function corsHeaders(request: Request): Headers {
  const headers = new Headers()
  headers.set('Access-Control-Allow-Origin', request.headers.get('Origin') ?? '*')
  headers.set('Vary', 'Origin')
  headers.set('Access-Control-Allow-Headers', 'Authorization, Content-Type')
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  headers.set('Access-Control-Max-Age', '86400')
  return headers
}

function json(request: Request, status: number, body: unknown): Response {
  const headers = corsHeaders(request)
  headers.set('Content-Type', 'application/json; charset=utf-8')
  return new Response(JSON.stringify(body), { status, headers })
}

function safeEqual(a: string, b: string): boolean {
  const left = new TextEncoder().encode(a)
  const right = new TextEncoder().encode(b)
  if (left.byteLength !== right.byteLength) return false
  return crypto.subtle.timingSafeEqual(left, right)
}

function accountFromPassword(password: string, env: Env): Account | null {
  const pairs: Array<[string | undefined, Account]> = [
    [env.ACCESS_ADMIN, 'admin'],
    [env.ACCESS_FULL, 'full'],
    [env.ACCESS_PARTIAL, 'partial'],
  ]
  for (const [secret, account] of pairs) {
    if (!secret || !password) continue
    if (safeEqual(password, secret)) return account
  }
  return null
}

function bearer(request: Request): string {
  const header = request.headers.get('Authorization') ?? ''
  const match = /^Bearer\s+(\S.*)$/i.exec(header)
  return match?.[1]?.trim() ?? ''
}

function partialDomains(env: Env): Set<string> {
  const raw = env.ACCESS_DOMAINS_PARTIAL?.trim() || 'algèbre,géométrie'
  const domains = raw
    .split(/[,;|]/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0 && !ADMIN_ONLY.has(part))
  return new Set(domains.length > 0 ? domains : ['algèbre', 'géométrie'])
}

function allowedDomains(account: Account, env: Env): Set<string> {
  if (account === 'admin') return new Set(ALL_DOMAINS)
  if (account === 'full') return new Set(ALL_DOMAINS.filter((domain) => !ADMIN_ONLY.has(domain)))
  return partialDomains(env)
}

function canAccess(account: Account, domains: string[], env: Env): boolean {
  if (domains.length === 0) return false
  if (account === 'admin') {
    return domains.every((domain) => domain.length > 0 && domain.length < 40)
  }
  const allowed = allowedDomains(account, env)
  return domains.every((domain) => allowed.has(domain))
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isPage(value: unknown): value is Record<string, unknown> {
  return isRecord(value) && typeof value.domain === 'string' && typeof value.exerciseType === 'string'
}

function parseRecipe(value: unknown): Record<string, unknown> | null {
  if (!isRecord(value) || value.version !== 1) return null
  if (!Array.isArray(value.pages) || value.pages.length === 0 || value.pages.length > 60) return null
  if (!value.pages.every(isPage)) return null
  if (typeof value.seed !== 'number' || !Number.isFinite(value.seed)) return null
  if (!isRecord(value.institutional)) return null
  if (typeof value.evalMode !== 'boolean') return null
  if (typeof value.pointsPerQuestion !== 'number' || !Number.isFinite(value.pointsPerQuestion)) return null
  if (value.pointsPerQuestion < 0 || value.pointsPerQuestion > 1000) return null
  if (typeof value.libreMode !== 'boolean') return null
  if (value.libreSnapshot !== null) {
    if (!Array.isArray(value.libreSnapshot) || value.libreSnapshot.length > 60) return null
    if (!value.libreSnapshot.every(isPage)) return null
  }
  return value
}

function domainsOf(recipe: Record<string, unknown>): string[] {
  const pages = recipe.pages as Array<Record<string, unknown>>
  const domains: string[] = []
  for (const page of pages) {
    const domain = String(page.domain)
    if (!domains.includes(domain)) domains.push(domain)
  }
  return domains
}

function parseName(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const name = value.trim().replace(/\s+/g, ' ')
  if (name.length < 1 || name.length > 80) return null
  return name
}

type FicheRow = {
  id: string
  name: string
  domains: string
  recipe: string
  created_at: string
  updated_at: string
}

function toClient(row: FicheRow) {
  return {
    id: row.id,
    name: row.name,
    domains: JSON.parse(row.domains) as string[],
    recipe: JSON.parse(row.recipe) as unknown,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

async function readBody(request: Request): Promise<{ name: string; recipe: Record<string, unknown> } | Response> {
  const text = await request.text()
  if (text.length > MAX_BODY) {
    return json(request, 413, { error: 'La fiche est trop volumineuse pour être synchronisée.' })
  }
  let body: unknown
  try {
    body = JSON.parse(text)
  } catch {
    return json(request, 400, { error: 'Le contenu envoyé est illisible.' })
  }
  if (!isRecord(body)) return json(request, 400, { error: 'Le contenu envoyé est illisible.' })
  const name = parseName(body.name)
  if (!name) return json(request, 400, { error: 'Donnez un nom à la fiche (80 caractères maximum).' })
  const recipe = parseRecipe(body.recipe)
  if (!recipe) return json(request, 400, { error: 'La configuration de la fiche est incomplète.' })
  return { name, recipe }
}

function isResponse(value: unknown): value is Response {
  return value instanceof Response
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(request) })
    }

    const url = new URL(request.url)
    const parts = url.pathname.split('/').filter(Boolean)

    if (request.method === 'GET' && parts.length === 0) {
      return json(request, 200, { ok: true })
    }

    if (parts[0] !== 'fiches' || parts.length > 2) {
      return json(request, 404, { error: 'Adresse inconnue.' })
    }

    const account = accountFromPassword(bearer(request), env)
    if (!account) return json(request, 401, { error: 'Mot de passe refusé.' })

    try {
      if (request.method === 'GET' && parts.length === 1) {
        const { results } = await env.DB.prepare(
          'SELECT id, name, domains, recipe, created_at, updated_at FROM fiches ORDER BY updated_at DESC',
        ).all<FicheRow>()
        const fiches = (results ?? [])
          .map(toClient)
          .filter((fiche) => canAccess(account, fiche.domains, env))
        return json(request, 200, { fiches })
      }

      if (request.method === 'POST' && parts.length === 1) {
        const parsed = await readBody(request)
        if (isResponse(parsed)) return parsed
        const domains = domainsOf(parsed.recipe)
        if (!canAccess(account, domains, env)) {
          return json(request, 403, { error: 'Ce compte ne peut pas enregistrer cette fiche.' })
        }
        const id = crypto.randomUUID()
        const now = new Date().toISOString()
        await env.DB.prepare(
          'INSERT INTO fiches (id, name, domains, recipe, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        )
          .bind(id, parsed.name, JSON.stringify(domains), JSON.stringify(parsed.recipe), now, now)
          .run()
        return json(request, 201, {
          fiche: {
            id,
            name: parsed.name,
            domains,
            recipe: parsed.recipe,
            createdAt: now,
            updatedAt: now,
          },
        })
      }

      const id = parts[1] ?? ''
      if (!/^[0-9a-f-]{36}$/i.test(id)) {
        return json(request, 400, { error: 'Identifiant de fiche invalide.' })
      }

      const existing = await env.DB.prepare(
        'SELECT id, name, domains, recipe, created_at, updated_at FROM fiches WHERE id = ?',
      )
        .bind(id)
        .first<FicheRow>()

      if (!existing) return json(request, 404, { error: 'Cette fiche n’existe plus.' })
      const existingDomains = JSON.parse(existing.domains) as string[]
      if (!canAccess(account, existingDomains, env)) {
        return json(request, 403, { error: 'Ce compte ne peut pas modifier cette fiche.' })
      }

      if (request.method === 'DELETE') {
        await env.DB.prepare('DELETE FROM fiches WHERE id = ?').bind(id).run()
        return json(request, 200, { ok: true })
      }

      if (request.method === 'PUT') {
        const parsed = await readBody(request)
        if (isResponse(parsed)) return parsed
        const domains = domainsOf(parsed.recipe)
        if (!canAccess(account, domains, env)) {
          return json(request, 403, { error: 'Ce compte ne peut pas enregistrer cette fiche.' })
        }
        const now = new Date().toISOString()
        await env.DB.prepare(
          'UPDATE fiches SET name = ?, domains = ?, recipe = ?, updated_at = ? WHERE id = ?',
        )
          .bind(parsed.name, JSON.stringify(domains), JSON.stringify(parsed.recipe), now, id)
          .run()
        return json(request, 200, {
          fiche: {
            id,
            name: parsed.name,
            domains,
            recipe: parsed.recipe,
            createdAt: existing.created_at,
            updatedAt: now,
          },
        })
      }

      return json(request, 405, { error: 'Méthode refusée.' })
    } catch (error) {
      console.error(error)
      return json(request, 500, { error: 'La synchronisation a échoué. Réessayez.' })
    }
  },
}
