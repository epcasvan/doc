/** Domaine TPM (test de placement de mathématiques) — hors `src/math/`. */

export {
  TPM_DOMAIN,
  TPM_DOCUMENT_TITLE,
  TPM_MAX_SCORE,
  TPM_STEPS,
  blockPointsTotal,
  buildTpmTestPages,
  formatPointsLabel,
  isTpmConsignesType,
  isTpmDomain,
} from './test'

export { generateTpmConversionsBatch } from './conversions'
export { generateTpmEquationsBatch } from './equations'
export { generateTpmEvaluerBatch } from './evaluer'
export {
  generateTpmInformations,
  isTpmFamilyConsignesType,
  type TpmInfoVariant,
} from './informations'
export { tryGenerateTpmItems } from './items'
export { generateTpmPrioriteBatch } from './priorite'
export { generateTpmProportionKgBatch } from './proportion-kg'
export { generateTpmReduireBatch } from './reduire'
