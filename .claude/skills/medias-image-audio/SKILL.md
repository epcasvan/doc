---
name: medias-image-audio
description: >-
  Génère ou complète les médias ClairFLE : (1) images vocabulaire réalistes
  (fond blanc, sujet centré, 800×600 WebP) et audios TTS (DeniseNeural −25 %) ;
  (2) scènes PO TCF / fide·DELF en bande dessinée réaliste (réf.
  comprehension/_style-ref-bd-realiste.webp — pas photo, pas fond blanc).
  À utiliser dès qu’on crée, régénère ou aligne une image / un MP3 de mot
  (Soutien, Voc, Jeux, lecture) ou une image de scène PO TCF.
---

# Médias image + audio (vocabulaire FLE + scènes PO TCF)

Référentiel des médias déjà en vigueur dans `public/lib/` (importés depuis
`soutien-scolaire` via `scripts/copy-lib-medias.mjs` pour le vocabulaire ;
documents TCF sous `public/lib/images/documents/`, audios TCF sous
`public/lib/audio/tcf/co/`). Il n’y a plus de `public/lib/tcf/`.

**Deux régimes d’image distincts** — ne pas les mélanger :

| Usage | Fond / décor | Objectif pédagogique |
|---|---|---|
| **Vocabulaire** (Soutien, Voc, Jeux, lecture) | Fond **blanc pur**, sujet isolé | Identifier un mot |
| **Scènes PO TCF** (fide / DELF) | Décor quotidien en **bande dessinée réaliste** (pas photo) | Décrire une situation, jouer un rôle |

---

## Chemins ClairFLE

### Vocabulaire

| Type | Chemin | Format |
|---|---|---|
| Image | `public/lib/images/vocabulaire/{theme}/{slug}.webp` | WebP |
| Audio | `public/lib/audio/vocabulaire/{theme}/{slug}.mp3` | MP3 96 kb/s |

- **Thèmes** : mêmes dossiers que `scripts/copy-lib-medias.mjs` (`presenter`,
  `famille`, `logement`, `achats`, `vetements`, `nourriture`, `sante`,
  `transports`, `travail`, `journee`, `loisirs`, `ecole`, `animaux`,
  `administration`, `actualite`, `nature`, `couleurs`, `objets`, …).
- **Slug** : libellé normalisé — suivre le voisinage du dossier thème.
- Résolution runtime : `soutienImageFor` / `soutienAudioFor`
  (`src/francais/soutien/images.ts`, `audio.ts`) — l’audio dérive du même
  thème/slug que l’image.

### Scènes PO TCF

| Type | Chemin | Format |
|---|---|---|
| Image (objet, action, lieu) | `public/lib/images/vocabulaire/{theme}/{slug}.webp` | WebP |
| Image (document propre au sujet) | `public/lib/images/documents/{slug}.webp` | WebP |
| Audio de test | `public/lib/audio/tcf/co/{scénario}/{scène}[-n].mp3` | MP3 |

- **Slug** : ce que l’image montre (`guichet-de-banque`), jamais un nom de série
  ni un préfixe `po2-`.
- Les banques portent le **chemin absolu** (`/lib/images/…`, `/lib/audio/…`).
  `tcfImageSrc` / `tcfAudioSrc` (`src/tcf/media.ts`) résolvent un chemin relatif
  sous `/lib/images/` et `/lib/audio/`.

Ne pas inventer un autre arbre (`/assets/…` est l’ancien chemin
soutien-scolaire ; ici c’est **`/lib/…`**).

### Images CE / CO TCF

Les objets et actions des CE et CO TCF **ne sont pas** rangés par série : ils
vivent dans `public/lib/images/vocabulaire/{theme}/` (thème `actions` pour les
personnes en action et les scènes de dialogue) et sont réutilisés d’une série à
l’autre. Règles détaillées : skill `comprehension-orale`, section « Images des CO ».

---

## Images vocabulaire

