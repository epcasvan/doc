/**
 * Exercices extraits / adaptés des PDF « La grammaire au quotidien » A1 / A2
 * (énoncés scolaires originaux ClairFLE — pas de copie verbatim longue).
 * Rangés par typeId `gram-ex-{sub}-{kind}`.
 */
import type { GramBankItem } from '../types'
import { gramExerciseTypeId } from '../subthemes'

/** Sous-thèmes PDF hors conjugaison (lié à une fiche théorie SCAI). */
const PDF_ITEMS: Array<{ subId: string; kindId: string; items: GramBankItem[] }> = [
  {
    subId: 'a7',
    kindId: 'negatif',
    items: [
      {
        prompt: 'Je suis fatigué.',
        answer: 'Je ne suis pas fatigué.',
      },
      {
        prompt: 'Tu as un vélo.',
        answer: 'Tu n’as pas de vélo.',
      },
      {
        prompt: 'Elle parle anglais.',
        answer: 'Elle ne parle pas anglais.',
      },
      {
        prompt: 'Nous habitons ici.',
        answer: 'Nous n’habitons pas ici.',
      },
      {
        prompt: 'Ils vont au cinéma.',
        answer: 'Ils ne vont pas au cinéma.',
      },
      {
        prompt: 'Vous travaillez demain.',
        answer: 'Vous ne travaillez pas demain.',
      },
      {
        prompt: 'Il veut un café.',
        answer: 'Il ne veut pas de café.',
      },
      {
        prompt: 'Elles comprennent la question.',
        answer: 'Elles ne comprennent pas la question.',
      },
    ],
  },
  {
    subId: 'a7',
    kindId: 'affirmatif',
    items: [
      {
        prompt: 'Je ne suis pas malade.',
        answer: 'Je suis malade.',
      },
      {
        prompt: 'Tu n’as pas de livre.',
        answer: 'Tu as un livre.',
      },
      {
        prompt: 'Elle ne parle pas français.',
        answer: 'Elle parle français.',
      },
      {
        prompt: 'Nous n’habitons pas à Sion.',
        answer: 'Nous habitons à Sion.',
      },
      {
        prompt: 'Ils ne vont pas à l’école.',
        answer: 'Ils vont à l’école.',
      },
      {
        prompt: 'Vous ne travaillez pas le dimanche.',
        answer: 'Vous travaillez le dimanche.',
      },
    ],
  },
  {
    subId: 'a2',
    kindId: 'qcm-verbe',
    items: [
      {
        prompt: 'Marie est ___ .',
        answer: 'française',
        options: ['française', 'français', 'françaises'],
      },
      {
        prompt: 'Paul est ___ .',
        answer: 'suisse',
        options: ['suisse', 'suisses', 'suissesse'],
      },
      {
        prompt: 'Nous sommes ___ .',
        answer: 'italiens',
        options: ['italiens', 'italien', 'italienne'],
      },
      {
        prompt: 'Elle est ___ .',
        answer: 'allemande',
        options: ['allemande', 'allemand', 'allemands'],
      },
      {
        prompt: 'Ils sont ___ .',
        answer: 'portugais',
        options: ['portugais', 'portugaise', 'portugaises'],
      },
    ],
  },
  {
    subId: 'c1',
    kindId: 'qcm-conj',
    items: [
      {
        prompt: '___ tu habites ?',
        answer: 'Où',
        options: ['Où', 'Qui', 'Quoi'],
      },
      {
        prompt: '___ est-ce que tu t’appelles ?',
        answer: 'Comment',
        options: ['Comment', 'Quand', 'Combien'],
      },
      {
        prompt: '___ vient Paul ?',
        answer: 'Quand',
        options: ['Quand', 'Où', 'Qui'],
      },
      {
        prompt: '___ est cette femme ?',
        answer: 'Qui',
        options: ['Qui', 'Que', 'Quoi'],
      },
      {
        prompt: '___ as-tu ?',
        answer: 'Qu’',
        options: ['Qu’', 'Qui', 'Où'],
      },
    ],
  },
  {
    subId: 'g1',
    kindId: 'qcm-verbe',
    items: [
      {
        prompt: 'J’ai ___ pomme.',
        answer: 'une',
        options: ['une', 'un', 'des'],
      },
      {
        prompt: 'Il y a ___ pain sur la table.',
        answer: 'du',
        options: ['du', 'un', 'le'],
      },
      {
        prompt: 'Nous mangeons ___ fruits.',
        answer: 'des',
        options: ['des', 'les', 'de'],
      },
      {
        prompt: 'Elle boit ___ eau.',
        answer: 'de l’',
        options: ['de l’', 'une', 'la'],
      },
      {
        prompt: 'Tu prends ___ café ?',
        answer: 'un',
        options: ['un', 'une', 'du'],
      },
    ],
  },
  {
    subId: 'f6',
    kindId: 'fill-conj',
    items: [
      {
        prompt: 'C’est ___ livre. (je)',
        answer: 'mon',
      },
      {
        prompt: 'Voici ___ sœur. (tu)',
        answer: 'ta',
      },
      {
        prompt: '___ parents habitent ici. (elle)',
        answer: 'Ses',
      },
      {
        prompt: '___ maison est grande. (nous)',
        answer: 'Notre',
      },
      {
        prompt: '___ amis arrivent. (vous)',
        answer: 'Vos',
      },
      {
        prompt: '___ voiture est rouge. (ils)',
        answer: 'Leur',
      },
    ],
  },
  {
    subId: 'b1',
    kindId: 'qcm-verbe',
    items: [
      {
        prompt: 'Bonjour, comment allez-___ ?',
        answer: 'vous',
        options: ['vous', 'tu', 'toi'],
      },
      {
        prompt: 'Salut Pierre, comment vas-___ ?',
        answer: 'tu',
        options: ['tu', 'vous', 'toi'],
      },
      {
        prompt: 'Madame, puis-je ___ aider ?',
        answer: 'vous',
        options: ['vous', 'te', 'toi'],
      },
      {
        prompt: '___ es mon ami.',
        answer: 'Tu',
        options: ['Tu', 'Vous', 'Toi'],
      },
    ],
  },
  {
    subId: 'e1',
    kindId: 'qcm-verbe',
    items: [
      {
        prompt: 'Le livre est ___ la table.',
        answer: 'sur',
        options: ['sur', 'sous', 'dans'],
      },
      {
        prompt: 'Le chat est ___ la chaise.',
        answer: 'sous',
        options: ['sous', 'sur', 'entre'],
      },
      {
        prompt: 'Les clés sont ___ le sac.',
        answer: 'dans',
        options: ['dans', 'sur', 'chez'],
      },
      {
        prompt: 'Je suis ___ la porte.',
        answer: 'devant',
        options: ['devant', 'dans', 'sur'],
      },
      {
        prompt: 'Il habite ___ ses parents.',
        answer: 'chez',
        options: ['chez', 'à', 'dans'],
      },
    ],
  },
  {
    subId: 'h2',
    kindId: 'fill-conj',
    items: [
      {
        prompt: 'Hier, je ___ (manger) une pizza.',
        answer: 'ai mangé',
      },
      {
        prompt: 'Tu ___ (finir) tes devoirs.',
        answer: 'as fini',
      },
      {
        prompt: 'Elle ___ (regarder) un film.',
        answer: 'a regardé',
      },
      {
        prompt: 'Nous ___ (écouter) la radio.',
        answer: 'avons écouté',
      },
      {
        prompt: 'Ils ___ (parler) français.',
        answer: 'ont parlé',
      },
      {
        prompt: 'Vous ___ (travailler) hier.',
        answer: 'avez travaillé',
      },
    ],
  },
  {
    subId: 'h3',
    kindId: 'fill-conj',
    items: [
      {
        prompt: 'Je ___ (aller) au marché.',
        answer: 'suis allé',
      },
      {
        prompt: 'Elle ___ (partir) tôt.',
        answer: 'est partie',
      },
      {
        prompt: 'Nous ___ (arriver) en retard.',
        answer: 'sommes arrivés',
      },
      {
        prompt: 'Ils ___ (venir) hier.',
        answer: 'sont venus',
      },
      {
        prompt: 'Tu ___ (entrer) dans la salle.',
        answer: 'es entré',
      },
    ],
  },
  {
    subId: 'j4',
    kindId: 'fill-conj',
    items: [
      {
        prompt: 'Demain, je ___ (manger) avec mes amis.',
        answer: 'vais manger',
      },
      {
        prompt: 'Elle ___ (partir) ce soir.',
        answer: 'va partir',
      },
      {
        prompt: 'Nous ___ (étudier) demain.',
        answer: 'allons étudier',
      },
      {
        prompt: 'Ils ___ (voyager) en Italie.',
        answer: 'vont voyager',
      },
      {
        prompt: 'Tu ___ (travailler) demain matin.',
        answer: 'vas travailler',
      },
    ],
  },
  {
    subId: 'j5',
    kindId: 'fill-conj',
    items: [
      {
        prompt: 'L’année prochaine, je ___ (habiter) à Genève.',
        answer: 'habiterai',
      },
      {
        prompt: 'Il ___ (finir) ses études en juin.',
        answer: 'finira',
      },
      {
        prompt: 'Nous ___ (voyager) souvent.',
        answer: 'voyagerons',
      },
      {
        prompt: 'Elles ___ (travailler) ici.',
        answer: 'travailleront',
      },
      {
        prompt: 'Tu ___ (parler) mieux français.',
        answer: 'parleras',
      },
    ],
  },
  {
    subId: 'f11',
    kindId: 'fill-conj',
    items: [
      {
        prompt: '___ (écouter) bien ! (tu)',
        answer: 'Écoute',
      },
      {
        prompt: '___ (finir) vos exercices. (vous)',
        answer: 'Finissez',
      },
      {
        prompt: '___ (aller) à la bibliothèque. (nous)',
        answer: 'Allons',
      },
      {
        prompt: 'Ne ___ (parler) pas trop fort ! (tu)',
        answer: 'parle',
      },
      {
        prompt: '___ (prendre) le bus. (vous)',
        answer: 'Prenez',
      },
    ],
  },
  {
    subId: 'l3',
    kindId: 'pluriel',
    items: [
      {
        prompt: 'le livre → ___',
        answer: 'les livres',
      },
      {
        prompt: 'une maison → ___',
        answer: 'des maisons',
      },
      {
        prompt: 'le journal → ___',
        answer: 'les journaux',
      },
      {
        prompt: 'un cheval → ___',
        answer: 'des chevaux',
      },
      {
        prompt: 'la fleur → ___',
        answer: 'les fleurs',
      },
    ],
  },
  {
    subId: 'l3',
    kindId: 'singulier',
    items: [
      {
        prompt: 'les enfants → ___',
        answer: 'l’enfant',
      },
      {
        prompt: 'des pommes → ___',
        answer: 'une pomme',
      },
      {
        prompt: 'les animaux → ___',
        answer: 'l’animal',
      },
      {
        prompt: 'des yeux → ___',
        answer: 'un œil',
      },
    ],
  },
  {
    subId: 'a1',
    kindId: 'ecrire',
    items: [
      {
        prompt: 'Verbe : s’appeler · Mot : Marie',
        answer: '(phrase libre)',
        givenVerb: 's’appeler',
        givenWord: 'Marie',
      },
      {
        prompt: 'Verbe : habiter · Mot : Sion',
        answer: '(phrase libre)',
        givenVerb: 'habiter',
        givenWord: 'Sion',
      },
      {
        prompt: 'Verbe : être · Mot : étudiant',
        answer: '(phrase libre)',
        givenVerb: 'être',
        givenWord: 'étudiant',
      },
      {
        prompt: 'Verbe : parler · Mot : français',
        answer: '(phrase libre)',
        givenVerb: 'parler',
        givenWord: 'français',
      },
    ],
  },
]

/** Map typeId → items (PDF + notions SCAI hors profils conjugaison). */
export function pdfBankMap(): Record<string, GramBankItem[]> {
  const out: Record<string, GramBankItem[]> = {}
  for (const block of PDF_ITEMS) {
    const typeId = gramExerciseTypeId(block.subId, block.kindId)
    out[typeId] = [...(out[typeId] ?? []), ...block.items]
  }
  return out
}
