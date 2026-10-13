export type Domain =
  | 'français'
  | 'algèbre'
  | 'géométrie'
  | 'alphabetisation'
  | 'soutien-fr'
  | 'gattegno'
  | 'jeux'
  | 'calligraphie'
  | 'grammaire'
  | 'vocabulaire'
  | 'société'
  | 'santé'
  | 'acm'
  | 'tcm'
  | 'tcm-csc'
  | 'tcm-cfr'
  | 'tcf'

/** Catégories grammaire en couleur (Gattegno). */
export type PhraseCategory =
  | 'pronom'
  | 'verbe'
  | 'nom'
  | 'determinant'
  | 'adjectif'
  | 'adverbe'
  | 'preposition'
  | 'conjonction'
  | 'negation'
  | 'interjection'

export type PhraseToken = {
  text: string
  category: PhraseCategory
}

export type PreviewMode = 'student' | 'answers'
export type Difficulty = 'facile' | 'moyen' | 'avance'
export type Figure =
  | 'rectangle'
  | 'square'
  | 'triangle'
  | 'cube'
  | 'circle'
  | 'parallelogram'
  | 'trapezoid'
  | 'rhombus'
  | 'cuboid'
  | 'cylinder'
  | 'cone'
  | 'sphere'
  | 'oval'
  | 'pentagon'

export type Layout =
  | 'inline'
  | 'column'
  | 'column-empty'
  | 'division-column'
  | 'text'
  | 'compare'
  | 'sequence'
  | 'select'
  | 'place-value'
  | 'geo'
  | 'coord'
  | 'audio-dictation'
  | 'symmetry-grid'
  | 'segment-measure'
  | 'metro-map'
  | 'algebra'
  | 'equation'
  | 'encadrement'
  | 'order'
  | 'letter-grid'
  | 'syllable-table'
  | 'phrase-color'
  | 'phrase-order'
  | 'phrase-build'
  | 'phrase-write'
  | 'gattegno-chart'
  | 'vocab-table'
  | 'vocab-match'
  | 'vocab-write'
  | 'syllable-complete'
  | 'listen-check'
  | 'syllable-sound'
  | 'syllable-pronounce'
  | 'mark-letter'
  | 'phrase-scramble'
  | 'determinant-fill'
  | 'dictee-grid'
  | 'count-sound'
  | 'read-phrases'
  | 'audio-match'
  | 'audio-order'
  | 'word-search'
  | 'theory'
  | 'glossary'
  | 'card-grid'
  | 'calligraphy'
  | 'count-icons'
  | 'fraction-shape'
  | 'tcf'

/** Icône cible à compter (SVG N&B). */
export type CountIconKind = 'note' | 'notes' | 'star' | 'heart' | 'leaf' | 'moon' | 'bolt' | 'flower'

export type CountIconToken = {
  kind: CountIconKind | 'circle' | 'triangle'
  /** Position en % dans le cadre (0–100). */
  x: number
  y: number
  /** Taille relative (environ 10–22). */
  size: number
  /** Rotation en degrés. */
  rot: number
}

export type CountIconScene = {
  /** Libellé pluriel sous le cadre (ex. « notes »). */
  label: string
  targetKind: CountIconKind
  targetCount: number
  tokens: CountIconToken[]
}

export type CoordShape =
  | 'point'
  | 'circle'
  | 'triangle'
  | 'square'
  | 'diamond'
  | 'star'
  | 'plus'
  | 'heart'
  | 'pentagon'
  | 'hexagon'
  | 'oval'
  | 'crescent'
  | 'arrow'
  | 'cross'
  | 'trapezoid'
  | 'house'

export type CoordVariant = 'cells' | 'polygon' | 'polar' | 'axes'
export type CoordAxis = 'letters' | 'letters-y' | 'numeric'
/** Côté physique d’un carré du tableau, en millimètres. */
export type CoordCellMm = 3 | 4 | 5 | 6 | 8 | 10
/** Carrés des repères à cadrans / droites / construction. */
export type CoordAxesCellMm = 3 | 4 | 5
/** Carrés des tableaux de formes (lire / placer). */
export type CoordFormesCellMm = 6 | 8 | 10
/** Nombre de carrés pour une unité de graduation. */
export type CoordUnitSquares = 1 | 2

