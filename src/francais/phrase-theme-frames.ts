import { SIMPLE_FRAMES_AUTRES, SIMPLE_FRAMES_ER, type SimpleFrame } from './phrase-simple-frames'

export type ThemedFrame = {
  id: string
  preds: readonly string[]
  rightPreds?: readonly string[]
  conjs?: readonly string[]
}

function frame(id: string, preds: readonly string[]): ThemedFrame {
  return { id, preds }
}

const CONJS = [
  'et/conjonction',
  'ou/conjonction',
  'mais/conjonction',
  'puis/conjonction',
  'donc/conjonction',
] as const

/**
 * Adjectif sur le complément — accordé avec le nom, phrases réelles.
 * À l’instanciation (thèmes adjectif), chaque modèle produit aussi
 * une variante avec adjectif dans le sujet, et une avec les deux.
 */
const ADJ_ER: Record<string, readonly string[]> = {
  manger: ['mange/verbe une/determinant pomme/nom rouge/adjectif', 'mange/verbe une/determinant soupe/nom chaude/adjectif', 'mange/verbe un/determinant sandwich/nom froid/adjectif'],
  goûter: ['goûte/verbe un/determinant gâteau/nom sucré/adjectif', 'goûte/verbe une/determinant tarte/nom chaude/adjectif'],
  préparer: ['prépare/verbe un/determinant bon/adjectif repas/nom', 'prépare/verbe un/determinant gâteau/nom chocolaté/adjectif'],
  cuisiner: ['cuisine/verbe un/determinant plat/nom épicé/adjectif', 'cuisine/verbe une/determinant soupe/nom chaude/adjectif'],
  couper: ['coupe/verbe le/determinant pain/nom frais/adjectif', 'coupe/verbe une/determinant tomate/nom mûre/adjectif'],
  mélanger: ['mélange/verbe la/determinant farine/nom blanche/adjectif', 'mélange/verbe la/determinant salade/nom verte/adjectif'],
  griller: ['grille/verbe le/determinant pain/nom doré/adjectif', 'grille/verbe du/determinant fromage/nom fondu/adjectif'],
  décorer: ['décore/verbe un/determinant gâteau/nom rose/adjectif', 'décore/verbe une/determinant carte/nom colorée/adjectif'],
  acheter: ['achète/verbe une/determinant glace/nom vanille/adjectif', 'achète/verbe des/determinant fleurs/nom fraîches/adjectif'],
  fêter: ['fête/verbe un/determinant bel/adjectif anniversaire/nom', 'fête/verbe une/determinant grande/adjectif victoire/nom'],
  payer: ['paie/verbe la/determinant note/nom entière/adjectif', 'paie/verbe le/determinant loyer/nom mensuel/adjectif'],
  accrocher: ['accroche/verbe un/determinant manteau/nom bleu/adjectif', 'accroche/verbe une/determinant photo/nom ancienne/adjectif'],
  apporter: ['apporte/verbe un/determinant gâteau/nom maison/adjectif', 'apporte/verbe une/determinant chaise/nom légère/adjectif'],
  emporter: ['emporte/verbe un/determinant sandwich/nom frais/adjectif', 'emporte/verbe une/determinant bouteille/nom pleine/adjectif'],
  rapporter: ['rapporte/verbe un/determinant souvenir/nom précieux/adjectif', 'rapporte/verbe un/determinant livre/nom neuf/adjectif'],
  porter: ['porte/verbe un/determinant manteau/nom bleu/adjectif', 'porte/verbe un/determinant chapeau/nom rouge/adjectif', 'porte/verbe une/determinant écharpe/nom chaude/adjectif'],
  enfiler: ['enfile/verbe un/determinant pull/nom gris/adjectif', 'enfile/verbe des/determinant gants/nom chauds/adjectif'],
  laver: ['lave/verbe la/determinant voiture/nom sale/adjectif', 'lave/verbe le/determinant linge/nom blanc/adjectif'],
  nettoyer: ['nettoie/verbe la/determinant table/nom ronde/adjectif', 'nettoie/verbe la/determinant vitre/nom sale/adjectif'],
  essuyer: ['essuie/verbe un/determinant verre/nom propre/adjectif', 'essuie/verbe la/determinant table/nom mouillée/adjectif'],
  sécher: ['sèche/verbe une/determinant assiette/nom propre/adjectif', 'sèche/verbe le/determinant linge/nom humide/adjectif'],
  repasser: ['repasse/verbe une/determinant chemise/nom blanche/adjectif', 'repasse/verbe une/determinant robe/nom bleue/adjectif'],
  ranger: ['range/verbe sa/determinant chambre/nom petite/adjectif', 'range/verbe les/determinant jouets/nom cassés/adjectif'],
  poser: ['pose/verbe le/determinant sac/nom lourd/adjectif', 'pose/verbe un/determinant vase/nom fragile/adjectif'],
  cacher: ['cache/verbe un/determinant trésor/nom secret/adjectif', 'cache/verbe un/determinant cadeau/nom surprise/adjectif'],
  montrer: ['montre/verbe une/determinant photo/nom ancienne/adjectif', 'montre/verbe un/determinant dessin/nom drôle/adjectif'],
  chercher: ['cherche/verbe un/determinant stylo/nom noir/adjectif', 'cherche/verbe le/determinant chat/nom gris/adjectif'],
  trouver: ['trouve/verbe une/determinant pièce/nom brillante/adjectif', 'trouve/verbe son/determinant cartable/nom rouge/adjectif'],
  ramasser: ['ramasse/verbe les/determinant feuilles/nom mortes/adjectif', 'ramasse/verbe un/determinant papier/nom sale/adjectif'],
  attraper: ['attrape/verbe le/determinant ballon/nom jaune/adjectif', 'attrape/verbe un/determinant papillon/nom bleu/adjectif'],
  lancer: ['lance/verbe le/determinant ballon/nom rond/adjectif', 'lance/verbe un/determinant frisbee/nom rouge/adjectif'],
  jeter: ['jette/verbe un/determinant papier/nom sale/adjectif', 'jette/verbe la/determinant balle/nom molle/adjectif'],
  pousser: ['pousse/verbe la/determinant porte/nom lourde/adjectif', 'pousse/verbe une/determinant chaise/nom vide/adjectif'],
  tirer: ['tire/verbe la/determinant porte/nom fermée/adjectif', 'tire/verbe un/determinant rideau/nom épais/adjectif'],
  lever: ['lève/verbe la/determinant main/nom droite/adjectif', 'lève/verbe un/determinant carton/nom lourd/adjectif'],
  baisser: ['baisse/verbe le/determinant store/nom bleu/adjectif', 'baisse/verbe la/determinant vitre/nom avant/adjectif'],
  dessiner: ['dessine/verbe un/determinant arbre/nom vert/adjectif', 'dessine/verbe un/determinant chat/nom noir/adjectif'],
  colorier: ['colorie/verbe un/determinant dessin/nom simple/adjectif', 'colorie/verbe une/determinant carte/nom blanche/adjectif'],
  regarder: ['regarde/verbe un/determinant film/nom amusant/adjectif', 'regarde/verbe un/determinant match/nom important/adjectif'],
  observer: ['observe/verbe un/determinant oiseau/nom rare/adjectif', 'observe/verbe un/determinant insecte/nom minuscule/adjectif'],
  admirer: ['admire/verbe un/determinant tableau/nom ancien/adjectif', 'admire/verbe le/determinant paysage/nom calme/adjectif'],
  filmer: ['filme/verbe un/determinant match/nom final/adjectif', 'filme/verbe une/determinant fête/nom familiale/adjectif'],
  photographier: ['photographie/verbe un/determinant paysage/nom enneigé/adjectif', 'photographie/verbe une/determinant fleur/nom jaune/adjectif'],
  écouter: ['écoute/verbe une/determinant chanson/nom douce/adjectif', 'écoute/verbe une/determinant histoire/nom drôle/adjectif'],
  chanter: ['chante/verbe une/determinant chanson/nom joyeuse/adjectif', 'chante/verbe une/determinant berceuse/nom douce/adjectif'],
  danser: ['danse/verbe une/determinant valse/nom lente/adjectif', 'danse/verbe une/determinant salsa/nom rapide/adjectif'],
  aimer: ['aime/verbe les/determinant livres/nom anciens/adjectif', 'aime/verbe la/determinant musique/nom douce/adjectif'],
  adorer: ['adore/verbe le/determinant chocolat/nom noir/adjectif', 'adore/verbe les/determinant chats/nom calmes/adjectif'],
  détester: ['déteste/verbe le/determinant bruit/nom fort/adjectif', 'déteste/verbe le/determinant froid/nom glacial/adjectif'],
  préférer: ['préfère/verbe le/determinant thé/nom chaud/adjectif', 'préfère/verbe la/determinant mer/nom calme/adjectif'],
  avoir: ['a/verbe un/determinant nouveau/adjectif cahier/nom', 'a/verbe un/determinant petit/adjectif chien/nom', 'a/verbe un/determinant vélo/nom rouge/adjectif'],
  visiter: ['visite/verbe la/determinant vieille/adjectif ferme/nom', 'visite/verbe un/determinant musée/nom célèbre/adjectif'],
  traverser: ['traverse/verbe la/determinant grande/adjectif rue/nom', 'traverse/verbe le/determinant vieux/adjectif pont/nom'],
  longer: ['longe/verbe la/determinant rivière/nom calme/adjectif', 'longe/verbe le/determinant haut/adjectif mur/nom'],
  contourner: ['contourne/verbe le/determinant lac/nom gelé/adjectif', 'contourne/verbe la/determinant place/nom centrale/adjectif'],
  grimper: ['grimpe/verbe un/determinant grand/adjectif arbre/nom', 'grimpe/verbe une/determinant colline/nom raide/adjectif'],
  inviter: ['invite/verbe un/determinant vieil/adjectif ami/nom', 'invite/verbe une/determinant nouvelle/adjectif cousine/nom'],
  aider: ['aide/verbe la/determinant voisine/nom âgée/adjectif', 'aide/verbe un/determinant jeune/adjectif élève/nom'],
  remercier: ['remercie/verbe le/determinant gentil/adjectif facteur/nom', 'remercie/verbe une/determinant amie/nom fidèle/adjectif'],
  saluer: ['salue/verbe le/determinant nouveau/adjectif voisin/nom', 'salue/verbe la/determinant maîtresse/nom souriante/adjectif'],
  appeler: ['appelle/verbe un/determinant vieil/adjectif ami/nom', 'appelle/verbe le/determinant médecin/nom local/adjectif'],
  embrasser: ['embrasse/verbe sa/determinant petite/adjectif sœur/nom', 'embrasse/verbe le/determinant bébé/nom endormi/adjectif'],
  caresser: ['caresse/verbe le/determinant chat/nom gris/adjectif', 'caresse/verbe un/determinant chien/nom doux/adjectif'],
  soigner: ['soigne/verbe un/determinant oiseau/nom blessé/adjectif', 'soigne/verbe le/determinant chien/nom malade/adjectif'],
  consoler: ['console/verbe un/determinant ami/nom triste/adjectif', 'console/verbe le/determinant bébé/nom triste/adjectif'],
  garder: ['garde/verbe le/determinant secret/nom important/adjectif', 'garde/verbe la/determinant clé/nom dorée/adjectif'],
  surveiller: ['surveille/verbe les/determinant jeunes/adjectif enfants/nom', 'surveille/verbe le/determinant feu/nom vif/adjectif'],
  protéger: ['protège/verbe un/determinant ami/nom fidèle/adjectif', 'protège/verbe la/determinant forêt/nom verte/adjectif'],
  sauver: ['sauve/verbe un/determinant chat/nom perdu/adjectif', 'sauve/verbe un/determinant oiseau/nom blessé/adjectif'],
  réparer: ['répare/verbe un/determinant vélo/nom cassé/adjectif', 'répare/verbe une/determinant chaise/nom ancienne/adjectif'],
  bricoler: ['bricole/verbe une/determinant étagère/nom basse/adjectif', 'bricole/verbe une/determinant cabane/nom solide/adjectif'],
  coller: ['colle/verbe un/determinant papier/nom coloré/adjectif', 'colle/verbe une/determinant photo/nom récente/adjectif'],
  plier: ['plie/verbe une/determinant lettre/nom courte/adjectif', 'plie/verbe un/determinant linge/nom propre/adjectif'],
  déchirer: ['déchire/verbe un/determinant papier/nom inutile/adjectif', 'déchire/verbe une/determinant feuille/nom blanche/adjectif'],
  étudier: ['étudie/verbe une/determinant leçon/nom difficile/adjectif', 'étudie/verbe une/determinant carte/nom détaillée/adjectif'],
  réviser: ['révise/verbe sa/determinant leçon/nom orale/adjectif', 'révise/verbe un/determinant verbe/nom irrégulier/adjectif'],
  recopier: ['recopie/verbe un/determinant texte/nom court/adjectif', 'recopie/verbe une/determinant phrase/nom simple/adjectif'],
  corriger: ['corrige/verbe un/determinant devoir/nom long/adjectif', 'corrige/verbe une/determinant faute/nom fréquente/adjectif'],
  compter: ['compte/verbe les/determinant pommes/nom rouges/adjectif', 'compte/verbe les/determinant pièces/nom dorées/adjectif'],
  calculer: ['calcule/verbe un/determinant total/nom exact/adjectif', 'calcule/verbe le/determinant prix/nom final/adjectif'],
  mesurer: ['mesure/verbe une/determinant table/nom basse/adjectif', 'mesure/verbe le/determinant mur/nom blanc/adjectif'],
  raconter: ['raconte/verbe une/determinant histoire/nom drôle/adjectif', 'raconte/verbe un/determinant rêve/nom étrange/adjectif'],
  demander: ['demande/verbe une/determinant explication/nom claire/adjectif', 'demande/verbe une/determinant permission/nom spéciale/adjectif'],
  expliquer: ['explique/verbe une/determinant règle/nom simple/adjectif', 'explique/verbe un/determinant jeu/nom nouveau/adjectif'],
  allumer: ['allume/verbe la/determinant lampe/nom rouge/adjectif', 'allume/verbe une/determinant bougie/nom parfumée/adjectif'],
  fermer: ['ferme/verbe la/determinant porte/nom lourde/adjectif', 'ferme/verbe la/determinant fenêtre/nom ouverte/adjectif'],
  commencer: ['commence/verbe un/determinant dessin/nom libre/adjectif', 'commence/verbe une/determinant histoire/nom courte/adjectif'],
  terminer: ['termine/verbe un/determinant devoir/nom difficile/adjectif', 'termine/verbe un/determinant puzzle/nom géant/adjectif'],
  continuer: ['continue/verbe le/determinant long/adjectif chemin/nom', 'continue/verbe une/determinant histoire/nom inachevée/adjectif'],
  répéter: ['répète/verbe une/determinant phrase/nom courte/adjectif', 'répète/verbe un/determinant mot/nom nouveau/adjectif'],
  gagner: ['gagne/verbe un/determinant match/nom important/adjectif', 'gagne/verbe une/determinant médaille/nom dorée/adjectif'],
  perdre: ['perd/verbe un/determinant ballon/nom rouge/adjectif', 'perd/verbe une/determinant clé/nom petite/adjectif'],
  marquer: ['marque/verbe un/determinant but/nom décisif/adjectif', 'marque/verbe une/determinant page/nom utile/adjectif'],
  emprunter: ['emprunte/verbe un/determinant livre/nom épais/adjectif', 'emprunte/verbe un/determinant vélo/nom jaune/adjectif'],
  prêter: ['prête/verbe un/determinant stylo/nom bleu/adjectif', 'prête/verbe un/determinant livre/nom neuf/adjectif'],
  oublier: ['oublie/verbe un/determinant sac/nom lourd/adjectif', 'oublie/verbe une/determinant clé/nom importante/adjectif'],
  utiliser: ['utilise/verbe un/determinant ordinateur/nom portable/adjectif', 'utilise/verbe une/determinant règle/nom graduée/adjectif'],
  partager: ['partage/verbe un/determinant gâteau/nom sucré/adjectif', 'partage/verbe un/determinant secret/nom amusant/adjectif'],
  planter: ['plante/verbe une/determinant fleur/nom jaune/adjectif', 'plante/verbe un/determinant jeune/adjectif arbre/nom'],
  arroser: ['arrose/verbe une/determinant plante/nom verte/adjectif', 'arrose/verbe des/determinant fleurs/nom sèches/adjectif'],
  semer: ['sème/verbe des/determinant graines/nom bio/adjectif', 'sème/verbe des/determinant fleurs/nom sauvages/adjectif'],
  envelopper: ['enveloppe/verbe un/determinant cadeau/nom surprise/adjectif', 'enveloppe/verbe un/determinant livre/nom neuf/adjectif'],
  signer: ['signe/verbe une/determinant lettre/nom officielle/adjectif', 'signe/verbe une/determinant carte/nom blanche/adjectif'],
  souligner: ['souligne/verbe un/determinant mot/nom important/adjectif', 'souligne/verbe un/determinant titre/nom long/adjectif'],
  être: ['est/verbe grand/adjectif', 'est/verbe fatigué/adjectif', 'est/verbe content/adjectif', 'est/verbe grande/adjectif', 'est/verbe fatiguée/adjectif', 'est/verbe contente/adjectif'],
}

