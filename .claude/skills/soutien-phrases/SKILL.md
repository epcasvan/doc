---
name: soutien-phrases
description: >-
  Rédige et maintient les phrases Soutien FR (types 9, 10, 12, 14) : phrases
  variées et sensées (tirage type liste), niveaux A1/A2/B1, compteur de son,
  faux amis phonétiques. À utiliser dès qu’on parle de phrases Soutien, banques
  src/francais/soutien/phrases/, type 9/10/12/14, ou « phrases random ».
---

# Phrases Soutien FR (types 9 · 10 · 12 · 14)

## Intention pédagogique (non négociable)

1. **Liste / tirage varié** : chaque mot a ses **propres** phrases. On ne recycle
   pas le même gabarit en ne changeant que le nom
   (« La maman lave la salade / la tomate / la carotte »).
2. **Sens réel** : chaque phrase est une situation du quotidien crédible.
   Interdit les collages absurdes
   (« À midi, la tomate, la banane et le papa sont là »,
   « le papa et la carotte… la table et la vache »).
3. **Son de la leçon** : assez d’occurrences **vraiment prononcées** du graphème
   / phonème (compteur site), sans tricher avec des lettres muettes.

En résumé : **aléatoire / varié dans le tirage**, mais **jamais n’importe quoi**
dans le sens.

## Fichiers

| Fichier | Rôle |
|---|---|
| `scripts/soutien-phrase-nouns.txt` | Lexique `article mot thème` (Voc A1–B1, pas de sous-chaînes) |
| `scripts/build-soutien-lecture-extra.py` | Complète la banque lecture avec les mots Voc courants |
| `src/francais/soutien/lecture-word-items-extra.ts` | Mots Voc sans image (filtrés par phonème) |
| `scripts/build-soutien-sense-phrases.py` | **Générateur** : phrases sensées + variées |
| `scripts/check-soutien-phrases.mjs` | Validation (compteur site + niveaux) |
| `src/francais/soutien/phrases/<bank>.json` | Source de vérité runtime |
| `src/francais/soutien/phrases-data.ts` | Chargement + filtre de niveau |
| `src/francais/soutien/gen-kind.ts` | Types 9 / 10 / 12 / 14 |

Téléchargement UI : blob depuis `src/francais/soutien/phrases/` (`download-phrases.ts`) —
pas de miroir `public/soutien-phrases/`.

### Relancer

```bash
python3 scripts/build-soutien-sense-phrases.py
python3 scripts/build-soutien-sense-phrases.py a ch ou   # banques choisies
node scripts/check-soutien-phrases.mjs --summary
```

## Niveaux

| Niveau | Mots | Son × | Forme |
|---|---|---|---|
| **A1** | 5–7 | ≥ 2 | Phrase simple, présent |
| **A2** | 8–12 | ≥ 3 | Un peu plus long, ancrage temporel OK |
| **B1** | 13–15 | ≥ 4 | Connecteur (`quand`, `parce que`, `mais`…) |

- Majuscule + ponctuation finale.
- Filtre UI : `all` (défaut) / `a1` / `a2` / `b1`.
- Type 9 : 1 phrase **distincte** par mot × 3 niveaux (mot entier, limite de mot).
- Type 12 : 4 phrases / niveau ; type 14 : 6 / niveau (autres phrases sensées).
- Type 10 : phrases avec `le`/`la`/`les`/`l’` → `parts` à trous (peut partager
  le texte avec 9/12/14).

## Règles de rédaction

### Variété

- Deux mots de la même banque → **constructions différentes** (verbes, sujets,
  lieux, temps).
- Changer le rôle du mot cible : sujet, complément, lieu…
- Pas de quasi-doublon (même ossature + un mot près).

### Sens (référence Gattegno)

Les phrases s’appuient sur les **modèles Gattegno**
(`phrase-simple-frames.ts`, prépositions dans `phrase-theme-frames.ts`) :

- **Sujet = personne** : prénom d’ancre **ou** groupe nominal
  (*le professeur*, *le garçon*, *la voisine*…) — jamais un objet.
- **Un verbe = une construction** crédible ; le complément colle au verbe
  (*mange une salade*, *téléphone à la maman*, *retourne dans la chambre*).
