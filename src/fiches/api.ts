import { clearAccessPassword, readAccessPassword, rememberAccessPassword } from '@/fiches/password'
import { parseFicheRecipe, type FicheRecipe, type SavedFiche } from '@/fiches/recipe'
import type { Domain } from '@/math/types'

export class FichesApiError extends Error {
  readonly code: 'config' | 'password' | 'unauthorized' | 'forbidden' | 'network' | 'validation' | 'missing'

  constructor(
    code: FichesApiError['code'],
    message: string,
  ) {
    super(message)
    this.code = code
  }
}

function apiBase(): string {
  const raw = import.meta.env.VITE_FICHES_API_URL
  return typeof raw === 'string' ? raw.trim().replace(/\/+$/, '') : ''
}

export function fichesApiConfigured(): boolean {
  return apiBase().length > 0
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseSaved(value: unknown): SavedFiche | null {
  if (!isRecord(value)) return null
  if (typeof value.id !== 'string' || typeof value.name !== 'string') return null
  if (typeof value.createdAt !== 'string' || typeof value.updatedAt !== 'string') return null
  if (!Array.isArray(value.domains)) return null
  const recipe = parseFicheRecipe(value.recipe)
  if (!recipe) return null
  return {
    id: value.id,
    name: value.name,
    domains: value.domains.filter((domain): domain is Domain => typeof domain === 'string'),
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
    recipe,
  }
}

async function request(path: string, init?: RequestInit): Promise<unknown> {
  const base = apiBase()
  if (!base) {
    throw new FichesApiError(
      'config',
      'La synchronisation n’est pas encore branchée sur ce site.',
    )
  }
  const password = readAccessPassword()
  if (!password) {
    throw new FichesApiError(
      'password',
      'Saisissez votre mot de passe pour synchroniser les fiches.',
    )
  }
  let response: Response
  try {
    response = await fetch(`${base}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${password}`,
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
    })
  } catch {
    throw new FichesApiError(
      'network',
      'La synchronisation est indisponible. Réessayez dans un instant.',
    )
  }
  if (response.status === 401) {
    clearAccessPassword()
    throw new FichesApiError(
      'unauthorized',
      'Le mot de passe n’est pas reconnu par la synchronisation. Saisissez-le à nouveau.',
    )
  }
  if (response.status === 403) {
    throw new FichesApiError('forbidden', 'Ce compte ne peut pas enregistrer cette fiche.')
  }
  if (response.status === 404) {
    throw new FichesApiError('missing', 'Cette fiche n’existe plus.')
  }
  if (response.status === 413) {
    throw new FichesApiError(
      'validation',
      'La fiche est trop volumineuse pour être synchronisée.',
    )
  }
  const text = await response.text()
  const body = text ? (JSON.parse(text) as unknown) : null
  if (!response.ok) {
    const message =
      isRecord(body) && typeof body.error === 'string'
        ? body.error
        : 'L’enregistrement n’a pas abouti. Réessayez.'
    throw new FichesApiError('validation', message)
  }
  return body
}

export async function listFiches(): Promise<SavedFiche[]> {
  const body = await request('/fiches')
  if (!isRecord(body) || !Array.isArray(body.fiches)) return []
  return body.fiches.map(parseSaved).filter((fiche): fiche is SavedFiche => fiche !== null)
}

export async function createFiche(name: string, recipe: FicheRecipe): Promise<SavedFiche> {
  const body = await request('/fiches', {
    method: 'POST',
    body: JSON.stringify({ name, recipe }),
  })
  const saved = isRecord(body) ? parseSaved(body.fiche) : null
  if (!saved) throw new FichesApiError('validation', 'La fiche enregistrée est illisible.')
  return saved
}

export async function updateFiche(id: string, name: string, recipe: FicheRecipe): Promise<SavedFiche> {
  const body = await request(`/fiches/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify({ name, recipe }),
  })
  const saved = isRecord(body) ? parseSaved(body.fiche) : null
  if (!saved) throw new FichesApiError('validation', 'La fiche enregistrée est illisible.')
  return saved
}

export async function deleteFiche(id: string): Promise<void> {
  await request(`/fiches/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export function storeSyncPassword(password: string) {
  rememberAccessPassword(password)
}
