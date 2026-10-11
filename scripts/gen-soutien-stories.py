#!/usr/bin/env python3
"""
10 histoires type 12 (9 phrases) et type 14 (19 phrases) A2–B1 par banque.
Chaque histoire réutilise 3–4 mots-thème (son de la leçon), français cohérent.
"""
from __future__ import annotations

import json
import random
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PHRASES = ROOT / 'src/francais/soutien/phrases'

NAMES = [
    'Adam', 'Sara', 'Léa', 'Noah', 'Maya', 'Liam', 'Inès', 'Yanis',
    'Nora', 'Hugo', 'Amira', 'Théo', 'Sofia', 'Karim', 'Emma', 'Omar',
]
PLACES = [
    'à la gare', 'au marché', 'à l’école', 'au parc', 'à la bibliothèque',
    'au café', 'dans la cuisine', 'dans le jardin', 'dans la cour', 'au magasin',
]

GRAPHEMES = {
    'a': ['a', 'à', 'â'], 'o': ['o', 'ô'], 'i': ['i', 'î'], 'u': ['u', 'û'],
    'e': ['e', 'é', 'è', 'ê', 'ë'], 'y': ['y'],
    'an': ['an', 'am', 'en', 'em'], 'on': ['on', 'om'],
    'in': ['in', 'im', 'ain', 'ein', 'yn', 'ym'],
    'ou': ['ou'], 'oi': ['oi'], 'au': ['au', 'eau'],
    'b': ['b'], 'd': ['d'], 'f': ['f'], 'l': ['l'], 'm': ['m'], 'n': ['n'],
    'p': ['p'], 'r': ['r'], 't': ['t'], 'v': ['v'], 'z': ['z'],
    'j': ['j'], 'k': ['k'], 'w': ['w'], 'h': ['h'], 'q': ['qu', 'q'],
    'ch': ['ch'], 'ph': ['ph'], 'gn': ['gn'], 'ill': ['ill', 'il'],
    'c-k': ['c', 'k', 'qu'], 'c-s': ['c', 'ç'], 'g-g': ['g'], 'g-j': ['g'],
    's-s': ['s', 'ss', 'ç'], 's-z': ['s', 'z'], 'x-ks': ['x'], 'x-gz': ['x'],
}

# Objets concrets utilisables dans une scène (sac / table / courses…).
CONCRETE = {
    'table', 'chaise', 'porte', 'fenêtre', 'lampe', 'livre', 'cahier', 'stylo',
    'crayon', 'sac', 'cartable', 'ballon', 'pomme', 'poire', 'banane', 'carotte',
    'tomate', 'pain', 'fromage', 'lait', 'jus', 'café', 'assiette', 'tasse',
    'verre', 'fourchette', 'couteau', 'cuillère', 'bouteille', 'clé', 'montre',
    'carte', 'photo', 'lettre', 'feuille', 'valise', 'jupe', 'robe', 'botte',
    'casquette', 'chapeau', 'manteau', 'pull', 'chemise', 'pantalon', 'chaîne',
    'bague', 'collier', 'vélo', 'voiture', 'bus', 'train', 'bateau', 'avion',
    'chat', 'chien', 'oiseau', 'poisson', 'mouton', 'vache', 'cheval', 'poule',
    'canard', 'lapin', 'souris', 'abeille', 'fleur', 'arbre', 'branche', 'feuille',
    'pierre', 'sable', 'eau', 'savon', 'brosse', 'peigne', 'miroir', 'serviette',
    'oreiller', 'couverture', 'drap', 'fauteuil', 'canapé', 'armoire', 'tiroirs',
    'tiroir', 'placard', 'frigo', 'four', 'casserole', 'poêle', 'salade', 'soupe',
    'riz', 'pâtes', 'jambon', 'saucisse', 'yaourt', 'beurre', 'œuf', 'oeuf',
    'gâteau', 'tarte', 'biscuit', 'chocolat', 'bonbon', 'glace', 'fraise', 'cerise',
    'raisin', 'orange', 'citron', 'melon', 'concombre', 'oignon', 'ail', 'sel',
    'poivre', 'huile', 'vinaigre', 'farine', 'sucre', 'thé', 'cacao', 'nouille',
    'sandwich', 'pizza', 'hamburger', 'frite', 'croissan', 'croissant', 'baguette',
    'timbre', 'colis', 'paquet', 'boîte', 'carton', 'sacoche', 'panier', 'caisse',
    'échelle', 'marteau', 'clou', 'vis', 'scie', 'pelle', 'seau', 'tuyau',
    'robinet', 'douche', 'baignoire', 'lavabo', 'wc', 'papier', 'crayon', 'gomme',
    'règle', 'compas', 'colle', 'ciseaux', 'trousse', 'ardoise', 'craie', 'tableau',
    'affiche', 'journal', 'magazine', 'radio', 'téléphone', 'ordinateur', 'écran',
    'clavier', 'souris', 'chargeur', 'pile', 'lampe', 'ampoule', 'prise', 'cable',
    'câble', 'fiche', 'ticket', 'billet', 'pièce', 'monnaie', 'carte', 'passeport',
    'permis', 'drapeau', 'ballon', 'raquette', 'filet', 'maillot', 'short', 'chaussette',
    'chaussure', 'sandalette', 'sandale', 'botte', 'gant', 'écharpe', 'bonnet',
    'parapluie', 'sac', 'panier', 'caddie', 'caddy', 'caddie', 'rayon', 'étiquette',
    'balance', 'caisse', 'ticket', 'recette', 'menu', 'addition', 'facture',
    'poche',
}
# Exclus des objets « à poser sur la table »
EXCLUDE_THEME = {
    'bouche', 'dent', 'nez', 'oeil', 'œil', 'main', 'bras', 'jambe', 'pied',
    'doigt', 'ongle', 'cheveu', 'barbe', 'moustache', 'oreille', 'langue',
    'femme', 'fille', 'mère', 'sœur', 'amie', 'garçon', 'père', 'frère', 'ami',
    'table', 'poche', 'addition', 'facture', 'recette', 'menu', 'sac', 'cartable',
    # trop gros / peu naturels « dans un cartable »
    'canapé', 'fauteuil', 'armoire', 'placard', 'frigo', 'four', 'baignoire',
    'lavabo', 'douche', 'voiture', 'bus', 'train', 'avion', 'bateau', 'cheval',
    'vache', 'mouton', 'échelle', 'ordinateur', 'télévision', 'passeport',
}