export type CoordMark = {
  x: number
  y: number
  kind: CoordShape
  label?: string
  /** `answer` : visible seulement au corrigé. */
  reveal?: 'always' | 'answer'
  /** Point donné : coordonnées affichées sur le tableau. */
  given?: boolean
  /** Afficher (x ; y) à côté du point. */
  showCoord?: boolean
}

export type CoordVertex = {
  x: number
  y: number
  label: string
}

export type CoordScene = {
  variant: CoordVariant
  cols: number
  rows: number
  axis: CoordAxis
  marks: CoordMark[]
  vertices?: CoordVertex[]
  /** Étendue du repère (−range à +range) pour le variant `axes` (carré). */
  range?: number
  /** Demi-largeur en unités (repère rectangulaire). */
  rangeX?: number
  /** Demi-hauteur en unités (repère rectangulaire). */
  rangeY?: number
  /** Côté d’un carré, en millimètres (le tableau grandit avec les cases). */
  cellMm?: CoordCellMm
  /** 1 carré = 1 unité, ou 2 carrés = 1 unité. */
  unitSquares?: CoordUnitSquares
  /** Origine : nombre de carrés depuis le bord gauche. */
  originCol?: number
  /** Origine : nombre de carrés depuis le bord bas. */
  originRow?: number
  /** Masquer axes, labels x/y et graduations (origine à deviner). */
  hideAxes?: boolean
  /** Masquer uniquement numérotation et libellés x/y (axes visibles). */
  hideAxisLabels?: boolean
  /** Flèches aux extrémités positives des axes. */
  axisArrows?: boolean
  /**
   * Nombre de colonnes avec traits de grille visibles (≤ `cols`).
   * Au-delà : espace pour prolonger l’axe sans traits (ex. 21–22).
   */
  visibleCols?: number
  /** Nombre de lignes avec traits de grille visibles (≤ `rows`). */
  visibleRows?: number
  /** Afficher l’origine (éditeur / corrigé). */
  showOrigin?: boolean
  /**
   * Afficher « 0 » au centre du carré (−1 ; −1) plutôt que « O » sur l’origine.
   * Nécessite une marge d’au moins `unitSquares` cases sous/à gauche de l’origine.
   */
  originZeroInNegCell?: boolean
  /** Pas de la grille (1 ou 0,5). */
  step?: number
  /** Pas des graduations numériques (en unités maths). */
  labelStep?: number
  /** Droites colorées (repérage). */
  lines?: CoordLine[]
  /** Traits et polygones à construire (corrigé). */
  paths?: CoordPath[]
  /** Quadrillage fin type papier millimétré. */
  fineGrid?: boolean
}

export type CoordLineColor = 'violet' | 'orange' | 'green' | 'blue' | 'red' | 'muted' | 'rose'
export type CoordLineStroke = 'solid' | 'dashed' | 'dotted' | 'dashdot' | 'longdash' | 'dense' | 'doubledash'
export type CoordReply = 'pair' | 'text' | 'draw'

export type CoordPath = {
  id: string
  kind: 'line' | 'segment' | 'polygon'
  a?: number
  b?: number
  c?: number
  points?: Array<{ x: number; y: number }>
  stroke?: 'solid' | 'dashed'
  /** Couleur du trait (lisible aussi via style de trait). */
  color?: CoordLineColor
  /** `answer` : visible seulement au corrigé. */
  reveal?: 'always' | 'answer'
}

export type CoordLine = {
  id: string
  name: string
  color: CoordLineColor
  stroke: CoordLineStroke
  /** Droite ax + by + c = 0. */
  a: number
  b: number
  c: number
}

export type CoordQuestion = {
  prompt: string
  answer: string
  kind?: CoordShape
  reply?: CoordReply
}

/** Deux colonnes de données (transformations types 3–4), sans bloc questions. */
export type CoordTransformColumns = {
  leftTitle: string
  left: Array<{ label: string; text: string }>
  rightTitle: string
  right: Array<{ label: string; answer: string }>
}

export type AlgebraGiven = { letter: string; value: number }

export type ArithOp = '+' | '−' | '×' | '÷'
export type MissingPos = 'a' | 'b' | 'result'

export type Topic = {
  id: string
  label: string
  domain: Domain
}

export type FrenchTrack = 'voc' | 'gram' | 'com'
/** Banque de verbes Gattegno, ou mode libre (édition des phrases générées). */
export type PhraseVerbGroup = 'er' | 'autres' | 'libre'

