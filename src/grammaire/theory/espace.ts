import type { GrammaireTheoryDoc } from '../types'

/** Théorie FALC — thème gram-espace. Français seul (pas de traductions). */
export const espaceDocs: GrammaireTheoryDoc[] = [
  {
    id: 'e1',
    typeId: 'gram-e1-theorie',
    index: 1,
    title: 'Les prépositions de lieu',
    topic: 'gram-espace',
    public: 'A1',
    objectif: 'Situer une personne ou une chose.',
    blocks: [
    { kind: 'heading', text: 'Les prépositions de lieu' },
    { kind: 'paragraph', text: 'Je dis où se trouve une personne ou une chose.' },
    {
      kind: 'section',
      role: 'regarder',
      blocks: [
        { kind: 'examples', items: ['Le livre est sur la table.', 'Je suis à côté de toi.'] }
      ],
    },
    {
      kind: 'section',
      role: 'expliquer',
      blocks: [
        { kind: 'paragraph', text: 'Une préposition de lieu indique la place.' },
        { kind: 'paragraph', text: 'Mots utiles : sur, sous, dans, devant, derrière, entre, près de, loin de, à côté de, au milieu de, au-dessus de, au-dessous de, vers.' }
      ],
    },
    {
      kind: 'section',
      role: 'retenir',
      blocks: [
        { kind: 'paragraph', text: 'un lieu = une préposition claire.' },
        { kind: 'examples', marker: 'puces', label: 'Prépositions courantes', items: ['sur', 'sous', 'dans', 'devant', 'derrière', 'entre', 'près de', 'loin de', 'à côté de', 'au milieu de', 'vers'] },
        { kind: 'attention', text: 'Près de / loin de / à côté de : garde de.' }
      ],
    },
    ],
  },
  {
    id: 'e6',
    typeId: 'gram-e6-theorie',
    index: 2,
    title: 'Autres prépositions et adverbes de lieu',
    topic: 'gram-espace',
    public: 'A1',
    objectif: 'Situer avec ici, là, devant, près de…',
    blocks: [
      { kind: 'heading', text: 'Autres prépositions et adverbes de lieu' },
      { kind: 'paragraph', text: 'Je précise un lieu avec des mots simples.' },
      {
        kind: 'section',
        role: 'regarder',
        blocks: [
          { kind: 'examples', items: [
              'Je suis là.',
              'La voiture est devant la maison.',
              'Tournez à droite.',
            ],
          }
        ],
      },
      {
        kind: 'section',
        role: 'expliquer',
        blocks: [
          { kind: 'paragraph', text: 'Ici / là / là-bas indiquent la distance.' },
          { kind: 'paragraph', text: 'Devant ↔ derrière. Près de ↔ loin de.' },
          { kind: 'paragraph', text: 'À droite / à gauche. En haut / en bas.' },
          { kind: 'paragraph', text: 'Au milieu de, au bord de, au fond de, jusqu’à.' }
        ],
      },
      {
        kind: 'section',
        role: 'retenir',
        blocks: [
          { kind: 'paragraph', text: 'un lieu = un mot de place clair.' },
          { kind: 'table', colHeader: true, rowHeader: true, headers: ['Mot', 'Contraire', 'Exemple'],
            rows: [
              ['devant', 'derrière', 'devant la maison'],
              ['près de', 'loin de', 'près du métro'],
              ['à droite', 'à gauche', 'tournez à droite'],
              ['en haut', 'en bas', 'en haut de l’escalier'],
              ['ici', 'là-bas', 'Regardez là-bas.'],
            ],
          },
          { kind: 'attention', text: 'De + le = du : près du magasin. De + les = des.' }
        ],
      },
    ],
  },
  {
    id: 'e7',
    typeId: 'gram-e7-theorie',
    index: 3,
    title: 'Les articles contractés (lieu)',
    topic: 'gram-espace',
    public: 'A1',
    objectif: 'Former au, aux, du, des avec un lieu.',
    blocks: [
      { kind: 'heading', text: 'Les articles contractés' },
      { kind: 'paragraph', text: 'Je combine à / de avec le ou les.' },
      {
        kind: 'section',
        role: 'regarder',
        blocks: [
          { kind: 'examples', items: [
              'Je vais au magasin.',
              'Je reviens du travail.',
              'Nous allons aux toilettes.',
            ],
          }
        ],
      },
      {
        kind: 'section',
        role: 'expliquer',
        blocks: [
          { kind: 'paragraph', text: 'À + le → au. À + les → aux.' },
          { kind: 'paragraph', text: 'De + le → du. De + les → des.' },
          { kind: 'paragraph', text: 'À la / à l’ et de la / de l’ ne se contractent pas.' }
        ],
      },
      {
        kind: 'section',
        role: 'retenir',
        blocks: [
          { kind: 'paragraph', text: 'au / aux / du / des = formes collées.' },
          { kind: 'table', colHeader: true, rowHeader: true, headers: ['Forme', 'Origine', 'Exemple'],
            rows: [
              ['au', 'à + le', 'au cinéma'],
              ['aux', 'à + les', 'aux États-Unis'],
              ['du', 'de + le', 'du bureau'],
              ['des', 'de + les', 'des toilettes'],
              ['à la', 'à + la', 'à la poste'],
              ['de la', 'de + la', 'de la gare'],
            ],
          },
          { kind: 'attention', text: 'Ne dis pas « à le » ni « de le ».' }
        ],
      },
    ],
  },
]
