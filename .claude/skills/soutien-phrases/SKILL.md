---
name: soutien-phrases
description: >-
  Rédige et maintient les phrases Soutien FR (types 9, 10, 12, 14) : scènes
  cohérentes, un mot variable, niveaux A1/A2/B1, compteur de son, faux amis
  phonétiques. À utiliser dès qu’on parle de phrases Soutien, banques
  src/francais/soutien/phrases/, scènes, type 9/10/12/14, ou « phrases random ».
---

# Phrases Soutien FR — scènes (types 9 · 10 · 12 · 14)

Les phrases ne sont **pas** des listes de mots collées au hasard
(« À midi, la tomate, la banane et le papa sont là »).  
Chaque phrase décrit **une situation vraie** ; seul le mot de la leçon change.

## Fichiers

| Fichier | Rôle |
|---|---|
| `scripts/soutien-scenes.txt` | **Source d’écriture** : scènes par banque (`@a`, `@ch`…) |
| `scripts/soutien-phrase-nouns.txt` | Lexique article + mot + thème (pas de sous-chaînes) |
| `scripts/fill-soutien-scenes.py` | Génère `src/francais/soutien/phrases/<bank>.json` |
| `scripts/build-soutien-phrases.py` | Helpers (compteur, ranges) — **`main()` interdit** (SystemExit) |
| `scripts/check-soutien-phrases.mjs` | Validation (compteur site + niveaux) |
| `scripts/export-soutien-phrases.mjs` | Copie vers `public/soutien-phrases/` + `type*-all.json` |
| `src/francais/soutien/phrases-data.ts` | Chargement + filtre de niveau |
| `src/francais/soutien/gen-kind.ts` | Types 9 / 10 / 12 / 14 consomment le JSON curaté |
| `public/soutien-phrases/` | Export téléchargeable (README après export) |

### Relancer

```bash
python3 scripts/fill-soutien-scenes.py          # toutes les banques
python3 scripts/fill-soutien-scenes.py a ch ou  # banques choisies
node scripts/check-soutien-phrases.mjs --summary
node scripts/export-soutien-phrases.mjs
# puis réécrire public/soutien-phrases/README.txt (export efface le dossier)
```

Ne **jamais** lancer `python3 scripts/build-soutien-phrases.py` : il quitte
immédiatement et l’ancien générateur aléatoire (« sont là ») est mort.

## Format d’une scène (`soutien-scenes.txt`)

```
@a
papa
a1: {1} parle avec la maman.
a1: {1} appelle la maman à table.
a2: Ce soir, {1} parle avec la maman à table.
a2: À midi, {1} mange avec la maman à table.
b1: À midi, quand {1} rentre du travail, la maman prépare la salade.
b1: Ce soir, quand {1} rentre du travail, la maman met la table.

salade tomate carotte
a1: La maman lave {1}.
…
```

- `{1}` = **article + mot** (toujours 2 mots : `le papa`, `la salade`, `un hôtel`).
- **Deux modèles par niveau** (a1 / a2 / b1) par groupe de mots.
- Tous les mots du groupe doivent rendre **chaque** modèle vrai (même situation).
- Un mot = une seule scène. Tous les noms de la banque doivent avoir une scène.

## Niveaux (obligatoire)

| Niveau | Mots (espaces) | Occurrences du son | Structure |
|---|---|---|---|
| **A1** | 5–7 | ≥ 2 | Phrase simple, présent |
| **A2** | 8–12 | ≥ 3 | Un peu plus long, ancrage temporel OK |
| **B1** | 13–15 | ≥ 4 | Connecteur (`quand`, `parce que`, `mais`…) |

- Majuscule initiale ; ponctuation finale `.` `!` `?`.
- Filtre UI : `all` (défaut) / `a1` / `a2` / `b1`.
- Type 9 : **1 phrase par mot × 3 niveaux** (le mot apparaît tel quel, limite de mot).
- Type 12 : **4 phrases / niveau** ; type 14 : **6 / niveau** (extras des scènes).
- Type 10 : phrases avec ≥ 1 `le`/`la`/`les`/`l’`, découpées en `parts` (trous).
  Peut **partager** le texte avec 9/12/14 ; unicité du texte seulement **dans** type10.

