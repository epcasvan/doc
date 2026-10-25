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
    title: 'Les pronoms sujets',
    topic: 'gram-se-presenter',
    public: 'pré-A1 / A1',
    objectif: 'Choisir le pronom sujet qui remplace une personne.',
    blocks: [
      { kind: 'heading', text: 'Les pronoms sujets' },
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
          { kind: 'paragraph', text: 'Le pronom sujet se place {c}devant le verbe{/c}.' },
          { kind: 'paragraph', text: 'Il évite de répéter un nom.' },
          { kind: 'table', colHeader: true, rowHeader: true, headers: ['Singulier', 'Pluriel'], rows: [
            ['{c}je{/c}/n moi', '{c}nous{/c}/n moi et d’autres personnes'],
            ['{c}tu{/c}/n un ami', '{c}vous{/c}/n des personnes ou politesse'],
            ['{c}il{/c}/n un homme', '{c}ils{/c}/n des hommes ou un groupe d’hommes et de femmes'],
            ['{c}elle{/c}/n une femme', '{c}elles{/c}/n des femmes'],
          ] },
        ],
      },
      { kind: 'page' },
      {
        kind: 'section',
        role: 'retenir',
        blocks: [
          { kind: 'paragraph', text: 'Je choisis le pronom selon la personne ou le groupe.' },
          { kind: 'paragraph', text: 'J’utilise {c}on{/c} pour représenter plusieurs personnes (= {c}nous{c}). Il est très utilisé à l’oral familier. Le verbe est toujours au singulier.' },
          { kind: 'examples', marker: 'puces',items: ['{tab:1>}Nous | {c}On{/c} va au magasin.', '{tab:1>}Les gens | En Suisse | {c}on{/c} parle français.'] },
          { kind: 'paragraph', text: '{ligne/2}' },

          { kind: 'paragraph', text: 'J’utilise {c}tu{/c} pour parler à une personne qu’on connaît, dans une situation familière.' },
          { kind: 'examples', marker: 'puces',items: ['{tab:1>}Un ami | {c}Tu{/c} veux venir avec nous?', '{tab:1>}Mon frère | {c}Tu{/c} es là?'] },
          { kind: 'paragraph', text: '{ligne/2}' },

          { kind: 'paragraph', text: 'J’utilise {c}vous{/c} quand on ne connaît pas la personne ou que le statut est différent (élève–professeur). On appelle cela la forme de {c}politesse{/c}.' },
          { kind: 'examples', marker: 'puces',items: ['{tab:1>}La professeure | Madame | {c}vous{/c} allez bien ?'] },
          { kind: 'paragraph', text: '{ligne/2}' },

          { kind: 'paragraph', text: 'J’utilise {c}ils{/c} quand il y a un groupe mixte de femmes et d’hommes. Même s’il y a beaucoup de femmes et un seul homme.' },
          { kind: 'examples', marker: 'puces',items: ['{tab:1>}Ali ♂ et Alona ♀ | {c}Ils{/c} vont au cinéma.', '{tab:1>}Mes soeurs et mon frère | {c}Ils{/c} étudient à la bibliothèque.' ] },
          { kind: 'paragraph', text: '{ligne/2}' },
          ],
      },
      
    ],
  },
  {
    id: 'a3',
    typeId: 'gram-a3-theorie',
    index: 3,
    title: 'Les adjectifs de nationalité',
    topic: 'gram-se-presenter',
    public: 'A1',
    objectif: 'Accorder l’adjectif de nationalité.',
    blocks: [
    { kind: 'heading', text: 'Les adjectifs de nationalité' },
    { kind: 'paragraph', text: 'Je dis ma nationalité au masculin ou au féminin.' },
    {
      kind: 'section',
      role: 'regarder',
      blocks: [
        { kind: 'examples', items: ['Paul est allemand.', 'Susanne est allemande.'] }
      ],
    },
    {
      kind: 'section',
      role: 'expliquer',
      blocks: [
        { kind: 'paragraph', text: 'Un adjectif de nationalité dit le pays d’une personne.' },
        { kind: 'paragraph', text: 'Souvent, j’ajoute un e au féminin.' },
        { kind: 'paragraph', text: 'Si le masculin finit déjà par e, le féminin ne change pas.' },
        { kind: 'paragraph', text: 'Exemple : belge, suisse, russe.' }
      ],
    },
    {
      kind: 'section',
      role: 'retenir',
      blocks: [
        { kind: 'paragraph', text: 'féminin souvent + e. Masculin en -e → même forme.' },
        { kind: 'table', colHeader: true, rowHeader: true, headers: ['Masculin', 'Féminin', 'Exemples'], rows: [['-ais', '-aise', 'français / française'], ['-ois', '-oise', 'chinois / chinoise'], ['-ain', '-aine', 'américain / américaine'], ['-en', '-enne', 'italien / italienne']] },
        { kind: 'attention', text: 'turc → turque ; grec → grecque. Pays en -e souvent féminins, sauf Mexique, Cambodge, Mozambique, Zimbabwe.' }
      ],
    },
    ],
  },
  {
    id: 'a4',
    typeId: 'gram-a4-theorie',
    index: 4,
    title: 'Aller : destination (pays et villes)',
    topic: 'gram-se-presenter',
    public: 'A1',
    objectif: 'Dire où je vais (pays, continent, ville).',
    blocks: [
    { kind: 'heading', text: 'Aller : destination (pays et villes)' },
    { kind: 'paragraph', text: 'Je dis ma destination avec le verbe aller.' },
    {
      kind: 'section',
      role: 'regarder',
      blocks: [
        { kind: 'examples', items: ['Je vais au Sénégal.', 'Elle va en Chine.', 'Ils vont à Sion.'] }
      ],
    },
    {
      kind: 'section',
      role: 'expliquer',
      blocks: [
        { kind: 'paragraph', text: 'Le verbe aller indique la destination.' },
        { kind: 'paragraph', text: 'Pays masculin + consonne → au.' },
        { kind: 'paragraph', text: 'Pays masculin + voyelle → en.' },
        { kind: 'paragraph', text: 'Pays féminin → en. Pays pluriel → aux.' },
        { kind: 'paragraph', text: 'Continent → en. Ville → à.' }
      ],
    },
    {
      kind: 'section',
      role: 'retenir',
      blocks: [
        { kind: 'paragraph', text: 'aller = destination. au / en / aux / à selon le lieu.' },
        { kind: 'table', colHeader: true, rowHeader: true, headers: ['Lieu', 'Forme', 'Exemple'], rows: [['pays masc. + consonne', 'au', 'Je vais au Sénégal.'], ['pays masc. + voyelle', 'en', 'Tu vas en Irak.'], ['pays féminin', 'en', 'Elle va en Chine.'], ['pays pluriel', 'aux', 'Nous allons aux Pays-Bas.'], ['continent', 'en', 'Vous allez en Europe.'], ['ville', 'à', 'Ils vont à Sion.']] },
        { kind: 'attention', text: 'Ne confonds pas au et en.' }
      ],
    },
    ],
  },
  {
    id: 'a5',
    typeId: 'gram-a5-theorie',
    index: 5,
    title: 'Aller : destination (lieux et chez)',
    topic: 'gram-se-presenter',
    public: 'A1',
    objectif: 'Dire où je vais (lieux, chez quelqu’un).',
    blocks: [
    { kind: 'heading', text: 'Aller : lieux et chez' },
    { kind: 'paragraph', text: 'Je vais à un lieu. Je vais chez une personne.' },
    {
      kind: 'section',
      role: 'regarder',
      blocks: [
        { kind: 'examples', items: ['Je vais chez Sarah.', 'Elle va à la poste.', 'Ils vont au magasin.'] }
      ],
    },
    {
      kind: 'section',
      role: 'expliquer',
      blocks: [
        { kind: 'paragraph', text: 'Chez + personne.' },
        { kind: 'paragraph', text: 'Lieu féminin → à la. Voyelle ou h → à l’.' },
        { kind: 'paragraph', text: 'Lieu masculin + consonne → au. Pluriel → aux.' }
      ],
    },
    {
      kind: 'section',
      role: 'retenir',
      blocks: [
        { kind: 'paragraph', text: 'chez = personne. à la / à l’ / au / aux = lieu.' },
        { kind: 'table', colHeader: true, rowHeader: true, headers: ['Cas', 'Forme', 'Exemple'], rows: [['personne', 'chez', 'Je vais chez Sarah.'], ['lieu féminin', 'à la', 'Elle va à la poste.'], ['voyelle / h', 'à l’', 'Nous allons à l’école.'], ['lieu masculin', 'au', 'Ils vont au magasin.'], ['pluriel', 'aux', 'Je vais aux Îles.']] },
        { kind: 'attention', text: 'École est féminin → à l’école.' }
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
    id: 'a8',
    typeId: 'gram-a8-theorie',
    index: 8,
    title: 'La négation ne … pas',
    topic: 'gram-se-presenter',
    public: 'A1',
    objectif: 'Former une phrase négative avec ne … pas.',
    blocks: [
    { kind: 'heading', text: 'La négation ne … pas' },
    { kind: 'paragraph', text: 'Je mets ne et pas autour du verbe.' },
    {
      kind: 'section',
      role: 'regarder',
      blocks: [
        { kind: 'examples', items: [{ text: 'Je ne suis pas italien.', wrong: 'Je suis pas italien (à l’écrit)' }] }
      ],
    },
    {
      kind: 'section',
      role: 'expliquer',
      blocks: [
        { kind: 'paragraph', text: 'Ne et pas forment la négation.' },
        { kind: 'paragraph', text: 'Ils se placent autour du verbe.' },
        { kind: 'paragraph', text: 'Temps composé : ne + auxiliaire + pas + participe.' }
      ],
    },
    {
      kind: 'section',
      role: 'retenir',
      blocks: [
        { kind: 'paragraph', text: 'négation de base = ne … pas autour du verbe.' },
        { kind: 'table', colHeader: true, rowHeader: true, headers: ['Cas', 'Forme', 'Exemple'], rows: [['présent', 'ne + verbe + pas', 'Je ne suis pas italien.'], ['composé', 'ne + auxiliaire + pas + participe', 'Je n’ai pas compris.'], ['infinitif', 'ne pas + verbe', 'Ne pas fumer.'], ['impératif', 'ne + verbe + pas', 'Ne fumez pas !']] },
        { kind: 'astuce', text: 'Devant une voyelle : ne → n’.' }
      ],
    },
    ],
  },
  {
    id: 'a9',
    typeId: 'gram-a9-theorie',
    index: 9,
    title: 'Autres négations',
    topic: 'gram-se-presenter',
    public: 'A1 / A2',
    objectif: 'Utiliser jamais, plus, rien, personne…',
    blocks: [
    { kind: 'heading', text: 'Autres négations' },
    { kind: 'paragraph', text: 'Je choisis la bonne négation selon le sens.' },
    {
      kind: 'section',
      role: 'regarder',
      blocks: [
        { kind: 'examples', items: ['Je n’ai jamais gagné.', 'Je n’ai plus d’argent.'] }
      ],
    },
    {
      kind: 'section',
      role: 'expliquer',
      blocks: [
        { kind: 'paragraph', text: 'Certaines négations remplacent pas.' },
        { kind: 'paragraph', text: 'Ne … jamais = aucune fois.' },
        { kind: 'paragraph', text: 'Ne … plus = avant oui, maintenant non.' },
        { kind: 'paragraph', text: 'Après sans, le déterminant disparaît.' }
      ],
    },
    {
      kind: 'section',
      role: 'retenir',
      blocks: [
        { kind: 'paragraph', text: 'une idée négative = une négation adaptée.' },
        { kind: 'table', colHeader: true, rowHeader: true, headers: ['Affirmatif', 'Négatif'], rows: [['déjà / toujours', 'ne … jamais / ne … pas encore'], ['encore', 'ne … plus'], ['tout', 'ne … rien'], ['quelqu’un', 'ne … personne'], ['quelques', 'ne … aucun(e)'], ['avec', 'sans']] },
        { kind: 'attention', text: 'Réponse à une négation : Si = oui malgré le non.' }
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
