import { Fragment, useEffect, useState, type CSSProperties } from 'react'
import QRCode from 'qrcode'
import type { CountIconToken, MathItem, PreviewMode } from '@/math/types'
import { soutienAudioAbsoluteUrl } from '@/francais/soutien/audio'
import { highlightLessonPhonemes, highlightThemeLetters } from './highlights'

export function ReadPhrasesBlock({ item }: { item: MathItem }) {
  const phrases = item.readPhrases ?? []
  const graphemes = item.themeGraphemes ?? []
  return (
    <div className="read-phrases-block" aria-label="Phrases à lire">
      <table className="read-phrases-table">
        <tbody>
          {phrases.map((phrase, index) => (
            <tr key={`rp-${index}`}>
              <td className="read-phrases-num">{index + 1}.</td>
              <td className="read-phrases-text">
                {highlightLessonPhonemes(phrase, graphemes)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CountIconGlyph({
  kind,
}: {
  kind: CountIconToken['kind']
}) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }
  switch (kind) {
    case 'circle':
      return <circle cx="12" cy="12" r="7.5" {...common} />
    case 'triangle':
      return <path d="M12 4.5 L20 19 H4 Z" {...common} />
    case 'note':
      return (
        <g {...common}>
          <ellipse cx="8.5" cy="17" rx="3.2" ry="2.4" fill="currentColor" stroke="none" />
          <path d="M11.5 17 V6.5 c0 0 2.2 1.2 5 1.6" />
          <path d="M16.5 8.2 V14" />
          <ellipse cx="13.5" cy="14.2" rx="3" ry="2.2" fill="currentColor" stroke="none" />
        </g>
      )
    case 'notes':
      return (
        <g {...common}>
          <ellipse cx="7" cy="17.2" rx="2.8" ry="2.1" fill="currentColor" stroke="none" />
          <ellipse cx="15.5" cy="15.8" rx="2.8" ry="2.1" fill="currentColor" stroke="none" />
          <path d="M9.7 17 V7.2 H18.2 V15.5" />
          <path d="M9.7 7.2 C12.5 8.6 15.5 8.6 18.2 7.2" />
        </g>
      )
    case 'star':
      return (
        <path
          d="M12 3.5l2.2 5.4 5.8.4-4.4 3.7 1.4 5.6L12 15.6 6.9 18.6l1.4-5.6L4 9.3l5.8-.4Z"
          {...common}
        />
      )
    case 'heart':
      return (
        <path
          d="M12 20 S4.5 14.5 4.5 9.8 A3.8 3.8 0 0 1 12 7.8 A3.8 3.8 0 0 1 19.5 9.8 C19.5 14.5 12 20 12 20 Z"
          {...common}
        />
      )
    case 'leaf':
      return (
        <g {...common}>
          <path d="M6 17 C7 8 14 4 19 5 C18 12 12 17 6 17 Z" />
          <path d="M8.5 15.5 C11 12 14 9 17.5 6.5" />
        </g>
      )
    case 'moon':
      return (
        <path
          d="M15.5 4.8 A8.2 8.2 0 1 0 19.2 15.5 A6.4 6.4 0 1 1 15.5 4.8 Z"
          {...common}
        />
      )
    case 'bolt':
      return <path d="M13.5 3.5 L7.5 13 h4.2 L9.8 20.5 L17.5 10.2 h-4.1 Z" {...common} />
    case 'flower':
      return (
        <g {...common}>
          <circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none" />
          <circle cx="12" cy="6.2" r="2.4" />
          <circle cx="12" cy="17.8" r="2.4" />
          <circle cx="6.2" cy="12" r="2.4" />
          <circle cx="17.8" cy="12" r="2.4" />
        </g>
      )
    default:
      return <circle cx="12" cy="12" r="7.5" {...common} />
  }
}

export function CountIconsBlock({ item, mode }: { item: MathItem; mode: PreviewMode }) {
  const scene = item.countIcons
  const show = mode === 'answers'
  if (!scene) return null
  return (
    <div className="count-icons-block" aria-label="Compter les formes">
      <div className="count-icons-frame" role="img" aria-label={`Cadre avec ${scene.label}`}>
        {scene.tokens.map((token, index) => (
          <span
            key={`ci-${index}`}
            className={`count-icon-token kind-${token.kind}`}
            style={{
              left: `${token.x}%`,
              top: `${token.y}%`,
              width: `${token.size}%`,
              transform: `translate(-50%, -50%) rotate(${token.rot}deg)`,
            }}
          >
            <svg viewBox="0 0 24 24" aria-hidden focusable="false">
              <CountIconGlyph kind={token.kind} />
            </svg>
          </span>
        ))}
      </div>
      <p className="count-icons-caption">
        Il y a{' '}
        <span className={`answer-line-field compact count-icons-blank${show ? ' filled' : ''}`}>
          {show ? String(scene.targetCount) : '\u00a0'}
        </span>{' '}
        {scene.label}{' '}
        <span className="count-icons-caption-icon" aria-hidden>
          <svg viewBox="0 0 24 24" focusable="false">
            <CountIconGlyph kind={scene.targetKind} />
          </svg>
        </span>
      </p>
    </div>
  )
}

export function CountSoundBlock({ item, mode }: { item: MathItem; mode: PreviewMode }) {
  const rows = item.countSoundItems ?? []
  const show = mode === 'answers'
  return (
    <div className="count-sound-block" aria-label="Compter le son">
      <table className="count-sound-table">
        <tbody>
          {rows.map((row, index) => (
            <Fragment key={`csr-${index}`}>
              <tr className="count-sound-prompt-row">
                <td className="count-sound-num" rowSpan={2}>
                  {index + 1}.
                </td>
                <td className="count-sound-prompt-cell">
                  <span className="count-sound-prompt">
                    J’entends{' '}
                    <span className={`count-sound-blank${show ? ' filled' : ''}`}>
                      {show ? String(row.count) : '\u00a0'}
                    </span>{' '}
                    fois le son.
                  </span>
                </td>
              </tr>
              <tr className="count-sound-phrase-row">
                <td className="count-sound-phrase-cell">
                  <p className="count-sound-phrase">{row.phrase}</p>
                </td>
              </tr>
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function DicteeGridBlock({ item, mode }: { item: MathItem; mode: PreviewMode }) {
  const words = item.dicteeWords ?? []
  const graphemes = item.themeGraphemes ?? []
  const show = mode === 'answers'
  const paint = (word?: string) =>
    word
      ? graphemes.length
        ? highlightThemeLetters(word, graphemes)
        : word
      : '\u00a0'
  /** Grille 2 colonnes ; nombre de lignes = ceil(n / 2). */
  const rowCount = Math.max(1, Math.ceil(words.length / 2))
  const rows = Array.from({ length: rowCount }, (_, r) => ({
    left: { n: r + 1, word: words[r] },
    right: { n: r + 1 + rowCount, word: words[r + rowCount] },
  }))
  return (
    <div className="dictee-grid-block" aria-label="Dictée">
      <table className="dictee-grid-table">
        <tbody>
          {rows.map((row, ri) => (
            <tr key={`dg-${ri}`}>
              <td className="dictee-grid-num">{row.left.word ? `${row.left.n}.` : ''}</td>
              <td className="dictee-grid-line-cell">
                {row.left.word != null ? (
                  <span className={`dictee-write-line${show ? ' filled' : ''}`}>
                    {show ? paint(row.left.word) : '\u00a0'}
                  </span>
                ) : null}
              </td>
              <td className="dictee-grid-gutter" aria-hidden />
              <td className="dictee-grid-num">{row.right.word ? `${row.right.n}.` : ''}</td>
              <td className="dictee-grid-line-cell">
                {row.right.word != null ? (
                  <span className={`dictee-write-line${show ? ' filled' : ''}`}>
                    {show ? paint(row.right.word) : '\u00a0'}
                  </span>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function DeterminantFillBlock({ item, mode }: { item: MathItem; mode: PreviewMode }) {
  const rows = item.determinantFills ?? []
  const graphemes = item.themeGraphemes ?? []
  const show = mode === 'answers'
  return (
    <div className="determinant-fill-block" aria-label="Déterminants">
      {/* Consigne unique = en-tête d’exercice (l’ / le / la / les stylés). */}
      <table className="determinant-fill-table">
        <tbody>
          {rows.map((row, index) => (
            <tr key={`det-${index}`}>
              <td className="determinant-fill-num">{index + 1}.</td>
              <td className="determinant-fill-text">
                {row.parts.map((part, pi) => {
                  if ('blank' in part) {
                    return (
                      <span
                        key={`b-${pi}`}
                        className={`determinant-blank${show ? ' filled' : ''}`}
                      >
                        {show ? part.blank : '\u00a0'}
                      </span>
                    )
                  }
                  return (
                    <span key={`t-${pi}`}>{highlightLessonPhonemes(part.t, graphemes)}</span>
                  )
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function PhraseScrambleBlock({ item, mode }: { item: MathItem; mode: PreviewMode }) {
  const rows = item.phraseScrambles ?? []
  const graphemes = item.themeGraphemes ?? []
  const show = mode === 'answers'
  const paint = (text: string) =>
    graphemes.length ? highlightLessonPhonemes(text, graphemes) : text
  return (
    <div className="phrase-scramble-block" aria-label="Mot dans la phrase">
      {item.prompt ? <p className="column-prompt">{item.prompt}</p> : null}
      <table className="phrase-scramble-table">
        <tbody>
          {rows.map((row, index) => {
            const blankCh = Math.max(6, Math.min(14, row.word.length + 2))
            return (
              <tr key={`ps-${index}-${row.word}`}>
                <td className="phrase-scramble-num">{index + 1}.</td>
                <td className="phrase-scramble-image">
                  {row.imageSrc ? (
                    <img src={row.imageSrc} alt="" />
                  ) : (
                    <span className="vocab-card-empty" aria-hidden />
                  )}
                </td>
                <td className="phrase-scramble-text">
                  <div className="phrase-scramble-line">
                    <span className="phrase-scramble-sentence">
                      {paint(row.before)}
                      <span
                        className={`phrase-scramble-blank${show ? ' filled' : ''}`}
                        style={{ width: `${blankCh}ch` }}
                      >
                        {show ? paint(row.word) : '\u00a0'}
                      </span>
                      {paint(row.after)}
                    </span>
                  </div>
                  <div className="phrase-scramble-letters">({paint(row.letters)})</div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export function MarkLetterBlock({ item }: { item: MathItem }) {
  const words = item.markLetterWords ?? []
  return (
    <div className="mark-letter-block" aria-label="Souligner la lettre">
      {item.prompt ? <p className="column-prompt">{item.prompt}</p> : null}
      <div className="mark-letter-grid">
        {words.map((word, index) => (
          <div className="mark-letter-cell" key={`ml-${index}-${word}`}>
            {word}
          </div>
        ))}
      </div>
    </div>
  )
}

export function SyllablePronounceBlock({ item }: { item: MathItem }) {
  const rows = item.syllablePronounceRows ?? []
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
              margin: 0,
              width: 56,
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
    <div className="syllable-pronounce-block" aria-label="Prononcer les syllabes">
      {rows.map((row, index) => (
        <div className="syllable-pronounce-row" key={`sp-${index}-${row.word}`}>
          <span className="syllable-pronounce-num">{row.index}.</span>
          <div className="syllable-pronounce-qr">
            {qrSrcs[index] ? (
              <img src={qrSrcs[index]} alt="" />
            ) : (
              <span className="audio-order-qr-ph" aria-hidden />
            )}
          </div>
          <div className="syllable-pronounce-cells">
            {row.parts.map((part, pIdx) => (
              <span className="syllable-pronounce-cell" key={`${row.word}-${pIdx}`}>
                {part}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function SyllableSoundBlock({ item, mode }: { item: MathItem; mode: PreviewMode }) {
  const rows = item.syllableSoundItems ?? []
  const cols = Math.max(1, item.letterGridCols ?? 3)
  const graphemes = item.themeGraphemes ?? []
  const qrOnly = Boolean(item.syllableSoundQrOnly)
  const show = mode === 'answers'
  const [qrSrcs, setQrSrcs] = useState<string[]>(() => rows.map(() => ''))
  const audioKey = qrOnly ? rows.map((r) => r.audioSrc ?? '').join('|') : ''

  useEffect(() => {
    if (!qrOnly) return
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
  }, [audioKey, qrOnly])

  return (
    <div className="syllable-sound-block" aria-label="Syllabe du son">
      {item.prompt ? <p className="column-prompt">{item.prompt}</p> : null}
      <div
        className="syllable-sound-grid"
        style={
          {
            '--ss-cols': cols,
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          } as CSSProperties
        }
      >
        {rows.map((row, index) => (
          <div className="syllable-sound-card" key={`ss-${index}-${row.word}`}>
            <div className="syllable-sound-image">
              {qrOnly ? (
                qrSrcs[index] ? (
                  <img src={qrSrcs[index]} alt="" className="syllable-sound-qr-img" />
                ) : (
                  <span className="vocab-card-empty" aria-hidden />
                )
              ) : row.imageSrc ? (
                <img src={row.imageSrc} alt="" />
              ) : (
                <span className="vocab-card-empty" aria-hidden />
              )}
            </div>
            <div className="syllable-sound-foot">
              <span className="syllable-sound-num">{index + 1}.</span>
              <table className="syllable-mini-table" aria-label={`${row.parts.length} syllabes`}>
                <tbody>
                  <tr>
                    {row.parts.map((part, pIdx) => {
                      const hits =
                        row.hitIndices && row.hitIndices.length > 0
                          ? row.hitIndices
                          : row.hitIndex >= 0
                            ? [row.hitIndex]
                            : []
                      const hit = show && hits.includes(pIdx)
                      return (
                        <td
                          key={`${row.word}-${pIdx}`}
                          className={hit ? 'is-hit' : undefined}
                        >
                          {show
                            ? graphemes.length
                              ? highlightThemeLetters(part, graphemes)
                              : part
                            : '\u00a0'}
                        </td>
                      )
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ListenCheckBlock({ item, mode }: { item: MathItem; mode: PreviewMode }) {
  const words = item.options ?? []
  const images = item.optionImages ?? []
  const audios = item.optionAudioSrcs ?? []
  const withImages =
    images.length > 0 &&
    images.length === words.length &&
    images.every((src) => Boolean(src) && !src.endsWith('.mp3') && !src.includes('/audio/'))
  const withAudio = !withImages && audios.some(Boolean)
  const positives = new Set((item.labels ?? []).map((w) => w.toLowerCase()))
  const graphemes = item.themeGraphemes ?? []
  const cols = Math.max(1, item.letterGridCols ?? (withImages ? 5 : 3))
  const show = mode === 'answers'
  const [qrSrcs, setQrSrcs] = useState<string[]>(() => audios.map(() => ''))
  const audioKey = withAudio ? audios.join('|') : ''

  useEffect(() => {
    if (!withAudio) return
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
  }, [withAudio, audioKey])

  return (
    <div
      className={`listen-check-block${withImages ? ' listen-check-block--images' : ''}${withAudio ? ' listen-check-block--audio' : ''}`}
      aria-label="Entendre le son"
    >
      {item.prompt ? <p className="column-prompt">{item.prompt}</p> : null}
      <div
        className={`listen-check-grid${withImages ? ' listen-check-grid--images' : ''}`}
        style={
          {
            '--lc-cols': cols,
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          } as CSSProperties
        }
      >
        {words.map((word, index) => {
          const hit = positives.has(word.toLowerCase())
          if (withImages) {
            return (
              <div
                className={`listen-check-image-cell${show && hit ? ' is-hit' : ''}`}
                key={`lci-${index}-${word}`}
              >
                <div className="listen-check-image">
                  {images[index] ? (
                    <img src={images[index]} alt="" />
                  ) : (
                    <span className="vocab-card-empty" aria-hidden />
                  )}
                </div>
                <div className="listen-check-image-foot">
                  <div className="listen-check-image-controls">
                    <span className="listen-check-num">{index + 1}.</span>
                    <span
                      className={`listen-check-box${show && hit ? ' checked' : ''}`}
                      aria-hidden
                    >
                      {show && hit ? '✓' : ''}
                    </span>
                  </div>
                  <span className="listen-check-caption">
                    {show
                      ? graphemes.length
                        ? highlightThemeLetters(word, graphemes)
                        : word
                      : '\u00a0'}
                  </span>
                </div>
              </div>
            )
          }
          return (
            <div
              className={`listen-check-cell${show && hit ? ' is-hit' : ''}`}
              key={`lc-${index}-${word}`}
            >
              {withAudio ? (
                <span className="listen-check-qr">
                  {qrSrcs[index] ? (
                    <img src={qrSrcs[index]} alt={`Audio ${index + 1}`} />
                  ) : (
                    <span className="listen-check-qr-ph" aria-hidden />
                  )}
                </span>
              ) : null}
              <span className="listen-check-num">{index + 1}.</span>
              <span
                className={`listen-check-box${show && hit ? ' checked' : ''}`}
                aria-hidden
              >
                {show && hit ? '✓' : ''}
              </span>
              <span className={`listen-check-line${show ? ' filled' : ''}`}>
                {show
                  ? graphemes.length
                    ? highlightThemeLetters(word, graphemes)
                    : word
                  : '\u00a0'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function SyllableCompleteBlock({ item, mode }: { item: MathItem; mode: PreviewMode }) {
  const rows = item.syllableCompletes ?? []
  const cols = Math.max(1, item.vocabCols ?? 2)
  const graphemes = item.themeGraphemes ?? []
  const show = mode === 'answers'
  const paint = (text: string) =>
    graphemes.length ? highlightThemeLetters(text, graphemes) : text
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
    <div className="syllable-complete-block" aria-label="Compléter les mots">
      {item.prompt ? <p className="column-prompt">{item.prompt}</p> : null}
      <div
        className="syllable-complete-grid"
        style={{ '--sc-cols': cols } as CSSProperties}
      >
        {rows.map((row, index) => {
          const blankCh = Math.max(2, Math.min(4, row.blank.length + 1))
          return (
            <div className="syllable-complete-card" key={`sc-${index}-${row.word}`}>
              <div className="syllable-complete-image">
                {row.imageSrc ? (
                  <img src={row.imageSrc} alt="" />
                ) : (
                  <span className="vocab-card-empty" aria-hidden />
                )}
              </div>
              <div className="syllable-complete-text">
                <span className="syllable-complete-article">{paint(row.article)}</span>
                {row.before ? (
                  <span className="syllable-complete-affix">{paint(row.before)}</span>
                ) : null}
                <span
                  className={`syllable-complete-blank${show ? ' filled' : ''}`}
                  style={{ width: `${blankCh}ch` }}
                >
                  {show ? paint(row.blank) : '\u00a0'}
                </span>
                {row.after ? (
                  <span className="syllable-complete-affix">{paint(row.after)}</span>
                ) : null}
              </div>
              <div className="syllable-complete-qr">
                {qrSrcs[index] ? (
                  <img src={qrSrcs[index]} alt={row.word ? `Audio ${row.word}` : ''} />
                ) : (
                  <span className="syllable-complete-qr-ph" aria-hidden />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/** Types 15 / 16 — 8 QR numérotés + 8 cases (mots ou images) avec trait. */
export function AudioOrderBlock({ item, mode }: { item: MathItem; mode: PreviewMode }) {
  const data = item.audioOrder
  const show = mode === 'answers'
  const clips = data?.clips ?? []
  const slots = data?.slots ?? []
  const modeKind = data?.mode ?? 'words'
  const [qrSrcs, setQrSrcs] = useState<string[]>(() => clips.map(() => ''))

  const audioKey = clips.map((c) => c.audioSrc ?? '').join('|')
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

  if (!data) return null

  return (
    <div
      className={`audio-order-block audio-order-block--${modeKind}`}
      aria-label={modeKind === 'images' ? 'Classer les images' : 'Classer les mots'}
    >
      <div className="audio-order-qr-row">
        {clips.map((clip, index) => (
          <div className="audio-order-qr-cell" key={`ao-qr-${index}-${clip.word}`}>
            <span className="audio-order-qr-num">{index + 1}</span>
            <div className="audio-order-qr">
              {qrSrcs[index] ? (
                <img src={qrSrcs[index]} alt={`Audio ${index + 1}`} />
              ) : (
                <span className="audio-order-qr-ph" aria-hidden />
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="audio-order-answer-row">
        {slots.map((slot, index) => (
          <div className="audio-order-slot" key={`ao-slot-${index}-${slot.word ?? slot.correctNum}`}>
            {modeKind === 'images' ? (
              <div className="audio-order-slot-image">
                {slot.imageSrc ? (
                  <img src={slot.imageSrc} alt="" />
                ) : (
                  <span className="vocab-card-empty" aria-hidden />
                )}
              </div>
            ) : (
              <div className="audio-order-slot-word">{slot.word ?? ''}</div>
            )}
            <div className={`audio-order-slot-line${show ? ' filled' : ''}`}>
              {show ? String(slot.correctNum) : '\u00a0'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
