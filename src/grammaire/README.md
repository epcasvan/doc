# Grammaire — théorie FALC (SCAI)

Domaine dédié pour les **fiches de théorie** de français en FALC, d’après le programme SCAI.
Les notions sont **adaptées** (pas copiées) à partir du stock pédagogique soutien-scolaire, avec une **répartition SCAI** différente (parties communicatives + conjugaison au présent).

| Fichier | Rôle |
|---|---|
| `catalog.ts` | Thèmes (parties) + types « théorie » |
| `theory/*.ts` | Contenu FALC français (pas de traductions pour l’instant) |
| `generate.ts` | `tryGenerateGrammaireBlock` → items `layout: 'theory'` |
| `types.ts` | Doc théorie + helpers `isGrammaireTheoryType` |

## Thèmes

Se présenter → **Conjuguer au présent** → Entrer en contact → Questions → Activité → Espace → Temps → Demander → Décrire → Conseiller → Aliments → Passé → Pronoms → Action → Avenir → Faits divers → Argumenter → Exprimer → Aide-mémoire.

## Usage

- Domaine UI : **Grammaire**
- Thème = partie SCAI (ou complément ClairFLE, ex. conjugaison au présent)
- Type = une fiche théorie (une notion)
- Exercices liés : à ajouter plus tard comme types supplémentaires sur le même thème

## Traductions

Reportées après validation du français FALC (skill `falc` §7).
