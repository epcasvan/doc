import { SelectBox } from '@/components/generator/SelectBox'
import { VocabAddWordRow } from '@/components/generator/VocabAddWordRow'
import {
  defaultSoutienMotsEntries,
  SoutienMotsLibreEditor,
} from '@/francais/soutien/SoutienMotsLibreEditor'
import {
  defaultSoutienCompleterEntries,
  SoutienCompleterLibreEditor,
} from '@/francais/soutien/SoutienCompleterLibreEditor'
import {
  defaultVocabSelected,
  type VocabWordEntry,
} from '@/francais/vocab-learn'
import type { SoutienComplete } from '@/francais/soutien/banks'
import type { ExerciseBlock } from '@/math/types'

export type SoutienVocabFieldsProps = {
  isSoutienMots: boolean
  isSoutienCompleter: boolean
  isVocabPool: boolean
  isVocabLearn: boolean
  isVocabProd: boolean
  libreMode: boolean
  activeBlock: ExerciseBlock
  updatePage: (patch: Partial<ExerciseBlock>) => void
  soutienType1Words: string[]
  soutienType1WordPool: string[]
  soutienBankSound: string | undefined
  soutienCompletes: readonly SoutienComplete[]
  soutienBankWords: readonly string[]
  vocabSubgroups: Array<{ id: string; label: string }>
  activeVocabSubgroup: string | undefined
  vocabLearnWords: VocabWordEntry[]
  vocabSelectedIds: string[]
  vocabCustomWords: VocabWordEntry[]
}

