import type { Difficulty, Domain, ExerciseType, FrenchTrack, Topic } from './types'
import {
  ALPHABETISATION_EXERCISE_TYPES,
  ALPHABETISATION_TOPICS,
} from '@/alphabetisation/catalog'
import { SOUTIEN_KINDS } from '@/francais/soutien/kinds'
import { allSoutienBankDefs } from '@/francais/soutien/themes'
import { defaultCalliText } from '@/calligraphie/defaults'
import { DEFAULT_CALLI_FONT, DEFAULT_CALLI_SIZE } from '@/calligraphie/fonts'
import { CALLI_LIBRE_TOPIC, calligraphieTopics as calliTopicList } from '@/calligraphie/topics'
import { GRAMMAIRE_EXERCISE_TYPES, GRAMMAIRE_TOPICS } from '@/grammaire/catalog'
import { defaultEntriesFor } from '@/jeux/defaults'
import { entriesToText } from '@/jeux/parse'
import { JEUX_LIBRE_TOPIC, isJeuxTopicId, jeuxTopicsFromFr } from '@/jeux/topics'
import { ACM_EXERCISE_TYPES, ACM_TOPICS } from '@/acm/catalog'
import { LOGIQUE_EXERCISE_TYPES, LOGIQUE_TOPICS } from '@/logique/catalog'
import { SANTE_EXERCISE_TYPES, SANTE_TOPICS } from '@/sante/catalog'
import { SOCIETE_EXERCISE_TYPES, SOCIETE_TOPICS } from '@/societe/catalog'
import { TCF_EXERCISE_TYPES, TCF_TOPICS } from '@/tcf/catalog'
import { TCM_CFR_EXERCISE_TYPES, TCM_CFR_TOPICS } from '@/tcm-cfr/catalog'
import { TCM_CSC_EXERCISE_TYPES, TCM_CSC_TOPICS } from '@/tcm-csc/catalog'
import { VOCABULAIRE_EXERCISE_TYPES, VOCABULAIRE_TOPICS } from '@/vocabulaire/catalog'

export const topics: Topic[] = [
  { id: 'tpm-info', label: 'Informations', domain: 'tpm' },
  ...TCF_TOPICS,
  { id: 'glossaire-algebre', label: 'Glossaire', domain: 'algèbre' },
  { id: 'nombres', label: 'Nombres naturels', domain: 'algèbre' },
  { id: 'addition', label: 'Additions', domain: 'algèbre' },
  { id: 'soustraction', label: 'Soustractions', domain: 'algèbre' },
  { id: 'estimation', label: 'Estimation et arrondi', domain: 'algèbre' },
  { id: 'multiplication', label: 'Multiplications', domain: 'algèbre' },
  { id: 'division', label: 'Divisions', domain: 'algèbre' },
  { id: 'problemes', label: 'Problèmes', domain: 'algèbre' },
  { id: 'multiples', label: 'Multiples, PGCD et PPCM', domain: 'algèbre' },
  { id: 'fractions', label: 'Fractions', domain: 'algèbre' },
  { id: 'decimaux', label: 'Nombres décimaux', domain: 'algèbre' },
  { id: 'proportionnalite', label: 'Pourcentages et proportions', domain: 'algèbre' },
  { id: 'relatifs', label: 'Nombres relatifs', domain: 'algèbre' },
  { id: 'puissances', label: 'Puissances et racines', domain: 'algèbre' },
  { id: 'expressions', label: 'Expressions algébriques', domain: 'algèbre' },
  { id: 'equations', label: 'Équations', domain: 'algèbre' },
  { id: 'glossaire-geometrie', label: 'Glossaire', domain: 'géométrie' },
  { id: 'figures', label: 'Formes', domain: 'géométrie' },
  { id: 'conversions', label: 'Conversions d’unités', domain: 'géométrie' },
  { id: 'perimetres', label: 'Périmètres', domain: 'géométrie' },
  { id: 'aires', label: 'Aires', domain: 'géométrie' },
  { id: 'volumes', label: 'Volumes', domain: 'géométrie' },
  { id: 'reperage', label: 'Repérage dans le plan', domain: 'géométrie' },
  { id: 'transformations', label: 'Transformations géométriques', domain: 'géométrie' },
  ...ALPHABETISATION_TOPICS,
  { id: 'soutien-voyelles', label: 'Voyelles', domain: 'soutien-fr' },
  { id: 'soutien-consonnes-i', label: 'Consonnes I', domain: 'soutien-fr' },
  { id: 'soutien-consonnes-ii', label: 'Consonnes II', domain: 'soutien-fr' },
  { id: 'soutien-consonnes-iii', label: 'Consonnes III', domain: 'soutien-fr' },
  { id: 'soutien-sons-complexes', label: 'Sons complexes', domain: 'soutien-fr' },
  { id: 'phrase-tableaux', label: 'Tableaux Gattegno', domain: 'gattegno' },
  { id: 'phrase-simple', label: 'Simple', domain: 'gattegno' },
  { id: 'phrase-negation', label: 'Négation simple', domain: 'gattegno' },
  { id: 'phrase-adjectif', label: 'Adjectif', domain: 'gattegno' },
  { id: 'phrase-negation-adjectif', label: 'Négation avec adjectif', domain: 'gattegno' },
  { id: 'phrase-determinants', label: 'Déterminants', domain: 'gattegno' },
  { id: 'phrase-negation-determinants', label: 'Négation déterminants', domain: 'gattegno' },
  { id: 'phrase-preposition', label: 'Préposition', domain: 'gattegno' },
  { id: 'phrase-negation-preposition', label: 'Négation prépositions', domain: 'gattegno' },
  { id: 'phrase-adverbe', label: 'Adverbe', domain: 'gattegno' },
  { id: 'phrase-negation-adverbe', label: 'Négation avec adverbe', domain: 'gattegno' },
  { id: 'phrase-conjonctions', label: 'Conjonctions', domain: 'gattegno' },
  // —— Grammaire FALC (théorie SCAI) ——
  ...GRAMMAIRE_TOPICS,
  // —— Vocabulaire / Société / Santé / ACM (squelettes) ——
  ...VOCABULAIRE_TOPICS,
  ...SOCIETE_TOPICS,
  ...SANTE_TOPICS,
  ...ACM_TOPICS,
  ...LOGIQUE_TOPICS,
  // —— TCM CSC / TCM CFR (stubs vides, pas une copie de TPM) ——
  ...TCM_CSC_TOPICS,
  ...TCM_CFR_TOPICS,
  // —— Grilles de cartes (thèmes FR + Libre) ——
  ...jeuxTopicsFromFr,
  // —— Calligraphie (thèmes FR + Libre) ——
  ...calliTopicList,
]

export const topicById = Object.fromEntries(topics.map((topic) => [topic.id, topic])) as Record<string, Topic>
export const algebraTopics = topics.filter((topic) => topic.domain === 'algèbre')
export const geometryTopics = topics.filter((topic) => topic.domain === 'géométrie')
export const alphabetisationTopics = topics.filter((topic) => topic.domain === 'alphabetisation')
/** @deprecated Alias — domaine renommé Alphabétisation. */
export const lectureTopics = alphabetisationTopics
export const soutienFrTopics = topics.filter((topic) => topic.domain === 'soutien-fr')
export const gattegnoTopics = topics.filter((topic) => topic.domain === 'gattegno')
export const grammaireTopics = topics.filter((topic) => topic.domain === 'grammaire')
export const vocabulaireTopics = topics.filter((topic) => topic.domain === 'vocabulaire')
export const societeTopics = topics.filter((topic) => topic.domain === 'société')
export const santeTopics = topics.filter((topic) => topic.domain === 'santé')
export const acmTopics = topics.filter((topic) => topic.domain === 'acm')
export const logiqueTopics = topics.filter((topic) => topic.domain === 'logique')
export const tcmCscTopics = topics.filter((topic) => topic.domain === 'tcm-csc')
export const tcmCfrTopics = topics.filter((topic) => topic.domain === 'tcm-cfr')
export const jeuxTopics = topics.filter((topic) => topic.domain === 'jeux')
export const calligraphieTopics = topics.filter((topic) => topic.domain === 'calligraphie')
/** TCF : un thème par compétence (CE, CO, PE, PO). */
export const tcfTopics = topics.filter((topic) => topic.domain === 'tcf')
/** Thèmes maths utilisables dans le TPM (intro + algèbre + géométrie). */
export const tpmTopics = [
  ...topics.filter((topic) => topic.domain === 'tpm'),
  ...algebraTopics,
  ...geometryTopics,
]

const t = (
  id: string,
  topic: string,
  label: string,
  description: string,
  instruction: string,
  visual: ExerciseType['visual'],
  extra: Partial<ExerciseType> = {},
): ExerciseType => ({ id, topic, label, description, instruction, visual, ...extra })

