import type { ReactNode } from 'react'
import { lessonPhonemeSegmentsFromGraphemes } from '@/francais/soutien/phoneme'

/** Type 14 : colorie seulement la voyelle simple (Alpha), pas an / au / eau… */
export function highlightLessonPhonemes(text: string, graphemes: readonly string[]): ReactNode[] {
  if (!graphemes.length) return [text]
  return lessonPhonemeSegmentsFromGraphemes(text, graphemes).map((seg, index) => (
    <span key={`lp-${index}`} className={seg.hit ? 'syllable-vowel' : 'syllable-cons'}>
      {seg.text}
    </span>
  ))
}

/**
 * Met en évidence les graphèmes cibles.
 * Une voyelle simple (a, o…) n’est pas marquée si elle entre dans un son
 * complexe (eau, au, an…) : dans « bateau », seul le premier a est en couleur.
 */
export function highlightThemeLetters(text: string, graphemes: readonly string[]): ReactNode[] {
  if (!graphemes.some(Boolean)) return [text]
  return lessonPhonemeSegmentsFromGraphemes(text, graphemes).map((seg, index) => (
    <span key={`th-${index}`} className={seg.hit ? 'syllable-vowel' : 'syllable-cons'}>
      {seg.text}
    </span>
  ))
}
