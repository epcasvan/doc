import { hasAccessCookie } from '@/access'

export type AppRoute = 'landing' | 'access' | 'generator' | 'fiches'

export function pathFromLocation(): AppRoute {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  if (path === '/generateur') return 'generator'
  if (path === '/fiches') return 'fiches'
  if (path === '/acces') return 'access'
  return 'landing'
}

export function navigateTo(path: string) {
  if (window.location.pathname !== path) {
    window.history.pushState({}, '', path)
  }
}

export function resolveRoute(): AppRoute {
  const initial = pathFromLocation()
  if ((initial === 'generator' || initial === 'fiches') && !hasAccessCookie()) {
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', '/acces')
    }
    return 'access'
  }
  if (initial === 'access' && hasAccessCookie()) {
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', '/generateur')
    }
    return 'generator'
  }
  return initial
}
