#!/usr/bin/env node
/**
 * Importe les CO du repo soutien-scolaire dans les banques TCF
 * (`src/tcf/content/{a0-a1,a1-a2,a2-b1}/co.json`).
 *
 * Sources :
 * - transcriptions + QCM soutien (`SOUTIEN_ROOT`, défaut `/tmp/soutien-scolaire`)
 * - audios déjà classés dans doc-prof (`scripts/audio-theme-manifest.json`)
 *
 * Relancer : node scripts/import-tcf-co-soutien.mjs
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = process.cwd()
const SOUTIEN = process.env.SOUTIEN_ROOT ?? '/tmp/soutien-scolaire'
const COMM = join(SOUTIEN, 'lib/curriculum/content/communication')
const MANIFEST = join(ROOT, 'scripts/audio-theme-manifest.json')
const CONTENT = join(ROOT, 'src/tcf/content')

const LEVEL_TO_NIVEAU = {
  'facile-a1': 'A0-A1',
  'moyen-a2': 'A1-A2',
  'difficile-b1': 'A2-B1',
}

const NIVEAU_TO_DOSSIER = {
  'A0-A1': 'a0-a1',
  'A1-A2': 'a1-a2',
  'A2-B1': 'a2-b1',
}

const NIVEAU_TO_PREFIX = {
  'A0-A1': 'a1',
  'A1-A2': 'a2',
  'A2-B1': 'b1',
}

const QUESTIONS_PAR_NIVEAU = {
  'A0-A1': 4,
  'A1-A2': 6,
  'A2-B1': 6,
}

const CONSIGNE =
  'Vous allez écouter un document sonore. Il y a 2 écoutes. Lisez les questions, puis répondez.'

const LETTERS = 'abcdefghijklmnopqrstuvwxyz'

function loadJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function norm(s) {
  return String(s ?? '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim()
}

/**
 * Transcriptions indexées par niveau pour éviter les collisions A1/A2
 * (ex. audio `facile-a1__047` ≠ transcript A2 « Tapio » du même numéro).
 * Clés : `A1` | `A2` | `B1` | `any` (stems nommés scolaire).
 */
const transcriptsByLevel = {
  A1: new Map(),
  A2: new Map(),
  B1: new Map(),
  any: new Map(),
}

function isStubTranscript(text) {
  return /parlons du sujet de l'audio/i.test(text)
}

function addTranscript(stem, text, level = 'any') {
  const key = String(stem).replace(/\.mp3$/i, '')
  const clean = String(text ?? '').trim()
  if (!clean || clean.length < 20 || isStubTranscript(clean)) return
  const bucket = transcriptsByLevel[level] ?? transcriptsByLevel.any
  const prev = bucket.get(key)
  if (!prev || clean.length > prev.length) bucket.set(key, clean)
}

function stemKeys(stem) {
  const s = String(stem).replace(/\.mp3$/i, '')
  const keys = new Set([s])
  if (/^\d+$/.test(s)) {
    keys.add(s.padStart(3, '0'))
    keys.add(String(Number(s)))
  }
  return [...keys]
}

function getTranscript(stem, audioLevel) {
  const prefer =
    audioLevel === 'facile-a1' ? ['A1', 'any'] : audioLevel === 'moyen-a2' ? ['A2', 'any'] : ['B1', 'any', 'A2']
  for (const level of prefer) {
    const bucket = transcriptsByLevel[level]
    for (const key of stemKeys(stem)) {
      const hit = bucket.get(key)
      if (hit) return hit
    }
  }
  return null
}

