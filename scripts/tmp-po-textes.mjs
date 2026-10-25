import { readFileSync, writeFileSync } from 'node:fs'

function mid(theme) {
  const t = theme.trim()
  if (!t) return 'ce thème'
  return t.charAt(0).toLowerCase() + t.slice(1)
}

function de(t) {
  if (t.startsWith('les ')) return `des ${t.slice(4)}`
  if (t.startsWith('le ')) return `du ${t.slice(3)}`
  if (t.startsWith('la ')) return `de la ${t.slice(3)}`
  if (t.startsWith('l’') || t.startsWith("l'")) return `de ${t}`
  return `de ${t}`
}

function a(t) {
  if (t.startsWith('les ')) return `aux ${t.slice(4)}`
  if (t.startsWith('le ')) return `au ${t.slice(3)}`
  if (t.startsWith('la ')) return `à la ${t.slice(3)}`
  if (t.startsWith('l’') || t.startsWith("l'")) return `à ${t}`
  return `à ${t}`
}

function questionsFor(theme) {
  const t = mid(theme)
  return [
    `Est-ce que vous aimez ${t} ?`,
    `Aimez-vous ${t} ?`,
    `Qui aime ${t} avec vous ?`,
    `Quand est-ce que vous parlez ${de(t)} ?`,
    `Où allez-vous pour ${t} ?`,
    `Comment est-ce que vous organisez ${t} ?`,
    `Combien de temps consacrez-vous ${a(t)} ?`,
    `Quel moment préférez-vous pour ${t} ?`,
  ]
}

const entretiens = {
  'tcf-a0a1-po-entretien': [
    { question: 'Bonjour ! Comment vous appelez-vous ?', reponse: 'Bonjour. Je m’appelle Nora Benali.' },
    { question: 'Quel est votre nom de famille ? Comment ça s’écrit ?', reponse: 'Benali. B, E, N, A, L, I.' },
    { question: 'Quel âge avez-vous ?', reponse: 'J’ai trente-quatre ans.' },
    { question: 'Quelle est votre nationalité ?', reponse: 'Je suis marocaine.' },
    { question: 'Vous venez de quel pays ?', reponse: 'Je viens du Maroc, de la ville de Fès.' },
    { question: 'Où habitez-vous ?', reponse: 'J’habite à Renens, dans un petit appartement au troisième étage.' },
    { question: 'Vous habitez avec qui ?', reponse: 'J’habite avec mon mari et ma fille.' },
    { question: 'Vous avez des enfants ? des frères et sœurs ?', reponse: 'J’ai une fille de huit ans. J’ai aussi un frère, il vit encore au Maroc.' },
    { question: 'Quelles langues parlez-vous ?', reponse: 'Je parle l’arabe et le français. Je comprends un peu l’anglais.' },
    { question: 'Quel est votre numéro de téléphone ?', reponse: 'Je peux vous l’écrire. C’est plus simple que de l’épeler.' },
    { question: 'Qu’est-ce que vous faites dans la vie ?', reponse: 'Je suis aide-soignante. Je travaille dans une maison de retraite, du lundi au vendredi.' },
    { question: 'Comment venez-vous au cours ?', reponse: 'Je prends le bus, puis je marche dix minutes. Le trajet dure environ une demi-heure.' },
    { question: 'Qu’est-ce que vous aimez faire le week-end ?', reponse: 'Le samedi, je vais au marché. Le dimanche, je me promène au bord du lac avec ma fille.' },
    { question: 'Quel est votre plat préféré ?', reponse: 'J’aime beaucoup le tajine de légumes, avec du pain.' },
    { question: 'Pourquoi apprenez-vous le français ?', reponse: 'Pour parler avec les parents de l’école et pour mieux comprendre mon travail.' },
    { question: 'Qu’est-ce que vous faites après le cours ?', reponse: 'Je rentre à la maison, je prépare le dîner, puis j’aide ma fille pour ses devoirs.' },
  ],
  'tcf-a1a2-po-entretien': [
    { question: 'Bonjour ! Comment vous appelez-vous ? Quel est votre nom de famille ?', reponse: 'Bonjour. Je m’appelle Malik Ferrier. Ferrier, F, E, deux R, I, E, R.' },
    { question: 'Quelle est votre nationalité ? Parlez-moi de votre pays.', reponse: 'Je suis tunisien. Mon pays est au bord de la mer. Il fait chaud, et on mange beaucoup de poisson.' },
    { question: 'Depuis quand habitez-vous en Suisse ?', reponse: 'J’habite en Suisse depuis trois ans. Je suis arrivé au mois de mars.' },
    { question: 'Où habitez-vous ? Décrivez votre logement.', reponse: 'J’habite à Yverdon, dans un deux-pièces. Il y a une petite cuisine et un balcon.' },
    { question: 'Avec qui vivez-vous ? Parlez-moi de votre famille.', reponse: 'Je vis avec ma femme. Nos parents habitent encore en Tunisie. On les appelle le dimanche.' },
    { question: 'Quelles langues parlez-vous ? Pourquoi apprenez-vous le français ?', reponse: 'Je parle l’arabe et le français. J’apprends le français pour le travail et pour les rendez-vous à l’école de ma nièce.' },
    { question: 'Qu’est-ce que vous faites dans la vie ? Quel métier avez-vous fait avant ?', reponse: 'Je suis magasinier dans un dépôt. Avant, en Tunisie, j’étais vendeur dans une quincaillerie.' },
    { question: 'Comment se passe une journée normale pour vous ?', reponse: 'Je me lève à six heures. Je travaille jusqu’à seize heures. Le soir, je prépare le repas et je lis un peu.' },
    { question: 'Qu’avez-vous fait le week-end dernier ?', reponse: 'Samedi, j’ai fait les courses. Dimanche, nous sommes allés voir un match de football avec des amis.' },
    { question: 'Quels sont vos loisirs ?', reponse: 'J’aime marcher, écouter de la musique et cuisiner le couscous le vendredi.' },
    { question: 'Comment vous déplacez-vous en ville ?', reponse: 'Je prends le train pour le travail et le vélo pour les petites courses.' },
    { question: 'Qu’est-ce que vous aimez en Suisse ?', reponse: 'J’aime les lacs et le calme. Au début, l’hiver était difficile, mais je m’habitue.' },
    { question: 'Quels sont vos projets pour l’année prochaine ?', reponse: 'Je voudrais passer un diplôme et trouver un poste plus stable. Je veux aussi inviter ma mère.' },
    { question: 'Qu’est-ce que vous faites quand vous avez un jour de congé ?', reponse: 'Je range l’appartement, puis je vais au café lire le journal. Parfois je visite une autre ville en train.' },
  ],
}

