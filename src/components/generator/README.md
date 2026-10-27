# Générateur UI (`src/components/generator/`)

Découpage de l’ancien monolithe `App.tsx` / `GeneratorPage.tsx` pour le développement.

| Fichier | Rôle |
|---|---|
| `GeneratorPage.tsx` | Page générateur : état, hooks, shell Header / workspace |
| `generator-derived.ts` | Helpers purs : thèmes, typeChoices, maxQuestions, total points |
| `generator-block-context.ts` | Drapeaux / dérivés du bloc actif (`deriveBlockContext`) |
| `useQuestionsOverflow.ts` | ResizeObserver : débordement A4 |
| `useGeneratorAudio.ts` | Collecteurs + téléchargements audio (soutien / TCF / TCM CFR) |
| `useGenerateActions.ts` | Valider, tirer TCF / série soutien, générer, régénérer un bloc |
| `useCoordEditing.ts` | Outil repérage : origine, marques, axes |
| `usePageConfig.ts` | `updatePage`, sync mode libre, grilles / modes oraux / TCF |
| `usePageNavigation.ts` | Domaine / thème / pages / exercices (+ effets de migration) |
| `SettingsPanel.tsx` | Aside paramètres (compose les champs ci-dessous) |
| `PageStructureTabs.tsx` | Titre panneau + onglets feuilles / exercices |
| `DomainThemeTypeFields.tsx` | Mode, domaine, thème, type, phrase, jeux, TCF, niveau, quad |
| `CalliSettingsPanel.tsx` | Réglages calligraphie |
| `SoutienVocabFields.tsx` | Soutien mots / compléter + pool vocabulaire |
| `QuestionsColumnsFields.tsx` | Questions / points / saut de page / colonnes |
| `CoordLibreSettings.tsx` | Panneaux formes / cadrans / droites / construire / transform |
| `DraftGridControls.tsx` | Grilles de brouillon (problèmes / TPM) |
| `ResultPanel.tsx` | Actions aperçu + stage A4 + feuilles impression |
| `TopbarTools.tsx` | Icônes haut : couleur, pied, mode libre, déconnexion |
| `FooterSidePanel.tsx` | Panneau droit en-tête / pied de page |
| `LibreSidePanel.tsx` | Panneau droit édition manuelle (tous domaines) |
| `GenericLibreEditor.tsx` | Éditeur générique consigne + questions |
| `WorksheetSheet.tsx` | Rendu d’une feuille A4 (élève / corrigé) |
| `SelectBox.tsx` | Liste déroulante du panneau |
| `Header.tsx` | Barre de marque ClairFLE |
| `Landing.tsx` / `AccessPage.tsx` | Accueil et mot de passe |
| `theme.ts` | Couleur thème (localStorage + helpers HSL) |
| `page-helpers.ts` | `applyType`, grilles brouillon, modes oraux… |
| `routing.ts` | Routes `/`, `/acces`, `/generateur` |
| `FormesPalette.tsx`, `VocabAddWordRow.tsx`, `TabRemoveButton.tsx` | Contrôles ciblés |

`src/App.tsx` ne fait plus que le routage.