## Principe « une scène »

1. **Un seul slot** `{1}` — pas de listes « X, Y et Z sont là ».
2. **Situation du quotidien** : manger, voir, porter, ranger, parler, rentrer…
3. Groupes sémantiques cohérents : aliments + *mange/prend* ; habits + *porte* ;
   animaux + *voit/nourrit* ; lieux + *entre/voit* ; objets + *pose/prend*.
4. Ne pas mettre une personne dans une liste de fruits ; ne pas *couper* une glace ;
   ne pas *poser le métro au sol* ; ne pas *ranger* une pièce comme un objet.
5. Vocabulaire fréquent, français réel, orthographe correcte.
6. **Pas d’apostrophes** d’élision dans les modèles (évite les pièges de comptage).
7. Pas de `de le` / `à le` : utiliser `dans {1}`, `avec {1}`, `sur {1}` ;
   `à {1}` seulement si tous les articles du groupe sont `la`/`les`/`un`/`une`.
8. Pas d’accord d’adjectif sur `{1}` (genre mixte). Accords OK sur un nom fixe
   (*Hélène est très contente*, *il trouve ça très beau*).
9. Le mot cible **ne doit pas** apparaître déjà dans le modèle hors `{1}`
   (garde `word in bare` dans le filler).
10. Type 9 : `indexOf` du mot doit frapper le **mot entier**, pas une sous-chaîne
    (*Marie* contient *mari* ; *toujours* contient *tour* ; *demain* contient *main*).

## Compteur de son (aligné sur le site)

Le validateur appelle `countLessonPhonemeInText` (Vite SSR) — même logique que
`src/francais/soutien/phoneme.ts`.

- **Voyelles** (`a` `o` `i` `u` `e` `y`) : segments Alpha *simples* seulement
  (pas `an`/`au`/`eau`/`ou`/`oi`/`on`…).
- **Autres banques** : graphèmes les plus longs d’abord (naïf) — encore faut-il
  que le son soit **vraiment** prononcé.

Les lettres muettes ne doivent pas « sauver » le quota pédagogique
(éviter `est` sur `s-s` / `s-z` : le `s` est muet mais compté).

## Faux amis phonétiques (critiques)

| Banque | Piège | Faire |
|---|---|---|
| `o` | *Tom* = nasal `om`, pas `/o/` | Léo, trop, tôt, sol, sort, pose, sport, porte, fort, dort, bol |
| `m` | *Marie* contient *mari* | Manon, Marc, Emma — verbe *regarde* (pas *montre* si *montre* est un nom de la banque) |
| `x-ks` | *Axel* contient *axe* | Scène *axe* sans Axel ; Max, Félix, *explique* |
| `ou` | *toujours* commence par *tour* | *tout content* |
| `in` | *demain* / *Ce matin* / *copain* contiennent *main* / *pain* | *enfin*, *malin* ; *Ce soir* |
| `ill` | *il*, Gilles, Cyril = `/il/` pas `/j/` | Camille, Guillaume, *fille* |
| `e` | *déjà* contient *dé* ; *prépare* contient *pré* | Interdits dans les scènes *dé* / *pré* |
| `an` | *Anne* n’est pas nasal (mais OK pour `n`) | Jean, Henri, Enzo, *quand*, *content* (vrai `en`) |
| `on` | *Manon* final `/ɔ̃/` OK ; *montre* = nom de la banque | *Manon regarde* ; *content* a aussi `on` |
| `c-k` | *cherche* = `ch` ; *content* = `/k/` OK | Claire, Luc, *avec* |
| `c-s` | Luc / Claire / *content* = `/k/` | Cécile, Alice, *ici*, *merci* |
| `g-g` / `g-j` | Hugo/Guy = `/g/` ; Roger/Ginette = `/ʒ/` | Ne pas échanger |
| `s-s` | *pose* = `/z/` ; *est* = `s` muet | *reste*, *aussi* (`ss`) |
| `s-z` | Pas de `aussi`/`est` (lettre `s` /s/) | Lise, Élise, *musique* (s intervocalique) |
| `h` | Chloé, Sophie, Philippe, Théo = ch/ph/th | Hugo, Henri, Hélène, Hassan… |
| `w` | *wagon* souvent `/v/` | William, Wendy ; kiwi/sandwich OK si `/w/` |
| `x-gz` | Xavier = `/gz/` ; Max/Axel = `/ks/` | Un seul groupe ; *reste exact* (accorde avec Xavier) |
| `y` | *il y a* = `/j/` | Mary, Cyril, Yves (y = `/i/`) |
| `au` | — | *aussi*, *beau*, préposition *au* ; *ça* évite le genre |
| `gn` | Peu de prénoms | *compagne*, *accompagne*, *soignée* (accorde avec *amie*) |
| `oi` | *oin* ≠ `oi` ; *montre* n’a pas `oi` | Antoine, *voit*, *moi*, *revoit* |
| `ch` | `ch` = `/k/` (chaos) exclu | Chloé, Charles, *chez*, *chaud* |