FEM = {
    w for w in CONCRETE
    if w.endswith(('e', 'ion', 'té', 'ade', 'ure', 'elle', 'ette', 'ence', 'ance', 'ie'))
    and w not in {
        'livre', 'cahier', 'stylo', 'crayon', 'sac', 'cartable', 'ballon', 'pain',
        'fromage', 'lait', 'jus', 'café', 'verre', 'couteau', 'beurre', 'riz',
        'thé', 'cacao', 'sandwich', 'chocolat', 'bonbon', 'arbre', 'sable',
        'savon', 'peigne', 'miroir', 'oreiller', 'fauteuil', 'canapé', 'placard',
        'frigo', 'four', 'sel', 'poivre', 'vinaigre', 'sucre', 'timbre', 'colis',
        'paquet', 'carton', 'panier', 'marteau', 'clou', 'seau', 'tuyau', 'robinet',
        'lavabo', 'papier', 'compas', 'tableau', 'journal', 'magazine', 'telephone',
        'ordinateur', 'écran', 'clavier', 'chargeur', 'cable', 'câble', 'ticket',
        'billet', 'passeport', 'permis', 'drapeau', 'filet', 'maillot', 'short',
        'parapluie', 'caddie', 'menu', 'nez', 'oeil', 'œil', 'bras', 'pied',
        'doigt', 'ongle', 'cheveu', 'barbe',
    }
}
MASC_FORCE = (CONCRETE - FEM) | {
    'concombre', 'melon', 'citron', 'raisin', 'chocolat', 'jambon', 'fromage',
}


def fold(s: str) -> str:
    return ''.join(
        c for c in unicodedata.normalize('NFD', s.lower())
        if unicodedata.category(c) != 'Mn'
    )


def has_grapheme(word: str, bank_id: str) -> bool:
    g = GRAPHEMES.get(bank_id, [bank_id.split('-')[0]])
    w = word.lower()
    wf = fold(word)
    for grm in g:
        if grm in w or fold(grm) in wf:
            return True
    return False


def un_une(word: str) -> str:
    w = word.strip()
    if not w:
        return 'un objet'
    low = w.lower()
    if low in MASC_FORCE:
        return f'un {w}'
    if low in FEM or (w.endswith('e') and not w.endswith(('isme', 'age', 'iste', 'ège', 'ème', 'aire'))):
        return f'une {w}'
    return f'un {w}'


def de_det(word: str) -> str:
    p = un_une(word)
    if p.startswith('une '):
        return "d’une " + p[4:]
    if p.startswith('un '):
        return "d’un " + p[3:]
    return 'de ' + p


