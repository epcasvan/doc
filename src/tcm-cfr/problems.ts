/**
 * Problèmes TCM CFR ex. 15–16 (types tcm-cfr-ex14 / tcm-cfr-ex15) :
 * variables éditables en mode libre + reconstruction des deux parties.
 */
import { fmt } from '@/math/column-arith'
import { int, pick, type Rng } from '@/math/rng'
import type { MathItem } from '@/math/types'

export type ProblemPart = {
  prompt: string
  calcAnswer: string
  responseAnswer: string
  answer: string
}

export type ProblemVarDef = {
  key: string
  label: string
  /** Partie où le champ apparaît dans l’éditeur libre. */
  editOn: 0 | 1 | 'both'
}

type ProblemSpec = {
  id: string
  /** Libellé court pour la liste du mode libre. */
  label: string
  varDefs: ProblemVarDef[]
  roll: (rng: Rng) => Record<string, number>
  build: (vars: Record<string, number>) => [ProblemPart, ProblemPart]
}

export type ProblemOption = { id: string; label: string }

function money(n: number): string {
  return fmt(Math.round(n * 100) / 100)
}

function oneDecimal(rng: Rng, loTenths: number, hiTenths: number): number {
  let t = int(rng, loTenths, hiTenths)
  while (t % 10 === 0) t = int(rng, loTenths, hiTenths)
  return Math.round(t) / 10
}

function v(key: string, label: string, editOn: 0 | 1 | 'both'): ProblemVarDef {
  return { key, label, editOn }
}

function pickBillet(total: number): number {
  return total <= 20 ? 20 : total <= 50 ? 50 : 100
}

