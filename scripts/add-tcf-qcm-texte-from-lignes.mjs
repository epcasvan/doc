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
    .replace(/[.,;:!?…]+$/g, '')
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

  // Prix / montants (€ n’est pas un « word char » : pas de \b après)
  for (const m of text.matchAll(/(?<![\d.,])\d+(?:[.,]\d+)?\s*€/gi)) push(m[0])
  for (const m of text.matchAll(/(?<![\d.,])\d+(?:[.,]\d+)?\s*euros?\b/gi)) push(m[0])
  // Heures
  for (const m of text.matchAll(/\b\d{1,2}\s*h(?:\s*\d{2})?\b/gi)) push(m[0])
  for (const m of text.matchAll(/\b(?:midi|minuit)(?:\s*et\s*(?:demi|quart))?\b/gi)) push(m[0])
  // Températures
  for (const m of text.matchAll(/(?<![\d])\d{1,2}\s*°(?:C)?/gi)) push(m[0])
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
  // Prénoms / noms propres (évite jours, mois, titres génériques)
  const skip = new Set([
    'Le','La','Les','Un','Une','Des','Au','Aux','Du','Pour','Avec','Dans','Sur','Tous',
    'Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche','Jeudis',
    'Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre',
    'Atelier','Musée','Entrée','Bienvenue','Attention','Nouveau','Madame','Monsieur',
  ])
  for (const m of text.matchAll(/\b[A-ZÀÂÄÉÈÊËÎÏÔÖÙÛÜÇ][a-zàâäéèêëîïôöùûüç]+(?:\s+[A-ZÀÂÄÉÈÊËÎÏÔÖÙÛÜÇ][a-zàâäéèêëîïôöùûüç]+)?\b/g)) {
    const w = m[0]
    if (skip.has(w) || skip.has(w.split(/\s+/)[0])) continue
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
  // Pour une date « le 30 mai », muter le jour (1er nombre), pas un éventuel année
  const isDate = /\b(?:janvier|février|fevrier|mars|avril|mai|juin|juillet|août|aout|septembre|octobre|novembre|décembre|decembre)\b/i.test(
    answer,
  )
  const target = isDate ? nums[0] : nums[nums.length - 1]
  const after = answer.slice(target.i + target.len)
  // Ne pas casser « 1er » → « 2er »
  const ordinal = /^(er|re|e|ème|eme)\b/i.test(after)
  for (const delta of [1, 2, -1, 3, 5, 10]) {
    const next = target.n + delta
    if (next <= 0) continue
    if (isDate && (next > 31 || next < 1)) continue
    let suffix = after
    let insert = String(next)
    if (ordinal) {
      if (next === 1) insert = '1'
      else {
        // 2 mai, 3 mai… : retirer le suffixe ordinal
        suffix = after.replace(/^(er|re|e|ème|eme)/i, '')
      }
    }
    const v = answer.slice(0, target.i) + insert + suffix
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

function kindOf(s) {
  const t = String(s)
  if (/\d/.test(t) && /€|euro/i.test(t)) return 'price'
  if (/\d\s*h|\bmidi\b|\bminuit\b/i.test(t)) return 'time'
  if (/\d\s*°/.test(t)) return 'temp'
  if (/salle\s+\d+/i.test(t)) return 'room'
  if (
    /\b(?:lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)s?\b/i.test(t) ||
    /\d{1,2}\s+(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)/i.test(
      t,
    )
  )
    return 'date'
  if (/^[A-ZÀÂÄÉÈÊËÎÏÔÖÙÛÜÇ]/.test(t) && t.split(/\s+/).length <= 3 && t.length >= 3) return 'name'
  return 'other'
}

function distractors(correct, support, enonce) {
  const preferred = []
  const other = []
  const add = (s, forcePreferred = false) => {
    const t = String(s ?? '').replace(/\s+/g, ' ').trim()
    if (!t || t.length < 3 || sameAnswer(t, correct)) return
    // Évite les bouts de phrase / mots outils
    if (/^(le|la|les|un|une|des|ce|cet|cette|ces|au|aux|du|de|et|ou|pour|avec|dans|sur)$/i.test(t))
      return
    const list = forcePreferred || kindOf(t) === kindOf(correct) ? preferred : other
    if (list.some((x) => sameAnswer(x, t)) || preferred.some((x) => sameAnswer(x, t))) return
    if (other.some((x) => sameAnswer(x, t))) return
    list.push(t)
  }

  const ck = kindOf(correct)
  const e = normalize(enonce)

  // 1) Même forme que la bonne réponse (mutations)
  for (const v of mutateNumber(correct)) add(v, true)
  for (const v of mutateDay(correct)) add(v, true)

  // 2) Noms : prénoms stables avant les bruits du support
  if (ck === 'name' || e.startsWith('qui ')) {
    add('Marie', true)
    add('Paul', true)
    add('Le directeur', true)
  }

  // 3) Extraits du support (même type prioritaire via kindOf)
  for (const c of extractCandidates(support)) add(c)

  // 4) Fallbacks contextuels
  if (ck === 'price' || e.includes('tarif') || e.includes('coute') || e.includes('prix')) {
    add('Gratuit', true)
    add('10 €', true)
    add('15 €', true)
    add('20 €', true)
    add('5 €', true)
  }
  if (ck === 'time' || e.includes('heure') || /\d\s*h/i.test(correct)) {
    add('À 10 h', true)
    add('À 14 h', true)
    add('À 18 h', true)
    add('À midi', true)
  }
  if (ck === 'room' || e.includes('où') || e.includes('salle')) {
    add('Salle 1', true)
    add('Salle 20', true)
    add('Au rez-de-chaussée', true)
  }
  if (ck === 'date' || e.includes('jour') || e.includes('date')) {
    add('Le lundi', true)
    add('Le samedi', true)
    add('Le 1er mai', true)
  }
  if (ck === 'temp') {
    add('18°', true)
    add('30°', true)
  }

  const pool = [...preferred, ...other]
  if (pool.length < 2) {
    add(`Pas ${correct.replace(/\.$/, '')}`, true)
    add('Aucune de ces réponses', true)
  }
  return [...preferred, ...other].slice(0, 2)
}

function buildChoix(correct, d1, d2) {
  return [
    { id: 'a', texte: correct, correct: true },
    { id: 'b', texte: d1 },
    { id: 'c', texte: d2 },
  ]
}

const forceRefresh = process.argv.includes('--refresh')

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
      // Phrase seule → ajouter ; Phrase primaire (--refresh) → régénérer les distracteurs
      const isPhrasePrimary = q.type_reponse === 'lignes'
      if (!hasL) continue
      if (isPhrasePrimary) {
        if (hasT && !forceRefresh) continue
      } else if (hasT) {
        continue
      }

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

      q.formes = { ...(q.formes ?? {}), qcm_texte: forme }
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

console.log(`Fichiers : ${files} · QCM texte ajoutés/rafraîchis : ${questions} · ignorées : ${skipped}`)
