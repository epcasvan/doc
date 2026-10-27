#!/usr/bin/env node
/**
 * Renomme les audios CO TCF selon scénario + scène :
 *   /lib/audio/tcf/co/{scenario}/{scene-slug}[-n].mp3
 * Met à jour les banques co.json, overrides, cache STT, manifest.
 */
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'

const ROOT = process.cwd()
const PUBLIC = join(ROOT, 'public')
const LEVELS = ['a0-a1', 'a1-a2', 'a2-b1']

const FOLDER_TO_SCENARIO = {
  achats: 'magasins',
  actualite: 'actualite',
  administration: 'lieux-publics',
  couleurs: 'vie-quotidienne',
  ecole: 'ecole',
  famille: 'vie-quotidienne',
  fetes: 'fetes',
  inviter: 'fetes',
  journee: 'vie-quotidienne',
  'lieux-publics': 'lieux-publics',
  logement: 'maison',
  loisirs: 'loisirs',
  magasins: 'magasins',
  maison: 'maison',
  nature: 'loisirs',
  nourriture: 'maison',
  objets: 'vie-quotidienne',
  presenter: 'vie-quotidienne',
  radio: 'radio',
  sante: 'sante',
  transports: 'transports',
  travail: 'travail',
  vacances: 'vacances',
  vetements: 'magasins',
  'vie-quotidienne': 'vie-quotidienne',
}

const WORD_ACCENTS = {
  aeroport: 'aéroport',
  a: 'à',
  ecole: 'école',
  etudes: 'études',
  universite: 'université',
  bibliotheque: 'bibliothèque',
  theatre: 'théâtre',
  musee: 'musée',
  meteo: 'météo',
  telephone: 'téléphone',
  hopital: 'hôpital',
  cinema: 'cinéma',
  presenter: 'présenter',
  vetements: 'vêtements',
  sante: 'santé',
  actualite: 'actualité',
  journee: 'journée',
}

const GENERIC = new Set(['annonce', 'conversation', 'message', 'radio', 'objet', 'instruction'])

function loadJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function saveJson(path, data) {
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`)
}

function slugify(label) {
  let s = label
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLocaleLowerCase('fr-FR')
    .replace(/['’]/g, '-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return s || 'audio'
}

function titleWords(raw) {
  return raw
    .split(/\s+/)
    .map((w, i) => {
      let lower = w.toLocaleLowerCase('fr-FR')
      lower = WORD_ACCENTS[lower] ?? lower
      if (i > 0 && ['a', 'à', 'au', 'aux', 'de', 'des', 'du', 'en', 'et', 'l', 'la', 'le', 'les', 'un', 'une'].includes(lower)) {
        return lower === 'a' ? 'à' : lower
      }
      if (lower === 'l') return "l'"
      return lower.charAt(0).toLocaleUpperCase('fr-FR') + lower.slice(1)
    })
    .join(' ')
    .replace(/\bl'\s+/gi, "l'")
    .replace(/^A /, 'À ')
}

function baseFromPath(audioPath) {
  const parts = audioPath.split('/').filter(Boolean)
  const file = parts[parts.length - 1] ?? audioPath
  const folder = parts.length >= 2 ? parts[parts.length - 2] : ''
  const stem = file.replace(/\.mp3$/i, '')
  const after = stem.includes('__') ? stem.split('__').slice(1).join('__') : stem
  const bare = after.replace(/-\d+(\.\d+)?$/, '').replace(/__/g, ' ').replace(/-/g, ' ').trim()
  if (!bare || /^\d+$/.test(bare)) return titleWords(folder || bare || stem)
  const titled = titleWords(bare)
  if (GENERIC.has(bare.toLocaleLowerCase('fr-FR')) && folder) {
    return `${titleWords(folder)} · ${titled}`
  }
  return titled
}

function stripTrailingNumber(label) {
  return label.replace(/\s*[-–]?\s*\d+$/u, '').trim() || label
}

function stemNumber(audio) {
  const stem = audio.split('/').pop()?.replace(/\.mp3$/i, '') ?? ''
  const after = stem.includes('__') ? stem.split('__').slice(1).join('__') : stem
  const m = after.match(/-(\d+)(?:\.\d+)?$/u) || after.match(/^(\d+)$/u)
  return m ? Number(m[1]) : null
}

function scenarioFor(ex, audioPath) {
  if (ex.scenario && typeof ex.scenario === 'string' && ex.scenario.trim()) {
    return ex.scenario.trim()
  }
  const folder = audioPath.split('/').filter(Boolean).at(-2) ?? 'autre'
  return FOLDER_TO_SCENARIO[folder] ?? 'autre'
}

function sceneLabelFor(ex, audioPath) {
  const scene = (ex.scene || '').trim()
  if (scene) return stripTrailingNumber(scene)
  return baseFromPath(audioPath)
}

function main() {
  /** @type {Map<string, { audio: string, exercises: any[], sceneLabel: string, scenario: string }>} */
  const byAudio = new Map()

  for (const level of LEVELS) {
    const path = join(ROOT, 'src/tcf/content', level, 'co.json')
    const data = loadJson(path)
    for (const ex of data) {
      const audio = ex?.support?.audio
      if (!audio || typeof audio !== 'string') continue
      let row = byAudio.get(audio)
      if (!row) {
        row = {
          audio,
          exercises: [],
          sceneLabel: sceneLabelFor(ex, audio),
          scenario: scenarioFor(ex, audio),
        }
        byAudio.set(audio, row)
      }
      row.exercises.push({ level, ex })
      // Préférer une vraie scène / scénario si un exercice les a
      if ((ex.scene || '').trim()) row.sceneLabel = stripTrailingNumber(ex.scene.trim())
      if ((ex.scenario || '').trim()) row.scenario = ex.scenario.trim()
    }
  }

  // Grouper par (scenario, sceneLabel) pour numérotation
  const groups = new Map()
  for (const row of byAudio.values()) {
    const key = `${row.scenario}::${row.sceneLabel}`
    const list = groups.get(key) ?? []
    list.push(row)
    groups.set(key, list)
  }
  for (const list of groups.values()) {
    list.sort((a, b) => {
      const na = stemNumber(a.audio)
      const nb = stemNumber(b.audio)
      if (na != null && nb != null && na !== nb) return na - nb
      if (na != null && nb == null) return -1
      if (na == null && nb != null) return 1
      return a.audio.localeCompare(b.audio, 'fr')
    })
  }

  /** @type {Map<string, string>} old → new */
  const mapping = new Map()
  const moves = []

  for (const list of groups.values()) {
    list.forEach((row, i) => {
      const slug = slugify(row.sceneLabel)
      const file = list.length > 1 ? `${slug}-${i + 1}.mp3` : `${slug}.mp3`
      const next = `/lib/audio/tcf/co/${row.scenario}/${file}`
      if (next === row.audio) {
        mapping.set(row.audio, next)
        return
      }
      // Collision si deux bases différentes slugifient pareil dans le même scénario
      let final = next
      let n = 2
      const used = new Set([...mapping.values()])
      while (used.has(final) && final !== row.audio) {
        final = `/lib/audio/tcf/co/${row.scenario}/${slug}-${n}.mp3`
        n++
      }
      mapping.set(row.audio, final)
      row.next = final
      row.sceneLabelFinal = list.length > 1 ? `${row.sceneLabel} ${i + 1}` : row.sceneLabel
      moves.push({ from: row.audio, to: final, scenario: row.scenario, scene: row.sceneLabelFinal ?? row.sceneLabel })
    })
  }

  // Appliquer renames physiques (en deux passes si swap)
  const tmpMoves = []
  for (const { from, to } of moves) {
    const src = join(PUBLIC, from.replace(/^\//, ''))
    const dst = join(PUBLIC, to.replace(/^\//, ''))
    if (!existsSync(src)) {
      console.warn('missing source', from)
      continue
    }
    if (src === dst) continue
    mkdirSync(dirname(dst), { recursive: true })
    if (existsSync(dst)) {
      const tmp = `${dst}.__tmp_rename__`
      renameSync(src, tmp)
      tmpMoves.push({ tmp, dst, from, to })
    } else {
      renameSync(src, dst)
    }
  }
  for (const { tmp, dst } of tmpMoves) {
    if (existsSync(dst)) {
      // destination encore occupée : écraser seulement si c'est un fichier déjà déplacé ailleurs
      const backup = `${dst}.__bak__`
      renameSync(dst, backup)
      renameSync(tmp, dst)
      // si backup n'est référencé par personne, on le laisse ; sinon autre passe
      console.warn('resolved collision', relative(ROOT, dst))
    } else {
      renameSync(tmp, dst)
    }
  }

  // Mettre à jour banques + scene/scenario
  for (const level of LEVELS) {
    const path = join(ROOT, 'src/tcf/content', level, 'co.json')
    const data = loadJson(path)
    for (const ex of data) {
      const audio = ex?.support?.audio
      if (!audio || !mapping.has(audio)) continue
      const next = mapping.get(audio)
      const row = byAudio.get(audio)
      ex.support.audio = next
      if (row) {
        ex.scenario = row.scenario
        // scène sans numéro pour le champ ; le libellé UI numérote déjà
        ex.scene = stripTrailingNumber(row.sceneLabel)
      }
    }
    saveJson(path, data)
  }

  // Overrides
  const ovPath = join(ROOT, 'scripts/tcf-co-audio-overrides.json')
  if (existsSync(ovPath)) {
    const ov = loadJson(ovPath)
    const next = {}
    for (const [k, v] of Object.entries(ov)) {
      next[mapping.get(k) ?? k] = v
    }
    saveJson(ovPath, next)
  }

  // STT cache
  const cachePath = join(ROOT, 'scripts/tcf-co-stt-cache.json')
  if (existsSync(cachePath)) {
    const cache = loadJson(cachePath)
    const next = {}
    for (const [k, v] of Object.entries(cache)) {
      next[mapping.get(k) ?? k] = v
    }
    saveJson(cachePath, next)
  }

  // Manifest thèmes audio si présent
  const manPath = join(ROOT, 'scripts/audio-theme-manifest.json')
  if (existsSync(manPath)) {
    let raw = readFileSync(manPath, 'utf8')
    for (const [from, to] of mapping) {
      if (from === to) continue
      raw = raw.split(from).join(to)
      // aussi chemins relatifs sans préfixe /lib
      const fromRel = from.replace(/^\/lib\//, '')
      const toRel = to.replace(/^\/lib\//, '')
      raw = raw.split(fromRel).join(toRel)
    }
    writeFileSync(manPath, raw)
  }

  const report = {
    total: mapping.size,
    renamed: moves.length,
    unchanged: [...mapping.entries()].filter(([a, b]) => a === b).length,
    sample: moves.slice(0, 30),
  }
  saveJson(join(ROOT, 'scripts/rename-tcf-co-audios-report.json'), report)
  console.log(JSON.stringify(report, null, 2))
}

main()
