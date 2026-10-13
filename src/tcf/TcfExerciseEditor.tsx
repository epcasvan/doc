import { useMemo, useState } from 'react'
import { applyExerciseFromAudioBank, tcfAudioEntries, type TcfAudioEntry } from './audio-bank'
import { TCF_TYPES, tcfSlotByTypeId, tcfTypeMeta } from './catalog'
import { AudioField, ImageField, LinesField, NumberField, TextField } from './fields'
import { tcfBank, tcfExerciseById, tcfSlotBank } from './loader'
import { QuestionEditor } from './QuestionEditor'
import { tcfScenarioGroups, type TcfScenarioGroup } from './sources'
import { emptyTcfExercise, emptyTcfQuestion, tcfExerciseId } from './templates'
import { checkTcfMedia, validateTcfExercise } from './validate'
import type {
  TcfChampFormulaire,
  TcfChampType,
  TcfExercise,
  TcfNbMots,
  TcfNiveau,
  TcfPoTheme,
  TcfReplique,
  TcfTypeExercice,
} from './types'

type EditorPatch = { tcfExercise?: TcfExercise; tcfBankId?: string; tcfScenario?: string }

/** Remplace le support en gardant le type exact de l’exercice. */
function withSupport<E extends TcfExercise>(ex: E, patch: Partial<E['support']>): E {
  return { ...ex, support: { ...ex.support, ...patch } }
}

const CHAMP_TYPES: ReadonlyArray<{ id: TcfChampType; label: string }> = [
  { id: 'texte', label: 'Texte' },
  { id: 'date', label: 'Date' },
  { id: 'choix', label: 'Choix' },
  { id: 'case', label: 'Case' },
]

function NbMotsFields({ value, onChange }: { value: TcfNbMots; onChange: (next: TcfNbMots) => void }) {
  return (
    <div className="tcf-row">
      <NumberField label="Mots min." value={value.min} onChange={(min) => onChange({ ...value, min })} />
      <NumberField label="Mots max." value={value.max} onChange={(max) => onChange({ ...value, max })} />
    </div>
  )
}

function RepliquesFields({
  repliques,
  autreLabel,
  onChange,
}: {
  repliques: TcfReplique[]
  autreLabel: string
  onChange: (next: TcfReplique[]) => void
}) {
  return (
    <>
      {repliques.map((r, i) => (
        <fieldset className="tcf-question-editor" key={i}>
          <legend>
            Réplique {i + 1}
            <button
              type="button"
              className="calli-field-remove"
              aria-label={`Supprimer la réplique ${i + 1}`}
              disabled={repliques.length <= 1}
              onClick={() => onChange(repliques.filter((_, k) => k !== i))}
            >
              ×
            </button>
          </legend>
          <div className="mode-toggle" role="group" aria-label="Locuteur">
            {(['examinateur', 'eleve'] as const).map((loc) => (
              <button
                key={loc}
                type="button"
                className={r.locuteur === loc ? 'active' : ''}
                onClick={() => onChange(repliques.map((x, k) => (k === i ? { ...x, locuteur: loc } : x)))}
              >
                {loc === 'examinateur' ? autreLabel : 'Élève'}
              </button>
            ))}
          </div>
          <TextField
            label="Texte"
            value={r.texte}
            multiline
            rows={2}
            onChange={(texte) => onChange(repliques.map((x, k) => (k === i ? { ...x, texte } : x)))}
          />
          {r.locuteur === 'eleve' ? (
            <LinesField
              label="Autres réponses possibles (une par ligne)"
              values={r.variantes ?? []}
              onChange={(variantes) => onChange(repliques.map((x, k) => (k === i ? { ...x, variantes } : x)))}
            />
          ) : null}
        </fieldset>
      ))}
      <div className="tcf-row">
        <button type="button" className="tcf-btn" onClick={() => onChange([...repliques, { locuteur: 'examinateur', texte: '' }])}>
          + réplique {autreLabel.toLowerCase()}
        </button>
        <button type="button" className="tcf-btn" onClick={() => onChange([...repliques, { locuteur: 'eleve', texte: '', variantes: [] }])}>
          + réplique élève
        </button>
      </div>
    </>
  )
}

