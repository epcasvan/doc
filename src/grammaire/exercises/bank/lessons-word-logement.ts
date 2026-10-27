/** Exercices CSC leçon 04 Logement — sans la théorie. */
import { fill, lesson, qcm, writeItem } from './helpers'
import type { GramLesson } from '../types'

const P44 = '/lib/audio/grammaire/logement/piste-044.mp3'
const P45 = '/lib/audio/grammaire/logement/piste-045.mp3'
const P46 = '/lib/audio/grammaire/logement/piste-046.mp3'
const P47 = '/lib/audio/grammaire/logement/piste-047.mp3'
const P48 = '/lib/audio/grammaire/logement/piste-048.mp3'
const P228 = '/lib/audio/grammaire/logement/piste-228.mp3'
const PROG = '/lib/audio/grammaire/logement/progressive-1.mp3'

export const GRAM_LESSONS_WORD_LOGEMENT: GramLesson[] = [
  lesson(
    'f5',
    'qcm-verbe',
    'Choisir c’est, il est ou il y a',
    'Écoutez s’il y a un enregistrement, lisez, puis choisissez la bonne réponse.',
    [
      qcm('Le document (studios, jardin) est une publicité.', 'Vrai', ['Vrai', 'Faux'], {
        audioSrc: P44,
      }),
      qcm('Le quartier est calme. (annonce studios)', 'Vrai', ['Vrai', 'Faux'], {
        audioSrc: P44,
      }),
      qcm('Les pièces sont sombres. (annonce studios)', 'Faux', ['Vrai', 'Faux'], {
        audioSrc: P44,
      }),
      qcm('Les studios ont une terrasse.', 'Vrai', ['Vrai', 'Faux'], { audioSrc: P44 }),
      qcm('Les appartements ont 3 pièces. (annonce)', 'Faux', ['Vrai', 'Faux'], {
        audioSrc: P44,
      }),
      qcm('L’immeuble a un jardin. (annonce studios)', 'Vrai', ['Vrai', 'Faux'], {
        audioSrc: P44,
      }),
      qcm('C’est [ une émission radio / une visite guidée ]. (Victor Hugo)', 'une visite guidée', [
        'une visite guidée',
        'une émission radio',
      ], { audioSrc: P45 }),
      qcm('La maison de Victor Hugo est à la place …', 'des Vosges', [
        'des Vosges',
        'Victor Hugo',
      ], { audioSrc: P45 }),
      qcm('La maison de Victor Hugo est …', 'à Paris', ['à Paris', 'dans les Vosges'], {
        audioSrc: P45,
      }),
      qcm('Dans la maison, on voit …', 'trois pièces', ['trois pièces', 'deux pièces'], {
        audioSrc: P45,
      }),
      qcm('Il y a … (Victor Hugo)', 'deux salons', ['deux salons', 'un salon'], {
        audioSrc: P45,
      }),
      qcm('Il y a un salon … (Victor Hugo)', 'rouge', ['rouge', 'rose'], { audioSrc: P45 }),
      qcm('À quel étage habite l’homme ? (studio)', 'Rez-de-chaussée', [
        'Rez-de-chaussée',
        '3e étage',
        '5e étage',
      ], { audioSrc: P46 }),
      qcm('Il habite dans … (studio sombre)', 'Un studio', [
        'Un studio',
        'Un appartement',
        'Une maison',
      ], { audioSrc: P46 }),
      qcm('Que cherche la femme ? (agence)', 'Un appartement', [
        'Un appartement',
        'Une maison',
        'Un studio',
      ], { audioSrc: P48 }),
      qcm('Comment doit être la cuisine ? (agence)', 'Une cuisine équipée', [
        'Une cuisine',
        'Une cuisine équipée',
        'Un salon',
      ], { audioSrc: P48 }),
      qcm('Qu’est-ce qu’elle préfère ? (agence, chien)', 'un appartement avec un jardin', [
        'un appartement à l’étage avec une terrasse',
        'un appartement avec un jardin',
        'un studio',
      ], { audioSrc: P48 }),
      qcm('La personne veut louer un appartement. (annonce journal)', 'Faux', ['Vrai', 'Faux'], {
        audioSrc: PROG,
      }),
      qcm('Le logement est ancien. (annonce journal)', 'Vrai', ['Vrai', 'Faux'], {
        audioSrc: PROG,
      }),
      qcm('Il y a deux salles de bains. (annonce journal)', 'Vrai', ['Vrai', 'Faux'], {
        audioSrc: PROG,
      }),
      qcm('La cuisine n’est pas équipée. (annonce journal)', 'Faux', ['Vrai', 'Faux'], {
        audioSrc: PROG,
      }),
      qcm('La maison fait 90 m².', 'Vrai', ['Vrai', 'Faux'], { audioSrc: PROG }),
      qcm('Il y a un lave-vaisselle. (annonce journal)', 'Faux', ['Vrai', 'Faux'], {
        audioSrc: PROG,
      }),
      qcm('Une famille avec trois enfants et un chien cherche …', 'Nice Corniche (jardin, 4 chambres)', [
        'Nice Mont Boron (1 chambre, terrasse)',
        'Nice Corniche (jardin, 4 chambres)',
        'Nice Saint-Pierre (studio)',
      ]),
      qcm('La salle de bains (colocation) est …', 'Commune', [
        'Petite',
        'Commune',
        'Individuelle',
      ]),
      qcm('C’est une annonce pour …', 'Une colocation', [
        'Une vente de maison',
        'Un achat de maison',
        'Une colocation',
      ]),
    ],
  ),
  lesson(
    'f5',
    'fill-conj',
    'Compléter c’est / il est / il y a',
    'Écoutez s’il y a un enregistrement, lisez, puis écrivez la réponse.',
    [
      fill('Comment est son logement ? (studio)', 'petit et sombre', { audioSrc: P46 }),
      fill('Il y a quoi dans son logement ? (studio)', 'une cuisine pas équipée', {
        audioSrc: P46,
      }),
      fill('Combien de personnes dans la famille ? (agence)', '4', { audioSrc: P48 }),
      fill('Combien de chambres elle veut ?', '3', { audioSrc: P48 }),
      fill('Prénom (message à Marion) : Alice. Ville : ___.', 'Toulon', { audioSrc: P47 }),
      fill('Adresse d’Alice : 10 place de la Liberté, code postal ___.', '83000', {
        audioSrc: P47,
      }),
      fill('Alice habite au ___ étage, dans un immeuble neuf.', 'quatrième', {
        audioSrc: P47,
      }),
      fill('Combien d’appartements a la Cité radieuse ?', '337'),
      fill('Quelle est l’adresse de la Cité radieuse ?', '280 boulevard Michelet à Marseille'),
      fill('L’architecte s’appelle comment ?', 'Le Corbusier'),
      fill('Est-ce que les appartements sont sombres ? (Cité radieuse)', 'Non, ils sont modernes et lumineux.'),
      fill('Est-ce que la cuisine est équipée ? (Cité radieuse)', 'Oui'),
      fill('Les balcons sont comment ?', 'de couleur'),
      fill('Où se trouve Nina ?', 'Dans le salon.'),
      fill('Avant quelle date Nina doit payer les factures ?', 'le 15 janvier'),
      fill('Est-ce que Malo a trois chambres ?', 'Oui'),
      fill('Combien il y a de personnes dans la maison ? (colocation)', '4'),
      fill('À qui il faut téléphoner ? (colocation)', 'Rosie'),
      fill('L’appartement (piste 228) est grand et ___.', 'lumineux', { audioSrc: P228 }),
      fill('Il y a une belle ___. (piste 228)', 'terrasse', { audioSrc: P228 }),
      fill('Aujourd’hui, les toilettes sont ___ .', 'bouchées', { audioSrc: P228 }),
      fill('Il y a une fuite d’eau dans la ___.', 'salle de bain', { audioSrc: P228 }),
    ],
  ),
  lesson(
    'f5',
    'ecrire',
    'Décrire un logement',
    'Écrivez un message de 30 à 40 mots, avec le verbe et le mot proposés.',
    [
      writeItem('habiter', 'adresse'),
      writeItem('chercher', 'appartement'),
      writeItem('louer', 'cuisine'),
      writeItem('demander', 'pièces'),
    ],
  ),
  lesson(
    'g2',
    'fill-conj',
    'Compléter le / la / l’ / les',
    'Complétez avec le, la, l’ ou les.',
    [
      fill('___ studios sont petits.', 'Les'),
      fill('___ salon de Manon est grand.', 'Le'),
      fill('Je n’aime pas ___ appartement de Giulia.', 'l’'),
      fill('Je préfère ___ maison de Peggy.', 'la'),
      fill('___ immeuble de Paul a 18 étages.', 'L’'),
      fill('En Suisse, ___ code postal a 4 chiffres.', 'le'),
      fill('___ rue de Léa est calme.', 'La'),
    ],
  ),
  lesson(
    'g1',
    'fill-conj',
    'Compléter un / une / des',
    'Complétez avec un, une ou des.',
    [
      fill('J’habite dans ___ studio.', 'un'),
      fill('Il habite dans ___ maison avec ___ jardin.', 'une / un'),
      fill('Je cherche ___ nouvel appartement avec ___ cuisine équipée.', 'un / une'),
      fill('À Sierre, il y a ___ appartements petits et sombres.', 'des'),
      fill('C’est ___ immeuble ancien.', 'un'),
      fill('À Saxon, il y a ___ quartiers très calmes.', 'des'),
    ],
  ),
  lesson(
    'i7',
    'fill-conj',
    'Remplacer par en ou y',
    'Répondez avec le pronom en.',
    [
      fill('Il y a un jardin ?', 'Oui, il y en a un.'),
      fill('Il y a des touristes dans la région ?', 'Oui, il y en a.'),
      fill('Vous avez une voiture ?', 'Non, je n’en ai pas. / Non, nous n’en avons pas.'),
      fill('Tu as un téléphone mobile ?', 'Oui, j’en ai un.'),
      fill('Elle a des enfants ?', 'Non, elle n’en a pas.'),
      fill('Ils prennent du thé ?', 'Oui, ils en prennent.'),
      fill('Vous avez des chaussures rouges ?', 'Oui, j’en ai. / Oui, nous en avons.'),
      fill('Tu mets des tomates dans la salade ?', 'Non, je n’en mets pas.'),
    ],
  ),
  lesson(
    'e1',
    'associer',
    'Associer l’objet à la pièce',
    'Associez chaque objet à une pièce de la maison.',
    [
      fill('Un évier → ___', 'une cuisine'),
      fill('Un lavabo → ___', 'une salle de bains'),
      fill('Un fauteuil → ___', 'un salon'),
      fill('Un lit → ___', 'une chambre'),
      fill('Un canapé → ___', 'un salon'),
      fill('Une douche → ___', 'une salle de bains'),
      fill('Un four → ___', 'une cuisine'),
    ],
  ),
]
