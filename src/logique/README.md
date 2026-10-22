# Logique

Domaine ClairFLE pour les fiches de logique scolaire (esprit CSC « Logique et espace »).
Chaque **thème** du sélecteur est un type d’exercice (pas de regroupement simple / complexe).

| Fichier | Rôle |
|---|---|
| `catalog.ts` | Thèmes = types (suite graphique, intrus, matrice…) |
| `bank.json` | Banque d’exercices (chemins d’images) |
| `generate.ts` | Tirage déterministe dans la banque (`createRng`) |
| `types.ts` | `LogiquePuzzle`, `isLogiqueType` |
| `../components/item-view/logique.tsx` | Rendu images + cases à cocher |
| `../../public/lib/images/logique/` | Graphiques importés des Word CSC |
| `../../scripts/tmp-import-logique.mjs` | Réimport Word → webp + bank.json |

## Thèmes

- Suite graphique · Suite logique · Suite de formes
- Trouver l’intrus · Rotation
- Matrice · Assemblage · Superposition · Cube

La consigne est au niveau de l’exercice ; chaque item n’affiche que son numéro et les images.
