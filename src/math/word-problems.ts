/**
 * Problèmes d’algèbre à variables (même idée que les problèmes TCM) :
 * le texte suit les nombres, le corrigé se recalcule en mode libre.
 * Situations adaptées des fiches de compréhension (pas une copie des énoncés).
 */
import { fmt } from './column-arith'
import { describeSwissChange } from './money-change'
import { int, pick, type Rng } from './rng'
import type { Difficulty, MathItem } from './types'
import type { ProblemKind } from './problems'
import { SUITE_SPECS } from './word-problems-suite'

export type Vars = Record<string, number>

export type Spec = {
  id: string
  label: string
  kinds: ProblemKind[]
  levels: Difficulty[]
  defs: { key: string; label: string }[]
  /** Monnaie suisse à rendre, en billets et en pièces. */
  change?: boolean
  roll: (rng: Rng) => Vars
  build: (v: Vars) => { prompt: string; calc: string; response: string; result: number }
}

const round2 = (n: number) => Math.round(n * 100) / 100

function money(rng: Rng, lo: number, hi: number): number {
  return round2(int(rng, lo * 10, hi * 10) / 10)
}

function itemFrom(spec: Spec, vars: Vars): MathItem {
  const built = spec.build(vars)
  const change = spec.change ? describeSwissChange(built.result) : undefined
  return {
    layout: 'text',
    prompt: built.prompt,
    calcAnswer: built.calc,
    responseAnswer: change && built.result >= 0 ? change.sentence : built.response,
    answer: fmt(built.result),
    problemTemplateId: spec.id,
    problemVars: { ...vars },
    problemVarDefs: spec.defs.map((d) => ({ key: d.key, label: d.label, editOn: 'both' as const })),
    problemPart: 0,
    labels: spec.change ? ['sketch-change'] : ['sketch-vars'],
    changeParts: change?.parts,
  }
}

