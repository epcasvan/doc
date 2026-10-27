import type { GrammarTheoryBlock } from '@/francais/grammar-theory'
import type { ExerciseType, MathItem } from '@/math/types'

export const SUISSE_TOPIC_ID = 'societe-suisse'

type TheoryDoc = {
  typeId: string
  title: string
  instruction: string
  blocks: GrammarTheoryBlock[]
}

type Line = { prompt: string; answer: string }

const CANTONS: Array<{ canton: string; sigle: string; chefLieu: string }> = [
  { canton: 'Zurich', sigle: 'ZH', chefLieu: 'Zurich' },
  { canton: 'Berne', sigle: 'BE', chefLieu: 'Berne' },
  { canton: 'Lucerne', sigle: 'LU', chefLieu: 'Lucerne' },
  { canton: 'Uri', sigle: 'UR', chefLieu: 'Altdorf' },
  { canton: 'Schwyz', sigle: 'SZ', chefLieu: 'Schwyz' },
  { canton: 'Obwald', sigle: 'OW', chefLieu: 'Sarnen' },
  { canton: 'Nidwald', sigle: 'NW', chefLieu: 'Stans' },
  { canton: 'Glaris', sigle: 'GL', chefLieu: 'Glaris' },
  { canton: 'Zoug', sigle: 'ZG', chefLieu: 'Zoug' },
  { canton: 'Fribourg', sigle: 'FR', chefLieu: 'Fribourg' },
  { canton: 'Soleure', sigle: 'SO', chefLieu: 'Soleure' },
  { canton: 'Bâle-Ville', sigle: 'BS', chefLieu: 'Bâle' },
  { canton: 'Bâle-Campagne', sigle: 'BL', chefLieu: 'Liestal' },
  { canton: 'Schaffhouse', sigle: 'SH', chefLieu: 'Schaffhouse' },
  { canton: 'Appenzell Rhodes-Extérieures', sigle: 'AR', chefLieu: 'Herisau' },
  { canton: 'Appenzell Rhodes-Intérieures', sigle: 'AI', chefLieu: 'Appenzell' },
  { canton: 'Saint-Gall', sigle: 'SG', chefLieu: 'Saint-Gall' },
  { canton: 'Grisons', sigle: 'GR', chefLieu: 'Coire' },
  { canton: 'Argovie', sigle: 'AG', chefLieu: 'Aarau' },
  { canton: 'Thurgovie', sigle: 'TG', chefLieu: 'Frauenfeld' },
  { canton: 'Tessin', sigle: 'TI', chefLieu: 'Bellinzone' },
  { canton: 'Vaud', sigle: 'VD', chefLieu: 'Lausanne' },
  { canton: 'Valais', sigle: 'VS', chefLieu: 'Sion' },
  { canton: 'Neuchâtel', sigle: 'NE', chefLieu: 'Neuchâtel' },
  { canton: 'Genève', sigle: 'GE', chefLieu: 'Genève' },
  { canton: 'Jura', sigle: 'JU', chefLieu: 'Delémont' },
]

function lines(rows: Line[], columns = 2): { instruction: string; items: MathItem[]; columns: number } {
  return {
    instruction: '',
    columns,
    items: rows.map((row) => ({
      layout: 'text' as const,
      prompt: row.prompt,
      answer: row.answer,
      labels: ['societe-line'],
    })),
  }
}

function theoryItems(doc: TheoryDoc): MathItem[] {
  return doc.blocks.map((block, index) => ({
    layout: 'theory' as const,
    prompt: `${doc.title}-${index}`,
    answer: '',
    theoryBlock: block,
  }))
}