export type ExerciseType = {
  id: string
  topic: string
  label: string
  description: string
  instruction: string
  visual: 'ligne' | 'trou' | 'colonne' | 'colonne-vide' | 'texte' | 'geo' | 'suite'
  figure?: Figure
  preferredColumns?: number
  /** Filtre Voc / Gram / Com du domaine français. */
  track?: FrenchTrack
}

export type FigureDims = {
  side?: number
  length?: number
  width?: number
  height?: number
  base?: number
  radius?: number
  /** Diamètre (cercle TCM / placement). */
  diameter?: number
  top?: number
  bottom?: number
  a?: number
  b?: number
  c?: number
  /** Diagonales du losange (placement / TCM). */
  d1?: number
  d2?: number
  /** Périmètre donné (ex. 25–26 CFR) — placeholder `[périmètre]` dans l’énoncé. */
  perimeter?: number
  unit?: string
  triangleKind?: 'equilateral' | 'isosceles' | 'scalene' | 'right'
  trapezoidKind?: 'rectangle' | 'isosceles' | 'scalene'
  /** Cote à trouver : affichée « ? » sur la figure. */
  ask?: 'side' | 'length' | 'width' | 'height' | 'radius' | 'a' | 'b' | 'c' | 'base' | 'top'
  /** Forme seule : pas de cotes, pas de marque d’angle droit, pas de rayon. */
  bare?: boolean
}

export type DivisionStep = {
  bringDown: string
  product: string
  remainder: string
  /** Colonne de fin (0-based) sous le dividende pour aligner le produit. */
  endCol: number
}

