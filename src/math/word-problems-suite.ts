/**
 * Situations des fiches de compréhension et d’argent (P1 à P4).
 * Textes adaptés : les nombres sont des variables, les calculs faux des originaux ne sont pas repris.
 */
import { fmt } from './column-arith'
import { int, type Rng } from './rng'
import type { Difficulty } from './types'
import type { Spec, Vars } from './word-problems'

const r2 = (n: number) => Math.round(n * 100) / 100
const f = (n: number) => fmt(r2(n))

function cents(rng: Rng, lo: number, hi: number): number {
  return r2(int(rng, Math.round(lo * 100), Math.round(hi * 100)) / 100)
}

function subPair(rng: Rng, lo: number, hi: number): Vars {
  const x = int(rng, lo, hi)
  const y = int(rng, lo, hi)
  const hiV = Math.max(x, y)
  const loV = Math.min(x, y)
  return { a: hiV === loV ? hiV + 1 : hiV, b: loV }
}

function subMoney(rng: Rng, lo: number, hi: number): Vars {
  const x = cents(rng, lo, hi)
  const y = cents(rng, lo, hi)
  const hiV = Math.max(x, y)
  const loV = Math.min(x, y)
  return { a: hiV === loV ? r2(hiV + 0.5) : hiV, b: loV }
}

type Built = { prompt: string; calc: string; response: string; result: number }

function story(spec: Spec): Spec {
  return spec
}

const facile: Difficulty[] = ['facile']
const moyen: Difficulty[] = ['moyen']
const avance: Difficulty[] = ['avance']

