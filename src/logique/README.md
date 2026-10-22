# Logique

Domaine ClairFLE pour les fiches de logique scolaire (esprit CSC « Logique et espace ») :
suites, intrus, rotations, matrices, assemblages, superpositions et cubes.

| Fichier | Rôle |
|---|---|
| `catalog.ts` | Thèmes `logique-simple` / `logique-complexe` + types |
| `bank.json` | Banque d’exercices (chemins d’images) |
| `generate.ts` | Tirage déterministe dans la banque (`createRng`) |
| `types.ts` | `LogiquePuzzle`, `isLogiqueType` |
| `../components/item-view/logique.tsx` | Rendu images + cases à cocher |
| `../../public/lib/images/logique/` | Graphiques importés des Word CSC |
| `../../scripts/tmp-import-logique.mjs` | Réimport Word → webp + bank.json |

## Types

### Logique simple
- **Suite graphique** — continuer une suite de formes
- **Suite logique** — suites (nombres / symboles / figures)
- **Suite de formes** — suites de formes géométriques
- **Trouver l’intrus** — cocher la forme hors règle
- **Rotation** — retrouver la même forme après rotation

### Logique complexe
- **Matrice** — compléter une case manquante
- **Assemblage** — choisir l’assemblage des pièces
- **Superposition** — résultat de formes superposées
- **Cube** — compter / ajouter / enlever des cubes

La consigne est au niveau de l’exercice (une fois) ; chaque item n’affiche que son numéro et les images. Les réponses QCM se cochent ; le corrigé coche la bonne case quand l’index est connu.