const ADJ_AUTRES: Record<string, readonly string[]> = {
  lire: ['lit/verbe un/determinant journal/nom local/adjectif', 'lit/verbe un/determinant roman/nom court/adjectif'],
  boire: ['boit/verbe un/determinant jus/nom froid/adjectif', 'boit/verbe un/determinant thé/nom chaud/adjectif'],
  écrire: ['écrit/verbe une/determinant longue/adjectif lettre/nom', 'écrit/verbe un/determinant poème/nom court/adjectif'],
  ouvrir: ['ouvre/verbe la/determinant grande/adjectif fenêtre/nom', 'ouvre/verbe la/determinant petite/adjectif boîte/nom'],
  prendre: ['prend/verbe le/determinant bus/nom jaune/adjectif', 'prend/verbe une/determinant photo/nom nette/adjectif'],
  finir: ['finit/verbe un/determinant puzzle/nom géant/adjectif', 'finit/verbe un/determinant devoir/nom difficile/adjectif'],
  choisir: ['choisit/verbe une/determinant robe/nom bleue/adjectif', 'choisit/verbe un/determinant film/nom drôle/adjectif'],
  voir: ['voit/verbe un/determinant oiseau/nom bleu/adjectif', 'voit/verbe la/determinant mer/nom calme/adjectif'],
  faire: ['fait/verbe un/determinant bon/adjectif gâteau/nom', 'fait/verbe un/determinant joli/adjectif bricolage/nom'],
  mettre: ['met/verbe une/determinant écharpe/nom chaude/adjectif', 'met/verbe un/determinant chapeau/nom rouge/adjectif'],
  apprendre: ['apprend/verbe une/determinant leçon/nom nouvelle/adjectif', 'apprend/verbe une/determinant chanson/nom douce/adjectif'],
  comprendre: ['comprend/verbe une/determinant règle/nom simple/adjectif', 'comprend/verbe un/determinant problème/nom difficile/adjectif'],
  descendre: ['descend/verbe l’/determinant escalier/nom étroit/adjectif', 'descend/verbe la/determinant rue/nom calme/adjectif'],
  attendre: ['attend/verbe le/determinant bus/nom tardif/adjectif', 'attend/verbe un/determinant ami/nom fidèle/adjectif'],
  vendre: ['vend/verbe un/determinant vélo/nom rouge/adjectif', 'vend/verbe des/determinant fleurs/nom fraîches/adjectif'],
  perdre: ['perd/verbe un/determinant ticket/nom utile/adjectif', 'perd/verbe une/determinant petite/adjectif clé/nom'],
  dire: ['dit/verbe la/determinant vérité/nom simple/adjectif', 'dit/verbe une/determinant blague/nom drôle/adjectif'],
  suivre: ['suit/verbe un/determinant chemin/nom étroit/adjectif', 'suit/verbe le/determinant guide/nom local/adjectif'],
  vivre: ['vit/verbe une/determinant grande/adjectif aventure/nom', 'vit/verbe un/determinant rêve/nom étrange/adjectif'],
  conduire: ['conduit/verbe une/determinant voiture/nom rouge/adjectif', 'conduit/verbe un/determinant vieux/adjectif tracteur/nom'],
  construire: ['construit/verbe une/determinant cabane/nom solide/adjectif', 'construit/verbe un/determinant pont/nom étroit/adjectif'],
  peindre: ['peint/verbe un/determinant mur/nom blanc/adjectif', 'peint/verbe une/determinant porte/nom bleue/adjectif'],
  cueillir: ['cueille/verbe une/determinant fleur/nom jaune/adjectif', 'cueille/verbe une/determinant pomme/nom mûre/adjectif'],
  offrir: ['offre/verbe un/determinant cadeau/nom surprise/adjectif', 'offre/verbe une/determinant fleur/nom rouge/adjectif'],
  couvrir: ['couvre/verbe la/determinant table/nom ronde/adjectif', 'couvre/verbe le/determinant bébé/nom endormi/adjectif'],
  découvrir: ['découvre/verbe un/determinant secret/nom ancien/adjectif', 'découvre/verbe une/determinant grotte/nom sombre/adjectif'],
  tenir: ['tient/verbe un/determinant ballon/nom jaune/adjectif', 'tient/verbe le/determinant chien/nom calme/adjectif'],
  sentir: ['sent/verbe une/determinant fleur/nom parfumée/adjectif', 'sent/verbe le/determinant pain/nom chaud/adjectif'],
  servir: ['sert/verbe le/determinant repas/nom chaud/adjectif', 'sert/verbe un/determinant gâteau/nom sucré/adjectif'],
  connaître: ['connaît/verbe un/determinant chemin/nom secret/adjectif', 'connaît/verbe une/determinant chanson/nom ancienne/adjectif'],
  savoir: ['sait/verbe la/determinant leçon/nom orale/adjectif', 'sait/verbe une/determinant recette/nom simple/adjectif'],
  vouloir: ['veut/verbe une/determinant glace/nom vanille/adjectif', 'veut/verbe un/determinant vélo/nom neuf/adjectif'],
  recevoir: ['reçoit/verbe un/determinant colis/nom lourd/adjectif', 'reçoit/verbe une/determinant lettre/nom courte/adjectif'],
  battre: ['bat/verbe un/determinant record/nom mondial/adjectif', 'bat/verbe les/determinant œufs/nom frais/adjectif'],
  éteindre: ['éteint/verbe la/determinant lampe/nom rouge/adjectif', 'éteint/verbe la/determinant télé/nom bruyante/adjectif'],
  traduire: ['traduit/verbe un/determinant mot/nom difficile/adjectif', 'traduit/verbe une/determinant phrase/nom courte/adjectif'],
  coudre: ['coud/verbe un/determinant bouton/nom noir/adjectif', 'coud/verbe une/determinant robe/nom bleue/adjectif'],
  joindre: ['joint/verbe une/determinant photo/nom récente/adjectif', 'joint/verbe une/determinant carte/nom postale/adjectif'],
  atteindre: ['atteint/verbe le/determinant sommet/nom enneigé/adjectif', 'atteint/verbe la/determinant rive/nom opposée/adjectif'],
  résoudre: ['résout/verbe un/determinant problème/nom difficile/adjectif', 'résout/verbe une/determinant énigme/nom simple/adjectif'],
}

