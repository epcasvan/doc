import type { ExerciseType, Topic } from '@/math/types'
import { GRAMMAIRE_THEORY_DOCS } from './theory'
import { ALL_GRAM_SUBTHEMES, buildGrammairePracticeTypes } from './exercises/catalog-exercises'

export const GRAMMAIRE_DOMAIN = 'grammaire' as const

export const GRAMMAIRE_TOPICS: Topic[] = [
  { id: 'gram-se-presenter', label: 'Se présenter', domain: 'grammaire' },
  { id: 'gram-present', label: 'Conjuguer au présent', domain: 'grammaire' },
  { id: 'gram-entrer-contact', label: 'Entrer en contact', domain: 'grammaire' },
  { id: 'gram-questions', label: 'Poser une question', domain: 'grammaire' },
  { id: 'gram-activite', label: 'Parler d’une activité', domain: 'grammaire' },
  { id: 'gram-espace', label: 'Se situer dans l’espace', domain: 'grammaire' },
  { id: 'gram-temps', label: 'Se situer dans le temps', domain: 'grammaire' },
  { id: 'gram-demander', label: 'Demander et proposer', domain: 'grammaire' },
  { id: 'gram-decrire', label: 'Décrire', domain: 'grammaire' },
  { id: 'gram-conseiller', label: 'Conseiller quelqu’un', domain: 'grammaire' },
  { id: 'gram-aliments', label: 'Parler des aliments', domain: 'grammaire' },
  { id: 'gram-passe', label: 'Parler du passé', domain: 'grammaire' },
  { id: 'gram-pronoms', label: 'Les pronoms', domain: 'grammaire' },
  { id: 'gram-action', label: 'Parler d’une action', domain: 'grammaire' },
  { id: 'gram-avenir', label: 'Parler de l’avenir', domain: 'grammaire' },
  { id: 'gram-faits', label: 'Parler des faits divers', domain: 'grammaire' },
  { id: 'gram-argumenter', label: 'S’expliquer et argumenter', domain: 'grammaire' },
  { id: 'gram-exprimer', label: 'Exprimer quelque chose', domain: 'grammaire' },
  { id: 'gram-aide', label: 'Aide-mémoire', domain: 'grammaire' },
]

/** Types « Théorie » (fiches FALC) — une entrée par fiche de src/grammaire/theory. */
const GRAMMAIRE_THEORY_TYPES: ExerciseType[] = GRAMMAIRE_THEORY_DOCS.map((doc) => ({
  id: doc.typeId,
  topic: doc.topic,
  label: doc.title,
  description: `Théorie FALC — ${doc.objectif}`,
  instruction: 'Lisez la théorie.',
  visual: 'texte',
  preferredColumns: 1,
}))

/** Théorie + exercices (banques par sous-thème, programme ClairFLE). */
export const GRAMMAIRE_EXERCISE_TYPES: ExerciseType[] = [
  ...GRAMMAIRE_THEORY_TYPES,
  ...buildGrammairePracticeTypes(),
]

/** Vérifie la cohérence catalogue ↔ banques théorie. */
export function assertGrammaireCatalog(): void {
  const theoryTypeIds = new Set(
    GRAMMAIRE_EXERCISE_TYPES.filter((t) => t.id.endsWith('-theorie')).map((t) => t.id),
  )
  const docIds = new Set(GRAMMAIRE_THEORY_DOCS.map((d) => d.typeId))
  for (const doc of GRAMMAIRE_THEORY_DOCS) {
    if (!theoryTypeIds.has(doc.typeId)) {
      throw new Error(`Théorie sans type catalogue: ${doc.typeId}`)
    }
  }
  for (const typeId of theoryTypeIds) {
    if (!docIds.has(typeId)) {
      throw new Error(`Type théorie catalogue sans contenu: ${typeId}`)
    }
  }
  for (const sub of ALL_GRAM_SUBTHEMES) {
    if (sub.theoryTypeIds.length === 0) {
      throw new Error(`Sous-thème sans fiche théorie: ${sub.id}`)
    }
    for (const typeId of sub.theoryTypeIds) {
      if (!docIds.has(typeId)) {
        throw new Error(`Sous-thème ${sub.id} pointe vers une théorie absente: ${typeId}`)
      }
    }
  }
}
