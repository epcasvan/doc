/**
 * Pour les questions CE/CO qui n’ont que la forme Phrase (lignes) :
 * ajoute formes.qcm_texte avec la bonne réponse (= reponse_modele) + 2 distracteurs
 * du même contexte (extraits du support ou variations plausibles).
 *
 *   node scripts/add-tcf-qcm-texte-from-lignes.mjs
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

const ROOT = 'src/content/tcf'

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (name === 'ce.json' || name === 'co.json') out.push(p)
  }
  return out
}

function supportText(ex) {
  const s = ex.support
  if (!s) return ''
  if (typeof s === 'string') return s
  return [
    s.titre,
    s.texte,
    s.expediteur,
    s.de,
    s.a,
    s.objet,
    s.transcription,
    ...(Array.isArray(s.messages) ? s.messages.map((m) => `${m.de ?? ''} ${m.texte ?? ''}`) : []),
  ]
    .filter(Boolean)
    .join('\n')
}

function normalize(s) {
  return String(s ?? '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[«»"']/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function sameAnswer(a, b) {
  return normalize(a) === normalize(b)
}

function modeleOf(q) {
  if (q.type_reponse === 'lignes') {
    if (q.reponse_modele?.trim() && q.reponse_modele.trim() !== '…') return q.reponse_modele.trim()
    if (q.tableau?.length) {
      return q.tableau
        .map((r) => r.reponse?.trim())
        .filter(Boolean)
        .join(' · ')
    }
    return ''
  }
  const L = q.formes?.lignes
  if (L?.reponse_modele?.trim() && L.reponse_modele.trim() !== '…') return L.reponse_modele.trim()
  if (L?.tableau?.length) {
    return L.tableau
      .map((r) => r.reponse?.trim())
      .filter(Boolean)
      .join(' · ')
  }
  return ''
}

/** Candidats « réponse-like » dans le support. */
function extractCandidates(text) {
  const out = []
  const push = (s) => {
    const t = s.replace(/\s+/g, ' ').trim()
    if (t.length < 2 || t.length > 60) return
    if (!out.some((x) => sameAnswer(x, t))) out.push(t)
  }

  // Prix / montants
  for (const m of text.matchAll(/\b\d+(?:[.,]\d+)?\s*€\b/gi)) push(m[0])
  for (const m of text.matchAll(/\b\d+(?:[.,]\d+)?\s*euros?\b/gi)) push(m[0])
  // Heures
  for (const m of text.matchAll(/\b\d{1,2}\s*h(?:\s*\d{2})?\b/gi)) push(m[0])
  for (const m of text.matchAll(/\b(?:midi|minuit)(?:\s*et\s*(?:demi|quart))?\b/gi)) push(m[0])
  // Températures
  for (const m of text.matchAll(/\b\d{1,2}\s*°(?:C)?\b/gi)) push(m[0])
  // Salles / numéros
  for (const m of text.matchAll(/\b[Ss]alle\s+\d+\b/g)) push(m[0])
  for (const m of text.matchAll(/\b(?:page|n°|numero|numéro)\s*\d+\b/gi)) push(m[0])
  // Dates
  for (const m of text.matchAll(
    /\b(?:le\s+)?\d{1,2}\s+(?:janvier|février|fevrier|mars|avril|mai|juin|juillet|août|aout|septembre|octobre|novembre|décembre|decembre)\b/gi,
  ))
    push(m[0])
  for (const m of text.matchAll(/\b\d{1,2}\/\d{1,2}(?:\/\d{2,4})?\b/g)) push(m[0])
  // Jours
  for (const m of text.matchAll(
    /\b(?:lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)s?\b/gi,
  ))
    push(m[0].replace(/^./, (c) => c.toUpperCase()))
  // Prénoms / noms propres simples (Majuscule…)
  for (const m of text.matchAll(/\b[A-ZÀÂÄÉÈÊËÎÏÔÖÙÛÜÇ][a-zàâäéèêëîïôöùûüç]+(?:\s+[A-ZÀÂÄÉÈÊËÎÏÔÖÙÛÜÇ][a-zàâäéèêëîïôöùûüç]+)?\b/g)) {
    const w = m[0]
    if (['Le', 'La', 'Les', 'Un', 'Une', 'Des', 'Au', 'Aux', 'Du', 'Pour', 'Avec', 'Dans', 'Sur'].includes(w))
      continue
    push(w)
  }
  return out
}