/** Magasin — affichage « 15 — Problème (magasin) » (type ex14). */
const EX14_SPECS: readonly ProblemSpec[] = [
  {
    id: 'nadia',
    label: 'Nadia — magasin (riz, poulet, carottes)',
    varDefs: [
      v('budget', 'Budget (F)', 0),
      v('a', 'Riz (F)', 0),
      v('b', 'Poulet (F)', 0),
      v('c', 'Carottes (F)', 0),
      v('d1', 'Soda (F)', 1),
      v('d2', 'Eau gazeuse (F)', 1),
    ],
    roll: (rng) => {
      const a = oneDecimal(rng, 20, 60)
      const b = oneDecimal(rng, 30, 90)
      const c = oneDecimal(rng, 15, 55)
      const total = Math.round((a + b + c) * 100) / 100
      const d1 = oneDecimal(rng, 15, 35)
      const d2 = oneDecimal(rng, 20, 45)
      const drink = Math.min(d1, d2)
      const spent = Math.round((total + drink) * 100) / 100
      const budget = Math.ceil(spent) + pick(rng, [5, 10, 15, 20])
      return { budget, a, b, c, d1, d2 }
    },
    build: (vars) => {
      const a = vars.a ?? 0
      const b = vars.b ?? 0
      const c = vars.c ?? 0
      const d1 = vars.d1 ?? 0
      const d2 = vars.d2 ?? 0
      const budget = vars.budget ?? 0
      const total = Math.round((a + b + c) * 100) / 100
      const drink = Math.min(d1, d2)
      const reste = Math.round((budget - total - drink) * 100) / 100
      return [
        {
          prompt: `Nadia va au magasin avec ${budget} francs dans son porte-monnaie. Dans son panier, elle prend du riz à ${money(a)} francs et du poulet à ${money(b)} francs. Elle ajoute des carottes à ${money(c)} francs dans son panier. Elle se rend à la caisse.\n\nQuelle somme paye-t-elle ?`,
          calcAnswer: `${money(a)} + ${money(b)} + ${money(c)} = ${money(total)}`,
          responseAnswer: `Nadia paye ${money(total)} francs.`,
          answer: money(total),
        },
        {
          prompt: `Nadia sort du magasin mais elle a oublié d’acheter à boire. Elle retourne dans le magasin. Elle hésite entre 2 boissons, un soda à ${money(d1)} francs ou de l’eau gazeuse à ${money(d2)} francs. Elle prend la moins chère.\n\nCombien d’argent reste-t-il après ses courses ?`,
          calcAnswer: `${budget} − ${money(total)} − ${money(drink)} = ${money(reste)}`,
          responseAnswer: `Il reste ${money(reste)} francs.`,
          answer: money(reste),
        },
      ]
    },
  },
  {
    id: 'omar',
    label: 'Omar — boulangerie et bus',
    varDefs: [
      v('budget', 'Budget (F)', 0),
      v('pain', 'Pain (F)', 0),
      v('fromage', 'Fromage (F)', 0),
      v('fruit', 'Fruits (F)', 0),
      v('bus', 'Bus (F)', 1),
    ],
    roll: (rng) => {
      const pain = oneDecimal(rng, 15, 35)
      const fromage = oneDecimal(rng, 30, 80)
      const fruit = oneDecimal(rng, 20, 50)
      const total = Math.round((pain + fromage + fruit) * 100) / 100
      const bus = oneDecimal(rng, 25, 45)
      const spent = Math.round((total + bus) * 100) / 100
      const budget = Math.ceil(spent) + pick(rng, [5, 10, 15])
      return { budget, pain, fromage, fruit, bus }
    },
    build: (vars) => {
      const pain = vars.pain ?? 0
      const fromage = vars.fromage ?? 0
      const fruit = vars.fruit ?? 0
      const bus = vars.bus ?? 0
      const budget = vars.budget ?? 0
      const total = Math.round((pain + fromage + fruit) * 100) / 100
      const reste = Math.round((budget - total - bus) * 100) / 100
      return [
        {
          prompt: `Omar part faire ses courses avec ${budget} francs dans son portefeuille. Il entre dans la boulangerie du quartier. Il choisit un pain à ${money(pain)} francs. Puis il ajoute du fromage à ${money(fromage)} francs et un sachet de fruits à ${money(fruit)} francs. Il paie à la caisse.\n\nCombien paye-t-il pour ses courses ?`,
          calcAnswer: `${money(pain)} + ${money(fromage)} + ${money(fruit)} = ${money(total)}`,
          responseAnswer: `Omar paye ${money(total)} francs.`,
          answer: money(total),
        },
        {
          prompt: `Omar quitte le magasin et se dirige vers l’arrêt de bus. Il doit rentrer chez lui. Le ticket de bus coûte ${money(bus)} francs. Il paie son ticket avec l’argent qui lui reste.\n\nCombien d’argent lui reste-t-il après le trajet ?`,
          calcAnswer: `${budget} − ${money(total)} − ${money(bus)} = ${money(reste)}`,
          responseAnswer: `Il lui reste ${money(reste)} francs.`,
          answer: money(reste),
        },
      ]
    },
  },
  {
    id: 'lea',
    label: 'Léa — vêtements (réduction)',
    varDefs: [
      v('budget', 'Budget (F)', 0),
      v('pull', 'Pull (F)', 0),
      v('chaussettes', 'Chaussettes (F)', 0),
      v('reduction', 'Réduction (F)', 1),
    ],
    roll: (rng) => {
      const pull = oneDecimal(rng, 250, 450)
      const chaussettes = oneDecimal(rng, 50, 120)
      const total = Math.round((pull + chaussettes) * 100) / 100
      const reduction = oneDecimal(rng, 30, 80)
      const paye = Math.round((total - reduction) * 100) / 100
      const budget = Math.ceil(paye) + pick(rng, [10, 20, 30])
      return { budget, pull, chaussettes, reduction }
    },
    build: (vars) => {
      const pull = vars.pull ?? 0
      const chaussettes = vars.chaussettes ?? 0
      const reduction = vars.reduction ?? 0
      const budget = vars.budget ?? 0
      const total = Math.round((pull + chaussettes) * 100) / 100
      const paye = Math.round((total - reduction) * 100) / 100
      const reste = Math.round((budget - paye) * 100) / 100
      return [
        {
          prompt: `Léa entre dans un magasin de vêtements. Elle a ${budget} francs sur elle. Elle regarde les rayons pendant un moment. Elle choisit un pull à ${money(pull)} francs. Elle prend aussi des chaussettes à ${money(chaussettes)} francs.\n\nQuel est le prix total avant réduction ?`,
          calcAnswer: `${money(pull)} + ${money(chaussettes)} = ${money(total)}`,
          responseAnswer: `Le total est ${money(total)} francs.`,
          answer: money(total),
        },
        {
          prompt: `À la caisse, la vendeuse annonce une réduction de ${money(reduction)} francs. Léa est contente. Elle paie avec son argent. Elle range le reste dans son porte-monnaie.\n\nCombien lui reste-t-il après l’achat ?`,
          calcAnswer: `${money(total)} − ${money(reduction)} = ${money(paye)} ; ${budget} − ${money(paye)} = ${money(reste)}`,
          responseAnswer: `Il lui reste ${money(reste)} francs.`,
          answer: money(reste),
        },
      ]
    },
  },
  {
    id: 'yanis',
    label: 'Yanis — cahiers',
    varDefs: [
      v('n', 'Nombre de cahiers', 0),
      v('prix', 'Prix d’un cahier (F)', 0),
      v('billet', 'Billet (F)', 1),
    ],
    roll: (rng) => {
      const n = int(rng, 3, 6)
      const prix = oneDecimal(rng, 12, 35)
      const total = Math.round(n * prix * 100) / 100
      return { n, prix, billet: pickBillet(total) }
    },
    build: (vars) => {
      const n = vars.n ?? 0
      const prix = vars.prix ?? 0
      const billet = vars.billet ?? pickBillet(n * prix)
      const total = Math.round(n * prix * 100) / 100
      const rendu = Math.round((billet - total) * 100) / 100
      return [
        {
          prompt: `Yanis a besoin de matériel pour l’école. Il se rend à la papeterie près de chez lui. Il regarde les cahiers en rayon. Il décide d’acheter ${n} cahiers. Chaque cahier coûte ${money(prix)} francs.\n\nCombien doit-il payer pour les cahiers ?`,
          calcAnswer: `${n} × ${money(prix)} = ${money(total)}`,
          responseAnswer: `Yanis doit payer ${money(total)} francs.`,
          answer: money(total),
        },
        {
          prompt: `Yanis tend un billet de ${billet} francs à la caissière. La caissière prend le billet. Elle prépare la monnaie. Elle lui rend le reste.\n\nCombien la caissière lui rend-elle ?`,
          calcAnswer: `${billet} − ${money(total)} = ${money(rendu)}`,
          responseAnswer: `On lui rend ${money(rendu)} francs.`,
          answer: money(rendu),
        },
      ]
    },
  },
  {
    id: 'sara',
    label: "Sara — épicerie (manque d'argent)",
    varDefs: [
      v('nLait', 'Briques de lait', 0),
      v('lait', 'Prix du lait (F)', 0),
      v('pain', 'Pain (F)', 0),
      v('budget', 'Argent sur elle (F)', 1),
    ],
    roll: (rng) => {
      const lait = oneDecimal(rng, 12, 25)
      const nLait = int(rng, 2, 4)
      const pain = oneDecimal(rng, 15, 30)
      const total = Math.round((lait * nLait + pain) * 100) / 100
      const budget = Math.max(1, Math.floor(total) - int(rng, 1, 3))
      return { nLait, lait, pain, budget }
    },
    build: (vars) => {
      const lait = vars.lait ?? 0
      const nLait = vars.nLait ?? 0
      const pain = vars.pain ?? 0
      const budget = vars.budget ?? 0
      const total = Math.round((lait * nLait + pain) * 100) / 100
      const manque = Math.round((total - budget) * 100) / 100
      return [
        {
          prompt: `Sara va à l’épicerie du village. Elle prend un panier. Elle met ${nLait} briques de lait à ${money(lait)} francs chacune dans le panier. Elle ajoute un pain à ${money(pain)} francs. Elle se dirige vers la caisse.\n\nQuel est le montant des courses ?`,
          calcAnswer: `${nLait} × ${money(lait)} + ${money(pain)} = ${money(total)}`,
          responseAnswer: `Les courses coûtent ${money(total)} francs.`,
          answer: money(total),
        },
        {
          prompt: `Sara ouvre son porte-monnaie. Elle n’a que ${budget} francs sur elle. Elle compte encore une fois. Il lui manque de l’argent pour payer.\n\nCombien lui manque-t-il ?`,
          calcAnswer: `${money(total)} − ${budget} = ${money(manque)}`,
          responseAnswer: `Il lui manque ${money(manque)} francs.`,
          answer: money(manque),
        },
      ]
    },
  },
  {
    id: 'cafe',
    label: "Café — partage de l'addition",
    varDefs: [
      v('a', 'Boissons (F)', 0),
      v('b', 'Gâteaux (F)', 0),
      v('c', 'Thés (F)', 0),
    ],
    roll: (rng) => ({
      a: oneDecimal(rng, 40, 90),
      b: oneDecimal(rng, 30, 70),
      c: oneDecimal(rng, 20, 60),
    }),
    build: (vars) => {
      const a = vars.a ?? 0
      const b = vars.b ?? 0
      const c = vars.c ?? 0
      const total = Math.round((a + b + c) * 100) / 100
      const share = Math.round((total / 2) * 100) / 100
      return [
        {
          prompt: `Deux amies s’installent à la terrasse d’un café. Elles commandent des boissons pour ${money(a)} francs. Elles ajoutent des gâteaux pour ${money(b)} francs. Elles prennent aussi des thés pour ${money(c)} francs. L’addition arrive sur la table.\n\nQuel est le total de l’addition ?`,
          calcAnswer: `${money(a)} + ${money(b)} + ${money(c)} = ${money(total)}`,
          responseAnswer: `L’addition est de ${money(total)} francs.`,
          answer: money(total),
        },
        {
          prompt: `Les deux amies veulent partager la note. Elles divisent le montant en deux parts égales. Chacune paie la même somme. Elles laissent l’argent sur la table.\n\nCombien chacune paie-t-elle ?`,
          calcAnswer: `${money(total)} ÷ 2 = ${money(share)}`,
          responseAnswer: `Chacune paie ${money(share)} francs.`,
          answer: money(share),
        },
      ]
    },
  },
  {
    id: 'hugo',
    label: 'Hugo — pommes au marché',
    varDefs: [
      v('kg', 'Pommes (kg)', 0),
      v('prixKg', 'Prix au kilo (F)', 0),
      v('billet', 'Billet (F)', 1),
    ],
    roll: (rng) => {
      const kg = oneDecimal(rng, 12, 25)
      const prixKg = oneDecimal(rng, 20, 40)
      const total = Math.round(kg * prixKg * 100) / 100
      return { kg, prixKg, billet: pickBillet(total) }
    },
    build: (vars) => {
      const kg = vars.kg ?? 0
      const prixKg = vars.prixKg ?? 0
      const billet = vars.billet ?? pickBillet(kg * prixKg)
      const total = Math.round(kg * prixKg * 100) / 100
      const rendu = Math.round((billet - total) * 100) / 100
      return [
        {
          prompt: `Hugo va au marché le samedi matin. Il regarde les étals de fruits. Il choisit des pommes. Il en prend ${money(kg)} kg. Le kilo de pommes coûte ${money(prixKg)} francs.\n\nCombien paie-t-il pour les pommes ?`,
          calcAnswer: `${money(kg)} × ${money(prixKg)} = ${money(total)}`,
          responseAnswer: `Hugo paie ${money(total)} francs.`,
          answer: money(total),
        },
        {
          prompt: `Hugo sort un billet de ${billet} francs. Le marchand prend le billet. Il calcule la monnaie. Il rend le reste à Hugo.\n\nCombien le marchand lui rend-il ?`,
          calcAnswer: `${billet} − ${money(total)} = ${money(rendu)}`,
          responseAnswer: `On lui rend ${money(rendu)} francs.`,
          answer: money(rendu),
        },
      ]
    },
  },
  {
    id: 'ines',
    label: 'Inès — librairie',
    varDefs: [
      v('budget', 'Budget (F)', 0),
      v('livre', 'Livre (F)', 0),
      v('nStylo', 'Nombre de stylos', 0),
      v('stylo', 'Prix d’un stylo (F)', 0),
    ],
    roll: (rng) => {
      const livre = oneDecimal(rng, 80, 160)
      const stylo = oneDecimal(rng, 15, 40)
      const nStylo = int(rng, 2, 5)
      const total = Math.round((livre + stylo * nStylo) * 100) / 100
      const budget = Math.ceil(total) + pick(rng, [5, 10, 15, 20])
      return { budget, livre, nStylo, stylo }
    },
    build: (vars) => {
      const livre = vars.livre ?? 0
      const stylo = vars.stylo ?? 0
      const nStylo = vars.nStylo ?? 0
      const budget = vars.budget ?? 0
      const total = Math.round((livre + stylo * nStylo) * 100) / 100
      const reste = Math.round((budget - total) * 100) / 100
      return [
        {
          prompt: `Inès entre dans une librairie. Elle a ${budget} francs dans son sac. Elle cherche un livre pour l’école. Elle trouve un livre à ${money(livre)} francs. Elle prend aussi ${nStylo} stylos à ${money(stylo)} francs chacun.\n\nCombien dépense-t-elle en tout ?`,
          calcAnswer: `${money(livre)} + ${nStylo} × ${money(stylo)} = ${money(total)}`,
          responseAnswer: `Inès dépense ${money(total)} francs.`,
          answer: money(total),
        },
        {
          prompt: `Inès paie à la caisse. Elle range ses achats dans son sac. Elle vérifie l’argent qui lui reste. Elle est contente de ses achats.\n\nCombien lui reste-t-il ?`,
          calcAnswer: `${budget} − ${money(total)} = ${money(reste)}`,
          responseAnswer: `Il lui reste ${money(reste)} francs.`,
          answer: money(reste),
        },
      ]
    },
  },
  {
    id: 'pizza',
    label: 'Pizzas — commande et partage',
    varDefs: [
      v('n', 'Nombre de pizzas', 0),
      v('pizza', 'Prix d’une pizza (F)', 0),
      v('boisson', 'Boisson (F)', 0),
    ],
    roll: (rng) => ({
      pizza: oneDecimal(rng, 120, 220),
      n: int(rng, 2, 4),
      boisson: oneDecimal(rng, 20, 50),
    }),
    build: (vars) => {
      const pizza = vars.pizza ?? 0
      const n = vars.n ?? 1
      const boisson = vars.boisson ?? 0
      const total = Math.round((pizza * n + boisson) * 100) / 100
      const share = Math.round((total / n) * 100) / 100
      return [
        {
          prompt: `La famille a faim ce soir. Les enfants veulent des pizzas. Les parents commandent ${n} pizzas à ${money(pizza)} francs chacune. Ils ajoutent une grande boisson à ${money(boisson)} francs. Le livreur apporte la commande.\n\nQuel est le prix total ?`,
          calcAnswer: `${n} × ${money(pizza)} + ${money(boisson)} = ${money(total)}`,
          responseAnswer: `Le total est ${money(total)} francs.`,
          answer: money(total),
        },
        {
          prompt: `Les parents décident de partager le montant. Ils divisent le total en ${n} parts égales. Chaque personne paie sa part. Tout le monde est d’accord.\n\nCombien chacune paie-t-elle ?`,
          calcAnswer: `${money(total)} ÷ ${n} = ${money(share)}`,
          responseAnswer: `Chacune paie ${money(share)} francs.`,
          answer: money(share),
        },
      ]
    },
  },
  {
    id: 'sofia',
    label: 'Sofia — trois articles',
    varDefs: [
      v('a', 'Article 1 (F)', 0),
      v('b', 'Article 2 (F)', 0),
      v('c', 'Article 3 (F)', 0),
    ],
    roll: (rng) => ({
      a: oneDecimal(rng, 35, 80),
      b: oneDecimal(rng, 40, 90),
      c: oneDecimal(rng, 25, 70),
    }),
    build: (vars) => {
      const a = vars.a ?? 0
      const b = vars.b ?? 0
      const c = vars.c ?? 0
      const total = Math.round((a + b + c) * 100) / 100
      const plusCher = Math.max(a, b, c)
      const moinsCher = Math.min(a, b, c)
      const ecart = Math.round((plusCher - moinsCher) * 100) / 100
      return [
        {
          prompt: `Sofia fait des courses pour préparer un repas. Elle met trois articles dans son panier. Le premier coûte ${money(a)} francs. Le deuxième coûte ${money(b)} francs. Le troisième coûte ${money(c)} francs. Elle arrive à la caisse.\n\nQuel est le prix total des trois articles ?`,
          calcAnswer: `${money(a)} + ${money(b)} + ${money(c)} = ${money(total)}`,
          responseAnswer: `Le total est ${money(total)} francs.`,
          answer: money(total),
        },
        {
          prompt: `Sofia regarde les prix sur son ticket. Elle compare l’article le plus cher et le moins cher. Elle veut connaître la différence. Elle fait le calcul.\n\nQuelle est la différence entre l’article le plus cher et le moins cher ?`,
          calcAnswer: `${money(plusCher)} − ${money(moinsCher)} = ${money(ecart)}`,
          responseAnswer: `La différence est ${money(ecart)} francs.`,
          answer: money(ecart),
        },
      ]
    },
  },
]

