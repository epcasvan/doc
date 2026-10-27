import type { ExerciseType, Topic } from '@/math/types'

export const TCM_CFR_DOMAIN = 'tcm-cfr' as const

export const TCM_CFR_TOPICS: Topic[] = [
  { id: 'tcm-cfr-info', label: 'Informations', domain: 'tcm-cfr' },
  { id: 'tcm-cfr-test', label: 'Test CFR', domain: 'tcm-cfr' },
]

function t(
  id: string,
  topic: string,
  label: string,
  description: string,
  instruction: string,
  preferredColumns: 1 | 2 | 3 = 1,
): ExerciseType {
  return {
    id,
    topic,
    label,
    description,
    instruction,
    visual: 'texte',
    preferredColumns,
  }
}

export const TCM_CFR_EXERCISE_TYPES: ExerciseType[] = [
  t(
    'tcm-cfr-consignes',
    'tcm-cfr-info',
    'Consignes',
    'Page de consignes du test TCM CFR.',
    'Lisez les consignes avant de commencer le test.',
    1,
  ),
  t('tcm-cfr-ex01', 'tcm-cfr-test', '1 — Nombres entendus', 'Écrire le nombre entendu (audio).', 'Écrivez le nombre que vous entendez.', 1),
  t('tcm-cfr-ex02', 'tcm-cfr-test', '2 — Multiplications orales', 'Écrire le résultat d’une multiplication entendue.', 'Écrivez le résultat de la multiplication.', 1),
  t('tcm-cfr-ex03', 'tcm-cfr-test', '3 — Ranger des nombres', 'Ranger 7 nombres (entiers/décimaux).', 'Rangez les nombres dans l’ordre indiqué.', 1),
  t('tcm-cfr-ex04', 'tcm-cfr-test', '4 — Comparer des décimaux', 'Comparer des nombres décimaux.', 'Comparez les nombres. Écrivez <, = ou >.', 2),
  t('tcm-cfr-ex05', 'tcm-cfr-test', '5 — Décomposer', 'Décomposer un nombre (3 et 4 chiffres).', 'Décomposez chaque nombre.', 1),
  t('tcm-cfr-ex06', 'tcm-cfr-test', '6 — Nommer les opérations', 'Écrire le nom des opérations.', 'Écrivez le nom des opérations.', 2),
  t('tcm-cfr-ex07', 'tcm-cfr-test', '7 — Colonnes + et −', 'Additions et soustractions posées.', 'Posez et calculez.', 2),
  t('tcm-cfr-ex08', 'tcm-cfr-test', '8 — Colonnes + et − (suite)', 'Additions et soustractions à poser (nombres hors grille).', 'Posez les nombres dans la grille, puis calculez.', 2),
  t('tcm-cfr-ex09', 'tcm-cfr-test', '9 — × et ÷ posées', 'Multiplication et division en colonnes.', 'Posez et calculez.', 2),
  t('tcm-cfr-ex10', 'tcm-cfr-test', '10 — × et ÷ (hors grille)', 'Multiplication et division à poser (nombres hors grille).', 'Posez et calculez.', 2),
  t('tcm-cfr-ex11', 'tcm-cfr-test', '11 — Fractions en lettres', 'Écrire la fraction correspondant au terme.', 'Pour chaque terme, écrivez la fraction correspondante.', 2),
  t('tcm-cfr-ex12', 'tcm-cfr-test', '12 — Colorier les fractions', 'Colorier la fraction indiquée (formes simples).', 'Coloriez la fraction indiquée.', 2),
  t('tcm-cfr-ex13', 'tcm-cfr-test', '13 — Lire les fractions', 'Lire la fraction d’une forme coloriée.', 'Écrivez la fraction représentée.', 2),
  // Numéros d’affichage (ids techniques inchangés) : symétrie = 14, problèmes = 15–16, formes = 17–18.
  t('tcm-cfr-ex18', 'tcm-cfr-test', '14 — Symétrie axiale', 'Reproduire une figure par symétrie axiale.', 'Reproduisez la figure par symétrie axiale par rapport à l’axe.', 1),
  t('tcm-cfr-ex14', 'tcm-cfr-test', '15 — Problème (magasin)', 'Problème à étapes (courses).', 'Résolvez le problème.', 1),
  t('tcm-cfr-ex15', 'tcm-cfr-test', '16 — Problème (travail)', 'Problème à étapes (salaire / partage).', 'Résolvez le problème.', 1),
  t('tcm-cfr-ex16', 'tcm-cfr-test', '17 — Nommer et propriétés', 'Nommer des figures et leurs propriétés.', 'Nommez ces figures géométriques et notez leurs propriétés.', 1),
  t('tcm-cfr-ex17', 'tcm-cfr-test', '18 — Nommer des formes', 'Nommer d’autres formes géométriques.', 'Nommez ces formes géométriques.', 1),
  t('tcm-cfr-ex19', 'tcm-cfr-test', '19 — Mesurer des segments', 'Mesurer des segments puis plus long / plus court.', 'Mesurez les segments avec la règle et répondez aux questions.', 1),
  t('tcm-cfr-ex20', 'tcm-cfr-test', '20 — Conversions (m…mm)', 'Convertir des longueurs (m, dm, cm, mm).', 'Convertissez.', 2),
  t('tcm-cfr-ex21', 'tcm-cfr-test', '21 — Fractions → décimaux', 'Écrire des fractions en nombres décimaux.', 'Écrivez en nombre décimal les fractions suivantes.', 2),
  t('tcm-cfr-ex22', 'tcm-cfr-test', '22 — Carré (décimaux)', 'Périmètre et aire d’un carré (décimaux).', 'Calculez le périmètre et l’aire.', 1),
  t('tcm-cfr-ex23', 'tcm-cfr-test', '23 — Rectangle (décimaux)', 'Périmètre et aire d’un rectangle (décimaux).', 'Calculez le périmètre et l’aire.', 1),
  t('tcm-cfr-ex24', 'tcm-cfr-test', '24 — Triangle (décimaux)', 'Périmètre et aire d’un triangle (décimaux).', 'Calculez le périmètre et l’aire.', 1),
  t('tcm-cfr-ex25', 'tcm-cfr-test', '25 — Côté du carré', 'Retrouver le côté à partir du périmètre.', 'Résolvez le problème.', 1),
  t('tcm-cfr-ex26', 'tcm-cfr-test', '26 — Côté du rectangle', 'Retrouver un côté à partir du périmètre.', 'Résolvez le problème.', 1),
  t('tcm-cfr-ex27', 'tcm-cfr-test', '27 — Repérage (cadran I)', 'Graduer, placer et lire des points (quadrant I).', '', 1),
  t('tcm-cfr-ex28', 'tcm-cfr-test', '28 — Plan de métro', 'Lire un plan de métro (coordonnées).', 'Répondez aux questions. Écrivez uniquement les coordonnées.', 1),
]