### Spécification visuelle (obligatoire)

1. **Style** : photo **réaliste** (pas de dessin, pas de manga, pas d’icône plate).
2. **Fond** : **blanc pur** (`#FFFFFF`), sans dégradé, sans ombre portée au sol,
   sans décor (pièce, paysage, table texturée, texte, logo, filigrane).
3. **Sujet** : objet **ou** personne **seul(e), centré(e)**, occupant l’essentiel
   du cadre ; marge blanche autour.
4. **Taille** : **800 × 600** px (ratio 4:3) — taille dominante déjà en vigueur
   dans `public/lib/images/vocabulaire/`. Repli accepté seulement si un lot
   historique du même thème est en 600×450 : alors rester cohérent avec ce thème.
5. **Export** : WebP qualité ~85.
6. **Registre** : adulte / neutre (pas « cartoon enfant »).

### Prompt type (génération)

> Photorealistic [objet/personne], centered, plain pure white background,
> no shadows on the floor, no props, no text, no watermark, studio product
> photo, 4:3

Puis redimensionner / recadrer en **800×600** (`fit: contain` sur fond blanc,
ou `cover` centré si le sujet remplit déjà le cadre sans découpe utile).

### Contrôles qualité

- Coins de l’image ≈ blanc (pas de cadre gris, pas de scène).
- Un seul sujet identifiable (« quel mot y voit-on ? »).
- Pas de texte incrusté.
- Fichier placé sous le bon `{theme}/` ; référencé dans la banque Voc si besoin.

---

## Scènes PO TCF (fide / DELF)

À utiliser dès qu’on génère ou régénère une **illustration de situation** pour
la production orale TCF (types `image_unique`, planches multi-images, supports
de dialogue / interaction), en préparation **fide** ou esprit **DELF**
(action concrète, rôles clairs, adultes, quotidien).

**Ne pas appliquer le fond blanc vocabulaire** à ces scènes : le brief ci-dessous
**prime** sur la section Images vocabulaire.

### Intention pédagogique (cadre ClairFLE)

- Mettre au centre une **action de la vie courante** que l’apprenant peut
  décrire ou jouer (demander, proposer, expliquer un besoin).
- Rendre **lisibles les rôles** (usager / prestataire, voisin·e, collègue, etc.)
  par la posture et les gestes, pas par des étiquettes.
- Choisir un **décor suisse romand banal** (guichet, commerce, bureau, cage
  d’escalier, cuisine, salle d’attente…) — pas de carte postale touristique
  (chalet, vache, drapeau, panorama alpin comme décor principal).
- S’adresser à des **adultes** : registre sobre de manuel de langue moderne,
  sans infantilisation ni stéréotypes de genre, d’origine ou de corps.
- Limiter le bruit visuel : peu d’objets, tous utiles à la tâche communicative.

### Style obligatoire — bande dessinée réaliste

**Référence de style** (à passer en `reference_image_paths` pour toute
génération / régénération) :

`public/lib/images/comprehension/_style-ref-bd-realiste.webp`
(scène « chez le pédiatre » : médecin, parent, enfant).

Ce n’est **pas** une photographie, **pas** du réalisme pur « comme la vie
réelle », **pas** un manga, **pas** un cartoon enfantin, **pas** un fond blanc
studio. C’est une **illustration type bande dessinée réaliste** / manuel de
langue moderne :

- proportions humaines crédibles, visages doux, expressions lisibles ;
- contours **souples** (peu ou pas de trait noir dur) ; volumes par la couleur
  et des ombres légères ;
- palette chaude, tons naturels (beige, bois, verts doux, peaux réalistes) ;
- lumière d’intérieur douce et uniforme ;
- décor de vie quotidienne (cabinet, commerce, guichet, cuisine…) avec peu
  d’objets, tous utiles à la scène ;
- **aucun texte**, lettre, chiffre, logo ni panneau lisible.