for (const file of ['src/tcf/content/a0-a1/po.json', 'src/tcf/content/a1-a2/po.json']) {
  const bank = JSON.parse(readFileSync(file, 'utf8'))
  let themes = 0
  for (const ex of bank) {
    if (ex.type_exercice === 'trois_themes') {
      for (const theme of ex.support.themes) {
        theme.exemples_questions = questionsFor(theme.theme)
        themes += 1
      }
    }
    if (ex.type_exercice === 'mots_theme') {
      ex.support.exemples_questions = questionsFor(ex.support.theme || ex.theme || 'ce sujet')
      themes += 1
    }
    if (ex.type_exercice === 'entretien' && entretiens[ex.id]) {
      ex.support.echanges = entretiens[ex.id]
      ex.support.questions = entretiens[ex.id].map((e) => e.question)
    }
  }
  writeFileSync(file, JSON.stringify(bank, null, 2) + '\n')
  console.log(file, 'themes', themes)
}

const acts = [
  ['invit', 'Je vous invite'],
  ['refus', 'Je ne peux pas'],
  ['expli', 'parce que'],
  ['remerci', 'merci'],
  ['confirm', 'je confirme'],
  ['propos', 'je vous propose'],
  ['demand', 'je vous demande'],
  ['inform', 'je vous informe'],
  ['excus', 'excusez-moi'],
  ['propos', 'je propose'],
]

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

let empty = 0
let short = 0
let gaps = 0
for (const file of ['src/tcf/content/a0-a1/pe.json', 'src/tcf/content/a1-a2/pe.json', 'src/tcf/content/a2-b1/pe.json']) {
  let bank
  try {
    bank = JSON.parse(readFileSync(file, 'utf8'))
  } catch {
    console.log('skip', file)
    continue
  }
  for (const ex of bank) {
    if (!['sms_reponse', 'email_reponse', 'question_texte'].includes(ex.type_exercice)) continue
    const model = ex.support?.reponse_modele || ''
    const consigne = `${ex.consigne_supplementaire || ''} ${ex.support?.consigne || ''}`
    if (!model.trim()) {
      empty += 1
      console.log('EMPTY', ex.id, consigne.slice(0, 140))
    } else if (model.trim().length < 40) {
      short += 1
      console.log('SHORT', ex.id, model)
    }
    const missing = covers(model, consigne)
    if (missing.length) {
      gaps += 1
      console.log('GAP', ex.id, missing.join(','), '|', consigne.slice(0, 120))
    }
  }
}
console.log({ empty, short, gaps, acts: acts.length })
