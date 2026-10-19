import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { ACCESS_DOMAIN_OPTIONS, domainsForAccount, readAccessAccount } from '@/access'
import { Header } from '@/components/generator/Header'
import { SelectBox } from '@/components/generator/SelectBox'
import { DEFAULT_INSTITUTIONAL } from '@/components/math/PrintDocumentChrome'
import { BookStudio, type BookRequest } from '@/livres/BookStudio'
import {
  deleteFiche,
  FichesApiError,
  fichesApiConfigured,
  listFiches,
  storeSyncPassword,
} from '@/fiches/api'
import { readAccessPassword } from '@/fiches/password'
import { stageFicheNavigation, type SavedFiche } from '@/fiches/recipe'
import type { Domain } from '@/math/types'

type Library = 'fiches' | 'tcf' | 'tpm' | 'alpha' | 'soutien'

const TPM_DOMAINS = new Set<Domain>(['tpm', 'tcm-csc', 'tcm-cfr'])

function ficheLibrary(fiche: SavedFiche): Library {
  if (fiche.recipe.bookKind === 'alpha' || fiche.recipe.bookKind === 'soutien') return fiche.recipe.bookKind
  const domains = fiche.domains
  if (domains.length > 0 && domains.every((domain) => domain === 'tcf')) return 'tcf'
  if (domains.length > 0 && domains.every((domain) => TPM_DOMAINS.has(domain))) return 'tpm'
  return 'fiches'
}

function domainLabel(domain: string): string {
  return ACCESS_DOMAIN_OPTIONS.find((option) => option.id === domain)?.label ?? domain
}

function formatUpdated(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('fr-CH', { day: 'numeric', month: 'long', year: 'numeric' })
}

function emptyCopy(library: Library, fiches: SavedFiche[], query: string): string {
  const hasAny = fiches.some((fiche) => ficheLibrary(fiche) === library)
  const searching = query.trim().length > 0 || hasAny
  if (library === 'alpha' || library === 'soutien') {
    return searching ? 'Aucun livre ne correspond à la recherche.' : 'Aucun livre enregistré pour le moment.'
  }
  if (library === 'tcf') {
    return searching ? 'Aucune fiche TCF ne correspond à la recherche.' : 'Aucune fiche TCF enregistrée pour le moment.'
  }
  if (library === 'tpm') {
    return searching ? 'Aucune fiche TCM ne correspond à la recherche.' : 'Aucune fiche TCM enregistrée pour le moment.'
  }
  return searching ? 'Aucune fiche ne correspond à la recherche.' : 'Aucune fiche enregistrée pour le moment.'
}

