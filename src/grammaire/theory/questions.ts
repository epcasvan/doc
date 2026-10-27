import type { GrammaireTheoryDoc } from '../types'

/** Théorie FALC — thème gram-questions. Français seul (pas de traductions). */
export const questionsDocs: GrammaireTheoryDoc[] = [
  {
    id: 'c1',
    typeId: 'gram-c1-theorie',
    index: 1,
    title: 'Trois façons de poser une question',
    topic: 'gram-questions',
    public: 'A1',
    objectif: 'Former une question de trois façons.',
    blocks: [
    { kind: 'heading', text: 'Trois façons de poser une question' },
    { kind: 'paragraph', text: 'Je pose une question à l’oral, avec est-ce que, ou avec l’inversion.' },
    {
      kind: 'section',
      role: 'regarder',
      blocks: [
        { kind: 'examples', marker: 'numeros', items: ['Vous êtes italien ? (intonation)', 'Est-ce que vous êtes italien ?', 'Êtes-vous italien ?'] }
      ],
    },
    {
      kind: 'section',
      role: 'expliquer',
      blocks: [
        { kind: 'paragraph', text: '1. Intonation (parlé) : même ordre, voix qui monte.' },
        { kind: 'paragraph', text: '2. Est-ce que + phrase (standard).' },
        { kind: 'paragraph', text: '3. Inversion verbe-sujet (soutenu).' }
      ],
    },
    {
      kind: 'section',
      role: 'retenir',
      blocks: [
        { kind: 'paragraph', text: 'est-ce que = forme claire pour débuter.' },
        { kind: 'table', colHeader: true, rowHeader: true, headers: ['Façon', 'Exemple'], rows: [['intonation', 'Vous êtes italien ?'], ['est-ce que', 'Est-ce que vous êtes italien ?'], ['inversion', 'Êtes-vous italien ?']] },
        { kind: 'attention', text: 'À l’écrit scolaire, préfère est-ce que ou l’inversion.' }
      ],
    },
    ],
  },
  {
    id: 'c2',
    typeId: 'gram-c2-theorie',
    index: 2,
    title: 'Questions fermées et ouvertes',
    topic: 'gram-questions',
    public: 'A1',
    objectif: 'Distinguer oui/non et mots interrogatifs.',
    blocks: [
    { kind: 'heading', text: 'Questions fermées et ouvertes' },
    { kind: 'paragraph', text: 'Je sais si la réponse est oui/non ou une information.' },
    {
      kind: 'section',
      role: 'regarder',
      blocks: [
        { kind: 'examples', items: ['Aimes-tu les glaces ? → Oui.', 'Où dors-tu ? → À l’hôtel.'] }
      ],
    },
    {
      kind: 'section',
      role: 'expliquer',
      blocks: [
        { kind: 'paragraph', text: 'Question fermée → oui ou non.' },
        { kind: 'paragraph', text: 'Question ouverte → qui, que, quand, où, combien, comment, pourquoi.' }
      ],
    },
    {
      kind: 'section',
      role: 'retenir',
      blocks: [
        { kind: 'paragraph', text: 'mot interrogatif = question ouverte.' },
        { kind: 'table', colHeader: true, rowHeader: true, headers: ['Mot', 'Sens', 'Exemple'], rows: [['Qui ?', 'personne', 'Qui vient demain ?'], ['Que ?', 'chose', 'Que prenez-vous ?'], ['Quand ?', 'temps', 'Quand pars-tu ?'], ['Où ?', 'lieu', 'Où dormons-nous ?'], ['Combien ?', 'quantité', 'Combien coûte la chambre ?'], ['Comment ?', 'manière', 'Comment voyage-t-il ?'], ['Pourquoi ?', 'cause', 'Pourquoi est-elle absente ?']] },
        { kind: 'attention', text: 'Qui = personne. Que = chose.' }
      ],
    },
    ],
  },
  {
    id: 'c3',
    typeId: 'gram-c3-theorie',
    index: 3,
    title: 'Les questions avec quel',
    topic: 'gram-questions',
    public: 'A1',
    objectif: 'Accorder quel / quelle / quels / quelles.',
    blocks: [
    { kind: 'heading', text: 'Les questions avec quel' },
    { kind: 'paragraph', text: 'J’utilise quel pour demander une précision sur un nom.' },
    {
      kind: 'section',
      role: 'regarder',
      blocks: [
        { kind: 'examples', items: ['Quel est ton nom ?', 'Quelle est ton adresse ?'] }
      ],
    },
    {
      kind: 'section',
      role: 'expliquer',
      blocks: [
        { kind: 'paragraph', text: 'Quel s’accorde avec le nom.' },
        { kind: 'paragraph', text: 'Masculin : quel / quels. Féminin : quelle / quelles.' }
      ],
    },
    {
      kind: 'section',
      role: 'retenir',
      blocks: [
        { kind: 'paragraph', text: 'quel = accord avec le nom.' },
        { kind: 'table', colHeader: true, rowHeader: true, headers: ['', 'Masculin', 'Féminin'], rows: [['singulier', 'quel', 'quelle'], ['pluriel', 'quels', 'quelles']] },
        { kind: 'attention', text: 'Regarde le genre du nom : activité → quelles activités.' }
      ],
    },
    ],
  },
  {
    id: 'c4',
    typeId: 'gram-c4-theorie',
    index: 4,
    title: 'La phrase exclamative',
    topic: 'gram-questions',
    public: 'A1 / A2',
    objectif: 'Former une phrase exclamative simple.',
    blocks: [
      { kind: 'heading', text: 'La phrase exclamative' },
      { kind: 'paragraph', text: 'J’exprime un sentiment fort.' },
      {
        kind: 'section',
        role: 'regarder',
        blocks: [
          { kind: 'examples', items: [
              'Quel beau jour !',
              'Comme c’est bon !',
              'Qu’il fait froid !',
            ],
          }
        ],
      },
      {
        kind: 'section',
        role: 'expliquer',
        blocks: [
          { kind: 'paragraph', text: 'Souvent avec quel / quelle / quels / quelles + nom.' },
          { kind: 'paragraph', text: 'Aussi avec comme ou que + phrase.' },
          { kind: 'paragraph', text: 'À l’écrit, j’utilise le point d’exclamation !' }
        ],
      },
      {
        kind: 'section',
        role: 'retenir',
        blocks: [
          { kind: 'paragraph', text: 'quel + nom. Comme / que + phrase.' },
          { kind: 'table', colHeader: true, rowHeader: true, headers: ['Forme', 'Exemple'],
            rows: [
              ['quel + nom', 'Quelle surprise !'],
              ['comme…', 'Comme tu es gentil !'],
              ['que…', 'Que c’est difficile !'],
            ],
          },
          { kind: 'attention', text: 'Accorde quel avec le nom : quel jour, quelle idée.' }
        ],
      },
    ],
  }
]
