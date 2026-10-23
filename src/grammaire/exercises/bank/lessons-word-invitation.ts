/** Exercices CSC leçon 03 Invitation-1 à Invitation-3 — sans la théorie. */
import { fill, lesson, qcm, writeItem } from './helpers'
import type { GramLesson } from '../types'

const A3022 = '/lib/audio/grammaire/invitation/lecon-03-03-02-audio-2.mp3'
const A3023 = '/lib/audio/grammaire/invitation/lecon-03-03-02-audio-3.mp3'
const A3024 = '/lib/audio/grammaire/invitation/lecon-03-03-02-audio-4.mp3'
const A3031 = '/lib/audio/grammaire/invitation/lecon-03-03-03-audio-1.mp3'
const A3032 = '/lib/audio/grammaire/invitation/lecon-03-03-03-audio-2.mp3'

export const GRAM_LESSONS_WORD_INVITATION: GramLesson[] = [
  lesson(
    'f3',
    'qcm-verbe',
    'Accepter ou refuser',
    'Écoutez s’il y a un enregistrement, lisez, puis choisissez la bonne réponse.',
    [
      qcm('On parle d’un apéro. (fête des voisins)', 'Faux', ['Vrai', 'Faux'], {
        audioSrc: A3022,
      }),
      qcm('C’est pour les amis. (fête des voisins)', 'Faux', ['Vrai', 'Faux'], {
        audioSrc: A3022,
      }),
      qcm('C’est en France. (fête des voisins)', 'Vrai', ['Vrai', 'Faux'], {
        audioSrc: A3022,
      }),
      qcm('C’est organisé le vendredi. (fête des voisins)', 'Vrai', ['Vrai', 'Faux'], {
        audioSrc: A3022,
      }),
      qcm('La date est le 28 mai. (fête des voisins)', 'Faux', ['Vrai', 'Faux'], {
        audioSrc: A3022,
      }),
      qcm('Les voisins apportent des plats froids.', 'Vrai', ['Vrai', 'Faux'], {
        audioSrc: A3022,
      }),
      qcm('Roxane apporte quelque chose pour …', 'un pique-nique', [
        'un pique-nique',
        'un buffet',
      ], { audioSrc: A3023 }),
      qcm('Tim a besoin de serviettes et …', 'd’assiettes', [
        'd’assiettes',
        'de verres',
      ], { audioSrc: A3023 }),
      qcm('Roxane apporte …', 'des chips', ['des chips', 'des couverts'], {
        audioSrc: A3023,
      }),
      qcm('Elle apporte aussi …', 'des boissons', ['des boissons', 'des verres'], {
        audioSrc: A3023,
      }),
      qcm('Tim prépare …', 'une salade', ['une salade', 'une salade de fruits'], {
        audioSrc: A3023,
      }),
      qcm('Rémi prépare …', 'une pizza', ['une pizza', 'une quiche'], {
        audioSrc: A3023,
      }),
      qcm('La femme… (Nicolas, 14 octobre)', 'Invite des amis', [
        'Invite des amis',
        'Accepte une invitation',
        'Refuse une invitation',
      ], { audioSrc: A3024 }),
      qcm('La date est … (Nicolas)', 'Le 14 octobre', [
        'Le 14 septembre',
        'Le 14 octobre',
        'Le 24 octobre',
      ], { audioSrc: A3024 }),
      qcm('C’est une fête … (Nicolas)', 'd’anniversaire', [
        'd’anniversaire',
        'des voisins',
        'de mariage',
      ], { audioSrc: A3024 }),
      qcm('Les personnes invitées sont … (Nicolas)', 'Les amis', [
        'Les amis',
        'Les amis et les voisins',
        'Les amis et la famille',
      ], { audioSrc: A3024 }),
      qcm('La fête commence … (Nicolas)', 'À 19 h 30', [
        'À 16 h 30',
        'À 19 heures',
        'À 19 h 30',
      ], { audioSrc: A3024 }),
      qcm('C’est un message pour … (courriel Tania)', 'Zoé', ['Zoé', 'Tania', 'Nat']),
      qcm('Le courriel de Tania, c’est pour …', 'Refuser une invitation', [
        'Inviter des amis',
        'Accepter une invitation',
        'Refuser une invitation',
      ]),
      qcm('Le mariage est organisé le … (courriel Tania)', 'samedi 15 août', [
        'samedi 15 août',
        'dimanche 16 août',
      ]),
      qcm('C’est le mariage de … (courriel Tania)', 'Nat', ['Tania', 'Nat', 'Zoé']),
      qcm('Le document de Mélanie est une publicité.', 'Faux', ['Vrai', 'Faux']),
      qcm('C’est pour un anniversaire. (Mélanie)', 'Vrai', ['Vrai', 'Faux']),
      qcm('Mélanie a 23 ans.', 'Vrai', ['Vrai', 'Faux']),
      qcm('La fête de Mélanie commence à 14 heures.', 'Faux', ['Vrai', 'Faux']),
      qcm('La fête de Mélanie est organisée à Paris.', 'Faux', ['Vrai', 'Faux']),
      qcm('On donne la réponse par téléphone. (Mélanie)', 'Vrai', ['Vrai', 'Faux']),
      qcm('On fait un pique-nique … (texte)', 'le week-end ou en vacances', [
        'le week-end',
        'le week-end ou en vacances',
      ]),
      qcm('On utilise ___ en papier. (pique-nique)', 'des serviettes', [
        'des serviettes',
        'des verres',
      ]),
      qcm('Pour manger, on prépare ___ (pique-nique)', 'une quiche', [
        'une quiche',
        'des chips',
      ]),
      qcm('On apporte aussi des … (pique-nique)', 'desserts et boissons', [
        'desserts et boissons',
        'dessert ou boissons',
      ]),
      qcm('On invite ___ (pique-nique)', 'les amis des enfants', [
        'les voisins',
        'les amis des enfants',
      ]),
      qcm('L’invitation de Maud est pour quel jour ?', 'Jeudi', [
        'Vendredi',
        'Jeudi',
        'Mercredi',
      ], { audioSrc: A3031 }),
      qcm('Maud organise …', 'Un apéro', [
        'Un pique-nique',
        'Un apéro',
        'Un anniversaire',
      ], { audioSrc: A3031 }),
      qcm('C’est pour qui ? (Maud)', 'Des amis', [
        'Des amis',
        'Des parents',
        'Des voisins',
      ], { audioSrc: A3031 }),
      qcm('Christelle et Laurane sont …', 'Les amies de Maud', [
        'Les amies de Maud',
        'Les amies de Marc',
      ], { audioSrc: A3031 }),
      qcm('Marc est libre …', 'Le vendredi', [
        'Le mercredi',
        'Le jeudi',
        'Le vendredi',
      ], { audioSrc: A3031 }),
      qcm('La fête est quel jour ? (Angela, pizza)', 'dimanche', [
        'dimanche',
        'samedi',
        'vendredi',
      ], { audioSrc: A3032 }),
      qcm('On commence la fête à quelle heure ? (Angela)', '20 h', [
        '20 h',
        '19 h',
        '18 h',
      ], { audioSrc: A3032 }),
    ],
  ),
  lesson(
    'f3',
    'ecrire',
    'Écrire une invitation ou une réponse',
    'Écrivez un message d’invitation ou de réponse, avec le verbe et le mot proposés.',
    [
      writeItem('inviter', 'apéro'),
      writeItem('apporter', 'dessert'),
      writeItem('organiser', 'pique-nique'),
      writeItem('refuser', 'dimanche'),
      writeItem('accepter', 'vendredi'),
      writeItem('proposer', 'samedi'),
    ],
  ),
  lesson(
    'f3',
    'fill-conj',
    'Compléter d’après l’invitation',
    'Écoutez s’il y a un enregistrement, lisez, puis écrivez la réponse.',
    [
      fill('La fête des voisins est le ___ 29 mai.', 'vendredi', { audioSrc: A3022 }),
      fill('La date de la fête des voisins n’est pas le 28 mai, c’est le ___.', '29 mai', {
        audioSrc: A3022,
      }),
      fill('Tim a besoin de serviettes et d’___.', 'assiettes', { audioSrc: A3023 }),
      fill('Roxane apporte des chips et des ___.', 'boissons', { audioSrc: A3023 }),
      fill('Tim prépare une ___. Rémi prépare une ___.', 'salade / pizza', {
        audioSrc: A3023,
      }),
      fill('La fête d’anniversaire de Nicolas est le dimanche ___.', '14 octobre', {
        audioSrc: A3024,
      }),
      fill('La fête de Nicolas commence à ___.', '19 h 30', { audioSrc: A3024 }),
      fill('C’est un message pour ___. (courriel Tania)', 'Zoé'),
      fill('Qui fête son anniversaire ? (courriel Tania)', 'Zoé'),
      fill('La fête d’anniversaire est organisée quel jour ? (Tania)', 'dimanche'),
      fill('Le mariage est organisé le ___.', 'samedi 15 août'),
      fill('C’est le mariage de ___.', 'Nat'),
      fill('Qui écrit le courriel ?', 'Tania'),
      fill('Mélanie fête ses ___ ans.', '23'),
      fill('La fête de Mélanie est le samedi 14 juillet à ___.', '18 h'),
      fill('La fête de Mélanie est à ___, 47 rue Hérold.', 'Nice'),
      fill('Maud invite Marc le ___.', 'jeudi', { audioSrc: A3031 }),
      fill('Maud organise un ___ chez elle.', 'apéro', { audioSrc: A3031 }),
      fill('Christelle et Laurane sont les amies de ___.', 'Maud', { audioSrc: A3031 }),
      fill('Marc n’est pas libre jeudi. Il est libre ___.', 'vendredi', { audioSrc: A3031 }),
      fill('La fête (Angela) est ___.', 'dimanche', { audioSrc: A3032 }),
      fill('On commence la fête à ___.', '20 h', { audioSrc: A3032 }),
      fill('Angela apporte une ___.', 'salade de fruits', { audioSrc: A3032 }),
      fill('On prépare une ___. (fête dimanche)', 'pizza', { audioSrc: A3032 }),
    ],
  ),
  lesson(
    'e2',
    'qcm-verbe',
    'Dire le moment',
    'Écoutez s’il y a un enregistrement, lisez, puis choisissez la bonne réponse.',
    [
      qcm('Nous vous invitons ___ 28.', 'mardi', ['mardi', 'mai']),
      qcm('La fête commence à 20 ___.', 'heures', ['heures', 'jours']),
      qcm('Je ne travaille pas ___.', 'samedi', ['samedi', 'l’heure']),
      qcm('Le 1er ___, c’est la Fête nationale.', 'août', ['août', 'vendredi']),
      qcm('On commence à quelle ___ ?', 'heure', ['heure', 'jour']),
      qcm('Vous êtes libres à ___ ?', '9 heures', ['9 heures', 'dimanche']),
      qcm('La date de la fête des voisins est le …', '29 mai', [
        '29 mai',
        '28 mai',
        '29 juin',
      ], { audioSrc: A3022 }),
      qcm('La fête de Nicolas est le …', '14 octobre', [
        '14 octobre',
        '14 septembre',
        '24 octobre',
      ], { audioSrc: A3024 }),
      qcm('La fête de Nicolas commence à …', '19 h 30', [
        '19 h 30',
        '16 h 30',
        '19 h',
      ], { audioSrc: A3024 }),
      qcm('La fête de Mélanie commence à …', '18 h', ['18 h', '14 h', '20 h']),
    ],
  ),
  lesson(
    'e2',
    'fill-conj',
    'Compléter l’heure ou la date',
    'Écoutez s’il y a un enregistrement, puis écrivez l’heure, le jour ou la date.',
    [
      fill('Nous vous invitons ___ 28.', 'mardi'),
      fill('La fête commence à 20 ___.', 'heures'),
      fill('Je ne travaille pas ___.', 'samedi'),
      fill('Le 1er ___, c’est la Fête nationale.', 'août'),
      fill('On commence à quelle ___ ?', 'heure'),
      fill('Vous êtes libres à ___ ?', '9 heures'),
      fill('C’est à ___ heures. (dialogue invitation)', '19'),
      fill('La fête des voisins est le vendredi ___.', '29 mai', { audioSrc: A3022 }),
      fill('La fête d’anniversaire (Nicolas) commence à ___.', '19 h 30', {
        audioSrc: A3024,
      }),
      fill('Mélanie invite le samedi 14 juillet à ___.', '18 h'),
      fill('Marc n’est pas libre ___. Il peut venir ___.', 'jeudi / vendredi', {
        audioSrc: A3031,
      }),
      fill('On commence la fête (Angela) à ___.', '20 h', { audioSrc: A3032 }),
    ],
  ),
  lesson(
    'er',
    'fill-conj',
    'Conjuguer le verbe en -er',
    'Conjuguez le verbe entre parenthèses au présent.',
    [
      fill('Tous les matins, je ___ (préparer) mon sac.', 'prépare'),
      fill('Tu n’___ jamais en avance à l’école. (arriver)', 'arrives'),
      fill('Elle ___ (porter) une casquette rouge.', 'porte'),
      fill('Nous ___ (organiser) les classeurs violets.', 'organisons'),
      fill('Vous ___ (travailler) dans une entreprise ?', 'travaillez'),
      fill('Ils ___ (parler) des devoirs avec mes amis.', 'parlent'),
      fill('Tu ___ (regarder) les images sur la feuille.', 'regardes'),
      fill('Nous ___ (apporter) les desserts demain.', 'apportons'),
      fill('Elles ___ (ranger) les documents.', 'rangent'),
    ],
  ),
  lesson(
    'er',
    'associer',
    'Associer le sujet et le verbe',
    'Associez chaque sujet au verbe qui convient.',
    [
      fill('Je → ___', 'partage ma pizza.'),
      fill('Nos amis → ___', 'mangent avec nous ce soir.'),
      fill('Ma voisine → ___', 'apporte une quiche.'),
      fill('Tu → ___', 'invites ta sœur à la fête ?'),
      fill('Vous → ___', 'organisez un apéro ?'),
      fill('Nous → ___', 'travaillons le week-end.'),
    ],
  ),
  lesson(
    'f2',
    'fill-conj',
    'Conjuguer pouvoir, devoir, vouloir',
    'Conjuguez le verbe entre parenthèses.',
    [
      fill('Je ne ___ pas (pouvoir) jeudi. (Marc)', 'peux', { audioSrc: A3031 }),
      fill('Vendredi, tu ___ (pouvoir) venir ?', 'peux', { audioSrc: A3031 }),
      fill('Ah oui, vendredi, je ___ (pouvoir) venir volontiers.', 'peux', {
        audioSrc: A3031,
      }),
      fill('Désolé(e), je ne ___ pas samedi. (pouvoir)', 'peux'),
      fill('Ma femme ne ___ pas. (pouvoir)', 'peut'),
      fill('Vous ___ (pouvoir) venir ?', 'pouvez'),
    ],
  ),
]