export const exerciseTypes: ExerciseType[] = [
  t(
    'tpm-consignes',
    'tpm-info',
    'Consignes du test',
    'Page d’informations et consignes du test de placement de mathématiques.',
    'Lisez les consignes avant de commencer le test.',
    'texte',
    { preferredColumns: 1 },
  ),
  t(
    'tpm-comparer',
    'tpm-info',
    'Comparer (10–100)',
    'Comparer des nombres entre 10 et 100 (<, =, >).',
    'Coloriez la pastille correcte.',
    'ligne',
    { preferredColumns: 2 },
  ),
  t(
    'tpm-suite',
    'tpm-info',
    'Suites (jusqu’à 100)',
    'Compléter une suite de 5 nombres (maximum 100).',
    'Complétez les termes manquants.',
    'suite',
    { preferredColumns: 2 },
  ),
  t(
    'tpm-operations',
    'tpm-info',
    'Additions et soustractions',
    'Trois additions et trois soustractions (résultat ou opérande manquant), nombres entre 10 et 100.',
    'Effectuez les opérations.',
    'ligne',
    { preferredColumns: 2 },
  ),
  t(
    'tpm-quatre-ops',
    'tpm-info',
    'Calcul mixte (+ − × ÷)',
    'Additions, soustractions, multiplications et divisions en ligne (templates à trous).',
    'Effectuez les calculs.',
    'ligne',
    { preferredColumns: 2 },
  ),
  t(
    'tpm-add-sub-col-3',
    'tpm-info',
    'Colonnes (+ / −) 3 chiffres',
    'Une addition et une soustraction en colonnes (nombres à 3 chiffres, grille à 4 colonnes).',
    'Effectuez les calculs en colonnes.',
    'colonne',
    { preferredColumns: 2 },
  ),
  t(
    'tpm-decompose-99',
    'tpm-info',
    'Décomposer (11–99)',
    'Décomposer un nombre entre 11 et 99 en dizaines et unités.',
    'Décomposez chaque nombre.',
    'ligne',
    { preferredColumns: 1 },
  ),
  t(
    'tpm-grandes-suites',
    'tpm-info',
    'Grandes suites',
    'Compléter des suites (écarts 100–200 puis 200–400, multiples de 5).',
    'Complétez les termes manquants.',
    'suite',
    { preferredColumns: 1 },
  ),
  t(
    'tpm-decompose-9999',
    'tpm-info',
    'Décomposer (1000–9999)',
    'Décomposer un nombre à 4 chiffres avec un 0 aux centaines ou aux dizaines.',
    'Décomposez chaque nombre.',
    'ligne',
    { preferredColumns: 1 },
  ),
  t(
    'tpm-add-sub-col-4',
    'tpm-info',
    'Colonnes (+ / −) 4 chiffres',
    'Une addition et une soustraction en colonnes (nombres à 4 chiffres, grille à 5 colonnes).',
    'Effectuez les calculs en colonnes.',
    'colonne',
    { preferredColumns: 2 },
  ),
  t(
    'tpm-mul-div-col',
    'tpm-info',
    'Multiplication et division en colonnes',
    'Une multiplication (3 chiffres × 3–9) et une division (4 chiffres ÷ 3–9, sans reste).',
    'Effectuez les calculs en colonnes.',
    'colonne',
    { preferredColumns: 2 },
  ),
  t(
    'tpm-rect-peri-aire',
    'tpm-info',
    'Rectangle (périmètre et aire)',
    'Rectangle coté : calculer le périmètre et l’aire.',
    'Calculez le périmètre et l’aire.',
    'geo',
    { figure: 'rectangle', preferredColumns: 1 },
  ),
  t(
    'tpm-para-peri-aire',
    'tpm-info',
    'Parallélogramme (périmètre et aire)',
    'Parallélogramme coté (base, côté, hauteur) : calculer le périmètre et l’aire.',
    'Calculez le périmètre et l’aire.',
    'geo',
    { figure: 'parallelogram', preferredColumns: 1 },
  ),
  t(
    'tpm-tri-peri-aire',
    'tpm-info',
    'Triangle (périmètre et aire)',
    'Triangle quelconque coté (a, b, c, h) : calculer le périmètre et l’aire.',
    'Calculez le périmètre et l’aire.',
    'geo',
    { figure: 'triangle', preferredColumns: 1 },
  ),
  t(
    'tpm-rhombus-peri-aire',
    'tpm-info',
    'Losange (périmètre et aire)',
    'Losange coté (c, d₁, d₂) : calculer le périmètre et l’aire.',
    'Calculez le périmètre et l’aire.',
    'geo',
    { figure: 'rhombus', preferredColumns: 1 },
  ),
  t(
    'tpm-trap-peri-aire',
    'tpm-info',
    'Trapèze (périmètre et aire)',
    'Trapèze isocèle coté (a, b, c, h) : calculer le périmètre et l’aire.',
    'Calculez le périmètre et l’aire.',
    'geo',
    { figure: 'trapezoid', preferredColumns: 1 },
  ),
  t(
    'tpm-circle-peri-aire',
    'tpm-info',
    'Cercle (périmètre et aire)',
    'Cercle avec diamètre : calculer le périmètre et l’aire (π = 3,14).',
    'Calculez le périmètre et l’aire. (π = 3,14)',
    'geo',
    { figure: 'circle', preferredColumns: 1 },
  ),
  t(
    'tpm-suites-6',
    'tpm-info',
    'Suites (6 termes)',
    'Suites à 6 termes (4 trous, 2 visibles consécutifs) : grands nombres puis décimaux.',
    'Complétez les suites numériques.',
    'suite',
    { preferredColumns: 1 },
  ),
  t(
    'tpm-ranger',
    'tpm-info',
    'Trier des nombres',
    '5 grands nombres puis 5 décimaux ; une question croissant, l’autre décroissant (ordre tiré au hasard).',
    'Classez les nombres dans l’ordre demandé.',
    'ligne',
    { preferredColumns: 1 },
  ),
  t(
    'tpm-dec-add-sub',
    'tpm-info',
    'Additions et soustractions décimales',
    'À poser : + et − décimaux (grille vide 6 col.). Soustraction : 1er nombre 1–2 déc., 2e une décimale de plus.',
    'Posez les nombres dans la grille, puis calculez.',
    'colonne-vide',
    { preferredColumns: 2 },
  ),
  t(
    'tpm-mul-mixte',
    'tpm-info',
    'Multiplications à poser (entier et décimal)',
    'À poser : × entière (3 × 2 chiffres) et × décimale (4 chiffres × 1,1–9,9), grille vide 6 col.',
    'Posez les nombres dans la grille, puis calculez.',
    'colonne-vide',
    { preferredColumns: 2 },
  ),
  t(
    'tpm-div-mixte',
    'tpm-info',
    'Divisions posées (entier et décimal)',
    'Une division entière (4 chiffres ÷ 12–19) et une décimale (4 chiffres, 2–3 déc. avec un 0 ÷ 3–9), grilles 4+4.',
    'Effectuez les divisions en colonnes.',
    'colonne',
    { preferredColumns: 2 },
  ),
  t(
    'tpm-frac-color',
    'tpm-info',
    'Colorier les fractions',
    'Formes simples (mêmes limites que TCM CFR) : colorier la fraction indiquée.',
    'Coloriez les parties pour représenter la fraction demandée.',
    'geo',
    { preferredColumns: 2 },
  ),
  t(
    'tpm-frac-read',
    'tpm-info',
    'Lire les fractions',
    'Formes simples (mêmes limites que TCM CFR) : lire la fraction coloriée.',
    'Observez les formes coloriées et écrivez la fraction représentée.',
    'geo',
    { preferredColumns: 2 },
  ),
  t(
    'tpm-ops-decimales',
    'tpm-info',
    'Opérations décimales',
    'Une addition, une soustraction, deux multiplications et deux divisions avec décimaux (en ligne).',
    'Effectuez les opérations.',
    'ligne',
    { preferredColumns: 2 },
  ),
  t(
    'tpm-puissances-mixte',
    'tpm-info',
    'Puissances et racines (mixte)',
    'Puissance (base 1–9), racine carrée (≤ 144), décimal × 10ⁿ, entier ÷ 10ⁿ.',
    'Calculez.',
    'ligne',
    { preferredColumns: 2 },
  ),
  t(
    'tpm-priorite-ops',
    'tpm-info',
    'Priorité des opérations',
    'Deux expressions : () [] avec + − × ÷ ; puis fractions empilées et puissances (50 modèles).',
    'Calculez en respectant les priorités.',
    'ligne',
    { preferredColumns: 1 },
  ),
  t(
    'tpm-relatifs-ops',
    'tpm-info',
    'Opérations avec relatifs',
    'Quatre opérations (+ − × ÷) sur relatifs : positifs écrits (+n) ; +/− en 10–99 ; ×/÷ (10–25)×(1–9).',
    'Calculez.',
    'ligne',
    { preferredColumns: 2 },
  ),
  t(
    'tpm-fractions-mixte',
    'tpm-info',
    'Fractions (réduire et calculer)',
    'Réduire (avec ou sans trou), puis + − × ÷ ; multiplication et division avec au moins un relatif.',
    'Réduisez ou calculez. Simplifiez si possible.',
    'ligne',
    { preferredColumns: 2 },
  ),
  t(
    'tpm-expressions-reduire',
    'tpm-info',
    'Réduction d’expressions',
    'Q1 : somme de monômes sans puissance ; Q2 : produit avec exactement deux · (trois facteurs : monômes / parenthèses), 50 modèles, sans puissance dans l’énoncé.',
    'Réduisez chaque expression.',
    'ligne',
    { preferredColumns: 1 },
  ),
  t(
    'tpm-expressions-evaluer',
    'tpm-info',
    'Évaluer des expressions (3 variables)',
    'Q1 : sans puissance ni fraction (≥ 6 termes) ; Q2 : avec puissances et fractions empilées (binômes possibles), ≥ 6 termes dont 2 hors fraction. 50 modèles par question.',
    'Évaluez chaque expression avec les trois valeurs indiquées.',
    'ligne',
    { preferredColumns: 1 },
  ),
  t(
    'tpm-equations',
    'tpm-info',
    'Résoudre des équations',
    'Q1 : x d’un seul côté (gauche ou droite), sans fraction — 50 modèles. Q2 : x des deux côtés, fractions possibles — 50 modèles. Grille sous l’équation, 1 colonne.',
    'Résolvez chaque équation.',
    'ligne',
    { preferredColumns: 1 },
  ),
  t(
    'tpm-conversions-mixte',
    'tpm-info',
    'Conversions d’unités (mixte)',
    'Quatre conversions : masse (kg), capacité (L), temps (h), aire (m²) ou volume (m³). Entier ou décimal au hasard.',
    'Convertissez.',
    'ligne',
    { preferredColumns: 2 },
  ),
  t(
    'tpm-proportion-kg',
    'tpm-info',
    'Pourcentage et règle de trois',
    '1) p % de n est égal à … (p ∈ {10,20,25,40,60,75,80}, n 101–999 non multiple de 10) ; 2) n kg de … → p francs / m kg → ____ (25 produits).',
    'Complétez.',
    'texte',
    { preferredColumns: 1 },
  ),
  t('nombres-chiffres', 'nombres', 'Écrire en chiffres', 'Le nombre est écrit en lettres, on l’écrit en chiffres.', 'Écrivez chaque nombre en chiffres.', 'texte', { preferredColumns: 1 }),
  t('nombres-lettres', 'nombres', 'Écrire en lettres', 'Le nombre est écrit en chiffres, on l’écrit en lettres (Suisse romande).', 'Écrivez chaque nombre en lettres.', 'texte', { preferredColumns: 1 }),
  t(
    'nombres-compter-formes',
    'nombres',
    'Compter les formes',
    'Cadre d’icônes N&B (notes, trèfles, cœurs…) placées au hasard sans se toucher ; deux styles distracteurs à ignorer.',
    'Comptez le nombre de formes.',
    'geo',
    { preferredColumns: 2 },
  ),
  t('nombres-position', 'nombres', 'Valeur positionnelle', 'Retrouver le chiffre des unités, dizaines, centaines…', 'Indiquez le chiffre demandé.', 'texte', { preferredColumns: 1 }),
  t('nombres-decompose', 'nombres', 'Décomposer', 'Écrire un nombre en sommes de puissances de 10 (milliers… unités).', 'Décomposez chaque nombre.', 'ligne', { preferredColumns: 1 }),
  t('nombres-comparer', 'nombres', 'Comparer', 'Choisir le symbole correct : <, = ou >.', 'Coloriez la pastille correcte.', 'ligne', { preferredColumns: 2 }),
  t('nombres-encadrer-10', 'nombres', 'Encadrer (pas de 10)', 'Encadrer un nombre entre deux dizaines consécutives.', 'Complétez l’encadrement par pas de 10.', 'ligne', { preferredColumns: 2 }),
  t('nombres-encadrer-100', 'nombres', 'Encadrer (pas de 100)', 'Encadrer un nombre entre deux centaines consécutives.', 'Complétez l’encadrement par pas de 100.', 'ligne', { preferredColumns: 2 }),
  t('nombres-pair', 'nombres', 'Pairs et impairs', 'Reconnaître un nombre pair ou impair.', 'Coloriez la pastille correcte.', 'ligne', { preferredColumns: 2 }),
  t('nombres-ranger', 'nombres', 'Ranger', 'Ranger cinq nombres dans l’ordre croissant ou décroissant.', 'Rangez les nombres dans l’ordre demandé.', 'suite', { preferredColumns: 1 }),
  t('nombres-suite', 'nombres', 'Suites à trous', 'Compléter une suite numérique.', 'Complétez les termes manquants.', 'suite'),

  t('addition-ligne', 'addition', 'En ligne', 'Calculer 46 + 37 = ?', 'Calculez chaque addition.', 'ligne'),
  t('addition-trou', 'addition', 'En ligne avec des trous', 'Compléter 46 + ? = 83 ou ? + 37 = 83.', 'Complétez le nombre manquant.', 'trou'),
  t('addition-colonne', 'addition', 'En colonnes (nombres posés)', 'Les nombres sont déjà alignés dans le tableau.', 'Effectuez les additions en colonnes. Écrivez le résultat et les retenues.', 'colonne', { preferredColumns: 2 }),
  t('addition-colonne-poser', 'addition', 'En colonnes (à poser)', 'Poser soi-même les nombres dans le tableau.', 'Posez les nombres dans le tableau, puis calculez.', 'colonne-vide', { preferredColumns: 2 }),
  t('addition-comparer', 'addition', 'Comparer des sommes', 'Comparer 12 + 8 et 15 + 4.', 'Coloriez la pastille correcte.', 'ligne', { preferredColumns: 2 }),
  t(
    'addition-tableau',
    'addition',
    'Tableau à compléter',
    'En-têtes donnés. L’élève écrit chaque somme.',
    'Complétez le tableau. Chaque case est la somme du nombre de la ligne et de celui de la colonne.',
    'ligne',
    { preferredColumns: 2 },
  ),
  t(
    'addition-tableau-entetes',
    'addition',
    'En-têtes à trouver',
    'Une série d’en-têtes est vide. Des résultats permettent de la retrouver.',
    'Retrouvez les en-têtes, puis complétez le tableau. Chaque case est la somme du nombre de la ligne et de celui de la colonne.',
    'ligne',
    { preferredColumns: 2 },
  ),
  t(
    'addition-decompose',
    'addition',
    'Calcul mental (décomposition)',
    'Séparer dizaines et unités, les regrouper, puis écrire le résultat.',
    'Effectuez les calculs comme dans l’exemple.',
    'ligne',
    { preferredColumns: 1 },
  ),
  t(
    'addition-tableau-melange',
    'addition',
    'Tableau mélangé',
    'Des nombres manquent dans les cases et dans les en-têtes de ligne ou de colonne.',
    'Complétez les nombres manquants, dans les cases et dans les en-têtes. Chaque case est la somme du nombre de la ligne et de celui de la colonne.',
    'ligne',
    { preferredColumns: 2 },
  ),

  t('soustraction-ligne', 'soustraction', 'En ligne', 'Calculer 83 − 46 = ?', 'Calculez chaque soustraction.', 'ligne'),
  t('soustraction-trou', 'soustraction', 'En ligne avec des trous', 'Compléter 83 − ? = 46 ou ? − 37 = 46.', 'Complétez le nombre manquant.', 'trou'),
  t('soustraction-colonne', 'soustraction', 'En colonnes (nombres posés)', 'Les nombres sont déjà alignés dans le tableau.', 'Effectuez les soustractions en colonnes. Écrivez le résultat et les emprunts.', 'colonne', { preferredColumns: 2 }),
  t('soustraction-colonne-poser', 'soustraction', 'En colonnes (à poser)', 'Poser soi-même les nombres dans le tableau.', 'Posez les nombres, puis calculez.', 'colonne-vide', { preferredColumns: 2 }),
  t('soustraction-comparer', 'soustraction', 'Comparer des différences', 'Comparer 90 − 12 et 88 − 8.', 'Coloriez la pastille correcte.', 'ligne', { preferredColumns: 2 }),
  t(
    'soustraction-tableau',
    'soustraction',
    'Tableau à compléter',
    'En-têtes donnés. L’élève écrit chaque différence.',
    'Complétez le tableau. Chaque case est le nombre de la ligne moins celui de la colonne.',
    'ligne',
    { preferredColumns: 2 },
  ),
  t(
    'soustraction-tableau-entetes',
    'soustraction',
    'En-têtes à trouver',
    'Une série d’en-têtes est vide. Des résultats permettent de la retrouver.',
    'Retrouvez les en-têtes, puis complétez le tableau. Chaque case est le nombre de la ligne moins celui de la colonne.',
    'ligne',
    { preferredColumns: 2 },
  ),
  t(
    'soustraction-decompose',
    'soustraction',
    'Calcul mental (décomposition)',
    'Séparer dizaines et unités, les regrouper, puis écrire le résultat.',
    'Effectuez les calculs comme dans l’exemple.',
    'ligne',
    { preferredColumns: 1 },
  ),
  t(
    'soustraction-tableau-melange',
    'soustraction',
    'Tableau mélangé',
    'Des nombres manquent dans les cases et dans les en-têtes de ligne ou de colonne.',
    'Complétez les nombres manquants, dans les cases et dans les en-têtes. Chaque case est le nombre de la ligne moins celui de la colonne.',
    'ligne',
    { preferredColumns: 2 },
  ),

  t('estimation-dizaine', 'estimation', 'Arrondir à la dizaine', 'Arrondir 47 à la dizaine la plus proche.', 'Arrondissez à la dizaine la plus proche.', 'ligne'),
  t('estimation-centaine', 'estimation', 'Arrondir à la centaine', 'Arrondir 382 à la centaine la plus proche.', 'Arrondissez à la centaine la plus proche.', 'ligne'),
  t('estimation-somme', 'estimation', 'Estimer une somme', 'Estimer 48 + 33 à la dizaine.', 'Estimez le résultat à la dizaine la plus proche.', 'ligne'),
  t('estimation-difference', 'estimation', 'Estimer une différence', 'Estimer 91 − 28 à la dizaine.', 'Estimez le résultat à la dizaine la plus proche.', 'ligne'),

  t('multiplication-ligne', 'multiplication', 'En ligne (tables)', 'Calculer 7 × 8 = ?', 'Calculez chaque produit.', 'ligne'),
  t('multiplication-trou', 'multiplication', 'En ligne avec des trous', 'Compléter 7 × ? = 56.', 'Complétez le nombre manquant.', 'trou'),
  t('multiplication-colonne', 'multiplication', 'En colonnes × 1 chiffre', 'Nombres déjà posés, multiplicateur à 1 chiffre.', 'Effectuez les multiplications en colonnes.', 'colonne', { preferredColumns: 2 }),
  t('multiplication-colonne-poser', 'multiplication', 'En colonnes à poser × 1 chiffre', 'Poser le calcul dans le tableau.', 'Posez les nombres, puis calculez.', 'colonne-vide', { preferredColumns: 2 }),
  t('multiplication-2chiffres', 'multiplication', 'En colonnes × 2 chiffres', 'Produits partiels (unités puis dizaines), puis addition.', 'Effectuez les multiplications en colonnes. Écrivez les deux produits partiels, puis additionnez.', 'colonne', { preferredColumns: 1 }),
  t('multiplication-2chiffres-poser', 'multiplication', 'En colonnes à poser × 2 chiffres', 'Poser le calcul dans le tableau vide, puis les deux produits partiels.', 'Posez les nombres, écrivez les deux produits partiels, puis additionnez.', 'colonne-vide', { preferredColumns: 2 }),

  t('division-ligne', 'division', 'En ligne', 'Calculer 56 ÷ 7 = ?', 'Calculez chaque quotient.', 'ligne'),
  t('division-trou', 'division', 'En ligne avec des trous', 'Compléter 56 ÷ ? = 8.', 'Complétez le nombre manquant.', 'trou'),
  t('division-colonne', 'division', 'En colonnes (nombres posés)', 'Division posée en grille (dividende, étapes, quotient, reste).', 'Effectuez les divisions en colonnes. Écrivez les étapes, le quotient et le reste.', 'colonne', { preferredColumns: 1 }),
  t('division-colonne-poser', 'division', 'En colonnes (à poser)', 'Poser dividende et diviseur dans la grille, puis diviser.', 'Posez la division, puis calculez le quotient et le reste.', 'colonne-vide', { preferredColumns: 1 }),

  t('problemes-addition', 'problemes', 'Addition', 'Petits problèmes d’addition.', 'Lisez le problème. Écrivez le calcul et la réponse.', 'texte', { preferredColumns: 1 }),
  t('problemes-soustraction', 'problemes', 'Soustraction', 'Petits problèmes de soustraction.', 'Lisez le problème. Écrivez le calcul et la réponse.', 'texte', { preferredColumns: 1 }),
  t('problemes-add-sub', 'problemes', 'Addition et soustraction', 'Problèmes mêlant additions et soustractions.', 'Lisez le problème. Écrivez le calcul et la réponse.', 'texte', { preferredColumns: 1 }),
  t('problemes-multiplication', 'problemes', 'Multiplication', 'Problèmes de multiplication.', 'Lisez le problème. Écrivez le calcul et la réponse.', 'texte', { preferredColumns: 1 }),
  t('problemes-division', 'problemes', 'Division', 'Problèmes de division.', 'Lisez le problème. Écrivez le calcul et la réponse.', 'texte', { preferredColumns: 1 }),
  t('problemes-melange', 'problemes', 'Tout mélanger', 'Problèmes avec les quatre opérations.', 'Lisez le problème. Écrivez le calcul et la réponse.', 'texte', { preferredColumns: 1 }),

  t('multiples-reconnaitre', 'multiples', 'Reconnaître un multiple', 'Dire si un nombre est multiple d’un autre.', 'Répondez par oui ou non.', 'ligne'),
  t('multiples-diviseurs', 'multiples', 'Lister les diviseurs', 'Trouver tous les diviseurs d’un nombre.', 'Écrivez tous les diviseurs, du plus petit au plus grand.', 'texte'),
  t('multiples-pgcd', 'multiples', 'PGCD', 'Plus grand commun diviseur de deux nombres.', 'Calculez le PGCD.', 'ligne'),
  t('multiples-ppcm', 'multiples', 'PPCM', 'Plus petit commun multiple de deux nombres.', 'Calculez le PPCM.', 'ligne'),

  t('fractions-identifier', 'fractions', 'Lire une fraction', 'Donner le numérateur ou le dénominateur.', 'Complétez.', 'ligne'),
  t('fractions-equivalentes', 'fractions', 'Fractions équivalentes', 'Compléter 2/5 = ?/10.', 'Complétez la fraction équivalente.', 'ligne'),
  t('fractions-simplifier', 'fractions', 'Simplifier', 'Réduire une fraction.', 'Simplifiez chaque fraction.', 'ligne'),
  t('fractions-comparer', 'fractions', 'Comparer', 'Comparer deux fractions.', 'Coloriez la pastille correcte.', 'ligne', { preferredColumns: 2 }),
  t('fractions-add', 'fractions', 'Additionner / soustraire', 'Même dénominateur, puis dénominateurs différents.', 'Calculez et simplifiez si possible.', 'ligne'),
  t('fractions-mul', 'fractions', 'Multiplier', 'Produit de deux fractions.', 'Calculez et simplifiez si possible.', 'ligne'),
  t('fractions-div', 'fractions', 'Diviser', 'Division de deux fractions.', 'Calculez et simplifiez si possible.', 'ligne'),

  t('decimaux-comparer', 'decimaux', 'Comparer', 'Comparer 3,8 et 3,75.', 'Coloriez la pastille correcte.', 'ligne', { preferredColumns: 2 }),
  t('decimaux-add-colonne', 'decimaux', 'Addition en colonne (nombres posés)', 'Additions de décimaux déjà alignés.', 'Calculez les additions en colonnes.', 'colonne', { preferredColumns: 2 }),
  t('decimaux-add-colonne-poser', 'decimaux', 'Addition en colonne à poser', 'Poser puis additionner des décimaux.', 'Posez les nombres, puis calculez.', 'colonne-vide', { preferredColumns: 2 }),
  t('decimaux-sub-colonne', 'decimaux', 'Soustraction en colonne (nombres posés)', 'Soustractions de décimaux déjà alignés.', 'Calculez les soustractions en colonnes.', 'colonne', { preferredColumns: 2 }),
  t('decimaux-sub-colonne-poser', 'decimaux', 'Soustraction en colonne à poser', 'Poser puis soustraire des décimaux.', 'Posez les nombres, puis calculez.', 'colonne-vide', { preferredColumns: 2 }),
  t('decimaux-mul-colonne', 'decimaux', 'Multiplication en colonne (nombres posés)', 'Multiplier un décimal par un entier (posé).', 'Calculez les multiplications en colonnes.', 'colonne', { preferredColumns: 2 }),
  t('decimaux-mul-colonne-poser', 'decimaux', 'Multiplication en colonne à poser', 'Poser puis multiplier un décimal par un entier.', 'Posez les nombres, puis calculez.', 'colonne-vide', { preferredColumns: 2 }),
  t('decimaux-div-colonne', 'decimaux', 'Division en colonne (nombres posés)', 'Division posée avec décimaux.', 'Effectuez les divisions en colonnes.', 'colonne', { preferredColumns: 1 }),
  t('decimaux-div-colonne-poser', 'decimaux', 'Division en colonne à poser', 'Poser puis diviser des décimaux.', 'Posez la division, puis calculez.', 'colonne-vide', { preferredColumns: 1 }),
  t('decimaux-mul-ligne', 'decimaux', 'Multiplication en ligne (facteurs)', 'Astuces × 0,5 · 0,25 · 0,2 · 0,1…', 'Calculez.', 'ligne'),
  t('decimaux-div-ligne', 'decimaux', 'Division en ligne (facteurs)', 'Astuces ÷ 0,5 · 0,25 · 0,2 · 0,1…', 'Calculez.', 'ligne'),

  t('proportion-notion', 'proportionnalite', 'Notion de pourcentage', 'Écrire 1/4 = 25 %.', 'Complétez.', 'ligne'),
  t('proportion-de', 'proportionnalite', 'Pourcentage d’un nombre', 'Calculer 20 % de 80.', 'Calculez.', 'ligne'),
  t('proportion-var', 'proportionnalite', 'Augmentation et réduction', 'Augmenter ou diminuer d’un pourcentage.', 'Calculez le nouveau montant.', 'ligne'),
  t('proportion-problemes', 'proportionnalite', 'Problèmes', 'Situations de proportionnalité.', 'Lisez le problème. Écrivez le calcul et la réponse.', 'texte', { preferredColumns: 1 }),

  t('relatifs-comparer', 'relatifs', 'Comparer', 'Comparer −7 et −3.', 'Coloriez la pastille correcte.', 'ligne', { preferredColumns: 2 }),
  t('relatifs-add', 'relatifs', 'Addition et soustraction', 'Calculer (−8) + 5.', 'Calculez.', 'ligne'),
  t('relatifs-mul', 'relatifs', 'Multiplication et division', 'Calculer (−6) × 3.', 'Calculez.', 'ligne'),

  t('puissances-calcul', 'puissances', 'Calculer une puissance', 'Calculer 3², 2⁴.', 'Calculez.', 'ligne'),
  t('puissances-10', 'puissances', 'Puissances de 10', 'Écrire 10³ ou 0,01.', 'Écrivez le nombre demandé.', 'ligne'),
  t('puissances-racine', 'puissances', 'Racine carrée', 'Calculer √81.', 'Calculez.', 'ligne'),
  t('puissances-priorite', 'puissances', 'Priorité des opérations', 'Calculer 3 + 2 × 4².', 'Calculez en respectant les priorités.', 'ligne'),

  t('expressions-substituer', 'expressions', 'Évaluer (1 variable)', 'Calculer des expressions pour une même valeur, ex. t = 3.', 'Calculez le résultat.', 'ligne', { preferredColumns: 2 }),
  t('expressions-evaluer-2var', 'expressions', 'Évaluer (2 variables)', 'Évaluer cinq expressions avec les mêmes valeurs de deux lettres.', 'Évaluez les expressions avec deux variables. Les expressions utilisent les mêmes valeurs.', 'ligne', { preferredColumns: 2 }),
  t('expressions-evaluer-3var', 'expressions', 'Évaluer (3 variables)', 'Évaluer cinq expressions avec les mêmes valeurs de trois lettres.', 'Évaluez les expressions avec trois variables. Les expressions utilisent les mêmes valeurs.', 'ligne', { preferredColumns: 2 }),
  t('expressions-evaluer-avances', 'expressions', 'Évaluer (puissances et racines)', 'Évaluer avec carrés, cubes et racines carrées.', 'Évaluez les expressions avec puissances et racines. Les expressions utilisent les mêmes valeurs.', 'ligne', { preferredColumns: 2 }),
  t('expressions-produits', 'expressions', 'Simplifier les produits', 'Simplifier m² · 4 · n · 2.', 'Simplifiez les produits.', 'ligne', { preferredColumns: 2 }),
  t('expressions-reduire', 'expressions', 'Réduction', 'Réduire 3x + 5x − 2.', 'Réduisez chaque expression.', 'ligne', { preferredColumns: 2 }),
  t('expressions-developper', 'expressions', 'Développement', 'Développer 3(x + 4).', 'Développez, puis réduisez si besoin.', 'ligne', { preferredColumns: 2 }),
  t('expressions-factoriser', 'expressions', 'Factorisation', 'Factoriser 6x + 9.', 'Factorisez.', 'ligne', { preferredColumns: 2 }),

  t('equations-simple', 'equations', 'Équations simples', 'Résoudre x + 7 = 15.', 'Résolvez l’équation. Écrivez le développement, puis la valeur de x.', 'ligne', { preferredColumns: 1 }),
  t('equations-deux-cotes', 'equations', 'Inconnue des deux côtés', 'Résoudre 3x + 2 = x + 10.', 'Résolvez l’équation. Écrivez le développement, puis la valeur de x.', 'ligne', { preferredColumns: 1 }),
  t('equations-fractions', 'equations', 'Avec fractions', 'Résoudre x/2 + 3 = 7.', 'Résolvez l’équation. Écrivez le développement, puis la valeur de x.', 'ligne', { preferredColumns: 1 }),
  t('equations-systeme', 'equations', 'Systèmes (substitution)', 'Deux équations, deux inconnues.', 'Résolvez le système. Écrivez le développement, puis l’ensemble solution.', 'texte', { preferredColumns: 1 }),
  t('equations-systeme-add', 'equations', 'Systèmes (addition)', 'Combinaison linéaire.', 'Résolvez le système. Écrivez le développement, puis l’ensemble solution.', 'texte', { preferredColumns: 1 }),

  t('figures-nommer', 'figures', 'Nommer la figure', 'Reconnaître carré, rectangle, triangles, trapèzes, cercle, ovale…', 'Nommez chaque figure.', 'geo', { preferredColumns: 2 }),
  t('figures-proprietes', 'figures', 'Propriétés', 'Côtés, angles droits et symétries, y compris les triangles et les trapèzes.', 'Complétez les propriétés.', 'geo', { preferredColumns: 1 }),

  t('conversions-longueur', 'conversions', 'Longueurs', 'km, hm, dam, m, dm, cm, mm.', 'Convertissez.', 'ligne', { preferredColumns: 2 }),
  t('conversions-aire', 'conversions', 'Aires', 'km², hm², dam², m², dm², cm², mm².', 'Convertissez.', 'ligne', { preferredColumns: 2 }),
  t('conversions-volume', 'conversions', 'Volumes', 'km³, hm³, dam³, m³, dm³, cm³, mm³.', 'Convertissez.', 'ligne', { preferredColumns: 2 }),
  t('conversions-capacite', 'conversions', 'Capacités', 'L, dL, cL, mL.', 'Convertissez.', 'ligne', { preferredColumns: 2 }),
  t('conversions-masse', 'conversions', 'Masses', 'kg, g, mg.', 'Convertissez.', 'ligne', { preferredColumns: 2 }),
  t('conversions-temps', 'conversions', 'Temps', 'h, min, s.', 'Convertissez.', 'ligne', { preferredColumns: 2 }),

  t('perimetres-carre', 'perimetres', 'Carré', 'Périmètre d’un carré.', 'Calculez le périmètre.', 'geo', { figure: 'square', preferredColumns: 2 }),
  t('perimetres-rectangle', 'perimetres', 'Rectangle', 'Périmètre d’un rectangle.', 'Calculez le périmètre.', 'geo', { figure: 'rectangle', preferredColumns: 2 }),
  t('perimetres-triangle', 'perimetres', 'Triangle', 'Périmètre d’un triangle (tous types).', 'Calculez le périmètre.', 'geo', { figure: 'triangle', preferredColumns: 2 }),
  t('perimetres-parallelogramme', 'perimetres', 'Parallélogramme', 'Périmètre d’un parallélogramme.', 'Calculez le périmètre.', 'geo', { figure: 'parallelogram', preferredColumns: 2 }),
  t('perimetres-losange', 'perimetres', 'Losange', 'Périmètre d’un losange.', 'Calculez le périmètre.', 'geo', { figure: 'rhombus', preferredColumns: 2 }),
  t('perimetres-trapeze', 'perimetres', 'Trapèze', 'Périmètre d’un trapèze.', 'Calculez le périmètre.', 'geo', { figure: 'trapezoid', preferredColumns: 2 }),
  t('perimetres-quadrilatere', 'perimetres', 'Quadrilatère', 'Périmètre des quadrilatères (sauf le cercle). Hasard ou choix des formes.', 'Calculez le périmètre.', 'geo', { preferredColumns: 2 }),
  t('perimetres-cercle', 'perimetres', 'Cercle', 'Périmètre = 2πr. Prenez π = 3,14.', 'Calculez le périmètre. Prenez π = 3,14.', 'geo', { figure: 'circle', preferredColumns: 2 }),
  t('perimetres-carre-manquant', 'perimetres', 'Côté du carré', 'Retrouver le côté à partir du périmètre.', 'Calculez le côté.', 'geo', { figure: 'square', preferredColumns: 2 }),
  t('perimetres-rectangle-manquant', 'perimetres', 'Largeur du rectangle', 'Retrouver une dimension à partir du périmètre.', 'Calculez la largeur.', 'geo', { figure: 'rectangle', preferredColumns: 2 }),
  t('perimetres-triangle-manquant', 'perimetres', 'Côté du triangle', 'Retrouver un côté à partir du périmètre.', 'Calculez le côté demandé.', 'geo', { figure: 'triangle', preferredColumns: 2 }),
  t('perimetres-parallelogramme-manquant', 'perimetres', 'Côté du parallélogramme', 'Retrouver un côté à partir du périmètre.', 'Calculez le côté demandé.', 'geo', { figure: 'parallelogram', preferredColumns: 2 }),
  t('perimetres-losange-manquant', 'perimetres', 'Côté du losange', 'Retrouver le côté à partir du périmètre.', 'Calculez le côté.', 'geo', { figure: 'rhombus', preferredColumns: 2 }),
  t('perimetres-trapeze-manquant', 'perimetres', 'Côté du trapèze', 'Retrouver un côté à partir du périmètre.', 'Calculez le côté demandé.', 'geo', { figure: 'trapezoid', preferredColumns: 2 }),
  t('perimetres-quadrilatere-manquant', 'perimetres', 'Côté de quadrilatère', 'Retrouver un côté d’un quadrilatère à partir du périmètre.', 'Calculez le côté demandé.', 'geo', { preferredColumns: 2 }),
  t('perimetres-cercle-manquant', 'perimetres', 'Rayon du cercle', 'Retrouver le rayon à partir du périmètre.', 'Calculez le rayon. Prenez π = 3,14.', 'geo', { figure: 'circle', preferredColumns: 2 }),
  t(
    'perimetres-melange',
    'perimetres',
    'Tout mélanger',
    'Toutes les formes, au hasard : périmètre ou côté manquant.',
    'Calculez le périmètre ou la mesure demandée.',
    'geo',
    { preferredColumns: 2 },
  ),
  t(
    'perimetres-composees',
    'perimetres',
    'Figures composées',
    'Périmètre de figures assemblées (polygones, encoches, arcs). Traits égaux et côtés à déduire.',
    'Calculez le périmètre. Les petits traits marquent des longueurs égales. Prenez π = 3,14 si besoin.',
    'geo',
    { preferredColumns: 2 },
  ),

  t('aires-carre', 'aires', 'Carré', 'Aire d’un carré.', 'Calculez l’aire.', 'geo', { figure: 'square', preferredColumns: 2 }),
  t('aires-rectangle', 'aires', 'Rectangle', 'Aire d’un rectangle.', 'Calculez l’aire.', 'geo', { figure: 'rectangle', preferredColumns: 2 }),
  t('aires-triangle', 'aires', 'Triangle', 'Aire = (b × h) / 2 (tous types).', 'Calculez l’aire.', 'geo', { figure: 'triangle', preferredColumns: 2 }),
  t('aires-parallelogramme', 'aires', 'Parallélogramme', 'Aire = b × h.', 'Calculez l’aire.', 'geo', { figure: 'parallelogram', preferredColumns: 2 }),
  t('aires-losange', 'aires', 'Losange', 'Aire = c × h.', 'Calculez l’aire.', 'geo', { figure: 'rhombus', preferredColumns: 2 }),
  t('aires-trapeze', 'aires', 'Trapèze', 'Aire = (B + b) × h / 2.', 'Calculez l’aire.', 'geo', { figure: 'trapezoid', preferredColumns: 2 }),
  t('aires-quadrilatere', 'aires', 'Quadrilatère', 'Aire des quadrilatères (sauf le disque). Hasard ou choix des formes.', 'Calculez l’aire.', 'geo', { preferredColumns: 2 }),
  t('aires-disque', 'aires', 'Disque', 'Aire = πr². Prenez π = 3,14.', 'Calculez l’aire. Prenez π = 3,14.', 'geo', { figure: 'circle', preferredColumns: 2 }),
  t('aires-carre-manquant', 'aires', 'Côté du carré', 'Retrouver le côté à partir de l’aire.', 'Calculez le côté.', 'geo', { figure: 'square', preferredColumns: 2 }),
  t('aires-rectangle-manquant', 'aires', 'Largeur du rectangle', 'Retrouver la largeur à partir de l’aire.', 'Calculez la largeur.', 'geo', { figure: 'rectangle', preferredColumns: 2 }),
  t('aires-triangle-manquant', 'aires', 'Hauteur du triangle', 'Retrouver la hauteur à partir de l’aire.', 'Calculez la hauteur.', 'geo', { figure: 'triangle', preferredColumns: 2 }),
  t('aires-parallelogramme-manquant', 'aires', 'Hauteur du parallélogramme', 'Retrouver la hauteur à partir de l’aire.', 'Calculez la hauteur.', 'geo', { figure: 'parallelogram', preferredColumns: 2 }),
  t('aires-losange-manquant', 'aires', 'Hauteur du losange', 'Retrouver la hauteur à partir de l’aire.', 'Calculez la hauteur.', 'geo', { figure: 'rhombus', preferredColumns: 2 }),
  t('aires-trapeze-manquant', 'aires', 'Hauteur du trapèze', 'Retrouver la hauteur à partir de l’aire.', 'Calculez la hauteur.', 'geo', { figure: 'trapezoid', preferredColumns: 2 }),
  t('aires-quadrilatere-manquant', 'aires', 'Côté de quadrilatère', 'Retrouver une mesure d’un quadrilatère à partir de l’aire.', 'Calculez la mesure demandée.', 'geo', { preferredColumns: 2 }),
  t('aires-disque-manquant', 'aires', 'Rayon du disque', 'Retrouver le rayon à partir de l’aire.', 'Calculez le rayon. Prenez π = 3,14.', 'geo', { figure: 'circle', preferredColumns: 2 }),
  t('aires-melange', 'aires', 'Mélanger', 'Toutes les formes, au hasard : aire ou mesure manquante.', 'Calculez l’aire ou la mesure demandée.', 'geo', { preferredColumns: 2 }),

  t('volumes-cube', 'volumes', 'Cube', 'Volume d’un cube.', 'Calculez le volume.', 'geo', { figure: 'cube', preferredColumns: 2 }),
  t('volumes-pave', 'volumes', 'Pavé droit', 'Volume L × l × h.', 'Calculez le volume.', 'geo', { figure: 'cuboid', preferredColumns: 2 }),
  t('volumes-quadrilatere', 'volumes', 'Quadrilatère', 'Volume des prismes à faces quadrilatères (cube, pavé). Hasard ou choix.', 'Calculez le volume.', 'geo', { preferredColumns: 2 }),
  t('volumes-cylindre', 'volumes', 'Cylindre', 'Volume = πr²h. Prenez π = 3,14.', 'Calculez le volume. Prenez π = 3,14.', 'geo', { figure: 'cylinder', preferredColumns: 2 }),
  t('volumes-cone', 'volumes', 'Cône', 'Volume = πr²h / 3. Prenez π = 3,14.', 'Calculez le volume. Prenez π = 3,14.', 'geo', { figure: 'cone', preferredColumns: 2 }),
  t('volumes-sphere', 'volumes', 'Sphère', 'Volume = 4πr³ / 3. Prenez π = 3,14.', 'Calculez le volume. Prenez π = 3,14.', 'geo', { figure: 'sphere', preferredColumns: 2 }),
  t('volumes-cube-manquant', 'volumes', 'Arête du cube', 'Retrouver l’arête à partir du volume.', 'Calculez l’arête.', 'geo', { figure: 'cube', preferredColumns: 2 }),
  t('volumes-pave-manquant', 'volumes', 'Hauteur du pavé', 'Retrouver la hauteur à partir du volume.', 'Calculez la hauteur.', 'geo', { figure: 'cuboid', preferredColumns: 2 }),
  t('volumes-quadrilatere-manquant', 'volumes', 'Mesure du quadrilatère', 'Retrouver une arête ou une hauteur d’un prisme à faces quadrilatères.', 'Calculez la mesure demandée.', 'geo', { preferredColumns: 2 }),
  t('volumes-cylindre-manquant', 'volumes', 'Hauteur du cylindre', 'Retrouver la hauteur à partir du volume.', 'Calculez la hauteur. Prenez π = 3,14.', 'geo', { figure: 'cylinder', preferredColumns: 2 }),
  t('volumes-cone-manquant', 'volumes', 'Hauteur du cône', 'Retrouver la hauteur à partir du volume.', 'Calculez la hauteur. Prenez π = 3,14.', 'geo', { figure: 'cone', preferredColumns: 2 }),
  t('volumes-melange', 'volumes', 'Mélanger', 'Tous les solides, au hasard.', 'Calculez le volume ou la mesure demandée.', 'geo', { preferredColumns: 2 }),

  t('reperage-lire', 'reperage', 'Lire des coordonnées', 'Lire les coordonnées de formes sur un tableau.', 'Écrivez les coordonnées de chaque forme.', 'geo', { preferredColumns: 2 }),
  t('reperage-placer', 'reperage', 'Placer des formes', 'Dessiner les formes sur un tableau vide à partir des coordonnées.', 'Dessinez chaque forme à l’emplacement indiqué.', 'geo', { preferredColumns: 2 }),
  t('reperage-cadrans-lire', 'reperage', 'Lire les 4 cadrans', 'Lire les coordonnées de points dans le plan (axes et cadrans).', 'Écrivez les coordonnées de chaque point.', 'geo', { preferredColumns: 1 }),
  t('reperage-cadrans-placer', 'reperage', 'Placer dans les 4 cadrans', 'Placer des points sur un repère vide à partir des coordonnées.', 'Placez chaque point à l’emplacement indiqué.', 'geo', { preferredColumns: 1 }),
  t('reperage-cadrans-libre', 'reperage', 'Composer les points', 'Grille sans axes : un point est donné, l’origine est à trouver, les autres points se lisent comme dans les cadrans.', 'Un point est donné avec ses coordonnées. Trouvez l’origine du repère, puis écrivez les coordonnées des autres points.', 'geo', { preferredColumns: 1 }),
  t(
    'reperage-droites',
    'reperage',
    'Lire les droites',
    'Lire intersections, intercepts et positions de droites colorées sur un repère.',
    'Observez les droites du repère. Répondez aux questions.',
    'geo',
    { preferredColumns: 2 },
  ),
  t(
    'reperage-construire',
    'reperage',
    'Construire sur le repère',
    'Grille vide avec deux points donnés : tracer droites, parallèles, figures et symétries.',
    'Placez les points demandés. Tracez les droites et les figures.',
    'geo',
    { preferredColumns: 2 },
  ),

  t(
    'transformations-axiale-figure',
    'transformations',
    'Type 1 — Symétrie axiale (figure)',
    'Figure fermée sur le repère : symétrie axiale par rapport à Ox ou Oy.',
    'La figure fermée est donnée. Construisez son image par la symétrie axiale demandée.',
    'geo',
    { preferredColumns: 1 },
  ),
  t(
    'transformations-centrale-figure',
    'transformations',
    'Type 2 — Symétrie centrale (figure)',
    'Figure fermée sur le repère : symétrie centrale par rapport à un point Ω.',
    'La figure fermée est donnée. Construisez son image par la symétrie centrale de centre Ω.',
    'geo',
    { preferredColumns: 1 },
  ),
  t(
    'transformations-axiale-placer',
    'transformations',
    'Type 3 — Placer puis symétrie axiale',
    'Un seul point est placé : colonne 1 = points à placer, colonne 2 = coordonnées des images (jusqu’à 10 points).',
    'Colonne 1 : placez les points et formez la figure. Colonne 2 : écrivez les coordonnées des nouveaux points.',
    'geo',
    { preferredColumns: 1 },
  ),
  t(
    'transformations-centrale-placer',
    'transformations',
    'Type 4 — Placer puis symétrie centrale',
    'Un seul point est placé : colonne 1 = points à placer, colonne 2 = coordonnées des images (jusqu’à 10 points).',
    'Colonne 1 : placez les points et formez la figure. Colonne 2 : écrivez les coordonnées des nouveaux points.',
    'geo',
    { preferredColumns: 1 },
  ),
  t('glossaire-algebre-mots', 'glossaire-algebre', 'Mots du glossaire', 'Définitions et schémas des termes d’algèbre (opérations, nombres…).', 'Lisez chaque mot, sa définition et le schéma.', 'texte', { preferredColumns: 2 }),
  t('glossaire-geometrie-mots', 'glossaire-geometrie', 'Mots du glossaire', 'Définitions et schémas des termes de géométrie (droite, segment, angle…).', 'Lisez chaque mot, sa définition et le schéma.', 'texte', { preferredColumns: 2 }),

  // —— Alphabétisation (ex-Lecture) ——
  ...ALPHABETISATION_EXERCISE_TYPES,

  // —— Gattegno (grammaire en couleur) ——
  t('phrase-tableau-categories', 'phrase-tableaux', 'Tableau des catégories', 'Tableau Gattegno avec les noms de catégories.', 'Repérez les catégories de la grammaire en couleur.', 'texte', { preferredColumns: 1 }),
  t('phrase-tableau-mots', 'phrase-tableaux', 'Tableau des mots', 'Tableau Gattegno avec des exemples de mots.', 'Repérez les mots selon leur catégorie.', 'texte', { preferredColumns: 1 }),
  t('phrase-tableau-vide', 'phrase-tableaux', 'Tableau vide', 'Structure vide du tableau Gattegno.', 'Observez la structure du tableau.', 'texte', { preferredColumns: 1 }),

  // —— Grilles de cartes (types partagés ; le thème porte le lexique) ——
  t(
    'jeux-vocabulaire',
    JEUX_LIBRE_TOPIC,
    'Vocabulaire',
    '9 cartes image / mot (grille 3×3), recto-verso.',
    '',
    'texte',
    { preferredColumns: 1 },
  ),
  t(
    'jeux-devinettes',
    JEUX_LIBRE_TOPIC,
    'Devinettes',
    '9 cartes : mot + image au recto, une phrase-indice au verso.',
    '',
    'texte',
    { preferredColumns: 1 },
  ),
  t(
    'jeux-memory',
    JEUX_LIBRE_TOPIC,
    'Mémory',
    '4 paires image / mot (grille 3×3) ; verso série.',
    '',
    'texte',
    { preferredColumns: 1 },
  ),
  t(
    'jeux-loto',
    JEUX_LIBRE_TOPIC,
    'Loto',
    '15 grilles 3×3, verso thème, lot animateur 27 mots (image à gauche, mot à droite).',
    '',
    'texte',
    { preferredColumns: 1 },
  ),
  t(
    'jeux-intrus',
    JEUX_LIBRE_TOPIC,
    'Intrus',
    'Mots du thème · 9 cartes (4 + 1 intrus) ; verso série.',
    '',
    'texte',
    { preferredColumns: 1 },
  ),
  t(
    'jeux-dominos',
    JEUX_LIBRE_TOPIC,
    'Dominos',
    '16 dominos image / mot (grille 2×8) ; verso série.',
    '',
    'texte',
    { preferredColumns: 1 },
  ),

  // —— Calligraphie (types partagés ; le thème porte le lexique) ——
  t(
    'calli-mots',
    CALLI_LIBRE_TOPIC,
    'Mots',
    'Mots (ou phrases saisies) sur une bande 4 lignes — même hauteur qu’une bande phrases ; Générer tire des mots.',
    'Recopiez chaque ligne en écriture cursive sur la même bande.',
    'texte',
    { preferredColumns: 1 },
  ),
  t(
    'calli-phrases',
    CALLI_LIBRE_TOPIC,
    'Juste phrases',
    'Phrase modèle sur 4 lignes, puis bande vide pour recopier (4 / 5 / 6 blocs selon la taille).',
    'Recopiez chaque phrase en écriture cursive.',
    'texte',
    { preferredColumns: 1 },
  ),
  // Alias historiques (anciennes fiches / URLs).
  t(
    'calli-6-lignes',
    CALLI_LIBRE_TOPIC,
    'Mots',
    'Mots (ou phrases saisies) sur une bande 4 lignes — même hauteur qu’une bande phrases ; Générer tire des mots.',
    'Recopiez chaque ligne en écriture cursive sur la même bande.',
    'texte',
    { preferredColumns: 1 },
  ),
  t(
    'calli-4-lignes',
    CALLI_LIBRE_TOPIC,
    'Juste phrases',
    'Phrase modèle sur 4 lignes, puis bande vide pour recopier (4 / 5 / 6 blocs selon la taille).',
    'Recopiez chaque phrase en écriture cursive.',
    'texte',
    { preferredColumns: 1 },
  ),
  ...TCF_EXERCISE_TYPES,
  ...GRAMMAIRE_EXERCISE_TYPES,
  ...VOCABULAIRE_EXERCISE_TYPES,
  ...SOCIETE_EXERCISE_TYPES,
  ...SANTE_EXERCISE_TYPES,
  ...ACM_EXERCISE_TYPES,
  ...LOGIQUE_EXERCISE_TYPES,
  ...TCM_CSC_EXERCISE_TYPES,
  ...TCM_CFR_EXERCISE_TYPES,
]