/** Travail — affichage « 16 — Problème (travail) » (type ex15). */
const EX15_SPECS: readonly ProblemSpec[] = [
  {
    id: 'karim',
    label: 'Karim — mécanicien (partage)',
    varDefs: [v('rate', 'Salaire (F/h)', 0), v('hours', 'Heures', 0)],
    roll: (rng) => ({ rate: int(rng, 6, 12), hours: pick(rng, [4, 8]) }),
    build: (vars) => {
      const rate = vars.rate ?? 0
      const hours = vars.hours ?? 0
      const gain = rate * hours
      const half = gain / 2
      const share = half / 2
      return [
        {
          prompt: `Karim est mécanicien. Il travaille dans un garage et gagne ${rate} francs par heure. Aujourd’hui, il travaille pendant ${hours} heures.\n\nAujourd’hui, combien d’argent a-t-il gagné ?`,
          calcAnswer: `${rate} × ${hours} = ${gain}`,
          responseAnswer: `Karim a gagné ${gain} francs.`,
          answer: String(gain),
        },
        {
          prompt: `Le jour suivant, Karim retrouve Ahmed, Yeva et Danil dans un parc. Il propose de donner la moitié de l’argent gagné à ses 3 amis. Danil refuse, il ne veut pas d’argent. La moitié de l’argent de Karim est donc partagée avec le reste de ses amis. Ils reçoivent le même montant.\n\nCombien d’argent reçoit Yeva ?`,
          calcAnswer: `${gain} ÷ 2 = ${half} ; ${half} ÷ 2 = ${share}`,
          responseAnswer: `Yeva reçoit ${share} francs.`,
          answer: String(share),
        },
      ]
    },
  },
  {
    id: 'maya',
    label: 'Maya — magasin de vêtements',
    varDefs: [v('rate', 'Salaire (F/h)', 0), v('hours', 'Heures', 0)],
    roll: (rng) => ({ rate: int(rng, 8, 15), hours: pick(rng, [4, 6, 8]) }),
    build: (vars) => {
      const rate = vars.rate ?? 0
      const hours = vars.hours ?? 0
      const gain = rate * hours
      const keep = gain / 2
      const save = gain - keep
      return [
        {
          prompt: `Maya travaille dans un magasin de vêtements. Elle aide les clients toute la journée. Elle est payée ${rate} francs par heure. Aujourd’hui, elle travaille pendant ${hours} heures.\n\nCombien d’argent a-t-elle gagné aujourd’hui ?`,
          calcAnswer: `${hours} × ${rate} = ${gain}`,
          responseAnswer: `Maya a gagné ${gain} francs.`,
          answer: String(gain),
        },
        {
          prompt: `Le soir, Maya rentre chez elle. Elle compte son argent. Elle décide de garder la moitié pour ses dépenses. Elle place le reste à la banque. Elle fait le calcul soigneusement.\n\nCombien place-t-elle à la banque ?`,
          calcAnswer: `${gain} − ${keep} = ${save}`,
          responseAnswer: `Elle place ${save} francs à la banque.`,
          answer: String(save),
        },
      ]
    },
  },
  {
    id: 'tom',
    label: 'Tom — jours de travail et repas',
    varDefs: [
      v('days', 'Jours', 0),
      v('perDay', 'Salaire par jour (F)', 0),
      v('lunch', 'Repas (F)', 1),
    ],
    roll: (rng) => ({
      days: int(rng, 3, 5),
      perDay: int(rng, 40, 80),
      lunch: int(rng, 8, 15),
    }),
    build: (vars) => {
      const days = vars.days ?? 0
      const perDay = vars.perDay ?? 0
      const lunch = vars.lunch ?? 0
      const gain = days * perDay
      const reste = gain - lunch * days
      return [
        {
          prompt: `Tom aide dans un magasin pendant les vacances. Il range les rayons et accueille les clients. Il travaille pendant ${days} jours. Chaque jour, il gagne ${perDay} francs.\n\nCombien d’argent gagne-t-il en tout ?`,
          calcAnswer: `${days} × ${perDay} = ${gain}`,
          responseAnswer: `Tom gagne ${gain} francs.`,
          answer: String(gain),
        },
        {
          prompt: `Chaque jour de travail, Tom achète son repas. Le repas coûte ${lunch} francs. Il paie son repas avec son salaire. À la fin des ${days} jours, il regarde ce qui lui reste.\n\nCombien lui reste-t-il à la fin ?`,
          calcAnswer: `${gain} − ${days} × ${lunch} = ${reste}`,
          responseAnswer: `Il lui reste ${reste} francs.`,
          answer: String(reste),
        },
      ]
    },
  },
  {
    id: 'amina',
    label: 'Amina — cours de français',
    varDefs: [
      v('hours', 'Heures', 0),
      v('rate', 'Salaire (F/h)', 0),
      v('gift', 'Cadeau (F)', 1),
    ],
    roll: (rng) => ({
      rate: int(rng, 10, 18),
      hours: pick(rng, [4, 6, 8, 10]),
      gift: int(rng, 10, 25),
    }),
    build: (vars) => {
      const rate = vars.rate ?? 0
      const hours = vars.hours ?? 0
      const gift = vars.gift ?? 0
      const gain = rate * hours
      const reste = gain - gift
      return [
        {
          prompt: `Amina donne des cours de français. Elle prépare ses leçons avec soin. Elle donne des cours pendant ${hours} heures. Elle gagne ${rate} francs par heure.\n\nCombien d’argent a-t-elle gagné ?`,
          calcAnswer: `${hours} × ${rate} = ${gain}`,
          responseAnswer: `Amina a gagné ${gain} francs.`,
          answer: String(gain),
        },
        {
          prompt: `Amina rentre chez elle contente. Elle pense à sa sœur. Elle décide de lui offrir ${gift} francs. Elle garde le reste pour elle.\n\nCombien lui reste-t-il après le cadeau ?`,
          calcAnswer: `${gain} − ${gift} = ${reste}`,
          responseAnswer: `Il lui reste ${reste} francs.`,
          answer: String(reste),
        },
      ]
    },
  },
  {
    id: 'jardinier',
    label: 'Jardinier — caisses de pommes',
    varDefs: [
      v('boxes', 'Caisses', 0),
      v('perBox', 'Pommes par caisse', 0),
      v('keep', 'Pommes gardées', 1),
    ],
    roll: (rng) => ({
      boxes: int(rng, 4, 9),
      perBox: int(rng, 5, 12),
      keep: int(rng, 2, 4),
    }),
    build: (vars) => {
      const boxes = vars.boxes ?? 0
      const perBox = vars.perBox ?? 0
      const keep = vars.keep ?? 0
      const total = boxes * perBox
      const sold = total - keep
      return [
        {
          prompt: `Un jardinier travaille dans son verger. Il récolte des pommes toute la matinée. Il remplit ${boxes} caisses. Chaque caisse contient ${perBox} pommes.\n\nCombien de pommes a-t-il récoltées en tout ?`,
          calcAnswer: `${boxes} × ${perBox} = ${total}`,
          responseAnswer: `Il a récolté ${total} pommes.`,
          answer: String(total),
        },
        {
          prompt: `Le jardinier garde ${keep} pommes pour sa famille. Il met le reste dans sa camionnette. Il part vendre les pommes au marché. Les clients viennent les acheter.\n\nCombien de pommes vend-il ?`,
          calcAnswer: `${total} − ${keep} = ${sold}`,
          responseAnswer: `Il vend ${sold} pommes.`,
          answer: String(sold),
        },
      ]
    },
  },
  {
    id: 'luis',
    label: 'Luis — menuiserie',
    varDefs: [v('hours', 'Heures', 0), v('rate', 'Salaire (F/h)', 0)],
    roll: (rng) => ({ rate: int(rng, 7, 14), hours: pick(rng, [3, 6, 9]) }),
    build: (vars) => {
      const rate = vars.rate ?? 0
      const hours = vars.hours ?? 0
      const gain = rate * hours
      const third = gain / 3
      const reste = gain - third
      return [
        {
          prompt: `Luis travaille dans un atelier de menuiserie. Il fabrique des meubles. Il travaille pendant ${hours} heures aujourd’hui. Il est payé ${rate} francs par heure.\n\nCombien d’argent gagne-t-il aujourd’hui ?`,
          calcAnswer: `${hours} × ${rate} = ${gain}`,
          responseAnswer: `Luis gagne ${gain} francs.`,
          answer: String(gain),
        },
        {
          prompt: `En rentrant, Luis parle avec ses parents. Il décide de leur donner le tiers de son argent. Il garde le reste pour lui. Il range l’argent dans deux enveloppes.\n\nCombien garde-t-il pour lui ?`,
          calcAnswer: `${gain} ÷ 3 = ${third} ; ${gain} − ${third} = ${reste}`,
          responseAnswer: `Il garde ${reste} francs.`,
          answer: String(reste),
        },
      ]
    },
  },
  {
    id: 'nora',
    label: 'Nora — semaines au supermarché',
    varDefs: [
      v('weeks', 'Semaines', 0),
      v('perWeek', 'Salaire par semaine (F)', 0),
      v('buy', 'Livre (F)', 1),
    ],
    roll: (rng) => ({
      weeks: int(rng, 2, 4),
      perWeek: int(rng, 50, 90),
      buy: int(rng, 30, 70),
    }),
    build: (vars) => {
      const weeks = vars.weeks ?? 0
      const perWeek = vars.perWeek ?? 0
      const buy = vars.buy ?? 0
      const gain = weeks * perWeek
      const reste = gain - buy
      return [
        {
          prompt: `Nora trouve un travail temporaire dans un supermarché. Elle range les rayons chaque semaine. Elle travaille pendant ${weeks} semaines. Elle gagne ${perWeek} francs par semaine.\n\nCombien gagne-t-elle au total ?`,
          calcAnswer: `${weeks} × ${perWeek} = ${gain}`,
          responseAnswer: `Nora gagne ${gain} francs.`,
          answer: String(gain),
        },
        {
          prompt: `Nora veut s’acheter un livre. Elle entre dans une librairie. Elle trouve un livre à ${buy} francs. Elle paie avec l’argent de son travail.\n\nCombien lui reste-t-il après l’achat ?`,
          calcAnswer: `${gain} − ${buy} = ${reste}`,
          responseAnswer: `Il lui reste ${reste} francs.`,
          answer: String(reste),
        },
      ]
    },
  },
  {
    id: 'paul',
    label: 'Paul — livreur (partage)',
    varDefs: [
      v('rate', 'Salaire (F/h)', 0),
      v('hours', 'Heures', 0),
      v('parts', 'Nombre de parts', 1),
    ],
    roll: (rng) => ({
      rate: int(rng, 9, 16),
      hours: pick(rng, [4, 8]),
      parts: 4,
    }),
    build: (vars) => {
      const rate = vars.rate ?? 0
      const hours = vars.hours ?? 0
      const parts = Math.max(1, Math.round(vars.parts ?? 4))
      const gain = rate * hours
      const share = gain / parts
      return [
        {
          prompt: `Paul travaille comme livreur. Il livre des colis dans la ville. Il gagne ${rate} francs par heure. Aujourd’hui, il travaille pendant ${hours} heures.\n\nCombien d’argent a-t-il gagné ?`,
          calcAnswer: `${rate} × ${hours} = ${gain}`,
          responseAnswer: `Paul a gagné ${gain} francs.`,
          answer: String(gain),
        },
        {
          prompt: `Paul rentre chez lui. Il retrouve sa famille. Il propose de partager son argent également entre ${parts} personnes. Chacun reçoit la même somme.\n\nCombien chacune reçoit-elle ?`,
          calcAnswer: `${gain} ÷ ${parts} = ${share}`,
          responseAnswer: `Chacune reçoit ${share} francs.`,
          answer: String(share),
        },
      ]
    },
  },
  {
    id: 'rita',
    label: 'Rita — restaurant (heures et salaire)',
    varDefs: [
      v('morning', 'Heures (matin)', 0),
      v('afternoon', 'Heures (après-midi)', 0),
      v('rate', 'Salaire (F/h)', 1),
    ],
    roll: (rng) => ({
      morning: int(rng, 3, 5),
      afternoon: int(rng, 2, 4),
      rate: int(rng, 8, 14),
    }),
    build: (vars) => {
      const morning = vars.morning ?? 0
      const afternoon = vars.afternoon ?? 0
      const rate = vars.rate ?? 0
      const hours = morning + afternoon
      const gain = hours * rate
      return [
        {
          prompt: `Rita travaille dans un restaurant. Le matin, elle prépare la salle pendant ${morning} heures. L’après-midi, elle sert les clients pendant ${afternoon} heures. Elle est fatiguée mais contente.\n\nCombien d’heures travaille-t-elle en tout ?`,
          calcAnswer: `${morning} + ${afternoon} = ${hours}`,
          responseAnswer: `Rita travaille ${hours} heures.`,
          answer: String(hours),
        },
        {
          prompt: `Rita est payée ${rate} francs par heure. Le patron calcule son salaire. Il lui donne son argent le soir. Rita range l’argent dans son sac.\n\nCombien gagne-t-elle ce jour-là ?`,
          calcAnswer: `${hours} × ${rate} = ${gain}`,
          responseAnswer: `Elle gagne ${gain} francs.`,
          answer: String(gain),
        },
      ]
    },
  },
  {
    id: 'sam',
    label: 'Sam — restaurant et pourboire',
    varDefs: [
      v('hours', 'Heures', 0),
      v('rate', 'Salaire (F/h)', 0),
      v('tip', 'Pourboire (F)', 1),
    ],
    roll: (rng) => ({
      rate: int(rng, 6, 11),
      hours: pick(rng, [6, 8, 10]),
      tip: int(rng, 5, 15),
    }),
    build: (vars) => {
      const rate = vars.rate ?? 0
      const hours = vars.hours ?? 0
      const tip = vars.tip ?? 0
      const gain = rate * hours
      const total = gain + tip
      return [
        {
          prompt: `Sam aide au restaurant le week-end. Il sert les tables et range la cuisine. Il travaille pendant ${hours} heures. Il gagne ${rate} francs par heure sans le pourboire.\n\nCombien gagne-t-il sans le pourboire ?`,
          calcAnswer: `${hours} × ${rate} = ${gain}`,
          responseAnswer: `Sam gagne ${gain} francs.`,
          answer: String(gain),
        },
        {
          prompt: `Un client est très content du service. Il laisse ${tip} francs de pourboire à Sam. Sam ajoute ce pourboire à son salaire. Il compte tout son argent.\n\nCombien a-t-il en tout ?`,
          calcAnswer: `${gain} + ${tip} = ${total}`,
          responseAnswer: `Il a ${total} francs en tout.`,
          answer: String(total),
        },
      ]
    },
  },
]