const BASE_SPECS: Spec[] = [
  {
    id: 'wp-plus-que',
    label: 'En a de plus',
    kinds: ['addition', 'melange'],
    levels: ['facile', 'moyen'],
    defs: [
      { key: 'a', label: 'Nombre de Jonas' },
      { key: 'b', label: 'De plus' },
    ],
    roll: (rng) => ({ a: int(rng, 4, 40), b: int(rng, 2, 25) }),
    build: (v) => {
      const r = v.a! + v.b!
      return {
        prompt: `Jonas a ${fmt(v.a!)} crayons. Léa en a ${fmt(v.b!)} de plus. Combien de crayons Léa a-t-elle ?`,
        calc: `${fmt(v.a!)} + ${fmt(v.b!)}`,
        response: `Léa a ${fmt(r)} crayons.`,
        result: r,
      }
    },
  },
  {
    id: 'wp-deux-groupes',
    label: 'Deux groupes à additionner',
    kinds: ['addition', 'melange'],
    levels: ['facile', 'moyen'],
    defs: [
      { key: 'a', label: 'Rouges' },
      { key: 'b', label: 'Bleues' },
    ],
    roll: (rng) => ({ a: int(rng, 6, 80), b: int(rng, 4, 60) }),
    build: (v) => {
      const r = v.a! + v.b!
      return {
        prompt: `Inès a ${fmt(v.a!)} voitures rouges et ${fmt(v.b!)} voitures bleues. Combien de voitures a-t-elle en tout ?`,
        calc: `${fmt(v.a!)} + ${fmt(v.b!)}`,
        response: `Inès a ${fmt(r)} voitures en tout.`,
        result: r,
      }
    },
  },
  {
    id: 'wp-trois-sauts',
    label: 'Trois quantités à additionner',
    kinds: ['addition', 'melange'],
    levels: ['moyen', 'avance'],
    defs: [
      { key: 'a', label: '1ʳᵉ série' },
      { key: 'b', label: '2ᵉ série' },
      { key: 'c', label: '3ᵉ série' },
    ],
    roll: (rng) => ({ a: int(rng, 12, 80), b: int(rng, 20, 160), c: int(rng, 30, 240) }),
    build: (v) => {
      const r = v.a! + v.b! + v.c!
      return {
        prompt: `Nora fait d’abord ${fmt(v.a!)} sauts, puis ${fmt(v.b!)} sauts, puis encore ${fmt(v.c!)} sauts. Combien de sauts a-t-elle faits en tout ?`,
        calc: `${fmt(v.a!)} + ${fmt(v.b!)} + ${fmt(v.c!)}`,
        response: `Nora a fait ${fmt(r)} sauts.`,
        result: r,
      }
    },
  },
  {
    id: 'wp-livres-recus',
    label: 'On ajoute encore',
    kinds: ['addition', 'melange'],
    levels: ['facile', 'moyen'],
    defs: [
      { key: 'a', label: 'Déjà là' },
      { key: 'b', label: 'Ajoutés' },
    ],
    roll: (rng) => ({ a: int(rng, 3, 30), b: int(rng, 1, 12) }),
    build: (v) => {
      const r = v.a! + v.b!
      return {
        prompt: `Sur le bureau, il y a déjà ${fmt(v.a!)} livres. On en apporte ${fmt(v.b!)}. Combien de livres y a-t-il maintenant ?`,
        calc: `${fmt(v.a!)} + ${fmt(v.b!)}`,
        response: `Il y a ${fmt(r)} livres.`,
        result: r,
      }
    },
  },
  {
    id: 'wp-enveloppes',
    label: 'Somme d’enveloppes',
    kinds: ['addition', 'melange'],
    levels: ['moyen', 'avance'],
    defs: [
      { key: 'a', label: 'Enveloppe 1 (fr.)' },
      { key: 'b', label: 'Enveloppe 2 (fr.)' },
      { key: 'c', label: 'Enveloppe 3 (fr.)' },
    ],
    roll: (rng) => ({ a: money(rng, 8, 40), b: money(rng, 10, 50), c: money(rng, 6, 35) }),
    build: (v) => {
      const r = round2(v.a! + v.b! + v.c!)
      return {
        prompt: `Amir ouvre trois enveloppes : ${fmt(v.a!)} francs, ${fmt(v.b!)} francs et ${fmt(v.c!)} francs. Combien d’argent a-t-il en tout ?`,
        calc: `${fmt(v.a!)} + ${fmt(v.b!)} + ${fmt(v.c!)}`,
        response: `Amir a ${fmt(r)} francs.`,
        result: r,
      }
    },
  },
  {
    id: 'wp-de-moins',
    label: 'En a de moins',
    kinds: ['soustraction', 'melange'],
    levels: ['facile', 'moyen'],
    defs: [
      { key: 'a', label: 'Nombre de Jonas' },
      { key: 'b', label: 'De moins' },
    ],
    roll: (rng) => {
      const a = int(rng, 12, 60)
      return { a, b: int(rng, 2, a - 1) }
    },
    build: (v) => {
      const r = v.a! - v.b!
      return {
        prompt: `Jonas a ${fmt(v.a!)} crayons. Léa en a ${fmt(v.b!)} de moins. Combien de crayons Léa a-t-elle ?`,
        calc: `${fmt(v.a!)} − ${fmt(v.b!)}`,
        response: `Léa a ${fmt(r)} crayons.`,
        result: r,
      }
    },
  },
  {
    id: 'wp-autre-en-a-moins',
    label: 'L’autre en a davantage',
    kinds: ['soustraction', 'add-sub', 'melange'],
    levels: ['facile', 'moyen'],
    defs: [
      { key: 'a', label: 'Nombre connu' },
      { key: 'b', label: 'De plus' },
    ],
    roll: (rng) => {
      const a = int(rng, 15, 80)
      return { a, b: int(rng, 3, Math.max(3, a - 2)) }
    },
    build: (v) => {
      const r = v.a! - v.b!
      return {
        prompt: `Yoko a ${fmt(v.a!)} petites voitures. Elle en a ${fmt(v.b!)} de plus que Yuka. Combien de voitures Yuka a-t-elle ?`,
        calc: `${fmt(v.a!)} − ${fmt(v.b!)}`,
        response: `Yuka a ${fmt(r)} voitures.`,
        result: r,
      }
    },
  },
  {
    id: 'wp-caches',
    label: 'Une partie est cachée',
    kinds: ['soustraction', 'melange'],
    levels: ['facile'],
    defs: [
      { key: 'a', label: 'En tout' },
      { key: 'b', label: 'Visibles' },
    ],
    roll: (rng) => {
      const a = int(rng, 8, 24)
      return { a, b: int(rng, 1, a - 1) }
    },
    build: (v) => {
      const r = v.a! - v.b!
      return {
        prompt: `Le berger a ${fmt(v.a!)} moutons. On en voit ${fmt(v.b!)}. Combien de moutons sont cachés ?`,
        calc: `${fmt(v.a!)} − ${fmt(v.b!)}`,
        response: `${fmt(r)} moutons sont cachés.`,
        result: r,
      }
    },
  },
  {
    id: 'wp-reste-donne',
    label: 'On en donne',
    kinds: ['soustraction', 'melange'],
    levels: ['moyen', 'avance'],
    defs: [
      { key: 'a', label: 'Au départ' },
      { key: 'b', label: 'Donnés' },
    ],
    roll: (rng) => {
      const a = int(rng, 80, 400)
      return { a, b: int(rng, 20, a - 10) }
    },
    build: (v) => {
      const r = v.a! - v.b!
      return {
        prompt: `Zabi a ${fmt(v.a!)} vignettes. Il en donne ${fmt(v.b!)}. Combien de vignettes lui reste-t-il ?`,
        calc: `${fmt(v.a!)} − ${fmt(v.b!)}`,
        response: `Il lui reste ${fmt(r)} vignettes.`,
        result: r,
      }
    },
  },
  {
    id: 'wp-difference',
    label: 'Combien de plus',
    kinds: ['soustraction', 'add-sub', 'melange'],
    levels: ['moyen', 'avance'],
    defs: [
      { key: 'a', label: 'Plus petit nombre' },
      { key: 'b', label: 'Plus grand nombre' },
    ],
    roll: (rng) => {
      const a = int(rng, 40, 200)
      return { a, b: a + int(rng, 15, 180) }
    },
    build: (v) => {
      const r = v.b! - v.a!
      return {
        prompt: `Alicia a ${fmt(v.a!)} peluches. Adna en a ${fmt(v.b!)}. Combien Adna a-t-elle de peluches de plus qu’Alicia ?`,
        calc: `${fmt(v.b!)} − ${fmt(v.a!)}`,
        response: `Adna en a ${fmt(r)} de plus.`,
        result: r,
      }
    },
  },
  {
    id: 'wp-fille-garcon',
    label: 'Une partie du total',
    kinds: ['soustraction', 'melange'],
    levels: ['facile', 'moyen'],
    defs: [
      { key: 'a', label: 'Enfants' },
      { key: 'b', label: 'Garçons' },
    ],
    roll: (rng) => {
      const a = int(rng, 20, 90)
      return { a, b: int(rng, 4, a - 4) }
    },
    build: (v) => {
      const r = v.a! - v.b!
      return {
        prompt: `${fmt(v.a!)} enfants jouent. Parmi eux, ${fmt(v.b!)} sont des garçons. Combien y a-t-il de filles ?`,
        calc: `${fmt(v.a!)} − ${fmt(v.b!)}`,
        response: `Il y a ${fmt(r)} filles.`,
        result: r,
      }
    },
  },
  {
    id: 'wp-rendre',
    label: 'Rendre la monnaie',
    kinds: ['soustraction', 'melange'],
    levels: ['moyen', 'avance'],
    change: true,
    defs: [
      { key: 'a', label: 'Prix (fr.)' },
      { key: 'b', label: 'Billet (fr.)' },
    ],
    roll: (rng) => {
      const bill = pick(rng, [20, 50, 100, 200])
      const cents = int(rng, 100, bill * 100 - 5)
      const price = (Math.round(cents / 5) * 5) / 100
      return { a: price, b: bill }
    },
    build: (v) => {
      const r = round2(v.b! - v.a!)
      return {
        prompt: `Le repas coûte ${v.a!.toFixed(2).replace('.', ',')} francs. On paie avec un billet de ${fmt(v.b!)} francs. Quels billets et quelles pièces rend-on ?`,
        calc: `${fmt(v.b!)} − ${v.a!.toFixed(2).replace('.', ',')}`,
        response: r < 0 ? 'Le billet ne suffit pas pour payer.' : `On rend ${fmt(r)} francs.`,
        result: r,
      }
    },
  },
  {
    id: 'wp-double',
    label: 'Le double',
    kinds: ['multiplication', 'melange'],
    levels: ['facile'],
    defs: [{ key: 'a', label: 'Nombre de Jonas' }],
    roll: (rng) => ({ a: int(rng, 3, 24) }),
    build: (v) => {
      const r = v.a! * 2
      return {
        prompt: `Jonas a ${fmt(v.a!)} crayons. Léa en a le double. Combien de crayons Léa a-t-elle ?`,
        calc: `${fmt(v.a!)} × 2`,
        response: `Léa a ${fmt(r)} crayons.`,
        result: r,
      }
    },
  },
  {
    id: 'wp-fois-plus',
    label: 'Plusieurs fois plus',
    kinds: ['multiplication', 'melange'],
    levels: ['facile', 'moyen'],
    defs: [
      { key: 'a', label: 'Nombre de départ' },
      { key: 'b', label: 'Combien de fois' },
    ],
    roll: (rng) => ({ a: int(rng, 3, 18), b: int(rng, 2, 6) }),
    build: (v) => {
      const r = v.a! * v.b!
      return {
        prompt: `Jonas a ${fmt(v.a!)} crayons. Léa en a ${fmt(v.b!)} fois plus. Combien de crayons Léa a-t-elle ?`,
        calc: `${fmt(v.a!)} × ${fmt(v.b!)}`,
        response: `Léa a ${fmt(r)} crayons.`,
        result: r,
      }
    },
  },
  {
    id: 'wp-fois-moins-inverse',
    label: 'C’est fois moins',
    kinds: ['multiplication', 'melange'],
    levels: ['facile', 'moyen'],
    defs: [
      { key: 'a', label: 'Plus petit nombre' },
      { key: 'b', label: 'Combien de fois' },
    ],
    roll: (rng) => ({ a: int(rng, 4, 20), b: int(rng, 2, 5) }),
    build: (v) => {
      const r = v.a! * v.b!
      return {
        prompt: `Malik a ${fmt(v.a!)} billes. C’est ${fmt(v.b!)} fois moins que Chloé. Combien de billes Chloé a-t-elle ?`,
        calc: `${fmt(v.a!)} × ${fmt(v.b!)}`,
        response: `Chloé a ${fmt(r)} billes.`,
        result: r,
      }
    },
  },
  {
    id: 'wp-pattes',
    label: 'Pattes des animaux',
    kinds: ['multiplication', 'melange'],
    levels: ['facile', 'moyen'],
    defs: [
      { key: 'a', label: 'Vaches (4 pattes)' },
      { key: 'b', label: 'Poules (2 pattes)' },
      { key: 'c', label: 'Chevaux (4 pattes)' },
    ],
    roll: (rng) => ({ a: int(rng, 1, 5), b: int(rng, 1, 6), c: int(rng, 0, 2) }),
    build: (v) => {
      const cows = v.a! * 4
      const hens = v.b! * 2
      const horses = v.c! * 4
      const r = cows + hens + horses
      const horseText = v.c === 0 ? 'aucun cheval' : v.c === 1 ? '1 cheval' : `${fmt(v.c!)} chevaux`
      return {
        prompt: `Dans un pré, il y a ${fmt(v.a!)} vache${v.a === 1 ? '' : 's'}, ${fmt(v.b!)} poule${v.b === 1 ? '' : 's'} et ${horseText}. Une vache ou un cheval a 4 pattes, une poule en a 2. Combien de pattes y a-t-il en tout ?`,
        calc: `${fmt(v.a!)} × 4 + ${fmt(v.b!)} × 2 + ${fmt(v.c!)} × 4`,
        response: `Il y a ${fmt(r)} pattes.`,
        result: r,
      }
    },
  },
  {
    id: 'wp-paquets',
    label: 'Paquets identiques',
    kinds: ['multiplication', 'melange'],
    levels: ['moyen', 'avance'],
    defs: [
      { key: 'a', label: 'Paquets' },
      { key: 'b', label: 'Dans chaque paquet' },
    ],
    roll: (rng) => ({ a: int(rng, 3, 18), b: int(rng, 4, 25) }),
    build: (v) => {
      const r = v.a! * v.b!
      return {
        prompt: `Il y a ${fmt(v.a!)} paquets de ${fmt(v.b!)} crayons. Combien de crayons y a-t-il en tout ?`,
        calc: `${fmt(v.a!)} × ${fmt(v.b!)}`,
        response: `Il y a ${fmt(r)} crayons.`,
        result: r,
      }
    },
  },
  {
    id: 'wp-argent-semaine',
    label: 'Argent chaque semaine',
    kinds: ['multiplication', 'melange'],
    levels: ['moyen', 'avance'],
    defs: [
      { key: 'a', label: 'Francs par semaine' },
      { key: 'b', label: 'Semaines' },
    ],
    roll: (rng) => ({ a: int(rng, 4, 15), b: int(rng, 3, 8) }),
    build: (v) => {
      const r = v.a! * v.b!
      return {
        prompt: `Ahmad reçoit ${fmt(v.a!)} francs par semaine. Combien reçoit-il en ${fmt(v.b!)} semaines ?`,
        calc: `${fmt(v.a!)} × ${fmt(v.b!)}`,
        response: `Il reçoit ${fmt(r)} francs.`,
        result: r,
      }
    },
  },
  {
    id: 'wp-quadrillage',
    label: 'Lignes et colonnes',
    kinds: ['multiplication', 'melange'],
    levels: ['avance'],
    defs: [
      { key: 'a', label: 'Lignes' },
      { key: 'b', label: 'Colonnes' },
    ],
    roll: (rng) => ({ a: int(rng, 8, 24), b: int(rng, 6, 20) }),
    build: (v) => {
      const r = v.a! * v.b!
      return {
        prompt: `Une page de cahier a ${fmt(v.a!)} lignes et ${fmt(v.b!)} colonnes de carreaux. Combien de carreaux y a-t-il sur la page ?`,
        calc: `${fmt(v.a!)} × ${fmt(v.b!)}`,
        response: `Il y a ${fmt(r)} carreaux.`,
        result: r,
      }
    },
  },
  {
    id: 'wp-moitie',
    label: 'La moitié',
    kinds: ['division', 'melange'],
    levels: ['facile'],
    defs: [{ key: 'a', label: 'Nombre de Jonas' }],
    roll: (rng) => ({ a: int(rng, 2, 16) * 2 }),
    build: (v) => {
      const r = v.a! / 2
      return {
        prompt: `Jonas a ${fmt(v.a!)} crayons. Léa en a la moitié. Combien de crayons Léa a-t-elle ?`,
        calc: `${fmt(v.a!)} ÷ 2`,
        response: `Léa a ${fmt(r)} crayons.`,
        result: r,
      }
    },
  },
  {
    id: 'wp-fois-moins',
    label: 'Tant de fois moins',
    kinds: ['division', 'melange'],
    levels: ['facile', 'moyen'],
    defs: [
      { key: 'a', label: 'Plus grand nombre' },
      { key: 'b', label: 'Combien de fois' },
    ],
    roll: (rng) => {
      const b = int(rng, 2, 6)
      return { a: b * int(rng, 3, 12), b }
    },
    build: (v) => {
      const r = v.a! / v.b!
      return {
        prompt: `Chloé a ${fmt(v.a!)} billes. Malik en a ${fmt(v.b!)} fois moins. Combien de billes Malik a-t-il ?`,
        calc: `${fmt(v.a!)} ÷ ${fmt(v.b!)}`,
        response: `Malik a ${fmt(r)} billes.`,
        result: r,
      }
    },
  },
  {
    id: 'wp-partage',
    label: 'Partage égal',
    kinds: ['division', 'melange'],
    levels: ['facile', 'moyen', 'avance'],
    defs: [
      { key: 'a', label: 'Objets' },
      { key: 'b', label: 'Personnes' },
    ],
    roll: (rng) => {
      const b = int(rng, 2, 9)
      return { a: b * int(rng, 3, 15), b }
    },
    build: (v) => {
      const r = v.a! / v.b!
      return {
        prompt: `On partage ${fmt(v.a!)} feuilles entre ${fmt(v.b!)} élèves, de façon égale. Combien de feuilles chaque élève reçoit-il ?`,
        calc: `${fmt(v.a!)} ÷ ${fmt(v.b!)}`,
        response: `Chaque élève reçoit ${fmt(r)} feuilles.`,
        result: r,
      }
    },
  },
  {
    id: 'wp-billets',
    label: 'Échanger en billets',
    kinds: ['division', 'melange'],
    levels: ['moyen', 'avance'],
    defs: [
      { key: 'a', label: 'Francs en tout' },
      { key: 'b', label: 'Valeur d’un billet' },
    ],
    roll: (rng) => {
      const b = pick(rng, [5, 10, 20])
      return { a: b * int(rng, 4, 18), b }
    },
    build: (v) => {
      const r = v.a! / v.b!
      return {
        prompt: `Nina a ${fmt(v.a!)} francs, seulement en billets de ${fmt(v.b!)} francs. Combien de billets a-t-elle ?`,
        calc: `${fmt(v.a!)} ÷ ${fmt(v.b!)}`,
        response: `Nina a ${fmt(r)} billets.`,
        result: r,
      }
    },
  },
  {
    id: 'wp-prix-unitaire',
    label: 'Prix pour plusieurs, puis un autre nombre',
    kinds: ['division', 'multiplication', 'melange'],
    levels: ['avance'],
    defs: [
      { key: 'a', label: 'Pains du prix connu' },
      { key: 'b', label: 'Prix de ces pains (fr.)' },
      { key: 'c', label: 'Pains demandés' },
    ],
    roll: (rng) => {
      const a = pick(rng, [2, 4, 5])
      const unit = int(rng, 2, 6)
      return { a, b: a * unit, c: a * int(rng, 2, 6) }
    },
    build: (v) => {
      const unit = v.b! / v.a!
      const r = unit * v.c!
      return {
        prompt: `${fmt(v.a!)} pains coûtent ${fmt(v.b!)} francs. Tous les pains ont le même prix. Combien coûtent ${fmt(v.c!)} pains ?`,
        calc: `${fmt(v.b!)} ÷ ${fmt(v.a!)} = ${fmt(unit)} ; ${fmt(v.c!)} × ${fmt(unit)}`,
        response: `${fmt(v.c!)} pains coûtent ${fmt(r)} francs.`,
        result: r,
      }
    },
  },
  {
    id: 'wp-chaises',
    label: 'Moitié puis partage',
    kinds: ['division', 'melange'],
    levels: ['avance'],
    defs: [
      { key: 'a', label: 'Prix total (fr.)' },
      { key: 'b', label: 'Chaises' },
    ],
    roll: (rng) => {
      const b = pick(rng, [4, 6, 8])
      const chair = int(rng, 40, 120)
      return { a: chair * b * 2, b }
    },
    build: (v) => {
      const half = v.a! / 2
      const r = half / v.b!
      return {
        prompt: `Une table et ${fmt(v.b!)} chaises coûtent ${fmt(v.a!)} francs. La table coûte la moitié de cette somme. Les chaises ont toutes le même prix. Quel est le prix d’une chaise ?`,
        calc: `${fmt(v.a!)} ÷ 2 = ${fmt(half)} ; ${fmt(half)} ÷ ${fmt(v.b!)}`,
        response: `Une chaise coûte ${fmt(r)} francs.`,
        result: r,
      }
    },
  },
  {
    id: 'wp-sauts-de-plus',
    label: 'Total puis comparaison',
    kinds: ['add-sub', 'melange'],
    levels: ['moyen', 'avance'],
    defs: [
      { key: 'a', label: 'Premiers sauts' },
      { key: 'b', label: 'Sauts en plus' },
      { key: 'c', label: 'Sauts de l’autre' },
    ],
    roll: (rng) => {
      const a = int(rng, 40, 180)
      const b = int(rng, 30, 200)
      return { a, b, c: int(rng, 40, a + b - 10) }
    },
    build: (v) => {
      const total = v.a! + v.b!
      const r = total - v.c!
      return {
        prompt: `Selma fait ${fmt(v.a!)} sauts, puis encore ${fmt(v.b!)} sauts. Alsina en fait ${fmt(v.c!)}. Combien Selma a-t-elle fait de sauts de plus qu’Alsina ?`,
        calc: `${fmt(v.a!)} + ${fmt(v.b!)} − ${fmt(v.c!)}`,
        response: `Selma en a fait ${fmt(r)} de plus.`,
        result: r,
      }
    },
  },
  {
    id: 'wp-reste-courses',
    label: 'Reçu puis dépenses',
    kinds: ['add-sub', 'melange'],
    levels: ['moyen', 'avance'],
    defs: [
      { key: 'a', label: 'Reçu de maman (fr.)' },
      { key: 'b', label: 'Reçu de papa (fr.)' },
      { key: 'c', label: 'Dépensé (fr.)' },
    ],
    roll: (rng) => {
      const a = int(rng, 10, 30)
      const b = int(rng, 8, 25)
      return { a, b, c: money(rng, 5, a + b - 2) }
    },
    build: (v) => {
      const r = round2(v.a! + v.b! - v.c!)
      return {
        prompt: `Émir reçoit ${fmt(v.a!)} francs de sa maman et ${fmt(v.b!)} francs de son papa. Il dépense ${fmt(v.c!)} francs au parc. Combien lui reste-t-il ?`,
        calc: `${fmt(v.a!)} + ${fmt(v.b!)} − ${fmt(v.c!)}`,
        response: `Il lui reste ${fmt(r)} francs.`,
        result: r,
      }
    },
  },
  {
    id: 'wp-abonnement',
    label: 'Entrées ou abonnement',
    kinds: ['add-sub', 'multiplication', 'melange'],
    levels: ['avance'],
    defs: [
      { key: 'a', label: 'Nombre d’entrées' },
      { key: 'b', label: 'Prix d’une entrée (fr.)' },
      { key: 'c', label: 'Abonnement (fr.)' },
    ],
    roll: (rng) => {
      const b = int(rng, 2, 6)
      const a = int(rng, 8, 20)
      const full = a * b
      return { a, b, c: full - int(rng, 2, 12) }
    },
    build: (v) => {
      const full = v.a! * v.b!
      const r = full - v.c!
      return {
        prompt: `Assia va ${fmt(v.a!)} fois à la piscine. Une entrée coûte ${fmt(v.b!)} francs. L’abonnement coûte ${fmt(v.c!)} francs. Combien économise-t-elle en prenant l’abonnement ?`,
        calc: `${fmt(v.a!)} × ${fmt(v.b!)} − ${fmt(v.c!)}`,
        response: `Elle économise ${fmt(r)} francs.`,
        result: r,
      }
    },
  },
  {
    id: 'wp-puzzle-manque',
    label: 'Il en manque, donc on ajoute',
    kinds: ['addition', 'melange'],
    levels: ['facile', 'moyen'],
    defs: [
      { key: 'a', label: 'Pièces du plus petit' },
      { key: 'b', label: 'Pièces en moins' },
    ],
    roll: (rng) => ({ a: int(rng, 20, 80), b: int(rng, 8, 40) }),
    build: (v) => {
      const r = v.a! + v.b!
      return {
        prompt: `Le puzzle de Rohan a ${fmt(v.a!)} pièces. C’est ${fmt(v.b!)} pièces de moins que celui de Sirine. Combien de pièces a le puzzle de Sirine ?`,
        calc: `${fmt(v.a!)} + ${fmt(v.b!)}`,
        response: `Le puzzle de Sirine a ${fmt(r)} pièces.`,
        result: r,
      }
    },
  },
  {
    id: 'wp-avant',
    label: 'Combien avant d’ajouter',
    kinds: ['soustraction', 'melange'],
    levels: ['facile', 'moyen'],
    defs: [
      { key: 'a', label: 'Ajoutés' },
      { key: 'b', label: 'Maintenant' },
    ],
    roll: (rng) => {
      const a = int(rng, 6, 30)
      return { a, b: a + int(rng, 8, 40) }
    },
    build: (v) => {
      const r = v.b! - v.a!
      return {
        prompt: `On met ${fmt(v.a!)} fruits dans le panier. Il y en a maintenant ${fmt(v.b!)}. Combien de fruits y avait-il avant ?`,
        calc: `${fmt(v.b!)} − ${fmt(v.a!)}`,
        response: `Il y avait ${fmt(r)} fruits.`,
        result: r,
      }
    },
  },
  {
    id: 'wp-blocs-de-plus',
    label: 'Groupes, puis différence',
    kinds: ['soustraction', 'melange'],
    levels: ['avance'],
    defs: [
      { key: 'a', label: 'Blocs de Stéphane' },
      { key: 'c', label: 'Blocs de Marie' },
    ],
    roll: (rng) => {
      const c = int(rng, 6, 18)
      return { a: c + int(rng, 2, 12), c }
    },
    build: (v) => {
      const r = v.a! - v.c!
      return {
        prompt: `Stéphane achète ${fmt(v.a!)} blocs. Marie en achète ${fmt(v.c!)}. Combien Stéphane a-t-il acheté de blocs de plus que Marie ?`,
        calc: `${fmt(v.a!)} − ${fmt(v.c!)}`,
        response: `Stéphane en a acheté ${fmt(r)} de plus.`,
        result: r,
      }
    },
  },
  {
    id: 'wp-prix-blocs',
    label: 'Prix de deux achats',
    kinds: ['multiplication', 'addition', 'melange'],
    levels: ['avance'],
    defs: [
      { key: 'a', label: 'Blocs de Stéphane' },
      { key: 'b', label: 'Blocs de Marie' },
      { key: 'c', label: 'Prix d’un bloc (fr.)' },
    ],
    roll: (rng) => ({ a: int(rng, 6, 20), b: int(rng, 4, 16), c: int(rng, 2, 8) }),
    build: (v) => {
      const r = (v.a! + v.b!) * v.c!
      return {
        prompt: `Stéphane achète ${fmt(v.a!)} blocs et Marie en achète ${fmt(v.b!)}. Chaque bloc coûte ${fmt(v.c!)} francs. Combien paient-ils en tout ?`,
        calc: `(${fmt(v.a!)} + ${fmt(v.b!)}) × ${fmt(v.c!)}`,
        response: `Ils paient ${fmt(r)} francs.`,
        result: r,
      }
    },
  },
]

