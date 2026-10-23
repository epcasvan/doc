#!/usr/bin/env node
/**
 * Importe les banques de phrases de la section grammaire soutien-scolaire
 * vers src/grammaire/exercises/bank/lessons-soutien.ts
 *
 * Relancer : SOUTIEN_ROOT=/tmp/soutien-scolaire node scripts/import-grammaire-soutien-phrases.mjs
 */
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()
const SOUTIEN =
  process.env.SOUTIEN_ROOT ??
  (existsSync('/tmp/soutien-scolaire/lib/curriculum/content/francais')
    ? '/tmp/soutien-scolaire'
    : join(ROOT, '../soutien-scolaire'))
const FR = join(SOUTIEN, 'lib/curriculum/content/francais')
const OUT = join(ROOT, 'src/grammaire/exercises/bank/lessons-soutien.ts')

const G1_TO_SUB = {
  'G1.2': 'etre',
  'G1.3': 'avoir',
  'G1.5': 'er',
  'G1.6': 'pronominaux',
  'G1.7': 'modaux',
  'G1.8': 'er-particuliers',
  'G1.9': 'ir',
  'G1.10': 're-oir',
  'G1.11': 'j1',
}

const SLUG_TO_SUB = {
  'a1-gr-etre': 'etre',
  'a1-gr-avoir': 'avoir',
  'a1-gr-verbes-er': 'er',
  'a1-gr-verbes-er-particuliers': 'er-particuliers',
  'a1-gr-verbes-ir': 'ir',
  'a1-gr-verbes-re-oir': 're-oir',
  'a1-gr-modaux': 'modaux',
  'a1-gr-pronominaux': 'pronominaux',
  'a1-gr-l01': 'pronoms-sujets',
  'a1-gr-phrases': 'er',
  'a1-gr-cest-il-est': 'f5',
  'a1-gr-present-progressif': 'j1',
  'a1-gr-passe-compose-avoir': 'pc-avoir',
  'a1-gr-passe-compose-etre': 'pc-etre',
  'a1-gr-imparfait': 'imparfait',
  'a1-gr-plus-que-parfait': 'pqp',
  'a1-gr-verbes-double-auxiliaire': 'double-aux',
  'a1-gr-pronominaux-passe-compose': 'pc-pronominaux',
  'a1-gr-imparfait-passe-compose': 'imparfait-ou-pc',
  'a1-gr-accord-participe-passe': 'accord-pp',
  'a1-gr-futur-proche': 'futur-proche',
  'a1-gr-futur-simple': 'futur-simple',
  'a2-gr-futur-simple-ou-proche': 'futur-proche-ou-simple',
  'a1-gr-futur-anterieur': 'futur-anterieur',
  'a2-gr-hypothese-futur': 'hypothese-futur',
  'a1-gr-negation-ne-pas': 'a7',
  'a1-gr-autres-negations': 'a8',
  'a2-gr-l42': 'a8',
  'a1-gr-question-totale': 'c1',
  'a1-gr-question-ouverte-qui': 'c2',
  'a1-gr-interro': 'c1',
  'a2-gr-l07': 'c1',
  'a2-gr-l09': 'c2',
  'a1-gr-l19': 'f6',
  'a1-gr-l18': 'i3',
  'a1-gr-l22': 'e4',
  'a1-gr-l23': 'f7',
  'a1-gr-genre-adjectifs': 'f7',
  'a1-gr-pluriel-adjectifs': 'f7',
  'a1-gr-place-adjectif': 'f12',
  'a1-gr-adjectifs-accords-particuliers': 'f7',
  'a1-gr-adjectifs-indefinis': 'g5',
  'a1-gr-article-partitif': 'g3',
  'a1-gr-l14': 'g3',
  'a1-gr-expression-quantite': 'g4',
  'a1-gr-l04': 'e1',
  'a1-gr-articles-contractes': 'g2',
  'a1-gr-expressions-temps': 'e2',
  'a1-gr-expression-temps-moment': 'e2',
  'a1-gr-marqueurs-temps': 'e5',
  'a1-gr-pronoms-cod-coi': 'i4',
  'a2-gr-l35': 'i4',
  'a1-gr-pronom-en': 'i7',
  'a1-gr-pronoms-y-en-lieu': 'i7',
  'a1-gr-en-y-pronom-tonique': 'i7',
  'a2-gr-l36': 'i7',
  'a1-gr-pronoms-relatifs-qui-que-ou': 'i1',
  'a2-gr-l19': 'i1',
  'a1-gr-pronom-relatif-dont': 'i8',
  'a1-gr-pronoms-relatifs-composes': 'i9',
  'a1-gr-pronoms-toniques': 'd3',
  'a1-gr-pronoms-demonstratifs': 'i3',
  'a1-gr-pronoms-possessifs': 'i2',
  'a1-gr-pronoms-indefinis': 'i6',
  'a1-gr-expression-cause': 'k3',
  'a2-gr-l52': 'k3',
  'a1-gr-expression-consequence': 'k4',
  'a1-gr-comparaison-adj-adv': 'f9',
  'a1-gr-comparaison-nom-verbe': 'f14',
  'a2-gr-l39': 'f9',
  'a1-gr-superlatif': 'f13',
  'a2-gr-superlatif': 'f13',
  'a2-gr-bon-bien-meilleur-mieux': 'f13',
  'a1-gr-imperatif': 'f11',
  'a1-gr-conditionnel-present': 'j8',
  'a2-gr-conditionnel': 'j8',
  'a1-gr-conditionnel-passe': 'j10',
  'a1-gr-hypothese-condition': 'j9',
  'a1-gr-forme-passive': 'j6',
  'a1-gr-discours-indirect-present': 'j7',
  'a1-gr-gerondif': 'j3',
  'a1-gr-subjonctif-present': 'k10',
  'a1-gr-subjonctif-passe': 'k12',
  'a1-gr-subjonctif-ou-indicatif': 'k13',
  'a1-gr-subjonctif-ou-infinitif': 'k10',
  'a1-gr-phrase-exclamative': 'c4',
  'a1-gr-noms-composes': 'l12',
  'a1-gr-doubles-pronoms': 'k9',
  'a1-gr-a-en-de-lieux': 'e6',
  'a1-gr-autres-prepositions': 'e7',
  'a1-gr-adverbes-intensite': 'e4',
  'a1-gr-adverbes-ment': 'e4',
  'a1-gr-mots-liaison': 'k2',
  'a1-gr-conjonctions-temps': 'k6',
  'a1-gr-expression-but': 'k5',
  'a1-gr-opposition-concession': 'k7',
  'a1-gr-genre-personnes': 'f7',
  'a1-gr-genre-choses': 'g1',
  'a1-gr-pluriel-noms': 'g1',
  'a1-gr-passe-recent': 'j2',
}

