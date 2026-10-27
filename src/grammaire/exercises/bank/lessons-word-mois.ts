/** Exercices CSC leçon 03 Mois-1 / Mois-2 / Mois-3 — sans la théorie. */
import { fill, lesson, qcm } from './helpers'
import type { GramLesson } from '../types'

const AUDIO_PERSONNES = '/lib/audio/grammaire/mois/lecon-03-01-03-audio-2.mp3'
const AUDIO_DICTEE_MOIS = '/lib/audio/grammaire/mois/lecon-03-01-04-audio-1.mp3'
const AUDIO_RAMI = '/lib/audio/grammaire/mois/lecon-03-01-04-audio-2.mp3'
const AUDIO_LINA = '/lib/audio/grammaire/mois/lecon-03-01-05-audio-1.mp3'

export const GRAM_LESSONS_WORD_MOIS: GramLesson[] = [
  lesson(
    'e2',
    'qcm-verbe',
    'Dire le moment',
    'Écoutez s’il y a un enregistrement, lisez, puis choisissez la bonne réponse.',
    [
      qcm('Quand l’école a commencé pour Rami ?', 'septembre', [
        'septembre',
        'août',
        'octobre',
      ], { audioSrc: AUDIO_RAMI }),
      qcm('Quel cours Rami n’avait pas à l’école ?', 'histoire', [
        'histoire',
        'français',
        'sport',
      ], { audioSrc: AUDIO_RAMI }),
      qcm('Quel stage Rami n’a pas aimé ?', 'dans le garage', [
        'dans le garage',
        'dans le restaurant',
        'dans le bâtiment',
      ], { audioSrc: AUDIO_RAMI }),
      qcm('Dans quel pays vit le frère de Rami, Saber ?', 'Turquie', [
        'Turquie',
        'Syrie',
        'Iran',
      ], { audioSrc: AUDIO_RAMI }),
      qcm('Lina va combien de jours à l’école ?', '4 jours', [
        '4 jours',
        '5 jours',
        '3 jours',
      ], { audioSrc: AUDIO_LINA }),
      qcm('Comment Lina va à l’école ?', 'à pied', [
        'à pied',
        'en voiture',
        'à vélo',
      ], { audioSrc: AUDIO_LINA }),
      qcm('Lina marche combien de temps pour aller à l’école ?', '25 minutes', [
        '25 minutes',
        '20 minutes',
        '35 minutes',
      ], { audioSrc: AUDIO_LINA }),
      qcm('Lina vient de quel pays ?', 'On ne sait pas', [
        'On ne sait pas',
        'Suisse',
        'Ukraine',
      ], { audioSrc: AUDIO_LINA }),
      qcm('Quel stage Lina n’a pas aimé ?', 'restauration', [
        'restauration',
        'coiffure',
        'assistante dentaire',
      ], { audioSrc: AUDIO_LINA }),
      qcm('Lina fait quoi le mercredi ?', 'du théâtre', [
        'du théâtre',
        'du tennis',
        'de la natation',
      ], { audioSrc: AUDIO_LINA }),
      qcm('Lina fait quoi le vendredi ?', 'du tennis', [
        'du tennis',
        'du théâtre',
        'de la lecture',
      ], { audioSrc: AUDIO_LINA }),
      qcm('Lina fait quoi en juillet ?', 'de la natation', [
        'de la natation',
        'du ski',
        'du théâtre',
      ], { audioSrc: AUDIO_LINA }),
      qcm('Quel est le premier mois de l’année ?', 'janvier', [
        'janvier',
        'décembre',
        'mars',
      ]),
      qcm('Quel est le dernier mois de l’année ?', 'décembre', [
        'décembre',
        'janvier',
        'novembre',
      ]),
      qcm('Combien y a-t-il de mois dans une année ?', '12', ['12', '7', '4']),
    ],
  ),
  lesson(
    'e2',
    'fill-conj',
    'Compléter l’heure ou la date',
    'Écoutez s’il y a un enregistrement, puis complétez avec le mois, le jour ou le mot qui convient.',
    [
      fill('Il y a ___ jours dans une semaine.', '7'),
      fill('Il y a ___ semaines dans un mois.', '4'),
      fill('Il y a ___ mois dans une année.', '12'),
      fill('Quel est le premier mois de l’année ?', 'janvier'),
      fill('Quel est le dernier mois de l’année ?', 'décembre'),
      fill('J   N → ___', 'juin'),
      fill('VRI → ___', 'avril'),
      fill('S  M  D → ___', 'samedi'),
      fill('S PT  MB  E → ___', 'septembre'),
      fill('ME  CR  D → ___', 'mercredi'),
      fill('M  RD → ___', 'mardi'),
      fill('N VE  BR → ___', 'novembre'),
      fill('D  MA  CH → ___', 'dimanche'),
      fill('L  ND → ___', 'lundi'),
      fill('F  VR   R → ___', 'février'),
      fill('D  C MBR → ___', 'décembre'),
      fill('UI   E → ___', 'juillet'),
      fill('Comment elle s’appelle ? (personne qui joue de la guitare)', 'Layla', {
        audioSrc: AUDIO_PERSONNES,
      }),
      fill('Où elle joue de la guitare ?', 'le samedi soir dans un bar', {
        audioSrc: AUDIO_PERSONNES,
      }),
      fill('Quel est le pays d’origine d’Ali ?', 'Maroc', { audioSrc: AUDIO_PERSONNES }),
      fill('Quel est le hobby d’Ali ?', 'le football', { audioSrc: AUDIO_PERSONNES }),
      fill('Pourquoi Ali n’aime pas le mois de décembre ?', 'Il n’aime pas le froid et la neige.', {
        audioSrc: AUDIO_PERSONNES,
      }),
      fill('Avec qui Lina Zhang vit-elle ?', 'avec son copain', { audioSrc: AUDIO_PERSONNES }),
      fill('Quel est le métier de Lina Zhang ?', 'couturière', { audioSrc: AUDIO_PERSONNES }),
      fill('Quand est-ce que Lina Zhang aime lire ?', 'le mercredi après-midi', {
        audioSrc: AUDIO_PERSONNES,
      }),
      fill('___ est parfait pour des pique-niques.', 'Juin', { audioSrc: AUDIO_DICTEE_MOIS }),
      fill('Les longues journées d’été arrivent en ___.', 'juillet', {
        audioSrc: AUDIO_DICTEE_MOIS,
      }),
      fill('___ est célèbre pour Halloween.', 'Octobre', { audioSrc: AUDIO_DICTEE_MOIS }),
      fill('Mars arrive après ___.', 'février', { audioSrc: AUDIO_DICTEE_MOIS }),
      fill('Je n’aime pas ___.', 'novembre', { audioSrc: AUDIO_DICTEE_MOIS }),
      fill('Entre juin et ___.', 'août', { audioSrc: AUDIO_DICTEE_MOIS }),
      fill('Les plages sont bondées en ___.', 'juillet', { audioSrc: AUDIO_DICTEE_MOIS }),
      fill('Les fleurs éclosent souvent en ___.', 'avril', { audioSrc: AUDIO_DICTEE_MOIS }),
      fill('Après août, il y a ___.', 'septembre', { audioSrc: AUDIO_DICTEE_MOIS }),
      fill('___ vient juste avant ___.', 'Décembre / janvier', { audioSrc: AUDIO_DICTEE_MOIS }),
      fill('___ est le mois le plus court.', 'Février', { audioSrc: AUDIO_DICTEE_MOIS }),
      fill('___ est le mois où l’on change d’heure.', 'Mars', { audioSrc: AUDIO_DICTEE_MOIS }),
      fill('La ___, du lundi au vendredi, je travaille à l’hôpital de Brest.', 'semaine'),
      fill('Le ___, je commence à neuf heures.', 'matin'),
      fill('Vous travaillez aussi la ___ ?', 'nuit'),
      fill('Samedi et ___, vous travaillez ?', 'dimanche'),
      fill('Non, je suis à la maison le ___.', 'week-end'),
      fill('Le ___, je fais souvent du sport avec mes enfants.', 'samedi'),
      fill('Le ___, je dîne au restaurant ou je vois un film.', 'soir'),
      fill('Rami a commencé l’école en ___.', 'septembre', { audioSrc: AUDIO_RAMI }),
      fill('Le père de Rami travaille dans le ___.', 'bâtiment', { audioSrc: AUDIO_RAMI }),
      fill('Lina fait du théâtre le ___.', 'mercredi', { audioSrc: AUDIO_LINA }),
      fill('Lina joue au tennis le ___.', 'vendredi', { audioSrc: AUDIO_LINA }),
      fill('En ___, Lina va souvent à la piscine.', 'juillet', { audioSrc: AUDIO_LINA }),
      fill('Le chien du voisin s’appelle ___.', 'Max', { audioSrc: AUDIO_LINA }),
      fill('Lina voudrait avoir un ___.', 'chat', { audioSrc: AUDIO_LINA }),
      fill('Je m’appelle Léa. J’habite à Sion. En ___, il fait froid et il ___.', 'janvier / neige'),
      fill('En février, c’est le carnaval ! Les ___ aiment se déguiser. Mon frère mange des ___.', 'enfants / bonbons'),
      fill('Il fait plus chaud en mars. Je vois souvent des ___. J’adore ramasser des ___ jaunes.', 'oiseaux / fleurs'),
      fill('C’est Pâques ! Je cherche des ___ dans le jardin. Nous mangeons du ___ et du ___.', 'œufs / poulet / gâteau'),
    ],
  ),
  lesson(
    'e2',
    'ordre',
    'Remettre les mots dans l’ordre',
    'Remettez les mots dans l’ordre.',
    [
      fill('chaud – en – fait – juillet. – Il', 'Il fait chaud en juillet.'),
      fill('En il Noël. y décembre, a', 'En décembre, il y a Noël.'),
      fill('aime – février. – le – Je – mois – pas – n’ – de', 'Je n’aime pas le mois de février.'),
      fill('rendez – le – J’ai – médecin – à – vous – chez – 17h.', 'J’ai rendez-vous chez le médecin à 17 h.'),
      fill('mai – juin – juillet. – entre – est – Le – mois – et – de', 'Le mois de juin est entre mai et juillet.'),
    ],
  ),
  lesson(
    'e4',
    'qcm-verbe',
    'Dire la fréquence',
    'Choisissez la réponse qui convient.',
    [
      qcm('Vous courez souvent ?', 'Non, jamais. Je n’aime pas.', [
        'Non, jamais. Je n’aime pas.',
        'Oui, lundi 25 avril au parc.',
        'Oui, c’est en juin.',
      ]),
      qcm('Tu ne vas jamais au supermarché ?', 'Non, je préfère faire les courses au marché.', [
        'Non, je préfère faire les courses au marché.',
        'Non, c’est à cinq minutes à pied.',
        'Oui, le 15 janvier 2020.',
      ]),
      qcm('Elle fait parfois la sieste ?', 'Non, elle travaille l’après-midi.', [
        'Non, elle travaille l’après-midi.',
        'Oui, de minuit à huit heures le vendredi.',
        'Oui, il commence en août.',
      ]),
      qcm('Il fait souvent du tennis ?', 'Oui, lundi et jeudi matin.', [
        'Oui, lundi et jeudi matin.',
        'Oui, le 15 janvier 2020.',
        'Oui, c’est en juin.',
      ]),
      qcm('Il va toujours à l’école ?', 'Non, il est souvent malade.', [
        'Non, il est souvent malade.',
        'Oui, il commence en août.',
        'Oui, c’est en juin.',
      ]),
      qcm('Il aime l’école ?', 'Non, il n’y va jamais.', [
        'Non, il n’y va jamais.',
        'Oui, c’est en juin.',
        'Oui, il commence en août.',
      ]),
    ],
  ),
  lesson(
    'd1',
    'fill-conj',
    'Conjuguer faire / aller',
    'Écoutez s’il y a un enregistrement, puis conjuguez faire ou écrivez l’activité.',
    [
      fill('Lina ___ du théâtre le mercredi.', 'fait', { audioSrc: AUDIO_LINA }),
      fill('Le vendredi, Lina ___ au tennis.', 'joue', { audioSrc: AUDIO_LINA }),
      fill('En juillet, Lina va souvent à la piscine pour ___.', 'nager', { audioSrc: AUDIO_LINA }),
    ],
  ),
]
