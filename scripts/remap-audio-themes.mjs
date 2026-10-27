#!/usr/bin/env node
/**
 * Répartit les audios de compréhension par thème (comme images/vocabulaire),
 * d’après les transcriptions de soutien-scolaire.
 *
 * Idempotent : lit aussi les dossiers déjà classés `{theme}/{level}__fichier.mp3`.
 */
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { basename, join } from 'node:path'

const SOUTIEN = process.env.SOUTIEN_ROOT ?? '/tmp/soutien-scolaire'
const ROOT = process.env.LIB_ROOT ?? join(process.cwd(), 'public/lib/audio/tcf/co')
const COMM = join(SOUTIEN, 'lib/curriculum/content/communication')

const LEVELS = new Set(['facile-a1', 'moyen-a2', 'difficile-b1'])

const THEMES = [
  'presenter',
  'famille',
  'logement',
  'achats',
  'vetements',
  'nourriture',
  'sante',
  'transports',
  'inviter',
  'travail',
  'journee',
  'loisirs',
  'ecole',
  'animaux',
  'administration',
  'actualite',
  'nature',
  'couleurs',
  'objets',
]

const KEYS = {
  presenter: [
    'presenter', 'presentation', 'nationalite', 'identite', 'prenom', 'bonjour', 'salut', 'age',
    'je m appelle', 'je suis', 'enchant', 'origine', 'pays', 'suisse', 'francais', 'italien',
    'allemand', 'espagnol', 'portugais', 'allemande', 'presentent',
  ],
  famille: [
    'famille', 'pere', 'mere', 'frere', 'soeur', 'oncle', 'tante', 'cousin', 'cousine', 'neveu',
    'niece', 'grand-pere', 'grand-mere', 'fils', 'fille', 'bebe', 'parents', 'marie', 'couple',
    'enfant', 'papa', 'maman', 'niece', 'gatre', 'anniversaire',
  ],
  logement: [
    'logement', 'appartement', 'maison', 'studio', 'chambre', 'cuisine', 'salon', 'balcon', 'cave',
    'immeuble', 'loyer', 'demenag', 'hotel', 'agence immobiliere', 'loft', 'salle de bain',
    'panne', 'robinet', 'ampoule', 'visite', 'terrasse', 'gardienne', 'louer',
  ],
  achats: [
    'achat', 'acheter', 'magasin', 'boutique', 'caisse', 'prix', 'client', 'promo', 'solde',
    'supermarche', 'reduction', 'vendeur', 'courses', 'ticket', 'payer', 'rayon', 'promotion',
  ],
  vetements: [
    'vetement', 'habit', 'pull', 'manteau', 'veste', 'jupe', 'pantalon', 'chemise', 'robe',
    'chaussure', 'botte', 'bonnet', 'echarpe', 'gant', 't-shirt', 'short', 'taille', 'mode',
  ],
  nourriture: [
    'nourriture', 'restaurant', 'manger', 'repas', 'menu', 'pain', 'fruit', 'legume', 'fromage',
    'viande', 'poisson', 'dessert', 'cafe', 'pizza', 'salade', 'chocolat', 'fondue', 'tomate',
    'boulangerie', 'cuisine', 'recette', 'panier', 'frigo', 'refrigerateur',
  ],
  sante: [
    'sante', 'medecin', 'pharmacie', 'malade', 'hopital', 'fievre', 'dentiste', 'ordonnance',
    'douleur', 'infirmier', 'urgence', 'docteur', 'grippe', 'epidemie',
  ],
  transports: [
    'transport', 'train', 'bus', 'tram', 'metro', 'gare', 'aeroport', 'avion', 'billet', 'quai',
    'voiture', 'velo', 'taxi', 'vol', 'sncf', 'embarquement', 'voyageur', 'passager', 'ligne',
    'autoroute', 'station',
  ],
  inviter: [
    'invit', 'fete', 'sortie', 'anniversaire', 'rendez-vous', 'proposer', 'soiree',
    'week-end', 'bisous', 'rappelle-moi', 'mariage',
  ],
  travail: [
    'travail', 'bureau', 'emploi', 'metier', 'collegue', 'reunion', 'contrat', 'salaire',
    'stage', 'directeur', 'comptable', 'vendeuse', 'etudiant', 'formatrice', 'office', 'service apres-vente',
  ],
  journee: [
    'journee', 'quotidien', 'matin', 'soir', 'heure', 'lundi', 'mardi', 'mercredi', 'jeudi',
    'vendredi', 'samedi', 'dimanche', 'meteo', 'saison', 'horloge',
  ],
  loisirs: [
    'loisir', 'sport', 'cinema', 'musee', 'festival', 'concert', 'theatre', 'piscine', 'ski',
    'bibliotheque', 'exposition', 'film', 'musique', 'foot', 'hockey', 'vacance', 'voyage',
    'parc', 'attraction',
  ],
  ecole: [
    'ecole', 'classe', 'cours', 'eleve', 'cahier', 'stylo', 'trousse', 'lycee', 'universite',
    'professeur', 'etudiant', 'rentree', 'examen', 'carte d etudiant',
  ],
  animaux: [
    'animal', 'animaux', 'chien', 'chat', 'oiseau', 'cheval', 'vache', 'compagnie',
  ],
  administration: [
    'administratif', 'formulaire', 'inscription', 'passeport', 'carte d identite', 'convocation',
    'guichet', 'mairie', 'papier', 'titre de sejour', 'compte bancaire', 'livret a',
  ],
  actualite: [
    'actualite', 'journal', 'information', 'radio', 'nouvelle', 'reportage', 'unesco', 'enquete',
    'infos', 'france inter', 'presse',
  ],
  nature: [
    'nature', 'arbre', 'fleur', 'foret', 'montagne', 'riviere', 'mer', 'lac', 'soleil', 'jardin',
  ],
  couleurs: [
    'couleur', 'rouge', 'bleu', 'vert', 'jaune', 'noir', 'blanc', 'rose', 'violet',
  ],
  objets: [
    'objet', 'boite', 'sac', 'porte', 'fenetre', 'table', 'chaise', 'telephone', 'ordinateur',
    'cle usb', 'smartphone', 'tablette',
  ],
}

