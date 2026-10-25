import type { GrammaireTheoryDoc } from '../types'

/** Théorie FALC — thème gram-pronoms. Français seul (pas de traductions). */
export const pronomsDocs: GrammaireTheoryDoc[] = [
  {
    id: 'i1',
    typeId: 'gram-i1-theorie',
    index: 1,
    title: 'Les pronoms relatifs',
    topic: 'gram-pronoms',
    public: 'A2',
    objectif: 'Relier deux idées avec qui, que, où…',
    blocks: [
    { kind: 'heading', text: 'Les pronoms relatifs' },
    { kind: 'paragraph', text: 'Je relie deux informations dans une phrase.' },
    {
      kind: 'section',
      role: 'regarder',
      blocks: [
        { kind: 'examples', items: ['L’homme qui parle est mon père.', 'Le livre que je lis est bien.', 'La ville où j’habite est calme.'] }
      ],
    },
    {
      kind: 'section',
      role: 'expliquer',
      blocks: [
        { kind: 'paragraph', text: 'Qui = sujet. Que = complément. Où = lieu ou temps.' },
        { kind: 'paragraph', text: 'Dont = de + nom (le livre dont je parle).' }
      ],
    },
    {
      kind: 'section',
      role: 'retenir',
      blocks: [
        { kind: 'paragraph', text: 'qui / que / où / dont.' },
        { kind: 'table', colHeader: true, rowHeader: true, headers: ['Pronom', 'Rôle', 'Exemple'], rows: [['qui', 'sujet', 'la femme qui chante'], ['que', 'COD', 'le film que je regarde'], ['où', 'lieu / temps', 'le jour où je suis né'], ['dont', 'de + nom', 'l’ami dont je parle']] },
        { kind: 'attention', text: 'Que → qu’ devant voyelle : l’homme qu’elle connaît.' }
      ],
    },
    ],
  },
  {
    id: 'i2',
    typeId: 'gram-i2-theorie',
    index: 2,
    title: 'Les pronoms possessifs',
    topic: 'gram-pronoms',
    public: 'A2',
    objectif: 'Remplacer mon / ton / son par le mien…',
    blocks: [
    { kind: 'heading', text: 'Les pronoms possessifs' },
    { kind: 'paragraph', text: 'Je remplace un nom déjà connu.' },
    {
      kind: 'section',
      role: 'regarder',
      blocks: [
        { kind: 'examples', items: ['Ce livre est le mien.', 'Cette voiture est la tienne.'] }
      ],
    },
    {
      kind: 'section',
      role: 'expliquer',
      blocks: [
        { kind: 'paragraph', text: 'Le mien, le tien, le sien, le nôtre, le vôtre, le leur (+ formes fém./plur.).' }
      ],
    },
    {
      kind: 'section',
      role: 'retenir',
      blocks: [
        { kind: 'paragraph', text: 'pronom possessif = article + mien / tien…' },
        { kind: 'table', colHeader: true, rowHeader: true, headers: ['', 'masc. sing.', 'fém. sing.'], rows: [['je', 'le mien', 'la mienne'], ['tu', 'le tien', 'la tienne'], ['il / elle', 'le sien', 'la sienne']] },
        { kind: 'attention', text: 'Garde l’article : le mien (pas mien seul).' }
      ],
    },
    ],
  },
  {
    id: 'i3',
    typeId: 'gram-i3-theorie',
    index: 3,
    title: 'Les pronoms démonstratifs',
    topic: 'gram-pronoms',
    public: 'A2',
    objectif: 'Utiliser celui, celle, ceux, celles.',
    blocks: [
    { kind: 'heading', text: 'Les pronoms démonstratifs' },
    { kind: 'paragraph', text: 'Je désigne une chose sans répéter le nom.' },
    {
      kind: 'section',
      role: 'regarder',
      blocks: [
        { kind: 'examples', items: ['Celui-ci est rouge.', 'Je préfère celle de Marie.'] }
      ],
    },
    {
      kind: 'section',
      role: 'expliquer',
      blocks: [
        { kind: 'paragraph', text: 'Celui / celle / ceux / celles.' },
        { kind: 'paragraph', text: 'Souvent + -ci / -là ou + de / qui / que.' }
      ],
    },
    {
      kind: 'section',
      role: 'retenir',
      blocks: [
        { kind: 'paragraph', text: 'celui-ci / celle-là…' },
        { kind: 'table', colHeader: true, rowHeader: true, headers: ['', 'singulier', 'pluriel'], rows: [['masculin', 'celui', 'ceux'], ['féminin', 'celle', 'celles']] },
        { kind: 'attention', text: 'Accorde avec le nom remplacé.' }
      ],
    },
    ],
  },
  {
    id: 'i4',
    typeId: 'gram-i4-theorie',
    index: 4,
    title: 'Les pronoms COD',
    topic: 'gram-pronoms',
    public: 'A1 / A2',
    objectif: 'Remplacer le complément d’objet direct.',
    blocks: [
    { kind: 'heading', text: 'Les pronoms COD' },
    { kind: 'paragraph', text: 'Je remplace un nom complément direct.' },
    {
      kind: 'section',
      role: 'regarder',
      blocks: [
        { kind: 'examples', items: ['Je regarde le film. → Je le regarde.', 'Tu aimes les pommes. → Tu les aimes.'] }
      ],
    },
    {
      kind: 'section',
      role: 'expliquer',
      blocks: [
        { kind: 'paragraph', text: 'me, te, le, la, nous, vous, les.' },
        { kind: 'paragraph', text: 'Le pronom se place avant le verbe.' }
      ],
    },
    {
      kind: 'section',
      role: 'retenir',
      blocks: [
        { kind: 'paragraph', text: 'COD avant le verbe.' },
        { kind: 'table', colHeader: true, rowHeader: true, headers: ['Pronom', 'Exemple'], rows: [['le / la / l’', 'Je le vois.'], ['les', 'Je les mange.'], ['me / te', 'Il me connaît.']] },
        { kind: 'astuce', text: 'Devant voyelle : le/la → l’.' }
      ],
    },
    ],
  },
  {
    id: 'i5',
    typeId: 'gram-i5-theorie',
    index: 5,
    title: 'Les pronoms COI',
    topic: 'gram-pronoms',
    public: 'A2',
    objectif: 'Remplacer le complément d’objet indirect.',
    blocks: [
    { kind: 'heading', text: 'Les pronoms COI' },
    { kind: 'paragraph', text: 'Je remplace à + personne.' },
    {
      kind: 'section',
      role: 'regarder',
      blocks: [
        { kind: 'examples', items: ['Je parle à Marie. → Je lui parle.', 'Il donne un livre à ses amis. → Il leur donne un livre.'] }
      ],
    },
    {
      kind: 'section',
      role: 'expliquer',
      blocks: [
        { kind: 'paragraph', text: 'me, te, lui, nous, vous, leur.' },
        { kind: 'paragraph', text: 'Lui = à lui / à elle. Leur = à eux / à elles.' }
      ],
    },
    {
      kind: 'section',
      role: 'retenir',
      blocks: [
        { kind: 'paragraph', text: 'COI avant le verbe. lui / leur sans à.' },
        { kind: 'table', colHeader: true, rowHeader: true, headers: ['Pronom', 'Remplace'], rows: [['lui', 'à lui / à elle'], ['leur', 'à eux / à elles']] },
        { kind: 'attention', text: 'Pas de s à leur pronom : je leur parle.' }
      ],
    },
    ],
  },
  {
    id: 'i6',
    typeId: 'gram-i6-theorie',
    index: 6,
    title: 'Les pronoms indéfinis',
    topic: 'gram-pronoms',
    public: 'A2',
    objectif: 'Utiliser quelqu’un, quelque chose, rien…',
    blocks: [
    { kind: 'heading', text: 'Les pronoms indéfinis' },
    { kind: 'paragraph', text: 'Je parle d’une personne ou d’une chose non précise.' },
    {
      kind: 'section',
      role: 'regarder',
      blocks: [
        { kind: 'examples', items: ['Quelqu’un frappe.', 'Je ne vois rien.'] }
      ],
    },
    {
      kind: 'section',
      role: 'expliquer',
      blocks: [
        { kind: 'paragraph', text: 'Quelqu’un / quelque chose / tout le monde / rien / personne…' },
        { kind: 'paragraph', text: 'Rien et personne vont avec ne.' }
      ],
    },
    {
      kind: 'section',
      role: 'retenir',
      blocks: [
        { kind: 'paragraph', text: 'personne / rien + ne.' },
        { kind: 'table', colHeader: true, rowHeader: true, headers: ['Pronom', 'Exemple'], rows: [['quelqu’un', 'Quelqu’un appelle.'], ['quelque chose', 'Je veux quelque chose.'], ['personne', 'Je ne vois personne.'], ['rien', 'Je n’ai rien.']] },
        { kind: 'attention', text: 'Personne n’est là (personne au début + n’).' }
      ],
    },
    ],
  },
  {
    id: 'i7',
    typeId: 'gram-i7-theorie',
    index: 7,
    title: 'En et y',
    topic: 'gram-pronoms',
    public: 'A2',
    objectif: 'Utiliser les pronoms en et y.',
    blocks: [
    { kind: 'heading', text: 'En et y' },
    { kind: 'paragraph', text: 'Je remplace de + chose (en) ou à / dans + lieu (y).' },
    {
      kind: 'section',
      role: 'regarder',
      blocks: [
        { kind: 'examples', items: ['Tu veux du pain ? — Oui, j’en veux.', 'Tu vas à l’école ? — Oui, j’y vais.'] }
      ],
    },
    {
      kind: 'section',
      role: 'expliquer',
      blocks: [
        { kind: 'paragraph', text: 'En remplace de + nom (quantité, partitif).' },
        { kind: 'paragraph', text: 'Y remplace à / en / dans + lieu (ou idée).' }
      ],
    },
    {
      kind: 'section',
      role: 'retenir',
      blocks: [
        { kind: 'paragraph', text: 'en = de. y = à / lieu.' },
        { kind: 'table', colHeader: true, rowHeader: true, headers: ['Pronom', 'Remplace', 'Exemple'], rows: [['en', 'de + chose', 'J’en mange.'], ['y', 'à / lieu', 'J’y vais.']] },
        { kind: 'attention', text: 'Place en / y avant le verbe : j’y vais.' }
      ],
    },
    ],
  },
  {
    id: 'i8',
    typeId: 'gram-i8-theorie',
    index: 8,
    title: 'Le pronom relatif dont',
    topic: 'gram-pronoms',
    public: 'A2',
    objectif: 'Utiliser dont pour remplacer de + nom.',
    blocks: [
      { kind: 'heading', text: 'Le pronom relatif dont' },
      { kind: 'paragraph', text: 'Je remplace de + nom avec dont.' },
      {
        kind: 'section',
        role: 'regarder',
        blocks: [
          { kind: 'examples', items: [
              'Le livre dont je parle est neuf.',
              'La femme dont le fils travaille ici.',
            ],
          }
        ],
      },
      {
        kind: 'section',
        role: 'expliquer',
        blocks: [
          { kind: 'paragraph', text: 'Dont = de + qui / de + que.' },
          { kind: 'paragraph', text: 'Après un verbe avec de : parler de, avoir besoin de…' },
          { kind: 'paragraph', text: 'Aussi pour la possession : dont le / la / les…' }
        ],
      },
      {
        kind: 'section',
        role: 'retenir',
        blocks: [
          { kind: 'paragraph', text: 'vois-tu un de ? → souvent dont.' },
          { kind: 'table', colHeader: true, rowHeader: true, headers: ['Sans dont', 'Avec dont'],
            rows: [
              ['Je parle de ce film.', 'le film dont je parle'],
              ['J’ai besoin de cette aide.', 'l’aide dont j’ai besoin'],
              ['Le fils de cette femme…', 'la femme dont le fils…'],
            ],
          },
          { kind: 'attention', text: 'Pas « de dont » : un seul dont.' }
        ],
      },
    ],
  },
  {
    id: 'i9',
    typeId: 'gram-i9-theorie',
    index: 9,
    title: 'Les pronoms relatifs composés',
    topic: 'gram-pronoms',
    public: 'B1',
    objectif: 'Utiliser lequel, laquelle, auxquels…',
    blocks: [
      { kind: 'heading', text: 'Les pronoms relatifs composés' },
      { kind: 'paragraph', text: 'Je relie deux idées après une préposition.' },
      {
        kind: 'section',
        role: 'regarder',
        blocks: [
          { kind: 'examples', items: [
              'La table sur laquelle j’écris.',
              'Les amis avec lesquels je sors.',
            ],
          }
        ],
      },
      {
        kind: 'section',
        role: 'expliquer',
        blocks: [
          { kind: 'paragraph', text: 'Lequel / laquelle / lesquels / lesquelles.' },
          { kind: 'paragraph', text: 'Avec à : auquel, à laquelle, auxquels, auxquelles.' },
          { kind: 'paragraph', text: 'Avec de : duquel, de laquelle, desquels, desquelles.' },
          { kind: 'paragraph', text: 'J’accorde avec le nom repris.' }
        ],
      },
      {
        kind: 'section',
        role: 'retenir',
        blocks: [
          { kind: 'paragraph', text: 'préposition + lequel (accordé).' },
          { kind: 'table', colHeader: true, rowHeader: true, headers: ['Forme', 'Exemple'],
            rows: [
              ['lequel', 'le stylo avec lequel…'],
              ['laquelle', 'la chaise sur laquelle…'],
              ['auquel', 'le projet auquel…'],
              ['desquels', 'les sujets desquels…'],
            ],
          },
          { kind: 'attention', text: 'Qui ne va pas après toutes les prépositions.' }
        ],
      },
    ],
  },
]
