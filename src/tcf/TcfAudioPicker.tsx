import { useEffect, useMemo, useRef, useState } from 'react'
import type { TcfAudioEntry } from './audio-bank'
import { tcfAudioSrc } from './media'

function norm(s: string) {
  return s
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim()
}

/**
 * Fenêtre de recherche d’audios CO de la banque : scène, thème ou fichier.
 * La sélection charge l’exercice associé (questions + transcription).
 */
export function TcfAudioPicker({
  open,
  entries,
  onClose,
  onPick,
}: {
  open: boolean
  entries: TcfAudioEntry[]
  onClose: () => void
  onPick: (entry: TcfAudioEntry) => void
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
    if (!q) return entries.slice(0, 60)
    const scored: { entry: TcfAudioEntry; score: number }[] = []
    for (const entry of entries) {
      const label = norm(entry.label)
      const meta = norm(entry.meta)
      const path = norm(entry.audio)
      const stem = norm(entry.audio.split('/').pop() ?? '')
      let score = 0
      if (label === q || stem === q) score = 100
      else if (label.startsWith(q) || stem.startsWith(q)) score = 80
      else if (label.includes(q) || stem.includes(q) || path.includes(q) || meta.includes(q)) score = 50
      if (score) scored.push({ entry, score })
    }
    scored.sort((a, b) => b.score - a.score || a.entry.label.localeCompare(b.entry.label, 'fr'))
    return scored.slice(0, 80).map((s) => s.entry)
  }, [entries, query])

  if (!open) return null

  return (
    <div className="tcf-vocab-picker-backdrop" role="presentation" onClick={onClose}>
      <div
        className="tcf-vocab-picker"
        role="dialog"
        aria-modal="true"
        aria-label="Choisir un audio"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="tcf-vocab-picker-head">
          <strong>Rechercher un audio</strong>
          <button type="button" className="tcf-btn" onClick={onClose}>
            Fermer
          </button>
        </header>
        <input
          ref={inputRef}
          className="pill-input tcf-vocab-picker-search"
          type="search"
          value={query}
          placeholder="Scène, thème ou fichier (ex. plage, 047, message-1…)"
          onChange={(e) => setQuery(e.target.value)}
        />
        <p className="tcf-vocab-picker-theme" style={{ margin: 0 }}>
          En choisissant un audio, les questions et la transcription de cet exercice sont chargées.
        </p>
        <ul className="tcf-vocab-picker-list">
          {hits.map((entry) => {
            const src = tcfAudioSrc(entry.audio)
            return (
              <li key={`${entry.exercise.id}:${entry.audio}`}>
                <button
                  type="button"
                  className="tcf-vocab-picker-item is-audio"
                  onClick={() => {
                    onPick(entry)
                    onClose()
                  }}
                >
                  <span className="tcf-vocab-picker-meta">
                    <span className="tcf-vocab-picker-label">{entry.label}</span>
                    <span className="tcf-vocab-picker-path">{entry.audio}</span>
                    <span className="tcf-vocab-picker-theme">{entry.meta}</span>
                  </span>
                  {src ? (
                    <audio
                      className="tcf-audio-picker-preview"
                      controls
                      preload="none"
                      src={src}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : null}
                </button>
              </li>
            )
          })}
          {hits.length === 0 ? <li className="tcf-vocab-picker-empty">Aucun audio ne correspond.</li> : null}
        </ul>
      </div>
    </div>
  )
}
