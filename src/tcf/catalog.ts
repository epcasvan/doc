import type { Difficulty, ExerciseType, Topic } from '@/math/types'
import type { TcfCompetence, TcfNiveau, TcfTypeExercice, TcfTypeReponse } from './types'

export const TCF_DOMAIN = 'tcf' as const
export const TCF_DOCUMENT_TITLE = 'Test de connaissances de français'

/** Niveau TCF ↔ réglage « Niveau » existant (facile / moyen / avancé). */
export const TCF_NIVEAUX: ReadonlyArray<{ id: TcfNiveau; difficulty: Difficulty; dossier: string }> = [
  { id: 'A0-A1', difficulty: 'facile', dossier: 'a0-a1' },
  { id: 'A1-A2', difficulty: 'moyen', dossier: 'a1-a2' },
  { id: 'A2-B1', difficulty: 'avance', dossier: 'a2-b1' },
]

export function tcfNiveauFromDifficulty(difficulty: Difficulty | undefined): TcfNiveau {
  return TCF_NIVEAUX.find((n) => n.difficulty === difficulty)?.id ?? 'A0-A1'
}

export function tcfDifficultyFromNiveau(niveau: TcfNiveau): Difficulty {
  return TCF_NIVEAUX.find((n) => n.id === niveau)?.difficulty ?? 'facile'
}

export const TCF_COMPETENCES: ReadonlyArray<{ id: TcfCompetence; label: string; topic: string }> = [
  { id: 'CO', label: 'Compréhension orale (CO)', topic: 'tcf-co' },
  { id: 'CE', label: 'Compréhension écrite (CE)', topic: 'tcf-ce' },
  { id: 'PE', label: 'Production écrite (PE)', topic: 'tcf-pe' },
  { id: 'PO', label: 'Production orale (PO)', topic: 'tcf-po' },
]

export const TCF_REPONSES: ReadonlyArray<{ id: TcfTypeReponse; label: string }> = [
  { id: 'qcm_texte', label: 'QCM texte' },
  { id: 'qcm_image', label: 'QCM images' },
  { id: 'lignes', label: 'Lignes (phrase réponse)' },
]

type TcfTypeMeta = {
  /** Id du type dans le catalogue général (`exerciseTypes`). */
  typeId: string
  competence: TcfCompetence
  typeExercice: TcfTypeExercice
  label: string
  description: string
  instruction: string
  /** Types de réponse proposés (CE / CO), vide = pas de questions saisies. */
  reponses: readonly TcfTypeReponse[]
}

const ALL_REPONSES = ['qcm_texte', 'qcm_image', 'lignes'] as const