- Conserver la **préposition** du modèle (*à*, *dans*, *avec*…) — interdit
  *téléphone la maman* / *donne la maman*.
- Thème du nom → bassin de verbes si le mot n’est pas déjà dans Gattegno.
- Pas de personne dans une liste d’aliments ; *boit le café* (pas *mange*) ;
  *lave* seulement pour fruits/légumes lavage courants.

### Forme technique

- `{1}` / article+nom = **2 mots** (`le papa`, `un hôtel`).
- Pas d’apostrophes d’élision dans les modèles.
- Pas de `de le` / `à le` → `dans` / `avec` / `sur` / `pour`.
- Pas d’accord d’adjectif sur le mot cible (genre mixte).
- Le mot cible n’apparaît pas déjà hors slot (sous-chaîne / `indexOf` type 9).
- Articles h aspiré déjà corrects dans le lexique.

## Ancres de son (par banque)

Chaque phrase doit porter assez d’occurrences **réelles** du son. Utiliser des
ancres (prénoms, mots-cadre) adaptées à la banque — pas des faux amis.

| Banque | Ancres utiles | Éviter |
|---|---|---|
| `a` | Sara, Lara, maman, papa, table, salade | — |
| `o` | Léo, trop, tôt, sol, sport, bol | *Tom* (= om) |
| `i` | Nina, ici, midi, vite, finit | — |
| `u` | Luc, Julie, plus, sur, mur | — |
| `e` | Hélène, Théo, très, est, après | *déjà* dans scène *dé* ; *prépare* dans *pré* |
| `y` | Mary, Cyril, Yves | *il y a* (/j/) |
| `m` | Manon, Marc, Emma ; verbe *regarde* | *Marie* (⊃ mari) ; *montre* si nom banque |
| `ou` | Lou, Louis, *tout content* | *toujours* (⊃ tour) |
| `in` | Inès, enfin, malin ; *Ce soir* | *demain*, *Ce matin*, *copain* |
| `ill` | Camille, Guillaume, fille | *il*, Gilles (/il/) |
| `c-k` | Claire, Luc, avec | *cherche* (ch) |
| `c-s` | Cécile, Alice, ici, merci | Luc, Claire, *content* (/k/) |
| `s-s` | Sara, Sam, aussi, *reste* | *est* (s muet), *pose* (/z/) |
| `s-z` | Lise, Élise, musique | *aussi*, *est* |
| `an` | Jean, Henri, quand, content | *Anne* (pas nasal) |
| `on` | Simon, Manon, content | *montre* (nom) |
| `h` | Hugo, Henri, Hélène | Chloé, Sophie, Philippe, Théo |
| `x-ks` | Max, Félix, *explique* | Axel dans scène *axe* |
| `x-gz` | Xavier, *exact* | Max, Axel (/ks/) |
| `g-g` / `g-j` | Hugo/Guy vs Roger/Ginette | Ne pas échanger |
| `ch` | Chloé, Charles, chez | ch=/k/ |
| `au` | Paul, aussi, beau ; *ça* | accords de genre sur {1} |
| `oi` | Antoine, voit, moi, revoit | *oin* ; *montre* sans oi |
| `gn` | compagne, accompagne, soignée | — |

Voir aussi les pièges de sous-chaîne type 9 (`toujours`/`tour`, `demain`/`main`…).

## Compteur

Aligné sur `countLessonPhonemeInText` / `check-soutien-phrases.mjs` :

- Voyelles : segments Alpha simples seulement.
- Autres : graphèmes longs d’abord — le son doit quand même être réel.

## Interdits

- Gabarit unique + un seul mot variable sur toute une banque.
- Listes multi-thèmes absurdes (*sont là* / *on trouve*).
- `Math.random()` / `Date.now()` dans la génération de fiche (tirage =
  `createRng(seed)` côté app ; le JSON est stable).
- Commit `scripts/__pycache__/` ou MP3 hors sujet.
- PR : push `main` via `preparer-pull-request`.

## Terminé quand

1. `build-soutien-sense-phrases.py` OK pour les banques touchées.  
2. Phrases **variées** (spot-check : 3 mots repas ≠ même verbe).  
3. `check-soutien-phrases.mjs --summary` → OK.  
4. Export + README.  
5. Commit + **push `origin/main`**.
