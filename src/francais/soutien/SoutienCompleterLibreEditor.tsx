import { useId, useRef, useState } from 'react'
import { GAME_IMAGE_ACCEPT, readGameImageFile } from '@/jeux/image'
import type { SoutienComplete } from './banks'
import { soutienImageFor } from './images'

export type SoutienCompleterEntry = {
  id: string
  article: string
  before: string
  blank: string
  after: string
  word: string
  imageSrc?: string
}

export const SOUTIEN_COMPLETER_MAX = 16

function newEntryId(word: string): string {
  const slug = word
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return `soutien-comp-${slug || 'mot'}-${Date.now().toString(36)}`
}

/** Découpe simple : cache le début du mot (première syllabe approx. 2 lettres). */
export function splitWordForBlank(word: string): Pick<SoutienCompleterEntry, 'before' | 'blank' | 'after'> {
  const w = word.trim()
  if (w.length <= 2) return { before: '', blank: w, after: '' }
  const cut = Math.min(3, Math.max(2, Math.floor(w.length / 3)))
  return { before: '', blank: w.slice(0, cut), after: w.slice(cut) }
}

export function defaultSoutienCompleterEntries(
  completes: readonly SoutienComplete[],
): SoutienCompleterEntry[] {
  return completes.slice(0, SOUTIEN_COMPLETER_MAX).map((row, index) => ({
    id: `soutien-comp-bank-${index}-${row.word}`,
    article: row.article,
    before: row.before,
    blank: row.blank,
    after: row.after,
    word: row.word,
    imageSrc: soutienImageFor(row.word),
  }))
}

function entryFromWord(word: string, article: 'Un' | 'Une' = 'Un'): SoutienCompleterEntry {
  const parts = splitWordForBlank(word)
  return {
    id: newEntryId(word),
    article,
    ...parts,
    word: word.trim(),
    imageSrc: soutienImageFor(word),
  }
}

