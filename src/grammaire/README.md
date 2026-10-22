# Grammaire — théorie FALC (SCAI) + exercices

Domaine dédié pour les **fiches de théorie** FALC et les **exercices** liés (conjugaison, transformations, PDF).

| Fichier / dossier | Rôle |
|---|---|
| `catalog.ts` | Thèmes SCAI + types théorie + types exercices |
| `theory/*.ts` | Contenu FALC français |
| `exercises/` | 8 kinds, sous-thèmes, banques, générateur |
| `generate.ts` | Théorie **ou** exercices selon le type |

## UI

1. **Thème** = partie SCAI (ex. Conjuguer au présent)
2. **Sous-thème** = notion (Être, Avoir, -er… / Passé composé… / fiche PDF)
3. **Type** = Théorie liée + kinds avec banque non vide

## 8 types d’exercice

1. Choisissez la bonne conjugaison (QCM)
2. Conjuguez le verbe (ligne)
3. Choisissez le verbe correct (QCM)
4. Mettre au pluriel
5. Mettre au singulier
6. Mettre à la forme négative
7. Mettre à la forme affirmative
8. Écrire une phrase

Banques conjugaison : profils issus de soutien-scolaire (`exercises/profiles.ts` + `pools.ts`).  
Banques PDF : énoncés adaptés dans `exercises/bank/pdf-seed.ts` (pas de copie longue des manuels).

## Déterminisme

Tirage via `createRng(seed)` + `shuffle` ; jamais `Math.random()` dans le générateur.