export const TCF_TYPES: readonly TcfTypeMeta[] = [
  // —— CE ——
  {
    typeId: 'tcf-ce-sms',
    competence: 'CE',
    typeExercice: 'sms',
    label: 'Message (SMS)',
    description: 'Lire un court message et répondre aux questions.',
    instruction: 'Lisez le message, puis répondez aux questions.',
    reponses: ALL_REPONSES,
  },
  {
    typeId: 'tcf-ce-email',
    competence: 'CE',
    typeExercice: 'email',
    label: 'E-mail',
    description: 'Lire un e-mail et répondre aux questions.',
    instruction: 'Lisez l’e-mail, puis répondez aux questions.',
    reponses: ALL_REPONSES,
  },
  {
    typeId: 'tcf-ce-annonce',
    competence: 'CE',
    typeExercice: 'annonce',
    label: 'Annonce / information',
    description: 'Lire une annonce ou une information et répondre aux questions.',
    instruction: 'Lisez le document, puis répondez aux questions.',
    reponses: ALL_REPONSES,
  },
  // —— CO ——
  {
    typeId: 'tcf-co-images',
    competence: 'CO',
    typeExercice: 'images_a_reconnaitre',
    label: 'Audio · images à reconnaître',
    description: 'Écouter un audio et cocher les images qui correspondent (5 images).',
    instruction: 'Écoutez et cochez les images qui correspondent.',
    reponses: [],
  },
  {
    typeId: 'tcf-co-six-courts',
    competence: 'CO',
    typeExercice: 'six_courts',
    label: '6 audios courts',
    description: 'Un audio partagé en 6 courts extraits, avec une ou plusieurs questions par extrait.',
    instruction: 'Écoutez chaque extrait, puis répondez aux questions.',
    reponses: ALL_REPONSES,
  },
  {
    typeId: 'tcf-co-trois-moyens',
    competence: 'CO',
    typeExercice: 'trois_moyens',
    label: '3 audios moyens',
    description: 'Un audio partagé en 3 extraits moyens, avec des questions par extrait.',
    instruction: 'Écoutez chaque extrait, puis répondez aux questions.',
    reponses: ALL_REPONSES,
  },
  {
    typeId: 'tcf-co-complet',
    competence: 'CO',
    typeExercice: 'complet',
    label: 'Audio complet',
    description: 'Un document audio complet, avec questions.',
    instruction: 'Écoutez le document, puis répondez aux questions.',
    reponses: ALL_REPONSES,
  },
  {
    typeId: 'tcf-co-association',
    competence: 'CO',
    typeExercice: 'association_images',
    label: 'Dialogues · situations illustrées',
    description: 'Écouter plusieurs dialogues et noter le numéro du dialogue sous la situation (une image de trop).',
    instruction: 'Observez les situations et écoutez les dialogues. Notez le numéro du dialogue sous l’image.',
    reponses: [],
  },
  // —— PE ——
  {
    typeId: 'tcf-pe-formulaire',
    competence: 'PE',
    typeExercice: 'formulaire',
    label: 'Formulaire',
    description: 'Remplir un formulaire (champs libres).',
    instruction: 'Remplissez le formulaire.',
    reponses: [],
  },
  {
    typeId: 'tcf-pe-image',
    competence: 'PE',
    typeExercice: 'image_question',
    label: 'Image + question',
    description: 'Regarder une image et écrire quelques mots.',
    instruction: 'Regardez l’image et répondez par écrit.',
    reponses: [],
  },
  {
    typeId: 'tcf-pe-sms',
    competence: 'PE',
    typeExercice: 'sms_reponse',
    label: 'Répondre à un SMS',
    description: 'Lire un SMS et y répondre.',
    instruction: 'Lisez le message et répondez.',
    reponses: [],
  },
  {
    typeId: 'tcf-pe-email',
    competence: 'PE',
    typeExercice: 'email_reponse',
    label: 'Répondre à un e-mail',
    description: 'Lire un e-mail et y répondre.',
    instruction: 'Lisez l’e-mail et répondez.',
    reponses: [],
  },
  {
    typeId: 'tcf-pe-question',
    competence: 'PE',
    typeExercice: 'question_texte',
    label: 'Question / texte',
    description: 'Rédiger un texte à partir d’une question.',
    instruction: 'Lisez la question et rédigez votre texte.',
    reponses: [],
  },
  {
    typeId: 'tcf-pe-dialogue',
    competence: 'PE',
    typeExercice: 'dialogue_a_completer',
    label: 'Dialogue à compléter',
    description: 'Écrire ses répliques dans un dialogue (répliques de l’interlocuteur données).',
    instruction: 'Complétez le dialogue.',
    reponses: [],
  },
  // —— PO ——
  {
    typeId: 'tcf-po-mots-theme',
    competence: 'PO',
    typeExercice: 'mots_theme',
    label: 'Mots / thème : poser des questions',
    description: 'À partir de mots ou d’un thème, poser des questions à l’examinateur·trice.',
    instruction: 'Posez des questions à partir des mots proposés.',
    reponses: [],
  },
  {
    typeId: 'tcf-po-entretien',
    competence: 'PO',
    typeExercice: 'entretien',
    label: 'Entretien dirigé',
    description: 'Répondre aux questions de l’examinateur·trice sur soi (questions au corrigé).',
    instruction:
      'Entretien dirigé. Vous saluez l’examinateur et vous répondez à ses questions sur vous : votre identité, votre famille, votre logement, vos activités et vos goûts.',
    reponses: [],
  },
  {
    typeId: 'tcf-po-trois-themes',
    competence: 'PO',
    typeExercice: 'trois_themes',
    label: '3 thèmes en images : poser des questions',
    description: 'Trois thèmes tirés au hasard, 4 images chacun : l’élève pose des questions à l’examinateur·trice.',
    instruction: 'Voici trois thèmes. Choisissez un thème et posez des questions à l’examinateur sur ce sujet.',
    reponses: [],
  },
  {
    typeId: 'tcf-po-image-interaction',
    competence: 'PO',
    typeExercice: 'image_interaction',
    label: 'Image à décrire et interaction',
    description: 'Décrire une image, puis jouer une situation sur le même sujet (déroulement au corrigé).',
    instruction: 'Regardez l’image et décrivez-la. Ensuite, vous jouez une situation avec l’examinateur sur ce sujet.',
    reponses: [],
  },
  {
    typeId: 'tcf-po-sequence',
    competence: 'PO',
    typeExercice: 'sequence_4_images',
    label: '4 images en séquence',
    description: 'Décrire et raconter une séquence de 4 images.',
    instruction: 'Regardez les images et racontez l’histoire.',
    reponses: [],
  },
  {
    typeId: 'tcf-po-image',
    competence: 'PO',
    typeExercice: 'image_unique',
    label: 'Image unique',
    description: 'Décrire une image.',
    instruction: 'Regardez l’image et décrivez-la.',
    reponses: [],
  },
  {
    typeId: 'tcf-po-dialogue',
    competence: 'PO',
    typeExercice: 'dialogue',
    label: 'Dialogue',
    description: 'Jouer un dialogue (lignes pour l’élève, dialogue proposé au corrigé).',
    instruction: 'Lisez la situation et jouez le dialogue.',
    reponses: [],
  },
]

