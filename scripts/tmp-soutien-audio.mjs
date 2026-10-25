import { readFileSync, existsSync, readdirSync, mkdirSync, writeFileSync, statSync, unlinkSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'

const require = createRequire('C:/Users/Phuoc/AppData/Local/Temp/edge-tts-run/package.json')
const { EdgeTTS } = require('node-edge-tts')

const ROOT = 'E:/doc-prof'
const AUDIO = join(ROOT, 'public/lib/audio/vocabulaire')
const FF = 'C:/Users/Phuoc/AppData/Local/Temp/asr-check/node_modules/ffmpeg-static/ffmpeg.exe'
const STEM = join(ROOT, 'src/francais/soutien/audio-stem-index.json')

function slugify(label) {
  return label
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function jobs() {
  const out = []
  const seen = new Set()
  for (const file of readdirSync(join(ROOT, 'src/francais/vocab-banks'))) {
    if (!file.endsWith('.ts')) continue
    const text = readFileSync(join(ROOT, 'src/francais/vocab-banks', file), 'utf8')
    for (const m of text.matchAll(/"label"\s*:\s*"([^"]+)"[\s\S]*?"imageSrc"\s*:\s*"\/lib\/images\/vocabulaire\/([^/]+)\/([^/"]+)\.[^"]+"/g)) {
      const label = m[1].trim()
      const key = label.toLowerCase()
      if (!key || seen.has(key)) continue
      seen.add(key)
      const dest = join(AUDIO, m[2], `${m[3]}.mp3`)
      if (existsSync(dest) && statSync(dest).size > 500) continue
      out.push({ label, dest })
    }
  }
  return out
}

function ffmpeg96(src, dest) {
  return new Promise((resolve, reject) => {
    const p = spawn(FF, ['-y', '-loglevel', 'error', '-i', src, '-codec:a', 'libmp3lame', '-b:a', '96k', dest], { windowsHide: true })
    p.on('exit', (code) => (code === 0 ? resolve() : reject(new Error('ffmpeg ' + code))))
  })
}

function writeIndex() {
  const entries = {}
  function walk(dir, prefix) {
    if (!existsSync(dir)) return
    for (const name of readdirSync(dir)) {
      const p = join(dir, name)
      if (statSync(p).isDirectory()) walk(p, prefix)
      else if (name.endsWith('.mp3') && statSync(p).size > 500) {
        const rel = '/' + p.slice(join(ROOT, 'public').length + 1).replace(/\\/g, '/')
        const stem = name.slice(0, -4).toLowerCase()
        const ascii = slugify(stem)
        const key = prefix ? `${prefix}${ascii}` : ascii
        if (!entries[key]) entries[key] = rel
        const rawKey = prefix ? `${prefix}${stem}` : stem
        if (!entries[rawKey]) entries[rawKey] = rel
      }
    }
  }
  walk(AUDIO, '')
  walk(join(ROOT, 'public/lib/audio/syllabes'), 'syll:')
  const keys = Object.keys(entries).sort()
  const sorted = {}
  for (const k of keys) sorted[k] = entries[k]
  writeFileSync(STEM, JSON.stringify(sorted) + '\n')
  console.log('index', keys.length)
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const list = jobs()
console.log('jobs', list.length)
const tts = new EdgeTTS({ voice: 'fr-FR-DeniseNeural', lang: 'fr-FR', rate: '-25%', timeout: 30000 })
let ok = 0
let fail = 0
for (const job of list) {
  mkdirSync(dirname(job.dest), { recursive: true })
  const raw = job.dest + '.raw.mp3'
  let done = false
  for (let attempt = 0; attempt < 6 && !done; attempt++) {
    try {
      await tts.ttsPromise(job.label, raw)
      await ffmpeg96(raw, job.dest)
      try { unlinkSync(raw) } catch {}
      done = true
      ok++
      if (ok % 25 === 0) console.log('ok', ok, '/', list.length)
    } catch (e) {
      const msg = String(e?.message || e)
      if (msg.includes('429') && attempt < 5) {
        await sleep(2500 * (attempt + 1))
        continue
      }
      fail++
      console.log('FAIL', job.label, msg)
    }
  }
  await sleep(350)
}
writeIndex()
console.log({ ok, fail })