const ALL_SPECS: readonly ProblemSpec[] = [...EX14_SPECS, ...EX15_SPECS]

function findSpec(id: string): ProblemSpec | undefined {
  return ALL_SPECS.find((s) => s.id === id)
}

function itemsFromSpec(spec: ProblemSpec, vars: Record<string, number>): MathItem[] {
  const parts = spec.build(vars)
  return parts.map((p, part) => ({
    layout: 'text' as const,
    prompt: p.prompt,
    calcAnswer: p.calcAnswer,
    responseAnswer: p.responseAnswer,
    answer: p.answer,
    problemTemplateId: spec.id,
    problemVars: { ...vars },
    problemVarDefs: spec.varDefs,
    problemPart: part as 0 | 1,
  }))
}

function pickSpecItems(specs: readonly ProblemSpec[], rng: Rng): MathItem[] {
  const spec = pick(rng, specs)
  return itemsFromSpec(spec, spec.roll(rng))
}

/** Ex. 15 affichage — problèmes magasin (type tcm-cfr-ex14). */
export function genShopProblems(rng: Rng): MathItem[] {
  return pickSpecItems(EX14_SPECS, rng)
}

/** Ex. 16 affichage — problèmes travail (type tcm-cfr-ex15). */
export function genWorkProblems(rng: Rng): MathItem[] {
  return pickSpecItems(EX15_SPECS, rng)
}

