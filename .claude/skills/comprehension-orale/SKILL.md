---
name: comprehension-orale
description: >-
  Importe et maintient les CO (compréhension orale) TCF depuis le repo
  soutien-scolaire. À utiliser dès qu’on parle de CO TCF, banques
  src/tcf/content/*/co.json, audios soutien, ou import des questions orales.
---

# Compréhension orale TCF (soutien-scolaire)

Les CO de pratique viennent du repo **soutien-scolaire** et vivent dans les
banques TCF, pas dans le domaine français FLE.

## Emplacement

| Élément | Chemin |
|---|---|
| Banques | `src/tcf/content/{a0-a1,a1-a2,a2-b1}/co.json` |
| Audios soutien | `public/lib/audio/tcf/co/{thème}/{niveau}__{stem}.mp3` |
| Audios des tests (séries) | `public/lib/audio/tcf/co/{scénario}/{scène}[-n].mp3` |
| Manifest | `scripts/audio-theme-manifest.json` |
| Import | `scripts/import-tcf-co-soutien.mjs` |
| Libellés sélecteur | `src/tcf/sources.ts` (scène, numérotée si elle se répète) |

Il n’y a plus de dossier `public/lib/tcf/` : tout média TCF est sous `public/lib/audio/`
ou `public/lib/images/`, référencé par **chemin absolu** dans les banques.

## Scénario et scène

Chaque exercice TCF (CO, CE, PE, PO) porte `scenario` (id de `TCF_SCENARIOS` dans
`src/tcf/catalog.ts` : `loisirs`, `ecole`, `lieux-publics`, `magasins`, `radio`, `maison`,
`vie-quotidienne`, `vacances`, `travail`, `sante`, `transports`, `fetes`, `actualite`) et
`scene` (« À la plage », courte, sans ville ni prénom). Le sélecteur affiche la scène,
numérotée quand elle se répète (« À la plage - 2 »). Un nouvel audio de test se nomme
d’après la scène : `/lib/audio/tcf/co/vacances/a-la-plage-2.mp3`.

Niveaux : `facile-a1` → `A0-A1`, `moyen-a2` → `A1-A2`, `difficile-b1` → `A2-B1`.

## Identifiants

- Préfixe : `tcf-ss-{a1\|a2\|b1}-s{N}-co-{1-4}`
- Séries de 4 exercices (slots CO Exercice 1…4)
- Les entrées `tcf-ss-*` sont régénérables ; le script les remplace sans toucher aux autres CO TCF.

## Relancer l’import

```bash
# clone si besoin
git clone --depth 1 https://github.com/oasi-phuoc/soutien-scolaire.git /tmp/soutien-scolaire
SOUTIEN_ROOT=/tmp/soutien-scolaire node scripts/import-tcf-co-soutien.mjs
```

Le script lit transcriptions + QCM soutien, ne garde que les audios du manifest
qui ont transcript **et** pool de questions, et écrit des exercices `complet`
(QCM texte, 4 questions en A0-A1 / 6 en A1-A2 et A2-B1).

## Forme d’un exercice

Comme les autres CO TCF `complet` : `support.audio` (chemin absolu
`/lib/audio/tcf/co/…`), `support.transcription`, `questions[]` en
`qcm_texte` (3 choix, une bonne réponse).

## Images des CO (et des CE TCF)

**Une seule banque d’images : `public/lib/images/vocabulaire/{theme}/{slug}.webp`.**
Aucune image CO n’est rangée par série : le même vélo, le même bus ou la même pluie
servent à toutes les séries.

Dans les banques JSON, le champ `image` (choix QCM, situations, support) porte le
**chemin absolu** : `"/lib/images/vocabulaire/transports/velo.webp"`.

### Avant d’ajouter une image

1. Chercher l’objet ou l’action dans `public/lib/images/vocabulaire/` (ou l’index
   `src/jeux/vocab-images.ts`), **accents ignorés** (`echecs` = `échecs`).
2. Si une image existe **et montre bien la même chose**, la réutiliser. Pièges vus :
   - `billet` = billet de train ; billet de banque → `billet-de-banque` ;
   - `ballon` = ballon de baudruche ; ballon de foot → `ballon-de-football` ;
   - `telephone` = téléphone fixe ; portable → `smartphone` ;
   - `raquette` = raquette de ping-pong ; tennis → `raquette-de-tennis` ;
   - horloges : à aiguilles (`huit-heures`) ≠ numériques (`vingt-heures`,
     `huit-heures-numerique`) — ne jamais mélanger 8 h et 20 h sur un cadran à aiguilles.
3. Sinon, créer l’image dans le bon thème (normes « Images vocabulaire » du skill
   `medias-image-audio` : fond blanc, sujet centré, 800×600 WebP).
   - **Slug = l’objet ou l’action** montré (`lunettes-de-natation`, `nourrir-les-animaux`),
     sans préfixe `co1-`, sans nom de série, sans lettre (`situation-a`, `meteo-b` interdits).
   - Personnes en action, scènes de dialogue (exercice `association_images`) → thème
     **`actions`** (`preter-un-stylo`, `demander-a-l-accueil`, `reunion`…).
   - Pluriel seulement s’il change ce qu’on voit (`oranges`, `billets-de-spectacle`).
4. Régénérer l’index : `node scripts/build-vocab-images-index.mjs` (nouveau thème →
   l’ajouter à `THEME_LABELS` dans ce script).

### Contrôles

- Dans **un même exercice**, toutes les images sont différentes (les choix d’un QCM,
  les situations d’une association).
- Une même image peut revenir dans d’autres exercices et d’autres séries : c’est voulu.
- Pas d’image en double dans `vocabulaire/` : si deux fichiers montrent la même chose,
  garder un seul fichier et pointer les exercices dessus.
- Exceptions rangées dans `public/lib/images/documents/{slug}.webp` : les **documents
  propres à un sujet** (planche numérotée, plan, pictogrammes, affiche ou ticket avec
  texte à lire). Tout objet ou action isolé va dans `vocabulaire/`.

## Workflow agent (doc-prof)

Sauf demande explicite contraire :

- **Pas** de `lint`, `build`, aperçu A4, screenshots, enregistrements ni plan de test.
- **Pas** de branche / PR : commit et **push direct sur `origin/main`**.
- L’utilisateur teste lui-même dans l’UI.

Raccourci Cursor pour ignorer les tests : `/no-test` (même effet ici par défaut).
