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

/** Silhouettes pleines N&B (réf. TCM ex. 1). */
export function CountIconGlyph({
  kind,
}: {
  kind: CountIconToken['kind']
}) {
  const fill = { fill: 'currentColor', stroke: 'none' as const }
  switch (kind) {
    case 'notes':
      // Deux croches liées (barre).
      return (
        <g {...fill}>
          <ellipse cx="7.2" cy="17.4" rx="3.1" ry="2.35" transform="rotate(-18 7.2 17.4)" />
          <ellipse cx="16.2" cy="15.6" rx="3.1" ry="2.35" transform="rotate(-18 16.2 15.6)" />
          <rect x="9.7" y="6.2" width="1.55" height="11.2" />
          <rect x="18.7" y="4.6" width="1.55" height="11" />
          <path d="M9.7 6.2 H20.25 V9.1 H9.7 Z" />
        </g>
      )
    case 'note':
      return (
        <g {...fill}>
          <ellipse cx="9" cy="17.2" rx="3.3" ry="2.45" transform="rotate(-18 9 17.2)" />
          <rect x="11.6" y="5.2" width="1.6" height="12.2" />
          <path d="M13.2 5.2 C16.8 5.6 19.2 7.4 19.4 10.2 C17.2 9.4 15 8.8 13.2 8.4 Z" />
        </g>
      )
    case 'club':
      return (
        <g {...fill}>
          <circle cx="12" cy="7.6" r="3.5" />
          <circle cx="7.6" cy="12.2" r="3.5" />
          <circle cx="16.4" cy="12.2" r="3.5" />
          <path d="M10.6 13.2 H13.4 L14.2 20.2 H9.8 Z" />
        </g>
      )
    case 'diamond':
      return <path d="M12 3.2 L20.2 12 L12 20.8 L3.8 12 Z" {...fill} />
    case 'heart':
      return (
        <path
          d="M12 20.2 C12 20.2 3.8 14.6 3.8 9.6 A4.1 4.1 0 0 1 12 7.2 A4.1 4.1 0 0 1 20.2 9.6 C20.2 14.6 12 20.2 12 20.2 Z"
          {...fill}
        />
      )
    case 'spade':
      return (
        <g {...fill}>
          <path d="M12 3.4 C12 3.4 4.2 10.2 4.2 14.2 A4 4 0 0 0 12 12.6 A4 4 0 0 0 19.8 14.2 C19.8 10.2 12 3.4 12 3.4 Z" />
          <path d="M10.7 13.4 H13.3 L14.1 20.4 H9.9 Z" />
        </g>
      )
    case 'bolt':
      return <path d="M13.8 2.8 L6.6 13.2 H11.2 L9.4 21.2 L18.2 9.6 H13.4 Z" {...fill} />
    case 'star':
      return (
        <path
          d="M12 3.2l2.35 5.7 6.15.45-4.7 3.95 1.5 5.95L12 15.9 6.7 19.25l1.5-5.95-4.7-3.95 6.15-.45Z"
          {...fill}
        />
      )
    case 'moon':
      return (
        <path
          d="M15.8 4.4 A8.4 8.4 0 1 0 19.6 15.8 A6.5 6.5 0 1 1 15.8 4.4 Z"
          {...fill}
        />
      )
    case 'leaf':
      return (
        <g {...fill}>
          <path d="M5.5 17.5 C6.2 8.2 14.2 3.6 20 4.4 C18.8 12.2 12.2 17.8 5.5 17.5 Z" />
          <path
            d="M8.2 15.8 C11 12.2 14.2 9 18 6.2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.1"
          />
        </g>
      )
    case 'flower':
      return (
        <g {...fill}>
          <circle cx="12" cy="6.4" r="2.7" />
          <circle cx="12" cy="17.6" r="2.7" />
          <circle cx="6.4" cy="12" r="2.7" />
          <circle cx="17.6" cy="12" r="2.7" />
          <circle cx="12" cy="12" r="2.3" />
        </g>
      )
    case 'sun':
      return (
        <g {...fill}>
          <circle cx="12" cy="12" r="4.2" />
          <rect x="11.2" y="2.2" width="1.6" height="3.4" />
          <rect x="11.2" y="18.4" width="1.6" height="3.4" />
          <rect x="2.2" y="11.2" width="3.4" height="1.6" />
          <rect x="18.4" y="11.2" width="3.4" height="1.6" />
          <rect x="11.2" y="2.2" width="1.6" height="3.4" transform="rotate(45 12 12)" />
          <rect x="11.2" y="2.2" width="1.6" height="3.4" transform="rotate(135 12 12)" />
          <rect x="11.2" y="2.2" width="1.6" height="3.4" transform="rotate(225 12 12)" />
          <rect x="11.2" y="2.2" width="1.6" height="3.4" transform="rotate(315 12 12)" />
        </g>
      )
    case 'circle':
      return <circle cx="12" cy="12" r="7.6" {...fill} />
    case 'triangle':
      return <path d="M12 3.4 L21.2 19.8 H2.8 Z" {...fill} />
    case 'cross':
      return (
        <path
          d="M9.2 3.4 H14.8 V9.2 H20.6 V14.8 H14.8 V20.6 H9.2 V14.8 H3.4 V9.2 H9.2 Z"
          {...fill}
        />
      )
    case 'arrow':
      return (
        <path
          d="M12 3.2 L20.4 12.2 H15.2 V20.8 H8.8 V12.2 H3.6 Z"
          {...fill}
        />
      )
    default:
      return <circle cx="12" cy="12" r="7.5" {...fill} />
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

export function MarkLetterBlock({ item, mode }: { item: MathItem; mode: PreviewMode }) {
  const words = item.markLetterWords ?? []
  const graphemes = item.themeGraphemes ?? []
  const show = mode === 'answers'
  return (
    <div
      className={`mark-letter-block${show ? ' is-answers' : ' is-exercise'}`}
      aria-label="Souligner la lettre"
    >
      {item.prompt ? <p className="column-prompt">{item.prompt}</p> : null}
      <div className="mark-letter-grid">
        {words.map((word, index) => (
          <div className="mark-letter-cell" key={`ml-${index}-${word}`}>
            {show && graphemes.length ? highlightThemeLetters(word, graphemes) : word}
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

  const cols = Math.max(1, Math.min(2, item.letterGridCols ?? 1))
  return (
    <div
      className={`syllable-pronounce-block${cols === 2 ? ' is-2col' : ''}`}
      style={
        cols === 2
          ? ({ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' } as CSSProperties)
          : undefined
      }
      aria-label="Prononcer les syllabes"
    >
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
              <span className="syllable-pronounce-cell is-framed" key={`${row.word}-${pIdx}`}>
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
      className={`listen-check-block${withImages ? ' listen-check-block--images' : ''}${withAudio ? ' listen-check-block--audio' : ''}${withImages ? (show ? ' is-answers' : ' is-exercise') : ''}`}
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

  const cols = Math.max(1, clips.length || slots.length || 4)
  return (
    <div
      className={`audio-order-block audio-order-block--${modeKind}`}
      style={{ '--ao-cols': cols } as CSSProperties}
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
            <div className="audio-order-slot-answer">
              <span className="audio-order-slot-label">n° :</span>
              <span className={`audio-order-slot-line${show ? ' filled' : ''}`}>
                {show ? String(slot.correctNum) : '\u00a0'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