/** Soutien FR : 17 types × chaque lettre / son (thèmes Voyelles → Sons complexes). */
for (const def of allSoutienBankDefs()) {
  for (const kind of SOUTIEN_KINDS) {
    exerciseTypes.push(
      t(
        `soutien-${def.sound.bankId}-${kind.id}`,
        def.themeId,
        kind.label,
        kind.description.replace('le son', `le son ${def.sound.phoneme}`),
        kind.instruction,
        'texte',
        { preferredColumns: kind.preferredColumns },
      ),
    )
  }
}

const PHRASE_THEMES = [
  { topic: 'phrase-simple', label: 'Simple' },
  { topic: 'phrase-negation', label: 'Négation simple' },
  { topic: 'phrase-adjectif', label: 'Adjectif' },
  { topic: 'phrase-negation-adjectif', label: 'Négation avec adjectif' },
  { topic: 'phrase-determinants', label: 'Déterminants' },
  { topic: 'phrase-negation-determinants', label: 'Négation déterminants' },
  { topic: 'phrase-preposition', label: 'Préposition' },
  { topic: 'phrase-negation-preposition', label: 'Négation prépositions' },
  { topic: 'phrase-adverbe', label: 'Adverbe' },
  { topic: 'phrase-negation-adverbe', label: 'Négation avec adverbe' },
  { topic: 'phrase-conjonctions', label: 'Conjonctions' },
] as const