export type MathItem = {
  layout: Layout
  answer: string
  prompt?: string
  figure?: Figure
  dims?: FigureDims
  op?: ArithOp
  a?: number
  b?: number
  c?: number
  result?: number
  missing?: MissingPos
  digitsA?: string[]
  digitsB?: string[]
  digitsResult?: string[]
  /** Produits partiels (× 2 chiffres) ou lignes de travail (division). */
  digitsPartials?: string[][]
  /** Retenues / emprunts alignés sur les colonnes (même largeur que digitsA). */
  carries?: string[]
  /**
   * Nombre de chiffres après la virgule (colonnes décimales).
   * La virgule s’affiche dans la case des unités (même carré).
   */
  decimalPlaces?: number
  /** Chiffres du reste (division posée). */
  digitsRemainder?: string[]
  dividend?: number
  divisor?: number
  quotient?: number
  remainder?: number
  divisionSteps?: DivisionStep[]
  left?: string
  right?: string
  sequence?: string[]
  blankIndexes?: number[]
  /** Largeur fixe des cases de suite (ex. 5 chiffres). */
  sequenceDigits?: number
  options?: string[]
  labels?: string[]
  /** Grille de lettres : nombre de colonnes (ex. 10 pour Soutien FR type 2). */
  letterGridCols?: number
  /** Rendu cercles (lecture) ou tableau sans bordure (Soutien FR). */
  letterGridVariant?: 'circles' | 'table'
  /** Variante de rendu pour les QCM (orale empilée, cartes vocabulaire). */
  selectVariant?: 'pills' | 'oral' | 'cards'
  /** Bloc de théorie grammaticale (fiche lecture seule). */
  theoryBlock?: {
    kind: 'heading' | 'paragraph' | 'note' | 'rule' | 'list' | 'table'
    text?: string
    sub?: boolean
    title?: string
    items?: string[]
    headers?: string[]
    rows?: string[][]
    examples?: Array<{ correct: string; wrong?: string }>
  }
  /** Entrée de glossaire maths (mot + définition + schéma). */
  glossary?: {
    term: string
    definition: string
    figure: string
  }
  /** Mode de réponse orale : QCM texte, trait libre, ou QCM images. */
  answerMode?: 'qcm' | 'text' | 'images'
  /** Images des choix (même ordre que `options`) pour le QCM images. */
  optionImages?: string[]
  /** Chemins audio (QR) alignés sur `options` — Soutien FR type 6. */
  optionAudioSrcs?: string[]
  /** true si un QCM images est possible pour cette question. */
  imagesAvailable?: boolean
  /** Grille vide à remplir (poser soi-même les nombres). */
  blankOperands?: boolean
  /** Message d’erreur mode libre (ex. soustraction a ≤ b). */
  libreError?: string
  /** Point pour repérage / transformations. */
  point?: { x: number; y: number; label?: string }
  /** Image du point (corrigé ou second point). */
  pointImage?: { x: number; y: number; label?: string }
  /** Grille de repérage (formes, polygone ou polaire). */
  coordScene?: CoordScene
  /** Questions de lecture de coordonnées liées à coordScene. */
  coordQuestions?: CoordQuestion[]
  /** Transformations types 3–4 : points à placer (col. 1) et images (col. 2). */
  coordColumns?: CoordTransformColumns
  /** `place` : tableau vide côté élève, formes visibles au corrigé. */
  coordTask?: 'read' | 'place' | 'construct'
  /** Direction pour le rangement : ___ < ___ < ___ ou ___ > ___ > ___. */
  orderOp?: '<' | '>'
  /** Rangement : nombres donnés en cadres, un cadre au-dessus de chaque trait. */
  orderBoxed?: boolean
  /** Rangement compact (cadres/traits étroits, une ligne — max. ~3 chiffres). */
  orderCompact?: boolean
  calcAnswer?: string
  /** Second calcul (layout geo dual : aire à droite). */
  calcAnswerSecondary?: string
  responseAnswer?: string
  /** Problème CFR (ex. 15–16) : id du modèle pour reconstruire l’énoncé. */
  problemTemplateId?: string
  /** Variables numériques du problème (partagées entre les deux parties). */
  problemVars?: Record<string, number>
  /** Métadonnées des champs éditables (libellé + partie). */
  problemVarDefs?: Array<{ key: string; label: string; editOn: 0 | 1 | 'both' }>
  /** Index de la partie (0 = 1ʳᵉ question, 1 = 2ᵉ). */
  problemPart?: 0 | 1
  /** Inconnues à afficher sur les lignes de réponse (équations). */
  unknowns?: string[]
  /** Lignes de développement (corrigé équations, style soutien-scolaire). */
  development?: string[]
  /** Opérations en marge gauche, alignées sur development. */
  operations?: string[]
  /** Afficher le système avec I / II et accolade. */
  systemBrace?: boolean
  /** Valeurs par case pour la décomposition (layout place-value). */
  placeParts?: string[]
  /** Figure composée cotée (périmètre). */
  compositeScene?: CompositeScene
  /** Lignes « libellé : réponse » sans bordure (propriétés des figures). */
  propertyLines?: { label: string; answer: string }[]
  /** Geo : deux cadres de brouillon côte à côte (périmètre / aire). */
  geoDualPads?: boolean
  /** Geo dual : espace réduit de moitié entre la grille et les lignes Périmètre / Aire. */
  geoDualTight?: boolean
  /** Masquer le numéro de question (ex. problème géométrie 25–26). */
  hideItemNumber?: boolean
  /** Cadre forme + traits (TCM CFR ex. 16–17) : figure à gauche, réponses à droite. */
  geoNameCard?: boolean
  /**
   * Forme fractionnaire (TCM ex. 21/22, port soutien-scolaire).
   * `mode: 'color'` = fraction donnée, forme à colorier ;
   * `mode: 'read'` = forme précoloriée, fraction à écrire.
   */
  fracShape?: {
    kind: import('@/components/math/FractionShape').ShapeKind
    d: number
    n: number
    copies: number
    multi: boolean
    mode: 'color' | 'read'
  }
  /** Conversion d’unités : valeur et unités de part et d’autre du signe =. */
  convert?: { value: string; from: string; to: string }
  /** Enregistrement à écouter (compréhension orale). */
  audioSrc?: string
  /** Playlist audio (dictée de nombres / multiplications) — téléchargeable. */
  audioParts?: string[]
  /** Figure de symétrie axiale (TCM CFR). */
  symmetryFigure?: {
    id: string
    cols: number
    rows: number
    axisX: number
    side: 'left' | 'right'
    /** Rotation horaire de la silhouette (0 = sens normal). */
    rotation?: 0 | 90 | 180 | 270
    polylines: Array<Array<{ x: number; y: number }>>
    /** Points marqués (œil, pompon…) sur des intersections. */
    dots?: Array<{ x: number; y: number }>
  }
  /** Segments à mesurer (TCM CFR). */
  segments?: Array<{ mm: number; unit: 'mm' | 'cm'; display: string }>
  /** Plan de métro (TCM CFR). */
  metroMap?: {
    id: string
    cols: string[]
    rows: number[]
    lines: Array<{ id: string; name: string; color: string; cells: string[] }>
  }
  metroQuestions?: Array<{
    prompt: string
    answer: string
    kind?: 'crossing' | 'gare-where' | 'gare-which' | 'path' | 'termini'
    lineNames?: string[]
    cell?: string
  }>
  /** Mots étiquetés (grammaire en couleur). */
  tokens?: PhraseToken[]
  /** Séquence de pastilles (type 3). */
  pastilles?: PhraseCategory[]
  /** Nombre de lignes d’écriture (type 4). */
  writeLines?: number
  /** Variante du tableau Gattegno. */
  chartMode?: 'labels' | 'words' | 'outline'
  /** Tableau de mots à apprendre (image + libellé + audio QR). */
  vocabEntries?: Array<{ id: string; label: string; imageSrc?: string; audioSrc?: string }>
  vocabRows?: number
  vocabCols?: number
  /** Association Voc : mode image ou texte. */
  vocabMatchMode?: 'image' | 'text' | 'syllables'
  /** Graphèmes à colorer (Soutien FR — voyelle du thème). */
  themeGraphemes?: string[]
  /** Paires correctes pour le corrigé (association). */
  vocabPairs?: Array<{ left: string; right: string }>
  /** Longueur du trait de réponse Voc (en caractères approximatifs). */
  vocabLineCh?: number
  /** Mot cible (phrase / dictée). */
  vocabWriteHint?: string
  /** Phrase lue à voix haute (dictée), affichée au corrigé. */
  vocabDictee?: string
  /** Soutien FR type 5 : grille image + Un/Une + mot à trous (syllabe) + QR audio. */
  syllableCompletes?: Array<{
    article: string
    before: string
    blank: string
    after: string
    word: string
    imageSrc?: string
    audioSrc?: string
  }>
  /** Type 8 variante QR : pas d’image, QR audio à la place. */
  syllableSoundQrOnly?: boolean
  /** Alphabétisation : mots encadrés à souligner (sans coloriage du son). */
  markLetterWords?: string[]
  /** Alphabétisation type 13 : mot + syllabes + QR. */
  syllablePronounceRows?: Array<{
    index: number
    word: string
    parts: string[]
    audioSrc?: string
  }>
  /** Syllabes : une seule table script (pas de Playwrite). */
  syllableTableScriptOnly?: boolean
  /** Cadre arrondi autour de chaque syllabe (pas autour du bloc). */
  syllableTableCellFrames?: boolean
  /** Soutien FR type 8 : image + mini-tableau (une case par syllabe). */
  syllableSoundItems?: Array<{
    word: string
    parts: string[]
    /** Index de la syllabe qui porte le son (−1 si aucune). */
    hitIndex: number
    /** Toutes les syllabes qui portent le son (corrigé multi-hits). */
    hitIndices?: number[]
    imageSrc?: string
    audioSrc?: string
  }>
  /** Soutien FR type 9 : phrase + image + trait + lettres mélangées. */
  phraseScrambles?: Array<{
    before: string
    after: string
    word: string
    letters: string
    imageSrc?: string
    /** Audio de la phrase complète (DeniseNeural −25 %). */
    audioSrc?: string
    /** Phrase entière (pour téléchargement / debug). */
    sentence?: string
  }>
  /** Soutien FR type 10 : phrases à compléter (le / la / l’ / les). */
  determinantFills?: Array<{
    parts: Array<{ t: string } | { blank: string }>
    sentence: string
  }>
  /** Soutien FR type 11 : mots de dictée (grille 2 colonnes). */
  dicteeWords?: string[]
  /** Soutien FR type 12 : phrases à lire + compter le son. */
  countSoundItems?: Array<{
    phrase: string
    count: number
  }>
  /** Soutien FR type 14 : phrases à lire (voyelle colorée). */
  readPhrases?: string[]
  /** Soutien FR type 15 (ancien) : QR audio + mots à relier. */
  audioMatchRows?: Array<{
    /** Mot entendu (ordre d’écoute / QR). */
    listenWord: string
    audioSrc?: string
    /** Mot affiché sur la même ligne (mélangé). */
    showWord: string
  }>
  /**
   * Soutien FR types 15 / 16 : classer dans l’ordre.
   * 8 QR numérotés + 8 cases réponse (mots ou images).
   */
  audioOrder?: {
    mode: 'words' | 'images'
    clips: Array<{
      word: string
      audioSrc?: string
    }>
    slots: Array<{
      word?: string
      imageSrc?: string
      /** Numéro d’écoute correct (1–8). */
      correctNum: number
    }>
  }
  /** Soutien FR type 17 : mots mêlés. */
  wordSearch?: {
    size: number
    grid: string[][]
    words: string[]
    /** Cellules du corrigé : « r,c ». */
    hitCells?: string[]
  }
  /** Domaine Jeux : une grille de cartes / bandes / plateau. */
  gameBoard?: {
    title?: string
    cols: number
    rows: number
    kind?:
      | 'cards'
      | 'loto'
      | 'bands'
      | 'plateau'
      | 'die'
      | 'devinettes'
      | 'memory'
      | 'loto-page'
      | 'loto-back'
      | 'loto-call'
      | 'intrus'
      | 'dominos'
      | 'tri'
    backColor?: string
    frameColor?: string
    themeLabel?: string
    panels?: Array<{
      title?: string
      cols: number
      rows: number
      themeLabel?: string
      themeSub?: string
      cards: Array<{
        id: string
        text?: string
        imageSrc?: string
        lines?: string[]
        scatter?: Array<{ text: string; rotate: number; x: number; y: number }>
        variant?: string
        badge?: string
        textRight?: string
        backColor?: string
        frameColor?: string
      }>
    }>
    cards: Array<{
      id: string
      text?: string
      imageSrc?: string
      lines?: string[]
      scatter?: Array<{ text: string; rotate: number; x: number; y: number }>
      variant?: string
      badge?: string
      textRight?: string
      backColor?: string
      frameColor?: string
    }>
  }
  /**
   * Domaine Calligraphie : bandes lignées avec modèle cursif lié.
   * - same-line : mots — une bande 4 lignes (même hauteur qu’une bande phrases)
   * - copy-below : phrases — modèle + bande vide (4 lignes, texte sur la 3e)
   */
  calligraphy?: {
    mode: 'same-line' | 'copy-below'
    ruleLines: 4 | 6
    entries: string[]
    fontId?: string
    sizeId?: string
  }
  /** Compter les formes / icônes dans un cadre (nombres naturels). */
  countIcons?: CountIconScene
  /** TCF : support, question ou zone de réponse (après tirage / mélange). */
  tcf?: import('@/tcf/types').TcfSheetItem
  /** TCF : id de l’exercice de banque affiché (copie modifiable en mode libre). */
  tcfExerciseId?: string
  /** Item non compté dans le total de points (support, message). */
  noPoints?: boolean
  /** Barème propre à l’item (remplace les points par question du bloc). */
  points?: number
}