const SKIP_SLUGS = new Set(['a1-gr-bilan-a1', 'a1-gr-bilan-a2', 'a1-gr-bilan-b1'])

const ETRE_FORMS = new Set(['suis', 'es', 'est', 'sommes', 'êtes', 'sont'])
const AVOIR_FORMS = new Set(['ai', 'as', 'a', 'avons', 'avez', 'ont'])

const PRONOUNS = ['Je', 'Tu', 'Il', 'Elle', 'Nous', 'Vous', 'Ils', 'Elles']
const VOWEL = /^[aeiouhâàäéèêëíîïóôöúùûüAEIOUH]/i

function cleanFr(s) {
  return String(s ?? '')
    .replace(/\{a\}/g, '')
    .replace(/\{\/a\}/g, '')
    .replace(/\{su\}/g, '')
    .replace(/\{\/su\}/g, '')
    .replace(/\{ve\}/g, '')
    .replace(/\{\/ve\}/g, '')
    .replace(/\{co\}/g, '')
    .replace(/\{\/co\}/g, '')
    .replace(/\{li\}/g, '')
    .replace(/\|/g, '')
    .replace(/\{\/li\}/g, '')
    .replace(/\s+/g, ' ')
    .replace(/'/g, '’')
    .trim()
}

function startsVowel(s) {
  return VOWEL.test(String(s ?? '').replace(/^['’]/, ''))
}

function subjectOf(idx, next) {
  if (idx === 0 && startsVowel(next)) return { display: 'J’', sep: '' }
  return { display: PRONOUNS[idx], sep: ' ' }
}

function conjugated(verb, idx) {
  const i = idx % 8
  const form = verb.forms[i]
  if (verb.reflexive) {
    const r = verb.reflexive[i]
    return r.endsWith("'") || r.endsWith('’') ? `${r.replace(/'$/, '’')}${form}` : `${r} ${form}`
  }
  return form
}

function toNeg(subj, form, tail) {
  const t = tail.replace(/^\s+/, '')
  const token = form.replace(/^(me|te|se|nous|vous|m’|t’|s’) ?/, '')
  const elide = startsVowel(form) || startsVowel(token)
  let ne = elide ? 'n’' : 'ne '
  let s = subj === 'J’' ? 'Je' : subj
  if (form.startsWith('me ') || form.startsWith('te ') || form.startsWith('se ') || form.startsWith('nous ') || form.startsWith('vous ')) {
    const [refl, ...rest] = form.split(' ')
    return `${s} ${elide ? 'n’' : 'ne '}${refl} ${rest.join(' ')} pas ${t}`.replace(/\s+/g, ' ').trim()
  }
  if (form.startsWith('m’') || form.startsWith('t’') || form.startsWith('s’')) {
    return `${s} ne ${form} pas ${t}`.replace(/\s+/g, ' ').trim()
  }
  return `${s} ${ne}${form} pas ${t}`.replace(/\s+/g, ' ').trim()
}

function shuffleWords(sentence) {
  const words = cleanFr(sentence)
    .replace(/[?!.]+$/, '')
    .split(/\s+/)
    .filter(Boolean)
  if (words.length < 3) return null
  const rotated = [...words.slice(1), words[0]]
  return { prompt: `${rotated.join(' / ')}.`, answer: `${cleanFr(sentence).replace(/[?!.]+$/, '')}.` }
}

function parseStringArray(block) {
  const out = []
  const re = /"((?:\\.|[^"\\])*)"/g
  let m
  while ((m = re.exec(block))) out.push(m[1].replace(/\\"/g, '"').replace(/\\n/g, ' '))
  return out
}

function parseObjectArray(src, key) {
  const out = []
  const re = new RegExp(`${key}\\s*:\\s*\\[`, 'g')
  let m
  while ((m = re.exec(src))) {
    let i = m.index + m[0].length - 1
    let depth = 0
    const start = i
    for (; i < src.length; i++) {
      if (src[i] === '[') depth++
      else if (src[i] === ']') {
        depth--
        if (depth === 0) {
          out.push(src.slice(start, i + 1))
          break
        }
      }
    }
  }
  return out
}

function extractTypedBlocks(src, type) {
  return [...src.matchAll(new RegExp(`type:\\s*"${type}"[\\s\\S]*?(?=type:\\s*"|evalExercises:|$)`, 'g'))].map(
    (m) => m[0],
  )
}

function extractFillItems(block) {
  const items = []
  const re =
    /\{\s*sentence:\s*"((?:\\.|[^"\\])*)"[^}]*?answer:\s*"((?:\\.|[^"\\])*)"/g
  let m
  while ((m = re.exec(block))) {
    const prompt = cleanFr(m[1].replace(/\\"/g, '"'))
    const answer = cleanFr(m[2].replace(/\\"/g, '"'))
    if (!prompt || !answer || answer === '…' || answer === '...') continue
    if (!prompt.includes('___') && !prompt.includes('…')) continue
    items.push({ prompt, answer })
  }
  return items
}

function extractQcmItems(block) {
  const items = []
  const re =
    /\{\s*sentence:\s*"((?:\\.|[^"\\])*)"[\s\S]*?choices:\s*\[([^\]]*)\][\s\S]*?correctIdx:\s*(\d+)/g
  let m
  while ((m = re.exec(block))) {
    const prompt = cleanFr(m[1].replace(/\\"/g, '"'))
    const choices = parseStringArray(`[${m[2]}]`).map(cleanFr)
    const idx = Number(m[3])
    const answer = choices[idx]
    if (prompt && answer && choices.length >= 2) items.push({ prompt, answer, choices })
  }
  return items
}

function extractWordOrder(block) {
  const items = []
  const re = /sentence:\s*"((?:\\.|[^"\\])*)"/g
  let m
  while ((m = re.exec(block))) {
    const sentence = cleanFr(m[1].replace(/\\"/g, '"'))
    const scrambled = shuffleWords(sentence)
    if (scrambled) items.push(scrambled)
  }
  return items
}

function extractWriteVerbs(block) {
  const m = block.match(/verbPool:\s*\[([\s\S]*?)\]/)
  if (!m) return []
  return parseStringArray(`[${m[1]}]`).map(cleanFr).filter(Boolean)
}

function extractClassify(block) {
  const items = []
  const re = /word:\s*"((?:\\.|[^"\\])*)"[\s\S]*?categoryIdx:\s*(\d+)/g
  let m
  while ((m = re.exec(block))) {
    const raw = m[1].replace(/\\"/g, '"')
    const highlighted = (raw.match(/\{a\}([^]*?)\{\/a\}/) || [])[1]
    const prompt = `${cleanFr(raw)} → ___`
    const cats = ['COD', 'COI', 'CC', 'Sujet', 'Verbe', 'Complément']
    const cat = cats[Number(m[2])] || highlighted || ''
    if (cleanFr(raw) && cat) items.push({ prompt, answer: cleanFr(highlighted || cat) })
  }
  return items
}

function parseVerbs(src) {
  const verbs = {}
  const er = (inf, stem) => ({
    infinitive: inf,
    forms: [`${stem}e`, `${stem}es`, `${stem}e`, `${stem}e`, `${stem}ons`, `${stem}ez`, `${stem}ent`, `${stem}ent`],
  })
  const ir = (inf, stem) => ({
    infinitive: inf,
    forms: [`${stem}s`, `${stem}s`, `${stem}t`, `${stem}t`, `${stem}ssons`, `${stem}ssez`, `${stem}ssent`, `${stem}ssent`],
  })
  const reflEr = (inf, stem) => ({
    ...er(inf, stem),
    reflexive: ['me', 'te', 'se', 'se', 'nous', 'vous', 'se', 'se'],
  })
  const reflErVowel = (inf, stem) => ({
    ...er(inf, stem),
    reflexive: ["m'", "t'", "s'", "s'", 'nous', 'vous', "s'", "s'"],
  })

  const callRe = /const\s+([A-Z][A-Z0-9_]*)\s*=\s*(er|ir|reflEr|reflErVowel)\("([^"]+)",\s*"([^"]+)"\)/g
  let m
  while ((m = callRe.exec(src))) {
    const fn = { er, ir, reflEr, reflErVowel }[m[2]]
    verbs[m[1]] = fn(m[3], m[4])
  }

  const objRe = /const\s+([A-Z][A-Z0-9_]*)(?::\s*VerbConj)?\s*=\s*\{([\s\S]*?)\n\};/g
  while ((m = objRe.exec(src))) {
    const name = m[1]
    const body = m[2]
    const inf = (body.match(/infinitive:\s*"([^"]+)"/) || [])[1]
    const formsM = body.match(/forms:\s*\[([\s\S]*?)\]/)
    const reflM = body.match(/reflexive:\s*\[([\s\S]*?)\]/)
    if (!inf || !formsM) continue
    verbs[name] = {
      infinitive: inf,
      forms: parseStringArray(`[${formsM[1]}]`),
      ...(reflM ? { reflexive: parseStringArray(`[${reflM[1]}]`) } : {}),
    }
  }
  return verbs
}

function parseGabarits(src, verbs) {
  const items = []
  const re = /\bg\(\s*([A-Z][A-Z0-9_]*)\s*,\s*"((?:\\.|[^"\\])*)"(?:\s*,\s*(\[[^\]]*\]))?\)/g
  let m
  while ((m = re.exec(src))) {
    const verb = verbs[m[1]]
    if (!verb) continue
    let persons
    if (m[3]) {
      const nums = m[3].match(/\d+/g)
      persons = nums ? nums.map(Number) : undefined
    }
    items.push({ verb, tail: m[2].replace(/\\"/g, '"'), persons })
  }
  return items
}

function parseWritePrompts(src) {
  const m = src.match(/writePrompts:\s*\[([\s\S]*?)\]/)
  if (!m) return []
  return parseStringArray(`[${m[1]}]`)
}

function parseVerbChoice(src, verbs) {
  const items = []
  const re =
    /\bvc\(\s*([A-Z][A-Z0-9_]*)\s*,\s*"((?:\\.|[^"\\])*)"\s*,\s*\[([^\]]*)\]/g
  let m
  while ((m = re.exec(src))) {
    const verb = verbs[m[1]]
    if (!verb) continue
    const distNames = m[3].match(/[A-Z][A-Z0-9_]*/g) || []
    const distractors = distNames.map((n) => verbs[n]).filter(Boolean)
    items.push({ verb, tail: m[2].replace(/\\"/g, '"'), distractors })
  }
  return items
}

function splitProfiles(src) {
  const parts = []
  const re = /export const (G1_\d+_PROFILE): G1LessonProfile = \{/g
  const idxs = []
  let m
  while ((m = re.exec(src))) idxs.push({ name: m[1], index: m.index })
  for (let i = 0; i < idxs.length; i++) {
    const end = i + 1 < idxs.length ? idxs[i + 1].index : src.length
    parts.push({ name: idxs[i].name, body: src.slice(idxs[i].index, end) })
  }
  return parts
}

/** @type {Map<string, {fill: any[], qcm: any[], ordre: any[], ecrire: any[], negatif: any[], associer: any[]}>} */
const banks = new Map()

function bank(subId) {
  if (!banks.has(subId)) {
    banks.set(subId, { fill: [], qcm: [], ordre: [], ecrire: [], negatif: [], associer: [] })
  }
  return banks.get(subId)
}

function addUnique(list, item) {
  const key = item.prompt || `${item.verb ?? ''}|${item.word ?? ''}`
  if (!key || key === '|') return
  if (item.prompt && !item.answer) return
  if (list.some((x) => (x.prompt || `${x.verb ?? ''}|${x.word ?? ''}`) === key)) return
  list.push(item)
}

function ingestG1() {
  const src = readFileSync(join(FR, 'g1-lesson-profiles.ts'), 'utf8')
  const verbs = parseVerbs(src)
  const profiles = splitProfiles(src)
  const codeOf = {
    G1_2_PROFILE: 'G1.2',
    G1_3_PROFILE: 'G1.3',
    G1_5_PROFILE: 'G1.5',
    G1_6_PROFILE: 'G1.6',
    G1_7_PROFILE: 'G1.7',
    G1_8_PROFILE: 'G1.8',
    G1_9_PROFILE: 'G1.9',
    G1_10_PROFILE: 'G1.10',
    G1_11_PROFILE: 'G1.11',
  }
  for (const p of profiles) {
    const code = codeOf[p.name]
    const subId = G1_TO_SUB[code]
    if (!subId) continue
    const b = bank(subId)
    let gabarits = parseGabarits(p.body, verbs)
    const ref = p.body.match(/gabarits:\s*([A-Z][A-Z0-9_]*)\s*,/)
    if (ref && gabarits.length === 0) {
      const arr = src.match(new RegExp(`(?:const|let)\\s+${ref[1]}[^=]*=\\s*\\[([\\s\\S]*?)\\n\\]`))
      if (arr) gabarits = parseGabarits(arr[0], verbs)
    }
    gabarits.forEach((g, gi) => {
      const persons = g.persons?.length ? g.persons : [0, 1, 2, 3, 4, 5, 6, 7]
      const idx = persons[gi % persons.length]
      const form = conjugated(g.verb, idx)
      const subj = subjectOf(idx, form)
      const tail = g.tail.startsWith(' ') ? g.tail : ` ${g.tail}`
      const prompt = `${subj.display}${subj.sep}___ (${g.verb.infinitive})${cleanFr(tail).replace(/^/, (t) => (t.startsWith(' ') ? t : ` ${t}`))}`.replace(/\s+\./, '.')
      const prettyTail = cleanFr(tail)
      const p2 = `${subj.display}${subj.sep}___ (${cleanFr(g.verb.infinitive)})${prettyTail.startsWith(' ') || prettyTail.startsWith('’') ? prettyTail : ` ${prettyTail}`}`
      addUnique(b.fill, { prompt: p2, answer: cleanFr(form) })
      const aff = `${subj.display}${subj.sep}${form}${prettyTail.startsWith(' ') ? prettyTail : ` ${prettyTail}`}`
        .replace(/\s+/g, ' ')
        .replace(/\s+\./, '.')
      const neg = toNeg(subj.display, form, prettyTail)
      addUnique(b.negatif, { prompt: cleanFr(aff.endsWith('.') || aff.endsWith('?') ? aff : `${aff}.`), answer: cleanFr(neg.endsWith('.') || neg.endsWith('?') ? neg : `${neg}.`) })
      const scrambled = shuffleWords(aff)
      if (scrambled) addUnique(b.ordre, scrambled)
    })
    for (const wp of parseWritePrompts(p.body)) {
      const [verb, word] = wp.split('/').map((s) => s.replace(/:$/, '').trim())
      if (verb && word) addUnique(b.ecrire, { verb: cleanFr(verb.toLowerCase()), word: cleanFr(word) })
    }
    parseVerbChoice(p.body, verbs).forEach((vc, vi) => {
      const persons = [0, 1, 2, 3, 4, 5, 6, 7]
      const idx = persons[vi % 8]
      const form = conjugated(vc.verb, idx)
      const subj = subjectOf(idx, form)
      const tail = cleanFr(vc.tail)
      const options = [form, ...vc.distractors.map((d) => conjugated(d, idx))].map(cleanFr)
      const uniq = [...new Set(options)].slice(0, 3)
      if (!uniq.includes(cleanFr(form))) uniq[0] = cleanFr(form)
      while (uniq.length < 3) uniq.push(uniq[0])
      const prompt = `${subj.display}${subj.sep}___${tail.startsWith(' ') ? tail : ` ${tail}`}`
      addUnique(b.qcm, { prompt, answer: cleanFr(form), choices: uniq })
    })
  }
}

function generatedSubIds(slug, answer) {
  if (SKIP_SLUGS.has(slug)) return []
  if (slug === 'a1-conj-l01') {
    const form = answer.replace(/’/g, "'")
    if (ETRE_FORMS.has(form)) return ['etre']
    if (AVOIR_FORMS.has(form)) return ['avoir']
    return []
  }
  const subId = SLUG_TO_SUB[slug]
  return subId ? [subId] : []
}

function ingestGenerated() {
  const src = readFileSync(join(FR, 'generated-grammar-exercises.ts'), 'utf8')
  const re = /"([^"]+)":\s*\{\s*label:\s*"([^"]+)"[\s\S]*?cases:\s*\[([\s\S]*?)\]\s*,/g
  let m
  while ((m = re.exec(src))) {
    const slug = m[1]
    if (SKIP_SLUGS.has(slug)) continue
    const caseRe = /sentence:\s*"((?:\\.|[^"\\])*)"\s*,\s*answer:\s*"((?:\\.|[^"\\])*)"/g
    const rows = []
    let c
    while ((c = caseRe.exec(m[3]))) {
      const prompt = cleanFr(c[1].replace(/\\"/g, '"'))
      const answer = cleanFr(c[2].replace(/\\"/g, '"'))
      if (prompt && answer) rows.push({ prompt, answer })
    }
    const choicesM = src.slice(m.index, m.index + 800).match(/choices:\s*\[([\s\S]*?)\]/)
    const choices = choicesM ? parseStringArray(`[${choicesM[1]}]`).map(cleanFr) : []
    for (const row of rows) {
      for (const subId of generatedSubIds(slug, row.answer)) {
        const b = bank(subId)
        addUnique(b.fill, row)
        if (choices.includes(row.answer) && choices.length >= 2) {
          const opts = [row.answer, ...choices.filter((x) => x !== row.answer)].slice(0, 3)
          addUnique(b.qcm, { prompt: row.prompt, answer: row.answer, choices: opts })
        }
      }
    }
  }
}

const CONJ_SLUG_TO_SUB = {
  'a1-conj-l28': 'j2',
  'a1-conj-l29': 'pc-avoir',
  'a1-conj-l30': 'pc-etre',
  'a2-conj-l07': 'imparfait',
  'a1-conj-l20': 'futur-proche',
  'a2-conj-l08': 'futur-simple',
  'a2-conj-l04': 'j8',
  'a2-conj-l05': 'f11',
  'a2-gr-imparfait-irreguliers': 'imparfait',
  'a2-gr-futur-irreguliers': 'futur-simple',
  'a2-gr-futur-simple-ou-proche': 'futur-proche-ou-simple',
  'a2-gr-hypothese-futur': 'hypothese-futur',
  'a2-gr-conditionnel': 'j8',
  'a2-gr-passe-compose-ou-imparfait': 'imparfait-ou-pc',
  'a2-gr-gerondif': 'j3',
  'a2-gr-subjonctif': 'k10',
  'a1-gr-imparfait': 'imparfait',
  'a1-gr-imparfait-passe-compose': 'imparfait-ou-pc',
  'a1-gr-futur-simple': 'futur-simple',
  'a1-gr-gerondif': 'j3',
  'a1-gr-subjonctif-present': 'k10',
  'a1-gr-conditionnel-present': 'j8',
  'a1-conj-l09': 'pronominaux',
  'a1-conj-l15': 'modaux',
  'a2-conj-l02': 'ir',
}

function parseProfileBlocks(src, exportName) {
  const start = src.indexOf(`export const ${exportName}`)
  if (start < 0) return []
  const re = /"([^"]+)":\s*\{/g
  const slice = src.slice(start)
  const idxs = []
  let m
  while ((m = re.exec(slice))) {
    if (m.index > 0 && slice[m.index - 1] && /[A-Za-z0-9_]/.test(slice[m.index - 1])) continue
    idxs.push({ slug: m[1], index: m.index })
  }
  const parts = []
  for (let i = 0; i < idxs.length; i++) {
    const end = i + 1 < idxs.length ? idxs[i + 1].index : slice.length
    parts.push({ slug: idxs[i].slug, body: slice.slice(idxs[i].index, end) })
  }
  return parts
}

function ingestConjProfiles() {
  const src = readFileSync(join(FR, 'conj-lesson-profiles.ts'), 'utf8')
  const blocks = [
    ...parseProfileBlocks(src, 'TENSE_LESSON_PROFILES'),
    ...parseProfileBlocks(src, 'R2_NEGATION_PROFILES'),
  ]
  for (const p of blocks) {
    const subId = CONJ_SLUG_TO_SUB[p.slug] || SLUG_TO_SUB[p.slug]
    if (!subId) continue
    const b = bank(subId)
    const samples = []
    const sampleM = p.body.match(/sampleSentences:\s*\[([\s\S]*?)\]/)
    if (sampleM) samples.push(...parseStringArray(`[${sampleM[1]}]`).map(cleanFr).filter(Boolean))
    for (const s of samples) {
      const scrambled = shuffleWords(s)
      if (scrambled) addUnique(b.ordre, scrambled)
    }
    const verbRe = /infinitive:\s*"([^"]+)"[\s\S]*?forms:\s*\[([\s\S]*?)\]/g
    let vm
    let vi = 0
    while ((vm = verbRe.exec(p.body))) {
      const inf = cleanFr(vm[1])
      const forms = parseStringArray(`[${vm[2]}]`).map(cleanFr)
      if (!inf || forms.length < 6) continue
      const verb = { infinitive: inf, forms }
      const idx = vi % 8
      const form = conjugated(verb, idx)
      if (!form) {
        vi++
        continue
      }
      const subj = subjectOf(idx, form)
      const sample = samples[vi % (samples.length || 1)]
      let tail = '.'
      if (sample) {
        const stripped = sample.replace(/^[A-ZÉÈÊÀÂÎÏÔÙÛÇa-zœæ’']+\s+/, '')
        const afterVerb = stripped.replace(new RegExp(`^${form.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`), '')
        if (afterVerb && afterVerb !== sample) tail = afterVerb.startsWith('.') ? afterVerb : ` ${afterVerb}`
        else if (stripped && stripped !== sample) tail = stripped.startsWith('.') ? stripped : ` ${stripped}`
      }
      const prettyTail = cleanFr(tail) || '.'
      const p2 = `${subj.display}${subj.sep}___ (${inf})${prettyTail.startsWith(' ') || prettyTail.startsWith('.') ? prettyTail : ` ${prettyTail}`}`
      addUnique(b.fill, { prompt: p2.replace(/\s+\./, '.'), answer: form })
      const aff = `${subj.display}${subj.sep}${form}${prettyTail.startsWith(' ') || prettyTail.startsWith('.') ? prettyTail : ` ${prettyTail}`}`
        .replace(/\s+/g, ' ')
        .replace(/\s+\./, '.')
      const neg = toNeg(subj.display, form, prettyTail === '.' ? '' : prettyTail)
      addUnique(b.negatif, {
        prompt: cleanFr(aff.endsWith('.') || aff.endsWith('?') || aff.endsWith('!') ? aff : `${aff}.`),
        answer: cleanFr(neg.endsWith('.') || neg.endsWith('?') || neg.endsWith('!') ? neg : `${neg}.`),
      })
      vi++
    }
    const poolM = p.body.match(/verbPool:\s*\[([\s\S]*?)\]/)
    if (poolM) {
      for (const verb of parseStringArray(`[${poolM[1]}]`).map(cleanFr).filter(Boolean)) {
        addUnique(b.ecrire, { verb, word: 'phrase' })
      }
    }
  }
}

function ingestInlineFiles() {
  const files = readdirSync(FR).filter((f) => f.startsWith('grammaire-g') && f.endsWith('.ts'))
  const skipped = []
  for (const file of files) {
    const src = readFileSync(join(FR, file), 'utf8')
    const slug = (src.match(/slug:\s*"([^"]+)"/) || [])[1]
    if (!slug || SKIP_SLUGS.has(slug)) continue
    const subId = SLUG_TO_SUB[slug]
    if (!subId) {
      skipped.push(slug)
      continue
    }
    const b = bank(subId)
    const exStart = src.search(/\n\s*exercises:\s*\[/)
    if (exStart < 0) continue
    const block = src.slice(exStart)
    for (const fillBlock of extractTypedBlocks(block, 'fill')) {
      for (const it of extractFillItems(fillBlock)) addUnique(b.fill, it)
    }
    for (const qcmBlock of extractTypedBlocks(block, 'qcm')) {
      for (const it of extractQcmItems(qcmBlock)) addUnique(b.qcm, it)
    }
    for (const orderBlock of extractTypedBlocks(block, 'word_order')) {
      for (const it of extractWordOrder(orderBlock)) addUnique(b.ordre, it)
    }
    for (const classBlock of extractTypedBlocks(block, 'classify')) {
      for (const it of extractClassify(classBlock)) addUnique(b.associer, it)
    }
    for (const writeBlock of extractTypedBlocks(block, 'write')) {
      for (const verb of extractWriteVerbs(writeBlock)) {
        addUnique(b.ecrire, { verb, word: 'phrase' })
      }
    }
  }
  if (skipped.length) console.warn('slugs non mappés', [...new Set(skipped)].sort())
}

function tsStr(s) {
  return JSON.stringify(s)
}

function emitItemFill(it) {
  return `      fill(${tsStr(it.prompt)}, ${tsStr(it.answer)}),`
}

function emitItemQcm(it) {
  const opts = it.choices.map((c) => tsStr(c)).join(', ')
  return `      qcm(${tsStr(it.prompt)}, ${tsStr(it.answer)}, [${opts}]),`
}

function emitWrite(it) {
  return `      writeItem(${tsStr(it.verb)}, ${tsStr(it.word)}),`
}

const LABELS = {
  fill: ['Compléter la phrase', 'Complétez la phrase avec la forme qui convient.'],
  qcm: ['Choisir la bonne forme', 'Choisissez la bonne réponse.'],
  ordre: ['Remettre les mots dans l’ordre', 'Remettez les mots dans l’ordre.'],
  ecrire: ['Écrire une phrase', 'Écrivez une phrase avec le verbe et le mot proposés.'],
  negatif: ['Mettre à la forme négative', 'Mettez la phrase à la forme négative.'],
  associer: ['Associer', 'Associez chaque élément à la réponse qui convient.'],
}

function emit() {
  ingestG1()
  ingestGenerated()
  ingestConjProfiles()
  ingestInlineFiles()

  const lessons = []
  const stats = []
  for (const [subId, b] of [...banks.entries()].sort((a, c) => a[0].localeCompare(c[0]))) {
    const chunks = []
    if (b.fill.length + b.qcm.length + b.negatif.length + b.ordre.length + b.associer.length + b.ecrire.length === 0) {
      continue
    }
    if (b.fill.length) {
      chunks.push(
        `  lesson(\n    ${tsStr(subId)},\n    'fill-conj',\n    ${tsStr(LABELS.fill[0])},\n    ${tsStr(LABELS.fill[1])},\n    [\n${b.fill.map(emitItemFill).join('\n')}\n    ],\n  ),`,
      )
    }
    if (b.qcm.length) {
      chunks.push(
        `  lesson(\n    ${tsStr(subId)},\n    'qcm-verbe',\n    ${tsStr(LABELS.qcm[0])},\n    ${tsStr(LABELS.qcm[1])},\n    [\n${b.qcm.map(emitItemQcm).join('\n')}\n    ],\n  ),`,
      )
    }
    if (b.negatif.length) {
      chunks.push(
        `  lesson(\n    ${tsStr(subId)},\n    'negatif',\n    ${tsStr(LABELS.negatif[0])},\n    ${tsStr(LABELS.negatif[1])},\n    [\n${b.negatif.map(emitItemFill).join('\n')}\n    ],\n  ),`,
      )
    }
    if (b.ordre.length) {
      chunks.push(
        `  lesson(\n    ${tsStr(subId)},\n    'ordre',\n    ${tsStr(LABELS.ordre[0])},\n    ${tsStr(LABELS.ordre[1])},\n    [\n${b.ordre.map(emitItemFill).join('\n')}\n    ],\n  ),`,
      )
    }
    if (b.associer.length) {
      chunks.push(
        `  lesson(\n    ${tsStr(subId)},\n    'associer',\n    ${tsStr(LABELS.associer[0])},\n    ${tsStr(LABELS.associer[1])},\n    [\n${b.associer.map(emitItemFill).join('\n')}\n    ],\n  ),`,
      )
    }
    if (b.ecrire.length) {
      chunks.push(
        `  lesson(\n    ${tsStr(subId)},\n    'ecrire',\n    ${tsStr(LABELS.ecrire[0])},\n    ${tsStr(LABELS.ecrire[1])},\n    [\n${b.ecrire.map(emitWrite).join('\n')}\n    ],\n  ),`,
      )
    }
    lessons.push(...chunks)
    stats.push({
      subId,
      fill: b.fill.length,
      qcm: b.qcm.length,
      negatif: b.negatif.length,
      ordre: b.ordre.length,
      associer: b.associer.length,
      ecrire: b.ecrire.length,
    })
  }

  const header = `/** Banques de phrases importées de la section grammaire soutien-scolaire. */
import { fill, lesson, qcm, writeItem } from './helpers'
import type { GramLesson } from '../types'

export const GRAM_LESSONS_SOUTIEN: GramLesson[] = [
${lessons.join('\n')}
]
`
  writeFileSync(OUT, header)
  const total = stats.reduce(
    (a, s) => a + s.fill + s.qcm + s.negatif + s.ordre + s.associer + s.ecrire,
    0,
  )
  console.log(JSON.stringify({ file: OUT, lessons: lessons.length, items: total, bySub: stats }, null, 2))
}

emit()