/** Prépositions naturelles (présent 3e personne réel). Un id = un verbe. */
export const PREP_FRAMES_ER: readonly ThemedFrame[] = [
  frame('habiter', ['habite/verbe dans/preposition une/determinant maison/nom', 'habite/verbe dans/preposition un/determinant village/nom', 'habite/verbe dans/preposition un/determinant appartement/nom', 'habite/verbe à/preposition Genève/nom', 'habite/verbe à/preposition Paris/nom', 'habite/verbe en/preposition Suisse/nom']),
  frame('jouer', ['joue/verbe dans/preposition le/determinant jardin/nom', 'joue/verbe dans/preposition la/determinant cour/nom', 'joue/verbe avec/preposition un/determinant ami/nom', 'joue/verbe à/preposition la/determinant marelle/nom', 'joue/verbe au/preposition football/nom', 'joue/verbe au/preposition tennis/nom']),
  frame('rester', ['reste/verbe chez/preposition la/determinant mamie/nom', 'reste/verbe chez/preposition un/determinant ami/nom', 'reste/verbe dans/preposition la/determinant classe/nom', 'reste/verbe après/preposition le/determinant cours/nom']),
  frame('marcher', ['marche/verbe avec/preposition un/determinant ami/nom', 'marche/verbe vers/preposition l’/determinant école/nom', 'marche/verbe dans/preposition le/determinant parc/nom']),
  frame('travailler', ['travaille/verbe à/preposition l’/determinant école/nom', 'travaille/verbe dans/preposition un/determinant bureau/nom', 'travaille/verbe avec/preposition un/determinant collègue/nom', 'travaille/verbe à/preposition l’/determinant hôpital/nom']),
  frame('arriver', ['arrive/verbe après/preposition le/determinant cours/nom', 'arrive/verbe avant/preposition le/determinant dîner/nom', 'arrive/verbe à/preposition la/determinant gare/nom']),
  frame('passer', ['passe/verbe devant/preposition la/determinant poste/nom', 'passe/verbe par/preposition le/determinant village/nom', 'passe/verbe sous/preposition le/determinant pont/nom', 'passe/verbe chez/preposition le/determinant voisin/nom']),
  frame('rentrer', ['rentre/verbe à/preposition l’/determinant école/nom', 'rentre/verbe chez/preposition sa/determinant maman/nom', 'rentre/verbe dans/preposition la/determinant classe/nom']),
  frame('entrer', ['entre/verbe dans/preposition la/determinant classe/nom', 'entre/verbe dans/preposition le/determinant magasin/nom', 'entre/verbe par/preposition la/determinant porte/nom']),
  frame('monter', ['monte/verbe sur/preposition le/determinant vélo/nom', 'monte/verbe dans/preposition le/determinant bus/nom', 'monte/verbe à/preposition l’/determinant étage/nom']),
  frame('penser', ['pense/verbe à/preposition ses/determinant amis/nom', 'pense/verbe à/preposition la/determinant leçon/nom', 'pense/verbe à/preposition un/determinant cadeau/nom']),
  frame('parler', ['parle/verbe à/preposition un/determinant ami/nom', 'parle/verbe avec/preposition la/determinant maîtresse/nom', 'parle/verbe de/preposition la/determinant fête/nom', 'parle/verbe au/preposition téléphone/nom']),
  frame('téléphoner', ['téléphone/verbe à/preposition sa/determinant maman/nom', 'téléphone/verbe à/preposition un/determinant ami/nom', 'téléphone/verbe chez/preposition le/determinant médecin/nom']),
  frame('rêver', ['rêve/verbe de/preposition la/determinant mer/nom', 'rêve/verbe de/preposition un/determinant voyage/nom', 'rêve/verbe de/preposition son/determinant chien/nom']),
  frame('voyager', ['voyage/verbe en/preposition train/nom', 'voyage/verbe en/preposition bus/nom', 'voyage/verbe vers/preposition la/determinant mer/nom']),
  frame('chercher', ['cherche/verbe un/determinant livre/nom sous/preposition le/determinant lit/nom', 'cherche/verbe ses/determinant clés/nom dans/preposition le/determinant sac/nom']),
  frame('poser', ['pose/verbe le/determinant livre/nom sur/preposition la/determinant table/nom', 'pose/verbe le/determinant sac/nom près_de/preposition la/determinant porte/nom']),
  frame('cacher', ['cache/verbe un/determinant cadeau/nom derrière/preposition le/determinant canapé/nom', 'cache/verbe la/determinant clé/nom sous/preposition le/determinant pot/nom']),
  frame('regarder', ['regarde/verbe par/preposition la/determinant fenêtre/nom', 'regarde/verbe vers/preposition la/determinant mer/nom']),
  frame('nager', ['nage/verbe dans/preposition la/determinant piscine/nom', 'nage/verbe dans/preposition la/determinant mer/nom', 'nage/verbe vers/preposition le/determinant bord/nom']),
  frame('glisser', ['glisse/verbe sur/preposition la/determinant glace/nom', 'glisse/verbe dans/preposition le/determinant toboggan/nom']),
  frame('tomber', ['tombe/verbe dans/preposition l’/determinant eau/nom', 'tombe/verbe sur/preposition le/determinant tapis/nom']),
  frame('dîner', ['dîne/verbe chez/preposition un/determinant ami/nom', 'dîne/verbe dans/preposition un/determinant restaurant/nom']),
  frame('déjeuner', ['déjeune/verbe à/preposition l’/determinant école/nom', 'déjeune/verbe dans/preposition le/determinant jardin/nom']),
  frame('goûter', ['goûte/verbe chez/preposition la/determinant mamie/nom', 'goûte/verbe après/preposition l’/determinant école/nom']),
  frame('participer', ['participe/verbe à/preposition un/determinant jeu/nom', 'participe/verbe à/preposition la/determinant fête/nom']),
  frame('assister', ['assiste/verbe à/preposition un/determinant spectacle/nom', 'assiste/verbe à/preposition un/determinant cours/nom', 'assiste/verbe à/preposition un/determinant match/nom']),
  frame('s’occuper', ['s’occupe/verbe de/preposition son/determinant frère/nom', 's’occupe/verbe du/determinant chien/nom']),
  frame('se cacher', ['se_cache/verbe derrière/preposition un/determinant arbre/nom', 'se_cache/verbe sous/preposition la/determinant table/nom']),
  frame('se promener', ['se_promène/verbe dans/preposition le/determinant parc/nom', 'se_promène/verbe près_de/preposition la/determinant rivière/nom']),
  frame('se rendre', ['se_rend/verbe à/preposition l’/determinant école/nom', 'se_rend/verbe chez/preposition le/determinant médecin/nom']),
  frame('traverser', ['traverse/verbe jusqu’à/preposition la/determinant rive/nom', 'traverse/verbe vers/preposition le/determinant parc/nom']),
  frame('grimper', ['grimpe/verbe sur/preposition un/determinant arbre/nom', 'grimpe/verbe dans/preposition le/determinant grenier/nom']),
  frame('sauter', ['saute/verbe dans/preposition l’/determinant eau/nom', 'saute/verbe sur/preposition le/determinant tapis/nom']),
  frame('danser', ['danse/verbe avec/preposition un/determinant ami/nom', 'danse/verbe dans/preposition la/determinant salle/nom']),
  frame('chanter', ['chante/verbe avec/preposition sa/determinant sœur/nom', 'chante/verbe dans/preposition la/determinant chorale/nom']),
  frame('étudier', ['étudie/verbe à/preposition la/determinant bibliothèque/nom', 'étudie/verbe dans/preposition sa/determinant chambre/nom']),
  frame('réviser', ['révise/verbe avant/preposition le/determinant contrôle/nom', 'révise/verbe avec/preposition un/determinant ami/nom']),
  frame('discuter', ['discute/verbe avec/preposition un/determinant ami/nom', 'discute/verbe du/preposition film/nom']),
  frame('rigoler', ['rigole/verbe avec/preposition ses/determinant copains/nom', 'rigole/verbe pendant/preposition la/determinant récréation/nom']),
  frame('manger', ['mange/verbe dans/preposition la/determinant cuisine/nom', 'mange/verbe à/preposition la/determinant cantine/nom']),
  frame('dessiner', ['dessine/verbe sur/preposition une/determinant feuille/nom', 'dessine/verbe dans/preposition son/determinant cahier/nom']),
  frame('planter', ['plante/verbe dans/preposition le/determinant jardin/nom', 'plante/verbe près_de/preposition la/determinant maison/nom']),
  frame('visiter', ['visite/verbe avec/preposition un/determinant guide/nom', 'visite/verbe pendant/preposition les/determinant vacances/nom']),
  frame('inviter', ['invite/verbe un/determinant ami/nom à/preposition la/determinant fête/nom', 'invite/verbe sa/determinant sœur/nom chez/preposition un/determinant ami/nom']),
  frame('aider', ['aide/verbe sa/determinant maman/nom dans/preposition la/determinant cuisine/nom', 'aide/verbe son/determinant frère/nom à/preposition la/determinant maison/nom']),
  frame('s’arrêter', ['s’arrête/verbe devant/preposition le/determinant magasin/nom', 's’arrête/verbe à/preposition la/determinant gare/nom']),
  frame('se lever', ['se_lève/verbe avant/preposition le/determinant jour/nom', 'se_lève/verbe après/preposition sa/determinant sœur/nom']),
  frame('se coucher', ['se_couche/verbe après/preposition le/determinant dîner/nom', 'se_couche/verbe dans/preposition son/determinant lit/nom']),
  frame('se laver', ['se_lave/verbe dans/preposition la/determinant salle_de_bain/nom', 'se_lave/verbe avant/preposition le/determinant repas/nom']),
  frame('s’habiller', ['s’habille/verbe pour/preposition l’/determinant école/nom', 's’habille/verbe après/preposition le/determinant bain/nom']),
  frame('se dépêcher', ['se_dépêche/verbe vers/preposition l’/determinant école/nom', 'se_dépêche/verbe pour/preposition le/determinant bus/nom']),
  frame('se préparer', ['se_prépare/verbe pour/preposition la/determinant fête/nom', 'se_prépare/verbe avant/preposition le/determinant cours/nom']),
  frame('s’approcher', ['s’approche/verbe de/preposition la/determinant porte/nom', 's’approche/verbe du/determinant chat/nom']),
  frame('s’éloigner', ['s’éloigne/verbe de/preposition la/determinant route/nom', 's’éloigne/verbe du/determinant bord/nom']),
  frame('se moquer', ['se_moque/verbe de/preposition la/determinant blague/nom', 'se_moque/verbe du/determinant sketch/nom']),
  frame('compter', ['compte/verbe sur/preposition un/determinant ami/nom', 'compte/verbe sur/preposition sa/determinant sœur/nom']),
  frame('échouer', ['échoue/verbe à/preposition un/determinant test/nom', 'échoue/verbe dans/preposition sa/determinant tentative/nom']),
  frame('insister', ['insiste/verbe sur/preposition une/determinant règle/nom', 'insiste/verbe auprès_du/preposition maître/nom']),
  frame('renoncer', ['renonce/verbe à/preposition un/determinant dessert/nom', 'renonce/verbe à/preposition la/determinant sortie/nom']),
  frame('hésiter', ['hésite/verbe devant/preposition le/determinant choix/nom', 'hésite/verbe entre/preposition deux/determinant jeux/nom']),
  frame('changer', ['change/verbe de/preposition place/nom', 'change/verbe de/preposition veste/nom']),
  frame('profiter', ['profite/verbe de/preposition la/determinant récréation/nom', 'profite/verbe du/determinant soleil/nom']),
  frame('manquer', ['manque/verbe à/preposition sa/determinant maman/nom', 'manque/verbe de/preposition pain/nom']),
  frame('échapper', ['échappe/verbe à/preposition un/determinant danger/nom', 'échappe/verbe à/preposition la/determinant pluie/nom']),
  frame('circuler', ['circule/verbe dans/preposition la/determinant ville/nom', 'circule/verbe sur/preposition la/determinant piste/nom']),
  frame('stationner', ['stationne/verbe devant/preposition l’/determinant école/nom', 'stationne/verbe près_du/preposition parc/nom']),
  frame('débarquer', ['débarque/verbe à/preposition la/determinant gare/nom', 'débarque/verbe dans/preposition le/determinant village/nom']),
  frame('embarquer', ['embarque/verbe dans/preposition le/determinant train/nom', 'embarque/verbe pour/preposition un/determinant voyage/nom']),
  frame('décoller', ['décolle/verbe de/preposition l’/determinant aéroport/nom', 'décolle/verbe vers/preposition la/determinant mer/nom']),
  frame('camper', ['campe/verbe près_de/preposition la/determinant rivière/nom', 'campe/verbe dans/preposition la/determinant forêt/nom']),
  frame('pique-niquer', ['pique-nique/verbe dans/preposition le/determinant parc/nom', 'pique-nique/verbe près_de/preposition la/determinant mer/nom']),
  frame('bronzer', ['bronze/verbe sur/preposition la/determinant plage/nom', 'bronze/verbe près_de/preposition la/determinant piscine/nom']),
  frame('patiner', ['patine/verbe sur/preposition la/determinant glace/nom', 'patine/verbe dans/preposition la/determinant patinoire/nom']),
  frame('skier', ['skie/verbe dans/preposition la/determinant montagne/nom', 'skie/verbe sur/preposition la/determinant piste/nom']),
  frame('pédaler', ['pédale/verbe vers/preposition l’/determinant école/nom', 'pédale/verbe dans/preposition le/determinant parc/nom']),
  frame('ramer', ['rame/verbe sur/preposition le/determinant lac/nom', 'rame/verbe vers/preposition la/determinant rive/nom']),
  frame('naviguer', ['navigue/verbe sur/preposition la/determinant mer/nom', 'navigue/verbe vers/preposition une/determinant île/nom']),
  frame('donner', ['donne/verbe un/determinant livre/nom à/preposition un/determinant ami/nom', 'donne/verbe des/determinant fleurs/nom à/preposition sa/determinant maman/nom']),
  frame('montrer', ['montre/verbe une/determinant photo/nom à/preposition sa/determinant sœur/nom', 'montre/verbe le/determinant chemin/nom à/preposition un/determinant ami/nom']),
  frame('expliquer', ['explique/verbe une/determinant règle/nom à/preposition un/determinant élève/nom', 'explique/verbe le/determinant jeu/nom à/preposition un/determinant copain/nom']),
  frame('demander', ['demande/verbe un/determinant service/nom à/preposition un/determinant ami/nom', 'demande/verbe une/determinant permission/nom au/preposition maître/nom']),
  frame('apporter', ['apporte/verbe un/determinant gâteau/nom à/preposition la/determinant fête/nom', 'apporte/verbe le/determinant cahier/nom à/preposition l’/determinant école/nom']),
  frame('quitter', ['quitte/verbe la/determinant maison/nom après/preposition le/determinant dîner/nom', 'quitte/verbe l’/determinant école/nom avant/preposition le/determinant soir/nom']),
  frame('accompagner', ['accompagne/verbe un/determinant ami/nom à/preposition l’/determinant école/nom', 'accompagne/verbe sa/determinant sœur/nom chez/preposition le/determinant médecin/nom']),
  frame('retourner', ['retourne/verbe à/preposition la/determinant maison/nom', 'retourne/verbe dans/preposition sa/determinant chambre/nom']),
  frame('être', ['est/verbe à/preposition la/determinant maison/nom', 'est/verbe dans/preposition le/determinant jardin/nom', 'est/verbe chez/preposition la/determinant mamie/nom']),
]

