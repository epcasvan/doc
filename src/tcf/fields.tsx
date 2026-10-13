import { useRef, useState } from 'react'
import { GAME_IMAGE_ACCEPT, readGameImageFile } from '@/jeux/image'
import { tcfAudioDisplayName, type TcfAudioEntry } from './audio-bank'
import { tcfAudioSrc, tcfImageSrc } from './media'
import { TcfAudioPicker } from './TcfAudioPicker'
import { VocabImagePicker } from './VocabImagePicker'

/** Champ texte (une ligne ou zone multiligne). */
export function TextField({
  label,
  value,
  onChange,
  multiline = false,
  placeholder,
  rows = 3,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  multiline?: boolean
  placeholder?: string
  rows?: number
}) {
  return (
    <label className="tcf-field">
      <span>{label}</span>
      {multiline ? (
        <textarea
          className="pill-input tcf-textarea"
          value={value}
          rows={rows}
          placeholder={placeholder}
          spellCheck
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          className="pill-input"
          type="text"
          value={value}
          placeholder={placeholder}
          spellCheck
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </label>
  )
}

/** Liste « une entrée par ligne » (mots, variantes, options). */
export function LinesField({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string
  values: string[]
  onChange: (values: string[]) => void
  placeholder?: string
}) {
  return (
    <TextField
      label={label}
      value={values.join('\n')}
      multiline
      rows={Math.max(2, Math.min(6, values.length + 1))}
      placeholder={placeholder}
      onChange={(text) => onChange(text.split('\n'))}
    />
  )
}

export function NumberField({
  label,
  value,
  onChange,
  min = 0,
  max = 999,
  step = 1,
}: {
  label: string
  value: number | undefined
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
}) {
  return (
    <label className="tcf-field is-number">
      <span>{label}</span>
      <input
        className="pill-input"
        type="number"
        min={min}
        max={max}
        step={step}
        value={value ?? 0}
        onChange={(event) => {
          const n = Number(event.target.value.replace(',', '.'))
          if (Number.isFinite(n)) onChange(Math.max(min, Math.min(max, Math.round(n / step) * step)))
        }}
      />
    </label>
  )
}

/**
 * Image : chemin sous `public/lib/images/` (recherche par mot), ou import fichier
 * (data URL) en secours.
 */
export function ImageField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  const fileRef = useRef<HTMLInputElement | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const src = tcfImageSrc(value)
  return (
    <div className="tcf-field tcf-image-field">
      <span>{label}</span>
      <div className="tcf-image-row">
        <button
          type="button"
          className={`game-entry-thumb${src ? ' has-image' : ''}`}
          aria-label={src ? `Aperçu : ${label}` : `Choisir une image : ${label}`}
          title="Rechercher une image vocabulaire"
          onClick={() => setPickerOpen(true)}
        >
          {src ? <img src={src} alt="" /> : <span aria-hidden>+</span>}
        </button>
        <input
          ref={fileRef}
          className="visually-hidden"
          type="file"
          accept={GAME_IMAGE_ACCEPT}
          onChange={(event) => {
            const file = event.target.files?.[0]
            event.target.value = ''
            if (!file) return
            readGameImageFile(file)
              .then((dataUrl) => {
                onChange(dataUrl)
                setError(null)
              })
              .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Image refusée.'))
          }}
        />
        <input
          className="pill-input"
          type="text"
          value={value.startsWith('data:') ? '' : value}
          placeholder={value.startsWith('data:') ? 'Image importée' : '/lib/images/vocabulaire/…'}
          aria-label={`Fichier : ${label}`}
          onChange={(event) => onChange(event.target.value)}
          onClick={() => setPickerOpen(true)}
          onFocus={(event) => {
            // Clic / focus → ouvrir le sélecteur plutôt que mémoriser les chemins.
            if (!value.startsWith('data:')) {
              event.target.blur()
              setPickerOpen(true)
            }
          }}
        />
        <button
          type="button"
          className="tcf-btn"
          title="Importer un fichier image"
          onClick={() => fileRef.current?.click()}
        >
          Fichier
        </button>
      </div>
      {error ? <small className="questions-overflow-hint">{error}</small> : null}
      <VocabImagePicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={(path) => {
          onChange(path)
          setError(null)
        }}
      />
    </div>
  )
}

/**
 * Audio : MP3 sous `public/lib/audio/` (ou chemin / URL), écoute à l’écran.
 * Avec `bankEntries`, un clic ouvre la recherche ; `onPickFromBank` peut
 * recharger questions + transcription de l’exercice lié.
 * Le champ affiche le nom de l’audio (scène ou stem), pas le chemin.
 */
export function AudioField({
  label,
  value,
  onChange,
  bankEntries,
  onPickFromBank,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  bankEntries?: readonly TcfAudioEntry[]
  onPickFromBank?: (entry: TcfAudioEntry) => void
}) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const src = tcfAudioSrc(value)
  const canPick = (bankEntries?.length ?? 0) > 0
  const displayName = tcfAudioDisplayName(value, bankEntries)
  return (
    <div className="tcf-field">
      <span>{label}</span>
      <div className="tcf-audio-row">
        <input
          className="pill-input"
          type="text"
          value={canPick ? displayName : value}
          placeholder={canPick ? 'Rechercher un audio de la banque…' : '/lib/audio/comprehension/…'}
          aria-label={`Audio : ${label}`}
          title={canPick ? (value ? `${displayName} — ${value}` : 'Rechercher un audio (questions adaptées)') : value}
          readOnly={canPick}
          onChange={(event) => {
            if (!canPick) onChange(event.target.value)
          }}
          onClick={() => {
            if (canPick) setPickerOpen(true)
          }}
          onFocus={(event) => {
            if (canPick) {
              event.target.blur()
              setPickerOpen(true)
            }
          }}
        />
        {canPick ? (
          <button type="button" className="tcf-btn" onClick={() => setPickerOpen(true)}>
            Choisir
          </button>
        ) : null}
      </div>
      {src ? <audio className="tcf-audio-player" controls preload="none" src={src} /> : null}
      {canPick ? (
        <TcfAudioPicker
          open={pickerOpen}
          entries={[...bankEntries!]}
          onClose={() => setPickerOpen(false)}
          onPick={(entry) => {
            if (onPickFromBank) onPickFromBank(entry)
            else onChange(entry.audio)
          }}
        />
      ) : null}
    </div>
  )
}