Toute image sous `public/lib/images/comprehension/` (po-a1, po-a2) suit
**uniquement** ce régime. Ne plus viser le style photo ni l’ancienne planche
« À la poste » comme référence de style.

### Spécification visuelle

1. **Style** : bande dessinée réaliste = référence `_style-ref-bd-realiste.webp`.
2. **Format** : ratio **4:3** — **800 × 600** px WebP ~85.
3. **Lieu** : Suisse romande du quotidien, authentique, non touristique.
4. **Personnages** : adultes (tous âges, origines et corps variés), traités
   avec respect ; jusqu’à **trois personnes** si la scène l’exige (ex. parent +
   enfant + professionnel) ; gestes et postures qui montrent qui fait quoi.
5. **Objets** : uniquement ceux nécessaires à la tâche.
6. **Interdits** : texte / logo incrusté ; cliché « Suisse postcard » ;
   photoréalisme ; fond blanc studio ; ton enfantin caricaturé.

Niveau cible typique A1–A2 ; séries junior : adapter l’âge des personnages
sans basculer en style cartoon enfant.

### Prompt maître (à coller avant chaque scène)

Préfixer **avant** la description (et toujours joindre la référence de style) :

> Illustration en bande dessinée réaliste pour adultes apprenant le français
> (niveau A2), même style que la référence « chez le pédiatre » : dessin
> illustré crédible, pas une photo, pas du réalisme pur. Contours souples,
> couleurs naturelles et chaleureuses, lumière douce, format 4:3. Situation du
> quotidien en Suisse romande (guichet, commerce, cabinet, bureau, cuisine,
> salle d’attente). Personnages de tous âges, origines et corps variés, traités
> avec respect. Gestes qui montrent clairement qui fait quoi. Peu d’objets,
> tous utiles. Aucun texte, lettre, chiffre ni logo. Pas de chalet, vache ou
> drapeau en décor.
>
> Scène : [description concrète — lieu, rôles, action]

### Procédure (création ou régénération)

1. Lire le support PO dans `src/tcf/content/{niveau}/po.json` **ou**, pour une
   régénération de stock, ouvrir l’image existante sous
   `public/lib/images/comprehension/`.
2. Décrire la scène (qui / où / quoi) en une ou deux phrases ; pour une
   régénération, **conserver la composition et le contenu** de l’image
   actuelle, changer seulement le style.
3. Générer avec : `reference_image_paths` =
   `[…/_style-ref-bd-realiste.webp, <image actuelle si régénération>]` +
   prompt maître + scène. Export WebP **800×600**.
4. Chemins :
   - **A0-A1** : 4 images séquentielles
     `public/lib/images/comprehension/po-a1/{slug}-{1..4}.webp` — mêmes
     personnages et même lieu ; étape 1 en référence pour 2–4.
   - **A1-A2** : une image
     `public/lib/images/comprehension/po-a2/{slug}.webp`.
5. Référencer dans `support.images` / `support.image`. Aucun numéro ni bulle
   dans l’image.
6. Contrôle : rôles lisibles, style BD réaliste (pas photo), pas de texte,
   pas de fond blanc studio.

### Contrôles qualité (PO)

- Style = référence pédiatre (BD réaliste), pas photo.
- On comprend l’action et les rôles sans la consigne.
- Décor banal suisse romand, pas postcard.
- Diversité respectueuse ; aucun texte / logo.
- Chemin et slug cohérents avec la série TCF.

---

## Audio (TTS) — vocabulaire uniquement

Les scènes PO TCF n’imposent pas de TTS image ; l’audio PO éventuel suit les
chemins `public/lib/audio/tcf/co/` et les banques (hors scope de cette section).

### Outil et voix (ClairFLE)

| Priorité | Outil | Voix | Débit |
|---|---|---|---|
| **Standard** | **edge-tts** | **`fr-FR-DeniseNeural`** (féminin) | **`-25 %`** (mots lents, allophones) |
| Historique | ElevenLabs / Piper Siwis | — | **Ne jamais écraser** un MP3 déjà présent |