const THEORIES: TheoryDoc[] = [
  {
    typeId: 'societe-suisse-theorie-situation',
    title: 'Où est la Suisse ?',
    instruction: 'Lisez la fiche.',
    blocks: [
      { kind: 'heading', text: 'Où est la Suisse ?' },
      {
        kind: 'paragraph',
        text: 'La Suisse est un petit pays au centre de l’Europe. Elle n’a pas de mer. Pour aller à la mer, il faut traverser un pays voisin.',
      },
      {
        kind: 'list',
        title: 'Cinq pays touchent la Suisse',
        items: ['la France', 'l’Allemagne', 'l’Autriche', 'le Liechtenstein', 'l’Italie'],
      },
      {
        kind: 'paragraph',
        text: 'Les Alpes barrent le pays. Depuis longtemps, les cols permettent de passer du nord au sud. Le Gothard et le Grand-Saint-Bernard sont deux passages importants.',
      },
    ],
  },
  {
    typeId: 'societe-suisse-theorie-reperes',
    title: 'Quelques repères',
    instruction: 'Lisez la fiche.',
    blocks: [
      { kind: 'heading', text: 'Quelques repères' },
      {
        kind: 'paragraph',
        text: 'Ces nombres changent peu. Ils suffisent pour situer le pays. Les chiffres du chômage, du budget ou de la population étrangère bougent chaque année : on les cherche dans un document récent.',
      },
      {
        kind: 'table',
        headers: ['Repère', 'Environ'],
        rows: [
          ['Habitants', '9 millions'],
          ['Superficie', '41 285 km²'],
          ['Cantons', '26'],
          ['Langues nationales', '4'],
        ],
      },
      {
        kind: 'list',
        title: 'Les quatre langues nationales',
        items: ['l’allemand', 'le français', 'l’italien', 'le romanche'],
      },
      {
        kind: 'paragraph',
        text: 'Les villes les plus peuplées sont Zurich, Genève, Bâle, Lausanne et Berne. Berne accueille le Conseil fédéral et l’Assemblée fédérale.',
      },
    ],
  },
  {
    typeId: 'societe-suisse-theorie-regions',
    title: 'Trois régions',
    instruction: 'Lisez la fiche.',
    blocks: [
      { kind: 'heading', text: 'Trois régions naturelles' },
      {
        kind: 'paragraph',
        text: 'On décrit souvent la Suisse en trois bandes, du nord-ouest au sud-est.',
      },
      {
        kind: 'list',
        items: [
          'Le Jura : des montagnes moyennes, au nord-ouest. Beaucoup de vallées et de pâturages.',
          'Le Plateau : entre le Jura et les Alpes. C’est là que vivent la plupart des habitants, et que se trouvent les grandes villes.',
          'Les Alpes : des hautes montagnes au sud. On y trouve des cols, des glaciers et de grands lacs.',
        ],
      },
    ],
  },
  {
    typeId: 'societe-suisse-theorie-cantons-1',
    title: 'Les cantons, 1',
    instruction: 'Lisez la fiche.',
    blocks: [
      { kind: 'heading', text: 'Les cantons et leur chef-lieu' },
      {
        kind: 'paragraph',
        text: 'La Suisse compte 26 cantons. Le chef-lieu est la ville où siège le gouvernement du canton. Voici les treize premiers, dans l’ordre habituel.',
      },
      {
        kind: 'table',
        headers: ['Canton', 'Sigle', 'Chef-lieu'],
        rows: CANTONS.slice(0, 13).map((row) => [row.canton, row.sigle, row.chefLieu]),
      },
    ],
  },
  {
    typeId: 'societe-suisse-theorie-cantons-2',
    title: 'Les cantons, 2',
    instruction: 'Lisez la fiche.',
    blocks: [
      { kind: 'heading', text: 'Les cantons et leur chef-lieu' },
      {
        kind: 'paragraph',
        text: 'Suite de la liste. Le Jura est le canton le plus récent : il est entré dans la Confédération en 1979.',
      },
      {
        kind: 'table',
        headers: ['Canton', 'Sigle', 'Chef-lieu'],
        rows: CANTONS.slice(13).map((row) => [row.canton, row.sigle, row.chefLieu]),
      },
    ],
  },
  {
    typeId: 'societe-suisse-theorie-eaux',
    title: 'Lacs et cours d’eau',
    instruction: 'Lisez la fiche.',
    blocks: [
      { kind: 'heading', text: 'Lacs et cours d’eau' },
      {
        kind: 'paragraph',
        text: 'Deux grands fleuves naissent en Suisse. Le Rhône part du Valais, traverse le lac Léman, puis rejoint la Méditerranée. Le Rhin part des Grisons, traverse le lac de Constance, puis rejoint la mer du Nord.',
      },
      {
        kind: 'table',
        headers: ['Lac', 'Où le trouver'],
        rows: [
          ['Léman', 'Le plus grand. Vaud, Valais, Genève et la France.'],
          ['Constance', 'À l’est. Le Rhin le traverse.'],
          ['Neuchâtel', 'Au pied du Jura.'],
          ['Quatre-Cantons', 'Au centre, autour de Lucerne.'],
          ['Zurich', 'Sur le Plateau. La Limmat en sort.'],
          ['Majeur', 'Au Tessin, vers l’Italie.'],
        ],
      },
      {
        kind: 'table',
        headers: ['Cours d’eau', 'Parcours simple'],
        rows: [
          ['Rhône', 'Valais → Léman → Méditerranée'],
          ['Rhin', 'Grisons → Constance → mer du Nord'],
          ['Aar', 'La plus longue rivière entièrement suisse. Elle rejoint le Rhin.'],
          ['Reuss', 'Elle sort du lac des Quatre-Cantons et rejoint l’Aar.'],
          ['Limmat', 'Elle sort du lac de Zurich et rejoint l’Aar.'],
          ['Tessin', 'Il descend vers le lac Majeur, puis vers le Pô.'],
        ],
      },
    ],
  },
  {
    typeId: 'societe-suisse-theorie-dates',
    title: 'Quelques dates',
    instruction: 'Lisez la fiche.',
    blocks: [
      { kind: 'heading', text: 'Quelques dates' },
      {
        kind: 'paragraph',
        text: 'Ce n’est pas toute l’histoire. Ce sont des repères pour comprendre comment le pays s’est construit.',
      },
      {
        kind: 'table',
        headers: ['Année', 'Repère'],
        rows: [
          ['1291', 'Des communautés d’Uri, de Schwyz et d’Unterwald s’allient.'],
          ['1648', 'L’indépendance de la Confédération est reconnue en Europe.'],
          ['1798', 'La France occupe le pays. Une République helvétique est créée.'],
          ['1803', 'Napoléon rétablit une confédération de 19 cantons.'],
          ['1815', 'Les frontières se rapprochent de celles d’aujourd’hui. La neutralité est reconnue.'],
          ['1848', 'Une Constitution crée l’État fédéral. Berne devient le siège des autorités.'],
          ['1979', 'Le Jura devient le 26e canton.'],
          ['2000', 'La Constitution acceptée en 1999 entre en vigueur.'],
        ],
      },
    ],
  },
  {
    typeId: 'societe-suisse-theorie-etat',
    title: 'Un État',
    instruction: 'Lisez la fiche.',
    blocks: [
      { kind: 'heading', text: 'Qu’est-ce qu’un État ?' },
      {
        kind: 'paragraph',
        text: 'Un État réunit trois éléments. S’il en manque un, on ne parle plus d’État.',
      },
      {
        kind: 'list',
        items: [
          'Une population : les personnes qui vivent dans le pays.',
          'Un territoire : le sol sur lequel cette population vit.',
          'Un pouvoir politique : des autorités qui organisent la vie commune.',
        ],
      },
      {
        kind: 'paragraph',
        text: 'La Suisse est un État fédéral, une démocratie semi-directe, et un pays neutre. La neutralité est reconnue par des traités. Elle a aidé le pays à rester en dehors des deux guerres mondiales.',
      },
      {
        kind: 'note',
        text: 'La devise traditionnelle « Un pour tous, tous pour un » rappelle que les cantons s’engagent les uns pour les autres.',
      },
    ],
  },
  {
    typeId: 'societe-suisse-theorie-democratie',
    title: 'Les démocraties',
    instruction: 'Lisez la fiche.',
    blocks: [
      { kind: 'heading', text: 'Trois façons de décider' },
      {
        kind: 'paragraph',
        text: 'Dans une démocratie, le pouvoir vient du peuple. Toutes les démocraties ne fonctionnent pas de la même façon.',
      },
      {
        kind: 'list',
        items: [
          'Démocratie directe : les citoyens votent eux-mêmes les lois, souvent réunis en assemblée. C’est rare.',
          'Démocratie représentative : les citoyens élisent des personnes qui décident à leur place.',
          'Démocratie semi-directe : les citoyens élisent des autorités, et ils peuvent aussi voter sur des lois, par référendum ou par initiative.',
        ],
      },
      {
        kind: 'paragraph',
        text: 'La Suisse est une démocratie semi-directe. On élit le Parlement. On vote aussi plusieurs fois par année.',
      },
    ],
  },
  {
    typeId: 'societe-suisse-theorie-federalisme',
    title: 'La Constitution',
    instruction: 'Lisez la fiche.',
    blocks: [
      { kind: 'heading', text: 'Constitution et fédéralisme' },
      {
        kind: 'paragraph',
        text: 'La Constitution est la loi la plus haute. Celle du 18 avril 1999 est entrée en vigueur en 2000. Elle dit comment le pays est organisé, et elle protège des droits.',
      },
      {
        kind: 'list',
        title: 'Quatre grands sujets',
        items: [
          'les droits des personnes',
          'le partage des tâches',
          'les autorités',
          'la façon de modifier la Constitution',
        ],
      },
      {
        kind: 'paragraph',
        text: 'La Suisse est une fédération. Le pouvoir est partagé entre la Confédération, les 26 cantons et les communes. L’école obligatoire, par exemple, est d’abord l’affaire des cantons. L’armée, la monnaie et les affaires étrangères sont l’affaire de la Confédération.',
      },
      {
        kind: 'paragraph',
        text: 'Ce partage est utile dans un pays de plusieurs langues. Les décisions proches des gens restent proches des gens.',
      },
    ],
  },
  {
    typeId: 'societe-suisse-theorie-pouvoirs',
    title: 'Les trois pouvoirs',
    instruction: 'Lisez la fiche.',
    blocks: [
      { kind: 'heading', text: 'Trois pouvoirs séparés' },
      {
        kind: 'paragraph',
        text: 'Pour éviter qu’une seule autorité décide de tout, on sépare trois pouvoirs. Chacun a un rôle. Au niveau fédéral, trois autorités les exercent.',
      },
      {
        kind: 'table',
        headers: ['Pouvoir', 'Rôle', 'En Suisse, au niveau fédéral'],
        rows: [
          ['Législatif', 'Il crée et modifie les lois.', 'L’Assemblée fédérale (le Parlement)'],
          ['Exécutif', 'Il applique les lois et représente l’État.', 'Le Conseil fédéral'],
          ['Judiciaire', 'Il juge et sanctionne.', 'Le Tribunal fédéral'],
        ],
      },
      {
        kind: 'paragraph',
        text: 'Le peuple peut aussi accepter ou refuser une loi. Le pouvoir législatif n’est donc pas seul à décider.',
      },
    ],
  },
  {
    typeId: 'societe-suisse-theorie-droits',
    title: 'Droits et devoirs',
    instruction: 'Lisez la fiche.',
    blocks: [
      { kind: 'heading', text: 'Droits et devoirs' },
      {
        kind: 'list',
        title: 'Quelques libertés protégées',
        items: [
          'dire son opinion',
          'voter et être élu, pour les citoyens',
          'se réunir et créer une association',
          'aller à l’école',
          'se marier',
          'ne pas être condamné à mort',
        ],
      },
      {
        kind: 'paragraph',
        text: 'L’État peut limiter une liberté seulement si trois conditions sont réunies : une base dans la loi, un intérêt public, et une mesure proportionnée.',
      },
      {
        kind: 'list',
        title: 'Quelques devoirs',
        items: [
          'Respecter la loi.',
          'Payer ses impôts quand on a un revenu.',
          'Les parents scolarisent leurs enfants.',
          'Les hommes suisses font le service militaire ou le service civil.',
          'Les citoyens participent aux votations et aux élections.',
        ],
      },
    ],
  },
]

