import { useId, useMemo, useRef, useState } from 'react'
import {
  DEFAULT_GAME_TOPIC,
  entriesFromBankItems,
  isGameBankType,
  lectureBankItems,
  lectureTopicOptions,
  themeBankItems,
  themeTopicOptions,
  type BankItem,
  type GameSource,
} from './bank'
import { GAME_BORDER_STYLES } from './borders'
import {
  DEFAULT_GAME_FONT_SIZE,
  GAME_FONT_SIZES,
  usesCompactGameFont,
  type GameFontSizeId,
} from './font-size'
import { resolveGameImageSrc } from './image-resolve'
import { readGameImageFile, GAME_IMAGE_ACCEPT } from './image'
import { entriesToText, resolveEntries, textToEntries } from './parse'
import type { GameTemplate } from './templates'
import type { GameEntry } from './types'

export type { GameSource }

export type GameContentChange = {
  gameText: string
  gameEntries: GameEntry[]
  gameSource?: GameSource
  gameTopic?: string
  gameSelectedIds?: string[]
  gameBackColor?: string
  gameSeriesName?: string
  gameBorderId?: string
  gameBorderRectoId?: string
  gameBorderVersoId?: string
  gameFontSize?: string
  /** Vocabulaire : coloriage Alpha (1 couleur = 1 son). */
  gameAlpha?: boolean
}

const SERIES_DEFAULTS: Record<string, string> = {
  'jeux-vocabulaire': 'Vocabulaire',
  'jeux-devinettes': 'Devinettes',
  'jeux-memory': 'Mémory',
  'jeux-loto': 'Loto',
  'jeux-intrus': 'Intrus',
  'jeux-dominos': 'Dominos',
}

function defaultSeriesName(typeId: string): string {
  return SERIES_DEFAULTS[typeId] ?? 'Jeux'
}

/** Grille de cartes : identité de série (logo ClairFLE + nom + cadre) au verso. */
function usesSeriesIdentity(typeId: string): boolean {
  return (
    typeId === 'jeux-memory' ||
    typeId === 'jeux-intrus' ||
    typeId === 'jeux-loto' ||
    typeId === 'jeux-vocabulaire' ||
    typeId === 'jeux-devinettes' ||
    typeId === 'jeux-dominos'
  )
}

function GameAddWordRow({
  disabled,
  onAdd,
}: {
  disabled?: boolean
  onAdd: (entry: GameEntry) => void
}) {
  const [label, setLabel] = useState('')
  const [imageSrc, setImageSrc] = useState<string | undefined>()
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)

  async function onPick(file: File | undefined) {
    if (!file) return
    try {
      const dataUrl = await readGameImageFile(file)
      setImageSrc(dataUrl)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image refusée.')
    }
  }

  return (
    <div className="game-extra-words">
      <b>Mots supplémentaires</b>
      <div className="vocab-add-row">
        <button
          type="button"
          className={`vocab-add-thumb${imageSrc ? ' has-image' : ''}`}
          aria-label="Image du nouveau mot"
          disabled={disabled}
          onClick={() => fileRef.current?.click()}
        >
          {imageSrc ? <img src={imageSrc} alt="" /> : <span aria-hidden>+</span>}
        </button>
        <input
          ref={fileRef}
          className="visually-hidden"
          type="file"
          accept={GAME_IMAGE_ACCEPT}
          onChange={(event) => {
            void onPick(event.target.files?.[0])
            event.target.value = ''
          }}
        />
        <input
          className="pill-input"
          type="text"
          value={label}
          placeholder="Nouveau mot"
          aria-label="Nouveau mot hors liste"
          disabled={disabled}
          onChange={(event) => setLabel(event.target.value)}
        />
        <button
          type="button"
          className="vocab-add-btn"
          aria-label="Ajouter le mot"
          title="Ajouter"
          disabled={disabled || !label.trim()}
          onClick={() => {
            const word = label.trim()
            if (!word) return
            // Garder l’upload tel quel (data URL) — ne pas le perdre via la résolution banque.
            onAdd({ text: word, imageSrc: imageSrc || resolveGameImageSrc(word) })
            setLabel('')
            setImageSrc(undefined)
            setError(null)
          }}
        >
          +
        </button>
        {error ? (
          <p className="questions-overflow-hint" role="alert">
            {error}
          </p>
        ) : null}
      </div>
      <small className="muted">Hors liste · image optionnelle (+).</small>
    </div>
  )
}