Référence soutien-scolaire : `scripts/generate-missing-word-audio.py`
(`VOICE = "fr-FR-DeniseNeural"`, `RATE = "-25%"`).

**Ne pas utiliser Piper Siwis** pour les nouveaux audios ClairFLE : la voix
officielle est **DeniseNeural** avec ralentissement **−25 %**.

### Audios des nombres

`public/lib/audio/nombre/{n}.mp3` : 1 à 100, centaines 200 à 900 (« deux cents »…)
et 1000 (« mille »), même voix et même débit. Texte lu = écriture suisse romande de
`numberToFrench` (`src/francais/french-numbers.ts` : septante, huitante, nonante),
pas les chiffres.

Combinaison : un audio `nombre/100-12` (ou `/lib/audio/nombre/100-12.mp3`) enchaîne
`100.mp3` puis `12.mp3` dans `PlayerAudio` (`tcfAudioSequence`, `src/tcf/media.ts`).
`nombreAudioCombinaison(n)` donne le chemin pour un entier de 1 à 9999
(345 → `nombre/300-45`, 2012 → `nombre/2-1000-12`). Pas de QR imprimé pour une
combinaison (aucun fichier unique) ; ne pas générer de MP3 pour les nombres composés.

### Paramètres audio

- Conteneur : **MP3**, bitrate **96 kb/s** (`ffmpeg` + `libmp3lame`).
- Texte lu = **libellé du mot** (forme affichée), une seule énonciation, sans
  préfixe « le mot est… ».
- Même `{theme}/{slug}` que l’image pour `soutienAudioFor` et les QR
  (origine `https://doc-prof.vercel.app`).

### Procédure

1. Vérifier si `public/lib/audio/vocabulaire/{theme}/{slug}.mp3` existe.
2. Sinon générer avec **edge-tts DeniseNeural −25 %**, puis normaliser en MP3 96k.
3. Ne pas régénérer par-dessus un fichier existant sans demande explicite.

```bash
pip install edge-tts
# Exemple
python3 - <<'PY'
import asyncio, edge_tts, subprocess, tempfile
from pathlib import Path

async def main():
    text = "bateau"
    dest = Path("public/lib/audio/vocabulaire/transports/bateau.mp3")
    dest.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        raw = Path(tmp) / "raw.mp3"
        await edge_tts.Communicate(text, "fr-FR-DeniseNeural", rate="-25%").save(str(raw))
        subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", "-i", str(raw),
             "-codec:a", "libmp3lame", "-b:a", "96k", str(dest)],
            check=True,
        )

asyncio.run(main())
PY
```

---

## Quand brancher image + audio ensemble

Pour un **nouveau mot** Voc / Soutien / Jeux :

1. Image 800×600 WebP fond blanc → `images/vocabulaire/{theme}/`.
2. Audio DeniseNeural −25 % → `audio/vocabulaire/{theme}/` (même slug).
3. Entrée banque avec `imageSrc` → `/lib/images/vocabulaire/...`.
4. Contrôle : aperçu fiche + QR audio (type 15) si pertinent.

Pour une **nouvelle scène PO TCF** : image seule selon la section
« Scènes PO TCF » — pas de fond blanc, pas d’obligation TTS vocabulaire.

## Terminé quand

**Vocabulaire**

- Image : 800×600 (ou cohérente au thème), fond blanc, sujet centré, WebP.
- Audio : MP3 96k, **DeniseNeural −25 %**, chemin aligné.
- Pas d’écrasement d’anciens MP3 sans accord.
- Résolution OK via `soutienImageFor` / `soutienAudioFor`.

**Scène PO TCF**

- Image 4:3 WebP sous `public/lib/images/`, brief fide respecté
  (action, rôles, décor banal, adultes, sans texte).
- Référencée dans `po.json` ; résolution OK via `tcfImageSrc`.
