import type { GrammaireTheoryDoc } from '../types'

/** Théorie FALC — thème gram-passe. Français seul (pas de traductions). */
export const passeDocs: GrammaireTheoryDoc[] = [
  {
    id: 'h1',
    typeId: 'gram-h1-theorie',
    index: 1,
    title: 'Le passé composé (idée)',
    topic: 'gram-passe',
    public: 'A1',
    objectif: 'Comprendre le passé composé.',
    blocks: [
    { kind: 'heading', text: 'Le passé composé' },
    { kind: 'paragraph', text: 'Je parle d’une action finie dans le passé.' },
    {
      kind: 'section',
      role: 'regarder',
      blocks: [
        { kind: 'examples', items: ['J’ai mangé.', 'Elle est partie.'] }
      ],
    },
    {
      kind: 'section',
      role: 'expliquer',
      blocks: [
        { kind: 'paragraph', text: 'Passé composé = auxiliaire au présent + participe passé.' },
        { kind: 'paragraph', text: 'Auxiliaire avoir (souvent) ou être (certains verbes).' }
      ],
    },
    {
      kind: 'section',
      role: 'retenir',
      blocks: [
        { kind: 'paragraph', text: 'auxiliaire + participe passé.' },
        { kind: 'table', colHeader: true, rowHeader: true, headers: ['Auxiliaire', 'Participe', 'Exemple'], rows: [['j’ai', 'mangé', 'J’ai mangé.'], ['elle est', 'partie', 'Elle est partie.']] },
        { kind: 'attention', text: 'Choisis le bon auxiliaire (fiches suivantes).' }
      ],
    },
    ],
  },
  {
    id: 'h2',
    typeId: 'gram-h2-theorie',
    index: 2,
    title: 'Passé composé avec avoir',
    topic: 'gram-passe',
    public: 'A1',
    objectif: 'Conjuguer le passé composé avec avoir.',
    blocks: [
    { kind: 'heading', text: 'Passé composé avec avoir' },
    { kind: 'paragraph', text: 'Je forme le passé composé avec avoir.' },
    {
      kind: 'section',
      role: 'regarder',
      blocks: [
        { kind: 'examples', items: ['Tu as fini.', 'Nous avons vu un film.'] }
      ],
    },
    {
      kind: 'section',
      role: 'expliquer',
      blocks: [
        { kind: 'paragraph', text: 'Avoir au présent + participe passé.' },
        { kind: 'paragraph', text: 'Participe : -er → é ; -ir → i ; -re → u (souvent).' }
      ],
    },
    {
      kind: 'section',
      role: 'retenir',
      blocks: [
        { kind: 'paragraph', text: 'j’ai / tu as / il a… + participe.' },
        { kind: 'table', colHeader: true, rowHeader: true, headers: ['Personne', 'Exemple'], rows: [['j’ai', 'J’ai parlé.'], ['tu as', 'Tu as mangé.'], ['il / elle a', 'Elle a fini.'], ['nous avons', 'Nous avons lu.'], ['vous avez', 'Vous avez pris.'], ['ils / elles ont', 'Ils ont vu.']] },
        { kind: 'attention', text: 'Avec avoir, le participe s’accorde surtout avec le COD placé avant.' }
      ],
    },
    ],
  },
  {
    id: 'h3',
    typeId: 'gram-h3-theorie',
    index: 3,
    title: 'Passé composé avec être',
    topic: 'gram-passe',
    public: 'A1',
    objectif: 'Conjuguer le passé composé avec être.',
    blocks: [
    { kind: 'heading', text: 'Passé composé avec être' },
    { kind: 'paragraph', text: 'Certains verbes utilisent être.' },
    {
      kind: 'section',
      role: 'regarder',
      blocks: [
        { kind: 'examples', items: ['Je suis allé(e).', 'Ils sont arrivés.'] }
      ],
    },
    {
      kind: 'section',
      role: 'expliquer',
      blocks: [
        { kind: 'paragraph', text: 'Verbes de mouvement / état courants : aller, venir, arriver, partir, entrer, sortir, monter, descendre, naître, mourir, rester, tomber, retourner, passer…' },
        { kind: 'paragraph', text: 'Verbes pronominaux : être aussi.' },
        { kind: 'paragraph', text: 'Le participe s’accorde avec le sujet.' }
      ],
    },
    {
      kind: 'section',
      role: 'retenir',
      blocks: [
        { kind: 'paragraph', text: 'être + participe accordé.' },
        { kind: 'table', colHeader: true, rowHeader: true, headers: ['Masculin', 'Féminin'], rows: [['allé', 'allée'], ['arrivé', 'arrivée'], ['partis', 'parties']] },
        { kind: 'attention', text: 'Accorde toujours avec le sujet : elle est partie.' }
      ],
    },
    ],
  },
  {
    id: 'h4',
    typeId: 'gram-h4-theorie',
    index: 4,
    title: 'L’imparfait',
    topic: 'gram-passe',
    public: 'A1 / A2',
    objectif: 'Décrire le passé avec l’imparfait.',
    blocks: [
    { kind: 'heading', text: 'L’imparfait' },
    { kind: 'paragraph', text: 'Je décris une habitude ou un décor dans le passé.' },
    {
      kind: 'section',
      role: 'regarder',
      blocks: [
        { kind: 'examples', items: ['Quand j’étais enfant, j’aimais le foot.', 'Il faisait beau.'] }
      ],
    },
    {
      kind: 'section',
      role: 'expliquer',
      blocks: [
        { kind: 'paragraph', text: 'Imparfait = description, habitude, action longue dans le passé.' },
        { kind: 'paragraph', text: 'Base : nous du présent sans -ons + ais, ais, ait, ions, iez, aient.' }
      ],
    },
    {
      kind: 'section',
      role: 'retenir',
      blocks: [
        { kind: 'paragraph', text: 'imparfait = décor / habitude. Passé composé = action finie.' },
        { kind: 'table', colHeader: true, rowHeader: true, headers: ['Personne', 'parler'], rows: [['je', 'parlais'], ['tu', 'parlais'], ['il / elle', 'parlait'], ['nous', 'parlions'], ['vous', 'parliez'], ['ils / elles', 'parlaient']] },
        { kind: 'attention', text: 'Être est irrégulier : j’étais, tu étais…' }
      ],
    },
    ],
  },
  {
    id: 'h5',
    typeId: 'gram-h5-theorie',
    index: 5,
    title: 'Le plus-que-parfait',
    topic: 'gram-passe',
    public: 'A2',
    objectif: 'Dire qu’une action est avant une autre dans le passé.',
    blocks: [
    { kind: 'heading', text: 'Le plus-que-parfait' },
    { kind: 'paragraph', text: 'Je parle d’une action passée avant une autre action passée.' },
    {
      kind: 'section',
      role: 'regarder',
      blocks: [
        { kind: 'examples', items: ['J’avais fini quand tu es arrivé.'] }
      ],
    },
    {
      kind: 'section',
      role: 'expliquer',
      blocks: [
        { kind: 'paragraph', text: 'Plus-que-parfait = avoir / être à l’imparfait + participe passé.' }
      ],
    },
    {
      kind: 'section',
      role: 'retenir',
      blocks: [
        { kind: 'paragraph', text: 'avant une autre action passée → plus-que-parfait.' },
        { kind: 'table', colHeader: true, rowHeader: true, headers: ['Forme', 'Exemple'], rows: [['j’avais + participe', 'J’avais mangé.'], ['elle était + participe', 'Elle était partie.']] },
        { kind: 'attention', text: 'Choisis le même auxiliaire qu’au passé composé.' }
      ],
    },
    ],
  },
  {
    id: 'h6',
    typeId: 'gram-h6-theorie',
    index: 6,
    title: 'Les verbes à double auxiliaire',
    topic: 'gram-passe',
    public: 'A2',
    objectif: 'Choisir être ou avoir selon le sens.',
    blocks: [
      { kind: 'heading', text: 'Les verbes à double auxiliaire' },
      { kind: 'paragraph', text: 'Certains verbes acceptent être ou avoir.' },
      {
        kind: 'section',
        role: 'regarder',
        blocks: [
          { kind: 'examples', items: [
              'Elle est descendue.',
              'Elle a descendu la valise.',
            ],
          }
        ],
      },
      {
        kind: 'section',
        role: 'expliquer',
        blocks: [
          { kind: 'paragraph', text: 'Avec être : le sujet se déplace (pas d’objet).' },
          { kind: 'paragraph', text: 'Avec avoir : le sujet déplace quelque chose (objet).' },
          { kind: 'paragraph', text: 'Verbes fréquents : monter, descendre, sortir, rentrer, passer, retourner.' }
        ],
      },
      {
        kind: 'section',
        role: 'retenir',
        blocks: [
          { kind: 'paragraph', text: 'objet après le verbe → souvent avoir.' },
          { kind: 'table', colHeader: true, rowHeader: true, headers: ['Être', 'Avoir'],
            rows: [
              ['Elle est sortie.', 'Elle a sorti les clés.'],
              ['Il est monté.', 'Il a monté les sacs.'],
              ['Nous sommes rentrés.', 'Nous avons rentré les chaises.'],
            ],
          },
          { kind: 'attention', text: 'Regarde s’il y a un complément d’objet.' }
        ],
      },
    ],
  },
  {
    id: 'h7',
    typeId: 'gram-h7-theorie',
    index: 7,
    title: 'Les verbes pronominaux au passé composé',
    topic: 'gram-passe',
    public: 'A2',
    objectif: 'Conjuguer un verbe pronominal au passé composé.',
    blocks: [
      { kind: 'heading', text: 'Les verbes pronominaux au passé composé' },
      { kind: 'paragraph', text: 'Un verbe pronominal utilise être au passé composé.' },
      {
        kind: 'section',
        role: 'regarder',
        blocks: [
          { kind: 'examples', items: [
              'Je me suis levé(e).',
              'Elle s’est lavée.',
              'Ils se sont parlés.',
            ],
          }
        ],
      },
      {
        kind: 'section',
        role: 'expliquer',
        blocks: [
          { kind: 'paragraph', text: 'Ordre : pronom réfléchi + être + participe passé.' },
          { kind: 'paragraph', text: 'Le participe s’accorde souvent avec le sujet.' },
          { kind: 'paragraph', text: 'Négation : je ne me suis pas levé(e).' }
        ],
      },
      {
        kind: 'section',
        role: 'retenir',
        blocks: [
          { kind: 'paragraph', text: 'se + verbe → être au passé composé.' },
          { kind: 'table', colHeader: true, rowHeader: true, headers: ['Personne', 'Exemple'],
            rows: [
              ['je', 'je me suis habillé(e)'],
              ['tu', 'tu t’es reposé(e)'],
              ['elle', 'elle s’est maquillée'],
              ['nous', 'nous nous sommes levés'],
              ['ils', 'ils se sont rencontrés'],
            ],
          },
          { kind: 'attention', text: 'Garde le pronom : me / te / se / nous / vous.' }
        ],
      },
    ],
  },
  {
    id: 'h8',
    typeId: 'gram-h8-theorie',
    index: 8,
    title: 'Imparfait ou passé composé ?',
    topic: 'gram-passe',
    public: 'A2',
    objectif: 'Choisir imparfait ou passé composé pour raconter.',
    blocks: [
      { kind: 'heading', text: 'Imparfait ou passé composé ?' },
      { kind: 'paragraph', text: 'Je combine les deux temps pour raconter.' },
      {
        kind: 'section',
        role: 'regarder',
        blocks: [
          { kind: 'examples', items: [
              'Nous étions dans le bus. Soudain, le chauffeur a freiné.',
            ],
          }
        ],
      },
      {
        kind: 'section',
        role: 'expliquer',
        blocks: [
          { kind: 'paragraph', text: 'Imparfait = décor, habitude, action en cours.' },
          { kind: 'paragraph', text: 'Passé composé = action ponctuelle, événement principal.' },
          { kind: 'paragraph', text: 'Souvent : imparfait pour le fond, passé composé pour le fait.' },
          { kind: 'examples', marker: 'puces', label: 'Mots utiles', items: [
              'Imparfait : pendant que, tous les jours, avant…',
              'Passé composé : soudain, un jour, hier, tout à coup…',
            ],
          }
        ],
      },
      {
        kind: 'section',
        role: 'retenir',
        blocks: [
          { kind: 'paragraph', text: 'décor → imparfait. Événement → passé composé.' },
          { kind: 'table', colHeader: true, rowHeader: true, headers: ['Imparfait', 'Passé composé'],
            rows: [
              ['habitude', 'événement ponctuel'],
              ['description', 'action principale'],
              ['action en cours', 'action qui coupe'],
              ['Avant, je marchais.', 'Hier, j’ai marché.'],
            ],
          },
          { kind: 'attention', text: 'J’ai marché ≠ je marchais.' }
        ],
      },
    ],
  },
  {
    id: 'h9',
    typeId: 'gram-h9-theorie',
    index: 9,
    title: 'L’accord du participe passé',
    topic: 'gram-passe',
    public: 'A2',
    objectif: 'Accorder le participe passé dans les cas courants.',
    blocks: [
      { kind: 'heading', text: 'L’accord du participe passé' },
      { kind: 'paragraph', text: 'Je sais quand le participe change.' },
      {
        kind: 'section',
        role: 'regarder',
        blocks: [
          { kind: 'examples', items: [
              'Elle est partie.',
              'Les lettres que j’ai écrites.',
              'J’ai mangé une pomme.',
            ],
          }
        ],
      },
      {
        kind: 'section',
        role: 'expliquer',
        blocks: [
          { kind: 'paragraph', text: 'Avec être : le participe s’accorde avec le sujet.' },
          { kind: 'paragraph', text: 'Avec avoir : pas d’accord avec le sujet.' },
          { kind: 'paragraph', text: 'Avec avoir : accord avec le COD placé avant le verbe.' }
        ],
      },
      {
        kind: 'section',
        role: 'retenir',
        blocks: [
          { kind: 'paragraph', text: 'être → sujet. Avoir → COD avant.' },
          { kind: 'table', colHeader: true, rowHeader: true, headers: ['Cas', 'Exemple'],
            rows: [
              ['être + sujet fém.', 'Elle est allée.'],
              ['être + sujet plur.', 'Ils sont partis.'],
              ['avoir + COD après', 'J’ai vu la fille.'],
              ['avoir + COD avant', 'La fille que j’ai vue.'],
            ],
          },
          { kind: 'attention', text: 'Cherche le COD avant le verbe (que, l’, les…).' }
        ],
      },
    ],
  },
]
