import { SelectBox } from '@/components/generator/SelectBox'
import { VocabAddWordRow } from '@/components/generator/VocabAddWordRow'
import {
  defaultVocabSelected,
  type VocabWordEntry,
} from '@/francais/vocab-learn'
import type { ExerciseBlock } from '@/math/types'

export type SoutienVocabFieldsProps = {
  isVocabPool: boolean
  isVocabLearn: boolean
  isVocabProd: boolean
  activeBlock: ExerciseBlock
  updatePage: (patch: Partial<ExerciseBlock>) => void
  vocabSubgroups: Array<{ id: string; label: string }>
  activeVocabSubgroup: string | undefined
  vocabLearnWords: VocabWordEntry[]
  vocabSelectedIds: string[]
  vocabCustomWords: VocabWordEntry[]
}

export function SoutienVocabFields({
  isVocabPool,
  isVocabLearn,
  isVocabProd,
  activeBlock,
  updatePage,
  vocabSubgroups,
  activeVocabSubgroup,
  vocabLearnWords,
  vocabSelectedIds,
  vocabCustomWords,
}: SoutienVocabFieldsProps) {
  return (
    <>
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
