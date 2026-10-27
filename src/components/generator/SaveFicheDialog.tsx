import { useEffect, useId, useState, type FormEvent } from 'react'
import { readAccessPassword } from '@/fiches/password'

export function SaveFicheDialog({
  initialName,
  canUpdate,
  onClose,
  onSubmit,
}: {
  initialName: string
  canUpdate: boolean
  onClose: () => void
  onSubmit: (input: { name: string; asNew: boolean; password: string }) => Promise<void>
}) {
  const titleId = useId()
  const [name, setName] = useState(initialName)
  const [password, setPassword] = useState('')
  const [needsPassword, setNeedsPassword] = useState(() => !readAccessPassword())
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [busy, onClose])

  const submit = async (asNew: boolean) => {
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Donnez un nom à la fiche.')
      return
    }
    if (needsPassword && !password.trim()) {
      setError('Saisissez votre mot de passe pour synchroniser les fiches.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await onSubmit({ name: trimmed, asNew, password: password.trim() })
      onClose()
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'L’enregistrement n’a pas abouti. Réessayez.'
      setError(message)
      if (!readAccessPassword()) setNeedsPassword(true)
    } finally {
      setBusy(false)
    }
  }

  const onFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void submit(!canUpdate)
  }

  return (
    <div className="save-fiche-backdrop" role="presentation" onClick={() => { if (!busy) onClose() }}>
      <form
        className="save-fiche-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
        onSubmit={onFormSubmit}
      >
        <button
          className="topbar-icon-btn save-fiche-close"
          type="button"
          aria-label="Fermer"
          title="Fermer"
          disabled={busy}
          onClick={onClose}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
            <path
              fill="currentColor"
              d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3l6.3 6.3 6.3-6.3 1.4 1.4z"
            />
          </svg>
        </button>
        <h2 id={titleId}>Enregistrer la fiche</h2>
        <p className="save-fiche-lead">
          Le nom, les pages, les exercices et les nombres seront repris à l’identique.
        </p>
        <label className="access-field">
          <span>Nom de la fiche</span>
          <input
            value={name}
            onChange={(event) => {
              setName(event.target.value)
              if (error) setError(null)
            }}
            maxLength={80}
            required
            autoFocus
            placeholder="Saisissez le nom de la fiche"
          />
        </label>
        {needsPassword ? (
          <label className="access-field">
            <span>Mot de passe</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
        ) : null}
        {error ? (
          <p className="access-error" role="alert">
            {error}
          </p>
        ) : null}
        <div className="save-fiche-actions">
          {canUpdate ? (
            <button className="button full" type="button" disabled={busy} onClick={() => void submit(false)}>
              Mettre à jour
            </button>
          ) : (
            <button
              className="topbar-icon-btn save-fiche-save"
              type="submit"
              disabled={busy}
              aria-label="Enregistrer"
              title="Enregistrer"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
                <path
                  fill="currentColor"
                  d="M17 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7l-4-4zm-5 16a3 3 0 1 1 0-6 3 3 0 0 1 0 6zM15 5v4H7V5h8z"
                />
              </svg>
            </button>
          )}
          {canUpdate ? (
            <button className="button secondary full" type="button" disabled={busy} onClick={() => void submit(true)}>
              Enregistrer une nouvelle fiche
            </button>
          ) : null}
        </div>
      </form>
    </div>
  )
}
