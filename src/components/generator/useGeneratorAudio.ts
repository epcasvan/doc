import {
  downloadTcfAudios,
  tcfExerciseAudioRefs,
} from '@/tcf/download-audios'
import { tcfBank, tcfSlotBank } from '@/tcf/loader'
import { tcfSlotByTypeId, tcfTypeByTypeId } from '@/tcf/catalog'
import type { TcfCompetence, TcfExercise, TcfNiveau } from '@/tcf/types'
import { downloadTcmCfrAudios } from '@/tcm-cfr/audio-nombres'
import { soutienBankById } from '@/francais/soutien/banks'
import {
  downloadSoutienEcouterAudio,
  SOUTIEN_LETTRES_PHRASE_CONSIGNE,
  SOUTIEN_SYLLABE_SON_CONSIGNE,
} from '@/francais/soutien/download-ecouter-audio'
import {
  downloadSoutienCompleterAudio,
  downloadSoutienMotsAudio,
} from '@/francais/soutien/download-mots-audio'
import {
  downloadSoutienType9Phrases,
  downloadSoutienType10Phrases,
  downloadSoutienType12Phrases,
  downloadSoutienType14Phrases,
} from '@/francais/soutien/download-phrases'
import { parseSoutienType } from '@/francais/soutien/kinds'
import {
  findSoutienByBankId,
  resolveSoutienSelection,
} from '@/francais/soutien/themes'
import type { ExerciseBlock, WorksheetPage } from '@/math/types'

export type UseGeneratorAudioParams = {
  activeBlock: ExerciseBlock
  activeSheet: WorksheetPage | undefined
  worksheets: WorksheetPage[]
  safeBlockIndex: number
  pageIndex: number
  firstExerciseNo: number
  tcfNiveau: TcfNiveau
  /** Mots type 1 Soutien (fallback si la fiche n’a pas encore de tableau). */
  soutienType1Words: string[]
}

