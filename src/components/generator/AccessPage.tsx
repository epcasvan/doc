import { useState, type FormEvent } from 'react'
import {
  resolveAccountFromPassword,
  writeAccessAccount,
  type AccessAccount,
} from '@/access'
import { rememberAccessPassword } from '@/fiches/password'
import { Header } from '@/components/generator/Header'

export function AccessPage({ onSuccess }: { onSuccess: (account: AccessAccount) => void }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const account = resolveAccountFromPassword(password)
    if (!account) {
      setError('Mot de passe incorrect. Vérifiez et réessayez.')
      return
    }
    writeAccessAccount(account)
    rememberAccessPassword(password)
    setError(null)
    onSuccess(account)
  }

  return (
    <div className="access-page">
      <Header onCreate={() => undefined} showCreate={false} />
      <main className="access-main">
        <form className="access-card" method="post" action="/acces" autoComplete="on" onSubmit={handleSubmit}>
          <p className="eyebrow">Accès enseignant</p>
          <h1>Ouvrir le générateur</h1>
          <p className="access-lead">Saisissez le mot de passe pour créer vos fiches.</p>
          <label className="access-field">
            <span>Mot de passe</span>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value)
                if (error) setError(null)
              }}
              required
              autoFocus
            />
          </label>
          {error ? (
            <p className="access-error" role="alert">
              {error}
            </p>
          ) : null}
          <button className="button full" type="submit">
            Continuer vers les fiches
          </button>
          <a className="text-link access-back" href="/">
            ← Retour à l’accueil
          </a>
        </form>
      </main>
    </div>
  )
}
