---
name: falc
description: >-
  Cadre FALC pour fiches de théorie de français : préparer, structure type,
  règles d’écriture, mise en page, checklist, traductions langues d’origine.
  À utiliser pour créer / relire une théorie FALC ou une aide bilingue —
  pas pour les banques Com CECRL (voir comprehension-ecrite).
---

# Cadre FALC — théorie de français

Skill **cadre** pour créer des **fiches de théorie** en FALC (Facile à Lire et à Comprendre).  
Ce n’est **pas** une certification ni une copie d’un référentiel externe.  
Les règles ci-dessous sont le **mode opératoire ClairFLE** pour la théorie français accessible.

Frontière : textes **Com** (compréhension écrite A1–B1) → skill `comprehension-ecrite`.  
Ce skill = **théorie / règles / entraînement FALC** (+ traductions d’aide).

---

## Quand utiliser ce skill

Utiliser `falc` dès qu’on :

- crée ou relit une **fiche de théorie** de français en FALC ;
- découpe un programme en **une notion = une fiche** ;
- applique la **structure type**, les **règles d’écriture**, la **mise en page** ou la **checklist** ci-dessous ;
- ajoute une **traduction d’aide** dans la langue d’origine de l’élève (base = texte français).

**Ne pas** utiliser `falc` à la place de :

| Besoin | Skill |
|---|---|
| Textes / questions Com · compréhension écrite A1–A2–B1 | `comprehension-ecrite` |
| Libellés UI enseignant·e | `texte-interface` |
| Relire un énoncé maths | `relecture-enonce` |
| Push sur `main` | `preparer-pull-request` |

### Frontière avec `comprehension-ecrite`

| | `falc` | `comprehension-ecrite` |
|---|---|---|
| Objet | Fiches **théorie** FALC (+ aide traduite) | Textes **Com** FLE + questions |
| Niveaux | Public pré-A1 / A1 / A2… + niveau de lecture | CECRL A1 / A2 / B1 (`difficulty`) |
| Adresse | « je » / « tu » dans la fiche élève | Consignes scolaires vouvoiées côté items |

---

## 1. Préparer

Avant d’écrire, fixer **trois points** :

1. **Le public**
   - Niveau CECRL (pré-A1, A1, A2…).
   - Niveau de lecture (débutant lecture, lecteur fragile, lecture fluide).
   - **Langue d’origine** si une aide bilingue est prévue (voir §7).

2. **L’objectif**
   - **Une seule compétence** par fiche  
     (ex. conjuguer au présent, reconnaître un nom, écrire une phrase).

3. **Le découpage**
   - **Une notion = une fiche** (1 à 2 pages maximum).
   - Notion trop grande → plusieurs fiches  
     (ex. « Le présent : les verbes en -er », puis « être et avoir »).

### Programme ClairFLE (domaine `grammaire`)

Catalogue et contenu FR : `src/grammaire/` (thèmes SCAI + fiches théorie FALC).  
Les **exercices** liés à chaque thème seront ajoutés ensuite (mêmes topics, nouveaux types).  
**Traductions** : seulement après validation du français (§7).

Repère thèmes : Se présenter → Conjuguer au présent → Entrer en contact → Questions → Activité → Espace → Temps → Demander → Décrire → Conseiller → Aliments → Passé → Pronoms → Action → Avenir → Faits divers → Argumenter → Exprimer → Aide-mémoire.

---

## 2. Structure type d’une fiche

Ordre fixe des blocs :

| Bloc | Contenu |
|---|---|
| **Titre** | Court et concret (« Le présent des verbes en -er ») |
| **Ce que je vais apprendre** | 1 à 2 phrases |
| **Je regarde** | 1 exemple simple + pictogramme ou image |
| **J’explique** | La règle en **3 à 5 phrases** courtes |
| **Je retiens** | Encadré (couleur) avec l’essentiel |
| **Tableau ou schéma** | La règle sous forme visuelle |
| **Attention !** | **Un seul** piège ou exception fréquente |
| **Je m’entraîne** | **3 à 5** exercices progressifs |
| **Ce que j’ai appris** | Liste à cocher |

### À compléter — Exemples de fiches validées

- [ ] Liens / chemins vers 1–2 fiches modèles validées
- [ ] Variantes selon le niveau (pré-A1 vs A2)

*(À compléter.)*

---

## 3. Règles d’écriture FALC

### Faire

- **Une idée par phrase**, **10 à 12 mots maximum**.
- Ordre simple : **sujet, verbe, complément**. Pas de phrase longue.
- Mots **simples et courants**.
- Un mot difficile (« verbe », « sujet », « conjuguer ») est **expliqué la première fois**, puis **toujours le même mot**.
- **Le même mot pour la même idée** : pas « verbe » puis « action » pour la même chose.
- Adresse directe : **« tu »** ou **« je »** (« Je retiens », « Tu écris »).
- Exemples **concrets**, tirés de la vie réelle (travail, logistique, quotidien).
- **Listes** plutôt que paragraphes ; **une information par ligne**.
- Termes de grammaire **toujours** accompagnés d’un **exemple**.

### Ne pas faire

- Négation compliquée, passif, sous-entendu.
- Métaphores, ironie, jeux de mots.
- Synonymes qui embrouillent.
- Plusieurs exceptions dans le même « Attention ! ».
- Présenter la fiche comme « certifiée FALC » officielle.

### À compléter — Lexique métier

- [ ] Tableau « préférer / éviter » (exemples ClairFLE)
- [ ] Glossaire des termes grammaticaux avec définition FALC + exemple