function templateHasImages(template: GameTemplate): boolean {
  return template.fields.some((field) => field.type === 'image')
}

function usesSeriesNameField(typeId: string): boolean {
  return (
    typeId === 'jeux-memory' ||
    typeId === 'jeux-intrus' ||
    typeId === 'jeux-loto' ||
    typeId === 'jeux-dominos'
  )
}

/** Nom de série (si dos identification) + bordures recto / verso indépendantes. */
function SeriesIdentityFields({
  typeId,
  seriesName,
  borderRectoId,
  borderVersoId,
  fontSize,
  alpha,
  onSeriesName,
  onBorderIds,
  onFontSize,
  onAlpha,
}: {
  typeId: string
  seriesName?: string
  borderRectoId?: string
  borderVersoId?: string
  fontSize?: string
  alpha?: boolean
  onSeriesName: (name: string) => void
  onBorderIds: (recto: string | undefined, verso: string | undefined) => void
  onFontSize: (size: GameFontSizeId) => void
  onAlpha?: (on: boolean) => void
}) {
  const [faceTab, setFaceTab] = useState<'recto' | 'verso'>('recto')
  const recto = borderRectoId?.trim() || ''
  const verso = borderVersoId?.trim() || ''
  const active = faceTab === 'recto' ? recto : verso
  const sizeId = (fontSize as GameFontSizeId | undefined) ?? DEFAULT_GAME_FONT_SIZE
  const previewSrc = (id: string, face: 'recto' | 'verso') => {
    const style = GAME_BORDER_STYLES.find((b) => b.id === id)
    if (!style) return undefined
    return face === 'verso' ? style.verso : style.recto
  }
  const hintLabel = () => {
    if (!recto && !verso) return 'Modifier'
    const r = GAME_BORDER_STYLES.find((b) => b.id === recto)?.label ?? (recto ? recto : 'Défaut')
    const v = GAME_BORDER_STYLES.find((b) => b.id === verso)?.label ?? (verso ? verso : 'Défaut')
    if (recto && verso && recto === verso) return r
    if (!recto) return `Défaut · ${v}`
    if (!verso) return `${r} · Défaut`
    return `${r} · ${v}`
  }
  return (
    <div className="game-series-identity">
      {usesSeriesNameField(typeId) ? (
        <label className="game-series-name">
          <span>Nom de la série</span>
          <input
            className="pill-input"
            type="text"
            maxLength={32}
            value={seriesName ?? defaultSeriesName(typeId)}
            aria-label="Nom de la série (verso)"
            placeholder={defaultSeriesName(typeId)}
            onChange={(event) => onSeriesName(event.target.value)}
          />
        </label>
      ) : null}
      <details className="header-editor game-border-editor">
        <summary className="header-editor-summary">
          <span>Bordure</span>
          <span className="header-editor-hint">{hintLabel()}</span>
        </summary>
        <div className="custom-header-form game-border-editor-body">
          <div className="mode-toggle is-2 game-border-face-tabs" role="tablist" aria-label="Face de la bordure">
            <button
              type="button"
              role="tab"
              aria-selected={faceTab === 'recto'}
              className={faceTab === 'recto' ? 'active' : ''}
              onClick={() => setFaceTab('recto')}
            >
              Recto{recto ? ` · ${GAME_BORDER_STYLES.find((b) => b.id === recto)?.label ?? ''}` : ''}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={faceTab === 'verso'}
              className={faceTab === 'verso' ? 'active' : ''}
              onClick={() => setFaceTab('verso')}
            >
              Verso{verso ? ` · ${GAME_BORDER_STYLES.find((b) => b.id === verso)?.label ?? ''}` : ''}
            </button>
          </div>
          <div className="game-border-picker" role="listbox" aria-label={`Bordures ${faceTab}`}>
            <button
              type="button"
              className={`game-border-option is-none${!active ? ' is-selected' : ''}`}
              role="option"
              aria-selected={!active}
              onClick={() => {
                if (faceTab === 'recto') onBorderIds('', verso)
                else onBorderIds(recto, '')
              }}
            >
              <span className="game-border-option-preview is-default" aria-hidden />
              <span>Aucune (défaut)</span>
            </button>
            {GAME_BORDER_STYLES.map((style) => (
              <button
                key={style.id}
                type="button"
                className={`game-border-option${active === style.id ? ' is-selected' : ''}`}
                role="option"
                aria-selected={active === style.id}
                title={style.label}
                onClick={() => {
                  if (faceTab === 'recto') onBorderIds(style.id, verso)
                  else onBorderIds(recto, style.id)
                }}
              >
                <img
                  className="game-border-option-preview"
                  src={previewSrc(style.id, faceTab)}
                  alt=""
                  draggable={false}
                />
                <span>{style.label}</span>
              </button>
            ))}
          </div>
          <small className="muted">
            Même liste pour le recto et le verso — choisissez chaque face séparément.
          </small>
        </div>
      </details>
      <div className="mode-toggle-block game-font-size-block">
        <b>Taille</b>
        <div className="mode-toggle is-3" role="group" aria-label="Taille des mots">
          {GAME_FONT_SIZES.map((size) => (
            <button
              key={size.id}
              type="button"
              className={sizeId === size.id ? 'active' : ''}
              onClick={() => onFontSize(size.id)}
            >
              {size.label}
            </button>
          ))}
        </div>
        <small className="muted">
          {usesCompactGameFont(typeId)
            ? 'Petit : 15 px · Moyen : 20 px · Grand : 25 px'
            : 'Petit : 20 px · Moyen : 30 px · Grand : 40 px'}
        </small>
      </div>
      {typeId === 'jeux-vocabulaire' && onAlpha ? (
        <div className="mode-toggle-block game-alpha-block">
          <b>Couleurs</b>
          <div className="mode-toggle is-2" role="group" aria-label="Coloriage des mots">
            <button
              type="button"
              className={!alpha ? 'active' : ''}
              onClick={() => onAlpha(false)}
            >
              Normal
            </button>
            <button
              type="button"
              className={alpha ? 'active' : ''}
              onClick={() => onAlpha(true)}
            >
              Alpha
            </button>
          </div>
          <small className="muted">
            Alpha : 1 couleur = 1 son (graphies : OU, AN, CH…).
          </small>
        </div>
      ) : null}
    </div>
  )
}

