import type { GrammaireTheoryDoc } from '../types'

/** Théorie FALC — thème gram-action. Français seul (pas de traductions). */
export const actionDocs: GrammaireTheoryDoc[] = [
  {
    id: 'j1',
    typeId: 'gram-j1-theorie',
    index: 1,
    title: 'Le présent progressif',
    topic: 'gram-action',
    public: 'A1',
    objectif: 'Dire qu’une action est en cours.',
    blocks: [
    { kind: 'heading', text: 'Le présent progressif' },
    { kind: 'paragraph', text: 'Je dis qu’une action se passe maintenant.' },
    {
      kind: 'section',
      role: 'regarder',
      blocks: [
        { kind: 'examples', items: ['Je suis en train de lire.'] }
      ],
    },
    {
      kind: 'section',
      role: 'expliquer',
      blocks: [
        { kind: 'paragraph', text: 'Être en train de + infinitif.' }
      ],
    },
    {
      kind: 'section',
      role: 'retenir',
      blocks: [
        { kind: 'paragraph', text: 'être en train de + infinitif.' },
        { kind: 'table', colHeader: true, rowHeader: true, headers: ['Forme', 'Exemple'], rows: [['être en train de + infinitif', 'Elle est en train de manger.']] },
        { kind: 'attention', text: 'Pas de gérondif anglais ici : utilise en train de.' }
      ],
    },
    ],
  },
  {
    id: 'j2',
    typeId: 'gram-j2-theorie',
    index: 2,
    title: 'Le passé récent',
    topic: 'gram-action',
    public: 'A1',
    objectif: 'Dire qu’une action vient d’arriver.',
    blocks: [
    { kind: 'heading', text: 'Le passé récent' },
    { kind: 'paragraph', text: 'Je dis qu’une action vient de se terminer.' },
    {
      kind: 'section',
      role: 'regarder',
      blocks: [
        { kind: 'examples', items: ['Je viens de manger.'] }
      ],
    },
    {
      kind: 'section',
      role: 'expliquer',
      blocks: [
        { kind: 'paragraph', text: 'Venir de + infinitif.' }
      ],
    },
    {
      kind: 'section',
      role: 'retenir',
      blocks: [
        { kind: 'paragraph', text: 'venir de + infinitif = passé récent.' },
        { kind: 'table', colHeader: true, rowHeader: true, headers: ['Forme', 'Exemple'], rows: [['venir de + infinitif', 'Ils viennent d’arriver.']] },
        { kind: 'attention', text: 'Venir de (passé récent) ≠ venir de (provenance) : le sens dépend de la suite.' }
      ],
    },
    ],
  },
  {
    id: 'j3',
    typeId: 'gram-j3-theorie',
    index: 3,
    title: 'Le gérondif',
    topic: 'gram-action',
    public: 'A2',
    objectif: 'Exprimer la simultanéité avec en + -ant.',
    blocks: [
    { kind: 'heading', text: 'Le gérondif' },
    { kind: 'paragraph', text: 'Je dis deux actions en même temps.' },
    {
      kind: 'section',
      role: 'regarder',
      blocks: [
        { kind: 'examples', items: ['Il marche en parlant.', 'Elle s’est cassé la jambe en tombant.'] }
      ],
    },
    {
      kind: 'section',
      role: 'expliquer',
      blocks: [
        { kind: 'paragraph', text: 'Gérondif = en + participe présent (-ant).' },
        { kind: 'paragraph', text: 'Même sujet pour les deux verbes.' }
      ],
    },
    {
      kind: 'section',
      role: 'retenir',
      blocks: [
        { kind: 'paragraph', text: 'en + verbe en -ant.' },
        { kind: 'table', colHeader: true, rowHeader: true, headers: ['Infinitif', 'Gérondif'], rows: [['parler', 'en parlant'], ['finir', 'en finissant'], ['faire', 'en faisant']] },
        { kind: 'attention', text: 'Un seul sujet : Il lit en mangeant.' }
      ],
    },
    ],
  },
]