for (const theme of PHRASE_THEMES) {
  exerciseTypes.push(
    t(
      `${theme.topic}-colorier`,
      theme.topic,
      'Colorier les pastilles',
      'Phrase avec pastilles à colorier selon la catégorie Gattegno.',
      'Coloriez chaque mot selon sa catégorie.',
      'texte',
      { preferredColumns: 1 },
    ),
    t(
      `${theme.topic}-ordre`,
      theme.topic,
      'Remettre dans l’ordre',
      'Mots colorés à remettre dans l’ordre pour former la phrase.',
      'Mettez dans l’ordre les mots. Pensez à la majuscule et au point.',
      'texte',
      { preferredColumns: 1 },
    ),
    t(
      `${theme.topic}-construire`,
      theme.topic,
      'Écrire selon les pastilles',
      'Verbe donné + séquence de pastilles logique pour écrire une phrase.',
      'Écrivez les phrases selon la couleur du mot.',
      'texte',
      { preferredColumns: 1 },
    ),
    t(
      `${theme.topic}-ecrire`,
      theme.topic,
      'Production écrite',
      'Consigne de production avec lignes pour écrire des phrases.',
      'Écrivez des phrases.',
      'texte',
      { preferredColumns: 1 },
    ),
  )
}

export const exerciseTypeById = Object.fromEntries(exerciseTypes.map((type) => [type.id, type])) as Record<string, ExerciseType>