*(À compléter.)*

---

## 4. Mise en page

| Règle | Detail |
|---|---|
| Police | Sans empattement (Arial, Verdana, Calibri ou équivalent projet) |
| Taille | **14 minimum** |
| Interligne | Aéré (**1,5**) |
| Alignement | **À gauche** (jamais justifié sur une fiche théorie FALC) |
| Blanc | Beaucoup d’espace ; **un retour à la ligne à chaque phrase** |
| Encadrés | Pour « Je retiens » et « Attention » |
| Fonds | Pas de texte sur fond coloré **foncé** ni sur image |

### Code couleur (constant sur toutes les fiches)

Exemple à conserver d’une fiche à l’autre :

| Rôle | Couleur |
|---|---|
| Sujet | bleu |
| Verbe | rouge |
| Terminaison | vert |

**Rappel ClairFLE :** la couleur **ne porte jamais seule** l’information (N&B).  
Toujours doubler : libellé, gras, soulignement ou position dans un tableau.

### Pictogrammes cohérents

| Pictogramme | Sens |
|---|---|
| Loupe | Je regarde / j’observe |
| Crayon | Je m’entraîne |
| Ampoule | Je retiens |
| Point d’exclamation | Attention |

### À compléter — Implémentation UI / CSS

- [ ] Classes CSS projet pour encadrés, code couleur, pictos
- [ ] Compatibilité impression A4 (`test-impression`) et N&B

*(À compléter quand le rendu fiche théorie sera branché dans le générateur.)*

---

## 5. Processus de création

1. Lister les notions du programme ; ordonner **simple → complexe**.
2. Rédiger la règle en **une phrase**, puis la **simplifier encore**.
3. Choisir **2 à 3** exemples très clairs.
4. Construire le **tableau ou schéma**.
5. Créer les exercices : **reconnaître → compléter → produire** (avec un **exemple résolu**).
6. Relire avec la **checklist** (§6).
7. Ajouter la **traduction d’aide** si une langue d’origine est choisie (§7).
8. Tester avec **1 ou 2 apprenants** ; ajuster ce qui est mal compris.

---

## 6. Checklist de relecture

- [ ] Une seule notion dans la fiche
- [ ] Phrases courtes (≤ 12 mots)
- [ ] Mots difficiles expliqués ; vocabulaire constant
- [ ] Exemple **avant** la règle (« Je regarde » puis « J’explique »)
- [ ] Encadré « Je retiens » présent
- [ ] Code couleur et pictogrammes cohérents (et lisibles sans couleur seule)
- [ ] Police ≥ 14, texte à gauche, mise en page aérée
- [ ] Exercices progressifs avec exemple résolu
- [ ] Testé avec un apprenant (quand possible)
- [ ] Traduction d’aide présente si langue d’origine demandée (§7)

---

## 7. Traduction d’aide (langue d’origine)

**Principe :** le texte **source** est toujours le **français** de la fiche.  
À chaque création / révision, on peut fournir une **traduction d’aide** dans la langue d’origine de l’élève pour soutenir la compréhension — **pas** pour remplacer l’apprentissage du français.

### Langues supportées (liste projet)

| Code | Langue |
|---|---|
| `en` | anglais |
| `ar` | arabe |
| `am` | amharique |
| `fa-AF` | dari |
| `es` | espagnol |
| `pt` | portugais |
| `it` | italien |
| `fa` | persan |
| `ps` | pachto |
| `ru` | russe |
| `so` | somali |
| `tr` | turc |
| `ti` | tigrinya |
| `uk` | ukrainien |

### Règles de traduction

1. **Base = français FALC** déjà validé (phrases courtes, même découpage).
2. Traduire **bloc par bloc** (titre, « Ce que je vais apprendre », règle, « Je retiens », « Attention », consignes d’exercices).
3. Garder les **exemples français** visibles ; la traduction explique / glose, elle ne remplace pas l’exemple en français sauf consigne contraire.
4. Termes grammaticaux : reprise du **même terme français** + glose courte dans la langue d’origine la première fois.
5. Scripts non latins (arabe, amharique, tigrinya, etc.) : sens clair ; **sens de lecture** respecté ; ne pas mélanger dans la même ligne sans séparation nette.
6. Ne **pas** inventer de contenu pédagogique nouveau dans la traduction.
7. Si une langue manque ou est incertaine : indiquer clairement « traduction à valider » plutôt que d’improviser un faux label officiel.

### Format attendu (contenu / banque)

Pour chaque bloc FR, prévoir un objet d’aide du type :

```text
fr: <texte français FALC>
helpLang: <code langue>
help: <traduction d’aide>
```

### À compléter — stock / UI

- [ ] Où stocker les traductions (fichiers, champs JSON, UI générateur)
- [ ] Choix de la langue d’origine dans le générateur
- [ ] Affichage fiche : FR seul / FR + aide / aide sous chaque bloc

*(À compléter.)*

---

## 8. Sources et limites

- Pas de citations verbatim d’un référentiel externe.
- Pas de label « certifié FALC » dans l’UI ou les fiches.
- Traductions = **aide pédagogique** ; validation humaine recommandée pour les langues à faible couverture.

---

## Terminé quand

- Fiche = **une notion**, structure type complète, checklist OK.
- Écriture FALC (≤ 12 mots / phrase, vocabulaire constant, exemple avant règle).
- Mise en page aérée, code couleur + pictos cohérents (info aussi sans couleur).
- Traduction d’aide fournie **si** une langue d’origine est demandée, à partir du français.
- Frontière avec `comprehension-ecrite` respectée.