type ExerciseDoc = {
  typeId: string
  instruction: string
  columns: number
  items: MathItem[]
}

function exercise(typeId: string, instruction: string, rows: Line[], columns = 2): ExerciseDoc {
  const built = lines(rows, columns)
  return { typeId, instruction, columns: built.columns, items: built.items }
}

const EXERCISES: ExerciseDoc[] = [
  exercise(
    'societe-suisse-ex-cantons',
    'Écrivez le chef-lieu de chaque canton.',
    CANTONS.map((row) => ({ prompt: row.canton, answer: row.chefLieu })),
  ),
  exercise(
    'societe-suisse-ex-chefs-lieux',
    'Écrivez le canton de chaque chef-lieu.',
    [...CANTONS].reverse().map((row) => ({ prompt: row.chefLieu, answer: row.canton })),
  ),
  exercise(
    'societe-suisse-ex-sigles',
    'Écrivez le canton qui correspond au sigle.',
    CANTONS.map((row) => ({ prompt: row.sigle, answer: row.canton })),
  ),
  exercise(
    'societe-suisse-ex-serie-2',
    'Écrivez le chef-lieu. Les cantons sont dans l’ordre alphabétique.',
    [...CANTONS]
      .sort((a, b) => a.canton.localeCompare(b.canton, 'fr'))
      .map((row) => ({ prompt: row.canton, answer: row.chefLieu })),
  ),
  exercise(
    'societe-suisse-ex-villes',
    'Écrivez le nom de la ville.',
    [
      { prompt: 'La ville la plus peuplée', answer: 'Zurich' },
      { prompt: 'Au bout du lac Léman, à l’ouest', answer: 'Genève' },
      { prompt: 'Sur le Rhin, à la frontière de l’Allemagne et de la France', answer: 'Bâle' },
      { prompt: 'Chef-lieu du canton de Vaud, au bord du Léman', answer: 'Lausanne' },
      { prompt: 'Siège du Conseil fédéral', answer: 'Berne' },
      { prompt: 'Grande ville du canton de Zurich, après Zurich', answer: 'Winterthour' },
      { prompt: 'Au bord du lac des Quatre-Cantons', answer: 'Lucerne' },
      { prompt: 'Chef-lieu du canton du même nom, à l’est', answer: 'Saint-Gall' },
      { prompt: 'Ville du Tessin, au bord d’un lac', answer: 'Lugano' },
      { prompt: 'Entre le lac de Neuchâtel et le lac de Bienne', answer: 'Bienne' },
    ],
    1,
  ),
  exercise(
    'societe-suisse-ex-lacs',
    'Écrivez le nom du lac.',
    [
      { prompt: 'Le plus grand lac du pays. Le Rhône le traverse.', answer: 'Le lac Léman' },
      { prompt: 'À l’est. Le Rhin le traverse.', answer: 'Le lac de Constance' },
      { prompt: 'Au pied du Jura, le plus grand lac entièrement suisse.', answer: 'Le lac de Neuchâtel' },
      { prompt: 'Au centre. Lucerne, Uri, Schwyz et Unterwald le bordent.', answer: 'Le lac des Quatre-Cantons' },
      { prompt: 'La Limmat en sort, vers l’Aar.', answer: 'Le lac de Zurich' },
      { prompt: 'Au sud du Tessin. Le Tessin s’y jette.', answer: 'Le lac Majeur' },
    ],
    1,
  ),
  exercise(
    'societe-suisse-ex-cours-eau',
    'Écrivez le nom du cours d’eau.',
    [
      { prompt: 'Il naît en Valais et va jusqu’à la Méditerranée.', answer: 'Le Rhône' },
      { prompt: 'Il naît dans les Grisons et va jusqu’à la mer du Nord.', answer: 'Le Rhin' },
      { prompt: 'La plus longue rivière entièrement en Suisse. Elle rejoint le Rhin.', answer: 'L’Aar' },
      { prompt: 'Elle sort du lac des Quatre-Cantons.', answer: 'La Reuss' },
      { prompt: 'Elle sort du lac de Zurich.', answer: 'La Limmat' },
      { prompt: 'Il descend du Tessin vers le lac Majeur.', answer: 'Le Tessin' },
    ],
    1,
  ),
  exercise(
    'societe-suisse-ex-regions',
    'Écrivez la région naturelle.',
    [
      { prompt: 'Montagnes moyennes au nord-ouest', answer: 'Le Jura' },
      { prompt: 'Là où vivent la plupart des habitants', answer: 'Le Plateau' },
      { prompt: 'Hautes montagnes, cols et glaciers', answer: 'Les Alpes' },
    ],
    1,
  ),
  exercise(
    'societe-suisse-ex-dates',
    'Écrivez l’année.',
    [
      { prompt: 'Alliance d’Uri, de Schwyz et d’Unterwald', answer: '1291' },
      { prompt: 'Indépendance reconnue en Europe', answer: '1648' },
      { prompt: 'République helvétique', answer: '1798' },
      { prompt: 'Confédération de 19 cantons', answer: '1803' },
      { prompt: 'Neutralité reconnue, frontières proches d’aujourd’hui', answer: '1815' },
      { prompt: 'État fédéral, Berne siège des autorités', answer: '1848' },
      { prompt: 'Le Jura devient un canton', answer: '1979' },
      { prompt: 'La Constitution de 1999 entre en vigueur', answer: '2000' },
    ],
    1,
  ),
  exercise(
    'societe-suisse-ex-resume',
    'Complétez chaque phrase par le mot ou le nombre manquant.',
    [
      { prompt: 'La Suisse compte combien de cantons ?', answer: '26' },
      { prompt: 'Les trois régions naturelles', answer: 'le Jura, le Plateau, les Alpes' },
      { prompt: 'Le fleuve qui rejoint la Méditerranée', answer: 'le Rhône' },
      { prompt: 'Le fleuve qui rejoint la mer du Nord', answer: 'le Rhin' },
      { prompt: 'Depuis 1848, la Suisse est un État…', answer: 'fédéral' },
      { prompt: 'Le pouvoir est partagé entre la Confédération, les cantons et…', answer: 'les communes' },
      { prompt: 'La Suisse est restée en dehors des guerres mondiales grâce à sa…', answer: 'neutralité' },
    ],
    1,
  ),
  exercise(
    'societe-suisse-ex-pouvoirs',
    'Écrivez le pouvoir : législatif, exécutif ou judiciaire.',
    [
      { prompt: 'Il crée les lois. Au niveau fédéral, c’est l’Assemblée fédérale.', answer: 'Législatif' },
      { prompt: 'Il applique les lois. Au niveau fédéral, c’est le Conseil fédéral.', answer: 'Exécutif' },
      { prompt: 'Il juge. Au niveau fédéral, c’est le Tribunal fédéral.', answer: 'Judiciaire' },
    ],
    1,
  ),
  exercise(
    'societe-suisse-ex-competences',
    'Écrivez qui en est surtout chargé : la Confédération ou les cantons.',
    [
      { prompt: 'L’école obligatoire', answer: 'Les cantons' },
      { prompt: 'L’armée', answer: 'La Confédération' },
      { prompt: 'La monnaie', answer: 'La Confédération' },
      { prompt: 'Les affaires étrangères', answer: 'La Confédération' },
      { prompt: 'La police', answer: 'Les cantons' },
      { prompt: 'L’AVS', answer: 'La Confédération' },
    ],
    1,
  ),
  exercise(
    'societe-suisse-ex-devoirs',
    'Écrivez le devoir : loi, impôts, école, armée ou vote.',
    [
      { prompt: 'Ne pas commettre d’actes interdits', answer: 'Respecter la loi' },
      { prompt: 'Payer quand on a un revenu', answer: 'Le devoir fiscal' },
      { prompt: 'Les parents envoient les enfants à l’école', answer: 'Le devoir scolaire' },
      { prompt: 'Les hommes suisses servent ou font un service de remplacement', answer: 'Le service militaire ou civil' },
      { prompt: 'Les citoyens participent aux élections', answer: 'Le devoir civique' },
    ],
    1,
  ),
  exercise(
    'societe-suisse-ex-democratie',
    'Écrivez la forme de démocratie.',
    [
      { prompt: 'Les citoyens votent eux-mêmes les lois, en assemblée.', answer: 'Démocratie directe' },
      { prompt: 'Les citoyens élisent des personnes qui décident à leur place.', answer: 'Démocratie représentative' },
      { prompt: 'On élit des autorités, et on vote aussi sur certaines lois.', answer: 'Démocratie semi-directe' },
    ],
    1,
  ),
]