export function useGeneratorAudio({
  activeBlock,
  activeSheet,
  worksheets,
  safeBlockIndex,
  pageIndex,
  firstExerciseNo,
  tcfNiveau,
  soutienType1Words,
}: UseGeneratorAudioParams) {
  /** Exercice TCF courant (banque / édition) pour télécharger ses audios. */
  function currentTcfExercise(): TcfExercise | undefined {
    if (activeBlock.tcfExercise) return activeBlock.tcfExercise
    const niveau = tcfNiveau
    const slot = tcfSlotByTypeId[activeBlock.exerciseType]
    const legacy = slot ? undefined : tcfTypeByTypeId[activeBlock.exerciseType]
    if (!slot && !legacy) return undefined
    const bank = slot
      ? tcfSlotBank(niveau, slot)
      : tcfBank(niveau, legacy!.competence, legacy!.typeExercice)
    const shownId =
      activeSheet?.blocks[safeBlockIndex]?.items.find((item) => item.tcfExerciseId)?.tcfExerciseId
    const id = activeBlock.tcfBankId ?? shownId
    return id ? bank.find((ex) => ex.id === id) : bank[0]
  }

  async function downloadActiveTcfAudios() {
    const ex = currentTcfExercise()
    if (!ex) return
    const refs = tcfExerciseAudioRefs(ex)
    if (refs.length === 0) return
    const exerciseNo =
      activeSheet?.blocks[safeBlockIndex]?.exerciseIndex ??
      activeBlock.exerciseNo ??
      pageIndex + 1
    try {
      await downloadTcfAudios({
        niveau: ex.niveau,
        competence: ex.competence as TcfCompetence,
        exerciseNo,
        audioRefs: refs,
      })
    } catch {
      // Échec réseau / fichier manquant : silencieux (l’enseignant·e voit l’absence de téléchargement).
    }
  }

  /** Playlists audio TCM CFR du test entier (ex. 1 nombres + ex. 2 multiplications). */
  function currentTcmCfrAudioPlaylists(): string[][] {
    return worksheets.flatMap((sheet) =>
      sheet.blocks.flatMap((block) =>
        block.items
          .map((item) => item.audioParts ?? (item.audioSrc ? [item.audioSrc] : []))
          .filter((parts): parts is string[] => parts.length > 0),
      ),
    )
  }

  async function downloadActiveTcmCfrAudios() {
    const playlists = currentTcmCfrAudioPlaylists()
    if (playlists.length === 0) return
    try {
      await downloadTcmCfrAudios(playlists)
    } catch {
      // Échec réseau / fichier manquant : silencieux.
    }
  }

  /** Mots affichés du type 1 Soutien (pour l’audio téléchargeable). */
  function currentSoutienMotsWords(): string[] {
    const fromSheet =
      activeSheet?.blocks[safeBlockIndex]?.items.find((item) => item.layout === 'vocab-table')
        ?.vocabEntries ?? []
    const labels = fromSheet.map((e) => e.label.trim()).filter(Boolean)
    if (labels.length > 0) return labels
    if (activeBlock.soutienMotsLibre && activeBlock.soutienMotsEntries?.length) {
      return activeBlock.soutienMotsEntries.map((e) => e.label.trim()).filter(Boolean)
    }
    return soutienType1Words
  }

  /** Métadonnées pour le nom de fichier audio Soutien FR. */
  function soutienAudioFileMeta(): {
    themeLabel: string
    letterLabel: string
    exerciseNo: number
  } {
    const sel =
      resolveSoutienSelection(activeBlock.topic, activeBlock.exerciseType) ??
      (activeBlock.exerciseType
        ? (() => {
            const bankId = parseSoutienType(activeBlock.exerciseType)?.bankId
            return bankId ? findSoutienByBankId(bankId) : null
          })()
        : null)
    const exerciseNo =
      activeSheet?.blocks[safeBlockIndex]?.exerciseIndex ??
      activeBlock.exerciseNo ??
      firstExerciseNo + safeBlockIndex
    return {
      themeLabel: sel?.theme.label ?? 'Soutien',
      letterLabel: sel?.letter.letterUpper ?? sel?.letter.label ?? 'X',
      exerciseNo,
    }
  }

  async function downloadActiveSoutienMotsAudio() {
    const words = currentSoutienMotsWords()
    if (words.length === 0) return
    const meta = soutienAudioFileMeta()
    try {
      await downloadSoutienMotsAudio({ words, ...meta })
    } catch {
      // Échec réseau / fichier manquant : silencieux.
    }
  }

  /** Mots du type 5 (compléter) pour l’audio téléchargeable. */
  function currentSoutienCompleterWords(): string[] {
    const fromSheet =
      activeSheet?.blocks[safeBlockIndex]?.items.find(
        (item) => item.layout === 'syllable-complete',
      )?.syllableCompletes ?? []
    const labels = fromSheet.map((e) => e.word.trim()).filter(Boolean)
    if (labels.length > 0) return labels
    if (activeBlock.soutienCompleterLibre && activeBlock.soutienCompleterEntries?.length) {
      return activeBlock.soutienCompleterEntries.map((e) => e.word.trim()).filter(Boolean)
    }
    return []
  }

  async function downloadActiveSoutienCompleterAudio() {
    const words = currentSoutienCompleterWords()
    if (words.length === 0) return
    const meta = soutienAudioFileMeta()
    try {
      await downloadSoutienCompleterAudio({ words, ...meta })
    } catch {
      // Échec réseau / fichier manquant : silencieux.
    }
  }

  /** Mots + audios des types 6 / 7 / 8 pour la playlist téléchargeable. */
  function currentSoutienEcouterWords(): {
    words: string[]
    audioSrcs: string[]
  } {
    const blockItems = activeSheet?.blocks[safeBlockIndex]?.items ?? []
    const listen = blockItems.find((row) => row.layout === 'listen-check')
    if (listen) {
      const words = (listen.options ?? []).map((w) => w.trim()).filter(Boolean)
      const audioSrcs = (listen.optionAudioSrcs ?? []).map((src) => src ?? '')
      return { words, audioSrcs }
    }
    const syllabe = blockItems.find((row) => row.layout === 'syllable-sound')
    if (syllabe?.syllableSoundItems?.length) {
      const words = syllabe.syllableSoundItems.map((row) => row.word.trim()).filter(Boolean)
      const audioSrcs = syllabe.syllableSoundItems.map((row) => row.audioSrc ?? '')
      return { words, audioSrcs }
    }
    const phrase = blockItems.find((row) => row.layout === 'phrase-scramble')
    if (phrase?.phraseScrambles?.length) {
      const words = phrase.phraseScrambles.map((row) => row.word.trim()).filter(Boolean)
      const audioSrcs = phrase.phraseScrambles.map((row) => row.audioSrc ?? '')
      return { words, audioSrcs }
    }
    return { words: [], audioSrcs: [] }
  }

  async function downloadActiveSoutienEcouterAudio() {
    const { words, audioSrcs } = currentSoutienEcouterWords()
    if (words.length === 0) return
    const parsed = parseSoutienType(activeBlock.exerciseType)
    const bankId = parsed?.bankId ?? 'ecouter'
    const bank = soutienBankById(bankId)
    const meta = soutienAudioFileMeta()
    const consigneSrc =
      parsed?.kind === 'syllabe-son'
        ? SOUTIEN_SYLLABE_SON_CONSIGNE
        : parsed?.kind === 'lettres-phrase'
          ? SOUTIEN_LETTRES_PHRASE_CONSIGNE
          : undefined
    /** Types 6–8 : annoncer le son après la consigne ; type 9 = phrases seules. */
    const withSon = parsed?.kind !== 'lettres-phrase'
    try {
      await downloadSoutienEcouterAudio({
        words,
        audioSrcs,
        phoneme: withSon ? bank?.sound : undefined,
        consigneSrc,
        ...meta,
      })
    } catch {
      // Échec réseau / fichier manquant : silencieux.
    }
  }

  function downloadActiveSoutienPhrases() {
    const parsed = parseSoutienType(activeBlock.exerciseType)
    if (!parsed) return
    const bank = soutienBankById(parsed.bankId)
    if (!bank) return
    if (parsed.kind === 'lettres-phrase') downloadSoutienType9Phrases(bank)
    else if (parsed.kind === 'determinants') downloadSoutienType10Phrases(bank)
    else if (parsed.kind === 'compter') downloadSoutienType12Phrases(bank)
    else if (parsed.kind === 'lire') downloadSoutienType14Phrases(bank)
  }

  return {
    downloadActiveTcfAudios,
    downloadActiveTcmCfrAudios,
    downloadActiveSoutienMotsAudio,
    downloadActiveSoutienCompleterAudio,
    downloadActiveSoutienEcouterAudio,
    downloadActiveSoutienPhrases,
  }
}
