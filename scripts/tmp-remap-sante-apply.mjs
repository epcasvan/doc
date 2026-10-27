import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'

const FFMPEG = 'C:/Users/Phuoc/AppData/Local/Temp/asr-check/node_modules/ffmpeg-static/ffmpeg.exe'
const CO = 'public/lib/audio/tcf/co'

function concat(outPublic, parts) {
  for (const p of parts) if (!existsSync(join(CO, p))) throw new Error('manque ' + p)
  const args = []
  for (const p of parts) args.push('-i', join(CO, p))
  const labels = parts.map((_, i) => `[${i}:a]aresample=44100,aformat=sample_fmts=fltp:channel_layouts=mono[a${i}]`).join(';')
  const chain = parts.map((_, i) => `[a${i}]`).join('')
  args.push('-filter_complex', `${labels};${chain}concat=n=${parts.length}:v=0:a=1[out]`, '-map', '[out]', '-y', 'public' + outPublic)
  const r = spawnSync(FFMPEG, args, { encoding: 'utf8' })
  if (r.status !== 0) throw new Error((r.stderr || '').slice(-400))
  console.log('concat', outPublic)
}

concat('/lib/audio/tcf/co/restaurant/07-restaurant-le-dejeuner.mp3', [
  'restaurant/04-restaurant-demander-table-pour-deux.mp3',
  'restaurant/03-restaurant-vous-buvez-quoi.mp3',
  'famille/18-famille-tu-bois-quoi.mp3',
  'restaurant/05-restaurant-je-suis-végétarien.mp3',
  'restaurant/06-restaurant-serveuse-prend-la-commande.mp3',
])
concat('/lib/audio/tcf/co/loisirs/15-loisirs-parcours-yoga-abonnement.mp3', [
  'loisirs/13-loisirs-le-parcous-de-santé.mp3',
  'loisirs/09-loisirs-information-cours-yoga.mp3',
  'loisirs/11-loisirs-abonnement-fitness.mp3',
])

function q(enonce, correct, b, c) {
  return {
    enonce,
    type_reponse: 'qcm_texte',
    points: 1,
    melanger: false,
    choix: [
      { id: 'a', texte: correct, correct: true },
      { id: 'b', texte: b },
      { id: 'c', texte: c },
    ],
    formes: { lignes: { nb_lignes: 1, reponse_modele: correct } },
  }
}