export type CompositeLabel = {
  x: number
  y: number
  text: string
  anchor?: 'start' | 'middle' | 'end'
}

export type CompositeTick = {
  x: number
  y: number
  angle: number
  n: 1 | 2 | 3
}

export type CompositeRight = {
  x: number
  y: number
  ax: number
  ay: number
  bx: number
  by: number
}

export type CompositeScene = {
  outline: string
  helpers?: Array<{ d: string; dashed?: boolean }>
  labels: CompositeLabel[]
  ticks?: CompositeTick[]
  rights?: CompositeRight[]
}

export type ExerciseBlock = {
  topic: string
  exerciseType: string
  difficulty: Difficulty
  count: number
  columns: number
  /**
   * N° d’exercice forcé (TCM : ids de recette non contigus, ex. 13 puis 15).
   * Si absent, numérotation chronologique.
   */
  exerciseNo?: number
  /**
   * Points par question pour ce bloc (mode évaluation).
   * Si absent, le total utilise le réglage global de la fiche.
   */
  pointsPerQuestion?: number
  /** Voc / Gram / Com — domaine français uniquement. */
  track?: FrenchTrack
  /** Phrase : Simple (er), Autres (2e/3e), ou Libre (édition). */
  verbGroup?: PhraseVerbGroup
  /**
   * Graine locale de l’exercice (bouton refresh sur la fiche).
   * Permet de retirer uniquement ce bloc sans régénérer toute la fiche.
   */
  contentSeed?: number
  /**
   * Mode libre Gattegno : items édités (mots, catégories, verbes).
   * Si présents, ils remplacent le tirage pour l’affichage / l’impression.
   */
  phraseItems?: MathItem[]
  /** Mode libre : consigne de production écrite (écraser l’instruction tirée). */
  phraseInstruction?: string
  /**
   * Grille de brouillon (problèmes, équations, périmètres / aires / volumes).
   * `true` = avec grille, `false` = cadre blanc seul. Index = n° de question.
   */
  problemDraftGrids?: boolean[]
  /** Modes de réponse par question (compréhension orale) : QCM / texte / images. */
  oralAnswerModes?: Array<'qcm' | 'text' | 'images'>
  /**
   * TCF : forme de réponse par item (qcm_texte / qcm_image / lignes).
   * Index = rang de l’item dans le bloc.
   */
  tcfFormModes?: Array<'qcm_texte' | 'qcm_image' | 'lignes' | undefined>
  /**
   * TCF : saut de page après l’item d’index i (questions trop longues).
   */
  tcfPageBreakAfter?: boolean[]
  /**
   * Compréhension orale / écrite : les questions qui ne tiennent pas sur la fiche
   * continuent sur la page suivante (saut de page automatique).
   */
  continueOnNextPage?: boolean
  /** Mode libre : l’enseignant·e compose le tableau de repérage. */
  coordLibre?: boolean
  /**
   * Mode libre (Lire les droites / Construire) : questions rédigées ou modifiées
   * par l’enseignant·e. Remplacent le tirage automatique des énoncés.
   */
  coordQuestionsLibre?: CoordQuestion[]
  coordCols?: number
  coordRows?: number
  coordAxis?: CoordAxis
  coordMarks?: CoordMark[]
  /** Étendue du repère à 4 cadrans (−n à +n), conservée pour les anciennes fiches. */
  coordRange?: number
  /** Côté du carré (3/4/5 mm cadrans, 6/8/10 mm formes). */
  coordCellMm?: CoordCellMm
  /** Graduation : 1 ou 2 carrés pour une unité. */
  coordUnitSquares?: CoordUnitSquares
  /** Origine du repère (carrés depuis la gauche / le bas). */
  coordOriginCol?: number
  coordOriginRow?: number
  /** Bornes de nombres libres à la place du niveau. */
  numberLibre?: boolean
  numberMin?: number
  numberMax?: number
  numberDecimals?: boolean
  /** Choix des quadrilatères (sinon tirage au hasard parmi toutes les formes). */
  quadLibre?: boolean
  quadShapes?: Figure[]
  /** Mots à apprendre : lignes du tableau (chaque ligne = images + mots). */
  vocabRows?: number
  /** Mots à apprendre : colonnes du tableau. */
  vocabCols?: number
  /** Ids des mots cochés pour le tableau « Mots à apprendre » et le pool Voc. */
  vocabSelected?: string[]
  /** Sous-groupe de vocabulaire (liste déroulante). */
  vocabSubgroup?: string
  /** Mots ajoutés par l’enseignant·e (hors banque). */
  vocabCustomEntries?: Array<{
    id: string
    label: string
    imageSrc?: string
    audio?: string
    definition: string
    syllables: string[]
    synonym?: string
    antonym?: string
    masculine?: string
    feminine?: string
    subgroup?: string
    sentences: {
      trous: { a1: string[]; a2: string[]; b1: string[] }
      phrase: { a1: string[]; a2: string[]; b1: string[] }
      dictee?: { a1: string[]; a2: string[]; b1: string[] }
    }
  }>
  /** Longueur du trait de réponse (production écrite Voc), en caractères. */
  vocabLineCh?: number
  /** Domaine Jeux : contenu saisi (mots, affirmations, phrases…). */
  gameEntries?: Array<{
    text: string
    imageSrc?: string
    clues?: string[]
    words?: string[]
    category?: string
    isIntrus?: boolean
    isTrue?: boolean
  }>
  /** Domaine Jeux : texte brut du panneau (resync → gameEntries). */
  gameText?: string
  /** Source du contenu Jeux vocabulaire : thème FR, banque lecture, ou libre. */
  gameSource?: 'theme' | 'lecture' | 'libre'
  /** Thème français pour filtrer la banque (mode thème / lecture). */
  gameTopic?: string
  /** Ids cochés dans la banque (mode thème / lecture). */
  gameSelectedIds?: string[]
  /** Couleur du cadre / dos de série Jeux. */
  gameBackColor?: string
  /** Nom de série imprimé au verso des cartes Jeux. */
  gameSeriesName?: string
  /** Bordure personnalisée des cartes (id 01–15), optionnelle — legacy (= recto). */
  gameBorderId?: string
  /** Bordure recto des cartes (id 01–15), optionnelle. */
  gameBorderRectoId?: string
  /** Bordure verso des cartes (id 01–15), optionnelle. */
  gameBorderVersoId?: string
  /** Taille des mots sur les cartes (petit | moyen | grand). */
  gameFontSize?: string
  /** Jeux Vocabulaire : coloriage Alpha (1 couleur = 1 son). */
  gameAlpha?: boolean
  /**
   * Soutien FR type 1 (mots et images) : édition libre
   * (sinon banque de la voyelle).
   */
  soutienMotsLibre?: boolean
  /** Entrées libre type 1 — mot + image (max. 16). */
  soutienMotsEntries?: Array<{ id: string; label: string; imageSrc?: string }>
  /** Soutien FR type 5 : édition libre. */
  soutienCompleterLibre?: boolean
  /** Entrées libre type 5 — article + parties + image. */
  soutienCompleterEntries?: Array<{
    id: string
    article: string
    before: string
    blank: string
    after: string
    word: string
    imageSrc?: string
  }>
  /**
   * Soutien FR type 9 / 15 : mots à exclure (déjà tirés en types 1 et 5
   * sur la fiche / la série). Rempli par `buildWorksheets`.
   */
  soutienExcludeWords?: string[]
  /**
   * Soutien FR type 16 : mots / images du type 1 de la fiche.
   * Rempli par `buildWorksheets` (même tirage que la page type 1).
   */
  soutienType1Words?: string[]
  /**
   * Soutien FR type 10 : mots du type 5 (compléter) de la fiche.
   * Rempli par `buildWorksheets`.
   */
  soutienType5Words?: string[]
  /**
   * Soutien FR types 9 / 12 / 14 : niveau des phrases
   * (`all` par défaut = mélange A1 / A2 / B1).
   */
  soutienLevel?: 'all' | 'a1' | 'a2' | 'b1'
  /**
   * Domaine Calligraphie : un mot ou une phrase par ligne
   * (texte brut du panneau enseignant·e).
   */
  calliText?: string
  /** Police cursive liée (id CalliFont). */
  calliFont?: string
  /** Taille d’écriture / espacement des carreaux (petit | moyen | grand). */
  calliSize?: string
  /** TCF : exercice saisi par l’admin (remplace le tirage dans la banque). */
  tcfExercise?: import('@/tcf/types').TcfExercise
  /** TCF : exercice choisi dans la banque (sinon tirage selon la graine). */
  tcfBankId?: string
  /** TCF : scénario qui limite la banque (id de `TCF_SCENARIOS`). */
  tcfScenario?: string
  /**
   * Mode libre global (tous domaines) : items édités à la main.
   * S’ils sont présents, ils remplacent le tirage pour l’affichage / l’impression.
   */
  libreItems?: MathItem[]
  /** Mode libre global : consigne saisie (écrase l’instruction tirée). */
  libreInstruction?: string
}

