# Grammaire — théorie FALC (SCAI) + exercices

Domaine dédié pour les **fiches de théorie** FALC et les **exercices** liés à chaque sous-thème.

| Fichier / dossier | Rôle |
|---|---|
| `catalog.ts` | Thèmes SCAI + types théorie + types exercices |
| `theory/*.ts` | Contenu FALC français |
| `exercises/` | 8 kinds, sous-thèmes, banques, générateur |
| `exercises/bank/lessons*.ts` | Banques originales ClairFLE, rangées par sous-thème |
| `generate.ts` | Théorie **ou** exercices selon le type |

## UI

1. **Thème** = partie SCAI (ex. Conjuguer au présent)
2. **Sous-thème** = notion (Être, Avoir, -er… / Passé composé… / fiche théorie)
3. **Type** = **Théorie** + exercices du sous-thème (libellés de leçon)

Les énoncés reprennent l’esprit d’un programme de grammaire quotidienne (compléter, choisir la forme, négation, accord…) avec des phrases originales ClairFLE (Suisse romande). Rien n’est copié verbatim d’un manuel.

## 8 types d’exercice (kinds)

1. Choisissez la bonne conjugaison (QCM)
2. Conjuguez le verbe (ligne)
3. Choisissez le verbe correct (QCM)
4. Mettre au pluriel
5. Mettre au singulier
6. Mettre à la forme négative
7. Mettre à la forme affirmative
8. Écrire une phrase

Les libellés du sélecteur viennent de `GramLesson.label` (ex. « Compléter avec être »).

## Déterminisme

Tirage via `createRng(seed)` + `shuffle` ; jamais `Math.random()` dans le générateur.
