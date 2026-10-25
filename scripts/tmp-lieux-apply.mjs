import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'

const FFMPEG = 'C:/Users/Phuoc/AppData/Local/Temp/asr-check/node_modules/ffmpeg-static/ffmpeg.exe'
const CO = 'public/lib/audio/tcf/co'

function concat(outPublic, parts) {
  for (const p of parts) if (!existsSync(join(CO, p))) throw new Error('manque ' + p)
  const args = []
  for (const p of parts) args.push('-i', join(CO, p))
  const labels = parts
    .map((_, i) => `[${i}:a]aresample=44100,aformat=sample_fmts=fltp:channel_layouts=mono[a${i}]`)
    .join(';')
  const chain = parts.map((_, i) => `[a${i}]`).join('')
  args.push(
    '-filter_complex',
    `${labels};${chain}concat=n=${parts.length}:v=0:a=1[out]`,
    '-map',
    '[out]',
    '-y',
    'public' + outPublic,
  )
  const r = spawnSync(FFMPEG, args, { encoding: 'utf8' })
  if (r.status !== 0) throw new Error((r.stderr || '').slice(-500))
  console.log('concat', outPublic)
}

concat('/lib/audio/tcf/co/bibliotheque/05-bibliothèque-quatre-dialogues.mp3', [
  'bibliotheque/03-bibliothèque-inscription.mp3',
  'bibliotheque/04-bibliothèque-règle-pour-emprunter.mp3',
  'bibliotheque/01-bibliothèque-chercher-méthode-apprendre-chinois.mp3',
  'bibliotheque/02-bibliothèque-fermeture-exceptionnelle.mp3',
])

