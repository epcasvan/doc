/**
 * TCF — Test de connaissances de français.
 * Types des exercices saisis par l’admin et stockés en JSON
 * (`src/tcf/content/{a0-a1,a1-a2,a2-b1}/{ce,co,pe,po}.json`).
 * Unions discriminées sur `competence`, `type_exercice` et `type_reponse`.
 */

export type TcfNiveau = 'A0-A1' | 'A1-A2' | 'A2-B1'
export type TcfCompetence = 'CE' | 'CO' | 'PE' | 'PO'
export type TcfTypeReponse = 'qcm_texte' | 'qcm_image' | 'lignes'

// —— Questions (CE / CO) ——

export type TcfChoixTexte = { id: string; texte: string; correct?: boolean; fixe?: boolean }
export type TcfChoixImage = { id: string; image: string; correct?: boolean; fixe?: boolean }

/** Variante QCM texte stockée hors de la forme active. */
export type TcfFormeQcmTexte = { melanger?: boolean; choix: TcfChoixTexte[] }
/** Variante QCM image stockée hors de la forme active. */
export type TcfFormeQcmImage = { melanger?: boolean; choix: TcfChoixImage[] }
/** Variante « phrase / lignes » stockée hors de la forme active. */
export type TcfFormeLignes = {
  nb_lignes?: number
  reponse_modele?: string
  tableau?: TcfLigneTableau[]
}

export type TcfQuestionFormes = {
  qcm_texte?: TcfFormeQcmTexte
  qcm_image?: TcfFormeQcmImage
  lignes?: TcfFormeLignes
}

type TcfQuestionBase = {
  /** Énoncé affiché au-dessus de la réponse. */
  enonce: string
  /** CO six_courts / trois_moyens : n° de l’audio concerné (1-based). */
  audio?: number
  /** Barème de la question (sinon « points par question » de la page). */
  points?: number
  /** Image affichée sous l’énoncé (plan à compléter, document…). */
  image?: string
  /**
   * Autres formes de réponse (Texte / Image / Phrase) en plus de `type_reponse`.
   * Sur la fiche, les 3 icônes sont en marge gauche ; seules les formes remplies sont actives.
   */
  formes?: TcfQuestionFormes
}

export type TcfQuestionQcmTexte = TcfQuestionBase & {
  type_reponse: 'qcm_texte'
  /** Défaut true ; false = ordre fixe. */
  melanger?: boolean
  choix: TcfChoixTexte[]
}

export type TcfQuestionQcmImage = TcfQuestionBase & {
  type_reponse: 'qcm_image'
  melanger?: boolean
  choix: TcfChoixImage[]
}

export type TcfQuestionLignes = TcfQuestionBase & {
  type_reponse: 'lignes'
  /** Traits pleine largeur (défaut 2 ; 0 si image ou tableau seuls). */
  nb_lignes?: number
  reponse_modele?: string
  /** Tableau à compléter : libellé à gauche, case vide à droite (réponse au corrigé). */
  tableau?: TcfLigneTableau[]
}

export type TcfLigneTableau = { label: string; reponse: string }

export type TcfQuestion = TcfQuestionQcmTexte | TcfQuestionQcmImage | TcfQuestionLignes

/** Sélecteur de forme sur la fiche (marge Texte / Image / Phrase). */
export type TcfFormSelect = {
  active: TcfTypeReponse
  filled: TcfTypeReponse[]
  variants: Partial<
    Record<
      TcfTypeReponse,
      {
        kind: 'qcm' | 'lignes'
        mode?: 'texte' | 'image'
        choix?: TcfChoixRendu[]
        nbLignes?: number
        reponseModele?: string
        tableau?: TcfLigneTableau[]
        answer: string
      }
    >
  >
}

/** Bornes de mots (production écrite). 0 = non précisé. */
export type TcfNbMots = { min?: number; max?: number }

// —— Enveloppe commune ——

type TcfBase<C extends TcfCompetence, T extends string, S> = {
  id: string
  niveau: TcfNiveau
  competence: C
  type_exercice: T
  theme?: string
  /** Id de `TCF_SCENARIOS` (loisirs, école…). */
  scenario?: string
  /** Scène affichée dans le sélecteur (« À la plage ») ; numérotée si elle se répète. */
  scene?: string
  /** Consigne affichée sous le titre (sinon consigne du type). */
  consigne?: string
  support: S
  questions: TcfQuestion[]
  /** PE sms / email / question : petit bloc sous le texte. */
  consigne_supplementaire?: string | null
  /** Barème des exercices sans questions (formulaire, écriture, oral, images). */
  points?: number
}

