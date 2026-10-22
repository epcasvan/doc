/** Profils de conjugaison (issus de soutien-scolaire, adaptés SCAI). */

export type TenseMode =
  | 'present'
  | 'futur_proche'
  | 'passe_compose_avoir'
  | 'passe_compose_etre'
  | 'imparfait'
  | 'futur_simple'

export type VerbConj = {
  infinitive: string
  stem: string
  forms: [string, string, string, string, string, string, string, string]
  endings?: [string, string, string, string, string, string, string, string]
  participe?: string
  participeF?: string
  reflexive?: [string, string, string, string, string, string, string, string]
}

export type SubProfile = {
  subId: string
  mode: TenseMode
  verbs: VerbConj[]
  verbPool: string[]
  wordPool: string[]
  tails?: string[]
}

export const STANDARD_PRONOUNS = [
  { display: 'Je', elide: false },
  { display: 'Tu', elide: false },
  { display: 'Il', elide: false },
  { display: 'Elle', elide: false },
  { display: 'Nous', elide: false },
  { display: 'Vous', elide: false },
  { display: 'Ils', elide: false },
  { display: 'Elles', elide: false },
] as const

export const DEFAULT_TAILS = [
  ' à l’école.',
  ' le matin.',
  ' souvent.',
  ' avec des amis.',
  ' en ville.',
  ' le week-end.',
  ' tard.',
  ' ensemble.',
  ' tous les jours.',
  ' ce soir.',
]

const WORDS = [
  'école',
  'maison',
  'ami',
  'matin',
  'soir',
  'ville',
  'travail',
  'famille',
  'livre',
  'musique',
]

function er(inf: string, stem: string): VerbConj {
  return {
    infinitive: inf,
    stem,
    endings: ['e', 'es', 'e', 'e', 'ons', 'ez', 'ent', 'ent'],
    forms: [
      `${stem}e`,
      `${stem}es`,
      `${stem}e`,
      `${stem}e`,
      `${stem}ons`,
      `${stem}ez`,
      `${stem}ent`,
      `${stem}ent`,
    ],
    participe: `${stem}é`,
  }
}

function ir(inf: string, stem: string): VerbConj {
  return {
    infinitive: inf,
    stem,
    endings: ['is', 'is', 'it', 'it', 'issons', 'issez', 'issent', 'issent'],
    forms: [
      `${stem}is`,
      `${stem}is`,
      `${stem}it`,
      `${stem}it`,
      `${stem}issons`,
      `${stem}issez`,
      `${stem}issent`,
      `${stem}issent`,
    ],
    participe: `${stem}i`,
  }
}

function imparfait(stem: string, inf: string): VerbConj {
  return {
    infinitive: inf,
    stem,
    endings: ['ais', 'ais', 'ait', 'ait', 'ions', 'iez', 'aient', 'aient'],
    forms: [
      `${stem}ais`,
      `${stem}ais`,
      `${stem}ait`,
      `${stem}ait`,
      `${stem}ions`,
      `${stem}iez`,
      `${stem}aient`,
      `${stem}aient`,
    ],
    participe: `${stem}é`,
  }
}

function futur(inf: string): VerbConj {
  const base = inf.endsWith('re') ? inf.slice(0, -1) : inf
  return {
    infinitive: inf,
    stem: base,
    endings: ['ai', 'as', 'a', 'a', 'ons', 'ez', 'ont', 'ont'],
    forms: [
      `${base}ai`,
      `${base}as`,
      `${base}a`,
      `${base}a`,
      `${base}ons`,
      `${base}ez`,
      `${base}ont`,
      `${base}ont`,
    ],
    participe: inf.endsWith('er')
      ? `${inf.slice(0, -2)}é`
      : inf.endsWith('ir')
        ? `${inf.slice(0, -2)}i`
        : `${base}u`,
  }
}

const ETRE: VerbConj = {
  infinitive: 'être',
  stem: '',
  forms: ['suis', 'es', 'est', 'est', 'sommes', 'êtes', 'sont', 'sont'],
  participe: 'été',
}

