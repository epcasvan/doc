import type {
  TcfCompetence,
  TcfExercise,
  TcfNiveau,
  TcfQuestion,
  TcfTypeExercice,
  TcfTypeReponse,
} from './types'

/** Lettres de choix (attribuées APRÈS mélange, jamais stockées). */
export const TCF_LETTRES = ['A', 'B', 'C', 'D'] as const
export const TCF_LETTRES_SITUATIONS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] as const
export const TCF_QCM_MIN = 3
export const TCF_QCM_MAX = 4
export const TCF_IMAGES_A_COCHER = 5

/** Id lisible : tcf-a0a1-ce-001. */
export function tcfExerciseId(niveau: TcfNiveau, competence: TcfCompetence, rang: number): string {
  const n = niveau.toLowerCase().replace('-', '')
  return `tcf-${n}-${competence.toLowerCase()}-${String(rang).padStart(3, '0')}`
}

/** Question vide (3 choix pré-créés pour un QCM, le premier marqué juste). */
export function emptyTcfQuestion(typeReponse: TcfTypeReponse): TcfQuestion {
  if (typeReponse === 'lignes') {
    return { enonce: '', type_reponse: 'lignes', nb_lignes: 2, reponse_modele: '' }
  }
  if (typeReponse === 'qcm_image') {
    return {
      enonce: '',
      type_reponse: 'qcm_image',
      melanger: true,
      choix: [
        { id: 'a', image: '', correct: true },
        { id: 'b', image: '' },
        { id: 'c', image: '' },
      ],
    }
  }
  return {
    enonce: '',
    type_reponse: 'qcm_texte',
    melanger: true,
    choix: [
      { id: 'a', texte: '', correct: true },
      { id: 'b', texte: '' },
      { id: 'c', texte: '' },
    ],
  }
}

