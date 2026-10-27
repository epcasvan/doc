#!/usr/bin/env node
/** Applique scripts/tcf-co-audio-overrides.json sur les banques CO. */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()
const OVERRIDES = join(ROOT, 'scripts/tcf-co-audio-overrides.json')
const LEVELS = ['a0-a1', 'a1-a2', 'a2-b1']

if (!existsSync(OVERRIDES)) {
  console.error('Missing', OVERRIDES)
  process.exit(1)
}

const overrides = JSON.parse(readFileSync(OVERRIDES, 'utf8'))
let n = 0
for (const level of LEVELS) {
  const path = join(ROOT, 'src/tcf/content', level, 'co.json')
  if (!existsSync(path)) continue
  const data = JSON.parse(readFileSync(path, 'utf8'))
  let changed = false
  for (const ex of data) {
    const audio = ex?.support?.audio
    const ov = audio ? overrides[audio] : null
    if (!ov) continue
    if (ov.theme) ex.theme = ov.theme
    if (ov.transcription) ex.support.transcription = ov.transcription
    if (ov.questions) ex.questions = ov.questions
    changed = true
    n++
    console.log('override', ex.id, audio)
  }
  if (changed) writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`)
}
console.log(JSON.stringify({ applied: n }, null, 2))
