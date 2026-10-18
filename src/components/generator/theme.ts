export const THEME_STORAGE_KEY = 'clairfle-theme-color'
export const HEX_COLOR = /^#[0-9a-fA-F]{6}$/
/** Arc-en-ciel — tokens `:root` (`--red` … `--purple`). */
export const THEME_COLORS = [
  { id: 'rouge', color: '#b42318', label: 'Rouge' },
  { id: 'orange', color: '#c45c12', label: 'Orange' },
  { id: 'jaune', color: '#a16207', label: 'Jaune' },
  { id: 'vert', color: '#18a66a', label: 'Vert' },
  { id: 'bleu', color: '#2563eb', label: 'Bleu' },
  { id: 'indigo', color: '#4338ca', label: 'Indigo' },
  { id: 'violet', color: '#7c3aed', label: 'Violet' },
] as const
export const THEME_TONES = [
  { id: 'pastel', label: 'Pastel', s: 48, l: 78 },
  { id: 'doux', label: 'Doux', s: 58, l: 64 },
  { id: 'vif', label: 'Vif', s: 84, l: 48 },
  { id: 'profond', label: 'Profond', s: 76, l: 38 },
  { id: 'sombre', label: 'Sombre', s: 72, l: 28 },
] as const

/** Violet à chaque ouverture. Le choix de la session n’est pas conservé. */
export function readThemeColor(): string {
  try {
    window.localStorage.removeItem(THEME_STORAGE_KEY)
  } catch {
    /* ignore */
  }
  return THEME_COLORS[THEME_COLORS.length - 1].color
}

export function contrastOnTheme(hex: string): string {
  const value = Number.parseInt(hex.slice(1), 16)
  const r = (value >> 16) & 255
  const g = (value >> 8) & 255
  const b = value & 255
  const luma = (r * 299 + g * 587 + b * 114) / 1000
  return luma > 160 ? '#28252f' : '#fff'
}

export function hslToHex(h: number, s: number, l: number): string {
  const sat = s / 100
  const light = l / 100
  const chroma = sat * Math.min(light, 1 - light)
  const channel = (n: number) => {
    const k = (n + h / 30) % 12
    const mix = light - chroma * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * mix)
      .toString(16)
      .padStart(2, '0')
  }
  return `#${channel(0)}${channel(8)}${channel(4)}`
}

export function hexToHue(hex: string): number {
  const value = Number.parseInt(hex.slice(1), 16)
  const r = ((value >> 16) & 255) / 255
  const g = ((value >> 8) & 255) / 255
  const b = (value & 255) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min
  if (delta === 0) return 0
  let hue = 0
  if (max === r) hue = ((g - b) / delta) % 6
  else if (max === g) hue = (b - r) / delta + 2
  else hue = (r - g) / delta + 4
  hue *= 60
  if (hue < 0) hue += 360
  return hue
}

export function hueFromPointer(el: HTMLElement, clientX: number, clientY: number): number {
  const rect = el.getBoundingClientRect()
  const x = clientX - rect.left - rect.width / 2
  const y = clientY - rect.top - rect.height / 2
  let deg = (Math.atan2(x, -y) * 180) / Math.PI
  if (deg < 0) deg += 360
  return deg
}