export const PREP_FRAMES_AUTRES: readonly ThemedFrame[] = [
  frame('aller', ['va/verbe à/preposition l’/determinant école/nom', 'va/verbe chez/preposition la/determinant mamie/nom', 'va/verbe dans/preposition le/determinant parc/nom', 'va/verbe chez/preposition le/determinant médecin/nom', 'va/verbe à/preposition la/determinant piscine/nom']),
  frame('venir', ['vient/verbe chez/preposition la/determinant mamie/nom', 'vient/verbe de/preposition l’/determinant école/nom', 'vient/verbe avec/preposition un/determinant ami/nom', 'vient/verbe après/preposition le/determinant cours/nom', 'vient/verbe pour/preposition la/determinant fête/nom']),
  frame('partir', ['part/verbe après/preposition le/determinant cours/nom', 'part/verbe vers/preposition la/determinant mer/nom', 'part/verbe de/preposition la/determinant maison/nom', 'part/verbe en/preposition vacances/nom', 'part/verbe avec/preposition sa/determinant famille/nom']),
  frame('sortir', ['sort/verbe de/preposition la/determinant classe/nom', 'sort/verbe avec/preposition un/determinant ami/nom', 'sort/verbe dans/preposition le/determinant jardin/nom', 'sort/verbe après/preposition le/determinant dîner/nom', 'sort/verbe par/preposition la/determinant porte/nom']),
  frame('lire', ['lit/verbe dans/preposition le/determinant lit/nom', 'lit/verbe à/preposition la/determinant bibliothèque/nom']),
  frame('écrire', ['écrit/verbe sur/preposition le/determinant cahier/nom', 'écrit/verbe à/preposition sa/determinant cousine/nom']),
  frame('prendre', ['prend/verbe un/determinant livre/nom dans/preposition le/determinant sac/nom', 'prend/verbe le/determinant train/nom pour/preposition la/determinant ville/nom']),
  frame('mettre', ['met/verbe le/determinant livre/nom sur/preposition la/determinant table/nom', 'met/verbe le/determinant manteau/nom dans/preposition le/determinant placard/nom', 'met/verbe les/determinant assiettes/nom sur/preposition la/determinant table/nom', 'met/verbe le/determinant pain/nom dans/preposition le/determinant panier/nom']),
  frame('ouvrir', ['ouvre/verbe la/determinant porte/nom de/preposition la/determinant classe/nom', 'ouvre/verbe la/determinant fenêtre/nom sur/preposition le/determinant jardin/nom']),
  frame('dormir', ['dort/verbe sur/preposition le/determinant lit/nom', 'dort/verbe chez/preposition la/determinant mamie/nom']),
  frame('descendre', ['descend/verbe de/preposition l’/determinant autobus/nom', 'descend/verbe dans/preposition la/determinant cave/nom']),
  frame('attendre', ['attend/verbe devant/preposition l’/determinant école/nom', 'attend/verbe dans/preposition la/determinant gare/nom']),
  frame('suivre', ['suit/verbe le/determinant chemin/nom vers/preposition la/determinant mer/nom', 'suit/verbe le/determinant guide/nom dans/preposition le/determinant musée/nom']),
  frame('vivre', ['vit/verbe dans/preposition un/determinant village/nom', 'vit/verbe chez/preposition ses/determinant parents/nom']),
  frame('conduire', ['conduit/verbe vers/preposition la/determinant ville/nom', 'conduit/verbe jusqu’à/preposition l’/determinant école/nom']),
  frame('tenir', ['tient/verbe le/determinant chien/nom par/preposition la/determinant laisse/nom', 'tient/verbe le/determinant bébé/nom dans/preposition ses/determinant bras/nom']),
  frame('offrir', ['offre/verbe un/determinant cadeau/nom à/preposition sa/determinant sœur/nom', 'offre/verbe des/determinant fleurs/nom à/preposition sa/determinant maman/nom']),
  frame('apprendre', ['apprend/verbe une/determinant leçon/nom avec/preposition un/determinant ami/nom', 'apprend/verbe un/determinant poème/nom par/preposition cœur/nom']),
  frame('comprendre', ['comprend/verbe la/determinant consigne/nom après/preposition l’/determinant exemple/nom', 'comprend/verbe le/determinant jeu/nom grâce_à/preposition un/determinant ami/nom']),
  frame('voir', ['voit/verbe la/determinant mer/nom depuis/preposition la/determinant colline/nom', 'voit/verbe un/determinant oiseau/nom dans/preposition l’/determinant arbre/nom']),
  frame('faire', ['fait/verbe un/determinant gâteau/nom avec/preposition sa/determinant maman/nom', 'fait/verbe un/determinant bricolage/nom à/preposition l’/determinant école/nom']),
  frame('finir', ['finit/verbe le/determinant dessin/nom à/preposition l’/determinant école/nom', 'finit/verbe le/determinant devoir/nom avant/preposition le/determinant dîner/nom']),
  frame('choisir', ['choisit/verbe un/determinant film/nom avec/preposition un/determinant ami/nom', 'choisit/verbe une/determinant robe/nom dans/preposition le/determinant magasin/nom']),
  frame('boire', ['boit/verbe un/determinant thé/nom avec/preposition sa/determinant mamie/nom', 'boit/verbe un/determinant jus/nom après/preposition le/determinant sport/nom']),
  frame('courir', ['court/verbe vers/preposition l’/determinant école/nom', 'court/verbe dans/preposition le/determinant parc/nom']),
  frame('recevoir', ['reçoit/verbe une/determinant lettre/nom de/preposition sa/determinant cousine/nom', 'reçoit/verbe un/determinant colis/nom à/preposition la/determinant maison/nom']),
  frame('connaître', ['connaît/verbe un/determinant chemin/nom vers/preposition la/determinant mer/nom', 'connaît/verbe une/determinant chanson/nom de/preposition son/determinant pays/nom']),
  frame('savoir', ['sait/verbe la/determinant leçon/nom par/preposition cœur/nom', 'sait/verbe une/determinant recette/nom de/preposition sa/determinant mamie/nom']),
  frame('vouloir', ['veut/verbe une/determinant glace/nom après/preposition le/determinant repas/nom', 'veut/verbe un/determinant vélo/nom pour/preposition son/determinant anniversaire/nom']),
  frame('couvrir', ['couvre/verbe le/determinant bébé/nom avec/preposition une/determinant couverture/nom', 'couvre/verbe la/determinant table/nom avec/preposition une/determinant nappe/nom']),
  frame('découvrir', ['découvre/verbe un/determinant sentier/nom dans/preposition la/determinant forêt/nom', 'découvre/verbe une/determinant grotte/nom près_de/preposition la/determinant mer/nom']),
  frame('cueillir', ['cueille/verbe une/determinant fleur/nom dans/preposition le/determinant jardin/nom', 'cueille/verbe des/determinant cerises/nom sur/preposition l’/determinant arbre/nom']),
  frame('peindre', ['peint/verbe un/determinant mur/nom dans/preposition la/determinant chambre/nom', 'peint/verbe une/determinant porte/nom en/preposition bleu/nom']),
  frame('construire', ['construit/verbe une/determinant cabane/nom dans/preposition le/determinant jardin/nom', 'construit/verbe un/determinant pont/nom sur/preposition la/determinant rivière/nom']),
  frame('atteindre', ['atteint/verbe le/determinant sommet/nom après/preposition la/determinant montée/nom', 'atteint/verbe la/determinant rive/nom à/preposition la/determinant nage/nom']),
]