const AVOIR: VerbConj = {
  infinitive: 'avoir',
  stem: 'av',
  endings: ['ai', 'as', 'a', 'a', 'ons', 'ez', 'ont', 'ont'],
  forms: ['ai', 'as', 'a', 'a', 'avons', 'avez', 'ont', 'ont'],
  participe: 'eu',
}

const ALLER: VerbConj = {
  infinitive: 'aller',
  stem: 'all',
  forms: ['vais', 'vas', 'va', 'va', 'allons', 'allez', 'vont', 'vont'],
  participe: 'allé',
  participeF: 'allée',
}

const VENIR: VerbConj = {
  infinitive: 'venir',
  stem: 'ven',
  forms: ['viens', 'viens', 'vient', 'vient', 'venons', 'venez', 'viennent', 'viennent'],
  participe: 'venu',
  participeF: 'venue',
}

const PARTIR: VerbConj = {
  infinitive: 'partir',
  stem: 'par',
  endings: ['s', 's', 't', 't', 'tons', 'tez', 'tent', 'tent'],
  forms: ['pars', 'pars', 'part', 'part', 'partons', 'partez', 'partent', 'partent'],
  participe: 'parti',
  participeF: 'partie',
}

const MANGER = er('manger', 'mang')
const PARLER = er('parler', 'parl')
const FINIR = ir('finir', 'fin')

