import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'node:fs'

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
  'tcf-a1-s1-co-4': [
    complet({
      id: 'tcf-a1-s1-co-4',
      niveau: 'A0-A1',
      theme: 'Test blanc A1 · série 1 · À la bibliothèque',
      scenario: 'lieux-publics',
      scene: "L'inscription",
      audio: '/lib/audio/tcf/co/bibliotheque/03-bibliothèque-inscription.mp3',
      transcription:
        "Bonjour, je voudrais m'inscrire, s'il vous plaît.\nVous avez une pièce d'identité ?\nOui, et j'ai aussi une carte d'étudiant.",
      question: q('Que veut faire la personne ?', "S'inscrire", 'Emprunter un DVD', 'Chercher un livre'),
    }),
    complet({
      id: 'tcf-a1-s1b-co-2',
      niveau: 'A0-A1',
      theme: 'Test blanc A1 · série 1 · À la bibliothèque',
      scenario: 'lieux-publics',
      scene: "L'emprunt",
      audio: '/lib/audio/tcf/co/bibliotheque/04-bibliothèque-règle-pour-emprunter.mp3',
      transcription:
        'Vous ne pouvez pas emprunter six DVD.\nAh bon ?\nC’est écrit sur le panneau ?\nNon, c’est six livres et 3 DVD.',
      question: q('Combien de DVD peut-on emprunter ?', '3', '6', '10'),
    }),
    complet({
      id: 'tcf-a1-s1b-co-3',
      niveau: 'A0-A1',
      theme: 'Test blanc A1 · série 1 · À la bibliothèque',
      scenario: 'lieux-publics',
      scene: 'La méthode de chinois',
      audio: '/lib/audio/tcf/co/bibliotheque/01-bibliothèque-chercher-méthode-apprendre-chinois.mp3',
      transcription:
        "Bonjour, je cherche une méthode pour apprendre le chinois.\nToutes nos méthodes sont classées au rayon 25 derrière vous.\nAh, merci.\nJe n'avais pas fait attention.",
      question: q('Que cherche la personne ?', 'Une méthode de chinois', 'Une carte d’étudiant', 'Un DVD'),
    }),
    complet({
      id: 'tcf-a1-s1b-co-1',
      niveau: 'A0-A1',
      theme: 'Test blanc A1 · série 1 · À la bibliothèque',
      scenario: 'lieux-publics',
      scene: 'La fermeture',
      audio: '/lib/audio/tcf/co/bibliotheque/02-bibliothèque-fermeture-exceptionnelle.mp3',
      transcription:
        "C'est fermé ?\nMais ça fait longtemps ?\nNon, regardez le panneau.\nC'est une fermeture exceptionnelle.\nAh bon, merci.\nJe reviendrai demain.",
      question: q('Pourquoi est-ce fermé ?', 'C’est une fermeture exceptionnelle', 'C’est dimanche', 'Il n’y a plus de livres'),
    }),
  ],
  'tcf-a2p-s4-co-4': [
    complet({
      id: 'tcf-a2p-s4-co-4',
      niveau: 'A1-A2',
      theme: 'Préparation A2 · série 4 · En vacances chez des amis',
      scenario: 'sante',
      scene: 'Le numéro du spécialiste',
      audio: '/lib/audio/tcf/co/sante/01-santé-demander-numéro-docteur.mp3',
      transcription:
        "Peux-tu me donner le numéro de ton spécialiste ?\nJe veux prendre rendez-vous pour mon dos.\n— Le docteur Lebrun ?\nOui, bien sûr !\nAttends, je le cherche.",
      question: q('Que demande la personne ?', 'Le numéro d’un spécialiste', 'L’adresse de la bibliothèque', 'Un site d’achat'),
    }),
    complet({
      id: 'tcf-a2p-s4b-co-2',
      niveau: 'A1-A2',
      theme: 'Préparation A2 · série 4 · En vacances chez des amis',
      scenario: 'maison',
      scene: 'Les livres',
      audio: '/lib/audio/tcf/co/famille/16-famille-où-sont-les-livres.mp3',
      transcription:
        "Je ne trouve pas les livres que j'ai pris à la bibliothèque…\n— Tu pourrais ranger ta chambre, ça t'aiderait à les retrouver !",
      question: q('Que conseille-t-on ?', 'De ranger la chambre', 'D’acheter de la viande', 'D’appeler le docteur'),
    }),
    complet({
      id: 'tcf-a2p-s4b-co-3',
      niveau: 'A1-A2',
      theme: 'Préparation A2 · série 4 · En vacances chez des amis',
      scenario: 'vie-quotidienne',
      scene: 'Le site d’achat',
      audio: '/lib/audio/tcf/co/famille/17-famille-pas-comprendre-site-internet.mp3',
      transcription:
        "Je ne comprends rien à ce site d'achat en ligne !\n— Est-ce que tu veux que je regarde avec toi ?\n— Oui, merci, c'est gentil !",
      question: q('Que propose la personne ?', 'De regarder le site ensemble', 'De ranger la chambre', 'D’aller chez le docteur'),
    }),
    complet({
      id: 'tcf-a2p-s4b-co-1',
      niveau: 'A1-A2',
      theme: 'Préparation A2 · série 4 · En vacances chez des amis',
      scenario: 'maison',
      scene: 'La viande oubliée',
      audio: '/lib/audio/tcf/co/famille/15-famille-oublier-acheter-de-la-viande.mp3',
      transcription:
        "Je suis vraiment désolé : j'ai oublié d'acheter de la viande en rentrant !\n— Ce n'est pas grave, on va manger autre chose.",
      question: q('Pourquoi la personne s’excuse-t-elle ?', 'Elle a oublié la viande', 'Elle a perdu les livres', 'Elle arrive en retard'),
    }),
  ],
  'tcf-ss-a2-s5-co-4': [
    complet({
      id: 'tcf-ss-a2-s5-co-4',
      niveau: 'A1-A2',
      theme: 'Soutien scolaire · Dialogue 166',
      scenario: 'travail',
      scene: 'Le site Studirama',
      audio: '/lib/audio/tcf/co/travail/10-travail-tu-as-trouvé-un-job.mp3',
      transcription:
        "Tu as trouvé un job pour cet été ?\nNon, je n'ai rien trouvé.\nEt c'est le site Studirama.\nIl y a plein d'offres d'emplois.",
      question: q('Que propose Studirama ?', 'Des offres d’emploi', 'Des cours de cuisine', 'Des films'),
    }),
    complet({
      id: 'tcf-ss-a2-s5b-co-1',
      niveau: 'A1-A2',
      theme: 'Soutien scolaire · Dialogue 166',
      scenario: 'travail',
      scene: 'Le contrat en alternance',
      audio: '/lib/audio/tcf/co/travail/05-travail-contrat-en-alternance.mp3',
      transcription:
        'Marie a un contrat en alternance pour la rentrée.\nElle va travailler deux jours par semaine en entreprise.',
      question: q('Combien de jours Marie travaille-t-elle en entreprise ?', 'Deux jours par semaine', 'Tous les jours', 'Un jour par mois'),
    }),
    complet({
      id: 'tcf-ss-a2-s5b-co-2',
      niveau: 'A1-A2',
      theme: 'Soutien scolaire · Dialogue 166',
      scenario: 'travail',
      scene: 'Le stage',
      audio: '/lib/audio/tcf/co/travail/09-travail-stage-de-fin-d-étude.mp3',
      transcription: "Où vas-tu faire ton stage de fin d'étude ?\nJe le fais dans une association.",
      question: q('Où se fait le stage ?', 'Dans une association', 'À l’hôpital', 'Dans une banque'),
    }),
    complet({
      id: 'tcf-ss-a2-s5b-co-3',
      niveau: 'A1-A2',
      theme: 'Soutien scolaire · Dialogue 166',
      scenario: 'travail',
      scene: 'Le maître-nageur',
      audio: '/lib/audio/tcf/co/travail/03-travail-chercher-emploi-maître-nageur.mp3',
      transcription:
        'Paul cherche un emploi de maître-nageur pour cet été.\nIl peut aller au CIDJ en parler à un conseiller.',
      question: q('Quel emploi Paul cherche-t-il ?', 'Maître-nageur', 'Cuisinier', 'Chauffeur'),
    }),
    complet({
      id: 'tcf-ss-a2-s5c-co-1',
      niveau: 'A1-A2',
      theme: 'Soutien scolaire · Dialogue 166',
      scenario: 'travail',
      scene: 'L’entretien de stage',
      audio: '/lib/audio/tcf/co/travail/08-travail-recherche-de-stage.mp3',
      transcription:
        'Alors, comment se passe ta recherche de stage ?\nJ’ai un entretien la semaine prochaine avec mon futur maître de stage.',
      question: q('Quand a lieu l’entretien ?', 'La semaine prochaine', 'Demain matin', 'Dans un an'),
    }),
    complet({
      id: 'tcf-ss-a2-s5c-co-2',
      niveau: 'A1-A2',
      theme: 'Soutien scolaire · Dialogue 166',
      scenario: 'travail',
      scene: 'Les candidatures',
      audio: '/lib/audio/tcf/co/travail/06-travail-job-d-été.mp3',
      transcription:
        'Si tu veux trouver un job pour cet été, va directement dans les entreprises et fais des candidatures spontanées.',
      question: q('Quel conseil est donné ?', 'Aller dans les entreprises', 'Rester à la maison', 'Regarder la télévision'),
    }),
  ],
}

for (const file of [
  'public/lib/audio/tcf/co/vacances/04-vacances-chez-des-amis.mp3',
  'public/lib/audio/tcf/co/bibliotheque/05-bibliothèque-quatre-dialogues.mp3',
  'public/lib/audio/tcf/co/travail/11-travail-trouver-un-emploi.mp3',
]) {
  if (existsSync(file)) unlinkSync(file)
}

for (const level of ['a0-a1', 'a1-a2', 'a2-b1']) {
  const path = `src/tcf/content/${level}/co.json`
  const bank = JSON.parse(readFileSync(path, 'utf8'))
  const next = []
  let n = 0
  for (const ex of bank) {
    const group = replacements[ex.id]
    if (!group) {
      next.push(ex)
      continue
    }
    next.push(...group)
    n += group.length
    delete replacements[ex.id]
  }
  if (n) writeFileSync(path, JSON.stringify(next, null, 2) + '\n')
  console.log(level, n)
}

const left = Object.keys(replacements)
if (left.length) throw new Error('introuvables ' + left.join(', '))
