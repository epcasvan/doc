# Grammaire — théorie FALC (SCAI) + exercices

Domaine dédié pour les **fiches de théorie** FALC et les **exercices** liés à chaque sous-thème.

| Fichier / dossier | Rôle |
|---|---|
| `catalog.ts` | Thèmes SCAI + types théorie + types exercices |
| `theory/*.ts` | Contenu FALC français |
| `exercises/` | kinds, sous-thèmes, banques, générateur |
| `exercises/bank/word-a1.ts` / `word-a2.ts` | Tous les exercices des Word auteur (Grammaire.docx / Grammaire Suite.docx) |
| `exercises/bank/lessons-word-*.ts` | Relu mot à mot (CSC : se présenter, décrire, jours / mois / heures / invitation / négation / évaluation / logement / maison) |
| `exercises/bank/lessons-core.ts` / `lessons-rest.ts` | Compléments ClairFLE (mêmes types) |
| `exercises/bank/lessons-soutien.ts` | Banques de phrases de la section grammaire soutien-scolaire (fusion unique, en dernier) |
| `scripts/import-grammaire-soutien-phrases.mjs` | Relance l’import depuis `SOUTIEN_ROOT` |
| `generate.ts` | Théorie **ou** exercices selon le type |

## UI

1. **Thème** = partie SCAI (ex. Conjuguer au présent)
2. **Sous-thème** = notion (Être, Avoir, -er… / Passé composé… / fiche théorie)
3. **Type** = **Théorie** + exercices du sous-thème (libellés de leçon)

Les énoncés d’exercices reprennent les phrases des Word auteur (`Grammaire.docx`, `Grammaire Suite.docx`) et des fiches CSC (exercices seulement, pas la théorie). Les MP3 CSC sont dans `public/lib/audio/grammaire/`. Les fiches de théorie FALC restent le type **Théorie**. Les banques ClairFLE et les phrases de la section grammaire soutien-scolaire complètent les mêmes types : fusion par `subId` + kind, sans doublon de prompt, libellés du premier lot (Word / ClairFLE).

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

Le rendu des exercices reprend la mise en page TCF : QCM texte / image / phrase (3 icônes), audios comme la CO (téléchargement, pas de lecteur sur la fiche), documents à lire comme la CE, rédaction comme la PE. Une phrase = une réponse (pas de `suis / m’appelle` sur le même item). Un seul verbe à conjuguer va dans la consigne, sans infinitif entre parenthèses dans la phrase ; sinon l’infinitif (pas les parenthèses) est à la couleur du thème. Le mode libre ouvre le même éditeur que le TCF.

## Déterminisme

Tirage via `createRng(seed)` + `shuffle` ; jamais `Math.random()` dans le générateur.
