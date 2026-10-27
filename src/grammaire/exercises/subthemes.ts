import { GRAM_KIND_IDS, type GramExerciseKindId } from './kinds'

/** Sous-thèmes SCAI (3ᵉ menu) — conjugaison + notions théorie. */

export type GramSubtheme = {
  id: string
  label: string
  topic: string
  /** Types théorie liés (affichés dans le menu Type avec les exercices). */
  theoryTypeIds: string[]
}

export const GRAM_SUBTHEMES: GramSubtheme[] = [
  // —— Se présenter (famille regroupée ; identité → fiche théorie a1 « Qui suis-je ? ») ——
  {
    id: 'famille',
    label: 'Famille',
    topic: 'gram-se-presenter',
    theoryTypeIds: ['gram-famille-theorie'],
  },

  // —— Présent ——
  {
    id: 'etre',
    label: 'Être',
    topic: 'gram-present',
    theoryTypeIds: ['gram-m2-theorie'],
  },
  {
    id: 'avoir',
    label: 'Avoir',
    topic: 'gram-present',
    theoryTypeIds: ['gram-m3-theorie'],
  },
  {
    id: 'er',
    label: 'Verbes en -er',
    topic: 'gram-present',
    theoryTypeIds: ['gram-m4-theorie'],
  },
  {
    id: 'er-particuliers',
    label: 'Verbes en -er particuliers',
    topic: 'gram-present',
    theoryTypeIds: ['gram-m5-theorie'],
  },
  {
    id: 'aller-destination',
    label: 'Aller : destination',
    topic: 'gram-present',
    theoryTypeIds: ['gram-a4-theorie', 'gram-a5-theorie'],
  },
  {
    id: 'ir',
    label: 'Verbes en -ir',
    topic: 'gram-present',
    theoryTypeIds: ['gram-m6-theorie'],
  },
  {
    id: 're-oir',
    label: 'Verbes en -re et -oir',
    topic: 'gram-present',
    theoryTypeIds: ['gram-m7-theorie'],
  },
  {
    id: 'modaux',
    label: 'Pouvoir, devoir, vouloir',
    topic: 'gram-present',
    theoryTypeIds: ['gram-modaux-theorie'],
  },
  {
    id: 'pronominaux',
    label: 'Verbes pronominaux',
    topic: 'gram-present',
    theoryTypeIds: ['gram-pronominaux-theorie'],
  },
  {
    id: 'a8',
    label: 'La négation ne … pas',
    topic: 'gram-present',
    theoryTypeIds: ['gram-a8-theorie'],
  },
  {
    id: 'a9',
    label: 'Autres négations',
    topic: 'gram-present',
    theoryTypeIds: ['gram-a9-theorie'],
  },

  // —— Passé ——
  {
    id: 'pc-idee',
    label: 'Passé composé (idée)',
    topic: 'gram-passe',
    theoryTypeIds: ['gram-h1-theorie'],
  },
  {
    id: 'pc-avoir',
    label: 'Passé composé avec avoir',
    topic: 'gram-passe',
    theoryTypeIds: ['gram-h2-theorie'],
  },
  {
    id: 'pc-etre',
    label: 'Passé composé avec être',
    topic: 'gram-passe',
    theoryTypeIds: ['gram-h3-theorie'],
  },
  {
    id: 'imparfait',
    label: 'Imparfait',
    topic: 'gram-passe',
    theoryTypeIds: ['gram-h4-theorie'],
  },
  {
    id: 'pqp',
    label: 'Plus-que-parfait',
    topic: 'gram-passe',
    theoryTypeIds: ['gram-h5-theorie'],
  },
  {
    id: 'double-aux',
    label: 'Verbes à double auxiliaire',
    topic: 'gram-passe',
    theoryTypeIds: ['gram-h6-theorie'],
  },
  {
    id: 'pc-pronominaux',
    label: 'Pronominaux au passé composé',
    topic: 'gram-passe',
    theoryTypeIds: ['gram-h7-theorie'],
  },
  {
    id: 'imparfait-ou-pc',
    label: 'Imparfait ou passé composé',
    topic: 'gram-passe',
    theoryTypeIds: ['gram-h8-theorie'],
  },
  {
    id: 'accord-pp',
    label: 'Accord du participe passé',
    topic: 'gram-passe',
    theoryTypeIds: ['gram-h9-theorie'],
  },

  // —— Avenir ——
  {
    id: 'futur-proche',
    label: 'Futur proche',
    topic: 'gram-avenir',
    theoryTypeIds: ['gram-j4-theorie'],
  },
  {
    id: 'futur-simple',
    label: 'Futur simple',
    topic: 'gram-avenir',
    theoryTypeIds: ['gram-j5-theorie'],
  },
  {
    id: 'futur-proche-ou-simple',
    label: 'Futur proche ou futur simple',
    topic: 'gram-avenir',
    theoryTypeIds: ['gram-o1-theorie'],
  },
  {
    id: 'futur-anterieur',
    label: 'Futur antérieur',
    topic: 'gram-avenir',
    theoryTypeIds: ['gram-o2-theorie'],
  },
  {
    id: 'hypothese-futur',
    label: 'Hypothèse sur le futur',
    topic: 'gram-avenir',
    theoryTypeIds: ['gram-o3-theorie'],
  },

  // —— Décrire (série CSC : description physique) ——
  {
    id: 'description-physique',
    label: 'Description physique',
    topic: 'gram-decrire',
    theoryTypeIds: ['gram-f15-theorie'],
  },
]

/** Sous-thèmes dérivés des fiches théorie (autres thèmes SCAI, PDF). */
export function theorySubthemeId(theoryTypeId: string): string {
  return theoryTypeId.replace(/^gram-/, '').replace(/-theorie$/, '')
}

export function subthemesForTopic(topic: string): GramSubtheme[] {
  return GRAM_SUBTHEMES.filter((s) => s.topic === topic)
}

export function subthemeById(id: string): GramSubtheme | undefined {
  return GRAM_SUBTHEMES.find((s) => s.id === id)
}

export function resolveGramSubtheme(
  topic: string,
  exerciseType: string,
): GramSubtheme | undefined {
  const list = subthemesForTopic(topic)
  if (!list.length) return undefined
  if (exerciseType.startsWith('gram-ex-')) {
    // gram-ex-{sub…}-{kind} — kinds are single tokens from GRAM_EXERCISE_KINDS
    for (const kind of GRAM_KIND_IDS) {
      const suffix = `-${kind}`
      if (exerciseType.endsWith(suffix)) {
        const subId = exerciseType.slice('gram-ex-'.length, -suffix.length)
        return list.find((s) => s.id === subId) ?? subthemeById(subId)
      }
    }
  }
  if (exerciseType.endsWith('-theorie')) {
    const hit = list.find((s) => s.theoryTypeIds.includes(exerciseType))
    if (hit) return hit
  }
  return list[0]
}

export function gramExerciseTypeId(subId: string, kindId: string): string {
  return `gram-ex-${subId}-${kindId}`
}

export function parseGramExerciseType(
  typeId: string,
): { subId: string; kindId: GramExerciseKindId } | null {
  if (!typeId.startsWith('gram-ex-')) return null
  for (const kind of GRAM_KIND_IDS) {
    const suffix = `-${kind}`
    if (typeId.endsWith(suffix)) {
      return {
        subId: typeId.slice('gram-ex-'.length, -suffix.length),
        kindId: kind,
      }
    }
  }
  return null
}
