import { readFileSync, writeFileSync } from 'node:fs'

function covers(model, consigne) {
  const m = (model || '').toLowerCase()
  const c = (consigne || '').toLowerCase()
  const missing = []
  if (/invit/.test(c) && !/invit|venez|viens|venir/.test(m)) missing.push('inviter')
  if (/refus/.test(c) && !/ne peux pas|pas possible|refus|désolé|desole/.test(m)) missing.push('refuser')
  if (/expli/.test(c) && !/parce que|car |en effet/.test(m)) missing.push('expliquer')
  if (/remerci/.test(c) && !/merci/.test(m)) missing.push('remercier')
  if (/confirm/.test(c) && !/confirm|d’accord|oui,/.test(m)) missing.push('confirmer')
  return missing
}

const out = []
for (const file of ['src/tcf/content/a0-a1/pe.json', 'src/tcf/content/a1-a2/pe.json', 'src/tcf/content/a2-b1/pe.json']) {
  const bank = JSON.parse(readFileSync(file, 'utf8'))
  for (const ex of bank) {
    if (!['sms_reponse', 'email_reponse', 'question_texte'].includes(ex.type_exercice)) continue
    const model = ex.support?.reponse_modele || ''
    const consigne = `${ex.consigne_supplementaire || ''} ${ex.support?.consigne || ''} ${ex.consigne || ''}`
    const missing = covers(model, consigne)
    if (!missing.length) continue
    out.push({
      file,
      id: ex.id,
      type: ex.type_exercice,
      missing,
      scene: ex.scene,
      sms: ex.support.sms_recu,
      email: ex.support.email_recu,
      consigne: ex.support.consigne,
      extra: ex.consigne_supplementaire,
      model,
      nb: ex.support.nb_mots,
    })
  }
}
writeFileSync('scripts/tmp-pe-gaps.json', JSON.stringify(out, null, 2))
console.log(out.length)