/** Gabarit vide d’un exercice (enveloppe commune + support du type). */
export function emptyTcfExercise(
  niveau: TcfNiveau,
  competence: TcfCompetence,
  typeExercice: TcfTypeExercice,
  id = tcfExerciseId(niveau, competence, 1),
): TcfExercise {
  const base = { id, niveau, theme: '', questions: [] as TcfQuestion[], consigne_supplementaire: null }
  switch (typeExercice) {
    case 'sms':
      return { ...base, competence: 'CE', type_exercice: 'sms', support: { expediteur: '', texte: '' } }
    case 'email':
      return {
        ...base,
        competence: 'CE',
        type_exercice: 'email',
        support: { de: '', a: '', objet: '', texte: '' },
      }
    case 'annonce':
      return {
        ...base,
        competence: 'CE',
        type_exercice: 'annonce',
        support: { titre: '', texte: '', image: null },
      }
    case 'images_a_reconnaitre':
      return {
        ...base,
        competence: 'CO',
        type_exercice: 'images_a_reconnaitre',
        support: { audio: '' },
        melanger: true,
        score: 'par_image',
        images: Array.from({ length: TCF_IMAGES_A_COCHER }, (_, i) => ({
          id: `i${i + 1}`,
          image: '',
          correct: false,
        })),
      }
    case 'six_courts':
      return {
        ...base,
        competence: 'CO',
        type_exercice: 'six_courts',
        support: { audios: Array.from({ length: 6 }, () => '') },
      }
    case 'trois_moyens':
      return {
        ...base,
        competence: 'CO',
        type_exercice: 'trois_moyens',
        support: { audios: Array.from({ length: 3 }, () => '') },
      }
    case 'complet':
      return {
        ...base,
        competence: 'CO',
        type_exercice: 'complet',
        support: { audio: '', transcription: '' },
      }
    case 'association_images':
      return {
        ...base,
        competence: 'CO',
        type_exercice: 'association_images',
        support: { audio: '', nb_dialogues: 5, transcription: '' },
        situations: Array.from({ length: 6 }, (_, i) => ({ id: `s${i + 1}`, image: '', dialogue: null })),
      }
    case 'formulaire':
      return {
        ...base,
        competence: 'PE',
        type_exercice: 'formulaire',
        support: { titre: '', champs: [{ label: '', type: 'texte', corrige: '' }] },
      }
    case 'image_question':
      return {
        ...base,
        competence: 'PE',
        type_exercice: 'image_question',
        support: { image: '', consigne: '', nb_mots: { min: 0, max: 0 }, reponse_modele: '' },
      }
    case 'sms_reponse':
      return {
        ...base,
        competence: 'PE',
        type_exercice: 'sms_reponse',
        support: { expediteur: '', sms_recu: '', consigne: '', nb_mots: {}, reponse_modele: '' },
        consigne_supplementaire: '',
      }
    case 'email_reponse':
      return {
        ...base,
        competence: 'PE',
        type_exercice: 'email_reponse',
        support: {
          email_recu: { de: '', objet: '', texte: '' },
          consigne: '',
          nb_mots: {},
          reponse_modele: '',
        },
        consigne_supplementaire: '',
      }
    case 'question_texte':
      return {
        ...base,
        competence: 'PE',
        type_exercice: 'question_texte',
        support: { consigne: '', nb_mots: {}, reponse_modele: '' },
        consigne_supplementaire: '',
      }
    case 'dialogue_a_completer':
      return {
        ...base,
        competence: 'PE',
        type_exercice: 'dialogue_a_completer',
        support: {
          interlocuteur: '',
          repliques: [
            { locuteur: 'examinateur', texte: '' },
            { locuteur: 'eleve', texte: '', variantes: [] },
            { locuteur: 'examinateur', texte: '' },
            { locuteur: 'eleve', texte: '', variantes: [] },
            { locuteur: 'examinateur', texte: '' },
            { locuteur: 'eleve', texte: '', variantes: [] },
            { locuteur: 'examinateur', texte: '' },
            { locuteur: 'eleve', texte: '', variantes: [] },
          ],
        },
      }
    case 'mots_theme':
      return {
        ...base,
        competence: 'PO',
        type_exercice: 'mots_theme',
        support: { theme: '', mots: ['', ''], exemples_questions: [''] },
      }
    case 'entretien':
      return { ...base, competence: 'PO', type_exercice: 'entretien', support: { questions: [''] } }
    case 'trois_themes':
      return {
        ...base,
        competence: 'PO',
        type_exercice: 'trois_themes',
        support: { themes: [{ theme: '', images: ['', '', '', ''], exemples_questions: [''] }] },
      }
    case 'image_interaction':
      return {
        ...base,
        competence: 'PO',
        type_exercice: 'image_interaction',
        support: {
          images: niveau === 'A0-A1' ? ['', '', '', ''] : [''],
          questions: ['Qu’est-ce que vous voyez ?', 'Où sont les personnes ?', 'Qu’est-ce qu’elles font ?'],
          description_modele: '',
          je_suis: '',
          vous_etes: '',
          lieu: '',
          vous_voulez: '',
          repliques: [
            { locuteur: 'examinateur', texte: '' },
            { locuteur: 'eleve', texte: '', variantes: [] },
          ],
        },
      }
    case 'sequence_4_images':
      return {
        ...base,
        competence: 'PO',
        type_exercice: 'sequence_4_images',
        support: { images: ['', '', '', ''], reponse_modele: '' },
      }
    case 'image_unique':
      return {
        ...base,
        competence: 'PO',
        type_exercice: 'image_unique',
        support: { image: '', reponse_modele: '' },
      }
    case 'dialogue':
      return {
        ...base,
        competence: 'PO',
        type_exercice: 'dialogue',
        support: {
          situation: '',
          repliques: [
            { locuteur: 'examinateur', texte: '' },
            { locuteur: 'eleve', texte: '', variantes: [] },
          ],
        },
      }
  }
}
