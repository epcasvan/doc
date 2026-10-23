/** Exercices CSC leçon 03 Heures-1 à Heures-5 — sans la théorie. */
import { fill, lesson, qcm } from './helpers'
import type { GramLesson } from '../types'

const A2012 = '/lib/audio/grammaire/heures/lecon-03-02-01-audio-2.mp3'
const A2013 = '/lib/audio/grammaire/heures/lecon-03-02-01-audio-3.mp3'
const A2022 = '/lib/audio/grammaire/heures/lecon-03-02-02-audio-2.mp3'
const A2023 = '/lib/audio/grammaire/heures/lecon-03-02-02-audio-3.mp3'
const A2031 = '/lib/audio/grammaire/heures/lecon-03-02-03-audio-1.mp3'
const A2032 = '/lib/audio/grammaire/heures/lecon-03-02-03-audio-2.mp3'
const A2041 = '/lib/audio/grammaire/heures/lecon-03-02-04-audio-1.mp3'
const A2042 = '/lib/audio/grammaire/heures/lecon-03-02-04-audio-2.mp3'
const A2043 = '/lib/audio/grammaire/heures/lecon-03-02-04-audio-3.mp3'
const A2051 = '/lib/audio/grammaire/heures/lecon-03-02-05-audio-1.mp3'
const A2052 = '/lib/audio/grammaire/heures/lecon-03-02-05-audio-2.mp3'

