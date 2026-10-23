# Grammaire — théorie FALC (SCAI) + exercices

Domaine dédié pour les **fiches de théorie** FALC et les **exercices** liés à chaque sous-thème.

| Fichier / dossier | Rôle |
|---|---|
| `catalog.ts` | Thèmes SCAI + types théorie + types exercices |
| `theory/*.ts` | Contenu FALC français |
| `exercises/` | kinds, sous-thèmes, banques, générateur |
| `exercises/bank/word-a1.ts` / `word-a2.ts` | Tous les exercices des Word auteur (Grammaire.docx / Grammaire Suite.docx) |
| `exercises/bank/lessons-word-*.ts` | Relu mot à mot (se présenter, décrire, -er, jours / mois / heures / invitation CSC) |
| `exercises/bank/lessons-core.ts` / `lessons-rest.ts` | Compléments ClairFLE (mêmes types) |
| `generate.ts` | Théorie **ou** exercices selon le type |

## UI

1. **Thème** = partie SCAI (ex. Conjuguer au présent)
2. **Sous-thème** = notion (Être, Avoir, -er… / Passé composé… / fiche théorie)
3. **Type** = **Théorie** + exercices du sous-thème (libellés de leçon)

Les énoncés d’exercices reprennent les phrases des Word auteur (`Grammaire.docx`, `Grammaire Suite.docx`) et des fiches CSC (exercices seulement, pas la théorie). Les MP3 CSC sont dans `public/lib/audio/grammaire/`. Les fiches de théorie FALC restent le type **Théorie**. Les banques ClairFLE complètent les mêmes types sans en créer de doublons.

## Types d’exercice (kinds)

1. Choisissez la bonne conjugaison (QCM)
2. Conjuguez le verbe (ligne)
3. Choisissez le verbe correct (QCM)
4. Mettre au pluriel
5. Mettre au singulier
6. Mettre à la forme négative
7. Mettre à la forme affirmative
8. Écrire une phrase
9. Associer
10. Remettre dans l’ordre
11. Transformer la phrase
12. Corriger la phrase

Les libellés du sélecteur viennent de `GramLesson.label` (ex. « Compléter avec être »).

## Déterminisme

Tirage via `createRng(seed)` + `shuffle` ; jamais `Math.random()` dans le générateur.