/** Mode libre type 5 : banque du son + ajouts libres (partie cachée choisie). */
export function SoutienCompleterLibreEditor({
  entries,
  onChange,
  suggestedWords,
  max = SOUTIEN_COMPLETER_MAX,
}: {
  entries: SoutienCompleterEntry[]
  onChange: (next: SoutienCompleterEntry[]) => void
  /** Mots du vocabulaire portant le son (propositions). */
  suggestedWords: readonly string[]
  max?: number
}) {
  const baseId = useId()
  const fileRefs = useRef<Array<HTMLInputElement | null>>([])
  const draftFileRef = useRef<HTMLInputElement | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [draftWord, setDraftWord] = useState('')
  const [draftArticle, setDraftArticle] = useState<'Un' | 'Une'>('Un')
  const [draftImage, setDraftImage] = useState<string | undefined>()
  const [draftBlank, setDraftBlank] = useState('')

  const used = new Set(entries.map((e) => e.word.trim().toLowerCase()))
  const suggestions = suggestedWords.filter((w) => w.trim() && !used.has(w.trim().toLowerCase()))

  async function pickImage(file: File | undefined, apply: (src: string) => void) {
    if (!file) return
    try {
      apply(await readGameImageFile(file))
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image refusée.')
    }
  }

  function updateAt(index: number, patch: Partial<SoutienCompleterEntry>) {
    onChange(entries.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)))
  }

  function applyBlankSelection(index: number, word: string, start: number, end: number) {
    const w = word.trim()
    const a = Math.max(0, Math.min(start, end))
    const b = Math.max(a + 1, Math.min(w.length, Math.max(start, end)))
    updateAt(index, {
      word: w,
      before: w.slice(0, a),
      blank: w.slice(a, b),
      after: w.slice(b),
    })
  }

  function addEntry(entry: SoutienCompleterEntry) {
    if (entries.length >= max) return
    onChange([...entries, entry])
  }

  return (
    <div className="quad-libre-block soutien-completer-libre">
      <b>Mots à compléter ({entries.length}/{max})</b>
      <p className="type-hint muted">
        Déterminant, mot, puis la partie à cacher. L’image est à gauche.
      </p>
      <ul className="game-entry-list soutien-completer-list" aria-label="Mots à compléter">
        {entries.map((entry, index) => {
          const inputId = `${baseId}-img-${index}`
          const w = entry.word
          return (
            <li className="soutien-completer-row" key={entry.id}>
              <button
                type="button"
                className={`game-entry-thumb${entry.imageSrc ? ' has-image' : ''}`}
                aria-label={`Image du mot ${index + 1}`}
                onClick={() => fileRefs.current[index]?.click()}
              >
                {entry.imageSrc ? <img src={entry.imageSrc} alt="" /> : <span aria-hidden>+</span>}
              </button>
              <input
                ref={(el) => {
                  fileRefs.current[index] = el
                }}
                id={inputId}
                className="visually-hidden"
                type="file"
                accept={GAME_IMAGE_ACCEPT}
                onChange={(event) => {
                  void pickImage(event.target.files?.[0], (src) =>
                    updateAt(index, { imageSrc: src }),
                  )
                  event.target.value = ''
                }}
              />
              <select
                className="pill-input soutien-article-select"
                aria-label={`Déterminant ${index + 1}`}
                value={entry.article === 'Une' ? 'Une' : 'Un'}
                onChange={(event) => updateAt(index, { article: event.target.value })}
              >
                <option value="Un">Un</option>
                <option value="Une">Une</option>
              </select>
              <input
                className="pill-input"
                type="text"
                value={entry.word}
                maxLength={40}
                aria-label={`Mot ${index + 1}`}
                placeholder="Mot"
                onChange={(event) => {
                  const word = event.target.value
                  const parts = splitWordForBlank(word)
                  updateAt(index, {
                    word,
                    ...parts,
                    imageSrc: entry.imageSrc?.startsWith('data:')
                      ? entry.imageSrc
                      : soutienImageFor(word) ?? entry.imageSrc,
                  })
                }}
              />
              <label className="soutien-blank-pick">
                <span>Cacher</span>
                <select
                  className="pill-input"
                  aria-label={`Partie cachée du mot ${index + 1}`}
                  value={`${entry.before.length}:${entry.before.length + entry.blank.length}`}
                  onChange={(event) => {
                    const [a, b] = event.target.value.split(':').map(Number)
                    applyBlankSelection(index, w, a || 0, b || 1)
                  }}
                >
                  {Array.from({ length: Math.max(1, w.length) }, (_, start) =>
                    Array.from({ length: w.length - start }, (_, len) => {
                      const end = start + len + 1
                      const label = `${w.slice(0, start)}[${w.slice(start, end)}]${w.slice(end)}`
                      return (
                        <option key={`${start}-${end}`} value={`${start}:${end}`}>
                          {label}
                        </option>
                      )
                    }),
                  ).flat()}
                </select>
              </label>
              <button
                type="button"
                className="game-entry-clear"
                aria-label={`Retirer le mot ${index + 1}`}
                disabled={entries.length <= 1}
                onClick={() => onChange(entries.filter((_, i) => i !== index))}
              >
                ×
              </button>
            </li>
          )
        })}
      </ul>

      {entries.length < max ? (
        <div className="vocab-add-row soutien-completer-add">
          <button
            type="button"
            className={`vocab-add-thumb${draftImage ? ' has-image' : ''}`}
            aria-label="Image du nouveau mot"
            onClick={() => draftFileRef.current?.click()}
          >
            {draftImage ? <img src={draftImage} alt="" /> : <span aria-hidden>+</span>}
          </button>
          <input
            ref={draftFileRef}
            className="visually-hidden"
            type="file"
            accept={GAME_IMAGE_ACCEPT}
            onChange={(event) => {
              void pickImage(event.target.files?.[0], setDraftImage)
              event.target.value = ''
            }}
          />
          <select
            className="pill-input soutien-article-select"
            aria-label="Déterminant du nouveau mot"
            value={draftArticle}
            onChange={(event) => setDraftArticle(event.target.value === 'Une' ? 'Une' : 'Un')}
          >
            <option value="Un">Un</option>
            <option value="Une">Une</option>
          </select>
          <input
            className="pill-input"
            type="text"
            value={draftWord}
            maxLength={40}
            placeholder="Nouveau mot"
            aria-label="Nouveau mot libre"
            onChange={(event) => {
              const word = event.target.value
              setDraftWord(word)
              if (!draftBlank) setDraftBlank(splitWordForBlank(word).blank)
            }}
          />
          <button
            type="button"
            className="vocab-add-btn"
            aria-label="Ajouter le mot"
            disabled={!draftWord.trim()}
            onClick={() => {
              const word = draftWord.trim()
              if (!word) return
              const parts = splitWordForBlank(word)
              addEntry({
                id: newEntryId(word),
                article: draftArticle,
                before: parts.before,
                blank: draftBlank.trim() || parts.blank,
                after: parts.after,
                word,
                imageSrc: draftImage || soutienImageFor(word),
              })
              setDraftWord('')
              setDraftBlank('')
              setDraftImage(undefined)
            }}
          >
            +
          </button>
        </div>
      ) : (
        <small className="muted">Maximum {max} mots.</small>
      )}
      {suggestions.length > 0 ? (
        <>
          <b>Ajouter un mot du son</b>
          <div className="soutien-suggest-list" role="group" aria-label="Mots proposés">
            {suggestions.slice(0, 24).map((word) => (
              <button
                key={`sug-${word}`}
                type="button"
                className="soutien-suggest-chip"
                disabled={entries.length >= max}
                onClick={() => addEntry(entryFromWord(word))}
              >
                {word}
              </button>
            ))}
          </div>
        </>
      ) : null}
      {error ? (
        <p className="questions-overflow-hint" role="alert">
          {error}
        </p>
      ) : (
        <small className="muted">
          Choisissez la partie à cacher, ou ajoutez un mot libre avec son image.
        </small>
      )}
    </div>
  )
}
