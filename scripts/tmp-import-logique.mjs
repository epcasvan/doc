/**
 * Importe les images des Word CSC Logique → public/lib/images/logique/
 * et construit src/logique/bank.json.
 */
import { execFileSync } from 'node:child_process'
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
  copyFileSync,
  statSync,
} from 'node:fs'
import { join, dirname } from 'node:path'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'

const ROOT = 'E:/doc-prof'
const BASE =
  'E:/OneDrive - Ecoles - Schulen Valais-Wallis/OFFICE ASILE/CSC CFR/03. Mathématiques/02. CSC - Logique et espace'
const OUT_IMG = join(ROOT, 'public/lib/images/logique')
const BANK_PATH = join(ROOT, 'src/logique/bank.json')
const FF =
  process.env.LOCALAPPDATA +
  '/Temp/asr-check/node_modules/ffmpeg-static/ffmpeg.exe'

/** typeId → liste de chemins Word relatifs à BASE */
const SOURCES = {
  'logique-suite-graphique': [
    '02 - Logique simple/MATH-S_EX_02.01_SuiteGraphique_01.docx',
    '02 - Logique simple/MATH-S_EX_02.02_SuiteGraphique_02.docx',
    '05 - Logique simple P2/MATH-S_EX_05.01_SuiteGraphique_03.docx',
    '05 - Logique simple P2/MATH-S_EX_05.02_SuiteGraphique_04.docx',
  ],
  'logique-suite-logique': [
    '01 - Comparaison de nombres/MATH-S_EX_01.03_SuiteLogique_01.docx',
    '01 - Comparaison de nombres/MATH-S_EX_01.05_SuiteLogique_02.docx',
    '04 - Comparaison de nombre P2/MATH-S_EX_04.02_SuiteLogique_03.docx',
    '04 - Comparaison de nombre P2/MATH-S_EX_04.06_SuiteLogique_04.docx',
  ],
  'logique-suite-formes': [
    '02 - Logique simple/MATH-S_EX_02.03_SuiteForme_01.docx',
  ],
  'logique-intrus': [
    '02 - Logique simple/MATH-S_EX_02.04_TrouveIntrus_01.docx',
    '02 - Logique simple/MATH-S_EX_02.05_TrouveIntrus_02.docx',
    '05 - Logique simple P2/MATH-S_EX_05.04_TrouveIntrus_03.docx',
    '05 - Logique simple P2/MATH-S_EX_05.05_TrouveIntrus_04.docx',
  ],
  'logique-rotation': [
    '05 - Logique simple P2/MATH-S_EX_05.03_Rotation3D_01.docx',
    '05 - Logique simple P2/MATH-S_EX_05.06_Rotation3D_02.docx',
  ],
  'logique-matrice': [
    '10 - Logique complex/MATH-S_EX_10.01_Matrice_01.docx',
    '10 - Logique complex/MATH-S_EX_10.02_Matrice_02.docx',
    '14 - Logique complex P2/MATH-S_EX_14.03_Matrice_03.docx',
    '14 - Logique complex P2/MATH-S_EX_14.04_Matrice_04.docx',
  ],
  'logique-assemblage': [
    '10 - Logique complex/MATH-S_EX_10.03_Assemblage_01.docx',
  ],
  'logique-superposition': [
    '10 - Logique complex/MATH-S_EX_10.04_Superposition_01.docx',
    '10 - Logique complex/MATH-S_EX_10.05_Superposition_02.docx',
    '14 - Logique complex P2/MATH-S_EX_14.05_Superposition_03.docx',
  ],
  'logique-cube': [
    '14 - Logique complex P2/MATH-S_EX_14.01_Cube_01.docx',
    '14 - Logique complex P2/MATH-S_EX_14.02_Cube_02.docx',
    '14 - Logique complex P2/MATH-S_EX_14.06_Cube_03.docx',
    '14 - Logique complex P2/MATH-S_EX_14.07_Cube_04.docx',
  ],
}

function folderForType(typeId) {
  return typeId.replace(/^logique-/, '')
}

function extractDocx(docxPath, dest) {
  if (existsSync(dest)) rmSync(dest, { recursive: true, force: true })
  mkdirSync(dest, { recursive: true })
  // PowerShell Expand / .NET zip
  const ps = `
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    [System.IO.Compression.ZipFile]::ExtractToDirectory(${JSON.stringify(docxPath)}, ${JSON.stringify(dest)})
  `
  execFileSync('powershell', ['-NoProfile', '-Command', ps], { stdio: 'pipe' })
}

function parseRelMap(relsXml) {
  const map = {}
  for (const m of relsXml.matchAll(/Id="(rId\d+)"[^>]*Target="media\/([^"]+)"/g)) {
    map[m[1]] = m[2]
  }
  for (const m of relsXml.matchAll(/Target="media\/([^"]+)"[^>]*Id="(rId\d+)"/g)) {
    if (!map[m[2]]) map[m[2]] = m[1]
  }
  return map
}

/** [{ num, mediaFiles: string[] }] in document order */
function parseExercises(tmpDir) {
  const rels = readFileSync(join(tmpDir, 'word/_rels/document.xml.rels'), 'utf8')
  const map = parseRelMap(rels)
  let xml = readFileSync(join(tmpDir, 'word/document.xml'), 'utf8')
  xml = xml.replace(
    /<w:drawing[\s\S]*?r:embed="(rId\d+)"[\s\S]*?<\/w:drawing>/g,
    '\n⟦$1⟧\n',
  )
  xml = xml.replace(/<\/w:p>/g, '\n')
  xml = xml.replace(/<[^>]+>/g, '')
  xml = xml
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))

  const exercises = []
  let cur = null
  for (const raw of xml.split('\n')) {
    const line = raw.trim()
    const em = line.match(/^Exercice\s+(\d+)/i)
    if (em) {
      if (cur && cur.mediaFiles.length) exercises.push(cur)
      cur = { num: Number(em[1]), mediaFiles: [] }
      continue
    }
    const im = line.match(/⟦(rId\d+)⟧/)
    if (im && cur) {
      const file = map[im[1]]
      if (file) cur.mediaFiles.push(file)
    }
  }
  if (cur && cur.mediaFiles.length) exercises.push(cur)
  return exercises
}