const JEUX_CARD_TYPE_IDS = [
  'jeux-vocabulaire',
  'jeux-devinettes',
  'jeux-memory',
  'jeux-loto',
  'jeux-intrus',
  'jeux-dominos',
] as const

export function typesForTopic(topic: string, track?: FrenchTrack): ExerciseType[] {
  if (topic.startsWith('calli-')) {
    const mots = exerciseTypeById['calli-mots']
    const phrases = exerciseTypeById['calli-phrases']
    if (mots && phrases) {
      return [
        { ...mots, topic },
        { ...phrases, topic },
      ]
    }
  }
  if (isJeuxTopicId(topic)) {
    return JEUX_CARD_TYPE_IDS.map((id) => exerciseTypeById[id])
      .filter((type): type is ExerciseType => Boolean(type))
      .map((type) => ({ ...type, topic }))
  }
  return exerciseTypes.filter((type) => type.topic === topic && (track == null || type.track === track))
}

export function isQuadExercise(typeId: string): boolean {
  return typeId.includes('-quadrilatere')
}

export function isDraftPadExercise(typeId: string): boolean {
  return (
    typeId.includes('problemes') ||
    typeId.startsWith('equations-') ||
    typeId.startsWith('perimetres-') ||
    typeId.startsWith('aires-') ||
    typeId.startsWith('volumes-') ||
    // TPM : géométrie périmètre/aire, priorité, réduction, évaluation, équations.
    // Pas de grille pour ops décimales / puissances / relatifs / fractions (ex. 26, 27, 29, 30).
    typeId.includes('peri-aire') ||
    typeId === 'tpm-expressions-reduire' ||
    typeId === 'tpm-expressions-evaluer' ||
    typeId === 'tpm-equations' ||
    typeId === 'expressions-substituer' ||
    typeId === 'tpm-priorite-ops' ||
    typeId === 'tcm-cfr-ex14' ||
    typeId === 'tcm-cfr-ex15' ||
    typeId === 'tcm-cfr-ex22' ||
    typeId === 'tcm-cfr-ex23' ||
    typeId === 'tcm-cfr-ex24' ||
    typeId === 'tcm-cfr-ex25' ||
    typeId === 'tcm-cfr-ex26'
  )
}