const patch = {
  'tcf-ss-a1-s51-co-1': {
    audio: '/lib/audio/tcf/co/actualite/08-actualité-le-pourboire-en-France.mp3',
    scenario: 'actualite',
    scene: 'Le pourboire en France',
  },
  'tcf-ss-a2-s52-co-1': {
    audio: '/lib/audio/tcf/co/actualite/09-actualité-titres-du-jour.mp3',
    scenario: 'actualite',
    scene: 'Les titres du jour',
  },
  'tcf-ss-a1-s50-co-3': {
    audio: '/lib/audio/tcf/co/magasins/21-magasin-pas-comprendre-taille-des-vêtements.mp3',
    scenario: 'magasins',
    scene: 'Les tailles des vêtements',
  },
  'tcf-ss-a1-s50-co-2': {
    audio: '/lib/audio/tcf/co/logement/02-logement-description-de-l-appartement-2.mp3',
    scenario: 'maison',
    scene: 'Le nouvel appartement',
  },
  'tcf-ssx-a1-042-co-4': {
    audio: '/lib/audio/tcf/co/logement/01-logement-description-de-l-appartement-1.mp3',
  },
  'tcf-a2j-s1-co-3': {
    audio: '/lib/audio/tcf/co/sante/03-santé-annulation-rendez-vous-dentiste.mp3',
  },
  'tcf-ss-a2-s52-co-4': {
    audio: '/lib/audio/tcf/co/sante/05-santé-prise-de-sang.mp3',
    scene: 'La prise de sang',
  },
  'tcf-ss-a2-s52-co-3': {
    audio: '/lib/audio/tcf/co/sante/06-santé-fumer-c-est-pas-bien.mp3',
    scene: 'Interdiction de fumer',
    transcription:
      "— Claire, ça te dérange si je fume ?\n— Non, mais ici ce n'est pas possible. Il faut que tu sortes.\n— Bon, d'accord.\n— Tu sais que c'est mauvais pour ta santé ? Fais attention.\n— D'accord, d'accord, j'ai compris.",
  },
  'tcf-ss-a2-s53-co-1': {
    audio: '/lib/audio/tcf/co/sante/02-santéconsultation-chez-le-docteur-Abri.mp3',
    scene: 'Chez le docteur Abrie',
    transcription:
      "— Comment allez-vous aujourd'hui, monsieur Abrie ?\n— Pas très bien. Je tousse toujours, je suis enrhumé et j'ai mal à la tête.\n— J'ai vos résultats d'analyse de sang et la radio des poumons. Vous avez une bronchite. Vous avez déjà un traitement contre la douleur et la fièvre. Prenez aussi cet antibiotique. Vous fumez toujours ?\n— Oui, un peu.\n— Il faut que vous fassiez attention. Pour guérir rapidement, arrêtez la cigarette.",
  },
  'tcf-ss-a2-s52-co-2': {
    audio: '/lib/audio/tcf/co/sante/04-santé-Mme-Deballe-ma-fille-va-mal.mp3',
    scene: 'Ma fille va mal',
    transcription:
      "— Cabinet du docteur Benoît, bonjour.\n— Bonjour, c'est madame Deballe. Ma fille de dix mois va mal.\n— Qu'est-ce qu'elle a ?\n— Depuis hier, elle ne mange plus, elle vomit et elle a 39 de fièvre. Ça me fait peur. Il faut que le docteur nous reçoive, c'est urgent.\n— Malheureusement, aujourd'hui, ce n'est pas possible : le docteur est absent. Vous devez aller aux urgences.\n— Il faut qu'on y aille aujourd'hui ?\n— Oui. Il ne faut pas prendre rendez-vous, mais n'oubliez pas votre carte d'assurance.\n— Je veux savoir pourquoi elle est malade. Il faut que le médecin demande des analyses.\n— Ne vous inquiétez pas. Ça va aller. On va soigner votre fille.",
    questions: [
      q('Qui appelle le cabinet ?', 'Madame Deballe', 'Le docteur Benoît', 'Une infirmière'),
      q('Quel âge a la fille ?', 'Dix mois', 'Dix ans', 'Trois jours'),
      q('Quel symptôme est cité ?', '39 de fièvre', 'Mal au dos', 'Une toux'),
      q("Où faut-il aller aujourd'hui ?", 'Aux urgences', 'À la pharmacie', 'Chez le dentiste'),
      q("Que faut-il apporter ?", "La carte d'assurance", 'Une ordonnance', 'Le carnet de vaccination'),
    ],
  },
  'tcf-ss-a1-s50-co-4': {
    audio: '/lib/audio/tcf/co/restaurant/07-restaurant-le-dejeuner.mp3',
    scenario: 'vie-quotidienne',
    scene: 'Le déjeuner au restaurant',
    transcription:
      "— C'est pour déjeuner ?\n— Oui. Vous avez une table pour deux ?\n— Qu'est-ce que vous buvez ?\n— Une carafe d'eau, s'il vous plaît.\n— Qu'est-ce que tu bois ?\n— Pas d'alcool pour moi aujourd'hui. Un jus d'orange, s'il te plaît.\n— Tu prends du poisson ou de la viande ?\n— Je ne mange pas de viande. Je suis végétarien.\n— Je peux prendre votre commande ?\n— Oui. Une salade, un steak-frites et une tarte.",
    questions: [
      q('Pour quel repas demande-t-on une table ?', 'Le déjeuner', 'Le petit-déjeuner', 'Le dîner'),
      q('Pour combien de personnes ?', 'Deux', 'Trois', 'Quatre'),
      q("Que commande-t-on d'abord à boire ?", "Une carafe d'eau", 'Un café', 'Un verre de vin'),
      q('Pourquoi la personne refuse-t-elle la viande ?', 'Elle est végétarienne', "Elle n'a pas faim", 'Le plat est trop cher'),
      q('Que contient la commande ?', 'Une salade, un steak-frites et une tarte', 'Une soupe et un dessert', 'Un sandwich et un café'),
    ],
  },
  'tcf-ss-a2-s53-co-2': {
    audio: '/lib/audio/tcf/co/loisirs/15-loisirs-parcours-yoga-abonnement.mp3',
    scenario: 'loisirs',
    scene: 'Le club de sport',
    transcription:
      "— Alors, le parcours de santé, c'était comment ?\n— C'était formidable !\n— Je voudrais me renseigner sur votre club. Vous avez des cours de yoga ?\n— Nous proposons des cours collectifs ou particuliers, avec un professeur.\n— Je pense prendre un abonnement mensuel. C'est possible ?\n— Bien sûr, mais un abonnement annuel est plus intéressant.",
    fixYoga: true,
  },
}

for (const level of ['a0-a1', 'a1-a2', 'a2-b1']) {
  const file = `src/tcf/content/${level}/co.json`
  const bank = JSON.parse(readFileSync(file, 'utf8'))
  let n = 0
  for (const ex of bank) {
    const p = patch[ex.id]
    if (!p) continue
    if (!existsSync('public' + p.audio)) throw new Error('cible ' + p.audio)
    ex.support.audio = p.audio
    if (p.scenario) ex.scenario = p.scenario
    if (p.scene) ex.scene = p.scene
    if (p.transcription) ex.support.transcription = p.transcription
    if (p.questions) ex.questions = p.questions
    if (p.fixYoga) {
      const q2 = ex.questions[1]
      q2.enonce = 'Que veut faire la personne au club ?'
      q2.choix[0].texte = 'Se renseigner sur les cours de yoga'
      q2.choix[0].correct = true
      q2.choix[1].texte = 'Arrêter le sport'
      delete q2.choix[1].correct
      q2.choix[2].texte = "S'inscrire à un match"
      delete q2.choix[2].correct
      q2.formes.lignes.reponse_modele = 'Se renseigner sur les cours de yoga'
    }
    n++
  }
  if (n) writeFileSync(file, JSON.stringify(bank, null, 2) + '\n')
  console.log(level, n)
}
