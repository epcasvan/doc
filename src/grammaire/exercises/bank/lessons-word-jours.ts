/** Exercices CSC leçon 03 Jour-1 / Jour-2 — sans la théorie. */
import { fill, lesson, qcm } from './helpers'
import type { GramLesson } from '../types'

const AUDIO_DIALOGUE = '/lib/audio/grammaire/jours/lecon-03-01-01-audio-2.mp3'
const AUDIO_JOURS = '/lib/audio/grammaire/jours/lecon-03-01-02-audio-1.mp3'
const AUDIO_DICTEE = '/lib/audio/grammaire/jours/lecon-03-01-02-audio-2.mp3'

export const GRAM_LESSONS_WORD_JOURS: GramLesson[] = [
  lesson(
    'e2',
    'qcm-verbe',
    'Dire le moment',
    'Écoutez s’il y a un enregistrement, lisez, puis choisissez la bonne réponse.',
    [
      qcm('Quand est le cours de français ?', 'le mardi et le jeudi après-midi', [
        'le mardi et le jeudi après-midi',
        'le lundi matin',
        'le dimanche',
      ], { audioSrc: AUDIO_DIALOGUE }),
      qcm('À quelle heure commence le cours de français le mercredi ?', 'à 10 h', [
        'à 10 h',
        'à 12 h',
        'à 8 h',
      ], { audioSrc: AUDIO_DIALOGUE }),
      qcm('Est-ce qu’il y a un cours de français le lundi ?', 'Non, le centre est fermé', [
        'Non, le centre est fermé',
        'Oui, le matin',
        'Oui, l’après-midi',
      ], { audioSrc: AUDIO_DIALOGUE }),
      qcm('Quand le kiosque est fermé toute la journée ?', 'vendredi', [
        'vendredi',
        'dimanche',
        'lundi',
      ]),
      qcm('Quel jour le kiosque ferme à 20 h 30 ?', 'mardi', ['mardi', 'jeudi', 'samedi']),
      qcm('Quel jour le kiosque n’ouvre pas à 8 h ?', 'mardi', ['mardi', 'lundi', 'mercredi']),
      qcm('Quel jour le kiosque ouvre à 9 h ?', 'dimanche', ['dimanche', 'samedi', 'vendredi']),
      qcm('Aujourd’hui, on est mercredi. Après-demain, c’est le week-end ?', 'Non', [
        'Non',
        'Oui',
        'C’est dimanche',
      ]),
      qcm('Aujourd’hui, on est mercredi. Avant-hier, c’était dimanche ?', 'Non', [
        'Non',
        'Oui',
        'C’était samedi',
      ]),
      qcm('Vous avez l’école tous les samedis ?', 'Non', ['Non', 'Oui', 'Seulement le matin']),
    ],
  ),
  lesson(
    'e2',
    'fill-conj',
    'Compléter l’heure ou la date',
    'Écoutez s’il y a un enregistrement, puis complétez avec le jour, l’heure ou le mot qui convient.',
    [
      fill('Quand est le cours de français ?', 'le mardi et le jeudi après-midi', {
        audioSrc: AUDIO_DIALOGUE,
      }),
      fill('À quelle heure commence le cours de français le mercredi ?', 'à 10 h', {
        audioSrc: AUDIO_DIALOGUE,
      }),
      fill('Est-ce qu’il y a un cours de français le lundi ?', 'Non, le centre est fermé.', {
        audioSrc: AUDIO_DIALOGUE,
      }),
      fill('Le mercredi, il y a un cours de ___ à ___.', '10 h / 12 h', { audioSrc: AUDIO_DIALOGUE }),
      fill('Quand le kiosque est fermé toute la journée ?', 'vendredi'),
      fill('Quel jour le kiosque ferme à 20 h 30 ?', 'mardi'),
      fill('Quel jour le kiosque n’ouvre pas à 8 h ?', 'mardi'),
      fill('Quel jour le kiosque ouvre à 9 h ?', 'dimanche'),
      fill('C’est mercredi, quel jour on sera demain ?', 'jeudi'),
      fill('C’est lundi, quel jour on sera après-demain ?', 'mercredi'),
      fill('C’est dimanche, quel jour on était hier ?', 'samedi'),
      fill('C’est jeudi, quel jour on était avant-hier ?', 'mardi'),
      fill('Léa n’est pas allée à l’école le ___.', 'lundi', { audioSrc: AUDIO_JOURS }),
      fill('Léa a cours de français le ___ soir, de 18 h 30 à 20 h.', 'mardi', {
        audioSrc: AUDIO_JOURS,
      }),
      fill('Léa n’a souvent pas le temps de manger le ___ soir.', 'vendredi', {
        audioSrc: AUDIO_JOURS,
      }),
      fill('Léa va courir le matin le ___.', 'samedi', { audioSrc: AUDIO_JOURS }),
      fill('Léa doit être au salon à ___.', '8 h', { audioSrc: AUDIO_JOURS }),
      fill('Elle fait de la danse de ___ à treize heures.', 'midi', { audioSrc: AUDIO_DICTEE }),
      fill('Nous ne faisons jamais les courses le ___.', 'week-end', { audioSrc: AUDIO_DICTEE }),
    ],
  ),
  lesson(
    'e4',
    'fill-conj',
    'Compléter la fréquence',
    'Écoutez s’il y a un enregistrement, puis écrivez toujours, souvent, parfois, rarement, jamais ou le jour.',
    [
      fill('Ils vont ___ chez leurs amis français.', 'parfois', { audioSrc: AUDIO_DICTEE }),
      fill('Nous ne faisons ___ les courses le week-end.', 'jamais', { audioSrc: AUDIO_DICTEE }),
      fill('Léa travaille du lundi au vendredi. Le dimanche, elle ne court ___ .', 'jamais', {
        audioSrc: AUDIO_JOURS,
      }),
      fill('Le mardi, Léa rentre assez tard, ___ fatiguée.', 'souvent', { audioSrc: AUDIO_JOURS }),
    ],
  ),
  lesson(
    'e4',
    'qcm-verbe',
    'Dire la fréquence',
    'Choisissez l’adverbe de fréquence.',
    [
      qcm('Ils vont ___ chez leurs amis français.', 'parfois', ['parfois', 'toujours', 'jamais'], {
        audioSrc: AUDIO_DICTEE,
      }),
      qcm('Nous ne faisons ___ les courses le week-end.', 'jamais', ['jamais', 'toujours', 'souvent'], {
        audioSrc: AUDIO_DICTEE,
      }),
      qcm('Le dimanche, Léa ne court ___.', 'jamais', ['jamais', 'toujours', 'parfois'], {
        audioSrc: AUDIO_JOURS,
      }),
    ],
  ),
  lesson(
    'e5',
    'fill-conj',
    'Compléter d’abord / ensuite / enfin',
    'Écoutez s’il y a un enregistrement, puis écrivez d’abord, ensuite, après, puis ou enfin.',
    [
      fill('D’abord je m’habille et ___ je déjeune.', 'après', { audioSrc: AUDIO_DICTEE }),
      fill('___ je m’habille et après je déjeune.', 'D’abord', { audioSrc: AUDIO_DICTEE }),
    ],
  ),
  lesson(
    'e5',
    'qcm-verbe',
    'Ordonner les actions',
    'Choisissez d’abord, ensuite, puis, après ou enfin.',
    [
      qcm('D’abord je m’habille et ___ je déjeune.', 'après', ['après', 'd’abord', 'enfin'], {
        audioSrc: AUDIO_DICTEE,
      }),
    ],
  ),
  lesson(
    'f6',
    'fill-conj',
    'Compléter le possessif',
    'Écoutez s’il y a un enregistrement, puis écrivez le déterminant possessif.',
    [
      fill('Ils vont parfois chez ___ amis français.', 'leurs', { audioSrc: AUDIO_DICTEE }),
    ],
  ),
  lesson(
    'd1',
    'fill-conj',
    'Conjuguer faire / aller',
    'Écoutez s’il y a un enregistrement, puis conjuguez faire ou écrivez la phrase d’activité.',
    [
      fill('Qu’est-ce que tu ___ après la sieste ?', 'fais', { audioSrc: AUDIO_DICTEE }),
      fill('Elle ___ de la danse de midi à treize heures.', 'fait', { audioSrc: AUDIO_DICTEE }),
      fill('faire la vaisselle → ___', 'Il fait la vaisselle.'),
      fill('faire les courses → ___', 'Il fait les courses.'),
      fill('faire la lessive → ___', 'Il fait la lessive.'),
      fill('faire le ménage → ___', 'Il fait le ménage.'),
    ],
  ),
  lesson(
    'd1',
    'associer',
    'Associer les phrases aux activités',
    'Associez chaque phrase à l’activité.',
    [
      fill('Il fait la vaisselle. → ___', 'vaisselle'),
      fill('Il fait les courses. → ___', 'courses'),
      fill('Il fait la lessive. → ___', 'lessive'),
      fill('Il fait le ménage. → ___', 'ménage'),
      fill('Il se repose. → ___', 'se reposer'),
      fill('Il se couche. → ___', 'se coucher'),
      fill('Il se douche. → ___', 'se doucher'),
      fill('Il dort. → ___', 'dormir'),
    ],
  ),
  lesson(
    'd2',
    'fill-conj',
    'Conjuguer le pronominal au présent',
    'Complétez avec le verbe pronominal, ou écrivez la phrase.',
    [
      fill('se reposer → ___', 'Il se repose.'),
      fill('se coucher → ___', 'Il se couche.'),
      fill('se doucher → ___', 'Il se douche.'),
      fill('Il ___ (se reposer).', 'se repose'),
      fill('Il ___ (se coucher).', 'se couche'),
      fill('Il ___ (se doucher).', 'se douche'),
    ],
  ),
]
