import { createRequire } from 'node:module'
import { readFileSync, writeFileSync, existsSync, mkdtempSync, readdirSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const require = createRequire('C:/Users/Phuoc/AppData/Local/Temp/asr-check/package.json')
const { pipeline } = require('@xenova/transformers')
const { WaveFile } = require('wavefile')

const ROOT = process.cwd()
const FFMPEG = 'C:/Users/Phuoc/AppData/Local/Temp/asr-check/node_modules/ffmpeg-static/ffmpeg.exe'
const CACHE = join(ROOT, 'scripts/tmp-remap-stt.json')
const AUDIO = join(ROOT, 'public/lib/audio/tcf/co')

function toFloats(mp3) {
  const dir = mkdtempSync(join(tmpdir(), 'wav-'))
  const wav = join(dir, 'a.wav')
  const r = spawnSync(FFMPEG, ['-y', '-i', mp3, '-ac', '1', '-ar', '16000', '-sample_fmt', 's16', wav], { encoding: 'utf8' })
  if (r.status !== 0) throw new Error(r.stderr?.slice(-400) || 'ffmpeg')
  const file = new WaveFile(readFileSync(wav))
  file.toBitDepth('32f')
  let samples = file.getSamples()
  if (Array.isArray(samples)) samples = samples[0]
  return Float32Array.from(samples)
}

const dirs = ['bibliotheque', 'cinema', 'musee', 'piscine', 'ville', 'administration', 'poste']
const files = []
for (const dir of dirs) {
  for (const name of readdirSync(join(AUDIO, dir))) {
    if (name.endsWith('.mp3') && !name.includes('Copie')) files.push(`${dir}/${name}`)
  }
}

const cache = existsSync(CACHE) ? JSON.parse(readFileSync(CACHE, 'utf8')) : { heard: {} }
const transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-base')
for (const rel of files) {
  if (cache.heard[rel]) {
    console.log('cache', rel)
    continue
  }
  const samples = toFloats(join(AUDIO, rel))
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
  console.log('ok', rel)
  console.log(cache.heard[rel])
}