function norm(s) {
  return String(s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function scoreText(text) {
  const n = ` ${norm(text)} `
  let best = 'objets'
  let bestScore = 0
  for (const theme of THEMES) {
    let score = 0
    for (const key of KEYS[theme] ?? []) {
      const k = norm(key)
      if (!k) continue
      if (n.includes(` ${k} `) || n.includes(k)) score += Math.max(2, Math.min(5, Math.floor(k.length / 3)))
    }
    if (score > bestScore) {
      bestScore = score
      best = theme
    }
  }
  return { theme: best, score: bestScore }
}

const transcripts = new Map()

function addTranscript(stem, text, source) {
  const key = String(stem).replace(/\.mp3$/i, '')
  if (!key || !text?.trim()) return
  const prev = transcripts.get(key)
  if (!prev || text.length > prev.transcript.length) {
    transcripts.set(key, {
      transcript: text.trim(),
      sources: [...new Set([...(prev?.sources ?? []), source])],
    })
  } else if (prev) {
    prev.sources = [...new Set([...prev.sources, source])]
  }
}

function loadJsonTranscripts() {
  for (const [file, tag] of [
    ['co-transcripts-scolaire-base.json', 'scolaire-base'],
    ['co-transcripts-scolaire-moyen.json', 'scolaire-moyen'],
    ['co-transcripts-scolaire-avance.json', 'scolaire-avance'],
  ]) {
    const path = join(COMM, file)
    if (!existsSync(path)) continue
    const data = JSON.parse(readFileSync(path, 'utf8'))
    for (const [stem, text] of Object.entries(data)) addTranscript(stem, text, tag)
  }
}

function loadCoAudioTs() {
  for (const name of ['co-audio.ts', 'co-audio-avance.ts', 'co-audio-avance-conv-extra.ts']) {
    const path = join(COMM, name)
    if (!existsSync(path)) continue
    const src = readFileSync(path, 'utf8')
    const re =
      /item\(\s*"(base|moyen|avance)"\s*,\s*"[^"]+"\s*,\s*"[^"]+"\s*,\s*"([^"]+\.mp3)"\s*,\s*"((?:\\.|[^"\\])*)"\s*\)/g
    let m
    while ((m = re.exec(src))) {
      addTranscript(m[2].replace(/\.mp3$/, ''), m[3].replace(/\\n/g, '\n').replace(/\\"/g, '"'), name)
    }
  }
}

function loadNamedConstants() {
  for (const name of [
    'co-audio-avance.ts',
    'co-audio-avance-conv-extra.ts',
    'co-audio-avance-radio.ts',
  ]) {
    const path = join(COMM, name)
    if (!existsSync(path)) continue
    const src = readFileSync(path, 'utf8')
    const consts = new Map()
    const cRe = /(?:export )?const (CONV|RADIO)_(\d+)\s*=\s*`([^`]*)`/g
    let m
    while ((m = cRe.exec(src))) {
      consts.set(`${m[1]}_${m[2]}`, m[3])
      const prefix = m[1] === 'CONV' ? 'conversation' : 'radio'
      addTranscript(`${prefix}-${m[2]}`, m[3], name)
    }
    const gRe = /avanceGroup\(\s*"conversation"\s*,\s*"(\d+)"\s*,\s*"([^"]+\.mp3)"\s*,\s*(CONV_\d+)\s*\)/g
    while ((m = gRe.exec(src))) {
      const text = consts.get(m[3])
      if (text) addTranscript(m[2].replace(/\.mp3$/, ''), text, name)
    }
  }
}

function loadExpressListening() {
  if (!existsSync(COMM)) return
  for (const name of readdirSync(COMM)) {
    if (!/^express-.*-listening\.ts$/.test(name)) continue
    const src = readFileSync(join(COMM, name), 'utf8')

    // const TRANSCRIPT_005 = `...`
    const blocks = new Map()
    const trRe = /const TRANSCRIPT_(\d+)\s*=\s*`([^`]*)`/g
    let m
    while ((m = trRe.exec(src))) blocks.set(m[1], m[2])

    const useRe =
      /audioSrc:\s*A([12])\(\s*"(\d+)"\s*\)[\s\S]{0,200}?transcript:\s*TRANSCRIPT_(\d+)/g
    while ((m = useRe.exec(src))) {
      const text = blocks.get(m[3])
      if (!text) continue
      addTranscript(m[2].padStart(3, '0'), text, name)
    }
    for (const [num, text] of blocks) addTranscript(num.padStart(3, '0'), text, `${name}:const`)

    // Inline: audioSrc: A1("009") ... transcript: `...`
    const inlineRe =
      /audioSrc:\s*A([12])\(\s*"(\d+)"\s*\)[\s\S]{0,400}?transcript:\s*`([^`]*)`/g
    while ((m = inlineRe.exec(src))) {
      addTranscript(m[2].padStart(3, '0'), m[3], name)
    }

    // buildListeningAudio({ level: "A1"|"A2", num: 85, transcript: `...` })
    const buildRe =
      /buildListeningAudio\(\{\s*id:\s*"[^"]+"\s*,\s*level:\s*"(A1|A2)"\s*,\s*num:\s*(\d+)\s*,\s*transcript:\s*`([^`]*)`/g
    while ((m = buildRe.exec(src))) {
      addTranscript(String(m[2]).padStart(3, '0'), m[3], name)
    }
  }
}

function ensure(dir) {
  mkdirSync(dir, { recursive: true })
}

function walkMp3(dir, acc = []) {
  if (!existsSync(dir)) return acc
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) walkMp3(full, acc)
    else if (/\.mp3$/i.test(name)) acc.push(full)
  }
  return acc
}

function parseLocated(file) {
  const name = basename(file)
  const parent = basename(join(file, '..'))
  // Already remapped: theme/level__stem.mp3
  const remapped = name.match(/^(facile-a1|moyen-a2|difficile-b1)__(.+)$/i)
  if (remapped) {
    return { level: remapped[1], stemFile: remapped[2], themeHint: parent }
  }
  // Legacy: level/stem.mp3
  if (LEVELS.has(parent)) {
    return { level: parent, stemFile: name, themeHint: null }
  }
  return { level: 'facile-a1', stemFile: name, themeHint: parent }
}

loadJsonTranscripts()
loadCoAudioTs()
loadNamedConstants()
loadExpressListening()

const report = {
  transcriptsLoaded: transcripts.size,
  byTheme: Object.fromEntries(THEMES.map((t) => [t, 0])),
  missingTranscript: [],
  moves: [],
  unchanged: 0,
}

const files = walkMp3(ROOT)
for (const file of files) {
  const { level, stemFile, themeHint } = parseLocated(file)
  const stem = stemFile.replace(/\.mp3$/i, '')
  const hit = transcripts.get(stem)
  const text = hit?.transcript ?? stem.replace(/[-_]+/g, ' ')
  const { theme, score } = scoreText(text)
  if (!hit) report.missingTranscript.push(`${level}/${stemFile}`)

  const destDir = join(ROOT, theme)
  ensure(destDir)
  const destName = `${level}__${stemFile}`
  const dest = join(destDir, destName)

  if (file === dest) {
    report.unchanged += 1
  } else {
    if (existsSync(dest)) {
      // même contenu déjà présent → supprimer la source
      rmSync(file)
      report.moves.push({ from: file, to: dest, note: 'duplicate-removed', theme, score })
    } else {
      renameSync(file, dest)
      report.moves.push({
        from: themeHint ? `${themeHint}/${basename(file)}` : `${level}/${stemFile}`,
        to: `${theme}/${destName}`,
        theme,
        score,
        hasTranscript: Boolean(hit),
      })
    }
  }
  report.byTheme[theme] = (report.byTheme[theme] ?? 0) + 1
}

// nettoyer dossiers vides (anciens niveaux ou thèmes vids)
for (const name of readdirSync(ROOT)) {
  const dir = join(ROOT, name)
  if (!statSync(dir).isDirectory()) continue
  if (readdirSync(dir).length === 0) rmSync(dir, { recursive: true })
}

const out = join(process.cwd(), 'scripts/audio-theme-report.json')
writeFileSync(out, JSON.stringify(report, null, 2))
console.log(
  JSON.stringify(
    {
      transcriptsLoaded: report.transcriptsLoaded,
      moved: report.moves.length,
      unchanged: report.unchanged,
      missingTranscript: report.missingTranscript.length,
      byTheme: report.byTheme,
      report: out,
    },
    null,
    2,
  ),
)