const THEORY_BY_ID = new Map(THEORIES.map((doc) => [doc.typeId, doc]))
const EXERCISE_BY_ID = new Map(EXERCISES.map((doc) => [doc.typeId, doc]))

function typeEntry(
  id: string,
  label: string,
  description: string,
  instruction: string,
  columns = 1,
): ExerciseType {
  return {
    id,
    topic: SUISSE_TOPIC_ID,
    label,
    description,
    instruction,
    visual: 'texte',
    preferredColumns: columns,
  }
}

export const SUISSE_EXERCISE_TYPES: ExerciseType[] = [
  typeEntry(
    'societe-suisse-theorie-situation',
    'Théorie · Où est la Suisse ?',
    'Voisins, absence de mer, cols alpins.',
    'Lisez la fiche.',
  ),
  typeEntry(
    'societe-suisse-theorie-reperes',
    'Théorie · Quelques repères',
    'Habitants, superficie, langues, grandes villes.',
    'Lisez la fiche.',
  ),
  typeEntry(
    'societe-suisse-theorie-regions',
    'Théorie · Trois régions',
    'Jura, Plateau et Alpes.',
    'Lisez la fiche.',
  ),
  typeEntry(
    'societe-suisse-theorie-cantons-1',
    'Théorie · Cantons, 1',
    'Treize premiers cantons, sigle et chef-lieu.',
    'Lisez la fiche.',
  ),
  typeEntry(
    'societe-suisse-theorie-cantons-2',
    'Théorie · Cantons, 2',
    'Suite des cantons, jusqu’au Jura.',
    'Lisez la fiche.',
  ),
  typeEntry(
    'societe-suisse-theorie-eaux',
    'Théorie · Lacs et cours d’eau',
    'Six lacs et six cours d’eau principaux.',
    'Lisez la fiche.',
  ),
  typeEntry(
    'societe-suisse-theorie-dates',
    'Théorie · Quelques dates',
    'Repères de 1291 à 2000.',
    'Lisez la fiche.',
  ),
  typeEntry(
    'societe-suisse-theorie-etat',
    'Théorie · Un État',
    'Population, territoire, pouvoir. Fédéralisme et neutralité.',
    'Lisez la fiche.',
  ),
  typeEntry(
    'societe-suisse-theorie-democratie',
    'Théorie · Les démocraties',
    'Directe, représentative, semi-directe.',
    'Lisez la fiche.',
  ),
  typeEntry(
    'societe-suisse-theorie-federalisme',
    'Théorie · La Constitution',
    'Charte de 1999, partage Confédération, cantons et communes.',
    'Lisez la fiche.',
  ),
  typeEntry(
    'societe-suisse-theorie-pouvoirs',
    'Théorie · Les trois pouvoirs',
    'Législatif, exécutif, judiciaire.',
    'Lisez la fiche.',
  ),
  typeEntry(
    'societe-suisse-theorie-droits',
    'Théorie · Droits et devoirs',
    'Libertés, limites, devoirs des habitants.',
    'Lisez la fiche.',
  ),
  typeEntry(
    'societe-suisse-ex-cantons',
    'Cantons indiqués',
    'Le canton est donné. On écrit le chef-lieu. Remplace une carte déjà légendée.',
    'Écrivez le chef-lieu de chaque canton.',
    2,
  ),
  typeEntry(
    'societe-suisse-ex-chefs-lieux',
    'Retrouver le canton',
    'Le chef-lieu est donné. On écrit le canton.',
    'Écrivez le canton de chaque chef-lieu.',
    2,
  ),
  typeEntry(
    'societe-suisse-ex-sigles',
    'Sigles des cantons',
    'Seul le sigle est donné, comme une carte sans nom.',
    'Écrivez le canton qui correspond au sigle.',
    2,
  ),
  typeEntry(
    'societe-suisse-ex-serie-2',
    'Cantons, série 2',
    'Même travail que les cantons indiqués, dans l’ordre alphabétique.',
    'Écrivez le chef-lieu. Les cantons sont dans l’ordre alphabétique.',
    2,
  ),
  typeEntry(
    'societe-suisse-ex-villes',
    'Les grandes villes',
    'Dix villes à retrouver à partir d’un indice.',
    'Écrivez le nom de la ville.',
  ),
  typeEntry(
    'societe-suisse-ex-lacs',
    'Les lacs',
    'Six lacs principaux, à partir d’un indice.',
    'Écrivez le nom du lac.',
  ),
  typeEntry(
    'societe-suisse-ex-cours-eau',
    'Les cours d’eau',
    'Rhône, Rhin, Aar, Reuss, Limmat et Tessin.',
    'Écrivez le nom du cours d’eau.',
  ),
  typeEntry(
    'societe-suisse-ex-regions',
    'Les trois régions',
    'Jura, Plateau, Alpes.',
    'Écrivez la région naturelle.',
  ),
  typeEntry(
    'societe-suisse-ex-dates',
    'Les dates',
    'Retrouver l’année d’un repère.',
    'Écrivez l’année.',
  ),
  typeEntry(
    'societe-suisse-ex-resume',
    'Résumé',
    'Phrases à compléter sur la géographie et l’État fédéral.',
    'Complétez chaque phrase par le mot ou le nombre manquant.',
  ),
  typeEntry(
    'societe-suisse-ex-pouvoirs',
    'Les trois pouvoirs',
    'Associer le rôle au pouvoir.',
    'Écrivez le pouvoir : législatif, exécutif ou judiciaire.',
  ),
  typeEntry(
    'societe-suisse-ex-competences',
    'Qui fait quoi ?',
    'Confédération ou cantons.',
    'Écrivez qui en est surtout chargé : la Confédération ou les cantons.',
  ),
  typeEntry(
    'societe-suisse-ex-devoirs',
    'Les devoirs',
    'Loi, impôts, école, service, vote.',
    'Écrivez le devoir : loi, impôts, école, armée ou vote.',
  ),
  typeEntry(
    'societe-suisse-ex-democratie',
    'Quelle démocratie ?',
    'Directe, représentative ou semi-directe.',
    'Écrivez la forme de démocratie.',
  ),
]

export function tryGenerateSuisseBlock(
  typeId: string,
): { instruction: string; items: MathItem[]; columns?: number } | null {
  const theory = THEORY_BY_ID.get(typeId)
  if (theory) {
    return { instruction: theory.instruction, items: theoryItems(theory), columns: 1 }
  }
  const exerciseDoc = EXERCISE_BY_ID.get(typeId)
  if (exerciseDoc) {
    return {
      instruction: exerciseDoc.instruction,
      items: exerciseDoc.items,
      columns: exerciseDoc.columns,
    }
  }
  return null
}
