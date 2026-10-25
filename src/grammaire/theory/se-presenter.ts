import { theoryGabarit } from '@/francais/grammar-theory'
import type { GrammaireTheoryDoc } from '../types'

/** Théorie FALC — thème gram-se-presenter. Français seul (pas de traductions). */
export const sePresenterDocs: GrammaireTheoryDoc[] = [
  {
    id: 'a1',
    typeId: 'gram-a1-theorie',
    index: 1,
    title: 'Qui suis-je ?',
    topic: 'gram-se-presenter',
    public: 'pré-A1 / A1',
    objectif: 'Me présenter avec être, habiter, parler, s’appeler.',
    blocks: [
    { kind: 'heading', text: 'Qui suis-je ?' },
    { kind: 'paragraph', text: '{ligne/4}' },
    { kind: 'paragraph', text: 'Pour me présenter, je donne des {g}informations simples{/g}.' },
	  { kind: 'paragraph', text: '{ligne/2}' },
    {
      kind: 'section',
      role: 'regarder',
      blocks: [
        { kind: 'examples', marker: 'puces', items: ['Je m’appelle Nina.', 'J’ai 17 ans.', 'Je suis belge.', 'Je viens de Belgique.', 'J’habite à Martigny.', 'Je parle français.'] },
      ],
    },
    {
      kind: 'section',
      role: 'expliquer',
      blocks: [
        { kind: 'paragraph', text: 'J’utilise les {c}verbes{/c} : être, habiter, parler, s’appeler. Un {c}verbe{/c}, c’est un mot d’{c}action{/c} ou d’{c}état{/c}.' },
      ],
    },
    {
      kind: 'section',
      role: 'retenir',
      blocks: [
        { kind: 'paragraph', text: 'J’utilise différents verbes pour décrire qui je suis.' },
        { kind: 'examples', marker: 'puces', items: ['S’appeler + {c}prénom{/c}', 'Avoir + {c}âge{/c}', 'Être + {c}nationalité{/c}', 'Venir de + {c}pays{/c}', 'Habiter à + {c}ville{/c}', 'Parler + {c}langue{/c}'] },
      ],
    },
  ],
  },
  {
    id: 'a2',
    typeId: 'gram-a2-theorie',
    index: 2,
    title: 'Pronoms sujet',
    topic: 'gram-se-presenter',
    public: 'pré-A1 / A1',
    objectif: 'Choisir le pronom sujet qui remplace une personne.',
    blocks: [
      { kind: 'heading', text: 'Pronoms sujet' },
      { kind: 'paragraph', text: '{ligne/4}' },
      { kind: 'paragraph', text: 'Un pronom sujet remplace une personne, un groupe de personnes ou un nom.' },
      { kind: 'paragraph', text: '{ligne/2}' },
      {
        kind: 'section',
        role: 'regarder',
        blocks: [
          { kind: 'examples', items: ['{tab:1>}{c}Ma fille{/c} s’appelle Alicia. | {c}Elle{/c} s’appelle Lisa.', '{tab:1>}{c}Paul et moi{/c} habitons à Sion | {c}Nous{/c} habitons à Sion.'] },
        ],
      },
      {
        kind: 'section',
        role: 'expliquer',
        blocks: [          
          { kind: 'paragraph', text: 'J’utilise {c}on{/c} pour représenter plusieurs personnes. Il est très utilisé à l’oral familier. Le verbe est {c}toujours au singulier.{/c}' },
          { kind: 'examples', marker: 'puces',items: ['{tab:1>}Nous | {c}On{/c} va au magasin.'] },
          { kind: 'paragraph', text: '{ligne/2}' },

          { kind: 'paragraph', text: 'J’utilise {c}tu{/c} pour parler à une personne que je connaîs, dans une situation familière.' },
          { kind: 'examples', marker: 'puces',items: ['{tab:1>}Alona ♀ | {c}Tu{/c} es là ?'] },
          { kind: 'paragraph', text: '{ligne/2}' },

          { kind: 'paragraph', text: 'J’utilise {c}vous{/c} quand on ne connaît pas la personne ou que le statut est différent (élève–professeur). On appelle cela la forme de {c}politesse{/c}.' },
          { kind: 'examples', marker: 'puces',items: ['{tab:1>}La professeure | Madame, {c}vous{/c} allez bien ?'] },
          { kind: 'paragraph', text: '{ligne/2}' },

          { kind: 'paragraph', text: 'J’utilise {c}ils{/c} quand il y a un groupe mixte de femmes et d’hommes. Même s’il y a beaucoup de femmes et un seul homme.' },
          { kind: 'examples', marker: 'puces',items: ['{tab:1>}Mes soeurs et mon frère | {c}Ils{/c} étudient à la bibliothèque.' ] },
          ],
      },
      { kind: 'page' },
      {
        kind: 'section',
        role: 'retenir',
        blocks: [
          { kind: 'paragraph', text: 'Je choisis le pronom selon la personne ou le groupe.' },
          { kind: 'paragraph', text: '{ligne/2}' },
          { kind: 'table', colHeader: true, rowHeader: false, headers: ['Singulier', 'Pluriel'], rows: [
            ['{c}je{/c}/n moi', '{c}nous{/c}/n moi et d’autres personnes'],
            ['{c}tu{/c}/n un ami', '{c}vous{/c}/n des personnes ou politesse'],
            ['{c}il{/c}/n un homme', '{c}ils{/c}/n des hommes ou un groupe d’hommes et de femmes'],
            ['{c}elle{/c}/n une femme', '{c}elles{/c}/n des femmes'],
          ] },
          { kind: 'paragraph', text: '{ligne/2}' },

          { kind: 'paragraph', text: 'Le pronom sujet se place {c}devant le verbe{/c}.' },
          { kind: 'paragraph', text: '{ligne/4}' },
          { kind: 'paragraph', text: 'Pour {c}trouver le sujet{/c} de la phrase :'},
          { kind: 'examples', marker: 'numeros', items: ['Je regarde le {c}verbe{/c}', 'Je pose la question : {c}Qui fait cela ?{/c} ou {c}Qui est comme ça ?{/c}.' ] },
        ],
      },
      
    ],
  },
  {
    id: 'a3',
    typeId: 'gram-a3-theorie',
    index: 3,
    title: 'Adjectifs de nationalité',
    topic: 'gram-se-presenter',
    public: 'A1',
    objectif: 'Accorder l’adjectif de nationalité.',
    blocks: [
    { kind: 'heading', text: 'Adjectifs de nationalité' },
    { kind: 'paragraph', text: '{ligne/4}' },
    { kind: 'paragraph', text: 'Je dis ma nationalité au masculin ou au féminin.' },
    {
      kind: 'section',
      role: 'regarder',
      blocks: [
        { kind: 'examples', items: [
          '{tab:1>}Paul est {c}allemand.{/c} | Susanne est {c}allemande.{/c}',
          '{tab:1>}Il est {c}français.{/c} | Elle est {c}française.{/c}',
          '{tab:1>}Il est {c}afghan.{/c} | Elle est {c}afghane.{/c}',
        ] }
      ],
    },
    {
      kind: 'section',
      role: 'expliquer',
      blocks: [
        { kind: 'paragraph', text: 'En général, pour former le féminin, je rajoute un {c}e{/c}.' },
        { kind: 'paragraph', text: '{ligne/4}' },
        { kind: 'paragraph', text: 'Si l’adjectif finit par {c}en{/c}, je double la consonne et je rajoute un {c}e{/c}.' },
        { kind: 'paragraph', text: '{ligne/4}' },
        { kind: 'paragraph', text: 'Si le masculin finit déjà par {c}e{/c}, le féminin {c}ne change pas{/c}.' },
        { kind: 'paragraph', text: '{ligne/2}' },
        { kind: 'table', colHeader: true, rowHeader: true, headers: ['Masculin', 'Féminin', 'Exemples'], 
          rows: [
            ['-ais', '-aise', '{tab:1>}japon{c}ais{/c} | japon{c}aise{/c}'], 
            ['-ois', '-oise', '{tab:1>}chin{c}ois{/c} | chin{c}oise{/c}'], 
            ['-ain', '-aine', '{tab:1>}améric{c}ain{/c} | améric{c}aine{/c}'], 
            ['-en', '-enne', '{tab:1>}itali{c}en{/c} | itali{c}enne{/c}'],
            ['-e', '-e', '{tab:1>}suiss{c}e{/c} | suiss{c}e{/c}']
          ] },
        { kind: 'paragraph', text: '{ligne/2}' },
        { kind: 'paragraph', text: '{c}Attention :{/c}' },
        { kind: 'paragraph', text: 'Les adjectifs terminant par {c}c{/c} change en {c}que{/c} ou {c}cque{/c}.' },
        { kind: 'examples', marker: 'puces', items: [
          '{tab:1>}tur{c}c{/c} | tur{c}que{/c}',
          '{tab:1>}gre{c}c{/c} | gre{c}cque{/c}',
        ] },
      ],
    },
    {kind: 'page'},
    {
      kind: 'section',
      role: 'retenir',
      blocks: [
        { kind: 'paragraph', text: 'Un adjectif de nationalité dit le pays d’une personne.' },
        { kind: 'paragraph', text: 'Souvent, j’ajoute un {c}e{/c} au féminin.' },
        { kind: 'examples', marker: 'puces', items: [
          '{tab:2}Masculin | | Féminin',
          '{tab:2}Il est {c}espognol{/c} | + {c}e{/c} | Elle est {c}belge{/c}',
          '{tab:2}Il est {c}ukrainien{/c} | + {c}ne{/c} | Elle est {c}ukrainienne{/c}',
          '{tab:2}Il est {c}russe{/c} | | Elle est {c}russe{/c}'
        ] },
      ],
    },
    ],
  },
  {
    id: 'a6',
    typeId: 'gram-a6-theorie',
    index: 6,
    title: 'Venir de : provenance',
    topic: 'gram-se-presenter',
    public: 'A1',
    objectif: 'Dire d’où je viens.',
    blocks: [
    { kind: 'heading', text: 'Venir de : provenance' },
    { kind: 'paragraph', text: 'Je dis ma provenance avec venir de.' },
    {
      kind: 'section',
      role: 'regarder',
      blocks: [
        { kind: 'examples', items: ['Je viens du Sénégal.', 'On vient de Chine.', 'Je viens de chez Sarah.'] }
      ],
    },
    {
      kind: 'section',
      role: 'expliquer',
      blocks: [
        { kind: 'paragraph', text: 'Venir de indique la provenance.' },
        { kind: 'paragraph', text: 'J’utilise du, de, d’, des, de la, de l’, de chez.' }
      ],
    },
    {
      kind: 'section',
      role: 'retenir',
      blocks: [
        { kind: 'paragraph', text: 'aller = où je vais. Venir de = d’où je viens.' },
        { kind: 'table', colHeader: true, rowHeader: true, headers: ['Lieu', 'Forme', 'Exemple'], rows: [['pays masc. + consonne', 'du', 'Je viens du Sénégal.'], ['voyelle', 'd’', 'Tu viens d’Irak.'], ['pays féminin', 'de', 'On vient de Chine.'], ['pluriel', 'des', 'Nous venons des Pays-Bas.'], ['personne', 'de chez', 'Je viens de chez le médecin.']] },
        { kind: 'attention', text: 'Ne mélange pas aller et venir de.' }
      ],
    },
    ],
  },
  {
    id: 'a7',
    typeId: 'gram-a7-theorie',
    index: 7,
    title: 'Dire son âge',
    topic: 'gram-se-presenter',
    public: 'pré-A1 / A1',
    objectif: 'Dire mon âge avec avoir + ans.',
    blocks: [
    { kind: 'heading', text: 'Dire son âge' },
    { kind: 'paragraph', text: 'Je dis mon âge avec le verbe avoir.' },
    {
      kind: 'section',
      role: 'regarder',
      blocks: [
        { kind: 'examples', items: ['Quel âge as-tu ?', 'J’ai 25 ans.'] }
      ],
    },
    {
      kind: 'section',
      role: 'expliquer',
      blocks: [
        { kind: 'paragraph', text: 'En français, j’utilise avoir + nombre + an(s).' },
        { kind: 'paragraph', text: 'Je ne dis pas « je suis 25 ans ».' }
      ],
    },
    {
      kind: 'section',
      role: 'retenir',
      blocks: [
        { kind: 'paragraph', text: 'âge = avoir + nombre + an(s).' },
        { kind: 'table', colHeader: true, rowHeader: true, headers: ['Personne', 'Forme', 'Exemple'], rows: [['je', 'j’ai', 'J’ai 15 ans.'], ['tu', 'tu as', 'Tu as 12 ans.'], ['il / elle / on', 'a', 'Elle a 45 ans.'], ['nous', 'avons', 'Nous avons 27 ans.'], ['vous', 'avez', 'Vous avez 50 ans.'], ['ils / elles', 'ont', 'Ils ont 20 ans.']] },
        { kind: 'attention', text: 'Un an → an. Plusieurs années → ans.' }
      ],
    },
    ],
  },
  {
    id: 'famille',
    typeId: 'gram-famille-theorie',
    index: 10,
    title: 'Famille',
    topic: 'gram-se-presenter',
    public: 'pré-A1 / A1',
    objectif: 'À compléter.',
    blocks: theoryGabarit('Famille'),
  },
]