export const SUITE_SPECS: Spec[] = [
  story({
    id: 'wp2-drapeaux',
    label: 'Drapeaux avec du rouge',
    kinds: ['addition', 'melange'],
    levels: facile,
    defs: [
      { key: 'a', label: 'Drapeaux du 1er groupe' },
      { key: 'b', label: 'Drapeaux du 2e groupe' },
    ],
    roll: (rng) => ({ a: int(rng, 1, 6), b: int(rng, 1, 6) }),
    build: (v): Built => {
      const r = v.a! + v.b!
      return {
        prompt: `${f(v.a!)} drapeaux ont du rouge et du vert. ${f(v.b!)} autres drapeaux ont du rouge et du jaune. Combien de drapeaux ont du rouge ?`,
        calc: `${f(v.a!)} + ${f(v.b!)}`,
        response: `${f(r)} drapeaux ont du rouge.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-pieces-total',
    label: 'Toutes les pièces',
    kinds: ['addition', 'melange'],
    levels: facile,
    defs: [
      { key: 'a', label: 'Pièces de 5 fr.' },
      { key: 'b', label: 'Pièces de 2 fr.' },
      { key: 'c', label: 'Pièces de 1 fr.' },
    ],
    roll: (rng) => ({ a: int(rng, 4, 30), b: int(rng, 4, 40), c: int(rng, 4, 40) }),
    build: (v): Built => {
      const r = v.a! + v.b! + v.c!
      return {
        prompt: `Dans la boîte : ${f(v.a!)} pièces de 5 francs, ${f(v.b!)} pièces de 2 francs et ${f(v.c!)} pièces de 1 franc. Combien y a-t-il de pièces en tout ?`,
        calc: `${f(v.a!)} + ${f(v.b!)} + ${f(v.c!)}`,
        response: `Il y a ${f(r)} pièces.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-pieces-de-plus',
    label: 'Pièces de 2 francs en plus',
    kinds: ['addition', 'melange'],
    levels: facile,
    defs: [
      { key: 'a', label: 'Pièces de 5 fr.' },
      { key: 'b', label: 'De plus en pièces de 2 fr.' },
    ],
    roll: (rng) => ({ a: int(rng, 8, 40), b: int(rng, 3, 20) }),
    build: (v): Built => {
      const r = v.a! + v.b!
      return {
        prompt: `Inès a ${f(v.a!)} pièces de 5 francs. Elle a ${f(v.b!)} pièces de 2 francs de plus que de pièces de 5 francs. Combien a-t-elle de pièces de 2 francs ?`,
        calc: `${f(v.a!)} + ${f(v.b!)}`,
        response: `Elle a ${f(r)} pièces de 2 francs.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-francs-centimes',
    label: 'Francs et centimes reçus',
    kinds: ['addition', 'melange'],
    levels: facile,
    defs: [
      { key: 'a', label: 'Francs déjà là' },
      { key: 'b', label: 'Centimes reçus' },
    ],
    roll: (rng) => ({ a: int(rng, 5, 40), b: int(rng, 1, 20) * 50 }),
    build: (v): Built => {
      const r = r2(v.a! + v.b! / 100)
      return {
        prompt: `Nora a ${f(v.a!)} francs. On lui donne ${f(v.b!)} centimes. Combien a-t-elle maintenant, en francs ?`,
        calc: `${f(v.a!)} + ${f(v.b!)} ÷ 100`,
        response: `Elle a ${f(r)} francs.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-piles',
    label: 'Piles de pièces',
    kinds: ['multiplication', 'melange'],
    levels: facile,
    defs: [
      { key: 'a', label: 'Nombre de piles' },
      { key: 'b', label: 'Pièces par pile' },
      { key: 'c', label: 'Valeur d’une pièce (fr.)' },
    ],
    roll: (rng) => ({ a: int(rng, 2, 8), b: int(rng, 5, 12), c: int(rng, 1, 5) }),
    build: (v): Built => {
      const r = v.a! * v.b! * v.c!
      return {
        prompt: `Samir fait ${f(v.a!)} piles de ${f(v.b!)} pièces de ${f(v.c!)} franc${v.c! > 1 ? 's' : ''}. Quelle somme a-t-il ?`,
        calc: `${f(v.a!)} × ${f(v.b!)} × ${f(v.c!)}`,
        response: `Il a ${f(r)} francs.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-depense-rendu',
    label: 'Dépense d’après la monnaie',
    kinds: ['soustraction', 'melange'],
    levels: facile,
    defs: [
      { key: 'a', label: 'Billet donné (fr.)' },
      { key: 'b', label: 'Monnaie rendue (fr.)' },
    ],
    roll: (rng) => {
      const bill = [20, 50, 100][int(rng, 0, 2)]!
      const back = cents(rng, 1, bill - 1)
      return { a: bill, b: back }
    },
    build: (v): Built => {
      const r = r2(v.a! - v.b!)
      return {
        prompt: `On paie avec un billet de ${f(v.a!)} francs. On rend ${f(v.b!)} francs. Combien a-t-on dépensé ?`,
        calc: `${f(v.a!)} − ${f(v.b!)}`,
        response: `On a dépensé ${f(r)} francs.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-meubles',
    label: 'Meubles payés, monnaie à rendre',
    kinds: ['soustraction', 'addition', 'melange'],
    levels: moyen,
    change: true,
    defs: [
      { key: 'a', label: 'Armoire (fr.)' },
      { key: 'b', label: 'Chaises (fr.)' },
      { key: 'c', label: 'Bureau (fr.)' },
      { key: 'd', label: 'Nombre de billets de 200' },
    ],
    roll: (rng) => {
      const a = cents(rng, 40, 180)
      const b = cents(rng, 20, 120)
      const c = cents(rng, 20, 90)
      const sum = r2(a + b + c)
      const bills = Math.ceil((sum + 5) / 200)
      return { a, b, c, d: bills }
    },
    build: (v): Built => {
      const total = r2(v.a! + v.b! + v.c!)
      const paid = v.d! * 200
      const r = r2(paid - total)
      return {
        prompt: `L’armoire coûte ${f(v.a!)} francs, les chaises ${f(v.b!)} francs et le bureau ${f(v.c!)} francs. On paie avec ${f(v.d!)} billet${v.d! > 1 ? 's' : ''} de 200 francs. Quels billets et quelles pièces rend-on ?`,
        calc: `${f(v.d!)} × 200 − (${f(v.a!)} + ${f(v.b!)} + ${f(v.c!)})`,
        response: r < 0 ? 'Les billets ne suffisent pas.' : `On rend ${f(r)} francs.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-restaurant',
    label: 'Addition du restaurant',
    kinds: ['multiplication', 'addition', 'melange'],
    levels: moyen,
    defs: [
      { key: 'a', label: 'Nombre de salades' },
      { key: 'b', label: 'Prix d’une salade' },
      { key: 'c', label: 'Nombre de cafés' },
      { key: 'd', label: 'Prix d’un café' },
      { key: 'e', label: 'Prix du plat' },
    ],
    roll: (rng) => ({
      a: int(rng, 1, 4),
      b: cents(rng, 6, 18),
      c: int(rng, 1, 4),
      d: cents(rng, 3, 8),
      e: cents(rng, 16, 40),
    }),
    build: (v): Built => {
      const r = r2(v.a! * v.b! + v.c! * v.d! + v.e!)
      return {
        prompt: `${f(v.a!)} salade${v.a! > 1 ? 's' : ''} à ${f(v.b!)} francs, ${f(v.c!)} café${v.c! > 1 ? 's' : ''} à ${f(v.d!)} francs et un plat à ${f(v.e!)} francs. Combien paie-t-on en tout ?`,
        calc: `${f(v.a!)} × ${f(v.b!)} + ${f(v.c!)} × ${f(v.d!)} + ${f(v.e!)}`,
        response: `On paie ${f(r)} francs.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-restaurant-rendre',
    label: 'Restaurant, monnaie à rendre',
    kinds: ['soustraction', 'melange'],
    levels: moyen,
    change: true,
    defs: [
      { key: 'a', label: 'Addition (fr.)' },
      { key: 'b', label: 'Billet (fr.)' },
    ],
    roll: (rng) => {
      const bill = [50, 100, 200][int(rng, 0, 2)]!
      const price = cents(rng, 10, bill - 1)
      return { a: price, b: bill }
    },
    build: (v): Built => {
      const r = r2(v.b! - v.a!)
      return {
        prompt: `L’addition du restaurant est de ${f(v.a!)} francs. On paie avec un billet de ${f(v.b!)} francs. Quels billets et quelles pièces rend-on ?`,
        calc: `${f(v.b!)} − ${f(v.a!)}`,
        response: r < 0 ? 'Le billet ne suffit pas.' : `On rend ${f(r)} francs.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-porte-monnaie',
    label: 'Différence de deux porte-monnaie',
    kinds: ['soustraction', 'melange'],
    levels: moyen,
    defs: [
      { key: 'a', label: 'Plus grande somme (fr.)' },
      { key: 'b', label: 'Autre somme (fr.)' },
    ],
    roll: (rng) => subMoney(rng, 20, 250),
    build: (v): Built => {
      const r = r2(v.a! - v.b!)
      return {
        prompt: `L’un a ${f(v.a!)} francs, l’autre ${f(v.b!)} francs. Combien le deuxième a-t-il de moins ?`,
        calc: `${f(v.a!)} − ${f(v.b!)}`,
        response: `Il a ${f(r)} francs de moins.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-prix-de-moins',
    label: 'Prix « de plus », trouver l’autre',
    kinds: ['soustraction', 'melange'],
    levels: moyen,
    defs: [
      { key: 'a', label: 'Prix le plus élevé (fr.)' },
      { key: 'b', label: 'Écart (fr.)' },
    ],
    roll: (rng) => subMoney(rng, 15, 200),
    build: (v): Built => {
      const r = r2(v.a! - v.b!)
      return {
        prompt: `La trottinette violette coûte ${f(v.a!)} francs. C’est ${f(v.b!)} francs de plus que la verte. Combien coûte la verte ?`,
        calc: `${f(v.a!)} − ${f(v.b!)}`,
        response: `La verte coûte ${f(r)} francs.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-apres-achat',
    label: 'Économies après un achat',
    kinds: ['soustraction', 'melange'],
    levels: moyen,
    defs: [
      { key: 'a', label: 'Économies (fr.)' },
      { key: 'b', label: 'Achat (fr.)' },
    ],
    roll: (rng) => subMoney(rng, 40, 400),
    build: (v): Built => {
      const r = r2(v.a! - v.b!)
      return {
        prompt: `Léo a économisé ${f(v.a!)} francs. Il dépense ${f(v.b!)} francs pour une trottinette. Combien lui reste-t-il ?`,
        calc: `${f(v.a!)} − ${f(v.b!)}`,
        response: `Il lui reste ${f(r)} francs.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-billets-dix',
    label: 'Échanger en billets de 10',
    kinds: ['addition', 'division', 'melange'],
    levels: moyen,
    defs: [
      { key: 'a', label: '1re enveloppe (fr.)' },
      { key: 'b', label: '2e enveloppe (fr.)' },
      { key: 'c', label: '3e enveloppe (fr.)' },
      { key: 'd', label: '4e enveloppe (fr.)' },
    ],
    roll: (rng) => ({
      a: cents(rng, 10, 80),
      b: cents(rng, 10, 90),
      c: cents(rng, 10, 70),
      d: cents(rng, 10, 90),
    }),
    build: (v): Built => {
      const sum = r2(v.a! + v.b! + v.c! + v.d!)
      const r = Math.floor(sum / 10)
      return {
        prompt: `Quatre enveloppes contiennent ${f(v.a!)}, ${f(v.b!)}, ${f(v.c!)} et ${f(v.d!)} francs. Combien de billets de 10 francs peut-on obtenir avec cette somme ?`,
        calc: `(${f(v.a!)} + ${f(v.b!)} + ${f(v.c!)} + ${f(v.d!)}) ÷ 10`,
        response: `On peut obtenir ${f(r)} billets de 10 francs.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-parc',
    label: 'Argent reçu puis dépenses',
    kinds: ['add-sub', 'soustraction', 'melange'],
    levels: moyen,
    defs: [
      { key: 'a', label: 'Reçu de maman (fr.)' },
      { key: 'b', label: 'Reçu de papa (fr.)' },
      { key: 'c', label: 'Glace (fr.)' },
      { key: 'd', label: 'Boisson (fr.)' },
      { key: 'e', label: 'Attractions (fr.)' },
    ],
    roll: (rng) => {
      const a = int(rng, 20, 40)
      const b = int(rng, 15, 30)
      const c = cents(rng, 2, 5)
      const d = cents(rng, 2, 5)
      const left = r2(a + b - c - d - 1)
      return { a, b, c, d, e: cents(rng, 2, Math.max(2, left)) }
    },
    build: (v): Built => {
      const r = r2(v.a! + v.b! - v.c! - v.d! - v.e!)
      return {
        prompt: `On reçoit ${f(v.a!)} francs et ${f(v.b!)} francs. On dépense ${f(v.c!)} francs, ${f(v.d!)} francs et ${f(v.e!)} francs. Combien reste-t-il ?`,
        calc: `${f(v.a!)} + ${f(v.b!)} − ${f(v.c!)} − ${f(v.d!)} − ${f(v.e!)}`,
        response: `Il reste ${f(r)} francs.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-commande',
    label: 'Commande de plusieurs lots',
    kinds: ['multiplication', 'addition', 'melange'],
    levels: moyen,
    defs: [
      { key: 'a', label: 'Livres du 1er lot' },
      { key: 'b', label: 'Prix du 1er lot' },
      { key: 'c', label: 'Livres du 2e lot' },
      { key: 'd', label: 'Prix du 2e lot' },
    ],
    roll: (rng) => ({
      a: int(rng, 8, 30),
      b: int(rng, 8, 20),
      c: int(rng, 8, 30),
      d: int(rng, 8, 20),
    }),
    build: (v): Built => {
      const r = v.a! * v.b! + v.c! * v.d!
      return {
        prompt: `${f(v.a!)} livres à ${f(v.b!)} francs et ${f(v.c!)} livres à ${f(v.d!)} francs. Combien paie-t-on en tout ?`,
        calc: `${f(v.a!)} × ${f(v.b!)} + ${f(v.c!)} × ${f(v.d!)}`,
        response: `On paie ${f(r)} francs.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-pains-lot',
    label: 'Même prix, un plus grand lot',
    kinds: ['multiplication', 'division', 'melange'],
    levels: moyen,
    defs: [
      { key: 'a', label: 'Pains du petit lot' },
      { key: 'b', label: 'Prix du petit lot (fr.)' },
      { key: 'c', label: 'Pains demandés' },
    ],
    roll: (rng) => {
      const a = int(rng, 2, 6)
      const unit = int(rng, 2, 5)
      const k = int(rng, 2, 8)
      return { a, b: a * unit, c: a * k }
    },
    build: (v): Built => {
      const r = (v.b! / v.a!) * v.c!
      return {
        prompt: `${f(v.a!)} pains coûtent ${f(v.b!)} francs. Tous les pains ont le même prix. Combien coûtent ${f(v.c!)} pains ?`,
        calc: `(${f(v.b!)} ÷ ${f(v.a!)}) × ${f(v.c!)}`,
        response: `${f(v.c!)} pains coûtent ${f(r)} francs.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-pains-budget',
    label: 'Combien d’articles avec une somme',
    kinds: ['division', 'multiplication', 'melange'],
    levels: moyen,
    defs: [
      { key: 'a', label: 'Articles du lot' },
      { key: 'b', label: 'Prix du lot (fr.)' },
      { key: 'c', label: 'Somme disponible (fr.)' },
    ],
    roll: (rng) => {
      const a = int(rng, 2, 6)
      const unit = int(rng, 2, 4)
      const k = int(rng, 2, 8)
      return { a, b: a * unit, c: k * a * unit }
    },
    build: (v): Built => {
      const r = (v.c! / v.b!) * v.a!
      return {
        prompt: `${f(v.a!)} pains coûtent ${f(v.b!)} francs. Combien de pains achète-t-on avec ${f(v.c!)} francs ?`,
        calc: `(${f(v.c!)} ÷ ${f(v.b!)}) × ${f(v.a!)}`,
        response: `On achète ${f(r)} pains.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-bouquet',
    label: 'Bouquet au même prix la fleur',
    kinds: ['multiplication', 'division', 'melange'],
    levels: moyen,
    defs: [
      { key: 'a', label: 'Fleurs du bouquet connu' },
      { key: 'b', label: 'Prix de ce bouquet (fr.)' },
      { key: 'c', label: 'Fleurs demandées' },
    ],
    roll: (rng) => {
      const unit = int(rng, 1, 4)
      const a = int(rng, 4, 12)
      const c = int(rng, 4, 20)
      return { a, b: a * unit, c }
    },
    build: (v): Built => {
      const r = (v.b! / v.a!) * v.c!
      return {
        prompt: `Un bouquet de ${f(v.a!)} fleurs coûte ${f(v.b!)} francs. Chaque fleur a le même prix. Combien coûte un bouquet de ${f(v.c!)} fleurs ?`,
        calc: `(${f(v.b!)} ÷ ${f(v.a!)}) × ${f(v.c!)}`,
        response: `Il coûte ${f(r)} francs.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-boite-pieces',
    label: 'Pièces de 5 et de 2',
    kinds: ['multiplication', 'division', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Somme dans la boîte (fr.)' },
      { key: 'b', label: 'Nombre de pièces' },
    ],
    roll: (rng) => {
      const n = int(rng, 20, 60)
      const x = int(rng, 4, n - 4)
      return { a: 5 * x + 2 * (n - x), b: n }
    },
    build: (v): Built => {
      const five = (v.a! - 2 * v.b!) / 3
      const two = v.b! - five
      return {
        prompt: `Une boîte contient ${f(v.a!)} francs, seulement en pièces de 5 francs et de 2 francs. Il y a ${f(v.b!)} pièces. Combien y a-t-il de pièces de 5 francs ?`,
        calc: `(${f(v.a!)} − 2 × ${f(v.b!)}) ÷ 3`,
        response: `Il y a ${f(five)} pièces de 5 francs et ${f(two)} pièces de 2 francs.`,
        result: five,
      }
    },
  }),
  story({
    id: 'wp2-glacier',
    label: 'Longueur perdue',
    kinds: ['soustraction', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Longueur ancienne (m)' },
      { key: 'b', label: 'Longueur récente (m)' },
    ],
    roll: (rng) => subMoney(rng, 500, 9000),
    build: (v): Built => {
      const r = r2(v.a! - v.b!)
      return {
        prompt: `Autrefois, le glacier mesurait ${f(v.a!)} mètres. Il mesure maintenant ${f(v.b!)} mètres. Combien de mètres a-t-il perdu ?`,
        calc: `${f(v.a!)} − ${f(v.b!)}`,
        response: `Il a perdu ${f(r)} mètres.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-manque-pour-acheter',
    label: 'Somme encore à ajouter',
    kinds: ['soustraction', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Prix (fr.)' },
      { key: 'b', label: 'Somme déjà donnée (fr.)' },
    ],
    roll: (rng) => subPair(rng, 200, 4000),
    build: (v): Built => {
      const r = v.a! - v.b!
      return {
        prompt: `Le vélo coûte ${f(v.a!)} francs. On a déjà ${f(v.b!)} francs. Combien faut-il encore ajouter ?`,
        calc: `${f(v.a!)} − ${f(v.b!)}`,
        response: `Il faut encore ${f(r)} francs.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-deux-depenses',
    label: 'Deux dépenses',
    kinds: ['addition', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Équipement (fr.)' },
      { key: 'b', label: 'Hôtel (fr.)' },
    ],
    roll: (rng) => ({ a: cents(rng, 80, 900), b: cents(rng, 80, 900) }),
    build: (v): Built => {
      const r = r2(v.a! + v.b!)
      return {
        prompt: `L’équipement coûte ${f(v.a!)} francs et l’hôtel ${f(v.b!)} francs. Combien dépense-t-on au total ?`,
        calc: `${f(v.a!)} + ${f(v.b!)}`,
        response: `On dépense ${f(r)} francs.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-pas-du-groupe',
    label: 'Ce qui n’est pas dans le groupe',
    kinds: ['soustraction', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Total' },
      { key: 'b', label: 'Dans le groupe' },
    ],
    roll: (rng) => subPair(rng, 20, 400),
    build: (v): Built => {
      const r = v.a! - v.b!
      return {
        prompt: `Il y a ${f(v.a!)} montagnes miniatures. ${f(v.b!)} sont d’Europe. Combien ne sont pas d’Europe ?`,
        calc: `${f(v.a!)} − ${f(v.b!)}`,
        response: `${f(r)} ne sont pas d’Europe.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-main-oeuvre',
    label: 'Prix du travail',
    kinds: ['soustraction', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Facture totale (fr.)' },
      { key: 'b', label: 'Pièces (fr.)' },
    ],
    roll: (rng) => subMoney(rng, 200, 3000),
    build: (v): Built => {
      const r = r2(v.a! - v.b!)
      return {
        prompt: `La facture est de ${f(v.a!)} francs. Les pièces coûtent ${f(v.b!)} francs. Combien coûte le travail ?`,
        calc: `${f(v.a!)} − ${f(v.b!)}`,
        response: `Le travail coûte ${f(r)} francs.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-boussoles',
    label: 'Matériel encore à acheter',
    kinds: ['add-sub', 'soustraction', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Filles' },
      { key: 'b', label: 'Filles qui en ont déjà' },
      { key: 'c', label: 'Garçons qui en ont besoin' },
    ],
    roll: (rng) => {
      const a = int(rng, 40, 150)
      const b = int(rng, 10, a - 5)
      return { a, b, c: int(rng, 10, 90) }
    },
    build: (v): Built => {
      const r = v.a! - v.b! + v.c!
      return {
        prompt: `Il y a ${f(v.a!)} filles. ${f(v.b!)} ont déjà une boussole. ${f(v.c!)} garçons n’en ont pas. Combien de boussoles faut-il acheter ?`,
        calc: `${f(v.a!)} − ${f(v.b!)} + ${f(v.c!)}`,
        response: `Il faut acheter ${f(r)} boussoles.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-deux-sortes',
    label: 'Deux sortes à additionner',
    kinds: ['addition', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Première sorte' },
      { key: 'b', label: 'Deuxième sorte' },
    ],
    roll: (rng) => ({ a: int(rng, 10, 200), b: int(rng, 10, 80) }),
    build: (v): Built => {
      const r = v.a! + v.b!
      return {
        prompt: `Il reste ${f(v.a!)} glaces à la fraise et ${f(v.b!)} glaces à la vanille. Combien y a-t-il de glaces ?`,
        calc: `${f(v.a!)} + ${f(v.b!)}`,
        response: `Il y a ${f(r)} glaces.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-efface',
    label: 'Après avoir retiré',
    kinds: ['soustraction', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Au départ' },
      { key: 'b', label: 'Retirés' },
    ],
    roll: (rng) => subPair(rng, 20, 400),
    build: (v): Built => {
      const r = v.a! - v.b!
      return {
        prompt: `Elsa a ${f(v.a!)} photos. Elle en efface ${f(v.b!)}. Combien en reste-t-il ?`,
        calc: `${f(v.a!)} − ${f(v.b!)}`,
        response: `Il en reste ${f(r)}.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-zoo',
    label: 'Entrées et repas',
    kinds: ['multiplication', 'addition', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Entrée adulte (fr.)' },
      { key: 'b', label: 'Entrée enfant (fr.)' },
      { key: 'c', label: 'Nombre d’enfants' },
      { key: 'd', label: 'Repas (fr.)' },
    ],
    roll: (rng) => ({
      a: cents(rng, 12, 30),
      b: cents(rng, 4, 12),
      c: int(rng, 1, 4),
      d: cents(rng, 20, 90),
    }),
    build: (v): Built => {
      const r = r2(2 * v.a! + v.c! * v.b! + v.d!)
      return {
        prompt: `Deux adultes paient ${f(v.a!)} francs chacun. ${f(v.c!)} enfant${v.c! > 1 ? 's paient' : ' paie'} ${f(v.b!)} francs. Le repas coûte ${f(v.d!)} francs. Combien paie-t-on en tout ?`,
        calc: `2 × ${f(v.a!)} + ${f(v.c!)} × ${f(v.b!)} + ${f(v.d!)}`,
        response: `On paie ${f(r)} francs.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-autre-a-depense-plus',
    label: 'L’autre a dépensé davantage',
    kinds: ['addition', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Dépense connue (fr.)' },
      { key: 'b', label: 'Écart (fr.)' },
    ],
    roll: (rng) => ({ a: cents(rng, 20, 200), b: cents(rng, 5, 80) }),
    build: (v): Built => {
      const r = r2(v.a! + v.b!)
      return {
        prompt: `Yllia a dépensé ${f(v.a!)} francs. C’est ${f(v.b!)} francs de moins que l’autre personne. Combien l’autre a-t-elle dépensé ?`,
        calc: `${f(v.a!)} + ${f(v.b!)}`,
        response: `L’autre a dépensé ${f(r)} francs.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-part-de-lautre',
    label: 'Trouver la part de l’autre',
    kinds: ['soustraction', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Total' },
      { key: 'b', label: 'Part connue' },
    ],
    roll: (rng) => subPair(rng, 50, 800),
    build: (v): Built => {
      const r = v.a! - v.b!
      return {
        prompt: `À deux, elles ont ${f(v.a!)} photos. L’une en a ${f(v.b!)}. Combien l’autre en a-t-elle ?`,
        calc: `${f(v.a!)} − ${f(v.b!)}`,
        response: `L’autre en a ${f(r)}.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-etages',
    label: 'Étages parcourus seul',
    kinds: ['soustraction', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Étage d’arrivée' },
      { key: 'b', label: 'Étage où l’autre descend' },
    ],
    roll: (rng) => subPair(rng, 2, 40),
    build: (v): Built => {
      const r = v.a! - v.b!
      return {
        prompt: `L’ascenseur s’arrête au ${f(v.b!)}e étage, puis continue jusqu’au ${f(v.a!)}e. Combien d’étages reste-t-il à monter seul ?`,
        calc: `${f(v.a!)} − ${f(v.b!)}`,
        response: `Il reste ${f(r)} étages.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-tu-as-moins',
    label: '« Tu en as moins que moi »',
    kinds: ['addition', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Nombre annoncé' },
      { key: 'b', label: 'Écart' },
    ],
    roll: (rng) => ({ a: int(rng, 20, 2000), b: int(rng, 10, 500) }),
    build: (v): Built => {
      const r = v.a! + v.b!
      return {
        prompt: `« J’ai ${f(v.a!)} billes. » « Tu en as ${f(v.b!)} de moins que moi. » Combien l’autre en a-t-il ?`,
        calc: `${f(v.a!)} + ${f(v.b!)}`,
        response: `L’autre en a ${f(r)}.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-de-plus-dans',
    label: 'Combien de plus dans l’autre lieu',
    kinds: ['soustraction', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Plus grand nombre' },
      { key: 'b', label: 'Plus petit nombre' },
    ],
    roll: (rng) => subPair(rng, 50, 5000),
    build: (v): Built => {
      const r = v.a! - v.b!
      return {
        prompt: `Une école a ${f(v.a!)} élèves, l’autre ${f(v.b!)}. Combien d’élèves de plus y a-t-il dans la première ?`,
        calc: `${f(v.a!)} − ${f(v.b!)}`,
        response: `Il y en a ${f(r)} de plus.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-ecart-mesures',
    label: 'Écart entre deux mesures',
    kinds: ['soustraction', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Plus grande mesure' },
      { key: 'b', label: 'Plus petite mesure' },
    ],
    roll: (rng) => subPair(rng, 80, 400),
    build: (v): Built => {
      const r = v.a! - v.b!
      return {
        prompt: `Une chaussure mesure ${f(v.a!)} mm, l’autre ${f(v.b!)} mm. De combien de millimètres la plus petite est-elle plus courte ?`,
        calc: `${f(v.a!)} − ${f(v.b!)}`,
        response: `Elle est plus courte de ${f(r)} mm.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-taille',
    label: 'Taille à partir d’un écart',
    kinds: ['addition', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Taille connue (cm)' },
      { key: 'b', label: 'Écart (cm)' },
    ],
    roll: (rng) => ({ a: int(rng, 120, 170), b: int(rng, 5, 30) }),
    build: (v): Built => {
      const r = v.a! + v.b!
      return {
        prompt: `Olivia mesure ${f(v.a!)} cm. Elle mesure ${f(v.b!)} cm de moins que l’autre. Quelle est la taille de l’autre ?`,
        calc: `${f(v.a!)} + ${f(v.b!)}`,
        response: `L’autre mesure ${f(r)} cm.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-tickets',
    label: 'Tickets restants',
    kinds: ['soustraction', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Tickets au départ' },
      { key: 'b', label: 'Tickets vendus' },
    ],
    roll: (rng) => subPair(rng, 20, 500),
    build: (v): Built => {
      const r = v.a! - v.b!
      return {
        prompt: `Il y avait ${f(v.a!)} tickets. ${f(v.b!)} ont été vendus. Combien en reste-t-il ?`,
        calc: `${f(v.a!)} − ${f(v.b!)}`,
        response: `Il en reste ${f(r)}.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-pages-deux-jours',
    label: 'Pages lues sur deux jours',
    kinds: ['addition', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Pages d’hier' },
      { key: 'b', label: 'Pages d’aujourd’hui' },
    ],
    roll: (rng) => ({ a: int(rng, 20, 300), b: int(rng, 20, 300) }),
    build: (v): Built => {
      const r = v.a! + v.b!
      return {
        prompt: `Hier, ${f(v.a!)} pages ont été lues. Aujourd’hui, ${f(v.b!)} pages. Combien de pages en tout ?`,
        calc: `${f(v.a!)} + ${f(v.b!)}`,
        response: `${f(r)} pages ont été lues.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-vendu-moins',
    label: 'L’autre a vendu davantage',
    kinds: ['addition', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Ventes connues' },
      { key: 'b', label: 'Écart' },
    ],
    roll: (rng) => ({ a: int(rng, 200, 4000), b: int(rng, 20, 900) }),
    build: (v): Built => {
      const r = v.a! + v.b!
      return {
        prompt: `Un musée a vendu ${f(v.a!)} billets. C’est ${f(v.b!)} de moins que l’autre musée. Combien l’autre a-t-il vendu ?`,
        calc: `${f(v.a!)} + ${f(v.b!)}`,
        response: `L’autre a vendu ${f(r)} billets.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-chemin',
    label: 'Deuxième chemin plus court',
    kinds: ['soustraction', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Premier chemin (km)' },
      { key: 'b', label: 'Écart (km)' },
    ],
    roll: (rng) => subMoney(rng, 2, 30),
    build: (v): Built => {
      const r = r2(v.a! - v.b!)
      return {
        prompt: `Le premier chemin mesure ${f(v.a!)} km. C’est ${f(v.b!)} km de plus que le deuxième. Combien de kilomètres mesure le deuxième ?`,
        calc: `${f(v.a!)} − ${f(v.b!)}`,
        response: `Le deuxième mesure ${f(r)} km.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-trouvailles',
    label: 'Ce qui a été ajouté cette année',
    kinds: ['soustraction', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Nombre actuel' },
      { key: 'b', label: 'Nombre l’an passé' },
    ],
    roll: (rng) => subPair(rng, 20, 500),
    build: (v): Built => {
      const r = v.a! - v.b!
      return {
        prompt: `L’an passé, il y avait ${f(v.b!)} fossiles. Aujourd’hui, il y en a ${f(v.a!)}. Combien en a-t-on trouvé cette année ?`,
        calc: `${f(v.a!)} − ${f(v.b!)}`,
        response: `On en a trouvé ${f(r)}.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-collection-plus',
    label: 'Collection avec un surplus',
    kinds: ['addition', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Nombre de départ' },
      { key: 'b', label: 'De plus' },
    ],
    roll: (rng) => ({ a: int(rng, 20, 900), b: int(rng, 10, 400) }),
    build: (v): Built => {
      const r = v.a! + v.b!
      return {
        prompt: `Farid a ${f(v.a!)} billes. Reza en a ${f(v.b!)} de plus. Combien Reza en a-t-il ?`,
        calc: `${f(v.a!)} + ${f(v.b!)}`,
        response: `Reza en a ${f(r)}.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-collection-moins',
    label: 'L’autre en a moins',
    kinds: ['soustraction', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Nombre connu' },
      { key: 'b', label: 'Écart' },
    ],
    roll: (rng) => subPair(rng, 15, 400),
    build: (v): Built => {
      const r = v.a! - v.b!
      return {
        prompt: `Maria a ${f(v.a!)} peluches. C’est ${f(v.b!)} de plus que Leticia. Combien Leticia en a-t-elle ?`,
        calc: `${f(v.a!)} − ${f(v.b!)}`,
        response: `Leticia en a ${f(r)}.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-recu-en-plus',
    label: 'Objets reçus en plus',
    kinds: ['addition', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Déjà là' },
      { key: 'b', label: 'Reçus' },
    ],
    roll: (rng) => ({ a: int(rng, 20, 3000), b: int(rng, 5, 400) }),
    build: (v): Built => {
      const r = v.a! + v.b!
      return {
        prompt: `Il y a déjà ${f(v.a!)} broches. On en reçoit ${f(v.b!)}. Combien y en a-t-il maintenant ?`,
        calc: `${f(v.a!)} + ${f(v.b!)}`,
        response: `Il y en a ${f(r)} maintenant.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-reste-ailleurs',
    label: 'Le reste est ailleurs',
    kinds: ['soustraction', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Total' },
      { key: 'b', label: 'Déjà comptés ici' },
    ],
    roll: (rng) => subPair(rng, 20, 400),
    build: (v): Built => {
      const r = v.a! - v.b!
      return {
        prompt: `Il y a ${f(v.a!)} livres en tout. ${f(v.b!)} sont dans la chambre. Combien sont dans la cave ?`,
        calc: `${f(v.a!)} − ${f(v.b!)}`,
        response: `${f(r)} livres sont dans la cave.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-cailloux',
    label: 'Un objet tous les n pas',
    kinds: ['multiplication', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Cailloux' },
      { key: 'b', label: 'Pas entre deux cailloux' },
    ],
    roll: (rng) => ({ a: int(rng, 10, 80), b: int(rng, 2, 12) }),
    build: (v): Built => {
      const r = v.a! * v.b!
      return {
        prompt: `Un caillou est posé tous les ${f(v.b!)} pas. Combien de pas pour ${f(v.a!)} cailloux ?`,
        calc: `${f(v.a!)} × ${f(v.b!)}`,
        response: `Cela fait ${f(r)} pas.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-trois-groupes',
    label: 'Trois groupes à additionner',
    kinds: ['addition', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Premier groupe' },
      { key: 'b', label: 'Deuxième groupe' },
      { key: 'c', label: 'Troisième groupe' },
    ],
    roll: (rng) => ({ a: int(rng, 10, 200), b: int(rng, 10, 80), c: int(rng, 5, 60) }),
    build: (v): Built => {
      const r = v.a! + v.b! + v.c!
      return {
        prompt: `Il y a ${f(v.a!)} bonbons rouges, ${f(v.b!)} verts et ${f(v.c!)} jaunes. Combien de bonbons en tout ?`,
        calc: `${f(v.a!)} + ${f(v.b!)} + ${f(v.c!)}`,
        response: `Il y a ${f(r)} bonbons.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-lignes',
    label: 'Lignes identiques',
    kinds: ['multiplication', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Nombre de lignes' },
      { key: 'b', label: 'Objets par ligne' },
    ],
    roll: (rng) => ({ a: int(rng, 2, 12), b: int(rng, 8, 50) }),
    build: (v): Built => {
      const r = v.a! * v.b!
      return {
        prompt: `Dans le jardin, il y a ${f(v.a!)} lignes de ${f(v.b!)} choux. Combien de choux ont été plantés ?`,
        calc: `${f(v.a!)} × ${f(v.b!)}`,
        response: `${f(r)} choux ont été plantés.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-boites-exactes',
    label: 'Boîtes identiques',
    kinds: ['division', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Objets' },
      { key: 'b', label: 'Objets par boîte' },
    ],
    roll: (rng) => {
      const b = int(rng, 2, 12)
      const k = int(rng, 8, 80)
      return { a: b * k, b }
    },
    build: (v): Built => {
      const r = v.a! / v.b!
      return {
        prompt: `${f(v.a!)} pierres sont cachées. Chaque boîte en contient ${f(v.b!)}. Combien de boîtes y a-t-il ?`,
        calc: `${f(v.a!)} ÷ ${f(v.b!)}`,
        response: `Il y a ${f(r)} boîtes.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-bacs',
    label: 'Contenu de plusieurs bacs',
    kinds: ['multiplication', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Nombre de bacs' },
      { key: 'b', label: 'Livres par bac' },
    ],
    roll: (rng) => ({ a: int(rng, 6, 24), b: int(rng, 10, 40) }),
    build: (v): Built => {
      const r = v.a! * v.b!
      return {
        prompt: `Chaque bac contient ${f(v.b!)} livres. Combien de livres dans ${f(v.a!)} bacs ?`,
        calc: `${f(v.a!)} × ${f(v.b!)}`,
        response: `Il y a ${f(r)} livres.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-prets',
    label: 'Ce qui reste après les prêts',
    kinds: ['soustraction', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Collection' },
      { key: 'b', label: 'En prêt' },
    ],
    roll: (rng) => subPair(rng, 20, 500),
    build: (v): Built => {
      const r = v.a! - v.b!
      return {
        prompt: `La bibliothèque a ${f(v.a!)} bandes dessinées. ${f(v.b!)} sont en prêt. Combien en reste-t-il sur place ?`,
        calc: `${f(v.a!)} − ${f(v.b!)}`,
        response: `Il en reste ${f(r)}.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-fois-collection',
    label: 'Plusieurs fois une collection',
    kinds: ['multiplication', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Collection de départ' },
      { key: 'b', label: 'Nombre de fois' },
    ],
    roll: (rng) => ({ a: int(rng, 8, 40), b: int(rng, 2, 8) }),
    build: (v): Built => {
      const r = v.a! * v.b!
      return {
        prompt: `Vincent a ${f(v.a!)} bandes dessinées. Viviane en a ${f(v.b!)} fois plus. Combien Viviane en a-t-elle ?`,
        calc: `${f(v.a!)} × ${f(v.b!)}`,
        response: `Viviane en a ${f(r)}.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-pages-restantes',
    label: 'Pages encore à lire',
    kinds: ['soustraction', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Pages du livre' },
      { key: 'b', label: 'Pages déjà lues' },
    ],
    roll: (rng) => subPair(rng, 80, 3000),
    build: (v): Built => {
      const r = v.a! - v.b!
      return {
        prompt: `Le livre a ${f(v.a!)} pages. ${f(v.b!)} pages sont déjà lues. Combien de pages reste-t-il ?`,
        calc: `${f(v.a!)} − ${f(v.b!)}`,
        response: `Il reste ${f(r)} pages.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-garcons-ecole',
    label: 'Garçons dans l’école',
    kinds: ['soustraction', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Élèves' },
      { key: 'b', label: 'Filles' },
    ],
    roll: (rng) => subPair(rng, 40, 800),
    build: (v): Built => {
      const r = v.a! - v.b!
      return {
        prompt: `L’école a ${f(v.a!)} élèves, dont ${f(v.b!)} filles. Combien y a-t-il de garçons ?`,
        calc: `${f(v.a!)} − ${f(v.b!)}`,
        response: `Il y a ${f(r)} garçons.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-distribution',
    label: 'Objets distribués',
    kinds: ['multiplication', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Élèves' },
      { key: 'b', label: 'Objets par élève' },
    ],
    roll: (rng) => ({ a: int(rng, 12, 36), b: int(rng, 2, 12) }),
    build: (v): Built => {
      const r = v.a! * v.b!
      return {
        prompt: `L’enseignante donne ${f(v.b!)} crayons à chacun de ses ${f(v.a!)} élèves. Combien de crayons distribue-t-elle ?`,
        calc: `${f(v.a!)} × ${f(v.b!)}`,
        response: `Elle distribue ${f(r)} crayons.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-cartes-images',
    label: 'Images sur des cartes',
    kinds: ['multiplication', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Cartes' },
      { key: 'b', label: 'Images par carte' },
    ],
    roll: (rng) => ({ a: int(rng, 4, 20), b: int(rng, 20, 160) }),
    build: (v): Built => {
      const r = v.a! * v.b!
      return {
        prompt: `${f(v.a!)} cartes contiennent chacune ${f(v.b!)} papillons. Combien de papillons en tout ?`,
        calc: `${f(v.a!)} × ${f(v.b!)}`,
        response: `Il y a ${f(r)} papillons.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-somme-par-eleve',
    label: 'Somme reçue pour chaque élève',
    kinds: ['multiplication', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Francs par élève' },
      { key: 'b', label: 'Élèves' },
    ],
    roll: (rng) => ({ a: cents(rng, 5, 25), b: int(rng, 12, 40) }),
    build: (v): Built => {
      const r = r2(v.a! * v.b!)
      return {
        prompt: `L’enseignante reçoit ${f(v.a!)} francs pour chacun de ses ${f(v.b!)} élèves. Quelle somme reçoit-elle ?`,
        calc: `${f(v.a!)} × ${f(v.b!)}`,
        response: `Elle reçoit ${f(r)} francs.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-salaire',
    label: 'Ce qui a été dépensé',
    kinds: ['soustraction', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Somme de départ (fr.)' },
      { key: 'b', label: 'Somme qui reste (fr.)' },
    ],
    roll: (rng) => subMoney(rng, 500, 5000),
    build: (v): Built => {
      const r = r2(v.a! - v.b!)
      return {
        prompt: `Antoine gagne ${f(v.a!)} francs. Après les factures, il lui reste ${f(v.b!)} francs. Combien a-t-il dépensé ?`,
        calc: `${f(v.a!)} − ${f(v.b!)}`,
        response: `Il a dépensé ${f(r)} francs.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-quadrillage',
    label: 'Cases d’une page',
    kinds: ['multiplication', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Cases en longueur' },
      { key: 'b', label: 'Cases en largeur' },
    ],
    roll: (rng) => ({ a: int(rng, 8, 30), b: int(rng, 8, 30) }),
    build: (v): Built => {
      const r = v.a! * v.b!
      return {
        prompt: `Une page a ${f(v.a!)} petits carrés de long et ${f(v.b!)} de large. Combien de petits carrés y a-t-il ?`,
        calc: `${f(v.a!)} × ${f(v.b!)}`,
        response: `Il y a ${f(r)} petits carrés.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-caches-par',
    label: 'Cases cachées',
    kinds: ['multiplication', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Cases cachées en longueur' },
      { key: 'b', label: 'Cases cachées en largeur' },
    ],
    roll: (rng) => ({ a: int(rng, 3, 16), b: int(rng, 2, 10) }),
    build: (v): Built => {
      const r = v.a! * v.b!
      return {
        prompt: `Une étiquette cache ${f(v.a!)} carrés de long et ${f(v.b!)} de large. Combien de carrés sont cachés ?`,
        calc: `${f(v.a!)} × ${f(v.b!)}`,
        response: `${f(r)} carrés sont cachés.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-feuilles-blocs',
    label: 'Feuilles dans des blocs',
    kinds: ['multiplication', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Blocs' },
      { key: 'b', label: 'Feuilles par bloc' },
    ],
    roll: (rng) => ({ a: int(rng, 8, 30), b: int(rng, 20, 80) }),
    build: (v): Built => {
      const r = v.a! * v.b!
      return {
        prompt: `Chaque bloc contient ${f(v.b!)} feuilles. Combien de feuilles dans ${f(v.a!)} blocs ?`,
        calc: `${f(v.a!)} × ${f(v.b!)}`,
        response: `Il y a ${f(r)} feuilles.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-boites-remplies',
    label: 'Boîtes que l’on peut remplir',
    kinds: ['division', 'addition', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Objets jaunes' },
      { key: 'b', label: 'Objets bleus' },
      { key: 'c', label: 'Objets rouges' },
      { key: 'd', label: 'Objets par boîte' },
    ],
    roll: (rng) => ({
      a: int(rng, 40, 200),
      b: int(rng, 40, 200),
      c: int(rng, 40, 200),
      d: 10,
    }),
    build: (v): Built => {
      const r = Math.floor(v.a! / v.d!) + Math.floor(v.b! / v.d!) + Math.floor(v.c! / v.d!)
      return {
        prompt: `Il y a ${f(v.a!)} objets jaunes, ${f(v.b!)} bleus et ${f(v.c!)} rouges. On les range par couleur dans des boîtes de ${f(v.d!)}. Combien de boîtes peut-on remplir ?`,
        calc: `${f(v.a!)} ÷ ${f(v.d!)} + ${f(v.b!)} ÷ ${f(v.d!)} + ${f(v.c!)} ÷ ${f(v.d!)}`,
        response: `On peut remplir ${f(r)} boîtes.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-par-eleve',
    label: 'Part de chaque élève',
    kinds: ['division', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Feuilles' },
      { key: 'b', label: 'Élèves' },
    ],
    roll: (rng) => {
      const b = int(rng, 10, 30)
      return { a: b * int(rng, 2, 12), b }
    },
    build: (v): Built => {
      const r = v.a! / v.b!
      return {
        prompt: `On partage ${f(v.a!)} feuilles entre ${f(v.b!)} élèves, en parts égales. Combien de feuilles reçoit chaque élève ?`,
        calc: `${f(v.a!)} ÷ ${f(v.b!)}`,
        response: `Chaque élève reçoit ${f(r)} feuilles.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-equipes',
    label: 'Joueurs des équipes',
    kinds: ['multiplication', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Équipes' },
      { key: 'b', label: 'Joueurs par équipe' },
    ],
    roll: (rng) => ({ a: int(rng, 4, 16), b: int(rng, 5, 12) }),
    build: (v): Built => {
      const r = v.a! * v.b!
      return {
        prompt: `Les élèves forment ${f(v.a!)} équipes de ${f(v.b!)} joueurs. Combien d’élèves sont inscrits ?`,
        calc: `${f(v.a!)} × ${f(v.b!)}`,
        response: `${f(r)} élèves sont inscrits.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-sachets-a-acheter',
    label: 'Sachets à acheter',
    kinds: ['division', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Objets nécessaires' },
      { key: 'b', label: 'Objets par sachet' },
    ],
    roll: (rng) => ({ a: int(rng, 50, 900), b: int(rng, 8, 30) }),
    build: (v): Built => {
      const r = Math.ceil(v.a! / v.b!)
      return {
        prompt: `Il faut ${f(v.a!)} ballons. Les sachets en contiennent ${f(v.b!)}. Combien de sachets faut-il acheter ?`,
        calc: `${f(v.a!)} ÷ ${f(v.b!)}`,
        response: `Il faut acheter ${f(r)} sachets.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-paquets-identiques',
    label: 'Contenu de paquets identiques',
    kinds: ['multiplication', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Paquets' },
      { key: 'b', label: 'Objets par paquet' },
    ],
    roll: (rng) => ({ a: int(rng, 8, 40), b: int(rng, 10, 100) }),
    build: (v): Built => {
      const r = v.a! * v.b!
      return {
        prompt: `Il y a ${f(v.a!)} paquets de ${f(v.b!)} pailles. Combien de pailles en tout ?`,
        calc: `${f(v.a!)} × ${f(v.b!)}`,
        response: `Il y a ${f(r)} pailles.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-milliers',
    label: 'Paquets, cartons et caisses',
    kinds: ['multiplication', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Dans une pochette' },
      { key: 'b', label: 'Pochettes dans un carton' },
      { key: 'c', label: 'Cartons dans la caisse' },
    ],
    roll: (rng) => ({ a: 10, b: 10, c: int(rng, 2, 12) }),
    build: (v): Built => {
      const r = v.a! * v.b! * v.c!
      return {
        prompt: `Une pochette contient ${f(v.a!)} crayons. Un carton contient ${f(v.b!)} pochettes. Une caisse contient ${f(v.c!)} cartons. Combien de crayons y a-t-il dans la caisse ?`,
        calc: `${f(v.a!)} × ${f(v.b!)} × ${f(v.c!)}`,
        response: `Il y a ${f(r)} crayons.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-par-dix',
    label: 'Groupes de dix',
    kinds: ['division', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Objets' },
      { key: 'b', label: 'Taille du groupe' },
    ],
    roll: (rng) => ({ a: int(rng, 80, 2000), b: int(rng, 5, 20) }),
    build: (v): Built => {
      const r = Math.floor(v.a! / v.b!)
      return {
        prompt: `${f(v.a!)} bâtonnets sont rangés par groupes de ${f(v.b!)}. Combien de groupes complets peut-on faire ?`,
        calc: `${f(v.a!)} ÷ ${f(v.b!)}`,
        response: `On peut faire ${f(r)} groupes complets.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-colliers',
    label: 'Colliers de perles',
    kinds: ['division', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Perles' },
      { key: 'b', label: 'Perles par collier' },
    ],
    roll: (rng) => ({ a: int(rng, 200, 4000), b: int(rng, 20, 100) }),
    build: (v): Built => {
      const r = Math.floor(v.a! / v.b!)
      return {
        prompt: `Il y a ${f(v.a!)} perles. Chaque collier en utilise ${f(v.b!)}. Combien de colliers complets peut-on fabriquer ?`,
        calc: `${f(v.a!)} ÷ ${f(v.b!)}`,
        response: `On peut fabriquer ${f(r)} colliers.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-billets-vendus',
    label: 'Recette des billets',
    kinds: ['multiplication', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Billets vendus' },
      { key: 'b', label: 'Prix d’un billet (fr.)' },
    ],
    roll: (rng) => ({ a: int(rng, 10, 80), b: int(rng, 8, 25) }),
    build: (v): Built => {
      const r = v.a! * v.b!
      return {
        prompt: `Chaque place coûte ${f(v.b!)} francs. ${f(v.a!)} billets sont vendus. Quelle somme a été reçue ?`,
        calc: `${f(v.a!)} × ${f(v.b!)}`,
        response: `La somme reçue est ${f(r)} francs.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-par-an',
    label: 'Production sur une année',
    kinds: ['multiplication', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Animaux' },
      { key: 'b', label: 'Œufs par mois et par animal' },
    ],
    roll: (rng) => ({ a: int(rng, 2, 12), b: int(rng, 10, 30) }),
    build: (v): Built => {
      const r = v.a! * v.b! * 12
      return {
        prompt: `${f(v.a!)} poules pondent chacune ${f(v.b!)} œufs par mois. Combien d’œufs en une année ?`,
        calc: `${f(v.a!)} × ${f(v.b!)} × 12`,
        response: `Cela fait ${f(r)} œufs.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-rangées',
    label: 'Places en rangées',
    kinds: ['multiplication', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Rangées' },
      { key: 'b', label: 'Places par rangée' },
    ],
    roll: (rng) => ({ a: int(rng, 6, 24), b: int(rng, 8, 20) }),
    build: (v): Built => {
      const r = v.a! * v.b!
      return {
        prompt: `Le parking a ${f(v.a!)} rangées de ${f(v.b!)} places. Combien de places en tout ?`,
        calc: `${f(v.a!)} × ${f(v.b!)}`,
        response: `Il y a ${f(r)} places.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-hier-plus',
    label: 'Il y en avait plus hier',
    kinds: ['addition', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Nombre d’aujourd’hui' },
      { key: 'b', label: 'De plus hier' },
    ],
    roll: (rng) => ({ a: int(rng, 20, 200), b: int(rng, 10, 120) }),
    build: (v): Built => {
      const r = v.a! + v.b!
      return {
        prompt: `Ce matin, il y a ${f(v.a!)} vélos. Hier, il y en avait ${f(v.b!)} de plus. Combien y en avait-il hier ?`,
        calc: `${f(v.a!)} + ${f(v.b!)}`,
        response: `Il y en avait ${f(r)}.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-fois-plus-maintenant',
    label: 'Plusieurs fois plus maintenant',
    kinds: ['multiplication', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Nombre de départ' },
      { key: 'b', label: 'Nombre de fois' },
    ],
    roll: (rng) => ({ a: int(rng, 6, 40), b: int(rng, 2, 8) }),
    build: (v): Built => {
      const r = v.a! * v.b!
      return {
        prompt: `Dimanche, il y avait ${f(v.a!)} vélos. Maintenant, il y en a ${f(v.b!)} fois plus. Combien y en a-t-il maintenant ?`,
        calc: `${f(v.a!)} × ${f(v.b!)}`,
        response: `Il y en a ${f(r)}.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-medailles',
    label: 'Médailles des meilleures équipes',
    kinds: ['multiplication', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Équipes récompensées' },
      { key: 'b', label: 'Joueurs par équipe' },
    ],
    roll: (rng) => ({ a: int(rng, 2, 5), b: int(rng, 5, 12) }),
    build: (v): Built => {
      const r = v.a! * v.b!
      return {
        prompt: `Les ${f(v.b!)} joueurs des ${f(v.a!)} meilleures équipes reçoivent une médaille. Combien de médailles ?`,
        calc: `${f(v.a!)} × ${f(v.b!)}`,
        response: `${f(r)} enfants reçoivent une médaille.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-buts',
    label: 'Plusieurs fois plus de buts',
    kinds: ['multiplication', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Buts de l’autre équipe' },
      { key: 'b', label: 'Nombre de fois' },
    ],
    roll: (rng) => ({ a: int(rng, 6, 30), b: int(rng, 2, 5) }),
    build: (v): Built => {
      const r = v.a! * v.b!
      return {
        prompt: `Une équipe a marqué ${f(v.a!)} buts. L’équipe gagnante en a marqué ${f(v.b!)} fois plus. Combien de buts a marqués l’équipe gagnante ?`,
        calc: `${f(v.a!)} × ${f(v.b!)}`,
        response: `Elle a marqué ${f(r)} buts.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-flechettes',
    label: 'Points aux fléchettes',
    kinds: ['multiplication', 'addition', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Fléchettes dans la 1re zone' },
      { key: 'b', label: 'Points de la 1re zone' },
      { key: 'c', label: 'Fléchettes dans la 2e zone' },
      { key: 'd', label: 'Points de la 2e zone' },
    ],
    roll: (rng) => ({
      a: int(rng, 2, 8),
      b: int(rng, 10, 50),
      c: int(rng, 2, 8),
      d: int(rng, 20, 90),
    }),
    build: (v): Built => {
      const r = v.a! * v.b! + v.c! * v.d!
      return {
        prompt: `${f(v.a!)} fléchettes valent ${f(v.b!)} points chacune et ${f(v.c!)} fléchettes valent ${f(v.d!)} points chacune. Combien de points en tout ?`,
        calc: `${f(v.a!)} × ${f(v.b!)} + ${f(v.c!)} × ${f(v.d!)}`,
        response: `Il y a ${f(r)} points.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-buches',
    label: 'Bûches du mois',
    kinds: ['multiplication', 'soustraction', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Bûches par soir' },
      { key: 'b', label: 'Jours du mois' },
      { key: 'c', label: 'Jours d’absence' },
    ],
    roll: (rng) => ({ a: int(rng, 2, 8), b: int(rng, 28, 31), c: int(rng, 0, 12) }),
    build: (v): Built => {
      const r = v.a! * (v.b! - v.c!)
      return {
        prompt: `Chaque soir, on brûle ${f(v.a!)} bûches. Le mois a ${f(v.b!)} jours et on est absent ${f(v.c!)} jours. Combien de bûches brûle-t-on ?`,
        calc: `${f(v.a!)} × (${f(v.b!)} − ${f(v.c!)})`,
        response: `On brûle ${f(r)} bûches.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-omelettes',
    label: 'Œufs après les omelettes',
    kinds: ['multiplication', 'soustraction', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Plateaux' },
      { key: 'b', label: 'Œufs par plateau' },
      { key: 'c', label: 'Omelettes' },
      { key: 'd', label: 'Œufs par omelette' },
    ],
    roll: (rng) => {
      const a = int(rng, 3, 8)
      const b = int(rng, 20, 36)
      const d = 2
      const maxO = Math.floor((a * b) / d) - 1
      return { a, b, c: int(rng, 5, maxO), d }
    },
    build: (v): Built => {
      const r = v.a! * v.b! - v.c! * v.d!
      return {
        prompt: `${f(v.a!)} plateaux contiennent ${f(v.b!)} œufs chacun. On prépare ${f(v.c!)} omelettes de ${f(v.d!)} œufs. Combien d’œufs reste-t-il ?`,
        calc: `${f(v.a!)} × ${f(v.b!)} − ${f(v.c!)} × ${f(v.d!)}`,
        response: `Il reste ${f(r)} œufs.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-album-max',
    label: 'Album le plus rempli',
    kinds: ['multiplication', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Pages du 1er album' },
      { key: 'b', label: 'Photos par page (1er)' },
      { key: 'c', label: 'Pages du 2e album' },
      { key: 'd', label: 'Photos par page (2e)' },
    ],
    roll: (rng) => ({
      a: int(rng, 6, 20),
      b: int(rng, 6, 16),
      c: int(rng, 6, 16),
      d: int(rng, 6, 16),
    }),
    build: (v): Built => {
      const x = v.a! * v.b!
      const y = v.c! * v.d!
      const r = Math.max(x, y)
      return {
        prompt: `Un album a ${f(v.a!)} pages de ${f(v.b!)} photos. Un autre a ${f(v.c!)} pages de ${f(v.d!)} photos. Combien de photos a l’album le plus rempli ?`,
        calc: `${f(v.a!)} × ${f(v.b!)} et ${f(v.c!)} × ${f(v.d!)}`,
        response: `L’album le plus rempli a ${f(r)} photos.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-timbres',
    label: 'Timbres encore à coller',
    kinds: ['multiplication', 'soustraction', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Pages' },
      { key: 'b', label: 'Lignes par page' },
      { key: 'c', label: 'Timbres par ligne' },
      { key: 'd', label: 'Timbres déjà collés' },
    ],
    roll: (rng) => {
      const a = int(rng, 4, 12)
      const b = int(rng, 4, 8)
      const c = int(rng, 6, 10)
      const total = a * b * c
      return { a, b, c, d: int(rng, 10, total - 5) }
    },
    build: (v): Built => {
      const r = v.a! * v.b! * v.c! - v.d!
      return {
        prompt: `L’album a ${f(v.a!)} pages. Chaque page a ${f(v.b!)} lignes de ${f(v.c!)} timbres. ${f(v.d!)} timbres sont déjà collés. Combien en manque-t-il ?`,
        calc: `${f(v.a!)} × ${f(v.b!)} × ${f(v.c!)} − ${f(v.d!)}`,
        response: `Il en manque ${f(r)}.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-budget-reste',
    label: 'Argent qui reste après la sortie',
    kinds: ['multiplication', 'soustraction', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Élèves' },
      { key: 'b', label: 'Prix par élève (fr.)' },
      { key: 'c', label: 'Budget (fr.)' },
    ],
    roll: (rng) => {
      const a = int(rng, 10, 28)
      const b = cents(rng, 4, 12)
      const cost = r2(a * b)
      return { a, b, c: r2(cost + cents(rng, 5, 40)) }
    },
    build: (v): Built => {
      const r = r2(v.c! - v.a! * v.b!)
      return {
        prompt: `${f(v.a!)} élèves paient ${f(v.b!)} francs chacun. On dispose de ${f(v.c!)} francs. Combien reste-t-il ?`,
        calc: `${f(v.c!)} − ${f(v.a!)} × ${f(v.b!)}`,
        response: r < 0 ? `Il manque ${f(-r)} francs.` : `Il reste ${f(r)} francs.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-cinema-groupe',
    label: 'Cinéma pour le groupe',
    kinds: ['multiplication', 'addition', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Élèves' },
      { key: 'b', label: 'Prix élève (fr.)' },
      { key: 'c', label: 'Adultes' },
      { key: 'd', label: 'Prix adulte (fr.)' },
    ],
    roll: (rng) => ({
      a: int(rng, 8, 24),
      b: cents(rng, 4, 9),
      c: int(rng, 1, 3),
      d: cents(rng, 10, 16),
    }),
    build: (v): Built => {
      const r = r2(v.a! * v.b! + v.c! * v.d!)
      return {
        prompt: `${f(v.a!)} élèves paient ${f(v.b!)} francs et ${f(v.c!)} adultes paient ${f(v.d!)} francs. Combien le groupe paie-t-il ?`,
        calc: `${f(v.a!)} × ${f(v.b!)} + ${f(v.c!)} × ${f(v.d!)}`,
        response: `Le groupe paie ${f(r)} francs.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-sortie-glaces',
    label: 'Sortie, puis les glaces',
    kinds: ['multiplication', 'soustraction', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Élèves' },
      { key: 'b', label: 'Reçu par élève (fr.)' },
      { key: 'c', label: 'Bus (fr.)' },
      { key: 'd', label: 'Entrée par élève (fr.)' },
      { key: 'e', label: 'Glace (fr.)' },
    ],
    roll: (rng) => {
      const a = int(rng, 12, 24)
      const d = cents(rng, 3, 6)
      const e = cents(rng, 1, 3)
      const c = cents(rng, 40, 100)
      const b = Math.ceil(d + e + c / a) + int(rng, 1, 4)
      return { a, b, c, d, e }
    },
    build: (v): Built => {
      const r = r2(v.a! * v.b! - v.c! - v.a! * v.d! - v.a! * v.e!)
      return {
        prompt: `On reçoit ${f(v.b!)} francs pour chacun des ${f(v.a!)} élèves. Le bus coûte ${f(v.c!)} francs, l’entrée ${f(v.d!)} francs par élève et la glace ${f(v.e!)} francs par élève. Combien reste-t-il ?`,
        calc: `${f(v.a!)} × ${f(v.b!)} − ${f(v.c!)} − ${f(v.a!)} × ${f(v.d!)} − ${f(v.a!)} × ${f(v.e!)}`,
        response: r < 0 ? `Il manque ${f(-r)} francs.` : `Il reste ${f(r)} francs.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-cadeaux',
    label: 'Cadeaux payés avec un billet',
    kinds: ['addition', 'soustraction', 'melange'],
    levels: avance,
    change: true,
    defs: [
      { key: 'a', label: 'Livre (fr.)' },
      { key: 'b', label: 'Le jeu coûte tant de plus (fr.)' },
      { key: 'c', label: 'Puzzle (fr.)' },
      { key: 'd', label: 'Peluche (fr.)' },
      { key: 'e', label: 'Billet (fr.)' },
    ],
    roll: (rng) => {
      const a = cents(rng, 15, 40)
      const b = cents(rng, 5, 20)
      const c = cents(rng, 10, 30)
      const d = cents(rng, 10, 30)
      const total = r2(a + a + b + c + d)
      const bill = total <= 100 ? 100 : 200
      return { a, b, c, d, e: bill }
    },
    build: (v): Built => {
      const total = r2(v.a! + (v.a! + v.b!) + v.c! + v.d!)
      const r = r2(v.e! - total)
      return {
        prompt: `Le livre coûte ${f(v.a!)} francs. Le jeu coûte ${f(v.b!)} francs de plus. Le puzzle coûte ${f(v.c!)} francs et la peluche ${f(v.d!)} francs. On paie avec un billet de ${f(v.e!)} francs. Quels billets et quelles pièces rend-on ?`,
        calc: `${f(v.e!)} − (${f(v.a!)} + ${f(v.a!)} + ${f(v.b!)} + ${f(v.c!)} + ${f(v.d!)})`,
        response: r < 0 ? 'Le billet ne suffit pas.' : `On rend ${f(r)} francs.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-minigolf',
    label: 'Minigolf et glaces',
    kinds: ['multiplication', 'addition', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Élèves' },
      { key: 'b', label: 'Minigolf (fr.)' },
      { key: 'c', label: 'Glace (fr.)' },
    ],
    roll: (rng) => ({ a: int(rng, 8, 24), b: cents(rng, 8, 16), c: cents(rng, 2, 6) }),
    build: (v): Built => {
      const r = r2(v.a! * (v.b! + v.c!) + v.c!)
      return {
        prompt: `${f(v.a!)} élèves paient ${f(v.b!)} francs de minigolf et ${f(v.c!)} francs de glace. L’enseignante paie seulement une glace. Combien paie-t-elle en tout pour le groupe ?`,
        calc: `${f(v.a!)} × (${f(v.b!)} + ${f(v.c!)}) + ${f(v.c!)}`,
        response: `Elle paie ${f(r)} francs.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-achats-bibliotheque',
    label: 'Articles achetés par la bibliothèque',
    kinds: ['addition', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Livres' },
      { key: 'b', label: 'Albums' },
      { key: 'c', label: 'Bandes dessinées' },
      { key: 'd', label: 'Autres articles' },
    ],
    roll: (rng) => ({
      a: int(rng, 200, 1500),
      b: int(rng, 100, 800),
      c: int(rng, 100, 900),
      d: int(rng, 20, 200),
    }),
    build: (v): Built => {
      const r = v.a! + v.b! + v.c! + v.d!
      return {
        prompt: `La bibliothèque achète ${f(v.a!)} livres, ${f(v.b!)} albums, ${f(v.c!)} bandes dessinées et ${f(v.d!)} autres articles. Combien d’articles en tout ?`,
        calc: `${f(v.a!)} + ${f(v.b!)} + ${f(v.c!)} + ${f(v.d!)}`,
        response: `Elle achète ${f(r)} articles.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-fiction-manquante',
    label: 'Trouver les livres qui manquent au compte',
    kinds: ['soustraction', 'addition', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Total de l’autre bibliothèque' },
      { key: 'b', label: 'De moins' },
      { key: 'c', label: 'Articles déjà comptés' },
    ],
    roll: (rng) => {
      const c = int(rng, 400, 2000)
      const fiction = int(rng, 200, 1500)
      const b = int(rng, 50, 400)
      return { a: c + fiction + b, b, c }
    },
    build: (v): Built => {
      const r = v.a! - v.b! - v.c!
      return {
        prompt: `Une bibliothèque a acheté ${f(v.a!)} articles. L’autre en a acheté ${f(v.b!)} de moins. On a déjà compté ${f(v.c!)} articles chez elle, sans les livres de fiction. Combien de livres de fiction a-t-elle achetés ?`,
        calc: `${f(v.a!)} − ${f(v.b!)} − ${f(v.c!)}`,
        response: `Elle a acheté ${f(r)} livres de fiction.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-perles',
    label: 'Perles bleues du collier',
    kinds: ['addition', 'division', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Perles bleues déjà enfilées' },
      { key: 'b', label: 'Perles du collier fini' },
    ],
    roll: (rng) => {
      const a = int(rng, 8, 30)
      const x = int(rng, 4, 20)
      return { a, b: a + 2 * x }
    },
    build: (v): Built => {
      const r = (v.a! + v.b!) / 2
      return {
        prompt: `${f(v.a!)} perles bleues sont déjà enfilées. On ajoute autant de perles bleues que de perles blanches. Le collier fini a ${f(v.b!)} perles. Combien de perles bleues en tout ?`,
        calc: `(${f(v.a!)} + ${f(v.b!)}) ÷ 2`,
        response: `Il y a ${f(r)} perles bleues.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-chaine-argent',
    label: 'Argent de poche comparé',
    kinds: ['add-sub', 'soustraction', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Somme de Louane (fr.)' },
      { key: 'b', label: 'De moins pour la suivante (fr.)' },
      { key: 'c', label: 'De plus ensuite (fr.)' },
    ],
    roll: (rng) => {
      const a = int(rng, 2000, 6000)
      const b = int(rng, 200, a - 100)
      const c = int(rng, 200, 2500)
      return { a, b, c }
    },
    build: (v): Built => {
      const r = v.a! - v.b! + v.c!
      return {
        prompt: `Louane a ${f(v.a!)} francs. Juliette en a ${f(v.b!)} de moins. Timéo en a ${f(v.c!)} de plus que Juliette. Combien Timéo a-t-il ?`,
        calc: `${f(v.a!)} − ${f(v.b!)} + ${f(v.c!)}`,
        response: `Timéo a ${f(r)} francs.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-bonnets',
    label: 'Bonnets de plusieurs couleurs',
    kinds: ['addition', 'soustraction', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Bonnets bleus' },
      { key: 'b', label: 'Verts de plus que les bleus' },
      { key: 'c', label: 'Rouges de moins que les verts' },
    ],
    roll: (rng) => {
      const a = int(rng, 20, 120)
      const b = int(rng, 10, 60)
      const green = a + b
      const c = int(rng, 5, green - 5)
      return { a, b, c }
    },
    build: (v): Built => {
      const green = v.a! + v.b!
      const red = green - v.c!
      const r = v.a! + green + red + green
      return {
        prompt: `Il y a ${f(v.a!)} bonnets bleus, ${f(v.b!)} bonnets verts de plus que de bleus, et autant de jaunes que de verts. Il y a ${f(v.c!)} bonnets rouges de moins que de verts. Chaque élève a fait un bonnet. Combien d’élèves ?`,
        calc: `${f(v.a!)} + 2 × (${f(v.a!)} + ${f(v.b!)}) + (${f(v.a!)} + ${f(v.b!)} − ${f(v.c!)})`,
        response: `Il y a ${f(r)} élèves.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-photos-animaux',
    label: 'Seulement les photos d’animaux',
    kinds: ['addition', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Photos de montagnes' },
      { key: 'b', label: 'Photos de forêts' },
      { key: 'c', label: 'Photos de chevaux' },
      { key: 'd', label: 'Photos de souris' },
    ],
    roll: (rng) => ({
      a: int(rng, 20, 200),
      b: int(rng, 20, 150),
      c: int(rng, 20, 180),
      d: int(rng, 20, 180),
    }),
    build: (v): Built => {
      const r = v.c! + v.d!
      return {
        prompt: `Il y a ${f(v.a!)} photos de montagnes, ${f(v.b!)} de forêts, ${f(v.c!)} de chevaux et ${f(v.d!)} de souris. Combien de photos d’animaux ?`,
        calc: `${f(v.c!)} + ${f(v.d!)}`,
        response: `Il y a ${f(r)} photos d’animaux.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-boucherie',
    label: 'Dépense qui manque au compte',
    kinds: ['soustraction', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Somme de départ (fr.)' },
      { key: 'b', label: 'Épicerie (fr.)' },
      { key: 'c', label: 'Boulangerie (fr.)' },
      { key: 'd', label: 'Reste (fr.)' },
    ],
    roll: (rng) => {
      const b = cents(rng, 10, 80)
      const c = cents(rng, 5, 40)
      const butcher = cents(rng, 10, 80)
      const left = cents(rng, 20, 120)
      return { a: r2(b + c + butcher + left), b, c, d: left }
    },
    build: (v): Built => {
      const r = r2(v.a! - v.b! - v.c! - v.d!)
      return {
        prompt: `On part avec ${f(v.a!)} francs. L’épicerie coûte ${f(v.b!)} francs et la boulangerie ${f(v.c!)} francs. Il reste ${f(v.d!)} francs. Combien a coûté la boucherie ?`,
        calc: `${f(v.a!)} − ${f(v.b!)} − ${f(v.c!)} − ${f(v.d!)}`,
        response: `La boucherie a coûté ${f(r)} francs.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-deux-jours',
    label: 'Récolte de deux jours',
    kinds: ['addition', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Premier jour' },
      { key: 'b', label: 'De plus le deuxième jour' },
    ],
    roll: (rng) => ({ a: int(rng, 40, 400), b: int(rng, 10, 120) }),
    build: (v): Built => {
      const r = v.a! + v.a! + v.b!
      return {
        prompt: `Lundi, on ramasse ${f(v.a!)} salades. Mardi, on en ramasse ${f(v.b!)} de plus. Combien de salades sur ces deux jours ?`,
        calc: `${f(v.a!)} + ${f(v.a!)} + ${f(v.b!)}`,
        response: `On en ramasse ${f(r)}.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-archet',
    label: 'Prix qui reste sur la facture',
    kinds: ['soustraction', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Total (fr.)' },
      { key: 'b', label: 'Instrument (fr.)' },
      { key: 'c', label: 'Étui (fr.)' },
    ],
    roll: (rng) => {
      const b = cents(rng, 200, 2000)
      const c = cents(rng, 40, 300)
      const bow = cents(rng, 30, 200)
      return { a: r2(b + c + bow), b, c }
    },
    build: (v): Built => {
      const r = r2(v.a! - v.b! - v.c!)
      return {
        prompt: `L’ensemble coûte ${f(v.a!)} francs. L’instrument coûte ${f(v.b!)} francs et l’étui ${f(v.c!)} francs. Combien coûte l’archet ?`,
        calc: `${f(v.a!)} − ${f(v.b!)} − ${f(v.c!)}`,
        response: `L’archet coûte ${f(r)} francs.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-couleur-manquante',
    label: 'Couleur qui n’est pas encore comptée',
    kinds: ['soustraction', 'addition', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Total' },
      { key: 'b', label: 'Rouges' },
      { key: 'c', label: 'Bleues' },
      { key: 'd', label: 'Blanches' },
    ],
    roll: (rng) => {
      const b = int(rng, 40, 300)
      const c = int(rng, 40, 300)
      const d = int(rng, 40, 300)
      const yellow = int(rng, 40, 300)
      return { a: b + c + d + yellow, b, c, d }
    },
    build: (v): Built => {
      const r = v.a! - v.b! - v.c! - v.d!
      return {
        prompt: `La mosaïque utilise ${f(v.a!)} tesselles : ${f(v.b!)} rouges, ${f(v.c!)} bleues, ${f(v.d!)} blanches et des jaunes. Combien de tesselles jaunes ?`,
        calc: `${f(v.a!)} − ${f(v.b!)} − ${f(v.c!)} − ${f(v.d!)}`,
        response: `Il y a ${f(r)} tesselles jaunes.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-poids',
    label: 'Même poids, autre quantité',
    kinds: ['multiplication', 'division', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Briques connues' },
      { key: 'b', label: 'Poids de ces briques (kg)' },
      { key: 'c', label: 'Briques demandées' },
    ],
    roll: (rng) => {
      const w = int(rng, 2, 6)
      const a = int(rng, 5, 20)
      const c = int(rng, 5, 40)
      return { a, b: a * w, c }
    },
    build: (v): Built => {
      const r = (v.b! / v.a!) * v.c!
      return {
        prompt: `${f(v.a!)} briques pèsent ${f(v.b!)} kilos. Elles ont toutes le même poids. Combien pèsent ${f(v.c!)} briques ?`,
        calc: `(${f(v.b!)} ÷ ${f(v.a!)}) × ${f(v.c!)}`,
        response: `Elles pèsent ${f(r)} kilos.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-fois-peuple',
    label: 'Plusieurs fois plus d’habitants',
    kinds: ['multiplication', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Habitants du petit village' },
      { key: 'b', label: 'Nombre de fois' },
    ],
    roll: (rng) => ({ a: int(rng, 40, 300), b: int(rng, 2, 20) }),
    build: (v): Built => {
      const r = v.a! * v.b!
      return {
        prompt: `Un village a ${f(v.a!)} habitants. L’autre est ${f(v.b!)} fois plus peuplé. Combien d’habitants a l’autre village ?`,
        calc: `${f(v.a!)} × ${f(v.b!)}`,
        response: `Il a ${f(r)} habitants.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-deux-couleurs',
    label: 'Deux fois plus d’une couleur',
    kinds: ['division', 'multiplication', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Billes en tout' },
    ],
    roll: (rng) => ({ a: int(rng, 3, 30) * 3 }),
    build: (v): Built => {
      const green = v.a! / 3
      const yellow = green * 2
      return {
        prompt: `Il y a ${f(v.a!)} billes, jaunes ou vertes. Il y a deux fois plus de billes jaunes que de vertes. Combien y a-t-il de billes jaunes ?`,
        calc: `${f(v.a!)} ÷ 3 × 2`,
        response: `Il y a ${f(yellow)} billes jaunes et ${f(green)} billes vertes.`,
        result: yellow,
      }
    },
  }),
  story({
    id: 'wp2-de-plus-que-lui',
    label: 'L’autre en a de moins',
    kinds: ['soustraction', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Livres connus' },
      { key: 'b', label: 'De plus' },
    ],
    roll: (rng) => subPair(rng, 20, 400),
    build: (v): Built => {
      const r = v.a! - v.b!
      return {
        prompt: `Reagan a ${f(v.a!)} livres. Elle en a ${f(v.b!)} de plus que son frère. Combien de livres a son frère ?`,
        calc: `${f(v.a!)} − ${f(v.b!)}`,
        response: `Son frère a ${f(r)} livres.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-rectangle-sol',
    label: 'Carrés d’un rectangle',
    kinds: ['multiplication', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Carrés en longueur' },
      { key: 'b', label: 'Carrés en largeur' },
    ],
    roll: (rng) => ({ a: int(rng, 10, 80), b: int(rng, 4, 20) }),
    build: (v): Built => {
      const r = v.a! * v.b!
      return {
        prompt: `Le couloir est couvert de ${f(v.a!)} carrés de long et ${f(v.b!)} de large. Combien de carrés en tout ?`,
        calc: `${f(v.a!)} × ${f(v.b!)}`,
        response: `Il y a ${f(r)} carrés.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-cartons-pleins',
    label: 'Cartons remplis entièrement',
    kinds: ['division', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Bouteilles' },
      { key: 'b', label: 'Bouteilles par carton' },
    ],
    roll: (rng) => {
      const b = int(rng, 6, 24)
      return { a: b * int(rng, 4, 20), b }
    },
    build: (v): Built => {
      const r = v.a! / v.b!
      return {
        prompt: `${f(v.a!)} bouteilles sont rangées dans des cartons de ${f(v.b!)}. Combien de cartons sont remplis ?`,
        calc: `${f(v.a!)} ÷ ${f(v.b!)}`,
        response: `${f(r)} cartons sont remplis.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-feuilles-gommettes',
    label: 'Gommettes de toutes les feuilles',
    kinds: ['multiplication', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Feuilles' },
      { key: 'b', label: 'Gommettes par feuille' },
    ],
    roll: (rng) => ({ a: int(rng, 10, 200), b: int(rng, 8, 40) }),
    build: (v): Built => {
      const r = v.a! * v.b!
      return {
        prompt: `${f(v.a!)} feuilles contiennent chacune ${f(v.b!)} gommettes. Combien de gommettes en tout ?`,
        calc: `${f(v.a!)} × ${f(v.b!)}`,
        response: `Il y a ${f(r)} gommettes.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-traversees',
    label: 'Traversées de deux séances',
    kinds: ['addition', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Première séance' },
      { key: 'b', label: 'De plus la deuxième fois' },
    ],
    roll: (rng) => ({ a: int(rng, 4, 30), b: int(rng, 1, 15) }),
    build: (v): Built => {
      const r = v.a! + v.a! + v.b!
      return {
        prompt: `La première fois, ${f(v.a!)} traversées. La deuxième fois, ${f(v.b!)} de plus. Combien de traversées en tout ?`,
        calc: `${f(v.a!)} + ${f(v.a!)} + ${f(v.b!)}`,
        response: `Il y a eu ${f(r)} traversées.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-livraison',
    label: 'Feuilles livrées',
    kinds: ['multiplication', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Paquets' },
      { key: 'b', label: 'Feuilles par paquet' },
    ],
    roll: (rng) => ({ a: int(rng, 10, 150), b: int(rng, 20, 100) }),
    build: (v): Built => {
      const r = v.a! * v.b!
      return {
        prompt: `La livraison compte ${f(v.a!)} paquets de ${f(v.b!)} feuilles. Combien de feuilles ont été reçues ?`,
        calc: `${f(v.a!)} × ${f(v.b!)}`,
        response: `${f(r)} feuilles ont été reçues.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-manque-encore',
    label: 'Ce qu’il manque encore',
    kinds: ['addition', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Déjà économisé (fr.)' },
      { key: 'b', label: 'Somme ajoutée (fr.)' },
    ],
    roll: (rng) => ({ a: cents(rng, 20, 200), b: cents(rng, 5, 40) }),
    build: (v): Built => {
      const r = r2(v.a! + v.b!)
      return {
        prompt: `${f(v.a!)} francs sont déjà économisés. On ajoute les ${f(v.b!)} francs qui manquent. Combien coûte l’objet ?`,
        calc: `${f(v.a!)} + ${f(v.b!)}`,
        response: `Il coûte ${f(r)} francs.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-deux-fois-moins-cher',
    label: 'Deux fois moins cher',
    kinds: ['division', 'melange'],
    levels: avance,
    defs: [{ key: 'a', label: 'Prix le plus élevé (fr.)' }],
    roll: (rng) => ({ a: int(rng, 2, 40) * 2 }),
    build: (v): Built => {
      const r = v.a! / 2
      return {
        prompt: `Un aspirateur coûte ${f(v.a!)} francs. L’autre est deux fois moins cher. Combien coûte l’autre ?`,
        calc: `${f(v.a!)} ÷ 2`,
        response: `L’autre coûte ${f(r)} francs.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-trajet',
    label: 'Trajet plus court',
    kinds: ['soustraction', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Plus long trajet (km)' },
      { key: 'b', label: 'Écart (km)' },
    ],
    roll: (rng) => subPair(rng, 20, 400),
    build: (v): Built => {
      const r = v.a! - v.b!
      return {
        prompt: `Un trajet mesure ${f(v.a!)} km. L’autre mesure ${f(v.b!)} km de moins. Combien de kilomètres mesure le plus court ?`,
        calc: `${f(v.a!)} − ${f(v.b!)}`,
        response: `Il mesure ${f(r)} km.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-immeuble',
    label: 'Appartements de l’immeuble',
    kinds: ['multiplication', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Étages' },
      { key: 'b', label: 'Appartements par étage' },
    ],
    roll: (rng) => ({ a: int(rng, 4, 20), b: int(rng, 2, 8) }),
    build: (v): Built => {
      const r = v.a! * v.b!
      return {
        prompt: `L’immeuble a ${f(v.a!)} étages de ${f(v.b!)} appartements. Combien d’appartements ?`,
        calc: `${f(v.a!)} × ${f(v.b!)}`,
        response: `Il y a ${f(r)} appartements.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-autre-cote',
    label: 'Autre côté du rectangle',
    kinds: ['division', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Cartes en tout' },
      { key: 'b', label: 'Cartes sur un côté' },
    ],
    roll: (rng) => {
      const b = int(rng, 6, 20)
      return { a: b * int(rng, 4, 16), b }
    },
    build: (v): Built => {
      const r = v.a! / v.b!
      return {
        prompt: `${f(v.a!)} cartes forment un rectangle. Un côté a ${f(v.b!)} cartes. Combien de cartes a l’autre côté ?`,
        calc: `${f(v.a!)} ÷ ${f(v.b!)}`,
        response: `L’autre côté a ${f(r)} cartes.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-fois-moins-objets',
    label: 'Plusieurs fois moins d’objets',
    kinds: ['division', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Objets de départ' },
      { key: 'b', label: 'Nombre de fois' },
    ],
    roll: (rng) => {
      const b = int(rng, 2, 12)
      return { a: b * int(rng, 4, 30), b }
    },
    build: (v): Built => {
      const r = v.a! / v.b!
      return {
        prompt: `Nicolas utilise ${f(v.a!)} cubes. Nathalie en utilise ${f(v.b!)} fois moins. Combien de cubes utilise Nathalie ?`,
        calc: `${f(v.a!)} ÷ ${f(v.b!)}`,
        response: `Nathalie utilise ${f(r)} cubes.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-age',
    label: 'Âge plusieurs fois plus petit',
    kinds: ['division', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Âge du parent' },
      { key: 'b', label: 'Nombre de fois' },
    ],
    roll: (rng) => {
      const b = int(rng, 2, 4)
      return { a: b * int(rng, 6, 16), b }
    },
    build: (v): Built => {
      const r = v.a! / v.b!
      return {
        prompt: `Une personne a ${f(v.a!)} ans. Elle est ${f(v.b!)} fois plus âgée que son enfant. Quel est l’âge de l’enfant ?`,
        calc: `${f(v.a!)} ÷ ${f(v.b!)}`,
        response: `L’enfant a ${f(r)} ans.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-quartier',
    label: 'Appartements du quartier',
    kinds: ['multiplication', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Immeubles' },
      { key: 'b', label: 'Appartements par immeuble' },
    ],
    roll: (rng) => ({ a: int(rng, 6, 24), b: int(rng, 12, 40) }),
    build: (v): Built => {
      const r = v.a! * v.b!
      return {
        prompt: `Le quartier compte ${f(v.a!)} immeubles de ${f(v.b!)} appartements. Combien d’appartements ?`,
        calc: `${f(v.a!)} × ${f(v.b!)}`,
        response: `Il y a ${f(r)} appartements.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-avant',
    label: 'Somme avant les achats',
    kinds: ['multiplication', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Somme qui reste (fr.)' },
      { key: 'b', label: 'Nombre de fois' },
    ],
    roll: (rng) => ({ a: int(rng, 10, 80), b: int(rng, 2, 8) }),
    build: (v): Built => {
      const r = v.a! * v.b!
      return {
        prompt: `Après les achats, il reste ${f(v.a!)} francs. C’est ${f(v.b!)} fois moins qu’avant. Combien y avait-il avant ?`,
        calc: `${f(v.a!)} × ${f(v.b!)}`,
        response: `Il y avait ${f(r)} francs.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-economise-de-moins',
    label: 'L’autre a économisé davantage',
    kinds: ['addition', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Somme connue (fr.)' },
      { key: 'b', label: 'Écart (fr.)' },
    ],
    roll: (rng) => ({ a: int(rng, 10, 80), b: int(rng, 4, 30) }),
    build: (v): Built => {
      const r = v.a! + v.b!
      return {
        prompt: `Monique a économisé ${f(v.a!)} francs. C’est ${f(v.b!)} francs de moins que Didier. Combien Didier a-t-il économisé ?`,
        calc: `${f(v.a!)} + ${f(v.b!)}`,
        response: `Didier a économisé ${f(r)} francs.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-tulipes',
    label: 'Fleurs plantées en plus',
    kinds: ['addition', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Jonquilles' },
      { key: 'b', label: 'Tulipes plantées par l’enfant' },
      { key: 'c', label: 'Tulipes de plus' },
    ],
    roll: (rng) => ({ a: int(rng, 10, 40), b: int(rng, 8, 30), c: int(rng, 2, 12) }),
    build: (v): Built => {
      const r = v.b! + v.c!
      return {
        prompt: `On plante ${f(v.a!)} jonquilles. L’enfant plante ${f(v.b!)} tulipes et l’adulte en plante ${f(v.c!)} de plus. Combien de tulipes l’adulte a-t-il plantées ?`,
        calc: `${f(v.b!)} + ${f(v.c!)}`,
        response: `L’adulte a planté ${f(r)} tulipes.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-carrelage',
    label: 'Carreaux du sol',
    kinds: ['multiplication', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Carreaux en longueur' },
      { key: 'b', label: 'Carreaux en largeur' },
    ],
    roll: (rng) => ({ a: int(rng, 6, 20), b: int(rng, 4, 12) }),
    build: (v): Built => {
      const r = v.a! * v.b!
      return {
        prompt: `Le sol fait ${f(v.a!)} carreaux de long et ${f(v.b!)} de large. Combien de carreaux une fois terminé ?`,
        calc: `${f(v.a!)} × ${f(v.b!)}`,
        response: `Il y aura ${f(r)} carreaux.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-bouquets-roses',
    label: 'Roses des bouquets',
    kinds: ['multiplication', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Bouquets' },
      { key: 'b', label: 'Roses par bouquet' },
    ],
    roll: (rng) => ({ a: int(rng, 6, 30), b: int(rng, 3, 12) }),
    build: (v): Built => {
      const r = v.a! * v.b!
      return {
        prompt: `${f(v.a!)} bouquets contiennent chacun ${f(v.b!)} roses. Combien de roses ont été utilisées ?`,
        calc: `${f(v.a!)} × ${f(v.b!)}`,
        response: `${f(r)} roses ont été utilisées.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-tours',
    label: 'Cubes des tours',
    kinds: ['multiplication', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Tours' },
      { key: 'b', label: 'Cubes par tour' },
    ],
    roll: (rng) => ({ a: int(rng, 3, 12), b: int(rng, 6, 20) }),
    build: (v): Built => {
      const r = v.a! * v.b!
      return {
        prompt: `${f(v.a!)} tours sont formées de ${f(v.b!)} cubes chacune. Combien de cubes ont été utilisés ?`,
        calc: `${f(v.a!)} × ${f(v.b!)}`,
        response: `${f(r)} cubes ont été utilisés.`,
        result: r,
      }
    },
  }),
  story({
    id: 'wp2-tours-de-plus',
    label: 'Cubes utilisés en plus',
    kinds: ['multiplication', 'soustraction', 'melange'],
    levels: avance,
    defs: [
      { key: 'a', label: 'Tours de la première personne' },
      { key: 'b', label: 'Cubes par tour (première)' },
      { key: 'c', label: 'Tours de la deuxième' },
      { key: 'd', label: 'Cubes par tour (deuxième)' },
    ],
    roll: (rng) => {
      const a = int(rng, 3, 8)
      const b = int(rng, 6, 12)
      const c = int(rng, a + 1, 14)
      const d = int(rng, b, 20)
      return { a, b, c, d }
    },
    build: (v): Built => {
      const first = v.a! * v.b!
      const second = v.c! * v.d!
      const r = second - first
      return {
        prompt: `La première personne construit ${f(v.a!)} tours de ${f(v.b!)} cubes. La deuxième construit ${f(v.c!)} tours de ${f(v.d!)} cubes. Combien de cubes la deuxième a-t-elle utilisés de plus ?`,
        calc: `${f(v.c!)} × ${f(v.d!)} − ${f(v.a!)} × ${f(v.b!)}`,
        response: r < 0 ? `Elle en a utilisé ${f(-r)} de moins.` : `Elle en a utilisé ${f(r)} de plus.`,
        result: r,
      }
    },
  }),
]
