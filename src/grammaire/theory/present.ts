import { theoryGabarit } from '@/francais/grammar-theory'
import type { GrammaireTheoryDoc } from '../types'

/**
 * Théorie FALC — thème gram-present.
 * Partie ClairFLE dédiée à la conjugaison au présent (répartition SCAI).
 * Adapté de notions proches du programme soutien (G1), sans copie.
 */
export const presentDocs: GrammaireTheoryDoc[] = [
  {
    id: 'm2',
    typeId: 'gram-m2-theorie',
    index: 2,
    title: 'Le verbe être',
    topic: 'gram-present',
    public: 'pré-A1 / A1',
    objectif: 'Conjuguer être au présent.',
    blocks: [
      { kind: 'heading', text: 'Le verbe être' },
      { kind: 'paragraph', text: '{ligne/4}' },
      { kind: 'paragraph', text: 'Je conjugue {g}être{/g} au présent.' },
      { kind: 'paragraph', text: '{ligne/2}' },
      {
        kind: 'section',
        role: 'regarder',
        blocks: [
          { kind: 'examples', marker: 'puces', items: [
            '{tab:1<}Je {c}suis{/c} fatigué. | Vous {c}êtes{/c} française.',
            '{tab:1<}Tu {c}es{/c} cuisinier. | Nous {c}sommes{/c} à Sion.',
            '{tab:1<}Il {c}est{/c} prêt. | Ils {c}sont{/c} étudiants.'
          ]},
        ],
      },
      {
        kind: 'section',
        role: 'expliquer',
        blocks: [
          { kind: 'paragraph', text: 'Le verbe {c}être{/c} est un verbe irrégulier. Sa forme change selon la personne.' },
          { kind: 'paragraph', text: '{ligne/4}' },
          { kind: 'paragraph', text: 'Je l’utilise donner des informations sur une personne.' },
          { kind: 'paragraph', text: '{ligne/2}' },
          { kind: 'exemples', marker: 'puces', items : [
            '{tab:+1+} Je parle de … | Exemples',
            '{tab:1>}Identité | Je suis {c}Melina{/c}.',
            '{tab:1>}Nationalité | Je suis {c}suisse{/c}.',
            '{tab:1>}Métier | Je suis {c}professeure{/c}.',
            '{tab:1>}Description | Je suis {c}fatigué{/c}.',
            '{tab:1>}Situation | Je suis {c}à l’école{/c}.',
          ]},
          { kind: 'paragraph', text: '{ligne/2}' },
          { kind: 'paragraph', text: 'Je choisis la {c}bonne forme{/c} du verbe selon la personne.'},
          { kind: 'paragraph', text: '{ligne/2}' },
          { kind: 'examples', marker: 'puces', items: [
            '{tab:+1+} Singulier | Pluriel',
            '{tab:1<}Je {c}suis{/c} à la maison. | Nous {c}sommes{/c} à la maison.',
            '{tab:1<}Tu {c}es{/c} à la maison. | Vous {c}êtes{/c} à la maison.',
            '{tab:1<}Il / Elle {c}est{/c} à la maison. | Ils / Elles {c}sont{/c} à la maison.'
          ]},
        ],
      },
      {
        kind: 'section',
        role: 'retenir',
        blocks: [
          { kind: 'paragraph', text: 'Je retiens les six formes du verbe {c}être{/c} au présent.' },
          { kind: 'paragraph', text: '{ligne/2}' },
          { kind: 'table', colHeader: true, rowHeader: true, headers: ['Personne', 'Être'],
            rows: [
              ['je', '{c}suis{/c}'],
              ['tu', '{c}es{/c}'],
              ['il / elle / on', '{c}est{/c}'],
              ['nous', '{c}sommes{/c}'],
              ['vous', '{c}êtes{/c}'],
              ['ils / elles', '{c}sont{/c}'],
            ],
          },
          { kind: 'paragraph', text: '{c}Attention : {/c} Ne pas confondre les formes {c}es{/c}-{c}est{/c} et {c}êtes{/c}-{c}est{/c}.' },
          { kind: 'examples', items: [
            { text: 'Je dis : « Vous {c}êtes{/c} ici. »', wrong: 'Vous est ici.' },
        ]},
        ],
      },
    ],
  },
  {
    id: 'm3',
    typeId: 'gram-m3-theorie',
    index: 3,
    title: 'Le verbe avoir',
    topic: 'gram-present',
    public: 'pré-A1 / A1',
    objectif: 'Conjuguer avoir au présent.',
    blocks: [
      { kind: 'heading', text: 'Le verbe avoir' },
      { kind: 'paragraph', text: '{ligne/4}' },
      { kind: 'paragraph', text: 'Je conjugue avoir au présent.' },
      { kind: 'paragraph', text: '{ligne/2}' },
      {
        kind: 'section',
        role: 'regarder',
        blocks: [
          { kind: 'examples', items: ['J’ai un billet.', 'Nous avons faim.'],
          }
        ],
      },
      {
        kind: 'section',
        role: 'expliquer',
        blocks: [
          { kind: 'paragraph', text: 'Avoir est irrégulier.' },
          { kind: 'paragraph', text: 'Je l’utilise pour la possession et beaucoup d’expressions.' },
          { kind: 'examples', marker: 'puces', label: 'Expressions fréquentes', items: [
              'avoir faim / soif',
              'avoir froid / chaud',
              'avoir peur',
              'avoir raison / tort',
              'avoir besoin de',
              'avoir ans (âge)',
            ],
          }
        ],
      },
      {
        kind: 'section',
        role: 'retenir',
        blocks: [
          { kind: 'paragraph', text: 'ai, as, a, avons, avez, ont.' },
          { kind: 'table', colHeader: true, rowHeader: true, headers: ['Personne', 'avoir'],
            rows: [
              ['j’', 'ai'],
              ['tu', 'as'],
              ['il / elle / on', 'a'],
              ['nous', 'avons'],
              ['vous', 'avez'],
              ['ils / elles', 'ont'],
            ],
          },
          { kind: 'attention', text: 'J’ai (apostrophe). Ils ont ≠ ils sont.' }
        ],
      },
    ],
  },
  {
    id: 'm4',
    typeId: 'gram-m4-theorie',
    index: 4,
    title: 'Les verbes en -er',
    topic: 'gram-present',
    public: 'A1',
    objectif: 'Conjuguer un verbe régulier en -er au présent.',
    blocks: [
      { kind: 'heading', text: 'Les verbes en -er' },
      { kind: 'paragraph', text: '{ligne/4}' },
      { kind: 'paragraph', text: 'Je conjugue un verbe du 1er groupe au présent.' },
      { kind: 'paragraph', text: '{ligne/2}' },
      {
        kind: 'section',
        role: 'regarder',
        blocks: [
          { kind: 'examples', items: ['Je parle français.', 'Nous regardons la télé.'],
          }
        ],
      },
      {
        kind: 'section',
        role: 'expliquer',
        blocks: [
          { kind: 'paragraph', text: 'Le présent sert pour maintenant, une habitude, une description.' },
          { kind: 'paragraph', text: 'Radical = infinitif sans -er. Puis j’ajoute la terminaison.' },
          { kind: 'paragraph', text: 'Terminaisons : -e, -es, -e, -ons, -ez, -ent.' }
        ],
      },
      {
        kind: 'section',
        role: 'retenir',
        blocks: [
          { kind: 'paragraph', text: 'radical + e / es / e / ons / ez / ent.' },
          { kind: 'table', colHeader: true, rowHeader: true, headers: ['Personne', 'parler'],
            rows: [
              ['je', 'parle'],
              ['tu', 'parles'],
              ['il / elle / on', 'parle'],
              ['nous', 'parlons'],
              ['vous', 'parlez'],
              ['ils / elles', 'parlent'],
            ],
          },
          { kind: 'attention', text: 'Aller est en -er mais il est irrégulier (fiche suivante).' }
        ],
      },
    ],
  },
  {
    id: 'm5',
    typeId: 'gram-m5-theorie',
    index: 5,
    title: 'Les verbes en -er particuliers',
    topic: 'gram-present',
    public: 'A1 / A2',
    objectif: 'Reconnaître les changements orthographiques des verbes en -er.',
    blocks: [
      { kind: 'heading', text: 'Les verbes en -er particuliers' },
      { kind: 'paragraph', text: '{ligne/4}' },
      { kind: 'paragraph', text: 'Certains verbes en -er changent l’écriture.' },
      { kind: 'paragraph', text: '{ligne/2}' },
      {
        kind: 'section',
        role: 'regarder',
        blocks: [
          { kind: 'examples', items: [
              'Nous mangeons.',
              'Je jette le papier.',
              'Je vais au travail.',
            ],
          }
        ],
      },
      {
        kind: 'section',
        role: 'expliquer',
        blocks: [
          { kind: 'paragraph', text: 'Aller : je vais, tu vas, il va, nous allons, vous allez, ils vont.' },
          { kind: 'paragraph', text: 'Verbes en -ger : nous mangeons (e gardé devant o).' },
          { kind: 'paragraph', text: 'Verbes en -cer : nous commençons (ç devant o).' },
          { kind: 'paragraph', text: 'Certains doublent une consonne : jeter → je jette.' },
          { kind: 'paragraph', text: 'Certains changent e → è : acheter → j’achète.' }
        ],
      },
      {
        kind: 'section',
        role: 'retenir',
        blocks: [
          { kind: 'paragraph', text: 'regarde l’infinitif pour choisir le modèle.' },
          { kind: 'table', colHeader: true, rowHeader: true, headers: ['Cas', 'Exemple'],
            rows: [
              ['aller', 'je vais'],
              ['-ger', 'nous mangeons'],
              ['-cer', 'nous commençons'],
              ['double consonne', 'je jette'],
              ['e → è', 'j’achète'],
            ],
          },
          { kind: 'attention', text: 'Apprendre aller par cœur : il est très fréquent.' }
        ],
      },
    ],
  },
  {
    id: 'a4',
    typeId: 'gram-a4-theorie',
    index: 4,
    title: 'Aller : destination (pays et villes)',
    topic: 'gram-present',
    public: 'A1',
    objectif: 'Dire où je vais (pays, continent, ville).',
    blocks: [
      { kind: 'heading', text: 'Aller : destination (pays et villes)' },
      { kind: 'paragraph', text: '{ligne/4}' },
      { kind: 'paragraph', text: 'Je dis ma destination avec le verbe aller.' },
      { kind: 'paragraph', text: '{ligne/2}' },
      {
        kind: 'section',
        role: 'regarder',
        blocks: [
          { kind: 'examples', items: ['Je vais au Sénégal.', 'Elle va en Chine.', 'Ils vont à Sion.'] },
        ],
      },
      {
        kind: 'section',
        role: 'expliquer',
        blocks: [
          { kind: 'paragraph', text: 'Le verbe aller indique la destination.' },
          { kind: 'paragraph', text: 'Pays masculin + consonne → au.' },
          { kind: 'paragraph', text: 'Pays masculin + voyelle → en.' },
          { kind: 'paragraph', text: 'Pays féminin → en. Pays pluriel → aux.' },
          { kind: 'paragraph', text: 'Continent → en. Ville → à.' },
        ],
      },
      {
        kind: 'section',
        role: 'retenir',
        blocks: [
          { kind: 'paragraph', text: 'aller = destination. au / en / aux / à selon le lieu.' },
          { kind: 'table', colHeader: true, rowHeader: true, headers: ['Lieu', 'Forme', 'Exemple'], rows: [['pays masc. + consonne', 'au', 'Je vais au Sénégal.'], ['pays masc. + voyelle', 'en', 'Tu vas en Irak.'], ['pays féminin', 'en', 'Elle va en Chine.'], ['pays pluriel', 'aux', 'Nous allons aux Pays-Bas.'], ['continent', 'en', 'Vous allez en Europe.'], ['ville', 'à', 'Ils vont à Sion.']] },
          { kind: 'attention', text: 'Ne confonds pas au et en.' },
        ],
      },
    ],
  },
  {
    id: 'a5',
    typeId: 'gram-a5-theorie',
    index: 5,
    title: 'Aller : destination (lieux et chez)',
    topic: 'gram-present',
    public: 'A1',
    objectif: 'Dire où je vais (lieux, chez quelqu’un).',
    blocks: [
      { kind: 'heading', text: 'Aller : lieux et chez' },
      { kind: 'paragraph', text: '{ligne/4}' },
      { kind: 'paragraph', text: 'Je vais à un lieu. Je vais chez une personne.' },
      { kind: 'paragraph', text: '{ligne/2}' },
      {
        kind: 'section',
        role: 'regarder',
        blocks: [
          { kind: 'examples', items: ['Je vais chez Sarah.', 'Elle va à la poste.', 'Ils vont au magasin.'] },
        ],
      },
      {
        kind: 'section',
        role: 'expliquer',
        blocks: [
          { kind: 'paragraph', text: 'Chez + personne.' },
          { kind: 'paragraph', text: 'Lieu féminin → à la. Voyelle ou h → à l’.' },
          { kind: 'paragraph', text: 'Lieu masculin + consonne → au. Pluriel → aux.' },
        ],
      },
      {
        kind: 'section',
        role: 'retenir',
        blocks: [
          { kind: 'paragraph', text: 'chez = personne. à la / à l’ / au / aux = lieu.' },
          { kind: 'table', colHeader: true, rowHeader: true, headers: ['Cas', 'Forme', 'Exemple'], rows: [['personne', 'chez', 'Je vais chez Sarah.'], ['lieu féminin', 'à la', 'Elle va à la poste.'], ['voyelle / h', 'à l’', 'Nous allons à l’école.'], ['lieu masculin', 'au', 'Ils vont au magasin.'], ['pluriel', 'aux', 'Je vais aux Îles.']] },
          { kind: 'attention', text: 'École est féminin → à l’école.' },
        ],
      },
    ],
  },
  {
    id: 'm6',
    typeId: 'gram-m6-theorie',
    index: 6,
    title: 'Les verbes en -ir',
    topic: 'gram-present',
    public: 'A1 / A2',
    objectif: 'Conjuguer les modèles principaux des verbes en -ir.',
    blocks: [
      { kind: 'heading', text: 'Les verbes en -ir' },
      { kind: 'paragraph', text: '{ligne/4}' },
      { kind: 'paragraph', text: 'Je conjugue un verbe en -ir selon son modèle.' },
      { kind: 'paragraph', text: '{ligne/2}' },
      {
        kind: 'section',
        role: 'regarder',
        blocks: [
          { kind: 'examples', items: [
              'Je finis le travail.',
              'Elle part tôt.',
              'Nous venons demain.',
            ],
          }
        ],
      },
      {
        kind: 'section',
        role: 'expliquer',
        blocks: [
          { kind: 'paragraph', text: 'Modèle finir : je finis, tu finis, il finit, nous finissons…' },
          { kind: 'paragraph', text: 'Modèle partir / dormir / servir : je pars, tu dors, il sert…' },
          { kind: 'paragraph', text: 'Modèle ouvrir : j’ouvre, tu ouvres, il ouvre (comme un -er).' },
          { kind: 'paragraph', text: 'Modèle venir / tenir : je viens, tu viens, il vient, nous venons…' }
        ],
      },
      {
        kind: 'section',
        role: 'retenir',
        blocks: [
          { kind: 'paragraph', text: 'un verbe en -ir n’a pas une seule conjugaison.' },
          { kind: 'table', colHeader: true, rowHeader: true, headers: ['Modèle', 'je', 'nous'],
            rows: [
              ['finir', 'finis', 'finissons'],
              ['partir', 'pars', 'partons'],
              ['ouvrir', 'ouvre', 'ouvrons'],
              ['venir', 'viens', 'venons'],
            ],
          },
          { kind: 'attention', text: 'Venir et tenir changent beaucoup : apprends-les à part.' }
        ],
      },
    ],
  },
  {
    id: 'm7',
    typeId: 'gram-m7-theorie',
    index: 7,
    title: 'Les verbes en -re et -oir',
    topic: 'gram-present',
    public: 'A1 / A2',
    objectif: 'Conjuguer les modèles fréquents en -re et -oir.',
    blocks: [
      { kind: 'heading', text: 'Les verbes en -re et -oir' },
      { kind: 'paragraph', text: '{ligne/4}' },
      { kind: 'paragraph', text: 'Je conjugue des verbes fréquents hors du 1er groupe.' },
      { kind: 'paragraph', text: '{ligne/2}' },
      {
        kind: 'section',
        role: 'regarder',
        blocks: [
          { kind: 'examples', items: [
              'Je prends le bus.',
              'Tu lis un livre.',
              'Il veut un café.',
            ],
          }
        ],
      },
      {
        kind: 'section',
        role: 'expliquer',
        blocks: [
          { kind: 'paragraph', text: 'Verbes en -dre : je prends, tu prends, il prend, nous prenons…' },
          { kind: 'paragraph', text: 'Verbes en -ire : je lis, tu lis, il lit, nous lisons…' },
          { kind: 'paragraph', text: 'Faire : je fais, tu fais, il fait, nous faisons, vous faites, ils font.' },
          { kind: 'paragraph', text: 'Vouloir / pouvoir / devoir / savoir : formes irrégulières à mémoriser.' },
          { kind: 'paragraph', text: 'Savoir ≠ connaître : savoir = une info / une compétence ; connaître = une personne / un lieu.' }
        ],
      },
      {
        kind: 'section',
        role: 'retenir',
        blocks: [
          { kind: 'paragraph', text: 'apprends les verbes fréquents un par un.' },
          { kind: 'table', colHeader: true, rowHeader: true, headers: ['Verbe', 'je', 'nous', 'ils'],
            rows: [
              ['prendre', 'prends', 'prenons', 'prennent'],
              ['lire', 'lis', 'lisons', 'lisent'],
              ['faire', 'fais', 'faisons', 'font'],
              ['vouloir', 'veux', 'voulons', 'veulent'],
              ['pouvoir', 'peux', 'pouvons', 'peuvent'],
              ['devoir', 'dois', 'devons', 'doivent'],
            ],
          },
          { kind: 'attention', text: 'Vous faites (pas « vous faisez »).' }
        ],
      },
    ],
  },
  {
    id: 'modaux',
    typeId: 'gram-modaux-theorie',
    index: 8,
    title: 'Pouvoir, devoir, vouloir',
    topic: 'gram-present',
    public: 'A1',
    objectif: 'À compléter.',
    blocks: theoryGabarit('Pouvoir, devoir, vouloir'),
  },
  {
    id: 'pronominaux',
    typeId: 'gram-pronominaux-theorie',
    index: 9,
    title: 'Verbes pronominaux',
    topic: 'gram-present',
    public: 'A1',
    objectif: 'À compléter.',
    blocks: theoryGabarit('Verbes pronominaux'),
  },
  {
    id: 'a8',
    typeId: 'gram-a8-theorie',
    index: 10,
    title: 'La négation ne … pas',
    topic: 'gram-present',
    public: 'A1',
    objectif: 'Former une phrase négative avec ne … pas.',
    blocks: [
    { kind: 'heading', text: 'La négation ne … pas' },
    { kind: 'paragraph', text: '{ligne/4}' },
    { kind: 'paragraph', text: 'Je mets ne et pas autour du verbe.' },
    { kind: 'paragraph', text: '{ligne/2}' },
    {
      kind: 'section',
      role: 'regarder',
      blocks: [
        { kind: 'examples', items: [{ text: 'Je ne suis pas italien.', wrong: 'Je suis pas italien (à l’écrit)' }] }
      ],
    },
    {
      kind: 'section',
      role: 'expliquer',
      blocks: [
        { kind: 'paragraph', text: 'Ne et pas forment la négation.' },
        { kind: 'paragraph', text: 'Ils se placent autour du verbe.' },
        { kind: 'paragraph', text: 'Temps composé : ne + auxiliaire + pas + participe.' }
      ],
    },
    {
      kind: 'section',
      role: 'retenir',
      blocks: [
        { kind: 'paragraph', text: 'négation de base = ne … pas autour du verbe.' },
        { kind: 'table', colHeader: true, rowHeader: true, headers: ['Cas', 'Forme', 'Exemple'], rows: [['présent', 'ne + verbe + pas', 'Je ne suis pas italien.'], ['composé', 'ne + auxiliaire + pas + participe', 'Je n’ai pas compris.'], ['infinitif', 'ne pas + verbe', 'Ne pas fumer.'], ['impératif', 'ne + verbe + pas', 'Ne fumez pas !']] },
        { kind: 'astuce', text: 'Devant une voyelle : ne → n’.' }
      ],
    },
    ],
  },
  {
    id: 'a9',
    typeId: 'gram-a9-theorie',
    index: 11,
    title: 'Autres négations',
    topic: 'gram-present',
    public: 'A1 / A2',
    objectif: 'Utiliser jamais, plus, rien, personne…',
    blocks: [
    { kind: 'heading', text: 'Autres négations' },
    { kind: 'paragraph', text: '{ligne/4}' },
    { kind: 'paragraph', text: 'Je choisis la bonne négation selon le sens.' },
    { kind: 'paragraph', text: '{ligne/2}' },
    {
      kind: 'section',
      role: 'regarder',
      blocks: [
        { kind: 'examples', items: ['Je n’ai jamais gagné.', 'Je n’ai plus d’argent.'] }
      ],
    },
    {
      kind: 'section',
      role: 'expliquer',
      blocks: [
        { kind: 'paragraph', text: 'Certaines négations remplacent pas.' },
        { kind: 'paragraph', text: 'Ne … jamais = aucune fois.' },
        { kind: 'paragraph', text: 'Ne … plus = avant oui, maintenant non.' },
        { kind: 'paragraph', text: 'Après sans, le déterminant disparaît.' }
      ],
    },
    {
      kind: 'section',
      role: 'retenir',
      blocks: [
        { kind: 'paragraph', text: 'une idée négative = une négation adaptée.' },
        { kind: 'table', colHeader: true, rowHeader: true, headers: ['Affirmatif', 'Négatif'], rows: [['déjà / toujours', 'ne … jamais / ne … pas encore'], ['encore', 'ne … plus'], ['tout', 'ne … rien'], ['quelqu’un', 'ne … personne'], ['quelques', 'ne … aucun(e)'], ['avec', 'sans']] },
        { kind: 'attention', text: 'Réponse à une négation : Si = oui malgré le non.' }
      ],
    },
    ],
  },
]
