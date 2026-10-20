---
name: comprehension-ecrite
description: >-
  Règles CECRL/FALC et banques de textes pour la compréhension écrite FLE
  (A1 / A2 / B1). À utiliser dès qu’on crée, corrige ou régénère des textes
  Com · compréhension écrite, leurs questions, ou les paramètres par niveau.
---

# Compréhension écrite (CECRL / FALC)

## Images des CE TCF

Les CE TCF (`src/tcf/content/*/ce.json`) prennent leurs images dans
**`public/lib/images/vocabulaire/{theme}/{slug}.webp`** (chemin absolu dans le JSON :
`"/lib/images/vocabulaire/vetements/echarpe.webp"`), comme les CO. Même règle que
la section « Images des CO » du skill `comprehension-orale` :

1. Chercher d’abord l’objet ou l’action dans `vocabulaire/` (accents ignorés) et
   réutiliser l’image si elle montre la même chose.
2. Sinon la créer dans le bon thème (`actions` pour une personne en action ou une
   scène), slug = l’objet ou l’action, sans préfixe `ce1-` ni nom de série, puis
   `node scripts/build-vocab-images-index.mjs`.
3. Dans un même exercice, toutes les images sont différentes.
4. Seuls les documents propres au sujet (plan, pictogrammes, planche numérotée, affiche
   ou ticket avec texte à lire) vont dans `public/lib/images/documents/{slug}.webp`.
   Il n’y a plus de `public/lib/tcf/`.
5. Chaque exercice porte `scenario` + `scene` (voir skill `comprehension-orale`) ;
   un exercice CE = **un seul texte** ; un document à plusieurs textes est découpé en
   plusieurs exercices courts (2–3 questions).

Source code : `src/francais/comprehension-ecrite.ts` (règles) +
`src/francais/comprehension-ecrite-banks.ts` (textes).  
Niveau fiche : `difficulty` `facile` → A1, `moyen` → A2, `avance` → B1.

## Longueur cible (lecture / compréhension)

| Niveau | Mots | Caractères (approx.) | Forme |
|---|---|---|---|
| A1 | 30–60 | ~150–350 | 4–6 phrases très courtes |
| A2 | 60–120 | ~350–700 | 6–10 phrases |
| B1 | 120–250 | ~700–1500 | 2–3 paragraphes courts |

Ces fourchettes sont des usages courants pour la **compréhension** (le DELF fixe surtout la production écrite).

## Structures et lexique

### A1
- Uniquement **Sujet–Verbe–Complément**.
- Pas de subordonnées ; adjectifs / adverbes absents ou exceptionnels.
- Temps : présent (+ passé composé basique si indispensable).
- Vocabulaire ultra-fréquent et concret ; **répéter le même nom** (pas de synonyme ni pronom qui embrouille).

### A2
- Base S–V–C ; quelques adjectifs / adverbes simples.
- Lexique un peu plus varié.
- Temps : présent, passé composé, futur proche.

### B1
- Jusqu’à **deux subordonnées simples** par phrase ; groupes plus étoffés, base S–V–C.
- Imparfait et conditionnel simple possibles.
- Synonymes et reprises anaphoriques (pronoms) autorisés.

### À éviter (surtout A1–A2)
Mots étrangers, métaphores, jeux de mots, inversion sujet/verbe, imparfait / conditionnel (réservés au B1).

## Construction du texte

1. **Info essentielle d’abord** : qui, quoi, quand, où (FALC).
2. **Un paragraphe = une idée** ; 4–8 lignes max en A1/A2 ; ne pas couper entre deux pages.
3. En A1 : **même nom** pour une personne / une chose tout au long du texte.
4. **Textes authentiques** : chaque texte a un scénario, un genre et un objectif distincts — **interdit** de cloner un gabarit en changeant seulement prénom / lieu / métier.
5. **Formats variés** (mélanger dans la banque et à chaque niveau) :
   - texte narratif / récit
   - e-mail
   - lettre officielle
   - SMS / message court (surtout A1)
   - annonce (location, emploi, événement)
   - article / brève
   - notice / fiche / mode d’emploi simple
   - invitation écrite
   - avis / message de forum
6. Banque : **20 textes uniques par thème × par niveau** (`a1` / `a2` / `b1`).
   Les 13 thèmes communicatifs (`fr-presenter` … `fr-loisirs`) sont chacun couverts :
   **20 × 13 × 3 = 780** textes. Génération : `node scripts/build-comprehension-ecrite-banks.mjs`.

## Questions (adapter au niveau)

| Niveau | Type | Exigence |
|---|---|---|
| A1 | QCM ou vrai/faux | Réponse **mot pour mot** dans le texte (repérage littéral) |
| A2 | QCM / ouvertes courtes | Relier **deux infos** explicites |
| B1 | QCM / reformulation | Inférence, reformulation, ou infos à des endroits différents |

Banque : **8 questions** par texte (comme la CO) ; la fiche en affiche **4** par défaut.
Distracteurs plausibles mais clairement faux. Style A1 = littéral, A2 = lien, B1 = inférence.

## Paramètres réutilisables (code)

`COMPREHENSION_ECRITE_RULES` dans `comprehension-ecrite.ts` :
- `minWords` / `maxWords`
- `minSentences` / `maxSentences` (A1–A2) ou `paragraphs` (B1)
- `allowedTenses`, `maxSubordinates`, `allowPronouns`, `questionStyle`

`pickWrittenDocument(rng, topic, level)` filtre d’abord par thème, sinon prend tout le niveau.

## Checklist avant d’ajouter un texte

- [ ] Format explicite (e-mail, lettre, annonce, narratif…) et cohérent avec le contenu.
- [ ] Longueur dans la fourchette du niveau (compter les mots).
- [ ] Structures autorisées respectées.
- [ ] Scénario **non** dérivé d’un autre texte de la banque (pas un clone).
- [ ] Titre distinct ; questions alignées sur le style du niveau.
- [ ] Réponses uniques et présentes (A1–A2) ou déductibles (B1).
- [ ] Français scolaire, vouvoiement dans les consignes d’items, prénoms fictifs.

## Terminé quand

Skill à jour · banque = 20 textes / thème / niveau (780) · tirage déterministe via `difficulty` · anciens `written` des thèmes vidés · lint / build OK.
