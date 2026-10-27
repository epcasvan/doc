/**
 * Transcrit les mp3 CO non suivis (audios raccourcis / déplacés) et les
 * rapproche des exercices dont le fichier manque.
 * Rapport : scripts/tmp-remap-stt.json
 */
import { createRequire } from 'node:module'
import { readFileSync, writeFileSync, existsSync, mkdtempSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join, relative, sep } from 'node:path'

const require = createRequire('C:/Users/Phuoc/AppData/Local/Temp/asr-check/package.json')
const { pipeline } = require('@xenova/transformers')
const { WaveFile } = require('wavefile')

const ROOT = process.cwd()
const FFMPEG = 'C:/Users/Phuoc/AppData/Local/Temp/asr-check/node_modules/ffmpeg-static/ffmpeg.exe'
const CACHE = join(ROOT, 'scripts/tmp-remap-stt.json')
const AUDIO_ROOT = join(ROOT, 'public/lib/audio/tcf/co')

const STOP = new Set(
  'le la les un une des de du et je tu il elle on nous vous ils elles est ce en ne pas que qui dans pour avec sur oui non au aux son sa ses son cette cet mon ma mes ton ta tes son sa ses plus tres bien tout tous comme quand alors aussi etre avoir fait vais fait'.split(
    ' ',
  ),
)

const fold = (s) =>
  s
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')

const words = (s) => fold(s).split(/\s+/).filter((w) => w.length >= 4 && !STOP.has(w))

function score(heard, expected) {
  const h = new Set(words(heard))
  const e = words(expected)
  if (!e.length || !h.size) return 0
  return e.filter((w) => h.has(w)).length / e.length
}

function toFloats(mp3) {
  const dir = mkdtempSync(join(tmpdir(), 'wav-'))
  const wav = join(dir, 'a.wav')
  const r = spawnSync(
    FFMPEG,
    ['-y', '-i', mp3, '-ac', '1', '-ar', '16000', '-sample_fmt', 's16', wav],
    { encoding: 'utf8' },
  )
  if (r.status !== 0) throw new Error(r.stderr?.slice(-500) || 'ffmpeg')
  const file = new WaveFile(readFileSync(wav))
  file.toBitDepth('32f')
  let samples = file.getSamples()
  if (Array.isArray(samples)) samples = samples[0]
  return Float32Array.from(samples)
}

function gitNewMp3() {
  const out = spawnSync('git', ['status', '--porcelain', '-z', '--', 'public/lib/audio/tcf/co'], {
    cwd: ROOT,
    encoding: 'utf8',
  })
  const files = []
  for (const rec of out.stdout.split('\0')) {
    if (!rec) continue
    const status = rec.slice(0, 2)
    const path = rec.slice(3).replaceAll('/', sep)
    if (!path.endsWith('.mp3')) continue
    if (path.includes('Copie')) continue
    if (status.includes('?') || status.includes('A')) files.push(join(ROOT, path))
  }
  return files
}

function loadBanks() {
  const exercises = []
  for (const level of ['a0-a1', 'a1-a2', 'a2-b1']) {
    const bank = JSON.parse(readFileSync(join(ROOT, 'src/tcf/content', level, 'co.json'), 'utf8'))
    for (const ex of bank) {
      const audio = ex.support?.audio
      if (typeof audio !== 'string' || !audio.includes('/audio/tcf/co/')) continue
      const disk = join(ROOT, 'public' + audio)
      exercises.push({
        level,
        id: ex.id,
        audio,
        missing: !existsSync(disk),
        transcription: ex.support?.transcription || '',
        scene: ex.scene || '',
      })
    }
  }
  return exercises
}

const cache = existsSync(CACHE) ? JSON.parse(readFileSync(CACHE, 'utf8')) : { heard: {} }
const files = gitNewMp3()
console.log('nouveaux mp3', files.length)
const transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-base')

for (const file of files) {
  const rel = relative(AUDIO_ROOT, file).split(sep).join('/')
  if (cache.heard[rel]) {
    console.log('cache', rel)
    continue
  }
  const samples = toFloats(file)
  const step = 16000 * 28
  const parts = []
  for (let i = 0; i < samples.length; i += step) {
    const slice = samples.subarray(i, Math.min(samples.length, i + step))
    if (slice.length < 16000) continue
    const out = await transcriber(slice, { language: 'french', task: 'transcribe' })
    if (out.text) parts.push(out.text.trim())
  }
  cache.heard[rel] = parts.join(' ').replace(/\s+/g, ' ').trim()
  writeFileSync(CACHE, JSON.stringify(cache, null, 2))
  console.log('ok', rel, cache.heard[rel].slice(0, 80))
}

const exercises = loadBanks()
const rows = []
for (const [rel, heard] of Object.entries(cache.heard)) {
  let best = null
  for (const ex of exercises) {
    const s = score(heard, ex.transcription)
    if (!best || s > best.score) best = { ...ex, score: s }
  }
  rows.push({
    rel,
    heard: heard.slice(0, 240),
    id: best?.id,
    level: best?.level,
    old: best?.audio,
    missing: best?.missing,
    score: Number((best?.score ?? 0).toFixed(2)),
    scene: best?.scene,
  })
}
rows.sort((a, b) => b.score - a.score)
cache.matches = rows
writeFileSync(CACHE, JSON.stringify(cache, null, 2))
console.log('\nRAPPROCHEMENTS')
for (const row of rows) {
  console.log(
    `${row.score.toFixed(2)} ${row.missing ? 'MANQUE' : 'existe'} ${row.rel} -> ${row.id} (${row.old})`,
  )
}
