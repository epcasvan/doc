/**
 * Page 1 « Informations » partagée par TPM, TCM CFR et TCM CSC.
 * Même structure (niveaux, organisation, consignes) ; textes adaptés au domaine.
 */
import type { MathItem } from '@/math/types'

export type TpmInfoVariant = 'tpm' | 'tcm-cfr' | 'tcm-csc'

type InfoSpec = {
  levels: Array<[string, string]>
  organisation: string[]
  consignes: string[]
}

function scoreLabel(maxScore: number): string {
  return Number.isInteger(maxScore) ? String(maxScore) : String(maxScore).replace('.', ',')
}

function specFor(variant: TpmInfoVariant, maxScore: number): InfoSpec {
  const points = scoreLabel(maxScore)
  const consignes = [
    'Lisez chaque consigne attentivement avant de répondre.',
    'Répondez directement sur la fiche, dans les espaces prévus.',
    'Vous pouvez utiliser un brouillon ; reportez ensuite vos réponses sur la fiche.',
    'Si vous ne savez pas répondre, passez à la question suivante et revenez-y plus tard.',
    'Les exercices progressent du plus simple au plus avancé : continuez aussi loin que possible.',
    'Vérifiez vos calculs quand vous avez terminé.',
  ]
  if (variant === 'tcm-cfr') {
    return {
      levels: [
        ['Nombres', 'Dictée orale, rangement, comparaison, décomposition'],
        ['Opérations', 'Nommer les opérations, calculs posés (+ − × ÷)'],
        ['Fractions', 'Fractions en lettres, colorier, lire, écriture décimale'],
        ['Problèmes', 'Situations concrètes (magasin, atelier)'],
        ['Géométrie', 'Figures, symétrie, mesures, périmètre et aire'],
        ['Repérage', 'Plan gradué (cadran I) et plan de métro'],
      ],
      organisation: [
        '28 exercices de mathématiques (variante CFR)',
        'Écoutez les audios lorsque c’est demandé (nombres, multiplications)',
        `Score maximum : ${points} points`,
      ],
      consignes: [
        ...consignes.slice(0, 3),
        'Pour les exercices avec audio, écoutez puis écrivez votre réponse.',
        ...consignes.slice(3),
      ],
    }
  }
  if (variant === 'tcm-csc') {
    return {
      levels: [['CSC', 'Additions et soustractions, bases du calcul']],
      organisation: [
        'Test de connaissance de mathématiques — variante CSC',
        'Les exercices seront ajoutés prochainement',
        maxScore > 0 ? `Score maximum : ${points} points` : 'Barème communiqué avec les exercices',
      ],
      consignes,
    }
  }
  return {
    levels: [
      ['CSC', 'Additions et soustractions'],
      ['CFR', 'Multiplications, divisions, périmètre et aire du rectangle'],
      ['CAF', 'Nombres décimaux, fractions, périmètre et aire'],
      ['CAP', 'Puissances et racines, relatifs, fractions et équations, périmètre et aire'],
    ],
    organisation: [
      '35 exercices couvrant tous les niveaux de CSC jusqu’à CAP',
      '90 minutes pour compléter le test',
      `Score maximum : ${points} points`,
    ],
    consignes,
  }
}

/** Items théorie de la page Informations (pas de questions ni de colonnes). */
export function generateTpmInformations(variant: TpmInfoVariant, maxScore: number): MathItem[] {
  const { levels, organisation, consignes } = specFor(variant, maxScore)
  return [
    {
      layout: 'theory',
      prompt: 'Informations',
      answer: '',
      noPoints: true,
      theoryBlock: { kind: 'heading', text: '' },
    },
    {
      layout: 'theory',
      prompt: 'niveaux',
      answer: '',
      noPoints: true,
      theoryBlock: {
        kind: 'table',
        headers: ['Niveau', 'Contenu évalué'],
        rows: levels.map(([niveau, contenu]) => [niveau, contenu]),
      },
    },
    {
      layout: 'theory',
      prompt: 'couverture',
      answer: '',
      noPoints: true,
      theoryBlock: {
        kind: 'list',
        title: 'Organisation du test',
        items: organisation,
      },
    },
    {
      layout: 'theory',
      prompt: 'consignes',
      answer: '',
      noPoints: true,
      theoryBlock: { kind: 'heading', text: 'Consignes', sub: true },
    },
    {
      layout: 'theory',
      prompt: 'consignes-liste',
      answer: '',
      noPoints: true,
      theoryBlock: {
        kind: 'list',
        items: consignes,
      },
    },
  ]
}

export function isTpmFamilyConsignesType(exerciseType: string | undefined): boolean {
  return (
    exerciseType === 'tpm-consignes' ||
    exerciseType === 'tcm-cfr-consignes' ||
    exerciseType === 'tcm-csc-consignes'
  )
}
