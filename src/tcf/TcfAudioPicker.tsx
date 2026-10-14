import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import type { TcfAudioEntry } from './audio-bank'
import { TCF_SCENARIOS, TCF_SCENARIO_AUTRE, tcfTypeMeta } from './catalog'
import { tcfAudioSrc } from './media'
import { tcfGroupId, tcfScene } from './sources'

function norm(s: string) {
  return s
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim()
}

const SCENARIO_OPTIONS = [...TCF_SCENARIOS, TCF_SCENARIO_AUTRE]

function scenarioOf(entry: TcfAudioEntry): string {
  return tcfGroupId(entry.exercise)
}

function scenarioLabel(id: string): string {
  return SCENARIO_OPTIONS.find((s) => s.id === id)?.label ?? TCF_SCENARIO_AUTRE.label
}

function formatDuration(seconds: number): string {
  const total = Math.round(seconds)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/** Durées déjà lues (par URL), partagées entre ouvertures de la fenêtre. */
const DURATIONS = new Map<string, number | null>()

/** Lit la durée d’un audio quand sa ligne devient visible (métadonnées seulement). */
function useAudioDuration(src: string, target: RefObject<HTMLElement | null>) {
  const [duration, setDuration] = useState<number | null | undefined>(() => DURATIONS.get(src))
  useEffect(() => {
    if (!src || DURATIONS.has(src)) return
    const el = target.current
    if (!el) return
    let audio: HTMLAudioElement | null = null
    const observer = new IntersectionObserver((records) => {
      if (!records.some((r) => r.isIntersecting) || audio) return
      observer.disconnect()
      audio = new Audio()
      audio.preload = 'metadata'
      audio.onloadedmetadata = () => {
        const d = audio && Number.isFinite(audio.duration) ? audio.duration : null
        DURATIONS.set(src, d)
        setDuration(d)
      }
      audio.onerror = () => {
        DURATIONS.set(src, null)
        setDuration(null)
      }
      audio.src = src
    })
    observer.observe(el)
    return () => {
      observer.disconnect()
      if (audio) {
        audio.onloadedmetadata = null
        audio.onerror = null
        audio.removeAttribute('src')
      }
    }
  }, [src, target])
  return DURATIONS.has(src) ? DURATIONS.get(src) : duration
}

function AudioRow({ entry, onPick }: { entry: TcfAudioEntry; onPick: (entry: TcfAudioEntry) => void }) {
  const ref = useRef<HTMLLIElement | null>(null)
  const src = tcfAudioSrc(entry.audio)
  const duration = useAudioDuration(src, ref)
  const ex = entry.exercise
  const type = tcfTypeMeta('CO', ex.type_exercice)?.label ?? ex.type_exercice
  const durationText = duration === undefined ? '…' : duration === null ? '—' : formatDuration(duration)
  return (
    <li ref={ref}>
      <button type="button" className="tcf-vocab-picker-item is-audio" onClick={() => onPick(entry)}>
        <span className="tcf-vocab-picker-meta">
          <span className="tcf-vocab-picker-label">{entry.label}</span>
          <span className="tcf-vocab-picker-theme">
            Type : {type} · Durée : {durationText} · Niveau : {ex.niveau}
          </span>
          <span className="tcf-vocab-picker-theme">
            Scénario : {scenarioLabel(scenarioOf(entry))} · Scène : {tcfScene(ex)}
          </span>
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
}

/**
 * Fenêtre de recherche d’audios CO de la banque (tous niveaux) : scène, thème ou fichier,
 * filtrable par scénario. La sélection charge l’exercice associé (questions + transcription).
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
  const [scenario, setScenario] = useState('')
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

  const scenarios = useMemo(() => {
    const present = new Set(entries.map(scenarioOf))
    return SCENARIO_OPTIONS.filter((s) => present.has(s.id))
  }, [entries])

  const hits = useMemo(() => {
    const pool = scenario ? entries.filter((e) => scenarioOf(e) === scenario) : entries
    const q = norm(query)
    if (!q) return pool
    const scored: { entry: TcfAudioEntry; score: number }[] = []
    for (const entry of pool) {
      const label = norm(entry.label)
      const stem = norm(entry.audio.split('/').pop() ?? '')
      const haystack = norm(
        [entry.meta, entry.audio, tcfScene(entry.exercise), scenarioLabel(scenarioOf(entry)), entry.exercise.niveau].join(
          ' ',
        ),
      )
      let score = 0
      if (label === q || stem === q) score = 100
      else if (label.startsWith(q) || stem.startsWith(q)) score = 80
      else if (label.includes(q) || haystack.includes(q)) score = 50
      if (score) scored.push({ entry, score })
    }
    scored.sort((a, b) => b.score - a.score || a.entry.label.localeCompare(b.entry.label, 'fr', { numeric: true }))
    return scored.map((s) => s.entry)
  }, [entries, query, scenario])

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
        <select
          className="pill-input tcf-vocab-picker-search"
          value={scenario}
          aria-label="Filtrer par scénario"
          onChange={(e) => setScenario(e.target.value)}
        >
          <option value="">Tous les scénarios</option>
          {scenarios.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        <p className="tcf-vocab-picker-theme" style={{ margin: 0 }}>
          {hits.length} audio{hits.length > 1 ? 's' : ''} · En choisissant un audio, les questions et la transcription
          de cet exercice sont chargées.
        </p>
        <ul className="tcf-vocab-picker-list">
          {hits.map((entry) => (
            <AudioRow
              key={`${entry.exercise.id}:${entry.audio}`}
              entry={entry}
              onPick={(picked) => {
                onPick(picked)
                onClose()
              }}
            />
          ))}
          {hits.length === 0 ? <li className="tcf-vocab-picker-empty">Aucun audio ne correspond.</li> : null}
        </ul>
      </div>
    </div>
  )
}