function mutateNumber(answer) {
  const variants = []
  const re = /(\d+)/g
  let m
  const nums = []
  while ((m = re.exec(answer))) nums.push({ i: m.index, len: m[0].length, n: Number(m[0]) })
  if (nums.length === 0) return variants
  const target = nums[nums.length - 1]
  for (const delta of [1, 2, -1, 3, 5, 10]) {
    const next = target.n + delta
    if (next <= 0) continue
    const s = String(next).padStart(String(target.n).length > 1 && String(target.n).startsWith('0') ? 2 : 0, '0')
    const v = answer.slice(0, target.i) + next + answer.slice(target.i + target.len)
    if (!sameAnswer(v, answer)) variants.push(v)
  }
  return variants
}

const DAY_CYCLE = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']

function mutateDay(answer) {
  const n = normalize(answer)
  const idx = DAY_CYCLE.findIndex((d) => n.includes(d))
  if (idx < 0) return []
  const out = []
  for (const j of [1, 2, 3]) {
    const d = DAY_CYCLE[(idx + j) % 7]
    out.push(answer.replace(new RegExp(DAY_CYCLE[idx], 'i'), d.charAt(0).toUpperCase() + d.slice(1)))
  }
  return out
}

function distractors(correct, support, enonce) {
  const pool = []
  const add = (s) => {
    const t = String(s ?? '').replace(/\s+/g, ' ').trim()
    if (!t || sameAnswer(t, correct)) return
    if (pool.some((x) => sameAnswer(x, t))) return
    pool.push(t)
  }

  for (const c of extractCandidates(support)) add(c)
  for (const v of mutateNumber(correct)) add(v)
  for (const v of mutateDay(correct)) add(v)

  // Fallbacks contextuels selon l’énoncé
  const e = normalize(enonce)
  if (e.includes('tarif') || e.includes('coute') || e.includes('prix') || correct.includes('€')) {
    add('Gratuit')
    add('10 €')
    add('15 €')
  }
  if (e.includes('heure') || e.includes('quand') || /\d\s*h/i.test(correct)) {
    add('À 10 h')
    add('À 14 h')
    add('À 18 h')
  }
  if (e.includes('ou ') || e.includes('où') || e.includes('salle')) {
    add('Salle 1')
    add('Au rez-de-chaussée')
    add('À l’accueil')
  }
  if (e.includes('qui ')) {
    add('Marie')
    add('Paul')
    add('Le directeur')
  }
  if (e.includes('jour') || e.includes('date')) {
    add('Le lundi')
    add('Le samedi')
    add('Le 1er mai')
  }

  // Dernier recours : reformulations génériques proches
  if (pool.length < 2) {
    add(`Pas ${correct.replace(/\.$/, '')}`)
    add('Aucune de ces réponses')
  }
  if (pool.length < 2) {
    add('Je ne sais pas')
    add('Autre chose')
  }

  return pool.slice(0, 2)
}

function buildChoix(correct, d1, d2) {
  return [
    { id: 'a', texte: correct, correct: true },
    { id: 'b', texte: d1 },
    { id: 'c', texte: d2 },
  ]
}

let files = 0
let questions = 0
let skipped = 0

for (const file of walk(ROOT)) {
  const data = JSON.parse(readFileSync(file, 'utf8'))
  if (!Array.isArray(data)) continue
  let changed = false
  for (const ex of data) {
    const support = supportText(ex)
    for (const q of ex.questions ?? []) {
      const hasT = q.type_reponse === 'qcm_texte' || Boolean(q.formes?.qcm_texte)
      const hasL = q.type_reponse === 'lignes' || Boolean(q.formes?.lignes)
      if (!hasL || hasT) continue

      let correct = modeleOf(q)
      if (!correct || correct === '…' || correct === '...') {
        // Tableau sans modèle unique : prendre la 1re réponse du tableau si présente
        const tab = q.type_reponse === 'lignes' ? q.tableau : q.formes?.lignes?.tableau
        correct = tab?.find((r) => r.reponse?.trim())?.reponse?.trim() ?? ''
      }
      if (!correct) {
        skipped++
        continue
      }

      const [d1, d2] = distractors(correct, support, q.enonce ?? '')
      const forme = { melanger: true, choix: buildChoix(correct, d1, d2) }

      if (q.type_reponse === 'lignes') {
        q.formes = { ...(q.formes ?? {}), qcm_texte: forme }
      } else {
        q.formes = { ...(q.formes ?? {}), qcm_texte: forme }
      }
      questions++
      changed = true
    }
  }
  if (changed) {
    writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`)
    files++
    console.log(`ok ${file}`)
  }
}

console.log(`Fichiers : ${files} · QCM texte ajoutés : ${questions} · ignorées : ${skipped}`)