export function SavedFichesPage({
  onOpenGenerator,
  onLogout,
}: {
  onOpenGenerator: () => void
  onLogout: () => void
}) {
  const account = readAccessAccount()
  const allowed = useMemo(() => new Set(domainsForAccount(account)), [account])
  const [password, setPassword] = useState('')
  const [unlocked, setUnlocked] = useState(() => Boolean(readAccessPassword()))
  const [configured] = useState(fichesApiConfigured)
  const [fiches, setFiches] = useState<SavedFiche[]>([])
  const [query, setQuery] = useState('')
  const [domainFilter, setDomainFilter] = useState<Domain | 'tous'>('tous')
  const [sort, setSort] = useState<'domaine' | 'nom' | 'date'>('domaine')
  const [library, setLibrary] = useState<Library>('fiches')
  const [bookRequest, setBookRequest] = useState<BookRequest | null>(null)
  const [loading, setLoading] = useState(unlocked && configured)
  const [error, setError] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)
  const [unlockError, setUnlockError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const rows = await listFiches()
      setFiches(rows.filter((fiche) => fiche.domains.every((domain) => allowed.has(domain))))
      setUnlocked(true)
    } catch (caught) {
      if (caught instanceof FichesApiError && (caught.code === 'password' || caught.code === 'unauthorized')) {
        setUnlocked(false)
        setUnlockError(caught.message)
        setError(null)
      } else {
        setError(caught instanceof Error ? caught.message : 'La liste n’a pas pu être chargée.')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!unlocked || !configured) return
    let cancelled = false
    void (async () => {
      setLoading(true)
      setError(null)
      try {
        const rows = await listFiches()
        if (cancelled) return
        setFiches(rows.filter((fiche) => fiche.domains.every((domain) => allowed.has(domain))))
      } catch (caught) {
        if (cancelled) return
        if (caught instanceof FichesApiError && (caught.code === 'password' || caught.code === 'unauthorized')) {
          setUnlocked(false)
          setUnlockError(caught.message)
          setError(null)
        } else {
          setError(caught instanceof Error ? caught.message : 'La liste n’a pas pu être chargée.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [allowed, configured, unlocked])

  const domainOptions = useMemo(() => {
    const present = new Set<Domain>()
    for (const fiche of fiches) {
      if (ficheLibrary(fiche) !== library) continue
      for (const domain of fiche.domains) present.add(domain)
    }
    return ACCESS_DOMAIN_OPTIONS.filter((option) => present.has(option.id))
  }, [fiches, library])

  useEffect(() => {
    if (domainFilter === 'tous') return
    if (!domainOptions.some((option) => option.id === domainFilter)) setDomainFilter('tous')
  }, [domainFilter, domainOptions])

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const rows = fiches.filter((fiche) => {
      const inLibrary = ficheLibrary(fiche) === library
      if (!inLibrary) return false
      const nameOk = !needle || fiche.name.toLowerCase().includes(needle)
      const domainOk =
        library === 'alpha' || library === 'soutien' || domainFilter === 'tous' || fiche.domains.includes(domainFilter)
      return nameOk && domainOk
    })
    rows.sort((a, b) => {
      if (sort === 'date') return b.updatedAt.localeCompare(a.updatedAt)
      if (sort === 'nom') return a.name.localeCompare(b.name, 'fr')
      const byDomain = domainLabel(a.domains[0] ?? '').localeCompare(domainLabel(b.domains[0] ?? ''), 'fr')
      if (byDomain !== 0) return byDomain
      return a.name.localeCompare(b.name, 'fr')
    })
    return rows
  }, [domainFilter, fiches, library, query, sort])

  const chooseLibrary = (next: Library) => {
    setLibrary(next)
    setDomainFilter('tous')
  }

  const unlock = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    storeSyncPassword(password)
    setUnlockError(null)
    setError(null)
    setUnlocked(true)
    setPassword('')
  }

  const openFiche = (fiche: SavedFiche) => {
    stageFicheNavigation({ id: fiche.id, name: fiche.name, recipe: fiche.recipe })
    onOpenGenerator()
  }

  const confirmDelete = async (fiche: SavedFiche) => {
    setError(null)
    try {
      await deleteFiche(fiche.id)
      setFiches((current) => current.filter((item) => item.id !== fiche.id))
      setPendingDelete(null)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'La suppression n’a pas abouti.')
    }
  }

  return (
    <div className="fiches-page">
      <Header
        generator
        showCreate
        onCreate={onOpenGenerator}
        endSlot={
          <button
            className="topbar-icon-btn is-logout"
            type="button"
            aria-label="Se déconnecter"
            title="Se déconnecter"
            onClick={onLogout}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
              <path
                fill="currentColor"
                d="M10 4v2H6v12h4v2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4zm7.6 5.4L15 7l-1.4 1.4 2.6 2.6H10v2h6.2l-2.6 2.6L15 17l2.6-2.6L20.2 12l-2.6-2.6z"
              />
            </svg>
          </button>
        }
      />
      <main className="fiches-main">
        {!configured ? (
          <section className="access-card fiches-card">
            <p className="eyebrow">Fiches enregistrées</p>
            <h1>Synchronisation à brancher</h1>
            <p className="access-lead">
              L’adresse de l’API n’est pas encore indiquée sur ce site. Les fiches pourront être
              enregistrées et retrouvées dès qu’elle le sera.
            </p>
          </section>
        ) : !unlocked ? (
          <form className="access-card fiches-card" onSubmit={unlock}>
            <p className="eyebrow">Fiches enregistrées</p>
            <h1>Synchroniser les fiches</h1>
            <p className="access-lead">Saisissez votre mot de passe pour afficher les fiches enregistrées.</p>
            <label className="access-field">
              <span>Mot de passe</span>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoFocus
              />
            </label>
            {unlockError ? (
              <p className="access-error" role="alert">
                {unlockError}
              </p>
            ) : null}
            <button className="button full" type="submit">
              Afficher les fiches
            </button>
          </form>
        ) : (
          <section className="fiches-panel">
            <header className="fiches-intro">
              <p className="eyebrow">Bibliothèque</p>
              <h1>Fiches enregistrées</h1>
              <p className="access-lead">
                {library === 'alpha' || library === 'soutien'
                  ? 'Retrouvez un livre déjà généré et enregistrez à nouveau son dossier.'
                  : 'Ouvrez une fiche pour retrouver la même configuration, puis imprimez-la.'}
              </p>
            </header>
            <div className="mode-toggle is-tabs fiches-libraries" role="tablist" aria-label="Bibliothèque">
              <button type="button" className={library === 'fiches' ? 'active' : ''} onClick={() => chooseLibrary('fiches')}>
                Fiches
              </button>
              <button type="button" className={library === 'tcf' ? 'active' : ''} onClick={() => chooseLibrary('tcf')}>
                TCF
              </button>
              <button type="button" className={library === 'tpm' ? 'active' : ''} onClick={() => chooseLibrary('tpm')}>
                TCM
              </button>
              <button type="button" className={library === 'alpha' ? 'active' : ''} onClick={() => chooseLibrary('alpha')}>
                Alpha
              </button>
              <button type="button" className={library === 'soutien' ? 'active' : ''} onClick={() => chooseLibrary('soutien')}>
                Soutien
              </button>
            </div>
            <div className="fiches-toolbar">
              <label className="access-field fiches-search">
                <span>Rechercher une fiche</span>
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Saisissez quelques lettres du nom"
                />
              </label>
              <SelectBox
                label="Domaine"
                value={domainFilter}
                onChange={(value) => setDomainFilter(value as Domain | 'tous')}
              >
                <option value="tous">Tous les domaines</option>
                {domainOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </SelectBox>
              <SelectBox
                label="Trier"
                value={sort}
                onChange={(value) => setSort(value as 'domaine' | 'nom' | 'date')}
              >
                <option value="domaine">Domaine</option>
                <option value="nom">Nom</option>
                <option value="date">Date</option>
              </SelectBox>
            </div>
            {error ? (
              <p className="access-error" role="alert">
                {error}{' '}
                <button className="text-link" type="button" onClick={() => void load()}>
                  Réessayer
                </button>
              </p>
            ) : null}
            {loading ? <p className="fiches-empty">Chargement des fiches…</p> : null}
            {!loading && visible.length === 0 ? (
              <p className="fiches-empty">
                {emptyCopy(library, fiches, query)}
              </p>
            ) : null}
            <ul className="fiches-list">
              {visible.map((fiche) => (
                <li key={fiche.id} className="fiches-row">
                  <div className="fiches-row-text">
                    <strong>{fiche.name}</strong>
                    <span>
                      {fiche.domains.map(domainLabel).join(' · ')}
                      {formatUpdated(fiche.updatedAt) ? ` — ${formatUpdated(fiche.updatedAt)}` : ''}
                    </span>
                  </div>
                  <div className="fiches-row-actions">
                    {pendingDelete === fiche.id ? (
                      <>
                        <button className="button small" type="button" onClick={() => void confirmDelete(fiche)}>
                          Supprimer
                        </button>
                        <button className="topbar-text-btn" type="button" onClick={() => setPendingDelete(null)}>
                          Annuler
                        </button>
                      </>
                    ) : (
                      <>
                        {library === 'alpha' || library === 'soutien' ? (
                          <button
                            className="button small"
                            type="button"
                            onClick={() =>
                              setBookRequest({
                                kind: library,
                                seed: fiche.recipe.seed,
                                institutional: { ...DEFAULT_INSTITUTIONAL, ...fiche.recipe.institutional },
                                evalMode: fiche.recipe.evalMode,
                                pointsPerQuestion: fiche.recipe.pointsPerQuestion,
                                saveCopy: false,
                              })
                            }
                          >
                            Enregistrer le dossier
                          </button>
                        ) : (
                          <button className="button small" type="button" onClick={() => openFiche(fiche)}>
                            Ouvrir
                          </button>
                        )}
                        <button className="topbar-text-btn" type="button" onClick={() => setPendingDelete(fiche.id)}>
                          Supprimer
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
      <BookStudio request={bookRequest} onClose={() => setBookRequest(null)} />
    </div>
  )
}
