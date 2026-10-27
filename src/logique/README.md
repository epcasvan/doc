# Logique

Domaine ClairFLE pour les fiches de logique scolaire (esprit CSC « Logique et espace »).
Chaque **thème** du sélecteur est un type d’exercice.

| Fichier | Rôle |
|---|---|
| `catalog.ts` | Thèmes = types |
| `bank.json` | Banque d’exercices (chemins d’images) |
| `generate.ts` | Tirage déterministe (`createRng`), mélange des réponses |
| `types.ts` | `LogiquePuzzle`, `isLogiqueType` |
| `../components/item-view/logique.tsx` | Rendu images + cases à cocher |
| `../../public/lib/images/logique/` | Graphiques Word CSC |
| `../../scripts/tmp-import-logique.mjs` | Réimport Word → webp + bank.json |

## Thèmes

- Suite graphique · Trouver l’intrus · Rotation
- Matrice · Assemblage
- **Case manquante** (disposition type matrice) · **Case intrus** (1 image, coloriage)
- Cube