def bank_words(data: dict, bank_id: str) -> list[str]:
    from_type9 = []
    for row in data.get('type9', []):
        w = (row.get('word') or '').strip()
        if w:
            from_type9.append(w)
    # 1) intersection type9 ∩ concrets + graphème
    out = []
    seen = set()
    for w in from_type9:
        low = w.lower()
        if low not in CONCRETE and fold(low) not in {fold(c) for c in CONCRETE}:
            continue
        if not has_grapheme(w, bank_id):
            continue
        if low in seen:
            continue
        seen.add(low)
        out.append(w)
    # 2) concrets hors type9 mais avec le graphème (son prioritaire)
    if len(out) < 6:
        for w in sorted(CONCRETE):
            if not has_grapheme(w, bank_id):
                continue
            low = w.lower()
            if low in seen:
                continue
            seen.add(low)
            out.append(w)
            if len(out) >= 16:
                break
    # 3) repli absolu
    if len(out) < 4:
        out = ['livre', 'table', 'sac', 'porte', 'lampe', 'chaise']
    return out


def pick_theme(rng: random.Random, words: list[str]) -> tuple[str, str, str, str]:
    safe = [w for w in (words or []) if w.lower() not in EXCLUDE_THEME]
    fallback = ['livre', 'sac', 'lampe', 'chaise', 'stylo', 'cahier', 'pomme', 'ballon']
    pool = safe if len(safe) >= 4 else (safe + [w for w in fallback if w not in {x.lower() for x in safe}])
    rng.shuffle(pool)
    while len(pool) < 4:
        pool.append(fallback[len(pool) % len(fallback)])
    return pool[0], pool[1], pool[2], pool[3]


def story12(rng: random.Random, words: list[str], plot: int) -> list[str]:
    a, b, c, d = pick_theme(rng, words)
    n1, n2 = rng.sample(NAMES, 2)
    place = rng.choice(PLACES)

    plots = [
        [
            f'{n1} et {n2} se retrouvent {place}.',
            f'{n1} apporte {un_une(a)} dans son cartable.',
            f'{n2} pose {un_une(b)} sur la table.',
            f'Ils parlent d’abord {de_det(a)}.',
            f'Puis {n2} montre {un_une(c)} à {n1}.',
            f'Tout à coup, {un_une(a)} tombe par terre.',
            f'{n1} ramasse {un_une(a)} et rit.',
            f'{n2} range {un_une(b)} et {un_une(c)}.',
            f'Avant de partir, ils vérifient encore {un_une(d)}.',
        ],
        [
            f'Ce matin, {n1} travaille {place}.',
            f'Il prépare {un_une(a)} avec soin.',
            f'{n2} arrive et regarde {un_une(a)}.',
            f'Ensemble, ils ajoutent {un_une(b)}.',
            f'{n1} explique l’usage {de_det(b)}.',
            f'{n2} propose aussi {un_une(c)}.',
            f'Le travail avance grâce à {un_une(a)}.',
            f'Ils placent {un_une(c)} près {de_det(b)}.',
            f'À la fin, {un_une(d)} est prêt pour demain.',
        ],
        [
            f'{n1} fait des courses {place}.',
            f'Dans le panier, il y a déjà {un_une(a)}.',
            f'{n2} choisit {un_une(b)} juste à côté.',
            f'Ils comparent {un_une(a)} et {un_une(b)}.',
            f'Le vendeur parle {de_det(c)}.',
            f'{n1} prend aussi {un_une(c)}.',
            f'{n2} paie et range {un_une(a)}.',
            f'Sur le chemin, ils discutent {de_det(b)}.',
            f'À la maison, ils sortent encore {un_une(d)}.',
        ],
        [
            f'{n1} lit un message {place}.',
            f'{n2} doit apporter {un_une(a)} rapidement.',
            f'{n1} part avec {un_une(b)}.',
            f'Ils se croisent près {de_det(c)}.',
            f'{n2} donne {un_une(a)} à {n1}.',
            f'{n1} vérifie {un_une(a)} calmement.',
            f'Ensuite, ils déposent {un_une(b)}.',
            f'Une amie demande des nouvelles {de_det(c)}.',
            f'Plus tard, {un_une(d)} termine la journée.',
        ],
        [
            f'{n1} organise une activité {place}.',
            f'{n2} apporte {un_une(a)} dès le début.',
            f'Sur la table, on voit {un_une(a)} et {un_une(b)}.',
            f'Les enfants touchent {un_une(b)} à tour de rôle.',
            f'{n1} explique le mot lié à {un_une(c)}.',
            f'{n2} dessine {un_une(c)} au tableau.',
            f'Tout le monde écoute l’histoire {de_det(a)}.',
            f'Après l’exercice, ils rangent {un_une(b)}.',
            f'{n1} note encore {un_une(d)} dans le cahier.',
        ],
        [
            f'Il pleut un peu {place}.',
            f'{n1} protège {un_une(a)} sous le bras.',
            f'{n2} tient {un_une(b)} contre lui.',
            f'Ils entrent et posent {un_une(a)}.',
            f'{n1} sèche {un_une(b)} avec un chiffon.',
            f'{n2} prépare {un_une(c)} pour attendre.',
            f'Ils parlent calmement {de_det(a)}.',
            f'Quand la pluie cesse, {un_une(c)} est prêt.',
            f'Ils repartent avec {un_une(d)}.',
        ],
        [
            f'{n1} et {n2} révisent {place}.',
            f'La leçon commence avec {un_une(a)}.',
            f'{n1} lit une phrase sur {un_une(a)}.',
            f'{n2} répète le mot {un_une(b)}.',
            f'Ils écrivent {un_une(b)} dans le cahier.',
            f'Une erreur apparaît près {de_det(c)}.',
            f'{n1} corrige et montre {un_une(c)}.',
            f'{n2} récite encore la phrase {de_det(a)}.',
            f'Avant de partir, ils relisent {un_une(d)}.',
        ],
        [
            f'{n1} visite un stand {place}.',
            f'{n2} désigne {un_une(a)} du doigt.',
            f'Le guide présente {un_une(a)} clairement.',
            f'{n1} photographie {un_une(b)}.',
            f'Ils posent une question sur {un_une(b)}.',
            f'{n2} note le détail {de_det(c)}.',
            f'Avant de partir, {n1} achète {un_une(c)}.',
            f'{n2} range {un_une(c)} dans le sac.',
            f'Sur le chemin du retour, ils parlent {de_det(d)}.',
        ],
        [
            f'{n1} prépare une surprise {place}.',
            f'{n2} cache {un_une(a)} derrière la porte.',
            f'Tout le monde cherche {un_une(a)}.',
            f'{n1} donne un indice avec {un_une(b)}.',
            f'{n2} trouve enfin {un_une(a)}.',
            f'Ils ouvrent aussi {un_une(c)}.',
            f'Les amis rient autour {de_det(b)}.',
            f'{n1} partage {un_une(c)} avec le groupe.',
            f'La fête se termine près {de_det(d)}.',
        ],
        [
            f'{n1} commence la journée {place}.',
            f'{n2} apporte {un_une(a)} pour le groupe.',
            f'Ils placent {un_une(a)} au centre.',
            f'{n1} décrit {un_une(a)} à voix haute.',
            f'{n2} ajoute {un_une(b)} à côté.',
            f'Le groupe compare {un_une(a)} et {un_une(b)}.',
            f'Ensuite, chacun touche {un_une(c)}.',
            f'{n1} résume le rôle {de_det(c)}.',
            f'Pour finir, {n2} range {un_une(d)}.',
        ],
    ]
    return plots[plot % len(plots)]