export function firstTypeFor(domain: Domain, topic?: string, track?: FrenchTrack): ExerciseType {
  if (topic) {
    const list = typesForTopic(topic, track)
    if (list[0]) return list[0]
    const any = typesForTopic(topic)
    if (any[0]) return any[0]
  }
  const fallbackTopic =
    domain === 'algèbre' || domain === 'tpm' || domain === 'français'
        ? 'addition'
        : domain === 'géométrie'
          ? 'aires'
          : domain === 'gattegno'
            ? 'phrase-simple'
            : domain === 'grammaire'
              ? 'gram-se-presenter'
              : domain === 'vocabulaire'
                ? 'vocabulaire-a-venir'
                : domain === 'société'
                  ? 'societe-suisse'
                  : domain === 'santé'
                    ? 'sante-a-venir'
                    : domain === 'acm'
                      ? 'acm-a-venir'
                      : domain === 'logique'
                        ? 'logique-suite-graphique'
                        : domain === 'tcm-csc'
                        ? 'tcm-csc-a-venir'
                        : domain === 'tcm-cfr'
                          ? 'tcm-cfr-info'
                          : domain === 'jeux'
                            ? JEUX_LIBRE_TOPIC
                            : domain === 'calligraphie'
                              ? CALLI_LIBRE_TOPIC
                              : domain === 'soutien-fr'
                                ? 'soutien-voyelles'
                                : domain === 'alphabetisation'
                                  ? 'alpha-voyelles'
                                  : domain === 'tcf'
                                    ? 'tcf-ce'
                                    : 'addition'
  return typesForTopic(fallbackTopic)[0]!
}

