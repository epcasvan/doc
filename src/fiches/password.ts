const PASSWORD_KEY = 'clairfle-fiche-sync'

export function readAccessPassword(): string | null {
  try {
    const value = window.localStorage.getItem(PASSWORD_KEY)
    return value && value.trim() ? value : null
  } catch {
    return null
  }
}

export function rememberAccessPassword(password: string) {
  const value = password.trim()
  if (!value) return
  try {
    window.localStorage.setItem(PASSWORD_KEY, value)
  } catch {
    /* ignore */
  }
}

export function clearAccessPassword() {
  try {
    window.localStorage.removeItem(PASSWORD_KEY)
  } catch {
    /* ignore */
  }
}