function loadTranscripts() {
  for (const name of [
    'co-transcripts-scolaire-base.json',
    'co-transcripts-scolaire-moyen.json',
    'co-transcripts-scolaire-avance.json',
  ]) {
    const path = join(COMM, name)
    if (!existsSync(path)) continue
    for (const [stem, text] of Object.entries(loadJson(path))) addTranscript(stem, text, 'any')
  }
  const a1Path = join(SOUTIEN, 'scripts/data/express', 'a1-transcripts.json')
  if (existsSync(a1Path)) {
    for (const [stem, text] of Object.entries(loadJson(a1Path))) {
      addTranscript(stem, text, 'A1')
      addTranscript(String(stem).padStart(3, '0'), text, 'A1')
    }
  }
  const a2Path = join(SOUTIEN, 'scripts/data/express', 'a2-transcripts.json')
  if (existsSync(a2Path)) {
    for (const [stem, text] of Object.entries(loadJson(a2Path))) {
      addTranscript(stem, text, 'A2')
      addTranscript(String(stem).padStart(3, '0'), text, 'A2')
    }
  }
  if (!existsSync(COMM)) return
  for (const name of readdirSync(COMM)) {
    if (!/^express-.*-listening\.ts$/.test(name)) continue
    const src = readFileSync(join(COMM, name), 'utf8')
    let m
    // TR_047 / TRANSCRIPT_047 : leçons A1 (e2-1, …)
    const trRe = /const (?:TR|TRANSCRIPT)_(\d+)\s*=\s*`([^`]*)`/g
    while ((m = trRe.exec(src))) {
      addTranscript(m[1], m[2], 'A1')
      addTranscript(m[1].padStart(3, '0'), m[2], 'A1')
    }
    const inlineRe =
      /audioSrc:\s*A([12])\(\s*"(\d+)"\s*\)[\s\S]{0,400}?transcript:\s*`([^`]*)`/g
    while ((m = inlineRe.exec(src))) {
      const level = m[1] === '1' ? 'A1' : 'A2'
      addTranscript(m[2], m[3], level)
      addTranscript(m[2].padStart(3, '0'), m[3], level)
    }
    const buildRe =
      /buildListeningAudio\(\{\s*id:\s*"[^"]+"\s*,\s*level:\s*"(A1|A2)"\s*,\s*num:\s*(\d+)\s*,\s*transcript:\s*`([^`]*)`/g
    while ((m = buildRe.exec(src))) {
      addTranscript(String(m[2]), m[3], m[1])
      addTranscript(String(m[2]).padStart(3, '0'), m[3], m[1])
    }
  }
  for (const name of [
    'co-audio.ts',
    'co-audio-avance.ts',
    'co-audio-avance-conv-extra.ts',
    'co-audio-avance-radio.ts',
  ]) {
    const path = join(COMM, name)
    if (!existsSync(path)) continue
    const src = readFileSync(path, 'utf8')
    let m
    // item(..., "message-1.mp3", "transcript...")
    const itemRe =
      /item\(\s*"(?:base|moyen|avance)"\s*,\s*"[^"]+"\s*,\s*"[^"]+"\s*,\s*"([^"]+\.mp3)"\s*,\s*"((?:\\.|[^"\\])*)"\s*\)/g
    while ((m = itemRe.exec(src))) {
      addTranscript(m[1].replace(/\.mp3$/i, ''), m[2].replace(/\\"/g, '"').replace(/\\n/g, '\n'), 'any')
    }
    const cRe = /(?:export )?const (CONV|RADIO)_(\d+)\s*=\s*`([^`]*)`/g
    while ((m = cRe.exec(src))) {
      const prefix = m[1] === 'CONV' ? 'conversation' : 'radio'
      addTranscript(`${prefix}-${m[2]}`, m[3], 'any')
    }
  }
}

/** ——— Question pools ——— */
/** @type {Record<string, Map<string, Array<{prompt:string,options:string[],answer:string}>>>} */
const poolsByLevel = {
  A1: new Map(),
  A2: new Map(),
  B1: new Map(),
  any: new Map(),
}

function poolKeyVariants(slug) {
  const s = slug.replace(/^scolaire-/, '').replace(/^(base|moyen|avance)-/, '')
  const out = new Set([s, slug])
  const m = /^(message|annonce|radio|conversation|objet|instruction)-(\d+(?:\.\d+)?)$/.exec(s)
  if (m) out.add(`${m[1]}-${m[2]}`)
  const num = /^(\d+)$/.exec(s)
  if (num) {
    out.add(num[1])
    out.add(num[1].padStart(3, '0'))
  }
  return [...out]
}

function pushPool(slug, questions, level = 'any') {
  if (!questions.length) return
  const bucket = poolsByLevel[level] ?? poolsByLevel.any
  for (const key of poolKeyVariants(slug)) {
    const prev = bucket.get(key) ?? []
    bucket.set(key, prev.length >= questions.length ? prev : questions)
  }
}

function parseRawQBlock(block) {
  const textQ = /textQ:\s*"((?:\\.|[^"\\])*)"/.exec(block)?.[1]
  if (!textQ) return null
  const textArr = /text:\s*\[((?:[^\[\]]|\[[^\]]*\])*)\]/.exec(block)?.[1]
  if (!textArr) return null
  const options = [...textArr.matchAll(/"((?:\\.|[^"\\])*)"/g)].map((m) =>
    m[1].replace(/\\"/g, '"').replace(/\\n/g, ' '),
  )
  if (options.length < 3) return null
  const textC = Number(/textC:\s*(\d+)/.exec(block)?.[1] ?? 0)
  const answer = options[textC] ?? options[0]
  return {
    prompt: textQ.replace(/\\"/g, '"'),
    options: options.slice(0, 3),
    answer,
  }
}

function extractBuildPools(src, fnName = 'buildPool') {
  const re = new RegExp(
    `${fnName}\\(\\s*"[^"]+"\\s*,\\s*"([^"]+)"\\s*,\\s*\\[([\\s\\S]*?)\\]\\s*\\)`,
    'g',
  )
  let m
  while ((m = re.exec(src))) {
    const slug = m[1]
    const body = m[2]
    const questions = []
    const chunks = body.split(/\{\s*id:/).slice(1)
    for (const chunk of chunks) {
      const q = parseRawQBlock(`{ id:${chunk}`)
      if (q) questions.push(q)
    }
    pushPool(slug, questions, 'any')
  }
}

/** Pools express : niveau déduit de l’id (e2-1 → A1, e10 → A2) ou du contexte buildListeningAudio. */
function expressPoolLevel(id, fileHint = '') {
  if (/^e10|^e9|^e11|^e12/i.test(id) || /e10|e9|e11|e12/i.test(fileHint)) return 'A2'
  if (/^e[1-8]/i.test(id) || /express-e[1-8]/i.test(fileHint)) return 'A1'
  return 'any'
}

function extractExpressPools(src, fileHint = '') {
  // buildListeningAudio({ level, num, questions: qs("047", [...]) })
  const buildQsRe =
    /buildListeningAudio\(\{\s*id:\s*"([^"]+)"\s*,\s*level:\s*"(A1|A2)"\s*,\s*num:\s*(\d+)[\s\S]*?questions:\s*qs\(\s*"\d+"\s*,\s*\[([\s\S]*?)\]\s*\)/g
  let m
  while ((m = buildQsRe.exec(src))) {
    const level = m[2]
    const num = String(m[3])
    const body = m[4]
    const questions = []
    const objs = body.split(/\n\s*\{\s*\n/).slice(1)
    for (const chunk of objs) {
      const q = parseRawQBlock(`{ id:"${num}",\n${chunk}`)
      if (q) questions.push(q)
    }
    if (questions.length) {
      pushPool(num, questions, level)
      pushPool(num.padStart(3, '0'), questions, level)
      pushPool(String(Number(num)), questions, level)
    }
  }

  const re = /buildExpressPool\(\s*"([^"]+)"\s*,\s*\[([\s\S]*?)\]\s*\)/g
  while ((m = re.exec(src))) {
    const id = m[1]
    const body = m[2]
    const level = expressPoolLevel(id, fileHint)
    const questions = []
    const chunks = body.split(/\{\s*id:/).slice(1)
    for (const chunk of chunks) {
      const q = parseRawQBlock(`{ id:${chunk}`)
      if (q) questions.push(q)
    }
    if (questions.length === 0) {
      const objs = body.split(/\n\s*\{\s*\n/).slice(1)
      for (const chunk of objs) {
        const q = parseRawQBlock(`{ id:"x",\n${chunk}`)
        if (q) questions.push(q)
      }
    }
    const num = /(\d{2,3})$/.exec(id)?.[1]
    if (num) {
      pushPool(num, questions, level)
      pushPool(num.padStart(3, '0'), questions, level)
      pushPool(String(Number(num)), questions, level)
    }
    pushPool(id, questions, level)
  }

  // qs() hors buildListening (déjà couverts) — fallback any
  const qsRe = /qs\(\s*"(\d+)"\s*,\s*\[([\s\S]*?)\]\s*\)/g
  while ((m = qsRe.exec(src))) {
    const num = m[1]
    const body = m[2]
    const questions = []
    const objs = body.split(/\n\s*\{\s*\n/).slice(1)
    for (const chunk of objs) {
      const q = parseRawQBlock(`{ id:"${num}",\n${chunk}`)
      if (q) questions.push(q)
    }
    // Ne pas écraser un pool déjà typé A1/A2 plus riche
    const prefer = expressPoolLevel(`e${fileHint}`, fileHint)
    pushPool(num, questions, prefer)
    pushPool(num.padStart(3, '0'), questions, prefer)
    pushPool(String(Number(num)), questions, prefer)
  }
}

/** Pools `COMultiQuestion` exportés (`textQ` / `textChoices` / `textCorrect`). */
function extractMultiQuestionPools(src) {
  // "base-message-1": [ { id: "...", textQ: "...", textChoices: [...], textCorrect: 0, ... }, ... ]
  const entryRe =
    /["']((?:base|moyen|avance)(?:-scolaire)?-(?:message|annonce|radio|conversation|objet|instruction)-\d+(?:\.\d+)?)["']\s*:\s*\[/g
  let m
  while ((m = entryRe.exec(src))) {
    const slug = m[1]
    const start = m.index + m[0].length
    let depth = 1
    let i = start
    while (i < src.length && depth > 0) {
      const ch = src[i]
      if (ch === '[') depth++
      else if (ch === ']') depth--
      i++
    }
    const body = src.slice(start, i - 1)
    const questions = []
    const chunks = body.split(/\{\s*id:/).slice(1)
    for (const chunk of chunks) {
      const block = `{ id:${chunk}`
      const textQ = /textQ:\s*"((?:\\.|[^"\\])*)"/.exec(block)?.[1]
      const choicesArr = /textChoices:\s*\[((?:[^\[\]]|\[[^\]]*\])*)\]/.exec(block)?.[1]
      if (!textQ || !choicesArr) {
        const fallback = parseRawQBlock(block)
        if (fallback) questions.push(fallback)
        continue
      }
      const options = [...choicesArr.matchAll(/"((?:\\.|[^"\\])*)"/g)].map((x) =>
        x[1].replace(/\\"/g, '"'),
      )
      if (options.length < 3) continue
      const textC = Number(/textCorrect:\s*(\d+)/.exec(block)?.[1] ?? 0)
      questions.push({
        prompt: textQ.replace(/\\"/g, '"'),
        options: options.slice(0, 3),
        answer: options[textC] ?? options[0],
      })
    }
    pushPool(slug, questions, 'any')
    // variante sans préfixe niveau
    const short = slug.replace(/^(base|moyen|avance)-scolaire-/, '').replace(/^(base|moyen|avance)-/, '')
    pushPool(short, questions, 'any')
  }
}

function loadQuestionPools() {
  if (!existsSync(COMM)) return
  for (const name of readdirSync(COMM)) {
    if (!/^co-questions.*\.ts$/.test(name) && !/^express-.*-listening\.ts$/.test(name)) continue
    const src = readFileSync(join(COMM, name), 'utf8')
    extractBuildPools(src, 'buildPool')
    extractBuildPools(src, 'buildScolairePool')
    extractExpressPools(src, name)
    extractMultiQuestionPools(src)
  }
}

function getPoolForStem(stem, audioLevel) {
  const prefer =
    audioLevel === 'facile-a1' ? ['A1', 'any'] : audioLevel === 'moyen-a2' ? ['A2', 'any'] : ['B1', 'any', 'A2']
  for (const level of prefer) {
    const bucket = poolsByLevel[level]
    for (const key of poolKeyVariants(stem)) {
      const q = bucket.get(key)
      if (q?.length) return q
    }
  }
  return null
}

function titleFromStem(stem) {
  if (/^message-/.test(stem)) return `Message ${stem.replace(/^message-/, '')}`
  if (/^annonce-/.test(stem)) return `Annonce ${stem.replace(/^annonce-/, '')}`
  if (/^radio-/.test(stem)) return `Radio ${stem.replace(/^radio-/, '')}`
  if (/^conversation-/.test(stem)) return `Conversation ${stem.replace(/^conversation-/, '')}`
  if (/^objet-/.test(stem)) return `Objets ${stem.replace(/^objet-/, '')}`
  if (/^instruction-/.test(stem)) return `Instruction ${stem.replace(/^instruction-/, '')}`
  if (/^\d+$/.test(stem)) return `Dialogue ${stem}`
  return stem
}

function toTcfQuestions(rawQuestions, max) {
  const out = []
  const seen = new Set()
  for (const q of rawQuestions) {
    if (out.length >= max) break
    const prompt = String(q.prompt ?? '').trim()
    const key = norm(prompt)
    if (!prompt || seen.has(key)) continue
    seen.add(key)
    const options = (q.options ?? []).map((o) => String(o).trim()).filter(Boolean)
    const answer = String(q.answer ?? '').trim()
    if (options.length >= 3 && answer) {
      const choix = options.slice(0, 3).map((texte, i) => ({
        id: LETTERS[i],
        texte,
        ...(norm(texte) === norm(answer) ? { correct: true } : {}),
      }))
      if (!choix.some((c) => c.correct)) {
        choix[0].correct = true
        choix[0].texte = answer
      }
      // exactement une bonne réponse
      let found = false
      for (const c of choix) {
        if (c.correct && !found) found = true
        else delete c.correct
      }
      out.push({
        enonce: prompt,
        type_reponse: 'qcm_texte',
        points: 1,
        melanger: false,
        choix,
      })
    } else if (answer) {
      out.push({
        enonce: prompt,
        type_reponse: 'lignes',
        points: 1,
        nb_lignes: 2,
        reponse_modele: answer,
      })
    }
  }
  return out
}

function isSoutienExercise(ex) {
  return typeof ex?.id === 'string' && ex.id.startsWith('tcf-ss-')
}

function main() {
  if (!existsSync(MANIFEST)) {
    console.error('Manifest manquant:', MANIFEST)
    process.exit(1)
  }
  if (!existsSync(COMM)) {
    console.error('Soutien communication manquant:', COMM)
    console.error('Clonez soutien-scolaire ou définissez SOUTIEN_ROOT.')
    process.exit(1)
  }

  loadTranscripts()
  loadQuestionPools()

  const manifest = loadJson(MANIFEST)
  const items = manifest.items ?? []

  /** @type {Map<string, object[]>} */
  const byNiveau = new Map([
    ['A0-A1', []],
    ['A1-A2', []],
    ['A2-B1', []],
  ])

  let missingTx = 0
  let missingPool = 0
  let built = 0
  const usedAudio = new Set()

  // Ordre stable : niveau → thème → fichier
  const sorted = [...items].sort((a, b) => {
    const la = a.level.localeCompare(b.level)
    if (la) return la
    const ta = a.theme.localeCompare(b.theme)
    if (ta) return ta
    return a.file.localeCompare(b.file)
  })

  for (const item of sorted) {
    const stem = item.file.replace(/\.mp3$/i, '')
    const niveau = LEVEL_TO_NIVEAU[item.level]
    if (!niveau) continue

    const audioSrc = `/lib/audio/${item.path}`
    if (usedAudio.has(audioSrc)) continue

    const transcript = getTranscript(stem, item.level)

    if (!transcript) {
      missingTx++
      continue
    }

    const pool = getPoolForStem(stem, item.level)
    if (!pool?.length) {
      missingPool++
      continue
    }

    const questions = toTcfQuestions(pool, QUESTIONS_PAR_NIVEAU[niveau])
    if (questions.length < 1) {
      missingPool++
      continue
    }

    usedAudio.add(audioSrc)
    byNiveau.get(niveau).push({
      stem,
      themeFolder: item.theme,
      transcript,
      audioSrc,
      questions,
      title: titleFromStem(stem),
    })
    built++
  }

  const stats = {
    built,
    missingTx,
    missingPool,
    transcripts: Object.values(transcriptsByLevel).reduce((n, m) => n + m.size, 0),
    pools: Object.values(poolsByLevel).reduce((n, m) => n + m.size, 0),
    byNiveau: {},
  }

  for (const [niveau, docs] of byNiveau) {
    const dossier = NIVEAU_TO_DOSSIER[niveau]
    const outPath = join(CONTENT, dossier, 'co.json')
    const existing = existsSync(outPath) ? loadJson(outPath) : []
    if (!Array.isArray(existing)) {
      console.error('Banque invalide:', outPath)
      process.exit(1)
    }

    const kept = existing.filter((ex) => !isSoutienExercise(ex))
    const prefix = NIVEAU_TO_PREFIX[niveau]
    const imported = []

    // Séries de 4 exercices (slots CO 1–4)
    for (let i = 0; i < docs.length; i++) {
      const doc = docs[i]
      const serie = Math.floor(i / 4) + 1
      const numero = (i % 4) + 1
      const id = `tcf-ss-${prefix}-s${serie}-co-${numero}`
      imported.push({
        id,
        niveau,
        competence: 'CO',
        type_exercice: 'complet',
        theme: `Soutien scolaire · ${doc.title}`,
        consigne: CONSIGNE,
        support: {
          audio: doc.audioSrc,
          transcription: doc.transcript,
        },
        questions: doc.questions,
        consigne_supplementaire: null,
      })
    }

    const merged = [...kept, ...imported]
    writeFileSync(outPath, `${JSON.stringify(merged, null, 2)}\n`)
    stats.byNiveau[niveau] = {
      kept: kept.length,
      imported: imported.length,
      total: merged.length,
      out: relative(ROOT, outPath),
      series: docs.length ? Math.ceil(docs.length / 4) : 0,
    }
  }

  // Candidats pour le réalignement STT (scripts/rematch-tcf-co-transcripts.py)
  const candidates = { byLevel: { A1: {}, A2: {}, any: {} } }
  for (const level of ['A1', 'A2', 'any']) {
    const audioLevel = level === 'A1' ? 'facile-a1' : level === 'A2' ? 'moyen-a2' : 'facile-a1'
    const stems = new Set([
      ...transcriptsByLevel[level].keys(),
      ...poolsByLevel[level].keys(),
      ...(level === 'any' ? [] : [...transcriptsByLevel.any.keys(), ...poolsByLevel.any.keys()]),
    ])
    for (const stem of stems) {
      const key = /^\d+$/.test(stem) ? stem.padStart(3, '0') : stem
      if (candidates.byLevel[level][key]) continue
      const transcript = getTranscript(key, audioLevel)
      const pool = getPoolForStem(key, audioLevel)
      if (!transcript || !pool?.length) continue
      const maxQ = level === 'A2' ? 6 : 4
      candidates.byLevel[level][key] = {
        transcript,
        questions: toTcfQuestions(pool, maxQ),
      }
    }
  }
  writeFileSync(
    join(ROOT, 'scripts/tcf-co-transcript-candidates.json'),
    `${JSON.stringify(candidates, null, 2)}\n`,
  )

  console.log(JSON.stringify(stats, null, 2))
}

main()