const SPECS: Spec[] = [...BASE_SPECS, ...SUITE_SPECS]

function pool(kind: ProblemKind, difficulty?: Difficulty): Spec[] {
  const byKind = SPECS.filter((s) => s.kinds.includes(kind))
  if (!difficulty) return byKind
  const byLevel = byKind.filter((s) => s.levels.includes(difficulty))
  return byLevel.length > 0 ? byLevel : byKind
}

export function generateWordProblem(rng: Rng, difficulty: Difficulty, kind: ProblemKind): MathItem {
  const spec = pick(rng, pool(kind, difficulty))
  return itemFrom(spec, spec.roll(rng))
}

export function algebraProblemOptions(exerciseType: string): { id: string; label: string }[] | undefined {
  if (!exerciseType.startsWith('problemes-')) return undefined
  const kind = exerciseType.slice('problemes-'.length) as ProblemKind
  const list = pool(kind)
  if (list.length === 0) return undefined
  return list.map((s) => ({ id: s.id, label: s.label }))
}

export function rebuildAlgebraProblem(templateId: string, vars: Vars): MathItem | undefined {
  const spec = SPECS.find((s) => s.id === templateId)
  if (!spec) return undefined
  return itemFrom(spec, vars)
}

export function rollAlgebraProblem(templateId: string, rng: Rng): MathItem | undefined {
  const spec = SPECS.find((s) => s.id === templateId)
  if (!spec) return undefined
  return itemFrom(spec, spec.roll(rng))
}