// —— CE ——

export type TcfCeSms = TcfBase<'CE', 'sms', { expediteur: string; texte: string }>
export type TcfCeEmail = TcfBase<'CE', 'email', { de: string; a: string; objet: string; texte: string }>
export type TcfCeAnnonce = TcfBase<'CE', 'annonce', { titre: string; texte: string; image: string | null }>
export type TcfCeExercise = TcfCeSms | TcfCeEmail | TcfCeAnnonce

// —— CO ——

export type TcfImageACocher = { id: string; image: string; correct: boolean; fixe?: boolean }

export type TcfCoImages = TcfBase<'CO', 'images_a_reconnaitre', { audio: string }> & {
  melanger?: boolean
  /** par_image : 1 point par image juste ; tout_ou_rien : les 5 justes. */
  score?: 'par_image' | 'tout_ou_rien'
  /** Exactement 5 images. */
  images: TcfImageACocher[]
}
export type TcfCoSixCourts = TcfBase<'CO', 'six_courts', { audios: string[] }>
export type TcfCoTroisMoyens = TcfBase<'CO', 'trois_moyens', { audios: string[] }>
export type TcfCoComplet = TcfBase<'CO', 'complet', { audio: string; transcription: string }>

/** Une situation illustrée ; `dialogue` = n° du dialogue qui correspond (null = aucun). */
export type TcfSituation = { id: string; image: string; dialogue: number | null }
export type TcfCoAssociation = TcfBase<
  'CO',
  'association_images',
  { audio: string; nb_dialogues: number; transcription?: string }
> & {
  situations: TcfSituation[]
}
export type TcfCoExercise = TcfCoImages | TcfCoSixCourts | TcfCoTroisMoyens | TcfCoComplet | TcfCoAssociation

// —— PE ——

export type TcfChampType = 'texte' | 'date' | 'choix' | 'case'
export type TcfChampFormulaire = {
  label: string
  type: TcfChampType
  /** Type « choix » : options proposées (cases à cocher). */
  options?: string[]
  /** Réponse attendue (corrigé). */
  corrige: string
}

export type TcfPeFormulaire = TcfBase<'PE', 'formulaire', { titre?: string; champs: TcfChampFormulaire[] }>
export type TcfPeImageQuestion = TcfBase<
  'PE',
  'image_question',
  {
    image: string
    /** Photos vocabulaire numérotées (à la place d’une planche illustrée). */
    images?: string[]
    consigne: string
    nb_mots: TcfNbMots
    reponse_modele?: string
  }
>
export type TcfPeSmsReponse = TcfBase<
  'PE',
  'sms_reponse',
  { expediteur?: string; sms_recu: string; consigne: string; nb_mots: TcfNbMots; reponse_modele?: string }
>
export type TcfPeEmailReponse = TcfBase<
  'PE',
  'email_reponse',
  {
    email_recu: { de: string; objet: string; texte: string }
    consigne: string
    nb_mots: TcfNbMots
    reponse_modele?: string
  }
>
export type TcfPeQuestionTexte = TcfBase<
  'PE',
  'question_texte',
  {
    consigne: string
    nb_mots: TcfNbMots
    reponse_modele?: string
    /** Message à écrire présenté comme un e-mail (destinataire et objet imposés). */
    email?: { a: string; objet: string }
  }
>
/** Dialogue écrit : répliques de l’interlocuteur données, l’élève écrit les siennes. */
export type TcfPeDialogue = TcfBase<
  'PE',
  'dialogue_a_completer',
  { situation?: string; interlocuteur?: string; repliques: TcfReplique[] }
>
export type TcfPeExercise =
  | TcfPeFormulaire
  | TcfPeImageQuestion
  | TcfPeSmsReponse
  | TcfPeEmailReponse
  | TcfPeQuestionTexte
  | TcfPeDialogue

export type TcfRepliqueLocuteur = 'examinateur' | 'eleve'
export type TcfReplique = { locuteur: TcfRepliqueLocuteur; texte: string; variantes?: string[] }

// —— PO ——

/** Grille de l’oral notée à part (ex. lexique, morphosyntaxe, phonologie). */
export type TcfGrille = { points: number; criteres: string[] }

