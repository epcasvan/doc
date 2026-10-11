# ClairFLE Maths — générateur de fiches de maths imprimables

Site où des enseignant·e·s composent des fiches de travail A4 imprimables (avec corrigé) : français (grammaire, vocabulaire, communication), algèbre et géométrie. Tirage déterministe par graine, rendu type cahier scolaire (colonnes, fractions, figures cotées, division posée). Le plan des fiches FLE est dans `docs/plan-fiches-FLE.md`.

## Stack et commandes

React + Vite + TypeScript. Styles principaux dans `src/App.css` (variables CSS du thème). Génération pure dans `src/math/` (maths) et `src/francais/` (FLE / phrase / lecture).

- `npm run dev` · `npm run build` · `npm run lint`
- Si un script utile manque, le créer plutôt que le contourner.

## Architecture

| Zone | Rôle |
|---|---|
| `src/math/catalog.ts` | Domaines, thèmes (`topics`), types d'exercices (`exerciseTypes`) |
| `src/math/generate.ts` | `buildPage(config, seed)` → délègue maths / `@/francais` / `@/tcm` / `@/tcf` / `@/jeux` / `@/grammaire` / squelettes (`acm`, `vocabulaire`…) |
| `src/math/` | Générateurs maths purs (algèbre, géométrie, repérage, `rng`, `types`) — **sans TCM** |
| `src/tcm/` | Test de connaissance de maths (dossier dédié, comme `tcf/`) — `README.md` |
| `src/tcf/` | Tests TCF (banques JSON, éditeur, rendu) |
| `src/francais/` | FLE : Voc/Gram/Com, Phrase, Lecture, Soutien |
| `src/grammaire/` | Théorie FALC (SCAI) — thèmes + fiches ; exercices à venir — `README.md` |
| `src/vocabulaire/` | Domaine Vocabulaire (squelette) — `README.md` |
| `src/societe/` | Domaine Société (squelette) — `README.md` |
| `src/sante/` | Domaine Sciences et santé (squelette) — `README.md` |
| `src/acm/` | Activités créatives et manuelles (squelette) — `README.md` |
| `src/tcm-csc/` | Stub TCM CSC (vide, admin) — `README.md` |
| `src/tcm-cfr/` | Stub TCM CFR (vide, admin) — `README.md` |
| `src/jeux/` | Fiches-jeux — planning `docs/plan-domaine-jeux.md` |
| `src/math/rng.ts` | `createRng`, `int`, `pick`, `shuffle` — jamais `Math.random()` dans un générateur |
| `src/math/types.ts` | `Layout`, `MathItem`, `PageConfig`, `WorksheetPage`… |
| `src/components/ItemView.tsx` | Dispatcher ; layouts dans `src/components/item-view/` |
| `src/components/math/PrintDocumentChrome.tsx` | En-tête institutionnel / personnalisé, pied, points d'éval |
| `src/components/math/GeometryFigure.tsx`, `FractionView.tsx`, `CoordGrid.tsx` | Visuels scolaires |
| `src/App.tsx` | Routage landing / accès / générateur |
| `src/components/generator/` | UI générateur — `README.md` |
| `src/App.css` | Feuille A4 fixe, layouts école, impression |

### Fichiers volumineux — quand scinder

| Cas | Action |
|---|---|
| **\> ~800 lignes de logique** (UI, générateur, rendu) | Scinder par responsabilité (`ItemView` → `item-view/*`, `App` → `generator/*`) |
| **Banques de données** (`problem-banks.ts`, `vocab-images.ts`, `soutien/banks.ts`) | OK volumineux si purs tableaux ; scinder par thème seulement si l’édition devient pénible |
| **Nouveau domaine** (TCM, TCF, Jeux…) | Dossier `src/<domaine>/` dédié — **ne pas** empiler dans `math/` ou `francais/` |

## Principes non négociables