export const SUB_PROFILES: SubProfile[] = [
  {
    subId: 'etre',
    mode: 'present',
    verbs: [ETRE],
    verbPool: ['être'],
    wordPool: WORDS,
  },
  {
    subId: 'avoir',
    mode: 'present',
    verbs: [AVOIR],
    verbPool: ['avoir'],
    wordPool: WORDS,
  },
  {
    subId: 'er',
    mode: 'present',
    verbs: [PARLER, er('habiter', 'habit'), er('travailler', 'travaill'), er('écouter', 'écout')],
    verbPool: ['parler', 'habiter', 'travailler', 'écouter', 'regarder', 'aimer'],
    wordPool: WORDS,
  },
  {
    subId: 'er-particuliers',
    mode: 'present',
    verbs: [
      {
        infinitive: 'manger',
        stem: 'mang',
        endings: ['e', 'es', 'e', 'e', 'eons', 'ez', 'ent', 'ent'],
        forms: ['mange', 'manges', 'mange', 'mange', 'mangeons', 'mangez', 'mangent', 'mangent'],
        participe: 'mangé',
      },
      {
        infinitive: 'acheter',
        stem: 'achèt',
        endings: ['e', 'es', 'e', 'e', 'ons', 'ez', 'ent', 'ent'],
        forms: [
          'achète',
          'achètes',
          'achète',
          'achète',
          'achetons',
          'achetez',
          'achètent',
          'achètent',
        ],
        participe: 'acheté',
      },
      {
        infinitive: 'préférer',
        stem: 'préfèr',
        endings: ['e', 'es', 'e', 'e', 'ons', 'ez', 'ent', 'ent'],
        forms: [
          'préfère',
          'préfères',
          'préfère',
          'préfère',
          'préférons',
          'préférez',
          'préfèrent',
          'préfèrent',
        ],
        participe: 'préféré',
      },
    ],
    verbPool: ['manger', 'acheter', 'préférer', 'appeler', 'jeter'],
    wordPool: WORDS,
  },
  {
    subId: 'ir',
    mode: 'present',
    verbs: [FINIR, ir('choisir', 'chois'), PARTIR],
    verbPool: ['finir', 'choisir', 'partir', 'dormir', 'ouvrir'],
    wordPool: WORDS,
  },
  {
    subId: 're-oir',
    mode: 'present',
    verbs: [
      {
        infinitive: 'prendre',
        stem: 'pren',
        forms: [
          'prends',
          'prends',
          'prend',
          'prend',
          'prenons',
          'prenez',
          'prennent',
          'prennent',
        ],
        participe: 'pris',
      },
      {
        infinitive: 'voir',
        stem: 'voi',
        forms: ['vois', 'vois', 'voit', 'voit', 'voyons', 'voyez', 'voient', 'voient'],
        participe: 'vu',
      },
      {
        infinitive: 'faire',
        stem: 'fa',
        forms: ['fais', 'fais', 'fait', 'fait', 'faisons', 'faites', 'font', 'font'],
        participe: 'fait',
      },
    ],
    verbPool: ['prendre', 'voir', 'faire', 'boire', 'mettre'],
    wordPool: WORDS,
  },
  {
    subId: 'modaux',
    mode: 'present',
    verbs: [
      {
        infinitive: 'vouloir',
        stem: 'veu',
        forms: ['veux', 'veux', 'veut', 'veut', 'voulons', 'voulez', 'veulent', 'veulent'],
      },
      {
        infinitive: 'pouvoir',
        stem: 'peu',
        forms: ['peux', 'peux', 'peut', 'peut', 'pouvons', 'pouvez', 'peuvent', 'peuvent'],
      },
      {
        infinitive: 'devoir',
        stem: 'do',
        forms: ['dois', 'dois', 'doit', 'doit', 'devons', 'devez', 'doivent', 'doivent'],
      },
    ],
    verbPool: ['vouloir', 'pouvoir', 'devoir', 'savoir'],
    wordPool: WORDS,
  },
  {
    subId: 'pronominaux',
    mode: 'present',
    verbs: [
      {
        infinitive: 'se lever',
        stem: 'lève',
        reflexive: [
          'me',
          'te',
          'se',
          'se',
          'nous',
          'vous',
          'se',
          'se',
        ],
        forms: ['lève', 'lèves', 'lève', 'lève', 'levons', 'levez', 'lèvent', 'lèvent'],
      },
      {
        infinitive: 'se coucher',
        stem: 'couche',
        reflexive: [
          'me',
          'te',
          'se',
          'se',
          'nous',
          'vous',
          'se',
          'se',
        ],
        forms: [
          'couche',
          'couches',
          'couche',
          'couche',
          'couchons',
          'couchez',
          'couchent',
          'couchent',
        ],
      },
    ],
    verbPool: ['se lever', 'se coucher', 's’habiller', 'se laver'],
    wordPool: WORDS,
  },
  {
    subId: 'pc-avoir',
    mode: 'passe_compose_avoir',
    verbs: [MANGER, FINIR, PARLER, er('regarder', 'regard')],
    verbPool: ['manger', 'finir', 'parler', 'regarder', 'écouter'],
    wordPool: WORDS,
  },
  {
    subId: 'pc-etre',
    mode: 'passe_compose_etre',
    verbs: [ALLER, VENIR, PARTIR],
    verbPool: ['aller', 'venir', 'partir', 'arriver', 'entrer'],
    wordPool: WORDS,
  },
  {
    subId: 'imparfait',
    mode: 'imparfait',
    verbs: [imparfait('parl', 'parler'), imparfait('finiss', 'finir'), imparfait('pren', 'prendre')],
    verbPool: ['parler', 'finir', 'prendre', 'habiter', 'travailler'],
    wordPool: WORDS,
  },
  {
    subId: 'futur-proche',
    mode: 'futur_proche',
    verbs: [MANGER, PARTIR, er('travailler', 'travaill'), FINIR],
    verbPool: ['manger', 'partir', 'travailler', 'finir', 'étudier'],
    wordPool: WORDS,
  },
  {
    subId: 'futur-simple',
    mode: 'futur_simple',
    verbs: [futur('parler'), futur('finir'), futur('vendre')],
    verbPool: ['parler', 'finir', 'vendre', 'travailler', 'habiter'],
    wordPool: WORDS,
  },
  {
    subId: 'futur-proche-ou-simple',
    mode: 'futur_proche',
    verbs: [MANGER, er('travailler', 'travaill'), PARTIR],
    verbPool: ['manger', 'travailler', 'partir', 'finir'],
    wordPool: WORDS,
  },
]

export function profileBySubId(subId: string): SubProfile | undefined {
  return SUB_PROFILES.find((p) => p.subId === subId)
}