export type PageConfig = ExerciseBlock & {
  domain: Domain
  /** Types d’exercices supplémentaires sur la même feuille A4. */
  extraBlocks?: ExerciseBlock[]
}

export type WorksheetDocument = {
  kind: 'oral' | 'written'
  title?: string
  text: string
  audioSrc?: string
}

export type WorksheetBlock = {
  exerciseIndex: number
  title: string
  instruction: string
  items: MathItem[]
  columns: number
  exerciseType: string
  /** Points par question (propagé depuis ExerciseBlock). */
  pointsPerQuestion?: number
  givens?: AlgebraGiven[]
  document?: WorksheetDocument
  problemDraftGrids?: boolean[]
  oralAnswerModes?: Array<'qcm' | 'text' | 'images'>
  tcfFormModes?: Array<'qcm_texte' | 'qcm_image' | 'lignes' | undefined>
  tcfPageBreakAfter?: boolean[]
  /**
   * Décalage des index d’items vers la PageConfig d’origine
   * (feuilles « suite » CO/TCF).
   */
  itemOffset?: number
  /** Nombre max de questions distinctes dans la banque du document tiré (CO/CE). */
  bankQuestionCap?: number
}

export type WorksheetPage = PageConfig & {
  title: string
  instruction: string
  items: MathItem[]
  blocks: WorksheetBlock[]
  /** Valeurs partagées (ex. t = 3) pour les évaluations d'expressions. */
  givens?: AlgebraGiven[]
  /** Index de la PageConfig d’origine (aperçu multi-feuilles / suite). */
  configIndex?: number
  /** Feuille de suite (questions débordantes). */
  isContinuation?: boolean
}