export const tcfTypeByTypeId: Readonly<Record<string, TcfTypeMeta>> = Object.fromEntries(
  TCF_TYPES.map((meta) => [meta.typeId, meta]),
)

export function isTcfType(typeId: string | undefined): boolean {
  return typeId != null && typeId in tcfTypeByTypeId
}

export function tcfTypeMeta(competence: TcfCompetence, typeExercice: TcfTypeExercice): TcfTypeMeta | undefined {
  return TCF_TYPES.find((m) => m.competence === competence && m.typeExercice === typeExercice)
}

/**
 * Emplacement du générateur : une compétence, et pour la CO le numéro
 * d’exercice annoncé dans l’audio (« Exercice 1 »…). Le contenu vient de la banque.
 */
export type TcfSlotMeta = {
  typeId: string
  competence: TcfCompetence
  numero?: number
  label: string
  description: string
  instruction: string
}

export const TCF_CO_NUMEROS = [1, 2, 3, 4, 5] as const

const CE_A1 = [
  'Suivre des instructions simples',
  'Lire pour s’orienter dans l’espace',
  'Lire pour s’orienter dans le temps',
  'Lire pour s’informer',
] as const

const CE_A1_POINTS = [6, 6, 6, 7] as const

const CE_A1_DESC = [
  'Domaine personnel. Lettre, carte postale, courriel, carte d’invitation ou mode d’emploi. Questionnaire de 5 questions, 6 points.',
  'Domaine public. Affiche, publicité, brochure, horaires, prospectus ou panneau d’affichage. Questionnaire de 5 questions, 6 points.',
  'Domaine professionnel. Courrier, instructions, mode d’emploi, brochure ou programme. Questionnaire de 5 questions, 6 points.',
  'Domaine éducationnel ou public. Affiche, brochure, programme d’un événement ou article de presse. Questionnaire de 5 questions, 7 points.',
] as const

const CE_A2 = [
  'Lire pour s’orienter',
  'Lire une correspondance',
  'Lire des instructions',
  'Lire pour s’informer',
] as const

const CO_DEROULE = [
  'A1 : identifier un événement (messages, questionnaire). A2 : comprendre des annonces et des instructions (6 QCM).',
  'A1 : identifier une activité (météo, radio, annonces). A2 : comprendre une émission de radio (6 QCM).',
  'A1 : comprendre des instructions (messages). A2 : comprendre un message sur répondeur (6 QCM).',
  'A1 : identifier des situations (dialogues et images). A2 : comprendre une discussion (appariement).',
  'A1 : identifier des objets (messages et images). En A2, l’oral s’arrête à l’exercice 4.',
] as const

export const TCF_SLOTS: readonly TcfSlotMeta[] = [
  ...TCF_CO_NUMEROS.map((numero) => ({
    typeId: `tcf-co-ex-${numero}`,
    competence: 'CO' as const,
    numero,
    label: `Exercice ${numero}`,
    description: CO_DEROULE[numero - 1] ?? `Compréhension orale : exercice ${numero}.`,
    instruction: 'Écoutez le document, puis répondez aux questions.',
  })),
  ...([1, 2, 3, 4] as const).map((numero) => ({
    typeId: `tcf-ce-ex-${numero}`,
    competence: 'CE' as const,
    numero,
    label: `Exercice ${numero}`,
    description: CE_A1_DESC[numero - 1]!,
    instruction: 'Lisez le document. Cochez la bonne réponse.',
  })),
  {
    typeId: 'tcf-pe',
    competence: 'PE',
    label: 'Exercices de production écrite',
    description: 'Tous les exercices de production écrite de la banque.',
    instruction: 'Répondez par écrit.',
  },
  {
    typeId: 'tcf-po',
    competence: 'PO',
    label: 'Exercices de production orale',
    description: 'Tous les exercices de production orale de la banque.',
    instruction: 'Préparez-vous pour l’épreuve orale.',
  },
]

