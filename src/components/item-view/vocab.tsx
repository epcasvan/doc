import { useEffect, useState, type CSSProperties } from 'react'
import QRCode from 'qrcode'
import type { MathItem, PreviewMode } from '@/math/types'
import { displayVocabLabel } from '@/francais/display-vocab-label'
import { soutienAudioAbsoluteUrl } from '@/francais/soutien/audio'
import { highlightThemeLetters } from './highlights'

export function VocabTable({ item }: { item: MathItem }) {
  const rows = Math.max(1, item.vocabRows ?? 4)
  const cols = Math.max(1, item.vocabCols ?? 4)
  const entries = item.vocabEntries ?? []
  const cells = Array.from({ length: rows * cols }, (_, index) => entries[index] ?? null)
  const themeLetters = item.labels ?? []
  const highlight = themeLetters.length > 0
  const [qrSrcs, setQrSrcs] = useState<string[]>(() => cells.map(() => ''))

  const audioKey = cells.map((e) => e?.audioSrc ?? '').join('|')
  useEffect(() => {
    let cancelled = false
    const srcs = audioKey.split('|')
    const run = async () => {
      const next = await Promise.all(
        srcs.map(async (audioSrc) => {
          if (!audioSrc) return ''
          try {
            return await QRCode.toDataURL(soutienAudioAbsoluteUrl(audioSrc), {
              margin: 0,
              width: 72,
              errorCorrectionLevel: 'M',
              color: { dark: '#111111', light: '#ffffff' },
            })
          } catch {
            return ''
          }
        }),
      )
      if (!cancelled) setQrSrcs(next)
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [audioKey])

  return (
    <div
      className={`vocab-table${highlight ? ' vocab-table--theme-letters' : ''} vocab-table--qr`}
      style={{ '--vocab-cols': cols, '--vocab-rows': rows } as CSSProperties}
      aria-label="Mots à apprendre"
    >
      {cells.map((entry, index) => (
        <div className="vocab-card" key={`card-${index}`}>
          <div className="vocab-card-top">
            <div className="vocab-card-qr">
              {qrSrcs[index] ? (
                <img src={qrSrcs[index]} alt={entry?.label ? `Audio ${entry.label}` : ''} />
              ) : (
                <span className="vocab-card-qr-ph" aria-hidden />
              )}
            </div>
          </div>
          <div className="vocab-card-image">
            {entry?.imageSrc ? (
              <img src={entry.imageSrc} alt="" />
            ) : (
              <span className="vocab-card-empty" aria-hidden />
            )}
          </div>
          <div className="vocab-card-word">
            {entry?.label
              ? (() => {
                  const label = displayVocabLabel(entry.label)
                  return highlight
                    ? highlightThemeLetters(label, themeLetters)
                    : label
                })()
              : ''}
          </div>
        </div>
      ))}
    </div>
  )
}

export function VocabMatch({ item, mode }: { item: MathItem; mode: PreviewMode }) {
  const left = item.labels ?? []
  const right = item.options ?? []
  const pairs = item.vocabPairs ?? []
  const byLeft = new Map(pairs.map((pair) => [pair.left, pair.right]))
  const imageMode = item.vocabMatchMode === 'image'
  const syllableMode = item.vocabMatchMode === 'syllables'
  const graphemes = item.themeGraphemes ?? []

  if (syllableMode) {
    const colCount = Math.max(1, Math.min(2, item.letterGridCols ?? 1))
    const mid = colCount === 2 ? Math.ceil(left.length / 2) : left.length
    const columns =
      colCount === 2
        ? [
            { left: left.slice(0, mid), right: right.slice(0, mid), offset: 0 },
            { left: left.slice(mid), right: right.slice(mid), offset: mid },
          ]
        : [{ left, right, offset: 0 }]

    const renderTable = (
      colLeft: string[],
      colRight: string[],
      offset: number,
      key: string,
    ) => (
      <table className="syllable-match-table" key={key}>
        <tbody>
          {colLeft.map((leftPart, index) => {
            const rightPart = colRight[index] ?? ''
            const globalIndex = offset + index
            const matchLeft =
              mode === 'answers'
                ? left.find((l) => byLeft.get(l) === rightPart)
                : undefined
            const matchNum =
              matchLeft != null ? left.findIndex((l) => l === matchLeft) + 1 : 0
            return (
              <tr key={`sm-${key}-${index}`}>
                <td className="syllable-match-num">{globalIndex + 1}.</td>
                <td className="syllable-match-left">
                  {highlightThemeLetters(leftPart, graphemes)}
                </td>
                <td className="syllable-match-dot-cell syllable-match-dot-cell--left" aria-hidden>
                  <span className="syllable-match-dot">●</span>
                </td>
                <td className="syllable-match-gap" aria-hidden />
                <td className="syllable-match-dot-cell syllable-match-dot-cell--right" aria-hidden>
                  <span className="syllable-match-dot">●</span>
                </td>
                <td className="syllable-match-right">
                  {highlightThemeLetters(rightPart, graphemes)}
                  {mode === 'answers' && matchNum > 0 ? (
                    <span className="syllable-match-key"> ← {matchNum}</span>
                  ) : null}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    )

    return (
      <div
        className={`vocab-match vocab-match--syllables${colCount === 2 ? ' is-2col' : ''}`}
        aria-label="Relier les syllabes"
      >
        {item.prompt ? <p className="column-prompt">{item.prompt}</p> : null}
        <div className={`syllable-match-columns${colCount === 2 ? ' is-2' : ''}`}>
          {columns.map((col, i) =>
            col.left.length
              ? renderTable(col.left, col.right, col.offset, `c${i}`)
              : null,
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="vocab-match" aria-label="Association">
      {item.prompt ? <p className="column-prompt">{item.prompt}</p> : null}
      <div className="vocab-match-grid">
        <div className="vocab-match-col">
          {left.map((value, index) => (
            <div className="vocab-match-item" key={`L-${index}`}>
              <span className="vocab-match-num">{index + 1}.</span>
              {imageMode ? (
                <img className="vocab-match-img" src={value} alt="" />
              ) : (
                <span className="vocab-match-text">{value}</span>
              )}
            </div>
          ))}
        </div>
        <div className="vocab-match-col">
          {right.map((value, index) => (
            <div className="vocab-match-item" key={`R-${index}`}>
              <span className="vocab-match-num">{String.fromCharCode(65 + index)}.</span>
              <span className="vocab-match-text">
                {mode === 'answers'
                  ? `${value}${
                      [...byLeft.entries()].find(([, rightLabel]) => rightLabel === value)
                        ? ` ← ${
                            left.findIndex(
                              (leftValue) => byLeft.get(leftValue) === value,
                            ) + 1
                          }`
                        : ''
                    }`
                  : value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function VocabWrite({ item, mode }: { item: MathItem; mode: PreviewMode }) {
  const show = mode === 'answers'
  const ch = Math.max(4, item.vocabLineCh ?? 12)
  return (
    <div className="vocab-write prompt-stack">
      {item.prompt ? <p className="column-prompt">{item.prompt}</p> : null}
      {item.vocabDictee && show ? <p className="vocab-dictee-answer">{item.vocabDictee}</p> : null}
      <span
        className={`answer-line-field vocab-answer-line${show ? ' filled' : ''}`}
        style={{ width: `${ch}ch`, maxWidth: '100%' }}
      >
        {show ? item.answer : '\u00a0'}
      </span>
    </div>
  )
}

export function WordSearchBlock({ item, mode }: { item: MathItem; mode: PreviewMode }) {
  const puzzle = item.wordSearch
  if (!puzzle) return null
  const show = mode === 'answers'
  const hits = new Set(puzzle.hitCells ?? [])
  const graphemes = item.themeGraphemes ?? []
  const words = puzzle.words
  const cols = 4
  const wordRows: string[][] = []
  for (let i = 0; i < words.length; i += cols) {
    wordRows.push(words.slice(i, i + cols))
  }
  return (
    <div className="word-search-block" aria-label="Mots mêlés">
      {item.prompt ? <p className="column-prompt">{item.prompt}</p> : null}
      <table className="word-search-list">
        <tbody>
          {wordRows.map((row, ri) => (
            <tr key={`wsl-${ri}`}>
              {Array.from({ length: cols }, (_, ci) => {
                const w = row[ci]
                return (
                  <td key={`wsl-${ri}-${ci}`} className="word-search-list-cell">
                    {w ? (
                      <span className="word-search-list-word">
                        {graphemes.length ? highlightThemeLetters(w, graphemes) : w}
                      </span>
                    ) : null}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <table className="word-search-grid" aria-label="Grille">
        <tbody>
          {puzzle.grid.map((line, r) => (
            <tr key={`wsg-${r}`}>
              {line.map((letter, c) => {
                const hit = show && hits.has(`${r},${c}`)
                return (
                  <td
                    key={`wsg-${r}-${c}`}
                    className={`word-search-cell${hit ? ' is-hit' : ''}`}
                  >
                    {letter}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function AudioMatchBlock({ item, mode }: { item: MathItem; mode: PreviewMode }) {
  const rows = item.audioMatchRows ?? []
  const graphemes = item.themeGraphemes ?? []
  const show = mode === 'answers'
  const [qrSrcs, setQrSrcs] = useState<string[]>(() => rows.map(() => ''))

  const audioKey = rows.map((r) => r.audioSrc ?? '').join('|')
  useEffect(() => {
    let cancelled = false
    const srcs = audioKey.split('|')
    const run = async () => {
      const next = await Promise.all(
        srcs.map(async (audioSrc) => {
          if (!audioSrc) return ''
          try {
            return await QRCode.toDataURL(soutienAudioAbsoluteUrl(audioSrc), {
              margin: 1,
              width: 96,
              errorCorrectionLevel: 'M',
              color: { dark: '#111111', light: '#ffffff' },
            })
          } catch {
            return ''
          }
        }),
      )
      if (!cancelled) setQrSrcs(next)
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [audioKey])

  return (
    <div className="audio-match-block" aria-label="Écouter et relier">
      {item.prompt ? <p className="column-prompt">{item.prompt}</p> : null}
      <table className="audio-match-table">
        <tbody>
          {rows.map((row, index) => {
            const matchNum =
              show
                ? rows.findIndex((r) => r.listenWord === row.showWord) + 1
                : 0
            return (
              <tr key={`am-${index}-${row.listenWord}`}>
                <td className="audio-match-num">{index + 1}.</td>
                <td className="audio-match-qr">
                  {qrSrcs[index] ? (
                    <img src={qrSrcs[index]} alt={`Audio ${index + 1}`} />
                  ) : (
                    <span className="audio-match-qr-ph" aria-hidden />
                  )}
                </td>
                <td className="audio-match-dot" aria-hidden>
                  ●
                </td>
                <td className="audio-match-gap" aria-hidden />
                <td className="audio-match-dot" aria-hidden>
                  ●
                </td>
                <td className="audio-match-word">
                  <span className="audio-match-word-text">
                    {highlightThemeLetters(row.showWord, graphemes)}
                  </span>
                  {show && matchNum > 0 ? (
                    <span className="audio-match-key"> ← {matchNum}</span>
                  ) : null}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export function LetterGridRow({ item, mode }: { item: MathItem; mode: PreviewMode }) {
  const options = item.options ?? []
  const targets = new Set(
    (item.labels ?? []).map((s) => s.toLowerCase()).filter(Boolean),
  )
  if (targets.size === 0 && item.answer) {
    for (const ch of item.answer) {
      if (/[A-Za-zÀ-ÿ]/.test(ch)) targets.add(ch.toLowerCase())
    }
  }
  const isTable = item.letterGridVariant === 'table'
  const cols = Math.max(1, item.letterGridCols ?? (isTable ? 8 : 8))

  if (isTable) {
    const rows: string[][] = []
    for (let i = 0; i < options.length; i += cols) {
      rows.push(options.slice(i, i + cols))
    }
    return (
      <div className="letter-grid-block letter-grid-block--table" aria-label="Grille de lettres">
        {item.prompt && <p className="column-prompt">{item.prompt}</p>}
        <table className="letter-table">
          <tbody>
            {rows.map((row, rIdx) => (
              <tr key={`r-${rIdx}`}>
                {row.map((letter, cIdx) => {
                  const isLower =
                    letter.length === 1 &&
                    letter === letter.toLowerCase() &&
                    letter !== letter.toUpperCase()
                  const hit = mode === 'answers' && targets.has(letter.toLowerCase())
                  return (
                    <td key={`${rIdx}-${cIdx}-${letter}`}>
                      <span
                        className={[
                          'letter-table-cell',
                          isLower ? 'letter-table-cell--lower' : 'letter-table-cell--upper',
                          hit ? 'selected' : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        {letter}
                      </span>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="letter-grid-block" aria-label="Grille de lettres">
      {item.prompt && <p className="column-prompt">{item.prompt}</p>}
      <div className="letter-grid" role="group" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {options.map((letter, index) => {
          const hit = mode === 'answers' && targets.has(letter.toLowerCase())
          return (
            <span key={`${letter}-${index}`} className={`letter-cell ${hit ? 'selected' : ''}`}>
              {letter}
            </span>
          )
        })}
      </div>
    </div>
  )
}

export function SyllableTableBlock({ item }: { item: MathItem }) {
  const options = item.options ?? []
  const graphemes = item.labels ?? []
  const cols = Math.max(1, item.letterGridCols ?? 5)
  const rows: string[][] = []
  for (let i = 0; i < options.length; i += cols) {
    rows.push(options.slice(i, i + cols))
  }

  const renderTable = (variant: 'script' | 'playwrite') => (
    <div className="syllable-table-frame">
      <table
        className={`syllable-table syllable-table--${variant}`}
        aria-label={variant === 'script' ? 'Syllabes en script' : 'Syllabes en écriture Playwrite'}
      >
        <tbody>
          {rows.map((row, rIdx) => (
            <tr key={`${variant}-r-${rIdx}`}>
              {row.map((syllable, cIdx) => (
                <td key={`${variant}-${rIdx}-${cIdx}-${syllable}`}>
                  <span className="syllable-table-cell">
                    {highlightThemeLetters(syllable, graphemes)}
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const scriptOnly = Boolean(item.syllableTableScriptOnly)
  return (
    <div className="syllable-table-block" aria-label="Lecture de syllabes">
      {item.prompt && <p className="column-prompt">{item.prompt}</p>}
      {renderTable('script')}
      {!scriptOnly ? renderTable('playwrite') : null}
    </div>
  )
}
