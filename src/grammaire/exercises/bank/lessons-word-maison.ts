/** Exercices CSC leçon 05 Maison-1 / Maison-2 — sans la théorie. */
import { fill, lesson } from './helpers'
import type { GramLesson } from '../types'

const M1 = '/lib/audio/grammaire/maison/lecon-05-01-01-1-audio-1.mp3'
const M2 = '/lib/audio/grammaire/maison/lecon-05-01-01-2-audio-1.mp3'

export const GRAM_LESSONS_WORD_MAISON: GramLesson[] = [
  lesson(
    'd1',
    'fill-conj',
    'Conjuguer les tâches domestiques',
    'Écoutez s’il y a un enregistrement, puis conjuguez le verbe ou écrivez l’activité.',
    [
      fill('Qu’est-ce que Thomas doit faire ?', 'Vider les poubelles', { audioSrc: M1 }),
      fill('Il doit aussi … (Thomas)', 'Aller faire les courses', { audioSrc: M1 }),
      fill('Thomas doit aussi acheter un carnet de ___ à la poste.', 'timbres', {
        audioSrc: M1,
      }),
      fill('Citez 4 courses de Thomas (parmi farine, tomates, café, poulet, salade, riz, pain, vin, timbres).', 'farine / tomates / café / poulet', {
        audioSrc: M1,
      }),
      fill('Nous ___ les poubelles avant qu’elles ne débordent. (jeter)', 'jetons'),
      fill('Mon frère ___ la vaisselle aujourd’hui. (faire)', 'fait'),
      fill('En été, Ali ___ souvent les plantes. (arroser)', 'arrose'),
      fill('Je ___ le sol car il y a des miettes par terre. (balayer)', 'balaie'),
      fill('Après le repassage, Mohammad et Ahmed ___ les vêtements. (plier)', 'plient'),
      fill('Quand ___-vous la lessive ? (faire)', 'faites'),
      fill('Tous les vendredis, elles ___ l’aspirateur dans sa chambre. (passer)', 'passent'),
      fill('Ivan n’aime pas ___ les toilettes. (nettoyer)', 'nettoyer'),
      fill('Mon père ___ les meubles quand il y a beaucoup de poussière. (épousseter)', 'époussette'),
      fill('Après avoir balayé, tu ___ la serpillière. (passer)', 'passes'),
      fill('Justine ___ les vitres pour bien voir dehors. (polir)', 'polit'),
      fill('Marie et Justine ___ les poubelles. (jeter)', 'jettent'),
      fill('Tu ___ la lessive à quelle heure ? (faire)', 'fais'),
      fill('Pierre ___ le sol ce matin. (aspirer)', 'aspire'),
      fill('Dilan et Ali ___ le linge propre. (étendre)', 'étendent'),
      fill('Nous devons ___ les enfants. (surveiller)', 'surveiller'),
      fill('Vous ___ les miroirs. (polir)', 'polissez'),
      fill('Elles ___ la poussière. (épousseter)', 'époussettent'),
      fill('Le concierge ___ les étagères. (nettoyer)', 'nettoie'),
      fill('Numéro 1 (écoute) → ___', 'faire la vaisselle', { audioSrc: M2 }),
      fill('Numéro 2 (écoute) → ___', 'jeter les poubelles', { audioSrc: M2 }),
      fill('Numéro 3 (écoute) → ___', 'polir les miroirs', { audioSrc: M2 }),
      fill('Numéro 4 (écoute) → ___', 'jardiner / arroser les plantes', { audioSrc: M2 }),
      fill('Numéro 5 (écoute) → ___', 'nettoyer les toilettes', { audioSrc: M2 }),
      fill('Numéro 6 (écoute) → ___', 'balayer le sol', { audioSrc: M2 }),
      fill('Numéro 7 (écoute) → ___', 'faire la lessive', { audioSrc: M2 }),
      fill('Numéro 8 (écoute) → ___', 'passer l’aspirateur', { audioSrc: M2 }),
      fill('Numéro 9 (écoute) → ___', 'passer la serpillière', { audioSrc: M2 }),
    ],
  ),
  lesson(
    'd1',
    'ordre',
    'Remettre les mots dans l’ordre',
    'Remettez les mots dans l’ordre.',
    [
      fill('pas / fenêtres. / Elle / n’ / les / aime / nettoyer', 'Elle n’aime pas nettoyer les fenêtres.'),
      fill('des / noirs. / Nous / mettons / gants', 'Nous mettons des gants noirs.'),
      fill('la / le / devant / balaie / maison. / Je / sol', 'Je balaie le sol devant la maison.'),
      fill('n’ / pas / faire / vaisselle. / Il / la / aime', 'Il n’aime pas faire la vaisselle.'),
      fill('samedis, / vêtements. / repassent / les / elles / Les', 'Les samedis, elles repassent les vêtements.'),
      fill('ils / poubelles / soir, / Ce / les / jettent', 'Ce soir, ils jettent les poubelles.'),
      fill('un / a / d’ / on / besoin / aspirateur.', 'On a besoin d’un aspirateur.'),
      fill('tes / lave / ne / Tu / habits ? / pas', 'Tu ne laves pas tes habits ?'),
    ],
  ),
  lesson(
    'd1',
    'associer',
    'Associer les phrases aux activités',
    'Associez chaque phrase à l’activité.',
    [
      fill('Mon frère fait la vaisselle. → ___', 'laver la vaisselle'),
      fill('Nous jetons les poubelles. → ___', 'jeter les poubelles'),
      fill('Elles passent l’aspirateur. → ___', 'passer l’aspirateur'),
      fill('Ali arrose les plantes. → ___', 'arroser les plantes'),
      fill('Justine polit les vitres. → ___', 'polir les vitres'),
      fill('Tu passes la serpillière. → ___', 'passer la serpillière'),
    ],
  ),
  lesson(
    'e5',
    'fill-conj',
    'Compléter d’abord / ensuite / enfin',
    'Lisez le texte, puis écrivez d’abord, ensuite, enfin, ou la réponse.',
    [
      fill('D’où vient Zahra ?', 'd’Iran'),
      fill('Elle fait quoi le week-end ?', 'le ménage'),
      fill('Quel est le nom de famille de Zahra ?', 'Arashi'),
      fill('Que fait-elle en premier ?', 'elle lave la vaisselle'),
      fill('Que fait-elle en dernier ?', 'elle nettoie les sols'),
      fill('À qui sont les jouets ?', 'à sa sœur'),
      fill('___ elle lave la vaisselle, puis elle s’occupe de la lessive. (Zahra)', 'D’abord'),
      fill('Elle ___ par laver la vaisselle. (verbe)', 'commence'),
    ],
  ),
]
