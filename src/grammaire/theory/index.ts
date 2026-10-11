import type { GrammaireTheoryDoc } from '../types'
import { sePresenterDocs } from './se-presenter'
import { presentDocs } from './present'
import { entrerContactDocs } from './entrer-contact'
import { questionsDocs } from './questions'
import { activiteDocs } from './activite'
import { espaceDocs } from './espace'
import { tempsDocs } from './temps'
import { demanderDocs } from './demander'
import { decrireDocs } from './decrire'
import { conseillerDocs } from './conseiller'
import { alimentsDocs } from './aliments'
import { passeDocs } from './passe'
import { pronomsDocs } from './pronoms'
import { actionDocs } from './action'
import { avenirDocs } from './avenir'
import { faitsDocs } from './faits'
import { argumenterDocs } from './argumenter'
import { exprimerDocs } from './exprimer'
import { aideDocs } from './aide'

export const GRAMMAIRE_THEORY_DOCS: GrammaireTheoryDoc[] = [
  ...sePresenterDocs,
  ...presentDocs,
  ...entrerContactDocs,
  ...questionsDocs,
  ...activiteDocs,
  ...espaceDocs,
  ...tempsDocs,
  ...demanderDocs,
  ...decrireDocs,
  ...conseillerDocs,
  ...alimentsDocs,
  ...passeDocs,
  ...pronomsDocs,
  ...actionDocs,
  ...avenirDocs,
  ...faitsDocs,
  ...argumenterDocs,
  ...exprimerDocs,
  ...aideDocs,
]

export const theoryDocByTypeId: Record<string, GrammaireTheoryDoc> = Object.fromEntries(
  GRAMMAIRE_THEORY_DOCS.map((doc) => [doc.typeId, doc]),
)

