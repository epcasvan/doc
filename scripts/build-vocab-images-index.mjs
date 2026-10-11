#!/usr/bin/env node
/**
 * Régénère src/jeux/vocab-images.ts à partir des dossiers
 * public/lib/images/vocabulaire/{theme}/{slug}.webp.
 * Le libellé d’un mot est son slug ; les thèmes sont triés par libellé.
 */
import { readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()
const IMG_DIR = join(ROOT, 'public/lib/images/vocabulaire')
const OUT = join(ROOT, 'src/jeux/vocab-images.ts')

const THEME_LABELS = {
  accessoires: 'Accessoires',
  actions: 'Actions et situations',
  aliments: 'Aliments',
  'animaux-aquatiques': 'Animaux aquatiques',
  'animaux-sauvages': 'Animaux sauvages',
  'argent-administration': 'Argent et papiers',
  autre: 'Autre',
  boissons: 'Boissons',
  'ciel-espace': 'Ciel et espace',
  corps: 'Corps',
  couleurs: 'Couleurs',
  cuisine: 'Cuisine',
  desserts: 'Desserts',
  'famille-personnes': 'Famille et personnes',
  'animaux-ferme-compagnie': 'Ferme et compagnie',
  formes: 'Formes',
  fruits: 'Fruits',
  'heure-horloge': 'Heure et horloge',
  hygiene: 'Hygiène',
  'insectes-petites-betes': 'Insectes et petites bêtes',
  loisirs: 'Loisirs',
  legumes: 'Légumes',
  maison: 'Maison',
  materiaux: 'Matériaux',
  musique: 'Musique',
  metiers: 'Métiers',
  meteo: 'Météo',
  nature: 'Nature',
  'nombres-mesures': 'Nombres et mesures',
  objets: 'Objets',
  oiseaux: 'Oiseaux',
  orientation: 'Orientation',
  outils: 'Outils',
  pays: 'Pays',
  presenter: 'Se présenter',
  plantes: 'Plantes',
  sante: 'Santé',
  sports: 'Sports',
  technologie: 'Technologie',
  'temps-calendrier': 'Temps et calendrier',
  transports: 'Transports',
  ville: 'Ville',
  voyage: 'Voyage',
  vetements: 'Vêtements',
  'ecole-bureau': 'École et bureau',
  electromenager: 'Électroménager',
  'epices-herbes': 'Épices et herbes',
}

const byCodePoint = (a, b) => (a < b ? -1 : a > b ? 1 : 0)

/** Slug fichier → libellé affiché (espaces, pas de tirets « de / d’ / à »). */
function displayVocabLabel(raw) {
  let s = String(raw || '').trim()
  if (!s || !s.includes('-')) return s
  s = s.replace(/-des-/gi, ' des ')
  s = s.replace(/-de-/gi, ' de ')
  s = s.replace(/-du-/gi, ' du ')
  s = s.replace(/-aux-/gi, ' aux ')
  s = s.replace(/-au-/gi, ' au ')
  s = s.replace(/-en-/gi, ' en ')
  s = s.replace(/-a-/gi, ' à ')
  s = s.replace(/-d-/gi, " d'")
  s = s.replace(/-l-/gi, " l'")
  s = s.replace(/-/g, ' ')
  s = s.replace(/\s+/g, ' ').trim()
  s = s.replace(/([dlmnstc])'\s+/gi, "$1'")
  return s
}

const themes = readdirSync(IMG_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .map((id) => {
    const label = THEME_LABELS[id]
    if (!label) throw new Error(`Thème sans libellé dans THEME_LABELS : ${id}`)
    const files = readdirSync(join(IMG_DIR, id))
      .filter((f) => f.endsWith('.webp'))
      .sort(byCodePoint)
    const words = files.map((f) => {
      const slug = f.slice(0, -'.webp'.length)
      return {
        label: displayVocabLabel(slug),
        src: `/lib/images/vocabulaire/${id}/${f}`,
        slug,
      }
    })
    return { id, label, words }
  })
  .sort((a, b) => byCodePoint(a.label, b.label))

const byLabel = {}
for (const theme of [...themes].sort((a, b) => byCodePoint(a.id, b.id))) {
  for (const word of theme.words) {
    if (!(word.label in byLabel)) byLabel[word.label] = word.src
    // Garder aussi le slug tireté pour la résolution d’images / audios.
    if (word.slug && !(word.slug in byLabel)) byLabel[word.slug] = word.src
  }
}
// Ne pas exposer `slug` dans le tableau thèmes exporté.
for (const theme of themes) {
  theme.words = theme.words.map(({ label, src }) => ({ label, src }))
}

const out =
  '/** Index des images Voc par thème (dossiers public/lib/images/vocabulaire). */\n' +
  'export type VocabImageWord = { label: string; src: string }\n' +
  'export type VocabImageTheme = { id: string; label: string; words: VocabImageWord[] }\n' +
  '\n' +
  `export const VOCAB_IMAGE_THEMES: VocabImageTheme[] = ${JSON.stringify(themes, null, 2)}\n` +
  '\n' +
  '/** label (minuscule) → src, première occurrence. */\n' +
  `export const VOCAB_IMAGE_BY_LABEL: Record<string, string> = ${JSON.stringify(byLabel, null, 2)}\n`

writeFileSync(OUT, out)
console.log(
  `vocab-images.ts : ${themes.length} thèmes, ${themes.reduce((n, t) => n + t.words.length, 0)} images`,
)
