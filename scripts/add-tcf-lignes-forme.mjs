/**
 * Ajoute la forme « Phrase » (lignes) à toutes les questions CE / CO qui n’en ont pas.
 * CE : 2 lignes ; CO : 1 ligne. reponse_modele dérivée du QCM texte correct si possible.
 *
 *   node scripts/add-tcf-lignes-forme.mjs
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

function correctTexte(q) {
  if (q.type_reponse === 'qcm_texte') {
    return (q.choix ?? []).find((c) => c.correct)?.texte?.trim() ?? ''
  }
  const fromFormes = (q.formes?.qcm_texte?.choix ?? []).find((c) => c.correct)?.texte?.trim()
  if (fromFormes) return fromFormes
  if (q.type_reponse === 'lignes') return (q.reponse_modele ?? '').trim()
  return (q.formes?.lignes?.reponse_modele ?? '').trim()
}

function ensureLignes(q, kind) {
  const wantLines = kind === 'ce' ? 2 : 1
  let changed = false

  if (q.type_reponse === 'lignes') {
    const n = q.nb_lignes ?? 2
    if (kind === 'ce' && n === 1) {
      q.nb_lignes = 2
      changed = true
    }
    return changed
  }

  const formes = { ...(q.formes ?? {}) }
  if (formes.lignes) {
    if (kind === 'ce' && (formes.lignes.nb_lignes ?? 2) === 1) {
      formes.lignes = { ...formes.lignes, nb_lignes: 2 }
      q.formes = formes
      changed = true
    }
    return changed
  }

  const modele = correctTexte(q)
  formes.lignes = {
    nb_lignes: wantLines,
    ...(modele ? { reponse_modele: modele } : { reponse_modele: '…' }),
  }
  q.formes = formes
  return true
}

let filesTouched = 0
let questionsTouched = 0

for (const file of walk(ROOT)) {
  const kind = file.endsWith('/ce.json') ? 'ce' : 'co'
  const data = JSON.parse(readFileSync(file, 'utf8'))
  if (!Array.isArray(data)) continue
  let fileChanged = false
  for (const ex of data) {
    for (const q of ex.questions ?? []) {
      if (ensureLignes(q, kind)) {
        questionsTouched++
        fileChanged = true
      }
    }
  }
  if (fileChanged) {
    writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`)
    filesTouched++
    console.log(`ok ${file}`)
  }
}

console.log(`Fichiers : ${filesTouched} · questions : ${questionsTouched}`)