export function SoutienVocabFields({
  isSoutienMots,
  isSoutienCompleter,
  isVocabPool,
  isVocabLearn,
  isVocabProd,
  libreMode,
  activeBlock,
  updatePage,
  soutienType1Words,
  soutienType1WordPool,
  soutienBankSound,
  soutienCompletes,
  soutienBankWords,
  vocabSubgroups,
  activeVocabSubgroup,
  vocabLearnWords,
  vocabSelectedIds,
  vocabCustomWords,
}: SoutienVocabFieldsProps) {
  return (
    <>
              {isSoutienMots ? (
                <div className="mode-toggle-block">
                  <b>Contenu</b>
                  <div className="mode-toggle is-2" role="group" aria-label="Source des mots">
                    <button
                      type="button"
                      className={!activeBlock.soutienMotsLibre ? 'active' : ''}
                      onClick={() =>
                        updatePage({ soutienMotsLibre: false, soutienMotsEntries: undefined })
                      }
                    >
                      Banque
                    </button>
                    <button
                      type="button"
                      className={activeBlock.soutienMotsLibre ? 'active' : ''}
                      onClick={() => {
                        const seeded =
                          activeBlock.soutienMotsEntries?.some((e) => e.label.trim())
                            ? activeBlock.soutienMotsEntries
                            : defaultSoutienMotsEntries(soutienType1Words)
                        updatePage({
                          soutienMotsLibre: true,
                          soutienMotsEntries: seeded,
                        })
                      }}
                    >
                      Libre
                    </button>
                  </div>
                  <small className="muted">
                    Libre : choisissez d’autres mots du son, ou changez le mot et l’image.
                  </small>
                  {!libreMode && activeBlock.soutienMotsLibre ? (
                    <SoutienMotsLibreEditor
                      entries={
                        activeBlock.soutienMotsEntries?.length
                          ? activeBlock.soutienMotsEntries
                          : defaultSoutienMotsEntries(soutienType1Words)
                      }
                      suggestedWords={soutienType1WordPool}
                      soundLabel={soutienBankSound}
                      onChange={(next) => updatePage({ soutienMotsEntries: next })}
                    />
                  ) : null}
                </div>
              ) : null}
              {isSoutienCompleter ? (
                <div className="mode-toggle-block">
                  <b>Contenu</b>
                  <div className="mode-toggle is-2" role="group" aria-label="Source des mots à compléter">
                    <button
                      type="button"
                      className={!activeBlock.soutienCompleterLibre ? 'active' : ''}
                      onClick={() =>
                        updatePage({
                          soutienCompleterLibre: false,
                          soutienCompleterEntries: undefined,
                        })
                      }
                    >
                      Banque
                    </button>
                    <button
                      type="button"
                      className={activeBlock.soutienCompleterLibre ? 'active' : ''}
                      onClick={() => {
                        const seeded =
                          activeBlock.soutienCompleterEntries?.some((e) => e.word.trim())
                            ? activeBlock.soutienCompleterEntries
                            : defaultSoutienCompleterEntries(soutienCompletes)
                        updatePage({
                          soutienCompleterLibre: true,
                          soutienCompleterEntries: seeded.length
                            ? seeded
                            : defaultSoutienCompleterEntries(soutienCompletes),
                        })
                      }}
                    >
                      Libre
                    </button>
                  </div>
                  <small className="muted">
                    Libre : choisissez la partie à cacher, ou ajoutez mot + image.
                  </small>
                  {!libreMode && activeBlock.soutienCompleterLibre ? (
                    <SoutienCompleterLibreEditor
                      entries={
                        activeBlock.soutienCompleterEntries?.length
                          ? activeBlock.soutienCompleterEntries
                          : defaultSoutienCompleterEntries(soutienCompletes)
                      }
                      suggestedWords={soutienBankWords}
                      onChange={(next) => updatePage({ soutienCompleterEntries: next })}
                    />
                  ) : null}
                </div>
              ) : null}
              {isVocabPool ? (
                <>
                  {isVocabLearn ? (
                    <>
                  <div className="mode-toggle-block">
                    <b>Lignes</b>
                    <div className="mode-toggle is-4" role="group" aria-label="Nombre de lignes">
                      {[1, 2, 3, 4].map((value) => (
                        <button
                          key={value}
                          type="button"
                          className={(activeBlock.vocabRows ?? 3) === value ? 'active' : ''}
                          onClick={() => updatePage({ vocabRows: value })}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mode-toggle-block">
                    <b>Colonnes</b>
                    <div className="mode-toggle is-4" role="group" aria-label="Nombre de colonnes du tableau">
                      {[1, 2, 3, 4].map((value) => (
                        <button
                          key={value}
                          type="button"
                          className={(activeBlock.vocabCols ?? 3) === value ? 'active' : ''}
                          onClick={() => updatePage({ vocabCols: value })}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </div>
                    </>
                  ) : null}
                  {isVocabProd ? (
                    <label className="select-shell">
                      <span>Longueur du trait</span>
                      <input
                        className="pill-input"
                        type="number"
                        min={4}
                        max={48}
                        value={activeBlock.vocabLineCh ?? 12}
                        onChange={(event) =>
                          updatePage({
                            vocabLineCh: Math.max(4, Math.min(48, Number(event.target.value) || 12)),
                          })
                        }
                      />
                    </label>
                  ) : null}
                  {vocabSubgroups.length > 1 ? (
                    <SelectBox
                      label="Liste"
                      value={activeVocabSubgroup ?? ''}
                      onChange={(value) => {
                        const nextSelected = defaultVocabSelected(
                          activeBlock.topic,
                          activeBlock.vocabRows ?? 3,
                          activeBlock.vocabCols ?? 3,
                          value,
                        )
                        updatePage({ vocabSubgroup: value, vocabSelected: nextSelected })
                      }}
                    >
                      {vocabSubgroups.map((group) => (
                        <option value={group.id} key={group.id}>
                          {group.label}
                        </option>
                      ))}
                    </SelectBox>
                  ) : null}
                  {vocabLearnWords.length > 0 ? (
                    <div className="quad-libre-block">
                      <b>Mots</b>
                      <div className="vocab-word-list" role="group" aria-label="Mots à afficher">
                        {vocabLearnWords.map((word) => {
                          const selected = vocabSelectedIds.includes(word.id)
                          return (
                            <label key={word.id} className={selected ? 'is-on' : ''}>
                              <input
                                type="checkbox"
                                checked={selected}
                                onChange={() => {
                                  const next = selected
                                    ? vocabSelectedIds.filter((id) => id !== word.id)
                                    : [...vocabSelectedIds, word.id]
                                  updatePage({
                                    vocabSelected: next.length
                                      ? next
                                      : vocabLearnWords.slice(0, 1).map((item) => item.id),
                                  })
                                }}
                              />
                              <span className="vocab-word-label">{word.label}</span>
                            </label>
                          )
                        })}
                      </div>
                      <VocabAddWordRow
                        onAdd={(entry) => {
                          const customs = [...vocabCustomWords, entry]
                          updatePage({
                            vocabCustomEntries: customs,
                            vocabSelected: [...vocabSelectedIds, entry.id],
                          })
                        }}
                      />
                    </div>
                  ) : (
                    <div className="quad-libre-block">
                      <p className="questions-overflow-hint" role="status">
                        Aucun mot dans cette liste. Ajoutez-en un ci-dessous.
                      </p>
                      <VocabAddWordRow
                        onAdd={(entry) => {
                          updatePage({
                            vocabCustomEntries: [...vocabCustomWords, entry],
                            vocabSelected: [...vocabSelectedIds, entry.id],
                          })
                        }}
                      />
                    </div>
                  )}
                </>
              ) : null}

    </>
  )
}