concat('/lib/audio/tcf/co/travail/11-travail-trouver-un-emploi.mp3', [
  'travail/10-travail-tu-as-trouvé-un-job.mp3',
  'travail/05-travail-contrat-en-alternance.mp3',
  'travail/09-travail-stage-de-fin-d-étude.mp3',
  'travail/03-travail-chercher-emploi-maître-nageur.mp3',
  'travail/08-travail-recherche-de-stage.mp3',
  'travail/06-travail-job-d-été.mp3',
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
  'tcf-a1-s1-co-4': {
    audio: '/lib/audio/tcf/co/bibliotheque/05-bibliothèque-quatre-dialogues.mp3',
    scene: 'À la bibliothèque',
    transcription:
      "Bonjour, je voudrais m'inscrire, s'il vous plaît.\nVous avez une pièce d'identité ?\nOui, et j'ai aussi une carte d'étudiant.\nVous ne pouvez pas emprunter six DVD.\nAh bon ?\nC'est écrit sur le panneau ?\nNon, c'est six livres et 3 DVD.\nBonjour, je cherche une méthode pour apprendre le chinois.\nToutes nos méthodes sont classées au rayon 25 derrière vous.\nAh, merci.\nJe n'avais pas fait attention.\nC'est fermé ?\nMais ça fait longtemps ?\nNon, regardez le panneau.\nC'est une fermeture exceptionnelle.\nAh bon, merci.\nJe reviendrai demain.",
  },
  'tcf-ss-a1-s3-co-3': {
    audio: '/lib/audio/tcf/co/famille/21-famille-appeler-une-amie-Lorie.mp3',
    scenario: 'maison',
    scene: "L'appel à une amie",
  },
  'tcf-ss-a1-s3-co-4': {
    audio: '/lib/audio/tcf/co/transports/03-transport-comment-aller-chez-Magali.mp3',
    scenario: 'transports',
    scene: 'Le chemin en bus',
    questions: [
      q('Qui appelle ?', 'Magali', 'Michel', 'Le chauffeur de bus'),
      q('Où habite Magali ?', 'À côté du parc Mon Repos', 'À la gare', 'Au centre commercial'),
      q('Quel bus est plus rapide ?', 'Le bus 21', 'Le bus 12', 'Le métro'),
      q("Où est l'immeuble ?", "En face de l'arrêt", 'Derrière le parc', 'À côté de la mairie'),
    ],
  },
  'tcf-ss-a1-s4-co-1': {
    audio: '/lib/audio/tcf/co/actualite/10-actualité-achat-e-ticket.mp3',
    scenario: 'actualite',
    scene: "L'e-ticket",
    questions: [
      q('Que remplace l’e-ticket ?', "L'achat au distributeur", 'La carte bancaire', 'Le courrier postal'),
      q('Avec quoi peut-on payer ?', 'Un téléphone portable', 'Un chèque', 'Des espèces seulement'),
      q('Quel numéro faut-il ?', 'Un numéro français', 'Un numéro étranger', 'Aucun numéro'),
      q('Comment reçoit-on le ticket ?', 'On le télécharge', 'On le reçoit par la poste', 'On le retire au guichet'),
    ],
  },
  'tcf-ss-a1-s4-co-2': {
    audio: '/lib/audio/tcf/co/radio/11-radio-prévision-météo-2.mp3',
    scenario: 'radio',
    scene: 'La météo',
    transcription:
      "Aujourd'hui, dans le sud de la France, une vraie journée d'été, il fait chaud et beau.\nDans le nord, sortez vos parapluies, il va pleuvoir le matin, mais le soleil revient l'après-midi.\nIl va faire 20° au nord et 28° au sud, demain, du vent sur toute la France.",
  },
  'tcf-ss-a2-s5-co-1': {
    audio: '/lib/audio/tcf/co/administration/01-administration-renouveler-titre-de-séjour.mp3',
    scene: 'Le titre de séjour',
  },
  'tcf-ss-a2-s5-co-2': {
    audio: '/lib/audio/tcf/co/poste/01-poste-envoyer-lettre-recommandée.mp3',
    scene: 'La lettre recommandée',
    questions: [
      q('Que veut envoyer la personne ?', 'Une lettre recommandée', 'Un colis', 'Une carte postale'),
      q('Que reçoit-on chez soi ?', 'Un accusé de réception', 'Un remboursement', 'Un catalogue'),
      q('À quoi sert cet accusé ?', 'À prouver que la lettre est arrivée', 'À payer moins cher', 'À suivre un colis'),
      q('Combien coûte la lettre ?', '4,55 euros', '2 euros', '10 euros'),
    ],
  },
  'tcf-ss-a2-s5-co-3': {
    audio: '/lib/audio/tcf/co/fetes/24-fêtes-publicité-organiser-fête-parfaite.mp3',
    scenario: 'fetes',
    scene: 'Organiser une fête',
    transcription:
      "Vous voulez organiser une grande fête ?\nC'est simple, avec Fête parfaite.com.\nNotre site vous permettra de créer un joli blog avec des photos.\nVos amis et votre famille pourront retrouver beaucoup d'informations pratiques.\nL'adresse et l'heure de la fête, les possibilités de transport et d'hôtel.\nLa fête est un mariage ? Notre site vous donne des conseils pour trouver une robe de mariée, une alliance ou des fleurs.\nVous préférez la créer ailleurs ?\nNous vous aidons à réserver un traiteur ou un DJ.\nChoisissez Fête parfaite.com, 100 % gratuit, 100 % sécurisé.",
    questions: [
      q('Que propose le site ?', "D'organiser une fête", "D'acheter un billet de train", "D'apprendre une langue"),
      q('Que peut-on créer ?', 'Un blog avec des photos', 'Un compte en banque', 'Un CV'),
      q('Quelle information pratique est citée ?', "L'adresse et l'heure", 'Le menu du repas', 'La météo'),
      q('Pour quelle fête y a-t-il des conseils ?', 'Un mariage', 'Un examen', 'Un match'),
      q('Qui peut-on réserver ?', 'Un traiteur ou un DJ', 'Un médecin', 'Un professeur'),
      q('Combien coûte le site ?', 'Il est gratuit', '10 euros', '50 euros'),
    ],
  },
  'tcf-ss-a2-s5-co-4': {
    audio: '/lib/audio/tcf/co/travail/11-travail-trouver-un-emploi.mp3',
    scenario: 'travail',
    scene: 'Trouver un travail',
    transcription:
      "Tu as trouvé un job pour cet été ?\nNon, je n'ai rien trouvé.\nEt c'est le site Studirama.\nIl y a plein d'offres d'emplois.\nMarie a un contrat en alternance pour la rentrée.\nElle va travailler deux jours par semaine en entreprise.\nOù vas-tu faire ton stage de fin d'étude ?\nJe le fais dans une association.\nPaul cherche un emploi de maître-nageur pour cet été.\nIl peut aller au CIDJ en parler à un conseiller.\nAlors, comment se passe ta recherche de stage ?\nJ'ai un entretien la semaine prochaine avec mon futur maître de stage.\nSi tu veux trouver un job pour cet été, va directement dans les entreprises et fais des candidatures spontanées.",
    questions: [
      q('Que propose Studirama ?', "Des offres d'emploi", 'Des cours de cuisine', 'Des films'),
      q('Combien de jours Marie travaille-t-elle en entreprise ?', 'Deux jours par semaine', 'Tous les jours', 'Un jour par mois'),
      q("Où se fait le stage de fin d'étude ?", 'Dans une association', "À l'hôpital", 'Dans une banque'),
      q('Quel emploi Paul cherche-t-il ?', 'Maître-nageur', 'Cuisinier', 'Chauffeur'),
      q("Quand a lieu l'entretien de stage ?", 'La semaine prochaine', 'Demain matin', 'Dans un an'),
      q("Quel conseil est donné pour un job d'été ?", 'Aller dans les entreprises', 'Rester à la maison', 'Regarder la télévision'),
    ],
  },
  'tcf-ss-a2-s6-co-1': {
    audio: '/lib/audio/tcf/co/travail/07-travail-job-d-été-Max.mp3',
    scenario: 'travail',
    scene: "Le job d'été",
    transcription:
      "Max, tu as trouvé un travail pour cet été ?\nNon, je n'ai rien trouvé.\nEt toi, Ali ?\nJe suis allé au CIDJ, le centre d'information et de documentation jeunesse.\nIls m'ont aidé.\nJe vais être maître-nageur.",
    questions: [
      q('Max a-t-il trouvé un travail ?', 'Non', 'Oui, dans un magasin', 'Oui, à la mairie'),
      q('Pour quelle période ?', "Cet été", "L'hiver", 'Toute l’année'),
      q('Où Ali est-il allé ?', 'Au CIDJ', 'À la piscine', 'À la poste'),
      q('Que va faire Ali ?', 'Maître-nageur', 'Serveur', 'Vendeur'),
    ],
  },
  'tcf-ss-a2-s6-co-2': {
    audio: '/lib/audio/tcf/co/travail/04-travail-confirmation-cours-d-informatique.mp3',
    scenario: 'travail',
    scene: "La formation d'informatique",
  },
  'tcf-ssx-a2-annonce-2-6-co-2': {
    audio: '/lib/audio/tcf/co/cinema/01-cinéma-annonce-réduction-bonbon.mp3',
  },
  'tcf-ssx-a2-annonce-6-3-co-2': {
    audio: '/lib/audio/tcf/co/ville/01-ville-annonce-salon-du-tourisme.mp3',
  },
  'tcf-ssx-a2-annonce-5-4-co-2': {
    audio: '/lib/audio/tcf/co/piscine/01-piscine-annonce-rappel-du-règlement.mp3',
  },
  'tcf-ssx-a2-annonce-7-2-co-2': {
    audio: '/lib/audio/tcf/co/musee/01-musée-annonce-rappel-du-règlement.mp3',
  },
  'tcf-ss-b1-s2-co-1': {
    audio: '/lib/audio/tcf/co/actualite/11-actualité-règlement-protection-des-données.mp3',
    scenario: 'actualite',
    scene: 'La protection des données',
    questions: [
      q('De quel texte parle ce document ?', 'Du règlement sur la protection des données', "D'une prévision météo", "D'un titre de séjour"),
      q("Que permet le droit d'accès ?", 'Savoir quelles données sont détenues', 'Changer de numéro de train', 'Obtenir un remboursement'),
      q("Que peut-on demander avec le droit d'effacement ?", "L'effacement de ses données", 'Un nouveau mot de passe', 'Une carte de réduction'),
      q('Comment recevoir ses données (portabilité) ?', 'Dans un fichier électronique', 'Par SMS', 'Par un appel'),
      q('Comment arrêter les newsletters commerciales ?', 'En cliquant sur le lien de désinscription', 'En allant à la préfecture', 'En appelant la mairie'),
      q('Avec un compte client, comment faire ces opérations ?', 'En se connectant à son compte', 'En envoyant un fax', 'En venant au guichet'),
    ],
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
    n++
  }
  if (n) writeFileSync(file, JSON.stringify(bank, null, 2) + '\n')
  console.log(level, n)
}
