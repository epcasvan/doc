/** Exercices CSC leçon 03 Évaluation-1 à 4 — sans la théorie. */
import { fill, lesson, qcm } from './helpers'
import type { GramLesson } from '../types'

const A5011 = '/lib/audio/grammaire/evaluation/lecon-03-05-01-audio-1.mp3'
const A5012 = '/lib/audio/grammaire/evaluation/lecon-03-05-01-audio-2.mp3'
const A5021 = '/lib/audio/grammaire/evaluation/lecon-03-05-02-audio-1.mp3'
const A5031 = '/lib/audio/grammaire/evaluation/lecon-03-05-03-audio-1.mp3'
const A5032 = '/lib/audio/grammaire/evaluation/lecon-03-05-03-audio-2.mp3'
const A5041 = '/lib/audio/grammaire/evaluation/lecon-03-05-04-audio-1.mp3'
const A5042 = '/lib/audio/grammaire/evaluation/lecon-03-05-04-audio-2.mp3'

export const GRAM_LESSONS_WORD_EVAL03: GramLesson[] = [
  lesson(
    'e2',
    'qcm-verbe',
    'Dire le moment',
    'Écoutez s’il y a un enregistrement, lisez, puis choisissez la bonne réponse.',
    [
      qcm('Il travaille jusqu’à 20 heures. (agenda samedi)', 'Vrai', ['Vrai', 'Faux']),
      qcm('Le week-end, il fait la vaisselle. (agenda samedi)', 'Vrai', ['Vrai', 'Faux']),
      qcm('Il fait du tennis le samedi matin.', 'Faux', ['Vrai', 'Faux']),
      qcm('Il commence la danse à midi.', 'Vrai', ['Vrai', 'Faux']),
      qcm('Le soir, il va au cinéma. (agenda samedi)', 'Vrai', ['Vrai', 'Faux']),
      qcm('À quelle heure le café est ouvert le dimanche ?', 'De 9 h 30 à 12 h 00', [
        'De 8 h 30 à 14 h 30',
        'De 16 h 00 à 19 h 00',
        'De 9 h 30 à 12 h 00',
      ]),
      qcm('À quelle heure le café ferme le mardi ?', 'À 19 h 00', [
        'À 8 h 30',
        'À 12 h 00',
        'À 19 h 00',
      ]),
      qcm('Elles viennent à six heures. → ___', '18 h 00', ['18 h 00', '19 h 00', '16 h 00']),
      qcm('Je suis libre à midi. → ___', '12 h 00', ['12 h 00', '00 h 00', '10 h 00']),
      qcm('Je me couche à minuit. → ___', '00 h 00', ['00 h 00', '22 h 00', '02 h 00']),
      qcm('Le soir, Gaby …', 'mange à la maison avec sa famille', [
        'mange à la maison avec sa famille',
        'sort avec sa famille',
        'va au café avec ses amis',
      ], { audioSrc: A5021 }),
      qcm('Gaby se couche à …', '11 heures', ['11 heures', '7 heures', '9 heures'], {
        audioSrc: A5021,
      }),
      qcm('Le samedi, Gaby se lève toujours à …', '9 heures', [
        '9 heures',
        '7 heures',
        '11 heures',
      ], { audioSrc: A5021 }),
    ],
  ),
  lesson(
    'e2',
    'fill-conj',
    'Compléter l’heure ou la date',
    'Écoutez s’il y a un enregistrement, puis écrivez le jour, l’heure ou le mot.',
    [
      fill('Quel mois est avant mai ?', 'avril'),
      fill('Quel mois est entre juillet et septembre ?', 'août'),
      fill('Quel jour est après mardi ?', 'mercredi'),
      fill('Quel jour le café est fermé ?', 'lundi'),
      fill('Est-ce que le café est ouvert le vendredi ?', 'Oui'),
      fill('Est-ce que le café est ouvert dimanche après-midi ?', 'Non'),
      fill('Nous travaillons à neuf heures moins le quart. → ___', '8 h 45'),
      fill('Rendez-vous à sept heures et demie. → ___', '19 h 30'),
      fill('Leur train est à dix heures quatre. → ___', '10 h 04'),
      fill('Évaluation : ___ matin, je vais au musée.', 'Samedi', { audioSrc: A5011 }),
      fill('Évaluation : À ___, je vais au restaurant avec mes parents.', 'midi', {
        audioSrc: A5011,
      }),
      fill('Évaluation : Entre ___ heures, je fais mon jogging.', '3 et 4', {
        audioSrc: A5011,
      }),
      fill('Évaluation : Je bois un verre avec mes amis à ___.', '19 heures', {
        audioSrc: A5011,
      }),
      fill('Évaluation : Le ___, je me repose ou je vais au cinéma.', 'soir', {
        audioSrc: A5011,
      }),
      fill('Gaby travaille à la maison le ___.', 'mercredi', { audioSrc: A5021 }),
      fill('Gaby va souvent au lycée à 15 minutes de la maison, parfois en ___.', 'bus', {
        audioSrc: A5021,
      }),
      fill('La semaine, Gaby dort de ___ à 7 h.', '11 h', { audioSrc: A5021 }),
    ],
  ),
  lesson(
    'e2',
    'ordre',
    'Remettre les mots dans l’ordre',
    'Remettez les mots ou les répliques dans l’ordre.',
    [
      fill('six – soir. – Il – heures – est – du', 'Il est six heures du soir.'),
      fill('Vous – heure ? – vous – quelle – avez – à – rendez', 'Vous avez rendez-vous à quelle heure ?'),
      fill('sept – les – lève – me – matin. – heures – Je – à – tous', 'Je me lève à sept heures tous les matins.'),
      fill(
        'Remettez le dialogue : Allô ? / Non, je travaille le samedi matin. / Allô Margaux. C’est Léo. Samedi on déjeune à Belleville. Tu viens avec nous ? / Ok. À dimanche quinze heures. Bisous. / Ah… Et dimanche, tu es libre ? Je vais au musée. / D’accord. Rendez-vous devant le métro à trois heures ?',
        'Allô ? — Allô Margaux. C’est Léo. Samedi on déjeune à Belleville. Tu viens avec nous ? — Non, je travaille le samedi matin. — Ah… Et dimanche, tu es libre ? Je vais au musée. — D’accord. Rendez-vous devant le métro à trois heures ? — Ok. À dimanche quinze heures. Bisous.',
      ),
    ],
  ),
  lesson(
    'f3',
    'qcm-verbe',
    'Accepter ou refuser',
    'Écoutez s’il y a un enregistrement, lisez, puis choisissez la bonne réponse.',
    [
      qcm('La femme organise … (fête dimanche)', 'Une fête', [
        'Une fête',
        'Un pique-nique',
        'Un apéro',
      ], { audioSrc: A5012 }),
      qcm('Qui est-ce qu’elle invite ? (fête dimanche)', 'Ses amis et sa famille', [
        'Ses amis',
        'Sa famille',
        'Ses amis et sa famille',
      ], { audioSrc: A5012 }),
      qcm('Elle invite Sylvie …', 'Avec son mari', [
        'Avec sa sœur',
        'Avec son frère',
        'Avec son mari',
      ], { audioSrc: A5012 }),
      qcm('Qui est Angela ?', 'Une voisine', ['Une voisine', 'Une amie', 'Une cousine'], {
        audioSrc: A5012,
      }),
      qcm('Madame Bugier invite Thomas à …', 'Un apéro', [
        'La fête des voisins',
        'Un apéro',
        'Un mariage',
      ], { audioSrc: A5031 }),
      qcm('Thomas … (invitation Madame Bugier)', 'Accepte l’invitation', [
        'Accepte l’invitation',
        'Refuse l’invitation',
        'Invite madame Bugier le 7 juin',
      ], { audioSrc: A5031 }),
      qcm('Une salade de fruits est … (Madame Bugier)', 'Un dessert', [
        'Un dessert',
        'Un plat chaud',
        'Une boisson',
      ], { audioSrc: A5031 }),
      qcm('Le document (fête des voisins) est …', 'Une invitation', [
        'Un menu',
        'Une affiche',
        'Une invitation',
      ]),
      qcm('La fête des voisins se passe …', 'Vendredi 1er juin à 19 heures', [
        'Vendredi 1er juin à 19 heures',
        'Samedi 1er juin à 18 heures',
        'Vendredi 19 juin à 18 heures',
      ]),
      qcm('On apporte … (fête des voisins)', 'Un plat chaud ou un plat froid', [
        'Un plat chaud et un plat froid',
        'Un plat chaud ou un plat froid',
        'Un plat chaud et des verres en papier',
      ]),
      qcm('Éric … (appel Chloé)', 'propose une sortie à Chloé', [
        'accepte l’invitation de Chloé',
        'invite Chloé chez lui',
        'propose une sortie à Chloé',
      ], { audioSrc: A5032 }),
      qcm('Chloé … (appel Éric)', 'accepte la proposition', [
        'accepte la proposition',
        'refuse la proposition',
        'ne répond pas',
      ], { audioSrc: A5032 }),
      qcm('Qui organise la fête d’anniversaire ? (Julien)', 'Elsa', [
        'Elsa',
        'Blandine',
        'Julien',
      ], { audioSrc: A5042 }),
      qcm('Jérémie … (anniversaire de Julien)', 'Ne peut pas venir à l’anniversaire', [
        'Est disponible',
        'Vient à l’anniversaire',
        'Ne peut pas venir à l’anniversaire',
      ], { audioSrc: A5042 }),
    ],
  ),
  lesson(
    'f3',
    'fill-conj',
    'Compléter d’après l’invitation',
    'Écoutez s’il y a un enregistrement, lisez, puis écrivez la réponse.',
    [
      fill('Qui apporte le dessert ? (fête dimanche)', 'Angela', { audioSrc: A5012 }),
      fill('Lucas 1 (resto samedi) → réponse ___', 'd'),
      fill('Pourquoi ___ ? Le cinéma, c’est ___ d’ici ?', 'pas / loin'),
      fill('Non, elle n’est pas ___. Elle ___ son jogging.', 'libre / fait'),
      fill('___ ! À ___ !', 'D’accord / dimanche'),
      fill('Non, je ne ___ pas. Je dîne avec mes parents.', 'peux'),
      fill('Éric propose une balade ___.', 'samedi matin à 11 h', { audioSrc: A5032 }),
      fill('Quand est le rendez-vous ? (Éric / Chloé)', 'samedi matin à 11 h', {
        audioSrc: A5032,
      }),
      fill('Quel est la date de l’anniversaire de Julien ?', 'samedi 21 juin', {
        audioSrc: A5042,
      }),
      fill('Quel âge va avoir Julien ?', '30 ans', { audioSrc: A5042 }),
      fill('Elsa veut acheter ___.', 'un appareil photo', { audioSrc: A5042 }),
    ],
  ),
  lesson(
    'a7',
    'negatif',
    'Répondre à la forme négative',
    'Écoutez s’il y a un enregistrement, puis répondez.',
    [
      fill('Qu’est-ce qui est cassé ?', 'un plat noir', { audioSrc: A5041 }),
      fill('Qu’est-ce que la dame cherche ?', 'son porte-monnaie', { audioSrc: A5041 }),
      fill('Le garçon a-t-il cassé le plat ?', 'Non, il n’a pas cassé le plat.', {
        audioSrc: A5041,
      }),
      fill('Le garçon a-t-il pris le paquet de bonbons ?', 'Non, il n’a pas pris le paquet de bonbons.', {
        audioSrc: A5041,
      }),
    ],
  ),
  lesson(
    'a7',
    'qcm-verbe',
    'Choisir d’après l’écoute',
    'Écoutez, puis choisissez la bonne réponse.',
    [
      qcm('Qu’est-ce qui est cassé ?', 'Un plat noir', [
        'Un porte-monnaie',
        'Un paquet de bonbons',
        'Un plat noir',
      ], { audioSrc: A5041 }),
    ],
  ),
  lesson(
    'a8',
    'fill-conj',
    'Compléter la négation',
    'Écoutez s’il y a un enregistrement, puis écrivez jamais, plus, rien ou personne.',
    [
      fill('Gaby ne dîne ___ au restaurant.', 'jamais', { audioSrc: A5021 }),
    ],
  ),
  lesson(
    'f3',
    'associer',
    'Associer les messages d’invitation',
    'Associez chaque message de Lucas à la réponse de Léa.',
    [
      fill('Tu viens au restaurant samedi soir ? → ___', 'd'),
      fill('Nous pouvons aller au cinéma dimanche à quinze heures. → ___', 'c'),
      fill('C’est à cinq minutes à pied ! Tu viens avec Gaëlle ? → ___', 'a'),
      fill('Elle est sportive ! Rendez-vous au cinéma à 14 h 45 ? → ___', 'b'),
    ],
  ),
]