## Ancres qui portent vraiment le son

Choisir des prénoms / mots-cadre où le graphème est **réel** (pas seulement
détecté par le compteur naïf) :

- `o` : Léo, trop, tôt… · `i` : Nina, ici, midi, vite · `u` : Luc, Julie, plus, sur  
- `e` : Hélène, Théo, très, est, après · `b` : Bruno, Barbara, bien  
- `c-k` : Claire, Luc, avec · `d` : Didier, David, devant · `t` : Tom, Théo, très  
- `f` : Farid, Fatima, Félix · `j` : Julie, Jean, Joël · `l` : Léa, Léo, Luc  
- `n` : Nina, Anne · `r` : Marie, Roger, Claire, très · `v` : Vincent, Véronique, voit, avec  
- `ph` : Philippe, Sophie, Christophe · `ou` : Lou, Louis · `an` : Jean, Henri, quand, content  

Squelette qui passe souvent (à adapter) :

- A1 ≈ « Claire voit {1} avec Luc. »  
- A2 ≈ « Ce matin, Claire voit {1} avec Luc. »  
- B1 ≈ « Ce matin, quand Claire voit {1} avec Luc, il est très content. »

Allonger B1 avec *aussi* / *très* / 2ᵉ ancre si le compteur ou le nombre de mots manque.

## Articles et lexique

- Toujours `article mot` dans `soutien-phrase-nouns.txt`.
- H aspiré : articles déjà corrects (*le homard*, *une hache*) — ne pas forcer `l’`.
- Éviter les paires sous-chaîne dans la même banque (*lac/glace*, *poule/poulet*,
  *fille/famille* comme cible croisée, *pain/lapin* pour le son, etc.).

## Qualité à surveiller (acceptables mais lâches)

Si l’utilisateur se plaint, resserrer en priorité :

- `ch` B1 « elle a très chaud » hors météo  
- `z` « Enzo reste très bizarre »  
- `s-z` B1 clause musique un peu détachée  
- `in` B1 « un ami malin sourit »  
- `gn` B1 « amie soignée » peu liée à l’objet  

Les A1/A2 sont en général plus serrés : s’en inspirer.

## Interdits (régression)

- Listes multi-thèmes + *sont là* / *on trouve*.  
- `Math.random()` / `Date.now()` dans un générateur.  
- Commit de `scripts/__pycache__/` ou de MP3 dirty hors tâche.  
- Relancer les anciens agents cloud de rédaction de phrases (limités / vides).  
- Ouvrir une PR : push `main` via `preparer-pull-request`.

## Terminé quand

1. Scènes OK pour les banques touchées (`fill-soutien-scenes.py`).  
2. `check-soutien-phrases.mjs --summary` → OK.  
3. Export public + README.  
4. Commit + **push `origin/main`**.
