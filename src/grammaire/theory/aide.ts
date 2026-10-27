import type { GrammaireTheoryDoc } from '../types'

/** Théorie FALC — thème gram-aide. Français seul (pas de traductions). */
export const aideDocs: GrammaireTheoryDoc[] = [
  {
    id: 'l1',
    typeId: 'gram-l1-theorie',
    index: 1,
    title: 'L’apostrophe',
    topic: 'gram-aide',
    public: 'A1',
    objectif: 'Utiliser l’apostrophe.',
    blocks: [
    { kind: 'heading', text: 'L’apostrophe' },
    { kind: 'paragraph', text: 'Je remplace une voyelle par ’ devant une autre voyelle.' },
    {
      kind: 'section',
      role: 'regarder',
      blocks: [
        { kind: 'examples', items: ['l’école', 'j’aime', 's’appeler'] }
      ],
    },
    {
      kind: 'section',
      role: 'expliquer',
      blocks: [
        { kind: 'paragraph', text: 'Le/la → l’. Je → j’. Me/te/se → m’/t’/s’. De → d’. Que → qu’.' }
      ],
    },
    {
      kind: 'section',
      role: 'retenir',
      blocks: [
        { kind: 'paragraph', text: 'voyelle + voyelle → apostrophe souvent.' },
        { kind: 'table', colHeader: true, rowHeader: true, headers: ['Avant', 'Après'], rows: [['le ami', 'l’ami'], ['je ai', 'j’ai'], ['se appelle', 's’appelle']] },
        { kind: 'attention', text: 'Pas d’apostrophe au hasard : seulement ces petits mots.' }
      ],
    },
    ],
  },
  {
    id: 'l2',
    typeId: 'gram-l2-theorie',
    index: 2,
    title: 'Le genre des noms',
    topic: 'gram-aide',
    public: 'A1',
    objectif: 'Former le féminin des noms.',
    blocks: [
    { kind: 'heading', text: 'Le genre des noms' },
    { kind: 'paragraph', text: 'Je forme le féminin d’un nom.' },
    {
      kind: 'section',
      role: 'regarder',
      blocks: [
        { kind: 'examples', items: ['un boulanger → une boulangère', 'un chanteur → une chanteuse'] }
      ],
    },
    {
      kind: 'section',
      role: 'expliquer',
      blocks: [
        { kind: 'paragraph', text: 'Souvent + e. Autres : -eur → -euse, -teur → -trice, -er → -ère…' }
      ],
    },
    {
      kind: 'section',
      role: 'retenir',
      blocks: [
        { kind: 'paragraph', text: 'regarde la terminaison pour former le féminin.' },
        { kind: 'table', colHeader: true, rowHeader: true, headers: ['Masculin', 'Féminin'], rows: [['-ien', '-ienne'], ['-eur', '-euse'], ['-teur', '-trice'], ['-er', '-ère']] },
        { kind: 'attention', text: 'Quelques exceptions : un chef → une cheffe.' }
      ],
    },
    ],
  },
  {
    id: 'l3',
    typeId: 'gram-l3-theorie',
    index: 3,
    title: 'Le nombre des noms',
    topic: 'gram-aide',
    public: 'A1',
    objectif: 'Former le pluriel des noms.',
    blocks: [
    { kind: 'heading', text: 'Le nombre des noms' },
    { kind: 'paragraph', text: 'Je mets un nom au pluriel.' },
    {
      kind: 'section',
      role: 'regarder',
      blocks: [
        { kind: 'examples', items: ['un livre → des livres', 'un cheval → des chevaux'] }
      ],
    },
    {
      kind: 'section',
      role: 'expliquer',
      blocks: [
        { kind: 'paragraph', text: 'Souvent + s. -eau / -au / -eu → + x. -al → -aux (souvent).' }
      ],
    },
    {
      kind: 'section',
      role: 'retenir',
      blocks: [
        { kind: 'paragraph', text: 'pluriel souvent + s.' },
        { kind: 'table', colHeader: true, rowHeader: true, headers: ['Singulier', 'Pluriel'], rows: [['livre', 'livres'], ['bateau', 'bateaux'], ['journal', 'journaux']] },
        { kind: 'attention', text: 'Un œil → des yeux.' }
      ],
    },
    ],
  },
  {
    id: 'l4',
    typeId: 'gram-l4-theorie',
    index: 4,
    title: 'Le genre des adjectifs',
    topic: 'gram-aide',
    public: 'A1',
    objectif: 'Accorder l’adjectif au féminin.',
    blocks: [
    { kind: 'heading', text: 'Le genre des adjectifs' },
    { kind: 'paragraph', text: 'J’accorde l’adjectif au féminin.' },
    {
      kind: 'section',
      role: 'regarder',
      blocks: [
        { kind: 'examples', items: ['petit → petite', 'heureux → heureuse'] }
      ],
    },
    {
      kind: 'section',
      role: 'expliquer',
      blocks: [
        { kind: 'paragraph', text: 'Souvent + e. -eux → -euse. -f → -ve. -er → -ère.' }
      ],
    },
    {
      kind: 'section',
      role: 'retenir',
      blocks: [
        { kind: 'paragraph', text: 'adjectif féminin = accord avec le nom.' },
        { kind: 'table', colHeader: true, rowHeader: true, headers: ['Masculin', 'Féminin'], rows: [['grand', 'grande'], ['actif', 'active'], ['premier', 'première']] },
        { kind: 'attention', text: 'Beau → belle. Nouveau → nouvelle. Vieux → vieille.' }
      ],
    },
    ],
  },
  {
    id: 'l5',
    typeId: 'gram-l5-theorie',
    index: 5,
    title: 'Le nombre des adjectifs',
    topic: 'gram-aide',
    public: 'A1',
    objectif: 'Mettre l’adjectif au pluriel.',
    blocks: [
    { kind: 'heading', text: 'Le nombre des adjectifs' },
    { kind: 'paragraph', text: 'J’accorde l’adjectif au pluriel.' },
    {
      kind: 'section',
      role: 'regarder',
      blocks: [
        { kind: 'examples', items: ['un livre intéressant → des livres intéressants'] }
      ],
    },
    {
      kind: 'section',
      role: 'expliquer',
      blocks: [
        { kind: 'paragraph', text: 'Souvent + s. Adjectifs en -eau → + x.' }
      ],
    },
    {
      kind: 'section',
      role: 'retenir',
      blocks: [
        { kind: 'paragraph', text: 'pluriel de l’adjectif = accord avec le nom.' },
        { kind: 'table', colHeader: true, rowHeader: true, headers: ['Singulier', 'Pluriel'], rows: [['petit', 'petits'], ['beau', 'beaux']] },
        { kind: 'attention', text: 'Accord en genre et en nombre ensemble.' }
      ],
    },
    ],
  },
  {
    id: 'l6',
    typeId: 'gram-l6-theorie',
    index: 6,
    title: 'Les lettres G et C',
    topic: 'gram-aide',
    public: 'A1',
    objectif: 'Comprendre les sons de g et c.',
    blocks: [
    { kind: 'heading', text: 'Les lettres G et C' },
    { kind: 'paragraph', text: 'Je sais quand g et c sont durs ou doux.' },
    {
      kind: 'section',
      role: 'regarder',
      blocks: [
        { kind: 'examples', items: ['garçon (c doux)', 'gateau → gâteau (g dur)', 'girafe (g doux)'] }
      ],
    },
    {
      kind: 'section',
      role: 'expliquer',
      blocks: [
        { kind: 'paragraph', text: 'C/G devant e, i, y → son doux. Devant a, o, u → son dur.' },
        { kind: 'paragraph', text: 'Ç garde le son s devant a, o, u.' }
      ],
    },
    {
      kind: 'section',
      role: 'retenir',
      blocks: [
        { kind: 'paragraph', text: 'e/i/y → doux. a/o/u → dur.' },
        { kind: 'table', colHeader: true, rowHeader: true, headers: ['Lettre', 'Doux', 'Dur'], rows: [['c', 'cerise', 'carotte'], ['g', 'girafe', 'gateau / gâteau']] },
        { kind: 'attention', text: 'On ajoute e pour garder le son : nous mangeons.' }
      ],
    },
    ],
  },
  {
    id: 'l7',
    typeId: 'gram-l7-theorie',
    index: 7,
    title: 'Les lettres S et M',
    topic: 'gram-aide',
    public: 'A1',
    objectif: 'Repères sur s et m.',
    blocks: [
    { kind: 'heading', text: 'Les lettres S et M' },
    { kind: 'paragraph', text: 'Je fais attention aux lettres s et m dans les mots.' },
    {
      kind: 'section',
      role: 'regarder',
      blocks: [
        { kind: 'examples', items: ['poisson (ss = son s)', 'maison (s entre voyelles = son z)'] }
      ],
    },
    {
      kind: 'section',
      role: 'expliquer',
      blocks: [
        { kind: 'paragraph', text: 'S entre deux voyelles → souvent son z.' },
        { kind: 'paragraph', text: 'Ss → son s. M devant b/p souvent.' }
      ],
    },
    {
      kind: 'section',
      role: 'retenir',
      blocks: [
        { kind: 'paragraph', text: 's entre voyelles → souvent z.' },
        { kind: 'table', colHeader: true, rowHeader: true, headers: ['Cas', 'Exemple'], rows: [['s = z', 'maison'], ['ss = s', 'classe']] },
        { kind: 'attention', text: 'Un mot = une règle à la fois en FALC.' }
      ],
    },
    ],
  },
  {
    id: 'l8',
    typeId: 'gram-l8-theorie',
    index: 8,
    title: 'Les accents',
    topic: 'gram-aide',
    public: 'A1',
    objectif: 'Reconnaître les accents courants.',
    blocks: [
    { kind: 'heading', text: 'Les accents' },
    { kind: 'paragraph', text: 'Je reconnais é, è, ê, à, ù, ç.' },
    {
      kind: 'section',
      role: 'regarder',
      blocks: [
        { kind: 'examples', items: ['école', 'père', 'forêt', 'à'] }
      ],
    },
    {
      kind: 'section',
      role: 'expliquer',
      blocks: [
        { kind: 'paragraph', text: 'É = accent aigu. È / Ê = grave / circonflexe.' },
        { kind: 'paragraph', text: 'À et ù : surtout mots courts (à, où).' }
      ],
    },
    {
      kind: 'section',
      role: 'retenir',
      blocks: [
        { kind: 'paragraph', text: 'l’accent change parfois le son et le sens.' },
        { kind: 'table', colHeader: true, rowHeader: true, headers: ['Accent', 'Exemple'], rows: [['aigu é', 'été'], ['grave è', 'très'], ['circonflexe ê', 'être']] },
        { kind: 'attention', text: 'a (verbe avoir) ≠ à (préposition).' }
      ],
    },
    ],
  },
  {
    id: 'l9',
    typeId: 'gram-l9-theorie',
    index: 9,
    title: 'Les classes grammaticales',
    topic: 'gram-aide',
    public: 'A1 / A2',
    objectif: 'Nommer les classes de mots.',
    blocks: [
    { kind: 'heading', text: 'Les classes grammaticales' },
    { kind: 'paragraph', text: 'Je reconnais la classe d’un mot.' },
    {
      kind: 'section',
      role: 'regarder',
      blocks: [
        { kind: 'examples', items: ['maison = nom', 'grande = adjectif', 'manger = verbe'] }
      ],
    },
    {
      kind: 'section',
      role: 'expliquer',
      blocks: [
        { kind: 'paragraph', text: 'Noms, adjectifs, déterminants, pronoms, verbes, adverbes, prépositions, conjonctions…' }
      ],
    },
    {
      kind: 'section',
      role: 'retenir',
      blocks: [
        { kind: 'paragraph', text: 'chaque mot a une classe.' },
        { kind: 'examples', marker: 'puces', label: 'Classes', items: ['nom', 'adjectif', 'déterminant', 'pronom', 'verbe', 'adverbe', 'préposition', 'conjonction'] },
        { kind: 'attention', text: 'Le même mot peut changer de rôle selon la phrase.' }
      ],
    },
    ],
  },
  {
    id: 'l10',
    typeId: 'gram-l10-theorie',
    index: 10,
    title: 'La ponctuation',
    topic: 'gram-aide',
    public: 'A1',
    objectif: 'Utiliser la ponctuation de base.',
    blocks: [
    { kind: 'heading', text: 'La ponctuation' },
    { kind: 'paragraph', text: 'J’utilise les signes pour clarifier.' },
    {
      kind: 'section',
      role: 'regarder',
      blocks: [
        { kind: 'examples', items: ['Bonjour.', 'Tu viens ?', 'Attention !'] }
      ],
    },
    {
      kind: 'section',
      role: 'expliquer',
      blocks: [
        { kind: 'paragraph', text: '. = fin. ? = question. ! = exclamation. , = pause courte.' }
      ],
    },
    {
      kind: 'section',
      role: 'retenir',
      blocks: [
        { kind: 'paragraph', text: 'une phrase = une ponctuation claire.' },
        { kind: 'table', colHeader: true, rowHeader: true, headers: ['Signe', 'Usage'], rows: [['.', 'fin de phrase'], ['?', 'question'], ['!', 'exclamation'], [',', 'pause']] },
        { kind: 'attention', text: 'Espace avant ? ! ; : en français typographique (selon usage scolaire).' }
      ],
    },
    ],
  },
  {
    id: 'l11',
    typeId: 'gram-l11-theorie',
    index: 11,
    title: 'Les homophones (sélection)',
    topic: 'gram-aide',
    public: 'A1 / A2',
    objectif: 'Distinguer les homophones courants.',
    blocks: [
    { kind: 'heading', text: 'Les homophones' },
    { kind: 'paragraph', text: 'Je distingue les mots qui se prononcent pareil.' },
    {
      kind: 'section',
      role: 'regarder',
      blocks: [
        { kind: 'examples', items: ['a (verbe avoir) / à (préposition)', 'ou (choix) / où (lieu)'] }
      ],
    },
    {
      kind: 'section',
      role: 'expliquer',
      blocks: [
        { kind: 'paragraph', text: 'Astuce : remplace pour tester (a → avait ; ou → ou bien ; on → il).' }
      ],
    },
    {
      kind: 'section',
      role: 'retenir',
      blocks: [
        { kind: 'paragraph', text: 'remplace pour choisir le bon mot.' },
        { kind: 'table', colHeader: true, rowHeader: true, headers: ['Mot', 'Nature', 'Test'], rows: [['a', 'verbe avoir', 'avait'], ['à', 'préposition', 'vers / dans'], ['ou', 'choix', 'ou bien'], ['où', 'lieu', 'là où'], ['son', 'possessif', 'mon'], ['sont', 'verbe être', 'étaient'], ['on', 'pronom', 'il'], ['ont', 'verbe avoir', 'avaient']] },
        { kind: 'attention', text: 'Un homophone à la fois dans la fiche.' }
      ],
    },
    ],
  },
  {
    id: 'l12',
    typeId: 'gram-l12-theorie',
    index: 12,
    title: 'Les noms composés',
    topic: 'gram-aide',
    public: 'A2',
    objectif: 'Former le pluriel d’un nom composé fréquent.',
    blocks: [
      { kind: 'heading', text: 'Les noms composés' },
      { kind: 'paragraph', text: 'Un nom composé a plusieurs mots.' },
      {
        kind: 'section',
        role: 'regarder',
        blocks: [
          { kind: 'examples', items: [
              'un porte-monnaie → des porte-monnaie',
              'un grand-père → des grands-pères',
              'un arc-en-ciel → des arcs-en-ciel',
            ],
          }
        ],
      },
      {
        kind: 'section',
        role: 'expliquer',
        blocks: [
          { kind: 'paragraph', text: 'Nom + nom : souvent les deux au pluriel.' },
          { kind: 'paragraph', text: 'Adjectif + nom : les deux au pluriel.' },
          { kind: 'paragraph', text: 'Verbe + nom : souvent seul le nom change (ou rien).' },
          { kind: 'paragraph', text: 'Apprends les formes fréquentes une par une.' }
        ],
      },
      {
        kind: 'section',
        role: 'retenir',
        blocks: [
          { kind: 'paragraph', text: 'regarde le type de composition.' },
          { kind: 'table', colHeader: true, rowHeader: true, headers: ['Singulier', 'Pluriel'],
            rows: [
              ['un grand-père', 'des grands-pères'],
              ['un coffre-fort', 'des coffres-forts'],
              ['un portefeuille', 'des portefeuilles'],
              ['un après-midi', 'des après-midi'],
            ],
          },
          { kind: 'attention', text: 'Certains pluriels sont fixes : vérifie dans un modèle.' }
        ],
      },
    ],
  },
  {
    id: 'l13',
    typeId: 'gram-l13-theorie',
    index: 13,
    title: 'Les adverbes en -ment',
    topic: 'gram-aide',
    public: 'A2',
    objectif: 'Former un adverbe en -ment.',
    blocks: [
      { kind: 'heading', text: 'Les adverbes en -ment' },
      { kind: 'paragraph', text: 'Je forme un adverbe à partir d’un adjectif.' },
      {
        kind: 'section',
        role: 'regarder',
        blocks: [
          { kind: 'examples', items: [
              'lent → lentement',
              'heureux → heureusement',
              'précis → précisément',
            ],
          }
        ],
      },
      {
        kind: 'section',
        role: 'expliquer',
        blocks: [
          { kind: 'paragraph', text: 'Souvent : adjectif au féminin + -ment.' },
          { kind: 'paragraph', text: 'Si l’adjectif finit par -ant / -ent : -amment / -emment.' },
          { kind: 'paragraph', text: 'L’adverbe ne s’accorde pas.' }
        ],
      },
      {
        kind: 'section',
        role: 'retenir',
        blocks: [
          { kind: 'paragraph', text: 'féminin de l’adjectif + ment.' },
          { kind: 'table', colHeader: true, rowHeader: true, headers: ['Adjectif', 'Adverbe'],
            rows: [
              ['doux / douce', 'doucement'],
              ['heureux / heureuse', 'heureusement'],
              ['constant', 'constamment'],
              ['évident', 'évidemment'],
            ],
          },
          { kind: 'attention', text: 'L’adverbe reste invariable : elle parle doucement.' }
        ],
      },
    ],
  },
  {
    id: 'l14',
    typeId: 'gram-l14-theorie',
    index: 14,
    title: 'Les adverbes d’intensité',
    topic: 'gram-aide',
    public: 'A1 / A2',
    objectif: 'Renforcer ou atténuer avec un adverbe.',
    blocks: [
      { kind: 'heading', text: 'Les adverbes d’intensité' },
      { kind: 'paragraph', text: 'Je renforce ou j’atténue une idée.' },
      {
        kind: 'section',
        role: 'regarder',
        blocks: [
          { kind: 'examples', items: [
              'C’est très bien.',
              'Je suis un peu fatigué.',
              'Il parle trop vite.',
            ],
          }
        ],
      },
      {
        kind: 'section',
        role: 'expliquer',
        blocks: [
          { kind: 'paragraph', text: 'Mots utiles : très, trop, assez, un peu, beaucoup, vraiment, surtout.' },
          { kind: 'paragraph', text: 'Ils se placent souvent devant l’adjectif ou l’adverbe.' }
        ],
      },
      {
        kind: 'section',
        role: 'retenir',
        blocks: [
          { kind: 'paragraph', text: 'très = fort. Un peu = faible. Trop = trop fort.' },
          { kind: 'table', colHeader: true, rowHeader: true, headers: ['Adverbe', 'Sens', 'Exemple'],
            rows: [
              ['très', 'fort', 'très content'],
              ['un peu', 'faible', 'un peu difficile'],
              ['assez', 'suffisant', 'assez clair'],
              ['trop', 'excessif', 'trop cher'],
              ['beaucoup', 'grande quantité', 'beaucoup travailler'],
            ],
          },
          { kind: 'attention', text: 'Trop ≠ très : trop = trop pour la situation.' }
        ],
      },
    ],
  },
]