const TCF_CE_LEGACY: TcfSlotMeta = {
  typeId: 'tcf-ce',
  competence: 'CE',
  label: 'Exercices de compréhension écrite',
  description: 'Ancien emplacement unique de compréhension écrite.',
  instruction: 'Lisez le document, puis répondez aux questions.',
}

export const tcfSlotByTypeId: Readonly<Record<string, TcfSlotMeta>> = {
  ...Object.fromEntries(TCF_SLOTS.map((slot) => [slot.typeId, slot])),
  [TCF_CE_LEGACY.typeId]: TCF_CE_LEGACY,
}

/** Libellé du menu Exercice pour la compréhension écrite, selon le niveau. */
export function tcfMenuLabel(typeId: string, niveau: TcfNiveau): string | undefined {
  const slot = tcfSlotByTypeId[typeId]
  if (!slot || slot.competence !== 'CE' || slot.numero == null) return undefined
  if (niveau === 'A0-A1') {
    const name = CE_A1[slot.numero - 1]
    const points = CE_A1_POINTS[slot.numero - 1]
    return name ? `Exercice ${slot.numero} · ${name} (${points} points)` : undefined
  }
  if (niveau === 'A1-A2') {
    const name = CE_A2[slot.numero - 1]
    return name ? `Exercice ${slot.numero} · ${name}` : undefined
  }
  return `Exercice ${slot.numero}`
}

/** Scénarios qui regroupent les exercices de chaque compétence dans le sélecteur. */
export const TCF_SCENARIOS: ReadonlyArray<{ id: string; label: string }> = [
  { id: 'loisirs', label: 'Les loisirs' },
  { id: 'ecole', label: 'L’école' },
  { id: 'lieux-publics', label: 'Les lieux publics' },
  { id: 'magasins', label: 'Les magasins' },
  { id: 'radio', label: 'La radio' },
  { id: 'maison', label: 'La maison' },
  { id: 'vie-quotidienne', label: 'La vie quotidienne' },
  { id: 'vacances', label: 'Les vacances' },
  { id: 'travail', label: 'Le travail' },
  { id: 'sante', label: 'La santé' },
  { id: 'transports', label: 'Les transports' },
  { id: 'fetes', label: 'Les fêtes et invitations' },
  { id: 'actualite', label: 'L’actualité' },
]

export const TCF_SCENARIO_AUTRE = { id: 'autre', label: 'Autres' } as const

export function tcfScenarioLabel(id: string | undefined): string {
  return TCF_SCENARIOS.find((s) => s.id === id)?.label ?? TCF_SCENARIO_AUTRE.label
}

/** Numéro de l’exercice dans son document d’origine (`…-co-3`, `…-po-2b` → 3, 2). */
export function tcfPosition(id: string): number | undefined {
  const part = id.match(/-ex(\d+)-/)
  if (part) return Number(part[1])
  const match = id.match(/-(?:co|ce|pe|po)-(\d)[a-z]?$/)
  return match ? Number(match[1]) : undefined
}

/** Page 1 du test : informations et consignes (non notée). */
export const TCF_CONSIGNES_TYPE = 'tcf-consignes'
export const TCF_INFO_TOPIC = 'tcf-info'

export function isTcfConsignesType(typeId: string | undefined): boolean {
  return typeId === TCF_CONSIGNES_TYPE
}

/** Thèmes du catalogue général = Informations + compétences. */
export const TCF_TOPICS: Topic[] = [
  { id: TCF_INFO_TOPIC, label: 'Informations', domain: TCF_DOMAIN },
  ...TCF_COMPETENCES.map((c) => ({ id: c.topic, label: c.label, domain: TCF_DOMAIN })),
]

/** Types du catalogue général (page Informations + emplacements par compétence). */
export const TCF_EXERCISE_TYPES: ExerciseType[] = [
  {
    id: TCF_CONSIGNES_TYPE,
    topic: TCF_INFO_TOPIC,
    label: 'Informations du test',
    description: 'Page d’informations : les quatre parties du test.',
    instruction: '',
    visual: 'texte',
    preferredColumns: 1,
  },
  ...TCF_SLOTS.map((slot) => ({
    id: slot.typeId,
    topic: TCF_COMPETENCES.find((c) => c.id === slot.competence)!.topic,
    label: slot.label,
    description: slot.description,
    instruction: slot.instruction,
    visual: 'texte' as const,
    preferredColumns: 1,
  })),
]