const ADV_BY_ID: Record<string, readonly string[]> = {
  manger: ['vite', 'lentement', 'déjà'],
  goûter: ['déjà', 'encore'],
  porter: ['souvent', 'déjà'],
  regarder: ['souvent', 'déjà'],
  écouter: ['bien', 'souvent'],
  aimer: ['beaucoup', 'vraiment'],
  adorer: ['vraiment', 'toujours'],
  détester: ['vraiment', 'souvent'],
  chercher: ['encore', 'déjà'],
  trouver: ['enfin', 'déjà'],
  courir: ['vite', 'lentement'],
  parler: ['trop', 'bien'],
  travailler: ['beaucoup', 'bien'],
  arriver: ['tôt', 'tard'],
  rester: ['ici', 'encore'],
  chanter: ['fort', 'bien'],
  danser: ['bien', 'souvent'],
  lire: ['souvent', 'bien'],
  écrire: ['bien', 'déjà'],
  voir: ['clairement', 'déjà'],
  faire: ['bien', 'déjà'],
  prendre: ['déjà', 'souvent'],
  finir: ['vite', 'déjà'],
  boire: ['trop', 'déjà'],
  mettre: ['déjà', 'encore'],
}

const DEFAULT_ADVS = ['souvent', 'déjà', 'bien'] as const