/** Reconstruit la paire d’items à partir des variables (mode libre). */
export function rebuildProblemItems(
  templateId: string,
  vars: Record<string, number>,
): MathItem[] | undefined {
  const spec = findSpec(templateId)
  if (!spec) return undefined
  return itemsFromSpec(spec, vars)
}

/** Tire de nouvelles valeurs pour un modèle choisi (mode libre). */
export function rollProblemItems(templateId: string, rng: Rng): MathItem[] | undefined {
  const spec = findSpec(templateId)
  if (!spec) return undefined
  return itemsFromSpec(spec, spec.roll(rng))
}

function optionsFrom(specs: readonly ProblemSpec[]): ProblemOption[] {
  return specs.map((s) => ({ id: s.id, label: s.label }))
}

/** Liste des problèmes magasin (ex. 15 affichage / type ex14). */
export function shopProblemOptions(): ProblemOption[] {
  return optionsFrom(EX14_SPECS)
}

/** Liste des problèmes travail (ex. 16 affichage / type ex15). */
export function workProblemOptions(): ProblemOption[] {
  return optionsFrom(EX15_SPECS)
}

/** Options selon le type d’exercice CFR. */
export function problemOptionsForExercise(exerciseType: string): ProblemOption[] | undefined {
  if (exerciseType.includes('ex14')) return shopProblemOptions()
  if (exerciseType.includes('ex15') && !exerciseType.includes('ex16')) return workProblemOptions()
  return undefined
}

export function isCfrProblemExercise(exerciseType: string): boolean {
  return (
    exerciseType.includes('ex14') ||
    (exerciseType.includes('ex15') && !exerciseType.includes('ex150') && !exerciseType.includes('ex16'))
  )
}