export function defaultPage(domain: Domain = 'algèbre'): PageConfigLike {
  const type = firstTypeFor(domain)
  const count =
    domain === 'jeux' ||
    domain === 'calligraphie' ||
    domain === 'tcf' ||
    domain === 'grammaire' ||
    domain === 'vocabulaire' ||
    domain === 'société' ||
    domain === 'santé' ||
    domain === 'acm' ||
    domain === 'tcm-csc' ||
    domain === 'tcm-cfr'
      ? 1
      : domain === 'logique'
        ? 6
        : domain === 'alphabetisation' || domain === 'soutien-fr' || domain === 'gattegno'
          ? 6
          : isDraftPadExercise(type.id)
              ? 2
              : 8
  const gameEntries = domain === 'jeux' ? defaultEntriesFor(type.id) : undefined
  const calliText = domain === 'calligraphie' ? defaultCalliText(type.id) : undefined
  return {
    domain,
    topic: type.topic,
    exerciseType: type.id,
    difficulty: 'moyen',
    count,
    columns: type.preferredColumns ?? 2,
    track: type.track,
    problemDraftGrids: isDraftPadExercise(type.id)
      ? Array.from({ length: count }, () => true)
      : undefined,
    oralAnswerModes: type.id.includes('-com-orale')
      ? Array.from({ length: count }, () => 'qcm' as const)
      : undefined,
    gameEntries,
    gameText: gameEntries ? entriesToText(type.id, gameEntries) : undefined,
    calliText,
    calliFont: domain === 'calligraphie' ? DEFAULT_CALLI_FONT : undefined,
    calliSize: domain === 'calligraphie' ? DEFAULT_CALLI_SIZE : undefined,
  }
}

type PageConfigLike = {
  domain: Domain
  topic: string
  exerciseType: string
  difficulty: Difficulty
  count: number
  columns: number
  track?: FrenchTrack
  problemDraftGrids?: boolean[]
  oralAnswerModes?: Array<'qcm' | 'text' | 'images'>
  gameEntries?: Array<{
    text: string
    imageSrc?: string
    clues?: string[]
    category?: string
    isIntrus?: boolean
    isTrue?: boolean
  }>
  gameText?: string
  calliText?: string
  calliFont?: string
  calliSize?: string
}
