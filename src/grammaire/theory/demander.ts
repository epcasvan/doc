import type { GrammaireTheoryDoc } from '../types'

/** Théorie FALC — thème gram-demander. Français seul (pas de traductions). */
export const demanderDocs: GrammaireTheoryDoc[] = [
  {
    id: 'f1',
    typeId: 'gram-f1-theorie',
    index: 1,
    title: 'Les déterminants démonstratifs',
    topic: 'gram-demander',
    public: 'A1',
    objectif: 'Utiliser ce, cet, cette, ces.',
    blocks: [
    { kind: 'heading', text: 'Les déterminants démonstratifs' },
    { kind: 'paragraph', text: 'Je montre une chose proche avec ce / cet / cette / ces.' },
    {
      kind: 'section',
      role: 'regarder',
      blocks: [
        { kind: 'examples', items: ['Ce livre.', 'Cet homme.', 'Cette table.', 'Ces stylos.'] }
      ],
    },
    {
      kind: 'section',
      role: 'expliquer',
      blocks: [
        { kind: 'paragraph', text: 'Masculin + consonne → ce. Masculin + voyelle ou h → cet.' },
        { kind: 'paragraph', text: 'Féminin → cette. Pluriel → ces.' }
      ],
    },
    {
      kind: 'section',
      role: 'retenir',
      blocks: [
        { kind: 'paragraph', text: 'ce / cet / cette / ces.' },
        { kind: 'table', colHeader: true, rowHeader: true, headers: ['', 'Masculin', 'Féminin'], rows: [['singulier', 'ce / cet', 'cette'], ['pluriel', 'ces', 'ces']] },
        { kind: 'attention', text: 'Cet devant voyelle : cet ami, cet hôtel.' }
      ],
    },
    ],
  },
  {
    id: 'f2',
    typeId: 'gram-f2-theorie',
    index: 2,
    title: 'Pouvoir, devoir, vouloir',
    topic: 'gram-demander',
    public: 'A1',
    objectif: 'Exprimer capacité, obligation, volonté.',
    blocks: [
    { kind: 'heading', text: 'Pouvoir, devoir, vouloir' },
    { kind: 'paragraph', text: 'Je dis ce que je peux, dois ou veux.' },
    {
      kind: 'section',
      role: 'regarder',
      blocks: [
        { kind: 'examples', items: ['Je peux t’aider.', 'Tu dois partir.', 'Nous voulons un café.'] }
      ],
    },
    {
      kind: 'section',
      role: 'expliquer',
      blocks: [
        { kind: 'paragraph', text: 'Pouvoir = capacité ou permission.' },
        { kind: 'paragraph', text: 'Devoir = obligation.' },
        { kind: 'paragraph', text: 'Vouloir = volonté / souhait.' },
        { kind: 'paragraph', text: 'Ces verbes + infinitif.' }
      ],
    },
    {
      kind: 'section',
      role: 'retenir',
      blocks: [
        { kind: 'paragraph', text: 'pouvoir / devoir / vouloir + infinitif.' },
        { kind: 'table', colHeader: true, rowHeader: true, headers: ['Verbe', 'Sens', 'Exemple'], rows: [['pouvoir', 'capacité / permission', 'Je peux venir.'], ['devoir', 'obligation', 'Tu dois étudier.'], ['vouloir', 'volonté', 'Elle veut manger.']] },
        { kind: 'attention', text: 'Après ces verbes, le 2e verbe reste à l’infinitif.' }
      ],
    },
    ],
  },
  {
    id: 'f3',
    typeId: 'gram-f3-theorie',
    index: 3,
    title: 'Accepter et refuser',
    topic: 'gram-demander',
    public: 'A1',
    objectif: 'Accepter ou refuser une proposition.',
    blocks: [
    { kind: 'heading', text: 'Accepter et refuser' },
    { kind: 'paragraph', text: 'Je réponds oui ou non à une proposition.' },
    {
      kind: 'section',
      role: 'regarder',
      blocks: [
        { kind: 'examples', items: ['Oui, avec plaisir.', 'Non, merci.', 'Désolé, je ne peux pas.'] }
      ],
    },
    {
      kind: 'section',
      role: 'expliquer',
      blocks: [
        { kind: 'paragraph', text: 'Accepter : oui, d’accord, avec plaisir, volontiers.' },
        { kind: 'paragraph', text: 'Refuser poliment : non merci, désolé, je ne peux pas.' }
      ],
    },
    {
      kind: 'section',
      role: 'retenir',
      blocks: [
        { kind: 'paragraph', text: 'refuse avec politesse.' },
        { kind: 'examples', marker: 'puces', label: 'Formules', items: ['Oui, d’accord.', 'Avec plaisir.', 'Non, merci.', 'Désolé, je ne peux pas.'] },
        { kind: 'attention', text: 'Un refus clair reste poli.' }
      ],
    },
    ],
  },
]