def story14(rng: random.Random, words: list[str], plot: int) -> list[str]:
    base = story12(rng, words, plot)
    a, b, c, d = pick_theme(rng, words)
    n1, n2 = rng.sample(NAMES, 2)
    place = rng.choice(PLACES)
    extra = [
        f'Plus tard, {n1} revient {place}.',
        f'{n2} rapporte {un_une(a)} une seconde fois.',
        f'Ils vérifient encore {un_une(a)} ensemble.',
        f'{n1} explique une nouvelle idée sur {un_une(b)}.',
        f'{n2} écoute et regarde {un_une(b)}.',
        f'Le groupe accepte d’essayer {un_une(c)}.',
        f'Après une pause, {un_une(c)} change le plan.',
        f'{n1} montre le résultat près {de_det(a)}.',
        f'{n2} félicite tout le monde pour {un_une(b)}.',
        f'Avant la nuit, ils rangent {un_une(d)}.',
    ]
    return base + extra


def process(path: Path) -> None:
    data = json.loads(path.read_text(encoding='utf-8'))
    bank_id = path.stem
    words = bank_words(data, bank_id)
    rng = random.Random((hash(bank_id) ^ 0xC0FFEE) & 0xFFFFFFFF)
    type12_stories = []
    type14_stories = []
    for i in range(10):
        level = 'a2' if i % 2 == 0 else 'b1'
        type12_stories.append({'level': level, 'sentences': story12(rng, words, i)})
        type14_stories.append({'level': level, 'sentences': story14(rng, words, i)})
    for s in type12_stories:
        assert len(s['sentences']) == 9
    for s in type14_stories:
        assert len(s['sentences']) == 19
    out = {
        'type9': data['type9'],
        'type10': data['type10'],
        'type12Stories': type12_stories,
        'type14Stories': type14_stories,
    }
    path.write_text(json.dumps(out, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print('OK', path.name, 'theme-words', len(words))


def main() -> None:
    for f in sorted(PHRASES.glob('*.json')):
        process(f)
    print('done')


if __name__ == '__main__':
    main()