export function GameContentPanel({
  typeId,
  template,
  entries,
  text,
  gameSource = 'theme',
  gameTopic,
  gameSelectedIds,
  gameBackColor,
  gameSeriesName,
  gameBorderId,
  gameBorderRectoId,
  gameBorderVersoId,
  gameFontSize,
  gameAlpha = false,
  onChange,
}: {
  typeId: string
  template: GameTemplate
  entries: GameEntry[] | undefined
  text: string
  gameSource?: GameSource
  gameTopic?: string
  gameSelectedIds?: string[]
  gameBackColor?: string
  gameSeriesName?: string
  gameBorderId?: string
  gameBorderRectoId?: string
  gameBorderVersoId?: string
  gameFontSize?: string
  gameAlpha?: boolean
  onChange: (next: GameContentChange) => void
}) {
  const baseId = useId()
  const fileRefs = useRef<Array<HTMLInputElement | null>>([])
  const [error, setError] = useState<string | null>(null)
  const withImages = templateHasImages(template)
  const bankMode = isGameBankType(typeId) && withImages
  const source = gameSource ?? 'theme'
  const topicId = gameTopic ?? DEFAULT_GAME_TOPIC
  const maxCards = template.entryCount

  const bankItems: BankItem[] = useMemo(() => {
    if (source === 'theme') return themeBankItems(topicId)
    if (source === 'lecture') return lectureBankItems(topicId)
    return []
  }, [source, topicId])

  const selectedIds = gameSelectedIds ?? []
  const topicOptions = source === 'lecture' ? lectureTopicOptions() : themeTopicOptions()
  // '' = défaut explicite ; undefined seul → héritage de gameBorderId (anciennes fiches).
  const borderRectoId =
    gameBorderRectoId !== undefined ? gameBorderRectoId : (gameBorderId ?? '')
  const borderVersoId =
    gameBorderVersoId !== undefined ? gameBorderVersoId : (gameBorderId ?? '')
  const fontSize = gameFontSize ?? DEFAULT_GAME_FONT_SIZE
  const alphaOn = Boolean(gameAlpha)

  function chromeFields(): Pick<
    GameContentChange,
    | 'gameBackColor'
    | 'gameSeriesName'
    | 'gameBorderId'
    | 'gameBorderRectoId'
    | 'gameBorderVersoId'
    | 'gameFontSize'
    | 'gameAlpha'
  > {
    return {
      gameBackColor,
      gameSeriesName,
      gameBorderId: borderRectoId,
      gameBorderRectoId: borderRectoId,
      gameBorderVersoId: borderVersoId,
      gameFontSize: fontSize,
      gameAlpha: typeId === 'jeux-vocabulaire' ? alphaOn : undefined,
    }
  }

  function commitEntries(nextEntries: GameEntry[], patch: Partial<GameContentChange> = {}) {
    setError(null)
    onChange({
      gameEntries: nextEntries,
      gameText: entriesToText(typeId, nextEntries),
      gameSource: source,
      gameTopic: topicId,
      gameSelectedIds: selectedIds,
      ...chromeFields(),
      ...patch,
    })
  }

  function applySelection(ids: string[], items: BankItem[], patch: Partial<GameContentChange> = {}) {
    const byId = new Map(items.map((item) => [item.id, item]))
    const bankIds = ids.filter((id) => !id.startsWith('custom:'))
    const customIds = ids.filter((id) => id.startsWith('custom:'))
    const picked = bankIds
      .map((id) => byId.get(id))
      .filter((item): item is BankItem => Boolean(item))
    const customEntries = resolveEntries(typeId, entries).filter((entry) => {
      const key = `custom:${entry.text.trim().toLowerCase()}`
      return customIds.includes(key) && Boolean(entry.text.trim())
    })
    const room = Math.max(0, maxCards - customEntries.length)
    const bankPicked = picked.slice(0, room)
    const nextEntries = [
      ...entriesFromBankItems(bankPicked, bankPicked.length, resolveEntries(typeId, entries), {
        topicId,
        withClues: typeId === 'jeux-devinettes',
      }),
      ...customEntries,
    ]
    while (nextEntries.length < maxCards) nextEntries.push({ text: '' })
    const nextIds = [
      ...bankPicked.map((p) => p.id),
      ...customEntries.map((e) => `custom:${e.text.trim().toLowerCase()}`),
    ]
    onChange({
      gameEntries: nextEntries.slice(0, maxCards),
      gameText: entriesToText(
        typeId,
        nextEntries.filter((e) => e.text),
      ),
      gameSource: patch.gameSource ?? source,
      gameTopic: patch.gameTopic ?? topicId,
      gameSelectedIds: nextIds,
      ...chromeFields(),
      ...patch,
    })
  }

  function addExtraWord(entry: GameEntry) {
    const current = resolveEntries(typeId, entries).filter((e) => e.text.trim())
    if (current.length >= maxCards) return
    const key = entry.text.trim().toLowerCase()
    if (current.some((e) => e.text.trim().toLowerCase() === key)) return
    const nextEntries = [...current, entry].slice(0, maxCards)
    const bankLabels = new Set(bankItems.map((b) => b.label.toLowerCase()))
    const mergedIds = [
      ...selectedIds.filter((id) => {
        if (id.startsWith('custom:')) return false
        const item = bankItems.find((b) => b.id === id)
        return Boolean(
          item && nextEntries.some((e) => e.text.toLowerCase() === item.label.toLowerCase()),
        )
      }),
      ...nextEntries
        .filter((e) => !bankLabels.has(e.text.toLowerCase()))
        .map((e) => `custom:${e.text.trim().toLowerCase()}`),
    ]
    onChange({
      gameEntries: nextEntries,
      gameText: entriesToText(typeId, nextEntries),
      gameSource: source,
      gameTopic: topicId,
      gameSelectedIds: mergedIds.slice(0, maxCards),
      ...chromeFields(),
    })
  }

  function setSeriesName(name: string) {
    const resolvedNow = resolveEntries(typeId, entries)
    onChange({
      gameEntries: resolvedNow,
      gameText: entriesToText(typeId, resolvedNow),
      gameSource: source,
      gameTopic: topicId,
      gameSelectedIds: selectedIds,
      ...chromeFields(),
      gameSeriesName: name,
    })
  }

  function setBorderIds(recto: string | undefined, verso: string | undefined) {
    const resolvedNow = resolveEntries(typeId, entries)
    const r = (recto ?? '').trim()
    const v = (verso ?? '').trim()
    onChange({
      gameEntries: resolvedNow,
      gameText: entriesToText(typeId, resolvedNow),
      gameSource: source,
      gameTopic: topicId,
      gameSelectedIds: selectedIds,
      ...chromeFields(),
      // '' conserve le choix « aucune » (évite le repli via ?? gameBorderId).
      gameBorderId: r || v || undefined,
      gameBorderRectoId: r,
      gameBorderVersoId: v,
    })
  }

  function setFontSize(size: GameFontSizeId) {
    const resolvedNow = resolveEntries(typeId, entries)
    onChange({
      gameEntries: resolvedNow,
      gameText: entriesToText(typeId, resolvedNow),
      gameSource: source,
      gameTopic: topicId,
      gameSelectedIds: selectedIds,
      ...chromeFields(),
      gameFontSize: size,
    })
  }

  function setAlpha(on: boolean) {
    const resolvedNow = resolveEntries(typeId, entries)
    onChange({
      gameEntries: resolvedNow,
      gameText: entriesToText(typeId, resolvedNow),
      gameSource: source,
      gameTopic: topicId,
      gameSelectedIds: selectedIds,
      ...chromeFields(),
      gameAlpha: on,
    })
  }

  function setSource(next: GameSource) {
    if (next === 'libre') {
      const resolved = resolveEntries(typeId, entries)
      commitEntries(resolved, { gameSource: 'libre', gameSelectedIds: [] })
      return
    }
    const nextTopic = topicId === 'tous' && next === 'theme' ? DEFAULT_GAME_TOPIC : topicId
    const items =
      next === 'theme'
        ? themeBankItems(nextTopic)
        : lectureBankItems(nextTopic === 'tous' ? 'tous' : nextTopic)
    const defaults = items.slice(0, maxCards)
    applySelection(
      defaults.map((w) => w.id),
      items,
      { gameSource: next, gameTopic: nextTopic },
    )
  }

  // —— Modes banque (thème / lecture) ——
  if (bankMode && source !== 'libre') {
    return (
      <div className="game-content-field">
        <span className="game-content-label">Contenu</span>
        <div className="mode-toggle-block">
          <b>Source</b>
          <div className="mode-toggle is-3" role="group" aria-label="Source des cartes">
            <button
              type="button"
              className={source === 'theme' ? 'active' : ''}
              onClick={() => setSource('theme')}
            >
              Thème
            </button>
            <button
              type="button"
              className={source === 'lecture' ? 'active' : ''}
              onClick={() => setSource('lecture')}
            >
              Banque
            </button>
            <button type="button" className="" onClick={() => setSource('libre')}>
              Libre
            </button>
          </div>
        </div>

        {source === 'lecture' ? (
          <label className="select-shell">
            <span>Banque</span>
            <select
              className="pill-input"
              value={topicId}
              onChange={(event) => {
                const nextTopic = event.target.value
                const items = lectureBankItems(nextTopic)
                applySelection(
                  items.slice(0, maxCards).map((w) => w.id),
                  items,
                  { gameTopic: nextTopic },
                )
              }}
            >
              {topicOptions.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <div className="quad-libre-block">
          <b>
            Mots ({selectedIds.length}/{maxCards})
          </b>
          <div className="vocab-word-list" role="group" aria-label="Mots à mettre sur les cartes">
            {bankItems.map((word) => {
              const selected = selectedIds.includes(word.id)
              return (
                <label key={word.id} className={selected ? 'is-on' : ''}>
                  <input
                    type="checkbox"
                    checked={selected}
                    disabled={!selected && selectedIds.length >= maxCards}
                    onChange={() => {
                      const next = selected
                        ? selectedIds.filter((id) => id !== word.id)
                        : [...selectedIds, word.id].slice(0, maxCards)
                      applySelection(next, bankItems)
                    }}
                  />
                  {word.imageSrc ? (
                    <img className="vocab-word-thumb" src={word.imageSrc} alt="" />
                  ) : null}
                  <span className="vocab-word-label">{word.label}</span>
                </label>
              )
            })}
          </div>
          <GameAddWordRow
            disabled={selectedIds.length >= maxCards}
            onAdd={addExtraWord}
          />
          {selectedIds.some((id) => id.startsWith('custom:')) ? (
            <div className="game-custom-words" aria-label="Mots ajoutés">
              <b>Mots ajoutés</b>
              <ul className="game-custom-word-list">
                {resolveEntries(typeId, entries)
                  .filter((e) => {
                    const key = `custom:${e.text.trim().toLowerCase()}`
                    return selectedIds.includes(key) && e.text.trim()
                  })
                  .map((entry) => (
                    <li key={`custom-show-${entry.text}`}>
                      {entry.imageSrc ? (
                        <img className="vocab-word-thumb" src={entry.imageSrc} alt="" />
                      ) : (
                        <span className="vocab-word-thumb is-empty" aria-hidden />
                      )}
                      <span className="vocab-word-label">{entry.text}</span>
                    </li>
                  ))}
              </ul>
            </div>
          ) : null}
          <small className="muted">
            {typeId === 'jeux-vocabulaire'
              ? '9 cartes · recto images · verso mots (miroir bord long).'
              : typeId === 'jeux-memory'
                ? '4 paires (8 cartes + 1 vide) · verso série.'
                : typeId === 'jeux-loto'
                  ? 'Grilles selon le nombre de mots (pas de cases vides) · lot animateur.'
                  : typeId === 'jeux-devinettes'
                    ? '9 mots · une phrase-indice par mot (retours à la ligne possibles).'
                    : typeId === 'jeux-intrus'
                      ? 'Mots du thème · à chaque génération, 9 cartes avec un nouvel intrus.'
                      : typeId === 'jeux-dominos'
                        ? '16 dominos image | mot (2×8) · verso série.'
                        : template.entryHint}
          </small>
        </div>
        {typeId === 'jeux-devinettes' && selectedIds.length > 0 ? (
          <div className="game-riddle-bank-clues">
            <b>Phrase-indice (modifiable)</b>
            <ul className="game-riddle-list" aria-label="Indices des mots sélectionnés">
              {resolveEntries(typeId, entries)
                .filter((e) => e.text.trim())
                .slice(0, maxCards)
                .map((entry, index) => {
                  const clue = (entry.clues ?? []).join('\n')
                  return (
                    <li className="game-riddle-block" key={`bank-riddle-${entry.text}-${index}`}>
                      <div className="game-riddle-head">
                        <b>{entry.text}</b>
                        {entry.imageSrc ? (
                          <img className="vocab-word-thumb" src={entry.imageSrc} alt="" />
                        ) : null}
                      </div>
                      <label className="game-riddle-clue">
                        <span>Devinette</span>
                        <textarea
                          className="pill-input game-riddle-textarea"
                          rows={3}
                          maxLength={280}
                          value={clue}
                          aria-label={`${entry.text}, phrase-indice`}
                          placeholder="Une phrase pour faire deviner le mot…"
                          onChange={(event) => {
                            const resolved = resolveEntries(typeId, entries)
                            const next = resolved.map((e) => {
                              if (e.text.trim().toLowerCase() !== entry.text.trim().toLowerCase()) {
                                return e
                              }
                              return { ...e, clues: [event.target.value] }
                            })
                            onChange({
                              gameEntries: next,
                              gameText: entriesToText(typeId, next),
                              gameSource: source,
                              gameTopic: topicId,
                              gameSelectedIds: selectedIds,
                              ...chromeFields(),
                            })
                          }}
                        />
                      </label>
                    </li>
                  )
                })}
            </ul>
          </div>
        ) : null}
        {usesSeriesIdentity(typeId) ? (
          <SeriesIdentityFields
            typeId={typeId}
            seriesName={gameSeriesName}
            borderRectoId={borderRectoId}
            borderVersoId={borderVersoId}
            fontSize={fontSize}
            alpha={alphaOn}
            onSeriesName={setSeriesName}
            onBorderIds={setBorderIds}
            onFontSize={setFontSize}
            onAlpha={typeId === 'jeux-vocabulaire' ? setAlpha : undefined}
          />
        ) : null}
      </div>
    )
  }

  // —— Mode libre (ou templates sans images) ——
  const resolved = resolveEntries(typeId, entries)
  const slots =
    withImages || typeId === 'jeux-devinettes'
      ? Array.from({ length: template.entryCount }, (_, i) =>
          resolved[i] ?? { text: '', clues: typeId === 'jeux-devinettes' ? [''] : undefined },
        )
      : resolved

  function updateSlot(index: number, patch: Partial<GameEntry>) {
    const next = slots.map((entry, i) => (i === index ? { ...entry, ...patch } : entry))
    commitEntries(next, { gameSource: 'libre' })
  }

  function updateClue(index: number, value: string) {
    updateSlot(index, { clues: [value] })
  }

  async function onPickImage(index: number, file: File | undefined) {
    if (!file) return
    try {
      const dataUrl = await readGameImageFile(file)
      updateSlot(index, { imageSrc: dataUrl })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image refusée.')
    }
  }

  // —— Devinettes : Mot N + image + une phrase (retours à la ligne OK) ——
  if (typeId === 'jeux-devinettes') {
    return (
      <div className="game-content-field">
        <span className="game-content-label">Contenu</span>
        <p className="muted game-content-hint">{template.entryHint}</p>
        <SeriesIdentityFields
          typeId={typeId}
          seriesName={gameSeriesName}
          borderRectoId={borderRectoId}
          borderVersoId={borderVersoId}
          fontSize={fontSize}
          onSeriesName={setSeriesName}
          onBorderIds={setBorderIds}
          onFontSize={setFontSize}
        />
        <ul className="game-riddle-list" aria-label="Devinettes">
          {slots.map((entry, index) => {
            const inputId = `${baseId}-riddle-img-${index}`
            const clue = (entry.clues ?? []).join('\n')
            return (
              <li className="game-riddle-block" key={`${typeId}-${index}`}>
                <div className="game-riddle-head">
                  <b>Mot {index + 1}</b>
                  <button
                    type="button"
                    className={`game-entry-thumb${entry.imageSrc ? ' has-image' : ''}`}
                    aria-label={
                      entry.imageSrc
                        ? `Changer l’image du mot ${index + 1}`
                        : `Ajouter une image au mot ${index + 1}`
                    }
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
                      void onPickImage(index, event.target.files?.[0])
                      event.target.value = ''
                    }}
                  />
                  <input
                    className="pill-input game-entry-text"
                    type="text"
                    maxLength={template.maxTextLen}
                    value={entry.text}
                    aria-label={`Mot ${index + 1}`}
                    placeholder={`Mot ${index + 1}`}
                    onChange={(event) => updateSlot(index, { text: event.target.value })}
                  />
                  {entry.imageSrc ? (
                    <button
                      type="button"
                      className="game-entry-clear"
                      aria-label={`Retirer l’image du mot ${index + 1}`}
                      title="Retirer l’image"
                      onClick={() => updateSlot(index, { imageSrc: undefined })}
                    >
                      ×
                    </button>
                  ) : (
                    <span className="game-entry-clear is-spacer" aria-hidden />
                  )}
                </div>
                <label className="game-riddle-clue">
                  <span>Devinette</span>
                  <textarea
                    className="pill-input game-riddle-textarea"
                    rows={3}
                    maxLength={280}
                    value={clue}
                    aria-label={`Mot ${index + 1}, phrase-indice`}
                    placeholder="Une phrase pour faire deviner le mot…"
                    onChange={(event) => updateClue(index, event.target.value)}
                  />
                </label>
              </li>
            )
          })}
        </ul>
        {error ? (
          <p className="questions-overflow-hint" role="alert">
            {error}
          </p>
        ) : (
          <small className="muted">
            Recto mot + image · verso phrase-indice (miroir bord long).
          </small>
        )}
      </div>
    )
  }

  if (!withImages) {
    return (
      <label className="select-shell game-content-field">
        <span>Contenu</span>
        <textarea
          className="pill-input game-content-textarea"
          rows={Math.min(12, Math.max(4, template.entryCount + 1))}
          value={text}
          spellCheck
          aria-label="Contenu du jeu"
          placeholder={template.entryHint}
          onChange={(event) => {
            const nextText = event.target.value
            onChange({
              gameText: nextText,
              gameEntries: textToEntries(typeId, nextText, entries),
              gameSource: 'libre',
            })
          }}
        />
        <small className="muted">{template.entryHint}</small>
      </label>
    )
  }

  return (
    <div className="game-content-field">
      <span className="game-content-label">Contenu</span>
      {bankMode ? (
        <div className="mode-toggle-block">
          <b>Source</b>
          <div className="mode-toggle is-3" role="group" aria-label="Source des cartes">
            <button type="button" onClick={() => setSource('theme')}>
              Thème
            </button>
            <button type="button" onClick={() => setSource('lecture')}>
              Banque
            </button>
            <button type="button" className="active" onClick={() => setSource('libre')}>
              Libre
            </button>
          </div>
        </div>
      ) : null}
      <p className="muted game-content-hint">{template.entryHint}</p>
      {usesSeriesIdentity(typeId) ? (
        <div className="libre-section">
          <b>Dos des cartes</b>
          <SeriesIdentityFields
            typeId={typeId}
            seriesName={gameSeriesName}
            borderRectoId={borderRectoId}
            borderVersoId={borderVersoId}
            fontSize={fontSize}
            alpha={alphaOn}
            onSeriesName={setSeriesName}
            onBorderIds={setBorderIds}
            onFontSize={setFontSize}
            onAlpha={typeId === 'jeux-vocabulaire' ? setAlpha : undefined}
          />
        </div>
      ) : null}
      <b>Cartes</b>
      <ul className="game-entry-list" aria-label="Cartes du jeu">
        {slots.map((entry, index) => {
          const inputId = `${baseId}-img-${index}`
          return (
            <li className="game-entry-row" key={`${typeId}-${index}`}>
              <button
                type="button"
                className={`game-entry-thumb${entry.imageSrc ? ' has-image' : ''}`}
                aria-label={
                  entry.imageSrc
                    ? `Changer l’image de la carte ${index + 1}`
                    : `Ajouter une image à la carte ${index + 1}`
                }
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
                  void onPickImage(index, event.target.files?.[0])
                  event.target.value = ''
                }}
              />
              <input
                className="pill-input game-entry-text"
                type="text"
                maxLength={template.maxTextLen}
                value={entry.text}
                aria-label={`Mot carte ${index + 1}`}
                placeholder={`Mot ${index + 1}`}
                onChange={(event) => updateSlot(index, { text: event.target.value })}
              />
              {entry.imageSrc ? (
                <button
                  type="button"
                  className="game-entry-clear"
                  aria-label={`Retirer l’image de la carte ${index + 1}`}
                  title="Retirer l’image"
                  onClick={() => updateSlot(index, { imageSrc: undefined })}
                >
                  ×
                </button>
              ) : (
                <span className="game-entry-clear is-spacer" aria-hidden />
              )}
            </li>
          )
        })}
      </ul>
      {error ? (
        <p className="questions-overflow-hint" role="alert">
          {error}
        </p>
      ) : (
        <small className="muted">
          {typeId === 'jeux-vocabulaire'
            ? 'Recto images · verso mots seuls (miroir bord long).'
            : typeId === 'jeux-memory'
              ? 'Recto : paires image / mot · verso : logo ClairFLE + série (bord long).'
              : 'JPG, PNG, WebP ou SVG · max. 2,5 Mo'}
        </small>
      )}
    </div>
  )
}