/** Champs spécifiques au type d’exercice (support). */
function SupportEditor({
  ex,
  set,
  audioEntries,
}: {
  ex: TcfExercise
  set: (next: TcfExercise) => void
  /** Audios CO de la banque : choix → recharge questions + transcription. */
  audioEntries?: readonly TcfAudioEntry[]
}) {
  const pickAudio = (entry: TcfAudioEntry) => set(applyExerciseFromAudioBank(ex, entry.exercise))
  const audioBank = audioEntries && audioEntries.length > 0 ? audioEntries : undefined

  switch (ex.type_exercice) {
    case 'sms':
      return (
        <>
          <TextField label="Expéditeur" value={ex.support.expediteur} onChange={(expediteur) => set(withSupport(ex, { expediteur }))} />
          <TextField label="Texte du SMS" value={ex.support.texte} multiline onChange={(texte) => set(withSupport(ex, { texte }))} />
        </>
      )
    case 'email':
      return (
        <>
          <TextField label="De" value={ex.support.de} onChange={(de) => set(withSupport(ex, { de }))} />
          <TextField label="À" value={ex.support.a} onChange={(a) => set(withSupport(ex, { a }))} />
          <TextField label="Objet" value={ex.support.objet} onChange={(objet) => set(withSupport(ex, { objet }))} />
          <TextField label="Texte" value={ex.support.texte} multiline rows={6} onChange={(texte) => set(withSupport(ex, { texte }))} />
        </>
      )
    case 'annonce':
      return (
        <>
          <TextField label="Titre" value={ex.support.titre} onChange={(titre) => set(withSupport(ex, { titre }))} />
          <TextField label="Texte" value={ex.support.texte} multiline rows={5} onChange={(texte) => set(withSupport(ex, { texte }))} />
          <ImageField
            label="Image (optionnelle)"
            value={ex.support.image ?? ''}
            onChange={(image) => set(withSupport(ex, { image: image || null }))}
          />
        </>
      )
    case 'images_a_reconnaitre':
      return (
        <>
          <AudioField
            label="Audio"
            value={ex.support.audio}
            onChange={(audio) => set(withSupport(ex, { audio }))}
            bankEntries={audioBank}
            onPickFromBank={pickAudio}
          />
          <TextField
            label="Consigne"
            value={ex.consigne ?? ''}
            placeholder="Écoutez et cochez les images qui correspondent."
            onChange={(consigne) => set({ ...ex, consigne })}
          />
          <b>Images (exactement 5)</b>
          <ul className="tcf-choix-list">
            {ex.images.map((img, i) => (
              <li key={img.id} className="tcf-choix-row">
                <ImageField
                  label={`Image ${i + 1}`}
                  value={img.image}
                  onChange={(image) =>
                    set({ ...ex, images: ex.images.map((x, k) => (k === i ? { ...x, image } : x)) })
                  }
                />
                <label className="tcf-choix-fixe">
                  <input
                    type="checkbox"
                    checked={img.correct}
                    onChange={(event) =>
                      set({
                        ...ex,
                        images: ex.images.map((x, k) => (k === i ? { ...x, correct: event.target.checked } : x)),
                      })
                    }
                  />
                  à cocher
                </label>
                <label className="tcf-choix-fixe">
                  <input
                    type="checkbox"
                    checked={img.fixe === true}
                    onChange={(event) =>
                      set({
                        ...ex,
                        images: ex.images.map((x, k) =>
                          k === i ? { ...x, fixe: event.target.checked || undefined } : x,
                        ),
                      })
                    }
                  />
                  fixe
                </label>
              </li>
            ))}
          </ul>
          <div className="tcf-row">
            <label className="tcf-choix-fixe">
              <input
                type="checkbox"
                checked={ex.melanger !== false}
                onChange={(event) => set({ ...ex, melanger: event.target.checked })}
              />
              Mélanger les images
            </label>
            <label className="tcf-field is-number">
              <span>Notation</span>
              <select
                className="pill-input"
                value={ex.score ?? 'par_image'}
                onChange={(event) =>
                  set({ ...ex, score: event.target.value === 'tout_ou_rien' ? 'tout_ou_rien' : 'par_image' })
                }
              >
                <option value="par_image">Par image (sur 5)</option>
                <option value="tout_ou_rien">Tout ou rien</option>
              </select>
            </label>
          </div>
        </>
      )
    case 'six_courts':
    case 'trois_moyens':
      return (
        <>
          {ex.support.audios.map((audio, i) => (
            <AudioField
              key={i}
              label={`Audio ${i + 1}`}
              value={audio}
              onChange={(next) =>
                set(withSupport(ex, { audios: ex.support.audios.map((a, k) => (k === i ? next : a)) }))
              }
              bankEntries={audioBank}
              onPickFromBank={pickAudio}
            />
          ))}
        </>
      )
    case 'complet':
      return (
        <>
          <AudioField
            label="Audio"
            value={ex.support.audio}
            onChange={(audio) => set(withSupport(ex, { audio }))}
            bankEntries={audioBank}
            onPickFromBank={pickAudio}
          />
          <TextField
            label="Transcription (corrigé)"
            value={ex.support.transcription}
            multiline
            rows={5}
            onChange={(transcription) => set(withSupport(ex, { transcription }))}
          />
        </>
      )
    case 'association_images': {
      const n = ex.support.nb_dialogues
      return (
        <>
          <AudioField
            label="Audio (tous les dialogues)"
            value={ex.support.audio}
            onChange={(audio) => set(withSupport(ex, { audio }))}
            bankEntries={audioBank}
            onPickFromBank={pickAudio}
          />
          <NumberField
            label="Nombre de dialogues"
            value={n}
            min={1}
            max={8}
            onChange={(nb_dialogues) => set(withSupport(ex, { nb_dialogues: nb_dialogues ?? 1 }))}
          />
          <TextField
            label="Transcription (corrigé)"
            value={ex.support.transcription ?? ''}
            multiline
            rows={5}
            onChange={(transcription) => set(withSupport(ex, { transcription }))}
          />
          <b>Situations ({ex.situations.length})</b>
          <ul className="tcf-choix-list">
            {ex.situations.map((s, i) => (
              <li key={s.id} className="tcf-choix-row">
                <ImageField
                  label={`Situation ${i + 1}`}
                  value={s.image}
                  onChange={(image) =>
                    set({ ...ex, situations: ex.situations.map((x, k) => (k === i ? { ...x, image } : x)) })
                  }
                />
                <label className="tcf-field is-number">
                  <span>Dialogue n°</span>
                  <select
                    className="pill-input"
                    value={s.dialogue ?? ''}
                    onChange={(event) => {
                      const dialogue = event.target.value ? Number(event.target.value) : null
                      set({ ...ex, situations: ex.situations.map((x, k) => (k === i ? { ...x, dialogue } : x)) })
                    }}
                  >
                    <option value="">Aucun</option>
                    {Array.from({ length: n }, (_, k) => (
                      <option key={k} value={k + 1}>
                        {k + 1}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  className="calli-field-remove"
                  aria-label={`Supprimer la situation ${i + 1}`}
                  disabled={ex.situations.length <= 2}
                  onClick={() => set({ ...ex, situations: ex.situations.filter((_, k) => k !== i) })}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="tcf-btn"
            onClick={() =>
              set({
                ...ex,
                situations: [
                  ...ex.situations,
                  {
                    id: `s${Math.max(0, ...ex.situations.map((s) => Number(s.id.replace(/\D/g, '')) || 0)) + 1}`,
                    image: '',
                    dialogue: null,
                  },
                ],
              })
            }
          >
            + ajouter une situation
          </button>
        </>
      )
    }
    case 'formulaire': {
      const champs = ex.support.champs
      const setChamps = (next: TcfChampFormulaire[]) => set(withSupport(ex, { champs: next }))
      return (
        <>
          <TextField label="Titre du formulaire" value={ex.support.titre ?? ''} onChange={(titre) => set(withSupport(ex, { titre }))} />
          {champs.map((champ, i) => (
            <fieldset className="tcf-question-editor" key={i}>
              <legend>
                Champ {i + 1}
                <button
                  type="button"
                  className="calli-field-remove"
                  aria-label={`Supprimer le champ ${i + 1}`}
                  disabled={champs.length <= 1}
                  onClick={() => setChamps(champs.filter((_, k) => k !== i))}
                >
                  ×
                </button>
              </legend>
              <TextField
                label="Libellé"
                value={champ.label}
                onChange={(label) => setChamps(champs.map((c, k) => (k === i ? { ...c, label } : c)))}
              />
              <div className="mode-toggle is-4" role="group" aria-label="Type de champ">
                {CHAMP_TYPES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={champ.type === t.id ? 'active' : ''}
                    onClick={() => setChamps(champs.map((c, k) => (k === i ? { ...c, type: t.id } : c)))}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              {champ.type === 'choix' ? (
                <LinesField
                  label="Options (une par ligne)"
                  values={champ.options ?? []}
                  onChange={(options) => setChamps(champs.map((c, k) => (k === i ? { ...c, options } : c)))}
                />
              ) : null}
              <TextField
                label={champ.type === 'case' ? 'Corrigé (oui / non)' : 'Corrigé'}
                value={champ.corrige}
                onChange={(corrige) => setChamps(champs.map((c, k) => (k === i ? { ...c, corrige } : c)))}
              />
            </fieldset>
          ))}
          <button type="button" className="tcf-btn" onClick={() => setChamps([...champs, { label: '', type: 'texte', corrige: '' }])}>
            + ajouter un champ
          </button>
        </>
      )
    }
    case 'image_question':
      return (
        <>
          <ImageField label="Image" value={ex.support.image} onChange={(image) => set(withSupport(ex, { image }))} />
          <TextField label="Question / consigne" value={ex.support.consigne} multiline rows={2} onChange={(consigne) => set(withSupport(ex, { consigne }))} />
          <NbMotsFields value={ex.support.nb_mots} onChange={(nb_mots) => set(withSupport(ex, { nb_mots }))} />
          <TextField label="Réponse modèle (corrigé)" value={ex.support.reponse_modele ?? ''} multiline rows={2} onChange={(reponse_modele) => set(withSupport(ex, { reponse_modele }))} />
        </>
      )
    case 'sms_reponse':
      return (
        <>
          <TextField label="Expéditeur" value={ex.support.expediteur ?? ''} onChange={(expediteur) => set(withSupport(ex, { expediteur }))} />
          <TextField label="SMS reçu" value={ex.support.sms_recu} multiline onChange={(sms_recu) => set(withSupport(ex, { sms_recu }))} />
          <TextField label="Consigne" value={ex.support.consigne} multiline rows={2} onChange={(consigne) => set(withSupport(ex, { consigne }))} />
          <NbMotsFields value={ex.support.nb_mots} onChange={(nb_mots) => set(withSupport(ex, { nb_mots }))} />
          <TextField label="Réponse modèle (corrigé)" value={ex.support.reponse_modele ?? ''} multiline onChange={(reponse_modele) => set(withSupport(ex, { reponse_modele }))} />
        </>
      )
    case 'email_reponse': {
      const recu = ex.support.email_recu
      return (
        <>
          <TextField label="De" value={recu.de} onChange={(de) => set(withSupport(ex, { email_recu: { ...recu, de } }))} />
          <TextField label="Objet" value={recu.objet} onChange={(objet) => set(withSupport(ex, { email_recu: { ...recu, objet } }))} />
          <TextField label="E-mail reçu" value={recu.texte} multiline rows={5} onChange={(texte) => set(withSupport(ex, { email_recu: { ...recu, texte } }))} />
          <TextField label="Consigne" value={ex.support.consigne} multiline rows={2} onChange={(consigne) => set(withSupport(ex, { consigne }))} />
          <NbMotsFields value={ex.support.nb_mots} onChange={(nb_mots) => set(withSupport(ex, { nb_mots }))} />
          <TextField label="Réponse modèle (corrigé)" value={ex.support.reponse_modele ?? ''} multiline rows={4} onChange={(reponse_modele) => set(withSupport(ex, { reponse_modele }))} />
        </>
      )
    }
    case 'question_texte':
      return (
        <>
          <TextField label="Question / texte" value={ex.support.consigne} multiline rows={3} onChange={(consigne) => set(withSupport(ex, { consigne }))} />
          <div className="tcf-row">
            <TextField
              label="E-mail : destinataire (optionnel)"
              value={ex.support.email?.a ?? ''}
              onChange={(a) => set(withSupport(ex, { email: a || ex.support.email?.objet ? { a, objet: ex.support.email?.objet ?? '' } : undefined }))}
            />
            <TextField
              label="E-mail : objet"
              value={ex.support.email?.objet ?? ''}
              onChange={(objet) => set(withSupport(ex, { email: objet || ex.support.email?.a ? { a: ex.support.email?.a ?? '', objet } : undefined }))}
            />
          </div>
          <NbMotsFields value={ex.support.nb_mots} onChange={(nb_mots) => set(withSupport(ex, { nb_mots }))} />
          <TextField label="Réponse modèle (corrigé)" value={ex.support.reponse_modele ?? ''} multiline rows={4} onChange={(reponse_modele) => set(withSupport(ex, { reponse_modele }))} />
        </>
      )
    case 'mots_theme':
      return (
        <>
          <AudioField label="Audio (optionnel)" value={ex.support.audio ?? ''} onChange={(audio) => set(withSupport(ex, { audio: audio || undefined }))} />
          <TextField label="Thème" value={ex.support.theme} onChange={(theme) => set(withSupport(ex, { theme }))} />
          <LinesField label="Mots (un par ligne)" values={ex.support.mots} onChange={(mots) => set(withSupport(ex, { mots }))} />
          <LinesField
            label="Exemples de questions (corrigé, une par ligne)"
            values={ex.support.exemples_questions}
            onChange={(exemples_questions) => set(withSupport(ex, { exemples_questions }))}
          />
        </>
      )
    case 'entretien':
      return (
        <LinesField
          label="Questions de l’examinateur (corrigé, une par ligne)"
          values={ex.support.questions}
          onChange={(questions) => set(withSupport(ex, { questions }))}
        />
      )
    case 'trois_themes': {
      const themes = ex.support.themes
      const setTheme = (i: number, patch: Partial<TcfPoTheme>) =>
        set(withSupport(ex, { themes: themes.map((t, k) => (k === i ? { ...t, ...patch } : t)) }))
      return (
        <>
          <small className="muted">3 thèmes et 4 images par thème sont tirés au hasard.</small>
          {themes.map((t, i) => (
            <div className="tcf-question-editor" key={i}>
              <div className="tcf-row">
                <TextField label={`Thème ${i + 1}`} value={t.theme} onChange={(theme) => setTheme(i, { theme })} />
                <button
                  type="button"
                  className="tcf-btn"
                  onClick={() => set(withSupport(ex, { themes: themes.filter((_, k) => k !== i) }))}
                >
                  Retirer
                </button>
              </div>
              <LinesField label="Images (chemins, une par ligne)" values={t.images} onChange={(images) => setTheme(i, { images })} />
              <LinesField
                label="Exemples de questions (corrigé)"
                values={t.exemples_questions}
                onChange={(exemples_questions) => setTheme(i, { exemples_questions })}
              />
            </div>
          ))}
          <button
            type="button"
            className="tcf-btn"
            onClick={() => set(withSupport(ex, { themes: [...themes, { theme: '', images: [''], exemples_questions: [''] }] }))}
          >
            + ajouter un thème
          </button>
        </>
      )
    }
    case 'image_interaction':
      return (
        <>
          {ex.support.images.map((img, i) => (
            <ImageField
              key={i}
              label={ex.support.images.length > 1 ? `Image ${i + 1}` : 'Image'}
              value={img}
              onChange={(next) => set(withSupport(ex, { images: ex.support.images.map((x, k) => (k === i ? next : x)) }))}
            />
          ))}
          <LinesField label="Questions de description (une par ligne)" values={ex.support.questions} onChange={(questions) => set(withSupport(ex, { questions }))} />
          <TextField
            label="Description modèle (corrigé)"
            value={ex.support.description_modele}
            multiline
            rows={3}
            onChange={(description_modele) => set(withSupport(ex, { description_modele }))}
          />
          <div className="tcf-row">
            <TextField label="Je suis (examinateur)" value={ex.support.je_suis} onChange={(je_suis) => set(withSupport(ex, { je_suis }))} />
            <TextField label="Vous êtes (candidat)" value={ex.support.vous_etes} onChange={(vous_etes) => set(withSupport(ex, { vous_etes }))} />
          </div>
          <div className="tcf-row">
            <TextField label="Nous sommes (lieu)" value={ex.support.lieu} onChange={(lieu) => set(withSupport(ex, { lieu }))} />
            <TextField label="Vous voulez" value={ex.support.vous_voulez} onChange={(vous_voulez) => set(withSupport(ex, { vous_voulez }))} />
          </div>
          <RepliquesFields
            repliques={ex.support.repliques}
            autreLabel="Examinateur·trice"
            onChange={(repliques) => set(withSupport(ex, { repliques }))}
          />
        </>
      )
    case 'sequence_4_images':
      return (
        <>
          {ex.support.images.map((img, i) => (
            <ImageField
              key={i}
              label={`Image ${i + 1}`}
              value={img}
              onChange={(next) => set(withSupport(ex, { images: ex.support.images.map((x, k) => (k === i ? next : x)) }))}
            />
          ))}
          <TextField label="Réponse modèle (corrigé)" value={ex.support.reponse_modele} multiline rows={4} onChange={(reponse_modele) => set(withSupport(ex, { reponse_modele }))} />
        </>
      )
    case 'image_unique':
      return (
        <>
          <ImageField label="Image" value={ex.support.image} onChange={(image) => set(withSupport(ex, { image }))} />
          <LinesField
            label="Questions guides (une par ligne, optionnel)"
            values={ex.support.questions ?? []}
            onChange={(questions) => set(withSupport(ex, { questions }))}
          />
          <TextField label="Réponse modèle (corrigé)" value={ex.support.reponse_modele} multiline rows={4} onChange={(reponse_modele) => set(withSupport(ex, { reponse_modele }))} />
        </>
      )
    case 'dialogue': {
      const repliques = ex.support.repliques
      const setRepliques = (next: TcfReplique[]) => set(withSupport(ex, { repliques: next }))
      const grille = ex.support.grille
      return (
        <>
          <TextField label="Situation" value={ex.support.situation} multiline rows={2} onChange={(situation) => set(withSupport(ex, { situation }))} />
          <AudioField label="Audio (optionnel)" value={ex.support.audio ?? ''} onChange={(audio) => set(withSupport(ex, { audio: audio || undefined }))} />
          <label className="tcf-choix-fixe">
            <input
              type="checkbox"
              checked={ex.support.repliques_au_corrige === true}
              onChange={(event) => set(withSupport(ex, { repliques_au_corrige: event.target.checked || undefined }))}
            />
            Répliques au corrigé seulement (dialogue simulé)
          </label>
          <LinesField
            label="Images (chemins, une par ligne, optionnel)"
            values={ex.support.images ?? []}
            onChange={(images) => set(withSupport(ex, { images }))}
          />
          <div className="tcf-row">
            <LinesField
              label="Grille de l’oral : critères (un par ligne)"
              values={grille?.criteres ?? []}
              onChange={(criteres) =>
                set(withSupport(ex, { grille: criteres.some((c) => c.trim()) ? { points: grille?.points ?? 1, criteres } : undefined }))
              }
            />
            <NumberField
              label="Points de la grille"
              value={grille?.points}
              min={0}
              max={50}
              onChange={(points) => (grille ? set(withSupport(ex, { grille: { ...grille, points: points ?? 0 } })) : undefined)}
            />
          </div>
          <RepliquesFields repliques={repliques} autreLabel="Examinateur·trice" onChange={setRepliques} />
        </>
      )
    }
    case 'dialogue_a_completer':
      return (
        <>
          <TextField
            label="Situation (optionnel)"
            value={ex.support.situation ?? ''}
            multiline
            rows={2}
            onChange={(situation) => set(withSupport(ex, { situation: situation || undefined }))}
          />
          <TextField
            label="Nom de l’interlocuteur (ex. : Votre ami)"
            value={ex.support.interlocuteur ?? ''}
            onChange={(interlocuteur) => set(withSupport(ex, { interlocuteur: interlocuteur || undefined }))}
          />
          <RepliquesFields
            repliques={ex.support.repliques}
            autreLabel="Interlocuteur"
            onChange={(repliques) => set(withSupport(ex, { repliques }))}
          />
        </>
      )
  }
}

/** Nettoie les listes « une par ligne » avant export (lignes vides retirées). */
function cleanForExport(raw: TcfExercise): TcfExercise {
  const ex: TcfExercise = {
    ...raw,
    questions: raw.questions.map((q) =>
      q.type_reponse === 'lignes' && q.tableau
        ? { ...q, tableau: q.tableau.filter((row) => row.label.trim()) }
        : q,
    ),
  }
  switch (ex.type_exercice) {
    case 'image_unique':
      return withSupport(ex, { questions: (ex.support.questions ?? []).filter((q) => q.trim()) })
    case 'entretien':
      return withSupport(ex, { questions: ex.support.questions.filter((q) => q.trim()) })
    case 'trois_themes':
      return withSupport(ex, {
        themes: ex.support.themes
          .filter((t) => t.theme.trim())
          .map((t) => ({
            ...t,
            images: t.images.filter((src) => src.trim()),
            exemples_questions: t.exemples_questions.filter((q) => q.trim()),
          })),
      })
    case 'image_interaction':
      return withSupport(ex, {
        images: ex.support.images.filter((src) => src.trim()),
        questions: ex.support.questions.filter((q) => q.trim()),
      })
    case 'mots_theme':
      return withSupport(ex, {
        mots: ex.support.mots.filter((m) => m.trim()),
        exemples_questions: ex.support.exemples_questions.filter((q) => q.trim()),
      })
    case 'dialogue':
      return withSupport(ex, {
        repliques: ex.support.repliques.map((r) =>
          r.locuteur === 'eleve' ? { ...r, variantes: (r.variantes ?? []).filter((v) => v.trim()) } : r,
        ),
        images: (ex.support.images ?? []).filter((src) => src.trim()),
        grille: ex.support.grille
          ? { ...ex.support.grille, criteres: ex.support.grille.criteres.filter((c) => c.trim()) }
          : undefined,
      })
    case 'dialogue_a_completer':
      return withSupport(ex, {
        repliques: ex.support.repliques.map((r) =>
          r.locuteur === 'eleve' ? { ...r, variantes: (r.variantes ?? []).filter((v) => v.trim()) } : r,
        ),
      })
    case 'formulaire':
      return withSupport(ex, {
        champs: ex.support.champs.map((c) =>
          c.type === 'choix' ? { ...c, options: (c.options ?? []).filter((o) => o.trim()) } : c,
        ),
      })
    default:
      return ex
  }
}

/**
 * Choix de l’exercice dans la banque (panneau de gauche) :
 * Scénario (loisirs, école…) puis Exercice, libellé par sa scène.
 */
export function TcfBankPicker({
  niveau,
  typeId,
  scenario,
  bankId,
  edited,
  onChange,
}: {
  niveau: TcfNiveau
  typeId: string
  scenario?: string
  bankId?: string
  edited: boolean
  onChange: (patch: EditorPatch) => void
}) {
  const slot = tcfSlotByTypeId[typeId]
  const bank = useMemo(() => (slot ? tcfSlotBank(niveau, slot) : []), [slot, niveau])
  const groups = useMemo(() => tcfScenarioGroups(bank), [bank])
  if (!slot || bank.length === 0) return null
  const shown = scenario ? groups.filter((g) => g.id === scenario) : groups
  const options = (group: TcfScenarioGroup) =>
    group.items.map(({ exercise, label }) => (
      <option key={exercise.id} value={exercise.id}>
        {label}
      </option>
    ))

  const byTheme = slot.competence === 'PE' || slot.competence === 'PO'

  return (
    <div className="quad-libre-block tcf-editor">
      <label className="tcf-field">
        <span>{byTheme ? 'Thème' : 'Scénario'}</span>
        <select
          className="pill-input"
          value={scenario ?? ''}
          onChange={(event) => onChange({ tcfScenario: event.target.value || undefined, tcfBankId: undefined, tcfExercise: undefined })}
        >
          <option value="">
            {byTheme ? 'Tous les thèmes' : 'Tous les scénarios'} ({bank.length})
          </option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.label} ({g.items.length})
            </option>
          ))}
        </select>
      </label>
      <label className="tcf-field">
        <span>Exercice</span>
        <select
          className="pill-input"
          value={bankId ?? ''}
          onChange={(event) => onChange({ tcfBankId: event.target.value || undefined, tcfExercise: undefined })}
        >
          <option value="">Tout</option>
          {shown.length === 1
            ? options(shown[0]!)
            : shown.map((g) => (
                <optgroup key={g.id} label={g.label}>
                  {options(g)}
                </optgroup>
              ))}
        </select>
      </label>
      {edited ? <small className="muted">Exercice modifié en mode libre : choisir un exercice ici remet celui de la banque.</small> : null}
    </div>
  )
}

/**
 * Mode libre (panneau de droite) : l’exercice affiché est modifiable directement.
 * Sans modification, on part d’une copie de l’exercice de la banque affiché.
 */
export function TcfExerciseEditor({
  niveau,
  typeId,
  exercise: edits,
  bankId,
  shownId,
  onChange,
}: {
  niveau: TcfNiveau
  typeId: string
  exercise?: TcfExercise
  bankId?: string
  /** Exercice de banque affiché sur la fiche (tirage selon la graine). */
  shownId?: string
  onChange: (patch: EditorPatch) => void
}) {
  const slot = tcfSlotByTypeId[typeId]
  const bank = useMemo(() => (slot ? tcfSlotBank(niveau, slot) : []), [slot, niveau])
  const types = useMemo(() => TCF_TYPES.filter((t) => t.competence === slot?.competence), [slot])
  const edited = edits != null && slot != null && edits.competence === slot.competence
  const fallback = useMemo(() => {
    if (!slot) return undefined
    const source = [tcfExerciseById(bankId), tcfExerciseById(shownId), bank[0]].find(
      (ex) => ex != null && ex.competence === slot.competence,
    )
    if (source) return structuredClone(source)
    const first = TCF_TYPES.find((t) => t.competence === slot.competence)!
    return emptyTcfExercise(niveau, slot.competence, first.typeExercice, tcfExerciseId(niveau, slot.competence, 1))
  }, [slot, bankId, shownId, bank, niveau])
  const current = edited ? edits : fallback
  /** Tous les audios CO du niveau : choisir un audio recharge questions + transcription. */
  const coAudioEntries = useMemo(
    () => (slot?.competence === 'CO' ? tcfAudioEntries(tcfBank(niveau, 'CO')) : []),
    [slot?.competence, niveau],
  )
  // Résultats rattachés à la version de l’exercice : toute modification les efface.
  const [mediaCheck, setMediaCheck] = useState<{ for: TcfExercise; errors: string[] } | null>(null)
  const [copiedFor, setCopiedFor] = useState<TcfExercise | null>(null)
  const mediaErrors = mediaCheck && mediaCheck.for === current ? mediaCheck.errors : null
  const copied = copiedFor != null && copiedFor === current
  const meta = current ? tcfTypeMeta(current.competence, current.type_exercice) : undefined
  const validation = useMemo(() => (current ? validateTcfExercise(current) : null), [current])

  if (!slot || !current) return null

  const set = (next: TcfExercise) => onChange({ tcfExercise: { ...next, niveau } })

  function startBlank(typeExercice: TcfTypeExercice = types[0]!.typeExercice) {
    if (!slot) return
    const total = tcfBank(niveau, slot.competence).length
    onChange({ tcfExercise: emptyTcfExercise(niveau, slot.competence, typeExercice, tcfExerciseId(niveau, slot.competence, total + 1)) })
  }

  async function exportJson(kind: 'copy' | 'download') {
    const exercise = current
    if (!exercise) return
    const json = JSON.stringify(cleanForExport(exercise), null, 2)
    if (kind === 'copy') {
      await navigator.clipboard.writeText(json)
      setCopiedFor(exercise)
      return
    }
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `${exercise.id || 'tcf-exercice'}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exercise = current
  const usesQuestions = (meta?.reponses.length ?? 0) > 0
  const audioCount =
    exercise.type_exercice === 'six_courts' || exercise.type_exercice === 'trois_moyens'
      ? exercise.support.audios.length
      : undefined
  const hasConsigneSupp =
    exercise.type_exercice === 'sms_reponse' ||
    exercise.type_exercice === 'email_reponse' ||
    exercise.type_exercice === 'question_texte'

  return (
    <div className="quad-libre-block tcf-editor">
      <b>Exercice TCF</b>
      <div className="tcf-row">
        <button type="button" className="tcf-btn" disabled={!edited} onClick={() => onChange({ tcfExercise: undefined })}>
          Revenir à la banque
        </button>
        <button type="button" className="tcf-btn" onClick={() => startBlank()}>
          Nouvel exercice vide
        </button>
      </div>
      <small className="muted">
        {edited ? 'Exercice modifié : la fiche affiche cette version.' : 'Exercice de la banque : toute modification crée une version libre.'}
      </small>
      <>
          <label className="tcf-field">
            <span>Type d’exercice (le changer vide le contenu)</span>
            <select
              className="pill-input"
              value={exercise.type_exercice}
              onChange={(event) => startBlank(event.target.value as TcfTypeExercice)}
            >
              {types.map((t) => (
                <option key={t.typeId} value={t.typeExercice}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <div className="tcf-row">
            <TextField label="Identifiant" value={exercise.id} onChange={(id) => set({ ...exercise, id })} />
            <TextField label="Thème" value={exercise.theme ?? ''} onChange={(theme) => set({ ...exercise, theme })} />
          </div>
          {exercise.type_exercice !== 'images_a_reconnaitre' ? (
            <TextField
              label="Consigne (sinon consigne du type)"
              value={exercise.consigne ?? ''}
              placeholder={meta?.instruction ?? slot.instruction}
              onChange={(consigne) => set({ ...exercise, consigne: consigne || undefined })}
            />
          ) : null}

          {!usesQuestions ? (
            <NumberField
              label="Points de l’exercice (0 = page)"
              value={exercise.points ?? 0}
              min={0}
              max={50}
              step={0.5}
              onChange={(points) => set({ ...exercise, points: points > 0 ? points : undefined })}
            />
          ) : null}

          <SupportEditor ex={exercise} set={set} audioEntries={coAudioEntries} />

          {hasConsigneSupp ? (
            <TextField
              label="Consigne supplémentaire (sous le texte)"
              value={exercise.consigne_supplementaire ?? ''}
              multiline
              rows={2}
              onChange={(consigne_supplementaire) => set({ ...exercise, consigne_supplementaire })}
            />
          ) : null}

          {usesQuestions ? (
            <>
              <b>Questions ({exercise.questions.length})</b>
              {exercise.questions.map((q, i) => (
                <QuestionEditor
                  key={i}
                  index={i}
                  question={q}
                  reponses={meta?.reponses ?? []}
                  audioCount={audioCount}
                  onChange={(next) => set({ ...exercise, questions: exercise.questions.map((x, k) => (k === i ? next : x)) })}
                  onRemove={() => set({ ...exercise, questions: exercise.questions.filter((_, k) => k !== i) })}
                />
              ))}
              <button
                type="button"
                className="tcf-btn"
                onClick={() => {
                  const last = exercise.questions[exercise.questions.length - 1]
                  const next = emptyTcfQuestion(last?.type_reponse ?? meta?.reponses[0] ?? 'qcm_texte')
                  set({ ...exercise, questions: [...exercise.questions, audioCount ? { ...next, audio: last?.audio ?? 1 } : next] })
                }}
              >
                + ajouter une question
              </button>
            </>
          ) : null}

          {validation && validation.errors.length > 0 ? (
            <ul className="tcf-errors" role="alert">
              {validation.errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          ) : (
            <p className="tcf-ok">Exercice valide.</p>
          )}
          {validation && validation.warnings.length > 0 ? (
            <ul className="tcf-warnings">
              {validation.warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          ) : null}
          {mediaErrors ? (
            mediaErrors.length > 0 ? (
              <ul className="tcf-errors" role="alert">
                {mediaErrors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            ) : (
              <p className="tcf-ok">Tous les fichiers référencés existent.</p>
            )
          ) : null}
          <div className="tcf-row">
            <button type="button" className="tcf-btn" onClick={() => void checkTcfMedia(exercise).then((errors) => setMediaCheck({ for: exercise, errors }))}>
              Vérifier les fichiers
            </button>
            <button
              type="button"
              className="tcf-btn"
              disabled={(validation?.errors.length ?? 0) > 0}
              onClick={() => void exportJson('copy')}
            >
              {copied ? 'JSON copié' : 'Copier le JSON'}
            </button>
            <button
              type="button"
              className="tcf-btn"
              disabled={(validation?.errors.length ?? 0) > 0}
              onClick={() => void exportJson('download')}
            >
              Télécharger
            </button>
          </div>
          <small className="muted">
            L’export est bloqué tant qu’il reste des erreurs. Collez le JSON dans src/content/tcf/{niveau.toLowerCase()}/{slot.competence.toLowerCase()}.json.
          </small>
      </>
    </div>
  )
}
