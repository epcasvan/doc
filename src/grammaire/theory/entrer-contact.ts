import type { GrammaireTheoryDoc } from '../types'

/** Théorie FALC — thème gram-entrer-contact. Français seul (pas de traductions). */
export const entrerContactDocs: GrammaireTheoryDoc[] = [
  {
    id: 'b1',
    typeId: 'gram-b1-theorie',
    index: 1,
    title: 'Tu et vous',
    topic: 'gram-entrer-contact',
    public: 'pré-A1 / A1',
    objectif: 'Choisir tu ou vous.',
    blocks: [
    { kind: 'heading', text: 'Tu et vous' },
    { kind: 'paragraph', text: 'Je choisis tu ou vous selon la personne.' },
    {
      kind: 'section',
      role: 'regarder',
      blocks: [
        { kind: 'examples', items: ['Salut, ça va ? (tu)', 'Bonjour, comment allez-vous ? (vous)'] }
      ],
    },
    {
      kind: 'section',
      role: 'expliquer',
      blocks: [
        { kind: 'paragraph', text: 'Tu : ami, famille, enfant, autre élève.' },
        { kind: 'paragraph', text: 'Vous : inconnu, professeur, personne plus âgée, chef, vendeur.' }
      ],
    },
    {
      kind: 'section',
      role: 'retenir',
      blocks: [
        { kind: 'paragraph', text: 'tu = proche. Vous = politesse.' },
        { kind: 'table', colHeader: true, rowHeader: true, headers: ['Tu', 'Vous'], rows: [['un ami', 'une personne inconnue'], ['la famille', 'un professeur'], ['un enfant', 'un médecin / un chef']] },
        { kind: 'attention', text: 'Vous sert aussi pour plusieurs personnes.' }
      ],
    },
    ],
  },
  {
    id: 'b2',
    typeId: 'gram-b2-theorie',
    index: 2,
    title: 'Les salutations',
    topic: 'gram-entrer-contact',
    public: 'pré-A1 / A1',
    objectif: 'Saluer à l’arrivée et au départ.',
    blocks: [
    { kind: 'heading', text: 'Les salutations' },
    { kind: 'paragraph', text: 'Je salue quand j’arrive et quand je pars.' },
    {
      kind: 'section',
      role: 'regarder',
      blocks: [
        { kind: 'examples', items: ['Bonjour !', 'Au revoir !', 'Salut ! (tu)'] }
      ],
    },
    {
      kind: 'section',
      role: 'expliquer',
      blocks: [
        { kind: 'paragraph', text: 'J’adapte selon tu ou vous.' },
        { kind: 'paragraph', text: 'Bonjour et au revoir marchent avec tu et vous.' },
        { kind: 'paragraph', text: 'Salut, ciao, à plus : plutôt avec tu.' }
      ],
    },
    {
      kind: 'section',
      role: 'retenir',
      blocks: [
        { kind: 'paragraph', text: 'arriver → bonjour. Partir → au revoir.' },
        { kind: 'table', colHeader: true, rowHeader: true, headers: ['Arriver', 'Partir'], rows: [['Bonjour !', 'Au revoir !'], ['Bonsoir !', 'À bientôt !'], ['Salut ! (tu)', 'Bonne journée !']] },
        { kind: 'attention', text: 'Hello et ciao sont très familiers (tu).' }
      ],
    },
    ],
  },
  {
    id: 'b3',
    typeId: 'gram-b3-theorie',
    index: 3,
    title: 'Les remerciements',
    topic: 'gram-entrer-contact',
    public: 'pré-A1 / A1',
    objectif: 'Dire merci et répondre.',
    blocks: [
    { kind: 'heading', text: 'Les remerciements' },
    { kind: 'paragraph', text: 'Je dis merci. Je sais répondre à un merci.' },
    {
      kind: 'section',
      role: 'regarder',
      blocks: [
        { kind: 'examples', items: ['Merci beaucoup !', 'De rien !'] }
      ],
    },
    {
      kind: 'section',
      role: 'expliquer',
      blocks: [
        { kind: 'paragraph', text: 'Merci et merci beaucoup marchent avec tu et vous.' },
        { kind: 'paragraph', text: 'Je te remercie (tu). Je vous remercie (vous).' },
        { kind: 'paragraph', text: 'Réponses : de rien, avec plaisir, je t’en prie / je vous en prie.' }
      ],
    },
    {
      kind: 'section',
      role: 'retenir',
      blocks: [
        { kind: 'paragraph', text: 'merci → de rien / avec plaisir.' },
        { kind: 'table', colHeader: true, rowHeader: true, headers: ['Dire merci', 'Répondre'], rows: [['Merci !', 'De rien !'], ['Merci beaucoup !', 'Avec plaisir !'], ['Je vous remercie !', 'Je vous en prie !']] },
        { kind: 'attention', text: 'Adapte tu / vous dans je te / je vous.' }
      ],
    },
    ],
  },
]
