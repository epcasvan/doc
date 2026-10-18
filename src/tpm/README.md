# TPM — Test de placement de mathématiques

Miroir de `src/tcf/` : domaine à part, **pas** dans `src/math/`.

| Fichier | Rôle |
|---|---|
| `test.ts` | Recette multi-pages, consignes, helpers UI (`isTpmDomain`, points…) |
| `items.ts` | `tryGenerateTpmItems` — tous les générateurs `tpm-*` (dispatch depuis `math/generate.ts`) |
| `conversions.ts` | Exercices conversions |
| `equations.ts` | Équations |
| `evaluer.ts` | Évaluer des expressions |
| `priorite.ts` | Priorité des opérations |
| `proportion-kg.ts` | Proportionnalité |
| `reduire.ts` | Réduire des expressions |
| `index.ts` | Réexports |

## Domaines voisins (stubs séparés)

- `src/tcm-csc/` / `src/tcm-cfr/` — stubs admin **vides** (pas une copie de cette recette)
- `src/acm/` — **Activités créatives et manuelles** (domaine distinct, pas un test maths)

Imports : `@/tpm/test`, `@/tpm/items`, `@/tpm/evaluer`, ou `@/tpm`.