export const GRAM_LESSONS_WORD_HEURES: GramLesson[] = [
  lesson(
    'e2',
    'qcm-verbe',
    'Dire le moment',
    'Écoutez s’il y a un enregistrement, lisez, puis choisissez la bonne réponse.',
    [
      qcm('Quelle heure est-il ? (Zafran, bibliothèque)', '16 h 50', [
        '16 h 50',
        '17 h 00',
        '16 h 10',
      ], { audioSrc: A2012 }),
      qcm('À quelle heure ferme la bibliothèque le mardi ?', 'à 17 h', [
        'à 17 h',
        'à 16 h 50',
        'à 18 h',
      ], { audioSrc: A2012 }),
      qcm('Isabelle travaille à quelle heure ?', 'De 19 h à 7 h', [
        'De 19 h à 7 h',
        'De 17 h à 7 h',
        'De 18 h à 7 h',
      ], { audioSrc: A2013 }),
      qcm('Quand est-ce qu’Isabelle se lève ?', '12 heures', [
        '12 heures',
        '11 heures',
        '13 heures',
      ], { audioSrc: A2013 }),
      qcm('Pourquoi Dora refuse l’invitation ?', 'transport', [
        'transport',
        'famille',
        'prix',
      ], { audioSrc: A2022 }),
      qcm('Pourquoi Colin refuse l’invitation ?', 'famille', [
        'famille',
        'sport',
        'prix',
      ], { audioSrc: A2022 }),
      qcm('Pourquoi Inna refuse l’invitation ?', 'prix', [
        'prix',
        'transport',
        'sport',
      ], { audioSrc: A2022 }),
      qcm('Pourquoi Madeleine refuse l’invitation ?', 'sport', [
        'sport',
        'famille',
        'transport',
      ], { audioSrc: A2022 }),
      qcm('On fait une promenade à 16 h. → ___', 'A', ['A', 'M', 'S'], { audioSrc: A2031 }),
      qcm('Je finis le travail à 20 h. → ___', 'S', ['S', 'M', 'A'], { audioSrc: A2031 }),
      qcm('L’animation pour les enfants est entre 10 h et midi. → ___', 'M', [
        'M',
        'A',
        'S',
      ], { audioSrc: A2031 }),
      qcm('À quelle heure Betty arrive pour le brunch ?', '13 h', [
        '13 h',
        '11 h',
        '16 h',
      ], { audioSrc: A2043 }),
      qcm('Comment Gabi va au lycée ?', 'à pied', ['à pied', 'en voiture', 'en train'], {
        audioSrc: A2052,
      }),
      qcm('Quels jours Gabi fait son jogging ?', 'mardi et vendredi', [
        'mardi et vendredi',
        'mardi et jeudi',
        'jeudi et vendredi',
      ], { audioSrc: A2052 }),
      qcm('La médiathèque est fermée quel jour ?', 'dimanche', [
        'dimanche',
        'samedi',
        'lundi',
      ]),
    ],
  ),
  lesson(
    'e2',
    'fill-conj',
    'Compléter l’heure ou la date',
    'Écoutez s’il y a un enregistrement, puis écrivez l’heure ou le mot qui convient.',
    [
      fill('Qu’est-ce que cherche Zafran ?', 'la bibliothèque', { audioSrc: A2012 }),
      fill('Il est quelle heure ?', '16 h 50', { audioSrc: A2012 }),
      fill('À quelle heure ferme la bibliothèque le mardi ?', 'à 17 h', { audioSrc: A2012 }),
      fill('21 h 45 = ___', 'dix heures moins le quart'),
      fill('15 h 15 = ___', 'trois heures et quart'),
      fill('Isabelle travaille à l’___.', 'hôpital', { audioSrc: A2013 }),
      fill('Isabelle arrive à l’hôpital à ___ et travaille jusqu’à ___.', '19 h / 7 h', {
        audioSrc: A2013,
      }),
      fill('Isabelle va à la salle de sport le ___ et le ___.', 'lundi / jeudi', {
        audioSrc: A2013,
      }),
      fill('Les jours de repos, Isabelle fait de la ___ et s’occupe de ses enfants.', 'danse', {
        audioSrc: A2013,
      }),
      fill('Les enfants vont à l’école à 8 heures et quart. → ___', '8 h 15', { audioSrc: A2023 }),
      fill('Tu es libre dimanche soir à 8 heures ? → ___', '20 h', { audioSrc: A2023 }),
      fill('Allons au restaurant à midi. → ___', '12 h', { audioSrc: A2023 }),
      fill('Le concert finit à minuit. → ___', '0 h / 24 h', { audioSrc: A2023 }),
      fill('Le matin, le musée ouvre à 10 heures. → ___', '10 h', { audioSrc: A2023 }),
      fill('Demain soir, Marie vient à 7 heures et demie. → ___', '19 h 30', { audioSrc: A2023 }),
      fill('Je fais mon jogging à 4 heures de l’après-midi. → ___', '16 h', { audioSrc: A2023 }),
      fill('Je vais au cinéma samedi soir, à 7 heures moins le quart. → ___', '18 h 45', {
        audioSrc: A2023,
      }),
      fill('Quatorze heures trente → ___', '14 h 30'),
      fill('Dix-huit heures vingt → ___', '18 h 20'),
      fill('Trois heures moins vingt → ___', '2 h 40'),
      fill('Neuf heures vingt-cinq → ___', '9 h 25'),
      fill('Minuit et demi → ___', '0 h 30'),
      fill('Quinze heures dix → ___', '15 h 10'),
      fill('Huit heures trente-sept → ___', '8 h 37'),
      fill('Onze heures pile → ___', '11 h'),
      fill('Vingt heures et quart → ___', '20 h 15'),
      fill('Treize heures moins cinq → ___', '12 h 55'),
      fill('Vingt-deux heures vingt → ___', '22 h 20'),
      fill('Sept heures et quart → ___', '7 h 15'),
      fill('Seize heures quinze → ___', '16 h 15'),
      fill('Dix-neuf heures trente → ___', '19 h 30'),
      fill('Une heure moins dix → ___', '12 h 50'),
      fill('Midi → ___', '12 h'),
      fill('Le prochain train est à ___.', '8 h 55', { audioSrc: A2032 }),
      fill('Je me lève à ___.', '6 h 30', { audioSrc: A2032 }),
      fill('Je rentre chez moi vers ___ du soir.', '7 h', { audioSrc: A2032 }),
      fill('Je me couche vers ___.', '11 h 30', { audioSrc: A2032 }),
      fill('Il va arriver vers ___.', 'midi', { audioSrc: A2032 }),
      fill('Le cours de français commence à ___.', '14 h 30', { audioSrc: A2032 }),
      fill('Il est ___, le magasin est déjà fermé.', '7 h 15', { audioSrc: A2032 }),
      fill('L’avion décolle à ___.', '21 h 50', { audioSrc: A2032 }),
      fill('Je me couche toujours vers ___.', 'minuit', { audioSrc: A2032 }),
      fill('Je finis le travail à 20 h. → [M / A / S]', 'S', { audioSrc: A2031 }),
      fill('Il finit le déjeuner à 2 heures et demie. → [M / A / S]', 'A', { audioSrc: A2031 }),
      fill('Vous venez au brunch demain à 11 h. → [M / A / S]', 'M', { audioSrc: A2031 }),
      fill('Le film finit à minuit. → [M / A / S]', 'S', { audioSrc: A2031 }),
      fill('Les musées ouvrent à 10 heures moins le quart. → [M / A / S]', 'M', {
        audioSrc: A2031,
      }),
      fill('À quelle heure la médiathèque est ouverte ?', 'à 8 h 30'),
      fill('Elle est fermée quel jour ?', 'dimanche'),
      fill('Lundi et vendredi, la médiathèque est ouverte de ___ à ___.', '8 h 30 / 18 h'),
      fill('Mardi à jeudi, la médiathèque est ouverte de ___ à ___.', '8 h 30 / 19 h'),
      fill('Samedi, la médiathèque est ouverte de ___ à ___.', '8 h 30 / 17 h'),
      fill('Marco va au cinéma le mardi 15 à ___.', '15 h', { audioSrc: A2041 }),
      fill('Daria a un cours de danse de ___ à ___.', '14 h / 16 h', { audioSrc: A2041 }),
      fill('Rendez-vous au bar Le Moderne à ___.', '17 h', { audioSrc: A2041 }),
      fill('Tes parents viennent ___.', 'avec toi', { audioSrc: A2042 }),
      fill('Elle ___ à l’exposition.', 'ne vient pas', { audioSrc: A2042 }),
      fill('Elles font un brunch entre ___.', '10 h 30 et 11 h 30', { audioSrc: A2042 }),
      fill('Qu’est-ce que Betty fait dimanche matin ?', 'son jogging', { audioSrc: A2043 }),
      fill('Ils vont ___ et manger un brunch.', 'au cinéma', { audioSrc: A2043 }),
      fill('Betty arrive pour le brunch à ___.', '13 h', { audioSrc: A2043 }),
      fill('Samedi matin, je vais au ___.', 'musée', { audioSrc: A2051 }),
      fill('À ___, je vais au restaurant avec mes parents.', 'midi', { audioSrc: A2051 }),
      fill('Entre ___ heures, je fais mon jogging.', '3 et 4', { audioSrc: A2051 }),
      fill('Je bois un verre avec mes amis à ___.', '19 h', { audioSrc: A2051 }),
      fill('Le ___, je me repose ou je vais au cinéma.', 'soir', { audioSrc: A2051 }),
      fill('Qui parle ?', 'Gabi', { audioSrc: A2052 }),
      fill('Quel est la profession de Gabi ?', 'professeur', { audioSrc: A2052 }),
      fill('Gabi va au lycée à ___.', 'pied', { audioSrc: A2052 }),
      fill('Gabi ne dîne jamais au ___.', 'restaurant', { audioSrc: A2052 }),
      fill('Gabi fait son jogging le ___ et le ___.', 'mardi / vendredi', { audioSrc: A2052 }),
      fill('Horloge : quatre heures → ___', '4 h'),
      fill('Horloge : une heure et demie → ___', '1 h 30'),
      fill('Horloge : neuf heures et demie → ___', '9 h 30'),
      fill('Horloge : six heures et quart → ___', '6 h 15'),
      fill('Horloge : une heure et quart → ___', '1 h 15'),
      fill('Horloge : huit heures moins le quart → ___', '7 h 45'),
      fill('Horloge : deux heures moins le quart → ___', '1 h 45'),
      fill('Horloge : midi et quart → ___', '12 h 15'),
      fill('Horloge : midi et demi → ___', '12 h 30'),
      fill('Horloge : midi moins le quart → ___', '11 h 45'),
      fill('Horloge : cinq heures dix → ___', '5 h 10'),
      fill('Horloge : sept heures et demie → ___', '7 h 30'),
      fill('Horloge : neuf heures → ___', '9 h'),
      fill('Horloge : six heures → ___', '6 h'),
    ],
  ),
  lesson(
    'e2',
    'ordre',
    'Remettre les mots dans l’ordre',
    'Remettez les mots dans l’ordre.',
    [
      fill('veux – au – aller – demain – cinéma – Tu – soir ?', 'Tu veux aller au cinéma demain soir ?'),
      fill('êtes – dimanche – libres – Vous – matin ?', 'Vous êtes libres dimanche matin ?'),
      fill('fait – heures. – Un – à – On – une – pique-nique', 'On fait un pique-nique à une heure.'),
    ],
  ),
  lesson(
    'er',
    'fill-conj',
    'Conjuguer les verbes en -er',
    'Conjuguez commencer ou terminer.',
    [
      fill('Tu ___ (commencer) quand ton cours ?', 'commences'),
      fill('À quelle heure vous ___ (terminer) l’école ?', 'terminez'),
      fill('Elles ___ (terminer) à 16 h 50.', 'terminent'),
      fill('Nous ___ (commencer) la pause à 9 h 45.', 'commençons'),
      fill('On ___ (terminer) la pause à 10 h 05.', 'termine'),
      fill('Il ___ (commencer) à manger à 18 h 30.', 'commence'),
      fill('Quand vous ___ (commencer) votre travail ?', 'commencez'),
      fill('Nous ___ (terminer) l’examen à midi.', 'terminons'),
    ],
  ),
  lesson(
    'e5',
    'fill-conj',
    'Compléter d’abord / ensuite / enfin',
    'Écoutez s’il y a un enregistrement, puis écrivez d’abord, ensuite ou enfin.',
    [
      fill('___ je me repose. Je fais une sieste jusqu’à 17-18 h.', 'D’abord', { audioSrc: A2013 }),
    ],
  ),
]