function insertAdverb(pred: string, adv: string): string {
  return pred.replace('/verbe ', `/verbe ${adv}/adverbe `)
}

function advFramesFrom(simple: readonly SimpleFrame[]): ThemedFrame[] {
  return simple.map((item) => {
    const advs = ADV_BY_ID[item.id] ?? DEFAULT_ADVS
    const preds = item.preds.flatMap((pred) => advs.slice(0, 2).map((adv) => insertAdverb(pred, adv)))
    return frame(item.id, preds.length >= 2 ? preds : [insertAdverb(item.preds[0]!, 'souvent'), insertAdverb(item.preds[0]!, 'déjà')])
  })
}

function adjFramesFrom(simple: readonly SimpleFrame[], extra: Record<string, readonly string[]>): ThemedFrame[] {
  const out: ThemedFrame[] = []
  for (const item of simple) {
    const preds = extra[item.id]
    if (preds && preds.length >= 2) out.push(frame(item.id, preds))
  }
  if (extra.être) out.push(frame('être', extra.être))
  return out
}

function conjFramesFrom(simple: readonly SimpleFrame[]): ThemedFrame[] {
  return simple.map((item, index) => {
    const other = simple[(index + 3) % simple.length]!
    return {
      id: item.id,
      preds: item.preds,
      rightPreds: other.preds,
      conjs: CONJS,
    }
  })
}

