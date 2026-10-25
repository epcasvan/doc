import type { GrammaireTheoryDoc } from '../types'

/** Théorie FALC — thème gram-faits. Français seul (pas de traductions). */
export const faitsDocs: GrammaireTheoryDoc[] = [
  {
    id: 'j6',
    typeId: 'gram-j6-theorie',
    index: 1,
    title: 'La forme passive',
    topic: 'gram-faits',
    public: 'A2',
    objectif: 'Transformer une phrase active en passive.',
    blocks: [
    { kind: 'heading', text: 'La forme passive' },
    { kind: 'paragraph', text: 'Je mets l’objet au début de la phrase.' },
    {
      kind: 'section',
      role: 'regarder',
      blocks: [
        { kind: 'examples', items: ['Active : Le chat mange la souris.', 'Passive : La souris est mangée par le chat.'] }
      ],
    },
    {
      kind: 'section',
      role: 'expliquer',
      blocks: [
        { kind: 'paragraph', text: 'Passive = être + participe passé (+ par).' },
        { kind: 'paragraph', text: 'Le participe s’accorde avec le nouveau sujet.' }
      ],
    },
    {
      kind: 'section',
      role: 'retenir',
      blocks: [
        { kind: 'paragraph', text: 'être + participe (+ par).' },
        { kind: 'table', colHeader: true, rowHeader: true, headers: ['Active', 'Passive'], rows: [['Le chat mange la souris.', 'La souris est mangée par le chat.']] },
        { kind: 'attention', text: 'Accorde le participe : mangée (féminin).' }
      ],
    },
    ],
  },
  {
    id: 'j7',
    typeId: 'gram-j7-theorie',
    index: 2,
    title: 'Discours direct et indirect',
    topic: 'gram-faits',
    public: 'A2',
    objectif: 'Rapporter des paroles.',
    blocks: [
    { kind: 'heading', text: 'Discours direct et indirect' },
    { kind: 'paragraph', text: 'Je rapporte des paroles avec ou sans guillemets.' },
    {
      kind: 'section',
      role: 'regarder',
      blocks: [
        { kind: 'examples', items: ['Il dit : « Il y a un incendie. »', 'Il dit qu’il y a un incendie.'] }
      ],
    },
    {
      kind: 'section',
      role: 'expliquer',
      blocks: [
        { kind: 'paragraph', text: 'Direct = guillemets. Indirect = que / si / mot interrogatif.' },
        { kind: 'paragraph', text: 'Ordre → de + infinitif.' },
        { kind: 'paragraph', text: 'Question oui/non → si.' }
      ],
    },
    {
      kind: 'section',
      role: 'retenir',
      blocks: [
        { kind: 'paragraph', text: 'indirect = que / si / mot interrogatif.' },
        { kind: 'table', colHeader: true, rowHeader: true, headers: ['Direct', 'Indirect'], rows: [['Il dit : « Sortez ! »', 'Il demande de sortir.'], ['Il demande : « Est-ce qu’il y a… ? »', 'Il demande s’il y a…']] },
        { kind: 'attention', text: 'Qu’est-ce que → ce que à l’indirect.' }
      ],
    },
    ],
  },
  {
    id: 'j8',
    typeId: 'gram-j8-theorie',
    index: 3,
    title: 'Le conditionnel (emploi)',
    topic: 'gram-faits',
    public: 'A2',
    objectif: 'Exprimer un souhait ou une hypothèse.',
    blocks: [
    { kind: 'heading', text: 'Le conditionnel' },
    { kind: 'paragraph', text: 'J’exprime un souhait, un conseil ou une hypothèse.' },
    {
      kind: 'section',
      role: 'regarder',
      blocks: [
        { kind: 'examples', items: ['J’aimerais un café.', 'Ce serait bien.'] }
      ],
    },
    {
      kind: 'section',
      role: 'expliquer',
      blocks: [
        { kind: 'paragraph', text: 'Souvent poli : j’aimerais, je voudrais.' },
        { kind: 'paragraph', text: 'Même terminaisons que l’imparfait, radical du futur.' }
      ],
    },
    {
      kind: 'section',
      role: 'retenir',
      blocks: [
        { kind: 'paragraph', text: 'radical du futur + ais/ais/ait…' },
        { kind: 'table', colHeader: true, rowHeader: true, headers: ['Personne', 'aimer'], rows: [['j’aimerais', 'tu aimerais', 'il aimerait']] },
        { kind: 'attention', text: 'Souvent avec si + imparfait (fiche hypothèse).' }
      ],
    },
    ],
  },
  {
    id: 'j9',
    typeId: 'gram-j9-theorie',
    index: 4,
    title: 'L’hypothèse avec si',
    topic: 'gram-faits',
    public: 'A2',
    objectif: 'Construire une hypothèse avec si.',
    blocks: [
    { kind: 'heading', text: 'L’hypothèse avec si' },
    { kind: 'paragraph', text: 'Je parle d’une situation imaginée.' },
    {
      kind: 'section',
      role: 'regarder',
      blocks: [
        { kind: 'examples', items: ['Si j’avais le temps, je viendrais.'] }
      ],
    },
    {
      kind: 'section',
      role: 'expliquer',
      blocks: [
        { kind: 'paragraph', text: 'Si + présent → futur / présent (possible).' },
        { kind: 'paragraph', text: 'Si + imparfait → conditionnel (imaginé).' }
      ],
    },
    {
      kind: 'section',
      role: 'retenir',
      blocks: [
        { kind: 'paragraph', text: 'si + imparfait → conditionnel.' },
        { kind: 'table', colHeader: true, rowHeader: true, headers: ['Si…', 'Alors…'], rows: [['Si tu viens', 'nous mangerons ensemble.'], ['Si j’étais riche', 'j’achèterais une maison.']] },
        { kind: 'attention', text: 'Pas de conditionnel juste après si.' }
      ],
    },
    ],
  },
  {
    id: 'j10',
    typeId: 'gram-j10-theorie',
    index: 5,
    title: 'Le conditionnel passé',
    topic: 'gram-faits',
    public: 'B1',
    objectif: 'Exprimer un regret ou une hypothèse passée.',
    blocks: [
      { kind: 'heading', text: 'Le conditionnel passé' },
      { kind: 'paragraph', text: 'Je parle d’une action qui n’a pas eu lieu.' },
      {
        kind: 'section',
        role: 'regarder',
        blocks: [
          { kind: 'examples', items: [
              'J’aurais aimé venir.',
              'Si j’avais su, je serais resté.',
            ],
          }
        ],
      },
      {
        kind: 'section',
        role: 'expliquer',
        blocks: [
          { kind: 'paragraph', text: 'Conditionnel passé = avoir / être au conditionnel présent + participe.' },
          { kind: 'paragraph', text: 'Souvent un regret, un reproche, ou une hypothèse irréelle passée.' },
          { kind: 'paragraph', text: 'Avec si : si + plus-que-parfait → conditionnel passé.' }
        ],
      },
      {
        kind: 'section',
        role: 'retenir',
        blocks: [
          { kind: 'paragraph', text: 'j’aurais / je serais + participe.' },
          { kind: 'table', colHeader: true, rowHeader: true, headers: ['Forme', 'Exemple'],
            rows: [
              ['j’aurais + participe', 'j’aurais mangé'],
              ['elle serait + participe', 'elle serait partie'],
              ['nous aurions + participe', 'nous aurions compris'],
            ],
          },
          { kind: 'attention', text: 'Même auxiliaire qu’au passé composé.' }
        ],
      },
    ],
  },
]
