import { theoryGabarit } from '@/francais/grammar-theory'
import type { GrammaireTheoryDoc } from '../types'

/** Théorie FALC — thème gram-se-presenter. Français seul (pas de traductions). */
export const sePresenterDocs: GrammaireTheoryDoc[] = [
  {
    id: 'a1',
    typeId: 'gram-a1-theorie',
    index: 1,
    title: 'Qui suis-je ?',
    topic: 'gram-se-presenter',
    public: 'pré-A1 / A1',
    objectif: 'Me présenter avec être, habiter, parler, s’appeler.',
    blocks: [
    { kind: 'heading', text: 'Qui suis-je ?' },
    { kind: 'paragraph', text: '{ligne/4}' },
    { kind: 'paragraph', text: 'Pour me présenter, je donne des {g}informations simples{/g}.' },
	  { kind: 'paragraph', text: '{ligne/2}' },
    {
      kind: 'section',
      role: 'regarder',
      blocks: [
        { kind: 'examples', marker: 'puces', items: [
          '{tab:1<}Je m’appelle {c}Nina{/c}. | J’ai {c}17 ans{/c}.', 
          '{tab:1<}Je suis {c}belge{/c}. | Je viens de {c}Belgique{/c}.', 
          '{tab:1<}J’habite à {c}Martigny{/c}. | Je parle {c}français{/c}.',
        ] },
      ],
    },
    {
      kind: 'section',
      role: 'expliquer',
      blocks: [
        { kind: 'paragraph', text: 'J’utilise les différents {c}verbes{/c} pour décrire qui je suis. Un {c}verbe{/c}, c’est un mot d’{c}action{/c} ou d’{c}état{/c}.' },
        { kind: 'paragraph', text: '{ligne/2}' },
        { kind: 'examples', marker: 'puces', items: [
          '{tab:2++}{g}Verbe{/g} | {g}Mots{/g} | {g}Exemples{/g}',
          '{tab:2+>}S’appeler | + {c}prénom{/c} | Je m’appelle {c}Fatima{/c}.', 
          '{tab:2+>}Avoir | + {c}âge{/c} | J’ai {c}16 ans{/c}.', 
          '{tab:2+>}Être | + {c}nationalité{/c} | Je suis {c}syrienne{/c}.', 
          '{tab:2+>}Venir de | + {c}pays{/c} | Je viens de {c}Syrie{/c}.', 
          '{tab:2+>}Habiter à | + {c}ville{/c} | J’habite à {c}Vouvry{/c}.', 
          '{tab:2+>}Parler | + {c}langue{/c} | Je parle {c}arabe{/c}.'
        ] },
      ],
    },
    {kind: 'page'},
    {
      kind: 'section',
      role: 'retenir',
      blocks: [
        { kind: 'paragraph', text: 'Pour me présenter, je donne mon prénom, mon âge, ma nationalité, mon pays d’origine, ma ville et la langue que je parle.'},
        { kind: 'paragraph', text: '{ligne/2}' },
        {
          kind: 'table',
          colHeader: true,
          rowHeader: false,
          headers: ['Information', 'Structure', 'Exemple'],
          rows: [
            ['Mon prénom', '{c}s’appeler{/c}', 'Je {c}m’appelle{/c} Nina.',],
            ['Mon âge', '{c}avoir{/c} + âge', 'J’{c}ai{/c} 17 ans.',],
            ['Ma nationalité', '{c}être{/c} + nationalité', 'Je {c}suis{/c} belge.',],
            ['Mon pays d’origine', '{c}venir de{/c} + pays', 'Je {c}viens{/c} de Belgique.',],
            ['Ma ville', '{c}habiter à{/c} + ville', 'J’{c}habite{/c} à Martigny.',],
            ['Ma langue', '{c}parler{/c} + langue', 'Je {c}parle{/c} français.',],
          ],
        },

        { kind: 'paragraph', text: '{ligne/2}' },
        { kind: 'paragraph', text: '{c}Attention :{/c} Je dit mon âge avec le verbe {c}avoir{/c} !'},
        { kind: 'examples', items: [
          { text: 'Je dis : « J’{c}ai{/c} 17 ans. »', wrong: 'Je suis 17 ans.' },
        ]},
    ]},
  ],
  },
  {
    id: 'a2',
    typeId: 'gram-a2-theorie',
    index: 2,
    title: 'Pronoms sujet',
    topic: 'gram-se-presenter',
    public: 'pré-A1 / A1',
    objectif: 'Choisir le pronom sujet qui remplace une personne.',
    blocks: [
      { kind: 'heading', text: 'Pronoms sujet' },
      { kind: 'paragraph', text: '{ligne/4}' },
      { kind: 'paragraph', text: 'Un pronom sujet remplace une personne, un groupe de personnes ou un nom.' },
      { kind: 'paragraph', text: '{ligne/2}' },
      {
        kind: 'section',
        role: 'regarder',
        blocks: [
          { kind: 'examples', items: ['{tab:1>}{c}Ma fille{/c} s’appelle Alicia. | {c}Elle{/c} s’appelle Lisa.', '{tab:1>}{c}Paul et moi{/c} habitons à Sion | {c}Nous{/c} habitons à Sion.'] },
        ],
      },
      {
        kind: 'section',
        role: 'expliquer',
        blocks: [          
          { kind: 'paragraph', text: 'J’utilise {c}on{/c} pour représenter plusieurs personnes. Il est très utilisé à l’oral familier. Le verbe est {c}toujours au singulier.{/c}' },
          { kind: 'examples', marker: 'puces',items: ['{tab:1>}Nous | {c}On{/c} va au magasin.'] },
          { kind: 'paragraph', text: '{ligne/2}' },

          { kind: 'paragraph', text: 'J’utilise {c}tu{/c} pour parler à une personne que je connaîs, dans une situation familière.' },
          { kind: 'examples', marker: 'puces',items: ['{tab:1>}Alona ♀ | {c}Tu{/c} es là ?'] },
          { kind: 'paragraph', text: '{ligne/2}' },

          { kind: 'paragraph', text: 'J’utilise {c}vous{/c} quand on ne connaît pas la personne ou que le statut est différent (élève–professeur). On appelle cela la forme de {c}politesse{/c}.' },
          { kind: 'examples', marker: 'puces',items: ['{tab:1>}La professeure | Madame, {c}vous{/c} allez bien ?'] },
          { kind: 'paragraph', text: '{ligne/2}' },

          { kind: 'paragraph', text: 'J’utilise {c}ils{/c} quand il y a un groupe mixte de femmes et d’hommes. Même s’il y a beaucoup de femmes et un seul homme.' },
          { kind: 'examples', marker: 'puces',items: ['{tab:1>}Mes soeurs et mon frère | {c}Ils{/c} étudient à la bibliothèque.' ] },
          ],
      },
      { kind: 'page' },
      {
        kind: 'section',
        role: 'retenir',
        blocks: [
          { kind: 'paragraph', text: 'Je choisis le pronom selon la personne ou le groupe.' },
          { kind: 'paragraph', text: '{ligne/2}' },
          { kind: 'table', colHeader: true, rowHeader: false, headers: ['Singulier', 'Pluriel'], rows: [
            ['{c}je{/c}/n moi', '{c}nous{/c}/n moi et d’autres personnes'],
            ['{c}tu{/c}/n un ami', '{c}vous{/c}/n des personnes ou politesse'],
            ['{c}il{/c}/n un homme', '{c}ils{/c}/n des hommes ou un groupe d’hommes et de femmes'],
            ['{c}elle{/c}/n une femme', '{c}elles{/c}/n des femmes'],
          ] },
          { kind: 'paragraph', text: '{ligne/2}' },

          { kind: 'paragraph', text: 'Le pronom sujet se place {c}devant le verbe{/c}.' },
          { kind: 'paragraph', text: '{ligne/4}' },
          { kind: 'paragraph', text: 'Pour {c}trouver le sujet{/c} de la phrase :'},
          { kind: 'examples', marker: 'numeros', 
            items: ['Je regarde le {c}verbe{/c}', 'Je pose la question : {c}Qui fait cela ?{/c} ou {c}Qui est comme ça ?{/c}.' ] },
        ],
      },
      
    ],
  },
  {
    id: 'a3',
    typeId: 'gram-a3-theorie',
    index: 3,
    title: 'Adjectifs de nationalité',
    topic: 'gram-se-presenter',
    public: 'A1',
    objectif: 'Accorder l’adjectif de nationalité.',
    blocks: [
    { kind: 'heading', text: 'Adjectifs de nationalité' },
    { kind: 'paragraph', text: '{ligne/4}' },
    { kind: 'paragraph', text: 'Je dis ma nationalité au masculin ou au féminin.' },
    {
      kind: 'section',
      role: 'regarder',
      blocks: [
        { kind: 'examples', items: [
          '{tab:1>}Paul est {c}allemand.{/c} | Susanne est {c}allemande.{/c}',
          '{tab:1>}Il est {c}français.{/c} | Elle est {c}française.{/c}',
          '{tab:1>}Il est {c}afghan.{/c} | Elle est {c}afghane.{/c}',
        ] }
      ],
    },
    {
      kind: 'section',
      role: 'expliquer',
      blocks: [
        { kind: 'paragraph', text: 'En général, pour former le féminin, je rajoute un {c}e{/c}.' },
        { kind: 'paragraph', text: '{ligne/4}' },
        { kind: 'paragraph', text: 'Si l’adjectif finit par {c}en{/c}, je double la consonne et je rajoute un {c}e{/c}.' },
        { kind: 'paragraph', text: '{ligne/4}' },
        { kind: 'paragraph', text: 'Si le masculin finit déjà par {c}e{/c}, le féminin {c}ne change pas{/c}.' },
        { kind: 'paragraph', text: '{ligne/2}' },
        { kind: 'table', colHeader: true, rowHeader: true, 
          headers: ['Masculin', 'Féminin', 'Exemples'], 
          rows: [
            ['-ais', '-aise', '{tab:1>}japon{c}ais{/c} | japon{c}aise{/c}'], 
            ['-ois', '-oise', '{tab:1>}chin{c}ois{/c} | chin{c}oise{/c}'], 
            ['-ain', '-aine', '{tab:1>}améric{c}ain{/c} | améric{c}aine{/c}'], 
            ['-en', '-enne', '{tab:1>}itali{c}en{/c} | itali{c}enne{/c}'],
            ['-e', '-e', '{tab:1>}suiss{c}e{/c} | suiss{c}e{/c}']
          ] },
        { kind: 'paragraph', text: '{ligne/2}' },
        { kind: 'paragraph', text: '{c}Attention :{/c}' },
        { kind: 'paragraph', text: 'Les adjectifs terminant par {c}c{/c} change en {c}que{/c} ou {c}cque{/c}.' },
        { kind: 'examples', marker: 'puces', items: [
          '{tab:3><>}tur{c}c{/c} | tur{c}que{/c} | gre{c}c{/c} | gre{c}cque{/c}',
        ] },
      ],
    },
    {kind: 'page'},
    {
      kind: 'section',
      role: 'retenir',
      blocks: [
        { kind: 'paragraph', text: 'Un adjectif de nationalité dit le pays d’une personne.' },
        { kind: 'paragraph', text: '{ligne/2}' },
        { kind: 'paragraph', text: 'Souvent, j’ajoute un {c}e{/c} au féminin.' },
        { kind: 'paragraph', text: '{ligne/2}' },
        { kind: 'examples', marker: 'puces', items: [
          '{tab:+2++}{g}Masculin{/g} | {g}Terminaison{/g} | {g}Féminin{/g}',
          '{tab:2+>}Il est {c}espognol{/c} | + {c}e{/c} | Elle est {c}belge{/c}',
          '{tab:2+>}Il est {c}ukrainien{/c} | + {c}ne{/c} | Elle est {c}ukrainienne{/c}',
          '{tab:2+>}Il est {c}turc{/c} | + {c}que{/c} | {c}turque{/c}',
          '{tab:2+>}Il est {c}russe{/c} | | Elle est {c}russe{/c}',

        ] },
      ],
    },
    ],
  },
  {
    id: 'a6',
    typeId: 'gram-a6-theorie',
    index: 6,
    title: 'Provenance',
    topic: 'gram-se-presenter',
    public: 'A1',
    objectif: 'Dire d’où je viens.',
    blocks: [
    { kind: 'heading', text: 'Provenance' },
    { kind: 'paragraph', text: '{ligne/4}' },
    { kind: 'paragraph', text: 'Je dis ma provenance avec le verbe {c}venir{/c} et la préposition {c}de{/c}.' },
    { kind: 'paragraph', text: '{ligne/2}' },
    {
      kind: 'section',
      role: 'regarder',
      blocks: [
        { kind: 'examples', items: [
          'Mamadou viens {c}du Sénégal{/c}.', 
          'Mei vient {c}de Chine{/c}.', 
          'Julia viens {c}des Pays-Bas{/c}.' ]
        }
      ],
    },
    {
      kind: 'section',
      role: 'expliquer',
      blocks: [
        { kind: 'paragraph', text: 'Pour dire mon pays d’origine, j’utilise le verbe {c}venir{/c}.' },
        { kind: 'paragraph', text: 'Je dis : je viens du Sénégal, de Chine ou d’Irak.' },
        { kind: 'paragraph', text: '{ligne/4}' },
        { kind: 'paragraph', text: 'J’utilise {c}du{/c}, {c}de{/c}, {c}d’{/c} ou {c}des{/c}.' },
        { kind: 'paragraph', text: 'Le mot {c}de{/c} change selon le nom du pays.' },
        { kind: 'paragraph', text: '{ligne/2}' },
        { kind: 'examples', marker: 'puces', items: [
          '{tab:+2++}{g}Nom du pays{/g} | {g}Préposition{/g} | {g}Exemples{/g}',
          '{tab:2+>}Pays masculin | {c}du{/c} | Elle vient {c}du{/c} {c}Brésil{/c}',
          '{tab:2+>}Pays féminin | {c}de{/c} | Elle vient {c}de{/c} {c}Suisse{/c}',
          '{tab:2+>}Pays avec une voyelle | {c}d’{/c} | Elle vient {c}d’{/c} Ukraine',
          '{tab:2+>}Pays au pluriel | {c}des{/c} | Elle vient {c}des{/c} Etats-unis',
        ] },
      ],
    },
    {kind: 'page'},
    {
      kind: 'section',
      role: 'retenir',
      blocks: [
        { kind: 'paragraph', text: 'J’utilise {c}Venir de{/c} pour dire d’où je viens.' },
        { kind: 'paragraph', text: '{ligne/4}' },
        { kind: 'paragraph', text: 'La préposition {c}de{/c} change de forme selon le genre du pays.' },
        { kind: 'paragraph', text: '{ligne/2}' },
        { kind: 'table', colHeader: true, rowHeader: true, 
          headers: ['Nom du pays', 'Préposition', 'Exemples'], 
          rows: [
          ['Pays masculin', 'du', 'Je viens du Vietnam.'], 
          ['Pays féminin', 'de', 'Je viens de France.'],
          ['Avec une voyelle', 'd’', 'Je viens d’Autriche.'], 
          ['Pays au pluriel', 'des', 'Je viens des Philippines.'], 
        ] },
        { kind: 'paragraph', text: '{ligne/2}' },
        { kind: 'paragraph', text: '{c}Attention :{/c} Il ne faut pas mélanger les verbes {c}aller{/c} et {c}venir de{/c}.' },
        { kind: 'examples', marker: 'puces',
          items: [
            '{tab:1+}Je {c}vais au{/c} Sénégal. | = Je pars vers le Sénégal.',
            '{tab:1+}Je {c}viens du{/c} Sénégal. | = Le Sénégal est mon pays d’origine.'
          ]
        }

      ],
    },
    ],
  },
  {
    id: 'a7',
    typeId: 'gram-a7-theorie',
    index: 7,
    title: 'Dire son âge',
    topic: 'gram-se-presenter',
    public: 'pré-A1 / A1',
    objectif: 'Dire mon âge avec avoir + ans.',
    blocks: [
    { kind: 'heading', text: 'Dire son âge' },
    { kind: 'paragraph', text: 'Je dis mon âge avec le verbe avoir.' },
    {
      kind: 'section',
      role: 'regarder',
      blocks: [
        { kind: 'examples', items: ['{tab:1>}Quel {c}âge{/c} as-tu ? | J’ai {c}25 ans{/a}.'] },
      ],
    },
    {
      kind: 'section',
      role: 'expliquer',
      blocks: [
        { kind: 'paragraph', text: 'En français, j’utilise {c}avoir{/c} + nombre + an(s).' },
        { kind: 'paragraph', text: '{ligne/4}' },
        { kind: 'attention', text: 'Je ne dis pas « je suis 25 ans ».' },
      ],
    },
    {
      kind: 'section',
      role: 'retenir',
      blocks: [
        { kind: 'paragraph', text: 'Je dis mon âge avec le verbe {c}avoir{/c} + {c}nombre{/c} + {c}an(s){/c}.' },
        { kind: 'paragraph', text: '{ligne/4}' },
        { kind: 'table', colHeader: true, rowHeader: true, 
          headers: ['Personne', 'Forme', 'Exemple'], 
          rows: [
            ['je', '{c}ai{/c}', 'J’{c}ai{/c} 15 ans.'], 
            ['tu', '{c}as{/c}', 'Tu {c}as{/c} 12 ans.'], 
            ['il / elle / on', '{c}a{/c}', 'Elle {c}a{/c} 45 ans.'], 
            ['nous', '{c}avons{/c}', 'Nous {c}avons{/c} 27 ans.'], 
            ['vous', '{c}avez{/c}', 'Vous {c}avez{/c} 50 ans.'], 
            ['ils / elles', '{c}ont{/c}', 'Ils {c}ont{/c} 20 ans.']
          ] },
        { kind: 'astuce', text: 'Un an → an. Plusieurs années → an{c}s{/c}.' },
      ],
    },
    ],
  },
  {
    id: 'famille',
    typeId: 'gram-famille-theorie',
    index: 10,
    title: 'Famille',
    topic: 'gram-se-presenter',
    public: 'pré-A1 / A1',
    objectif: 'Parler de sa famille avec les déterminants possessifs.',
    blocks: [
      { kind: 'heading', text: 'Parler de sa famille' },
      { kind: 'paragraph', text: '{ligne/4}' },
      { kind: 'paragraph', text: 'Pour parler de ma famille, j’utilise les {c}déterminants possessifs{/c}.' },
      { kind: 'paragraph', text: '{ligne/2}' },
      {
        kind: 'section',
        role: 'regarder',
        blocks: [
          { kind: 'examples', items: [
            '{tab:1<}C’est {c}mon{/c} frère | C’est {c}ta{/c} soeur ?',
            '{tab:1<}Ce sont {c}ses{/c} enfants ? | Voici {c}notre{/c} mère.',
            '{tab:1<}Comment est {c}votre{/c} père ? | {c}Leur{/c} oncle est ici.',
          ] },
        ],
      },
      {
        kind: 'section',
        role: 'expliquer',
        blocks: [
          { kind: 'paragraph', text: 'Le {c}déterminant possessif{/c} indique avec qui une personne est en relation.' },
          { kind: 'paragraph', text: '{ligne/4}' },
          { kind: 'paragraph', text: 'Je choisis le déterminant selon la personne {c}qui parle{/c} et le {c}nom de la personne{/c} de ma famille.' },
          { kind: 'paragraph', text: '{ligne/4}' },
          { kind: 'paragraph', text: 'Le déterminant change selon le nom : masculin, féminin ou pluriel.' },
          { kind: 'paragraph', text: '{ligne/2}' },
          { kind: 'exemples', marker: 'puces', items: [
            '{tab:+2++}Je parle de…', 'J’utilise…', 'Exemple'
            '{tab:2+>}Un homme', '{c}mon{/c}', '{c}mon{/c} père',
            '{tab:2+>}Une femme', '{c}ma{/c}', '{c}ma{/c} mère',
            '{tab:2+>}Plusieurs personnes', '{c}mes{/c}', '{c}mes{/c} parents',
          ]},
        ],
      },
      {
        kind: 'section',
        role: 'retenir',
        blocks: [
          { kind: 'paragraph', text: 'Le déterminant possessif se place {c}devant{/c} le nom.' },
          { kind: 'paragraph', text: '{ligne/4}' },
          { kind: 'paragraph', text: 'Pour bien choisir, je regarde : ' },
          { kind: 'exemples', marker: 'numeros', items: [
            '{tab:2++}{c}Qui parle{/c} ?| Le pronom sujet | : je, tu, il, elle, nous, vous, ils, elles.',
            '{tab:2++}{c}Quel est le nom{/c} ? | Le genre du nom | : masculin, féminin, pluriel',
          ]},
          { kind: 'table', colHeader: true, rowHeader: true,
            headers: ['Personne', 'Masculin', 'Féminin', 'Pluriel'],
            rows: [
              ['Je', '{c}mon{/c} père', '{c}ma{/c} mère', '{c}mes{/c} parents'],
              ['Tu', '{c}ton{/c} père', '{c}ta{/c} mère', '{c}tes{/c} parents'],
              ['Il / Elle', '{c}son{/c} père', '{c}sa{/c} mère', '{c}ses{/c} parents'],
              ['Nous', '{c}notre{/c} père', '{c}notre{/c} mère', '{c}nos{/c} parents'],
              ['Vous', '{c}votre{/c} père', '{c}votre{/c} mère', '{c}vos{/c} parents'],
              ['Ils / Elles', '{c}leur{/c} père', '{c}leur{/c} mère', '{c}leurs{/c} parents'],
            ],
          },
          { kind: 'paragraph', text: '{ligne/4}' },
          { kind: 'astuce', text: 'ma, ta et sa devant une voyelle change en mon, ton et son'},
          { kind: 'paragraph', text: '{ligne/4}' },
          { kind: 'exemples', marker: 'puces', items: [
            { text: 'Je dis : « {c}Mon{/c} amie. »', wrong: 'Ma amie.' },
            { text: 'Je dis : « {c}Ton{/c} étudiante. »', wrong: 'Ta étudiante.' },
          ] },
        ],
      },
    ],
  },
]