function toWebp(src, dest) {
  mkdirSync(dirname(dest), { recursive: true })
  if (existsSync(FF)) {
    execFileSync(
      FF,
      ['-y', '-loglevel', 'error', '-i', src, '-c:v', 'libwebp', '-quality', '90', dest],
      { stdio: 'pipe' },
    )
  } else {
    // fallback copy as png renamed — keep extension
    const ext = src.match(/\.[^.]+$/)?.[0] ?? '.png'
    const alt = dest.replace(/\.webp$/, ext)
    copyFileSync(src, alt)
    return alt.replace(/\\/g, '/').replace(/^.*public/, '')
  }
  return null
}

/**
 * Découpe stem / choices selon le type.
 * Suites : 5 dernières = choix, le reste = énoncé (souvent 1 grande image).
 * Intrus : tout = choix.
 * Rotation : 1er = modèle, reste = choix.
 * Matrice / assemblage / superpo : 5 derniers = choix si assez d’images.
 * Cube : 1 image → stem seul ; sinon 1er stem + reste choix.
 */
function splitImages(typeId, paths) {
  const n = paths.length
  if (typeId === 'logique-intrus') {
    return { stem: [], choices: paths }
  }
  if (typeId === 'logique-rotation') {
    return { stem: paths.slice(0, 1), choices: paths.slice(1) }
  }
  if (typeId === 'logique-cube') {
    if (n <= 1) return { stem: paths, choices: [] }
    return { stem: paths.slice(0, 1), choices: paths.slice(1) }
  }
  const isSuite =
    typeId === 'logique-suite-graphique' ||
    typeId === 'logique-suite-logique' ||
    typeId === 'logique-suite-formes'
  if (isSuite && n >= 2) {
    const choiceCount = Math.min(5, n - 1)
    return { stem: paths.slice(0, n - choiceCount), choices: paths.slice(n - choiceCount) }
  }
  if (typeId === 'logique-matrice' && n >= 2) {
    const choiceCount = Math.min(6, n - 1)
    return { stem: paths.slice(0, n - choiceCount), choices: paths.slice(n - choiceCount) }
  }
  if (typeId === 'logique-assemblage' && n >= 2) {
    const choiceCount = Math.min(4, n - 1)
    return { stem: paths.slice(0, n - choiceCount), choices: paths.slice(n - choiceCount) }
  }
  // superposition
  if (n >= 4) {
    const choiceCount = n >= 6 ? Math.min(5, n - 1) : Math.min(3, Math.floor(n / 2))
    return { stem: paths.slice(0, n - choiceCount), choices: paths.slice(n - choiceCount) }
  }
  return { stem: paths, choices: [] }
}

// Clean previous flat dump
if (existsSync(OUT_IMG)) {
  for (const name of readdirSync(OUT_IMG)) {
    if (name.startsWith('_')) continue
    rmSync(join(OUT_IMG, name), { recursive: true, force: true })
  }
}
mkdirSync(OUT_IMG, { recursive: true })

const bank = {}
let total = 0

for (const [typeId, docs] of Object.entries(SOURCES)) {
  const typeFolder = folderForType(typeId)
  bank[typeId] = []
  let pack = 0
  for (const rel of docs) {
    const docx = join(BASE, rel)
    if (!existsSync(docx)) {
      console.log('MISSING', docx)
      continue
    }
    pack += 1
    const tmp = join(tmpdir(), `logique-imp-${typeFolder}-${pack}`)
    extractDocx(docx, tmp)
    const exercises = parseExercises(tmp)
    const mediaDir = join(tmp, 'word/media')
    for (const ex of exercises) {
      const exDir = join(OUT_IMG, typeFolder, `p${String(pack).padStart(2, '0')}-e${String(ex.num).padStart(2, '0')}`)
      mkdirSync(exDir, { recursive: true })
      const publicPaths = []
      let i = 0
      for (const mediaName of ex.mediaFiles) {
        i += 1
        const src = join(mediaDir, mediaName)
        if (!existsSync(src)) continue
        const dest = join(exDir, `${String(i).padStart(2, '0')}.webp`)
        toWebp(src, dest)
        if (existsSync(dest)) {
          publicPaths.push(`/lib/images/logique/${typeFolder}/p${String(pack).padStart(2, '0')}-e${String(ex.num).padStart(2, '0')}/${String(i).padStart(2, '0')}.webp`)
        }
      }
      if (!publicPaths.length) continue
      const { stem, choices } = splitImages(typeId, publicPaths)
      bank[typeId].push({
        id: `${typeFolder}-p${pack}-e${ex.num}`,
        stem,
        choices,
        /** Index du bon choix (0-based) — inconnu dans le Word élève ; 0 par défaut. */
        correctIndex: 0,
        answerLine: typeId === 'logique-cube' && choices.length === 0,
      })
      total += 1
    }
    rmSync(tmp, { recursive: true, force: true })
    console.log(typeId, 'pack', pack, '→', exercises.length, 'ex')
  }
}

writeFileSync(BANK_PATH, JSON.stringify(bank, null, 2) + '\n')
console.log('bank items', total)
for (const [k, v] of Object.entries(bank)) console.log(' ', k, v.length)
