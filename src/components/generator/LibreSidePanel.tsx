import type { ExerciseBlock, WorksheetPage } from '@/math/types'
import type { GameTemplate } from '@/jeux/templates'
import { PhraseLibreEditor, isPhraseLibreEditable } from '@/francais/PhraseLibreEditor'
import type { SoutienComplete } from '@/francais/soutien/banks'
import {
  defaultSoutienMotsEntries,
  SoutienMotsLibreEditor,
} from '@/francais/soutien/SoutienMotsLibreEditor'
import {
  defaultSoutienCompleterEntries,
  SoutienCompleterLibreEditor,
} from '@/francais/soutien/SoutienCompleterLibreEditor'
import {
  CoordQuestionsLibreEditor,
  resizeCoordQuestionsLibre,
} from '@/math/CoordQuestionsLibreEditor'
import { GameContentPanel } from '@/jeux/GameContentPanel'
import { DEFAULT_GAME_FONT_SIZE } from '@/jeux/font-size'
import { TcfExerciseEditor } from '@/tcf/TcfExerciseEditor'
import type { TcfNiveau } from '@/tcf/types'
import { GenericLibreEditor } from '@/components/generator/GenericLibreEditor'
import { TpmLibreEditor } from '@/components/generator/TpmLibreEditor'
import { VocabAddWordRow } from '@/components/generator/VocabAddWordRow'
import type { VocabWordEntry } from '@/francais/vocab-learn'

export type LibreSidePanelProps = {
  activeBlock: ExerciseBlock
  activeSheet: WorksheetPage | undefined
  safeBlockIndex: number
  isPhraseDomain: boolean
  isNumberLibreDomain: boolean
  isCalliDomain: boolean
  isJeuxDomain: boolean
  isTcf: boolean
  isTpmLike: boolean
  isDroites: boolean
  isConstruire: boolean
  soutienKind: string | undefined
  soutienType1Words: readonly string[]
  soutienType1WordPool: readonly string[]
  soutienCompletes: readonly SoutienComplete[]
  soutienBankWords: readonly string[]
  calliIsPhrases: boolean
  calliFields: string[]
  setCalliFieldAt: (index: number, value: string) => void
  removeCalliField: (index: number) => void
  addCalliExtraWord: (entry: VocabWordEntry) => void
  jeuxTemplate: GameTemplate | null | undefined
  jeuxText: string
  tcfNiveau: TcfNiveau
  updatePage: (patch: Partial<ExerciseBlock>) => void
  onClose: () => void
  /** Régénère l’exercice actif (autres nombres / autre tirage banque). */
  onRegenerateBlock?: (blockIndex: number) => void
}

