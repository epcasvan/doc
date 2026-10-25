import type { GrammaireTheoryDoc } from '../types'

/** Théorie FALC — thème gram-avenir. Français seul (pas de traductions). */
export const avenirDocs: GrammaireTheoryDoc[] = [
  {
    id: 'j4',
    typeId: 'gram-j4-theorie',
    index: 1,
    title: 'Le futur proche',
    topic: 'gram-avenir',
    public: 'A1',
    objectif: 'Parler d’un avenir proche.',
    blocks: [
    { kind: 'heading', text: 'Le futur proche' },
    { kind: 'paragraph', text: 'Je parle d’un événement bientôt.' },
    {
      kind: 'section',
      role: 'regarder',
      blocks: [
        { kind: 'examples', items: ['Il va pleuvoir.', 'Nous allons partir.'] }
      ],
    },
    {
      kind: 'section',
      role: 'expliquer',
      blocks: [
        { kind: 'paragraph', text: 'Aller au présent + infinitif.' },
        { kind: 'paragraph', text: 'Souvent à l’oral pour un avenir proche.' }
      ],
    },
    {
      kind: 'section',
      role: 'retenir',
      blocks: [
        { kind: 'paragraph', text: 'aller + infinitif.' },
        { kind: 'table', colHeader: true, rowHeader: true, headers: ['Personne', 'Exemple'], rows: [['je vais', 'Je vais étudier.'], ['tu vas', 'Tu vas comprendre.'], ['il va', 'Il va neiger.']] },
        { kind: 'attention', text: 'Aller se conjugue ; le 2e verbe reste infinitif.' }
      ],
    },
    ],
  },
  {
    id: 'j5',
    typeId: 'gram-j5-theorie',
    index: 2,
    title: 'Le futur simple',
    topic: 'gram-avenir',
    public: 'A2',
    objectif: 'Parler de l’avenir avec le futur simple.',
    blocks: [
    { kind: 'heading', text: 'Le futur simple' },
    { kind: 'paragraph', text: 'Je parle de l’avenir.' },
    {
      kind: 'section',
      role: 'regarder',
      blocks: [
        { kind: 'examples', items: ['Je marcherai.', 'Tu seras prêt.'] }
      ],
    },
    {
      kind: 'section',
      role: 'expliquer',
      blocks: [
        { kind: 'paragraph', text: 'Souvent : infinitif + ai, as, a, ons, ez, ont.' },
        { kind: 'paragraph', text: 'Verbes en -e (lire) : enlève le e → je lirai.' },
        { kind: 'paragraph', text: 'Irréguliers : être → ser-, avoir → aur-, aller → ir-, faire → fer-…' }
      ],
    },
    {
      kind: 'section',
      role: 'retenir',
      blocks: [
        { kind: 'paragraph', text: 'radical du futur + terminaisons ai/as/a/ons/ez/ont.' },
        { kind: 'table', colHeader: true, rowHeader: true, headers: ['Personne', 'parler'], rows: [['je', 'parlerai'], ['tu', 'parleras'], ['il', 'parlera'], ['nous', 'parlerons'], ['vous', 'parlerez'], ['ils', 'parleront']] },
        { kind: 'attention', text: 'J’irai (aller), je ferai (faire), j’aurai (avoir), je serai (être).' }
      ],
    },
    ],
  },
  {
    id: 'o1',
    typeId: 'gram-o1-theorie',
    index: 3,
    title: 'Futur proche ou futur simple ?',
    topic: 'gram-avenir',
    public: 'A2',
    objectif: 'Choisir entre futur proche et futur simple.',
    blocks: [
      { kind: 'heading', text: 'Futur proche ou futur simple ?' },
      { kind: 'paragraph', text: 'Les deux parlent de l’avenir, mais pas pareil.' },
      {
        kind: 'section',
        role: 'regarder',
        blocks: [
          { kind: 'examples', items: [
              'Je vais partir tout de suite.',
              'Un jour, je partirai à Genève.',
            ],
          }
        ],
      },
      {
        kind: 'section',
        role: 'expliquer',
        blocks: [
          { kind: 'paragraph', text: 'Futur proche : aller + infinitif. Souvent bientôt, décision claire.' },
          { kind: 'paragraph', text: 'Futur simple : plus formel, plus lointain, ou une promesse.' },
          { kind: 'paragraph', text: 'À l’oral, le futur proche est très fréquent.' }
        ],
      },
      {
        kind: 'section',
        role: 'retenir',
        blocks: [
          { kind: 'paragraph', text: 'bientôt → souvent futur proche. Plus tard / écrit → futur simple.' },
          { kind: 'table', colHeader: true, rowHeader: true, headers: ['Temps', 'Quand ?', 'Exemple'],
            rows: [
              ['futur proche', 'bientôt / décidé', 'Je vais appeler.'],
              ['futur simple', 'plus loin / formel', 'J’appellerai demain soir.'],
            ],
          },
          { kind: 'attention', text: 'Ne mélange pas : « je vais partirai » est faux.' }
        ],
      },
    ],
  },
  {
    id: 'o2',
    typeId: 'gram-o2-theorie',
    index: 4,
    title: 'Le futur antérieur',
    topic: 'gram-avenir',
    public: 'A2 / B1',
    objectif: 'Dire qu’une action future est avant une autre.',
    blocks: [
      { kind: 'heading', text: 'Le futur antérieur' },
      { kind: 'paragraph', text: 'Je parle d’une action future déjà finie avant une autre.' },
      {
        kind: 'section',
        role: 'regarder',
        blocks: [
          { kind: 'examples', items: [
              'Quand j’aurai fini, je partirai.',
              'Dès qu’elle sera arrivée, nous mangerons.',
            ],
          }
        ],
      },
      {
        kind: 'section',
        role: 'expliquer',
        blocks: [
          { kind: 'paragraph', text: 'Futur antérieur = avoir / être au futur simple + participe passé.' },
          { kind: 'paragraph', text: 'Souvent après quand, dès que, une fois que…' },
          { kind: 'paragraph', text: 'L’autre action est au futur simple.' }
        ],
      },
      {
        kind: 'section',
        role: 'retenir',
        blocks: [
          { kind: 'paragraph', text: 'action 1 (futur antérieur) puis action 2 (futur).' },
          { kind: 'table', colHeader: true, rowHeader: true, headers: ['Forme', 'Exemple'],
            rows: [
              ['j’aurai + participe', 'j’aurai mangé'],
              ['elle sera + participe', 'elle sera partie'],
              ['nous aurons + participe', 'nous aurons fini'],
            ],
          },
          { kind: 'attention', text: 'Même auxiliaire qu’au passé composé.' }
        ],
      },
    ],
  },
  {
    id: 'o3',
    typeId: 'gram-o3-theorie',
    index: 5,
    title: 'L’hypothèse sur le futur',
    topic: 'gram-avenir',
    public: 'A2',
    objectif: 'Parler d’un avenir possible avec si + présent.',
    blocks: [
      { kind: 'heading', text: 'L’hypothèse sur le futur' },
      { kind: 'paragraph', text: 'Je parle d’une condition pour l’avenir.' },
      {
        kind: 'section',
        role: 'regarder',
        blocks: [
          { kind: 'examples', items: [
              'S’il fait beau, nous sortirons.',
              'Si tu veux, on va au cinéma.',
            ],
          }
        ],
      },
      {
        kind: 'section',
        role: 'expliquer',
        blocks: [
          { kind: 'paragraph', text: 'Si + présent, puis futur (ou futur proche).' },
          { kind: 'paragraph', text: 'La condition est possible.' },
          { kind: 'paragraph', text: 'Pas de futur juste après si.' }
        ],
      },
      {
        kind: 'section',
        role: 'retenir',
        blocks: [
          { kind: 'paragraph', text: 'si + présent → futur dans l’autre partie.' },
          { kind: 'table', colHeader: true, rowHeader: true, headers: ['Condition', 'Résultat'],
            rows: [
              ['S’il pleut,', 'je resterai chez moi.'],
              ['Si tu as le temps,', 'tu m’appelleras.'],
              ['Si on finit tôt,', 'on va se promener.'],
            ],
          },
          { kind: 'attention', text: 'Pas « si il pleuvra » : dis « s’il pleut ».' }
        ],
      },
    ],
  },
]
