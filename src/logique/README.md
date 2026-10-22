# Logique

Domaine ClairFLE pour les fiches de logique scolaire (esprit CSC « Logique et espace ») :
suites graphiques, intrus, rotations, matrices, assemblages, superpositions et cubes.

| Fichier | Rôle |
|---|---|
| `catalog.ts` | Thèmes `logique-simple` / `logique-complexe` + types |
| `generate.ts` | Tirage déterministe (`createRng`) |
| `types.ts` | `LogiquePuzzle`, `isLogiqueType` |
| `../components/item-view/logique.tsx` | Rendu SVG N&B |

## Types

- **Suite graphique** — continuer une suite de formes
- **Trouver l’intrus** — colorier la forme qui ne suit pas la règle
- **Rotation** — retrouver la même forme après rotation
- **Matrice** — compléter une case manquante
- **Assemblage** — choisir l’assemblage des pièces
- **Superposition** — résultat de deux formes superposées
- **Cube** — compter / ajouter / enlever des cubes empilés

Rien n’est copié des fiches Word de référence : on reprend l’esprit pédagogique, avec des formes SVG originales.