export function LibreSidePanel({
  activeBlock,
  activeSheet,
  safeBlockIndex,
  isPhraseDomain,
  isNumberLibreDomain,
  isCalliDomain,
  isJeuxDomain,
  isTcf,
  isTpmLike,
  isDroites,
  isConstruire,
  soutienKind,
  soutienType1Words,
  soutienType1WordPool,
  soutienCompletes,
  soutienBankWords,
  calliIsPhrases,
  calliFields,
  setCalliFieldAt,
  removeCalliField,
  addCalliExtraWord,
  jeuxTemplate,
  jeuxText,
  tcfNiveau,
  updatePage,
  onClose,
  onRegenerateBlock,
}: LibreSidePanelProps) {
  return (
    <aside className="side-tool-panel is-libre no-print" aria-label="Mode libre">
      <div className="side-tool-panel-head is-libre-head">
        <button
          type="button"
          className="side-tool-close is-theme"
          aria-label="Fermer le mode libre"
          title="Fermer le mode libre"
          onClick={onClose}
        >
          ×
        </button>
        <h3>Mode libre</h3>
      </div>
      <div className="side-tool-panel-body">
        {isPhraseDomain &&
        isPhraseLibreEditable(activeBlock.exerciseType) ? (
          <PhraseLibreEditor
            exerciseType={activeBlock.exerciseType}
            items={
              activeBlock.phraseItems ??
              activeSheet?.blocks[safeBlockIndex]?.items ??
              []
            }
            instruction={
              activeBlock.phraseInstruction ??
              activeSheet?.blocks[safeBlockIndex]?.instruction ??
              ''
            }
            onChangeItems={(phraseItems) => updatePage({ phraseItems })}
            onChangeInstruction={(phraseInstruction) =>
              updatePage({ phraseInstruction })
            }
          />
        ) : null}
        {isNumberLibreDomain ? (
          <div className="number-libre-fields">
            <b>Bornes des nombres</b>
            <label>
              Minimum
              <input
                className="pill-input"
                type="number"
                value={activeBlock.numberMin ?? 0}
                onChange={(event) =>
                  updatePage({ numberMin: Number(event.target.value) })
                }
              />
            </label>
            <label>
              Maximum
              <input
                className="pill-input"
                type="number"
                value={activeBlock.numberMax ?? 100}
                onChange={(event) =>
                  updatePage({ numberMax: Number(event.target.value) })
                }
              />
            </label>
          </div>
        ) : null}
        {soutienKind === 'mots' ? (
          <SoutienMotsLibreEditor
            entries={
              activeBlock.soutienMotsEntries ??
              defaultSoutienMotsEntries(soutienType1Words)
            }
            suggestedWords={soutienType1WordPool}
            onChange={(soutienMotsEntries) => updatePage({ soutienMotsEntries })}
          />
        ) : null}
        {soutienKind === 'completer' ? (
          <SoutienCompleterLibreEditor
            entries={
              activeBlock.soutienCompleterEntries?.length
                ? activeBlock.soutienCompleterEntries
                : defaultSoutienCompleterEntries(soutienCompletes)
            }
            suggestedWords={soutienBankWords}
            onChange={(soutienCompleterEntries) =>
              updatePage({ soutienCompleterEntries })
            }
          />
        ) : null}
        {(isDroites || isConstruire) && activeBlock.coordLibre ? (
          <CoordQuestionsLibreEditor
            questions={
              activeBlock.coordQuestionsLibre ??
              resizeCoordQuestionsLibre([], activeBlock.count)
            }
            maxCount={isConstruire ? 8 : 10}
            onChange={(coordQuestionsLibre) => {
              const capped = coordQuestionsLibre.slice(0, isConstruire ? 8 : 10)
              updatePage({
                coordQuestionsLibre: capped,
                count: capped.length || activeBlock.count,
              })
            }}
          />
        ) : null}
        {isCalliDomain ? (
          <div className="quad-libre-block">
            <b>{calliIsPhrases ? 'Phrases' : 'Mots'}</b>
            <ul
              className="calli-fields"
              aria-label={calliIsPhrases ? 'Phrases à recopier' : 'Mots ou phrases à recopier'}
            >
              {calliFields.map((value, index) => (
                <li className="calli-field-row" key={`calli-libre-${index}`}>
                  <span className="calli-field-num">{index + 1}.</span>
                  <input
                    className="pill-input"
                    type="text"
                    value={value}
                    spellCheck
                    onChange={(event) => setCalliFieldAt(index, event.target.value)}
                  />
                  <button
                    type="button"
                    className="calli-field-remove"
                    aria-label={`Supprimer la ligne ${index + 1}`}
                    onClick={() => removeCalliField(index)}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
            <div className="game-extra-words">
              <VocabAddWordRow
                withImage={false}
                placeholder={calliIsPhrases ? 'Nouvelle phrase' : 'Mot ou phrase'}
                onAdd={addCalliExtraWord}
              />
            </div>
          </div>
        ) : null}
        {isJeuxDomain && jeuxTemplate ? (
          <GameContentPanel
            typeId={activeBlock.exerciseType}
            template={jeuxTemplate}
            entries={activeBlock.gameEntries}
            text={jeuxText}
            gameSource={activeBlock.gameSource}
            gameTopic={activeBlock.gameTopic}
            gameSelectedIds={activeBlock.gameSelectedIds}
            gameBackColor={activeBlock.gameBackColor}
            gameSeriesName={activeBlock.gameSeriesName}
            gameBorderId={activeBlock.gameBorderId}
            gameBorderRectoId={
              activeBlock.gameBorderRectoId !== undefined
                ? activeBlock.gameBorderRectoId
                : activeBlock.gameBorderId
            }
            gameBorderVersoId={
              activeBlock.gameBorderVersoId !== undefined
                ? activeBlock.gameBorderVersoId
                : activeBlock.gameBorderId
            }
            gameFontSize={activeBlock.gameFontSize ?? DEFAULT_GAME_FONT_SIZE}
            gameAlpha={activeBlock.gameAlpha}
            onChange={(next) => updatePage(next)}
          />
        ) : null}
        {isTcf ? (
          <TcfExerciseEditor
            niveau={tcfNiveau}
            typeId={activeBlock.exerciseType}
            exercise={activeBlock.tcfExercise}
            bankId={activeBlock.tcfBankId}
            shownId={activeSheet?.blocks[safeBlockIndex]?.items.find((item) => item.tcfExerciseId)?.tcfExerciseId}
            onChange={(patch) => updatePage(patch)}
            onReroll={
              onRegenerateBlock ? () => onRegenerateBlock(safeBlockIndex) : undefined
            }
          />
        ) : null}
        {/* TPM / TCM CFR / CSC : éditeur spécialisé (sélecteurs + recalcul). */}
        {isTpmLike &&
        !isPhraseDomain &&
        !isCalliDomain &&
        !isJeuxDomain &&
        !isTcf ? (
          <TpmLibreEditor
            exerciseType={activeBlock.exerciseType}
            instruction={
              activeBlock.libreInstruction ??
              activeSheet?.blocks[safeBlockIndex]?.instruction ??
              ''
            }
            items={
              activeBlock.libreItems ??
              activeSheet?.blocks[safeBlockIndex]?.items ??
              []
            }
            onChangeInstruction={(libreInstruction) =>
              updatePage({ libreInstruction })
            }
            onChangeItems={(libreItems) => updatePage({ libreItems })}
          />
        ) : null}
        {/* Un seul éditeur générique — évite le doublon (ex. domaines nombres). */}
        {!isTpmLike &&
        !isPhraseDomain &&
        !isCalliDomain &&
        !isJeuxDomain &&
        !isTcf &&
        soutienKind !== 'mots' &&
        soutienKind !== 'completer' &&
        !(isDroites || isConstruire) ? (
          <GenericLibreEditor
            instruction={
              activeBlock.libreInstruction ??
              activeSheet?.blocks[safeBlockIndex]?.instruction ??
              ''
            }
            items={
              activeBlock.libreItems ??
              activeSheet?.blocks[safeBlockIndex]?.items ??
              []
            }
            onChangeInstruction={(libreInstruction) =>
              updatePage({ libreInstruction })
            }
            onChangeItems={(libreItems) => updatePage({ libreItems })}
          />
        ) : null}
      </div>
    </aside>

  )
}
