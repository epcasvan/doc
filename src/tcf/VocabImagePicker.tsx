import { useEffect, useMemo, useRef, useState } from 'react'
import { VOCAB_IMAGE_THEMES } from '@/jeux/vocab-images'
import { tcfImageSrc } from './media'

type VocabHit = { label: string; src: string; theme: string }

function norm(s: string) {
  return s
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim()
}

const ALL_WORDS: VocabHit[] = VOCAB_IMAGE_THEMES.flatMap((theme) =>
  theme.words.map((w) => ({ label: w.label, src: w.src, theme: theme.label })),
)

/**
 * Fenêtre de recherche d’images vocabulaire : tapez un mot → chemin
 * `/lib/images/vocabulaire/…` + aperçu.
 */
export function VocabImagePicker({
  open,
  onClose,
  onPick,
}: {
  open: boolean
  onClose: () => void
  onPick: (src: string) => void
}) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!open) return
    setQuery('')
    const t = window.setTimeout(() => inputRef.current?.focus(), 0)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(t)
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  const hits = useMemo(() => {
    const q = norm(query)
    if (!q) return ALL_WORDS.slice(0, 48)
    const scored: { hit: VocabHit; score: number }[] = []
    for (const hit of ALL_WORDS) {
      const label = norm(hit.label)
      const slug = norm(hit.src.split('/').pop()?.replace(/\.webp$/i, '') ?? '')
      let score = 0
      if (label === q || slug === q) score = 100
      else if (label.startsWith(q) || slug.startsWith(q)) score = 80
      else if (label.includes(q) || slug.includes(q)) score = 50
      else if (norm(hit.theme).includes(q)) score = 20
      if (score) scored.push({ hit, score })
    }
    scored.sort((a, b) => b.score - a.score || a.hit.label.localeCompare(b.hit.label, 'fr'))
    return scored.slice(0, 80).map((s) => s.hit)
  }, [query])

  if (!open) return null

  return (
    <div className="tcf-vocab-picker-backdrop" role="presentation" onClick={onClose}>
      <div
        className="tcf-vocab-picker"
        role="dialog"
        aria-modal="true"
        aria-label="Choisir une image vocabulaire"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="tcf-vocab-picker-head">
          <strong>Rechercher une image</strong>
          <button type="button" className="tcf-btn" onClick={onClose}>
            Fermer
          </button>
        </header>
        <input
          ref={inputRef}
          className="pill-input tcf-vocab-picker-search"
          type="search"
          value={query}
          placeholder="Mot (ex. sushi, vélo, pluie…)"
          onChange={(e) => setQuery(e.target.value)}
        />
        <ul className="tcf-vocab-picker-list">
          {hits.map((hit) => {
            const src = tcfImageSrc(hit.src)
            return (
              <li key={hit.src}>
                <button
                  type="button"
                  className="tcf-vocab-picker-item"
                  onClick={() => {
                    onPick(hit.src)
                    onClose()
                  }}
                >
                  <span className="tcf-vocab-picker-thumb">
                    {src ? <img src={src} alt="" /> : null}
                  </span>
                  <span className="tcf-vocab-picker-meta">
                    <span className="tcf-vocab-picker-label">{hit.label}</span>
                    <span className="tcf-vocab-picker-path">{hit.src}</span>
                    <span className="tcf-vocab-picker-theme">{hit.theme}</span>
                  </span>
                </button>
              </li>
            )
          })}
          {hits.length === 0 ? (
            <li className="tcf-vocab-picker-empty">Aucun mot ne correspond.</li>
          ) : null}
        </ul>
      </div>
    </div>
  )
}