export function themedFramesFor(
  theme:
    | 'phrase-adjectif'
    | 'phrase-negation-adjectif'
    | 'phrase-preposition'
    | 'phrase-negation-preposition'
    | 'phrase-adverbe'
    | 'phrase-negation-adverbe'
    | 'phrase-conjonctions'
    | 'phrase-determinants'
    | 'phrase-negation-determinants',
  group: 'er' | 'autres',
): readonly ThemedFrame[] {
  const simple = group === 'autres' ? SIMPLE_FRAMES_AUTRES : SIMPLE_FRAMES_ER
  switch (theme) {
    case 'phrase-adjectif':
    case 'phrase-negation-adjectif':
      return adjFramesFrom(simple, group === 'autres' ? ADJ_AUTRES : ADJ_ER)
    case 'phrase-preposition':
    case 'phrase-negation-preposition':
      return group === 'autres' ? PREP_FRAMES_AUTRES : PREP_FRAMES_ER
    case 'phrase-adverbe':
    case 'phrase-negation-adverbe':
      return advFramesFrom(simple)
    case 'phrase-conjonctions':
      return conjFramesFrom(simple)
    case 'phrase-determinants':
    case 'phrase-negation-determinants':
      return simple
  }
}

function assertUniqueFrames(frames: readonly ThemedFrame[], label: string) {
  const ids = new Set<string>()
  for (const item of frames) {
    if (ids.has(item.id)) throw new Error(`${label} : modèle en double — ${item.id}`)
    if (item.preds.length < 2) throw new Error(`${label} : ${item.id} doit avoir au moins 2 compléments`)
    ids.add(item.id)
  }
}

assertUniqueFrames(PREP_FRAMES_ER, 'phrase-préposition -er')
assertUniqueFrames(PREP_FRAMES_AUTRES, 'phrase-préposition autres')
assertUniqueFrames(adjFramesFrom(SIMPLE_FRAMES_ER, ADJ_ER), 'phrase-adjectif -er')
assertUniqueFrames(adjFramesFrom(SIMPLE_FRAMES_AUTRES, ADJ_AUTRES), 'phrase-adjectif autres')
assertUniqueFrames(advFramesFrom(SIMPLE_FRAMES_ER), 'phrase-adverbe -er')
assertUniqueFrames(advFramesFrom(SIMPLE_FRAMES_AUTRES), 'phrase-adverbe autres')
assertUniqueFrames(conjFramesFrom(SIMPLE_FRAMES_ER), 'phrase-conjonctions -er')
assertUniqueFrames(conjFramesFrom(SIMPLE_FRAMES_AUTRES), 'phrase-conjonctions autres')
