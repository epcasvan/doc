import { buildAlphaSeriesPages } from '@/alphabetisation/series'
import { ALPHA_THEMES } from '@/alphabetisation/themes'
import { buildSoutienSeriesPages } from '@/francais/soutien/series'
import { SOUTIEN_THEMES, type SoutienLetterOption, type SoutienThemeDef } from '@/francais/soutien/themes'
import type { PageConfig } from '@/math/types'

export type BookKind = 'alpha' | 'soutien'

export type BookLetterFile = {
  themeDir: string
  fileName: string
  label: string
  pages: PageConfig[]
  seed: number
}

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

function safeName(value: string): string {
  return value.replace(/[\\/:*?"<>|]/g, ' ').replace(/\s+/g, ' ').trim()
}

function letterTitle(letter: SoutienLetterOption, mode: 'letter' | 'special'): string {
  if (mode === 'special' && letter.letterUpper.length > 4) return safeName(letter.label)
  return safeName(`Lettre ${letter.letterUpper}`)
}

export function bookFolderName(kind: BookKind, date = new Date()): string {
  const stamp = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
  return kind === 'alpha' ? `alphabetisation_${stamp}` : `soutien_${stamp}`
}

export function bookDisplayName(kind: BookKind, date = new Date()): string {
  const stamp = date.toLocaleDateString('fr-CH', { day: 'numeric', month: 'long', year: 'numeric' })
  return kind === 'alpha' ? `Livre alphabétisation du ${stamp}` : `Livre soutien du ${stamp}`
}

function themesOf(kind: BookKind): Array<SoutienThemeDef & { mode?: 'letter' | 'special' }> {
  return kind === 'alpha' ? [...ALPHA_THEMES] : SOUTIEN_THEMES.map((theme) => ({ ...theme, mode: 'letter' as const }))
}

/** Une fiche complète par lettre, thèmes puis lettres dans l’ordre du catalogue. */
export function planBook(kind: BookKind, bookSeed: number): BookLetterFile[] {
  const files: BookLetterFile[] = []
  const themes = themesOf(kind)
  themes.forEach((theme, themeIndex) => {
    const mode = theme.mode ?? 'letter'
    theme.letters.forEach((letter, letterIndex) => {
      const pages = letter.sounds.flatMap((sound) =>
        kind === 'alpha'
          ? buildAlphaSeriesPages(sound.bankId, theme.id)
          : buildSoutienSeriesPages(sound.bankId, theme.id),
      )
      if (pages.length === 0) return
      files.push({
        themeDir: `${pad(themeIndex + 1)}_${safeName(theme.label)}`,
        fileName: `${pad(letterIndex + 1)}_${letterTitle(letter, mode)}.pdf`,
        label: letterTitle(letter, mode),
        pages,
        seed: bookSeed + files.length * 7919,
      })
    })
  })
  return files
}