1. **La feuille A4 est le produit.** Aperçu (`.a4-frame`) et impression (`.print-only-sheets`) partagent le même `WorksheetSheet`. Taille fixe **210 × 297 mm** : ni agrandissement ni rétrécissement selon le nombre de questions (`overflow: hidden`).
2. **Déterministe d'abord.** Un tirage est une fonction pure de `(PageConfig, seed)` via `createRng(seed)`. Jamais de `Math.random()` / `Date.now()` dans `generate.ts`.
3. **Une fiche = une recette** (config de page + graine), pas seulement un résultat.
4. **Rendu scolaire, pas carte app.** Pas de cadres autour des questions ; numéros simples ; réponses en soulignés (`.answer-line-field` **pleine largeur** par défaut), pas en boîtes. Textes justifiés sauf centrage demandé explicitement.
5. **Lisible en noir et blanc.** La couleur ne porte jamais seule une information.
6. **Rien n'est copié d'une référence externe** (textes, logos, figures). On reprend l'esprit, pas les éléments.
7. **Pied de page en bas de l'A4** (`margin-top: auto` sur `.doc-footer` dans un flex colonne).

## Conventions de code

- TypeScript strict, alias `@/` pour `src/`.
- Styles fiche : classes dans `src/App.css` ; variables `:root` (`--ink`, `--purple`, …). Pas de hex « magiques » nouveaux hors thème déjà présent.
- Nouveau type d'exercice = entrée dans `catalog.ts` + branche dans `generate.ts` + rendu dans `ItemView` si le `layout` n'existe pas encore.
- Une page peut contenir plusieurs types (`extraBlocks`). Titres **Exercice 1, 2…** chronologiques ; consigne sous le titre, sans cadre.
- Français (Suisse romande pour les nombres en lettres : `french-numbers.ts`).

## Quel skill utiliser

| Tâche | Skill |
|---|---|
| Ajouter un type d'exercice maths | `nouvel-exercice` |
| Composer une série multi-pages | `nouvelle-unite` |
| Modifier l'UI du générateur / contrôles | `nouveau-composant-ui` |
| En-tête institutionnel, pied, mode éval | `en-tete-document` |
| Figure SVG cotée ou grille | `illustration-svg` |
| Section de la page d'accueil | `section-vitrine` |
| Textes de l'interface | `texte-interface` |
| Enrichir catalogue thèmes / types | `contenu-catalogue` |
| Relire énoncés et consignes | `relecture-enonce` |
| Phrases Gattegno (modèles uniques, français réel) | `phrase-gattegno` |
| Phrases calligraphie (10/mot, authentiques, une ligne) | `calligraphie-phrases` |
| Phrases Soutien FR 9/10/12/14 (Gattegno, A1/A2/B1, son) | `soutien-phrases` |
| Compréhension écrite A1/A2/B1 (CECRL / FALC) | `comprehension-ecrite` |
| Cadre FALC (fiches théorie FR + traductions d’aide) | `falc` |
| CO TCF depuis soutien-scolaire (banques `co.json`) | `comprehension-orale` |
| Verso cartes Jeux (logo ClairFLE, série, cadre) | `jeux-verso-serie` |
| Images / audios vocab (fond blanc, TTS DeniseNeural −25 %) ; scènes PO TCF / fide (décor quotidien, pas fond blanc) | `medias-image-audio` |
| Aperçu A4 fixe + impression | `test-impression` |
| Finaliser / push `main` (auto, pas de lint·build·PR) | `preparer-pull-request` |

## Terminé, c'est quand

Dès la fin de la tâche, **sans attendre** « pousse sur main » ni « pas de PR » : commit + **push direct sur `origin/main`** (skill `preparer-pull-request`) — pas de branche feature, pas de PR, pas de lint, build, aperçu. L’utilisateur teste lui-même. Une PR seulement si demandée explicitement. Rien n’est copié d’une référence externe.
