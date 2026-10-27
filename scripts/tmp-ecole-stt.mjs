import { readFileSync, writeFileSync, existsSync } from 'node:fs'

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

function complet({ id, niveau, theme, scenario, scene, audio, transcription, question }) {
  if (!existsSync('public' + audio)) throw new Error('manque ' + audio)
  return {
    id,
    niveau,
    competence: 'CO',
    type_exercice: 'complet',
    theme,
    scenario,
    scene,
    consigne: 'Écoutez le document, puis répondez à la question.',
    support: { audio, transcription },
    questions: [question],
    consigne_supplementaire: null,
  }
}

const replacements = {
  'tcf-a1-tpb-co-4': [
    complet({
      id: 'tcf-a1-tpb-co-4',
      niveau: 'A0-A1',
      theme: 'Test blanc A1 tout public · série B · Petits dialogues',
      scenario: 'ecole',
      scene: 'La piscine',
      audio: '/lib/audio/tcf/co/ecole/45-école-chercher-où-est-la-piscine.mp3',
      transcription:
        "Excuse-moi, j'ai cours de sport.\nJe cherche la piscine de l'université.\nOù est-ce qu'elle est ?\nDerrière toi, regarde.\nOh, merci.",
      question: q('Que cherche la personne ?', 'La piscine', 'La bibliothèque', 'La cantine'),
    }),
    complet({
      id: 'tcf-a1-tpbb-co-1',
      niveau: 'A0-A1',
      theme: 'Test blanc A1 tout public · série B · Petits dialogues',
      scenario: 'ecole',
      scene: 'Le rendez-vous',
      audio: '/lib/audio/tcf/co/ecole/46-école-rendez-vous-professeur-de-français.mp3',
      transcription:
        "Bonjour, j'ai rendez-vous avec monsieur Richard, le professeur de français de ma fille.\nBonjour.\nOui, il est dans la classe au premier étage à gauche, salle 25.",
      question: q('Avec qui a-t-on rendez-vous ?', 'Le professeur de français', 'Le directeur', 'Le professeur de sport'),
    }),
    complet({
      id: 'tcf-a1-tpbb-co-2',
      niveau: 'A0-A1',
      theme: 'Test blanc A1 tout public · série B · Petits dialogues',
      scenario: 'ecole',
      scene: 'Le livre de mathématiques',
      audio: '/lib/audio/tcf/co/ecole/47-école-chercher-livre-de-mathématiques.mp3',
      transcription:
        "Qu'est-ce que tu fais, Sammy ?\nJe cherche mon livre de mathématiques.\nIl n'est pas dans ton sac ?\nNon, je ne le trouve pas.\nIl doit être chez moi.",
      question: q('Que cherche Sammy ?', 'Son livre de mathématiques', 'Ses clés', 'Son téléphone'),
    }),
    complet({
      id: 'tcf-a1-tpbb-co-3',
      niveau: 'A0-A1',
      theme: 'Test blanc A1 tout public · série B · Petits dialogues',
      scenario: 'ecole',
      scene: 'Au tableau',
      audio: '/lib/audio/tcf/co/ecole/48-école-venir-au-tableau.mp3',
      transcription:
        "Alors, qui veut venir avec moi au tableau pour faire l'exercice ?\nMoi, madame, s'il vous plaît.\nD'accord.\nAllez, viens !",
      question: q("Que demande l'enseignante ?", 'De venir au tableau', "D'ouvrir le livre", 'De ranger le sac'),
    }),
  ],
  'tcf-ss-a1-s5-co-1': [
    complet({
      id: 'tcf-ss-a1-s5-co-1',
      niveau: 'A0-A1',
      theme: 'Soutien scolaire · Conversation 8',
      scenario: 'magasins',
      scene: 'Les céréales',
      audio: '/lib/audio/tcf/co/magasins/19-magasin-où-sont-céréales.mp3',
      transcription: '— Où sont les céréales ?\n— Au fond du magasin, madame.\n— D’accord, merci.',
      question: q('Où sont les céréales ?', 'Au fond du magasin', 'À la caisse', 'Dehors'),
    }),
    complet({
      id: 'tcf-ss-a1-s5b-co-1',
      niveau: 'A0-A1',
      theme: 'Soutien scolaire · Conversation 8',
      scenario: 'maison',
      scene: 'Les clés',
      audio: '/lib/audio/tcf/co/famille/19-maison-où-sont-clés.mp3',
      transcription: '— Oh là là, où sont mes clés ?\n— Elles sont sur la table, comme d’habitude.',
      question: q('Où sont les clés ?', 'Sur la table', 'Dans le sac', 'À la porte'),
    }),
    complet({
      id: 'tcf-ss-a1-s5b-co-2',
      niveau: 'A0-A1',
      theme: 'Soutien scolaire · Conversation 8',
      scenario: 'loisirs',
      scene: 'Quel film voir',
      audio: '/lib/audio/tcf/co/cinema/02-cinéma-quel-film-voir.mp3',
      transcription:
        '— Tu veux voir quel film ?\n— Je ne sais pas. Pourquoi pas une comédie ?\n— Une comédie… Pourquoi pas un film d’horreur ?\n— Ah non, je vais mal dormir cette nuit !',
      question: q('Quel film la personne refuse-t-elle ?', 'Un film d’horreur', 'Une comédie', 'Un documentaire'),
    }),
    complet({
      id: 'tcf-ss-a1-s5b-co-3',
      niveau: 'A0-A1',
      theme: 'Soutien scolaire · Conversation 8',
      scenario: 'vie-quotidienne',
      scene: 'Au restaurant',
      audio: '/lib/audio/tcf/co/restaurant/02-restaurant-que-manger.mp3',
      transcription:
        '— Qu’est-ce que tu veux manger ?\n— Je vais prendre un menu du jour.\n— Moi, je n’ai pas très faim. Je vais prendre un plat du jour.',
      question: q('Que prend la première personne ?', 'Un menu du jour', 'Une salade', 'Un dessert'),
    }),
    complet({
      id: 'tcf-ss-a1-s5c-co-1',
      niveau: 'A0-A1',
      theme: 'Soutien scolaire · Conversation 8',
      scenario: 'maison',
      scene: 'Tu es prêt',
      audio: '/lib/audio/tcf/co/famille/20-maison-tu-es-prêt.mp3',
      transcription: '— Tu es prêt ?\n— Presque ! Je vais chercher mon casque.\n— Pas de problème, on a le temps.',
      question: q('Que va chercher la personne ?', 'Son casque', 'Ses clés', 'Son manteau'),
    }),
  ],
  'tcf-a2j-s1-co-4': [
    complet({
      id: 'tcf-a2j-s1-co-4',
      niveau: 'A1-A2',
      theme: 'Test blanc A2 Junior · série 1 · Conversations à l’école',
      scenario: 'ecole',
      scene: 'La professeure de mathématiques',
      audio: '/lib/audio/tcf/co/ecole/49-école-où-est-la-professeure-de-mathématiques.mp3',
      transcription:
        '— Salut ! Tu as vu la prof de maths ? Je dois lui donner un document.\n— Oui, elle est dans la salle des professeurs.\n— Ah, très bien, merci, j’y vais.',
      question: q('Que fait la personne ?', 'Elle cherche quelqu’un', 'Elle s’excuse', 'Elle propose une invitation'),
    }),
    complet({
      id: 'tcf-a2j-s1b-co-1',
      niveau: 'A1-A2',
      theme: 'Test blanc A2 Junior · série 1 · Conversations à l’école',
      scenario: 'ecole',
      scene: 'Le cours de tennis',
      audio: '/lib/audio/tcf/co/ecole/50-école-aller-ensemble-au-cours-de-tennis.mp3',
      transcription:
        '— Salut Pauline, tu vas au cours de tennis ce soir ?\n— Oui, à 18 h.\n— On y va ensemble ?\n— D’accord, avec plaisir.',
      question: q('Que propose-t-on ?', 'D’accompagner Pauline', 'De manquer le cours', 'De changer d’heure'),
    }),
    complet({
      id: 'tcf-a2j-s1b-co-2',
      niveau: 'A1-A2',
      theme: 'Test blanc A2 Junior · série 1 · Conversations à l’école',
      scenario: 'ecole',
      scene: 'La sortie au musée',
      audio: '/lib/audio/tcf/co/ecole/51-école-combien-coûte-la-sortie-au-musée.mp3',
      transcription:
        '— Bonjour, madame, je voudrais savoir combien coûte la sortie au musée mercredi.\n— C’est 2 euros pour les moins de 15 ans.\n— Et comment je fais pour m’inscrire ?\n— Tu dois demander à tes parents de remplir cette fiche.',
      question: q('Que demande l’élève ?', 'Des informations', 'Une excuse', 'Un dessert'),
    }),
    complet({
      id: 'tcf-a2j-s1b-co-3',
      niveau: 'A1-A2',
      theme: 'Test blanc A2 Junior · série 1 · Conversations à l’école',
      scenario: 'ecole',
      scene: 'À la cantine',
      audio: '/lib/audio/tcf/co/ecole/52-école-frites-à-la-cantine.mp3',
      transcription:
        '— Il y a des frites ce midi à la cantine. J’adore ça !\n— Moi aussi. Et de la glace en dessert.\n— Super, on va se régaler !',
      question: q('Que font les personnes ?', 'Elles expriment leurs goûts', 'Elles s’informent sur un itinéraire', 'Elles s’excusent'),
    }),
  ],
  'tcf-a2j-s2-co-4': [
    complet({
      id: 'tcf-a2j-s2-co-4',
      niveau: 'A1-A2',
      theme: 'Test blanc A2 Junior · série 2 · Conversations à l’école',
      scenario: 'loisirs',
      scene: 'L’album de Gims',
      audio: '/lib/audio/tcf/co/loisirs/16-loisirs-dernier-album-de-Gimz.mp3',
      transcription:
        '— Tu as écouté le dernier album de Gims ?\n— Non, pas encore. Il est comment ?\n— Il est vraiment très bien, tu devrais l’écouter.\n— D’accord, je vais suivre ton conseil. Merci.',
      question: q('Que fait la personne ?', 'Elle donne une opinion', 'Elle refuse une invitation', 'Elle s’informe sur un itinéraire'),
    }),
    complet({
      id: 'tcf-a2j-s2b-co-1',
      niveau: 'A1-A2',
      theme: 'Test blanc A2 Junior · série 2 · Conversations à l’école',
      scenario: 'ecole',
      scene: 'Le cours de natation',
      audio: '/lib/audio/tcf/co/ecole/54-école-absence-au-cours-de-natation.mp3',
      transcription:
        '— Tu n’es pas venu hier au cours de natation ?\n— Non, je devais étudier.\n— Ah bon ? Qu’est-ce que tu devais étudier ?\n— J’avais un contrôle de maths aujourd’hui et je dois absolument avoir une bonne note.',
      question: q('Que fait la personne ?', 'Elle donne des explications', 'Elle accepte une invitation', 'Elle propose de l’aide'),
    }),
    complet({
      id: 'tcf-a2j-s2b-co-2',
      niveau: 'A1-A2',
      theme: 'Test blanc A2 Junior · série 2 · Conversations à l’école',
      scenario: 'fetes',
      scene: 'La fête d’anniversaire',
      audio: '/lib/audio/tcf/co/fetes/25-invitation-fête-d-anniversaire.mp3',
      transcription:
        '— Le mois prochain, j’organise une fête chez moi.\n— Tu fêtes ton anniversaire ?\n— Oui, et tu es invité. C’est le 28 mars, à 20 h. Tu viendras ?\n— Bien sûr, je serai là.',
      question: q('Que fait la personne invitée ?', 'Elle accepte une invitation', 'Elle refuse une invitation', 'Elle s’informe sur un itinéraire'),
    }),
    complet({
      id: 'tcf-a2j-s2b-co-3',
      niveau: 'A1-A2',
      theme: 'Test blanc A2 Junior · série 2 · Conversations à l’école',
      scenario: 'vie-quotidienne',
      scene: 'Le téléphone',
      audio: '/lib/audio/tcf/co/ecole/53-école-problème-avec-son-téléphone.mp3',
      transcription:
        '— Mon téléphone portable a un problème : la sonnerie ne fonctionne plus.\n— Je connais quelqu’un qui peut le réparer.\n— Tu as son numéro de téléphone ?\n— Si tu veux, je t’accompagne. C’est tout près d’ici.',
      question: q('Que propose-t-on ?', 'De l’aide', 'Une invitation', 'Un itinéraire'),
    }),
  ],
  'tcf-ss-a2-s8-co-1': [
    complet({
      id: 'tcf-ss-a2-s8-co-1',
      niveau: 'A1-A2',
      theme: 'Soutien scolaire · Conversation 8',
      scenario: 'ecole',
      scene: 'Le livre de maths',
      audio: '/lib/audio/tcf/co/ecole/26-école-oublier-livre-mathématiques.mp3',
      transcription:
        '— Non, j’ai oublié mon livre de maths.\n— Je peux te prêter le mien, si tu veux.\n— Ah oui ! Merci, c’est très gentil.\n— Ne l’oublie pas la prochaine fois.',
      question: q('Que propose l’ami ?', 'De prêter son livre', 'De manger à la cantine', 'D’aller au basket'),
    }),
    complet({
      id: 'tcf-ss-a2-s8b-co-1',
      niveau: 'A1-A2',
      theme: 'Soutien scolaire · Conversation 8',
      scenario: 'ecole',
      scene: 'À la cantine',
      audio: '/lib/audio/tcf/co/ecole/27-école-proposer-manger-cantine.mp3',
      transcription:
        '— On mange ensemble aujourd’hui à la cantine ?\n— Non, je ne peux pas. Je mange chez moi ce midi.\n— Ah, dommage. Une prochaine fois, alors.\n— Désolé. À plus tard.',
      question: q('Pourquoi refuse-t-on ?', 'La personne mange chez elle', 'La cantine est fermée', 'Il n’y a plus de place'),
    }),
    complet({
      id: 'tcf-ss-a2-s8b-co-2',
      niveau: 'A1-A2',
      theme: 'Soutien scolaire · Conversation 8',
      scenario: 'ecole',
      scene: 'Les exercices',
      audio: '/lib/audio/tcf/co/ecole/28-école-demander-explication-devoir.mp3',
      transcription:
        '— Monsieur, excusez-moi. Pourquoi devons-nous faire ces exercices pour mercredi ?\n— Nous devons les faire sur le livre ou sur le cahier ?\n— Sur le cahier, bien sûr.',
      question: q('Où faut-il faire les exercices ?', 'Sur le cahier', 'Sur le livre', 'Sur l’ordinateur'),
    }),
    complet({
      id: 'tcf-ss-a2-s8b-co-3',
      niveau: 'A1-A2',
      theme: 'Soutien scolaire · Conversation 8',
      scenario: 'ecole',
      scene: 'Le tournoi de basket',
      audio: '/lib/audio/tcf/co/ecole/29-école-tournoi-basketball.mp3',
      transcription:
        '— Qui est-ce qui t’accompagne mercredi au tournoi de basket ?\n— C’est mon père qui m’accompagne.\n— Tu crois que je pourrais venir avec vous ?\n— Oui, il y a de la place dans la voiture.',
      question: q('Qui accompagne au tournoi ?', 'Le père', 'La mère', 'Le professeur'),
    }),
  ],
}

const patch = {
  'tcf-ss-b1-s2-co-3': {
    audio: '/lib/audio/tcf/co/restaurant/08-restaurant-problème-avec-l-addition.mp3',
    scenario: 'vie-quotidienne',
    scene: 'Le problème avec l’addition',
  },
}

for (const level of ['a0-a1', 'a1-a2', 'a2-b1']) {
  const file = `src/tcf/content/${level}/co.json`
  const bank = JSON.parse(readFileSync(file, 'utf8'))
  const next = []
  let n = 0
  for (const ex of bank) {
    const group = replacements[ex.id]
    if (group) {
      next.push(...group)
      n += group.length
      delete replacements[ex.id]
      continue
    }
    const p = patch[ex.id]
    if (p) {
      if (!existsSync('public' + p.audio)) throw new Error('cible ' + p.audio)
      ex.support.audio = p.audio
      if (p.scenario) ex.scenario = p.scenario
      if (p.scene) ex.scene = p.scene
      n++
    }
    next.push(ex)
  }
  if (n) writeFileSync(file, JSON.stringify(next, null, 2) + '\n')
  console.log(level, n)
}

const left = Object.keys(replacements)
if (left.length) throw new Error('introuvables ' + left.join(', '))