export type TcfPoMotsTheme = TcfBase<
  'PO',
  'mots_theme',
  { theme: string; mots: string[]; exemples_questions: string[]; audio?: string }
>
/** Entretien dirigé : questions sur la fiche, échange examinateur / candidat au corrigé. */
export type TcfPoEntretien = TcfBase<
  'PO',
  'entretien',
  { questions: string[]; echanges?: { question: string; reponse: string }[] }
>
export type TcfPoTheme = { theme: string; images: string[]; exemples_questions: string[] }
/** Trois thèmes tirés au hasard (graine), 4 images chacun : l’élève pose des questions. */
export type TcfPoTroisThemes = TcfBase<'PO', 'trois_themes', { themes: TcfPoTheme[] }>
/**
 * Image à décrire, puis jeu de rôle sur le sujet de l’image (déroulement au corrigé).
 * A0-A1 : 4 images séquentielles (chronologie) ; A1-A2 : une seule image.
 */
export type TcfPoImageInteraction = TcfBase<
  'PO',
  'image_interaction',
  {
    images: string[]
    questions: string[]
    description_modele: string
    je_suis: string
    vous_etes: string
    lieu: string
    vous_voulez: string
    repliques: TcfReplique[]
  }
>
export type TcfPoSequence = TcfBase<'PO', 'sequence_4_images', { images: string[]; reponse_modele: string }>
export type TcfPoImageUnique = TcfBase<
  'PO',
  'image_unique',
  { image: string; reponse_modele: string; questions?: string[] }
>
export type TcfPoDialogue = TcfBase<
  'PO',
  'dialogue',
  {
    situation: string
    repliques: TcfReplique[]
    audio?: string
    images?: string[]
    grille?: TcfGrille
    /** Dialogue simulé : répliques affichées au corrigé seulement (fiche élève = situation). */
    repliques_au_corrige?: boolean
  }
>
export type TcfPoExercise =
  | TcfPoMotsTheme
  | TcfPoEntretien
  | TcfPoTroisThemes
  | TcfPoImageInteraction
  | TcfPoSequence
  | TcfPoImageUnique
  | TcfPoDialogue

export type TcfExercise = TcfCeExercise | TcfCoExercise | TcfPeExercise | TcfPoExercise
export type TcfTypeExercice = TcfExercise['type_exercice']

// —— Items rendus sur la fiche A4 (après tirage / mélange) ——

export type TcfChoixRendu = { lettre: string; texte?: string; image?: string; correct: boolean }

export type TcfSheetItem =
  | { kind: 'support'; exercise: TcfExercise }
  | {
      kind: 'qcm'
      numero: number
      enonce: string
      mode: 'texte' | 'image'
      choix: TcfChoixRendu[]
      audioLabel?: string
      image?: string
      /** Sélecteur Texte / Image / Phrase (marge). */
      formSelect?: TcfFormSelect
    }
  | {
      kind: 'lignes'
      numero: number
      enonce: string
      nbLignes: number
      reponseModele?: string
      audioLabel?: string
      image?: string
      tableau?: TcfLigneTableau[]
      formSelect?: TcfFormSelect
    }
  | {
      kind: 'association'
      nbDialogues: number
      situations: Array<{ lettre: string; image: string; dialogue: number | null }>
    }
  | { kind: 'grille'; grille: TcfGrille }
  | {
      kind: 'images_a_cocher'
      numero: number
      consigne: string
      score: 'par_image' | 'tout_ou_rien'
      images: Array<{ id: string; image: string; correct: boolean }>
    }
  | { kind: 'formulaire'; titre?: string; champs: TcfChampFormulaire[] }
  | {
      kind: 'ecriture'
      /** Cadre autour des traits : téléphone (message) ou e-mail (en-tête À / Objet). */
      cadre?: 'message' | 'email'
      email?: { a: string; objet: string }
      consigneSupplementaire?: string
      nbMots: TcfNbMots
      nbLignes: number
      reponseModele?: string
    }
  | {
      kind: 'dialogue'
      situation: string
      repliques: TcfReplique[]
      auCorrige?: boolean
      interlocuteur?: string
      /** Échange de messages en bulles (PE). */
      bulles?: boolean
    }
  | { kind: 'vide'; message: string }
  | { kind: 'informations'; niveau: TcfNiveau }
