import type { MathItem, PreviewMode } from '@/math/types'
import type { TcfSheetItem, TcfTypeReponse } from '@/tcf/types'
import { TcfInformations } from './TcfInformations'
import { TexteSupport } from './TexteSupport'
import { DialoguePO, FormulairePE, ZoneEcriture } from './TcfProduction'
import {
  AssociationSituations,
  GrilleOral,
  ImagesACocher,
  QuestionLignes,
  QuestionQCMImage,
  QuestionQCMTexte,
} from './TcfQuestions'

/** Applique la forme active (Texte / Image / Phrase) stockée sur l’item. */
function withActiveForm(tcf: TcfSheetItem, formMode?: TcfTypeReponse): TcfSheetItem {
  if (tcf.kind !== 'qcm' && tcf.kind !== 'lignes') return tcf
  const fs = tcf.formSelect
  if (!fs) return tcf
  const active = formMode && fs.filled.includes(formMode) ? formMode : fs.active
  const variant = fs.variants[active]
  if (!variant) return { ...tcf, formSelect: { ...fs, active } }
  const head = {
    numero: tcf.numero,
    enonce: tcf.enonce,
    audioLabel: tcf.audioLabel,
    image: tcf.image,
    formSelect: { ...fs, active },
  }
  if (variant.kind === 'lignes') {
    return {
      kind: 'lignes',
      ...head,
      nbLignes: variant.nbLignes ?? 2,
      reponseModele: variant.reponseModele,
      tableau: variant.tableau,
    }
  }
  return {
    kind: 'qcm',
    ...head,
    mode: variant.mode ?? 'texte',
    choix: variant.choix ?? [],
  }
}

/**
 * Rendu d’un item TCF (layout `tcf`). Fiche élève et corrigé partagent
 * les mêmes items (mêmes choix mélangés) : seul `mode` change.
 */
export function TcfItemView({
  item,
  mode,
  tcfFormMode,
}: {
  item: MathItem
  mode: PreviewMode
  tcfFormMode?: TcfTypeReponse
}) {
  const raw = item.tcf
  if (!raw) return null
  const tcf = withActiveForm(raw, tcfFormMode)
  const points = item.points
  switch (tcf.kind) {
    case 'support':
      return <TexteSupport exercise={tcf.exercise} mode={mode} />
    case 'qcm':
      return tcf.mode === 'image' ? (
        <QuestionQCMImage {...tcf} points={points} mode={mode} />
      ) : (
        <QuestionQCMTexte {...tcf} points={points} mode={mode} />
      )
    case 'lignes':
      return <QuestionLignes {...tcf} points={points} mode={mode} />
    case 'images_a_cocher':
      return <ImagesACocher {...tcf} mode={mode} />
    case 'association':
      return <AssociationSituations situations={tcf.situations} mode={mode} />
    case 'formulaire':
      return <FormulairePE titre={tcf.titre} champs={tcf.champs} mode={mode} />
    case 'ecriture':
      return <ZoneEcriture {...tcf} mode={mode} />
    case 'dialogue':
      return <DialoguePO {...tcf} mode={mode} />
    case 'grille':
      return <GrilleOral grille={tcf.grille} />
    case 'vide':
      return <p className="tcf-vide">{tcf.message}</p>
    case 'informations':
      return <TcfInformations />
  }
}
