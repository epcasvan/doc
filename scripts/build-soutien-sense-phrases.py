#!/usr/bin/env python3
"""Génère des phrases Soutien FR sensées et variées (types 9 / 10 / 12 / 14).

Référence : modèles Gattegno (`phrase-simple-frames.ts` + prépositions) —
sujet = personne, verbe + complément crédible, un verbe différent par phrase.
Pas de gabarit unique à un seul mot variable.
"""
from __future__ import annotations

import importlib.util
import json
import re
import sys
from collections import defaultdict
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
OUT = ROOT / "src" / "francais" / "soutien" / "phrases"
GATTEGNO_SIMPLE = ROOT / "src" / "francais" / "phrase-simple-frames.ts"
GATTEGNO_THEME = ROOT / "src" / "francais" / "phrase-theme-frames.ts"

spec = importlib.util.spec_from_file_location("soutien_base", HERE / "build-soutien-phrases.py")
base = importlib.util.module_from_spec(spec)
spec.loader.exec_module(base)

RANGES = base.RANGES
DET_RE = re.compile(r"\b([Ll]es|[Ll]e|[Ll]a)\b|([Ll][’'])(?=\S)")

# Prénoms / sujets qui portent vraiment le son de la leçon.
CAST: dict[str, list[str]] = {
    "a": ["Sara", "Lara", "Adam", "Anna"],
    "o": ["Léo", "Paolo", "Tom", "Noa"],
    "i": ["Nina", "Kim", "Iris", "Tim"],
    "u": ["Luc", "Julie", "Hugo", "Brutus"],
    "e": ["Hélène", "Théo", "René", "Eve"],
    "y": ["Mary", "Yves", "Cyril", "Yann"],
    "b": ["Bruno", "Barbara", "Bob", "Béatrice"],
    "c-k": ["Claire", "Luc", "Carl", "Nicolas"],
    "c-s": ["Cécile", "Alice", "Francis", "Cyril"],
    "d": ["Didier", "David", "Nadia", "André"],
    "g-g": ["Hugo", "Guy", "Gaston", "Magalie"],
    "g-j": ["Roger", "Ginette", "Georges", "Virginie"],
    "k": ["Karim", "Kevin", "Frank", "Mark"],
    "p": ["Paul", "Pauline", "Pierre", "Philippe"],
    "q": ["Quentin", "Monique", "Jacques", "Frédéric"],
    "t": ["Tom", "Théo", "Martine", "Antoine"],
    "f": ["Farid", "Fatima", "Frédéric", "Sophie"],
    "j": ["Julie", "Jean", "Jacques", "Julien"],
    "l": ["Léa", "Léo", "Luc", "Liliane"],
    "m": ["Manon", "Marc", "Emma", "Simon"],
    "n": ["Nina", "Anne", "Antoine", "Fernand"],
    "r": ["Marie", "Roger", "Claire", "Pierre"],
    "s-s": ["Sara", "Sam", "Sophie", "Cassandre"],
    "s-z": ["Lise", "Élise", "Rose", "Louise"],
    "v": ["Vincent", "Véronique", "Olivier", "Eva"],
    "z": ["Zoé", "Enzo", "Suzanne", "Aziz"],
    "w": ["William", "Wendy", "Edward", "Owen"],
    "x-ks": ["Max", "Félix", "Alex", "Alexis"],
    "x-gz": ["Xavier", "Alexandre", "Alexia"],
    "h": ["Hugo", "Henri", "Hélène", "Thomas"],
    "ch": ["Chloé", "Charles", "Michel", "Richard"],
    "ph": ["Philippe", "Sophie", "Stéphane", "Joseph"],
    "ou": ["Lou", "Louis", "Julie", "Gustave"],
    "oi": ["Antoine", "François", "Benoît"],
    "an": ["Jean", "Henri", "Anne", "François"],
    "in": ["Inès", "Martin", "Quentin", "Christine"],
    "on": ["Simon", "Manon", "Gaston", "Yvonne"],
    "au": ["Paul", "Claude", "Laura", "Théo"],
    "gn": ["Lina", "Agnès", "Magalie", "Virginie"],
    "ill": ["Camille", "Guillaume", "Lucille", "Achille"],
}

# Compléments de son (noms / adverbes / lieux) pour atteindre le quota.
SOUND_PAD: dict[str, list[str]] = {
    "a": ["à la table", "à la gare", "dans la salle", "avec Sara"],
    "o": ["trop tôt", "au zoo", "avec Léo", "autour du pot"],
    "i": ["ici vite", "avec Nina", "dans le lit", "fini ici"],
    "u": ["sur le mur", "avec Luc", "plus loin", "dans le bus"],
    "e": ["avec Hélène", "près de Théo", "après le thé", "très vite"],
    "y": ["avec Mary", "chez Yves", "près de Cyril", "au lycée"],
    "b": ["avec Bruno", "bien bas", "près de Barbara", "au bal"],
    "c-k": ["avec Claire", "avec Luc", "au café", "dans le bac"],
    "c-s": ["avec Cécile", "avec Alice", "ici aussi", "merci"],
    "d": ["avec Didier", "devant David", "dehors", "dans le jardin"],
    "g-g": ["avec Hugo", "avec Guy", "à la gare", "dans le garage"],
    "g-j": ["avec Roger", "avec Ginette", "avec Georges", "à Genève"],
    "k": ["avec Karim", "avec Kevin", "au kiosque", "près du kiwi"],
    "p": ["avec Paul", "avec Pauline", "pour Papa", "près du pont"],
    "q": ["avec Quentin", "avec Monique", "à la boutique", "sans question"],
    "t": ["avec Tom", "avec Théo", "tout de suite", "sur le toit"],
    "f": ["avec Farid", "avec Fatima", "au café", "près du feu"],
    "j": ["avec Julie", "avec Jean", "un jour", "déjà"],
    "l": ["avec Léa", "avec Luc", "là-bas", "sous le lit"],
    "m": ["avec Manon", "avec Marc", "à la maison", "même ici"],
    "n": ["avec Nina", "avec Anne", "dans le jardin", "non loin"],
    "r": ["avec Marie", "avec Roger", "dans la rue", "près du parc"],
    "s-s": ["avec Sara", "avec Sam", "sans stress", "sous le sac"],
    "s-z": ["avec Lise", "avec Élise", "sans souci", "dans la maison"],
    "v": ["avec Vincent", "avec Véronique", "devant", "vite"],
    "z": ["avec Zoé", "avec Enzo", "au zoo", "sans zéro"],
    "w": ["avec William", "avec Wendy", "ce week-end", "au wifi"],
    "x-ks": ["avec Max", "avec Félix", "sans excuse", "au maximum"],
    "x-gz": ["dans la classe", "sur la table", "avec Xavier", "exactement"],
    "h": ["avec Hugo", "avec Henri", "hors de la maison", "là-haut"],
    "ch": ["avec Chloé", "avec Charles", "chez Charles", "sur le chemin"],
    "ph": ["avec Philippe", "avec Sophie", "une photo", "au téléphone"],
    "ou": ["avec Lou", "avec Louis", "tout autour", "sous le bouleau"],
    "oi": ["avec Antoine", "le soir", "trois fois", "au toit"],
    "an": ["avec Jean", "avec Henri", "dans le jardin", "pendant longtemps"],
    "in": ["avec Inès", "avec Martin", "enfin", "dans le jardin"],
    "on": ["avec Simon", "avec Manon", "dans le salon", "selon mon oncle"],
    "au": ["avec Paul", "au château", "autour du bateau", "trop chaud"],
    "gn": ["avec Lina", "avec Agnès", "à la montagne", "sans peigne"],
    "ill": ["avec Camille", "avec Guillaume", "sous le soleil", "près de la fille"],
}

TAIL: dict[str, list[str]] = {
    "a": ["et Sara est contente aussi", "parce que Lara est là aussi"],
    "o": ["et Léo sort trop tôt aussi", "parce que Tom est trop content"],
    "i": ["et Nina part très vite aussi", "parce que Kim finit ici"],
    "u": ["et Luc part plus loin aussi", "parce que Julie est plus contente"],
    "e": ["et Théo est très content aussi", "parce que Hélène est très contente"],
    "y": ["et Mary sourit près de Cyril", "parce que Yves est chez Mary"],
    "b": ["et Bruno aime bien ça aussi", "parce que Barbara est bien contente"],
    "c-k": ["et Claire est très contente", "parce que Luc est content aussi"],
    "c-s": ["et Alice dit un grand merci", "parce que Cécile est ici aussi"],
    "d": ["et Didier est devant David", "parce que David est devant aussi"],
    "g-g": ["et Gaston est très content", "parce que Hugo est content aussi"],
    "g-j": ["et Georges est très content", "parce que Ginette est contente"],
    "k": ["et Kevin est content aussi", "parce que Karim est là aussi"],
    "p": ["et Paul est content pour Pauline", "parce que Pauline part pour Paris"],
    "q": ["et Quentin est très content", "parce que Monique est contente aussi"],
    "t": ["et Tom est très content", "parce que Théo est très content"],
    "f": ["et Farid est très content", "parce que Fatima est contente"],
    "j": ["et Julie est très contente", "parce que Jean est content aussi"],
    "l": ["et Léa est très contente", "parce que Luc est là aussi"],
    "m": ["et Emma est très contente", "parce que Marc est content aussi"],
    "n": ["et Nina est très contente", "parce que Anne est contente aussi"],
    "r": ["et Marie est très contente", "parce que Roger est très content"],
    "s-s": ["et Sara reste contente aussi", "parce que Sam reste content aussi"],
    "s-z": ["et Lise met bien la musique", "parce que Élise met la musique"],
    "v": ["et Vincent est très content", "parce que Véronique est contente"],
    "z": ["et Zoé reste très contente", "parce que Enzo reste content"],
    "w": ["et William est très content", "parce que Wendy est contente"],
    "x-ks": ["et Félix explique très bien", "parce que Max est très content"],
    "x-gz": ["et Xavier reste très exact", "parce que Alexandre est exact aussi"],
    "h": ["et Hugo est très content", "parce que Hélène est contente"],
    "ch": ["et Chloé est chez Charles", "parce que Charles est chez Chloé"],
    "ph": ["et Philippe est très content", "parce que Sophie est contente"],
    "ou": ["et Lou est tout content aussi", "parce que Louis est tout content"],
    "oi": ["et Antoine est très content", "parce que François me revoit aussi"],
    "an": ["et Jean est très content", "parce que Henri est content aussi"],
    "in": ["et Inès sourit enfin bien", "parce que Martin sourit aussi"],
    "on": ["et Simon est très content", "parce que Manon est contente"],
    "au": ["et Paul trouve ça très beau", "parce que Claude aime ça aussi"],
    "gn": ["et Lina accompagne sa compagne", "parce que Agnès est soignée"],
    "ill": ["et la fille est très contente", "parce que Camille est contente"],
}

# Verbes Gattegno par thème (quand le mot n’est pas déjà dans un modèle).
THEME_VERBS: dict[str, list[str]] = {
    "repas": ["mange", "coupe", "prépare", "goûte", "sert", "apporte", "achète", "choisit", "partage", "lave"],
    "personne": ["salue", "aide", "appelle", "invite", "remercie", "console", "embrasse", "suit"],
    "animal": ["caresse", "nourrit", "soigne", "attrape", "regarde", "voit", "observe", "sauve"],
    "maison": ["nettoie", "range", "ouvre", "ferme", "visite", "quitte", "peint", "bricole"],
    "objet": ["prend", "pose", "range", "trouve", "cherche", "utilise", "montre", "oublie"],
    "vetement": ["porte", "met", "enfile", "lave", "choisit", "range", "achète", "repasse"],
    "transport": ["prend", "attend", "conduit", "répare", "regarde", "vend", "emprunte"],
    "ville": ["visite", "cherche", "trouve", "traverse", "voit", "quitte", "longe"],
    "ecole": ["lit", "ouvre", "écrit", "utilise", "prépare", "corrige", "recopie", "étudie"],
    "nature": ["voit", "regarde", "dessine", "photographie", "plante", "observe", "admire"],
    "loisir": ["aime", "regarde", "écoute", "choisit", "commence", "termine", "joue"],
    "sport": ["gagne", "marque", "lance", "attrape", "regarde", "prépare", "joue"],
    "temps": ["attend", "note", "prépare", "aime", "choisit", "parle"],
    "corps": ["lave", "soigne", "regarde", "montre", "touche", "essuie"],
    "voyage": ["prend", "prépare", "oublie", "cherche", "trouve", "visite"],
    "histoire": ["lit", "raconte", "écrit", "écoute", "commence", "termine"],
}

# Sujets inanimés interdits (règle Gattegno).
PERSON_THEMES = {"personne"}


def load_gattegno() -> dict[str, list[tuple[str, str, str]]]:
    """Index nom → [(verbe, préposition_ou_vide, déterminant)].

    Conserve la préposition Gattegno (*téléphone à*, *retourne dans*…)
    pour ne pas produire « téléphone la maman ».
    """
    by_noun: dict[str, list[tuple[str, str, str]]] = defaultdict(list)
    for path in (GATTEGNO_SIMPLE, GATTEGNO_THEME):
        text = path.read_text(encoding="utf-8")
        for pred in re.findall(r"'([^']+/verbe[^']+)'", text):
            toks = pred.split()
            verb = None
            prep = ""
            det = None
            noun = None
            after_verb = False
            for t in toks:
                w, _, tag = t.partition("/")
                w = w.replace("_", " ")
                if tag == "verbe":
                    verb = w
                    after_verb = True
                    continue
                if not after_verb:
                    continue
                if tag == "preposition" and det is None and noun is None:
                    prep = w
                elif tag == "determinant" and det is None:
                    det = w
                elif tag == "nom" and noun is None:
                    noun = w
            if not verb or not noun or det is None:
                continue
            # Filtrer les modèles trop longs / trop spécifiques (adj, 2e GN…)
            # On ne garde que verbe (+prep) + dét + nom.
            by_noun[noun.lower()].append((verb, prep, det))
    for n in list(by_noun):
        seen: set[tuple[str, str, str]] = set()
        uniq: list[tuple[str, str, str]] = []
        for item in by_noun[n]:
            if item in seen:
                continue
            seen.add(item)
            uniq.append(item)
        by_noun[n] = uniq
    return by_noun


def blank_determinants(sentence: str) -> list[dict[str, str]] | None:
    parts: list[dict[str, str]] = []
    i = 0
    for m in DET_RE.finditer(sentence):
        if m.start() > i:
            parts.append({"t": sentence[i : m.start()]})
        raw = m.group(0)
        if raw.lower().startswith("l'") or raw.lower().startswith("l’"):
            blank = "L’" if raw[0].isupper() else "l’"
        else:
            blank = raw
        parts.append({"blank": blank})
        i = m.end()
    if i == 0:
        return None
    if i < len(sentence):
        parts.append({"t": sentence[i:]})
    return parts


def valid(bank: str, level: str, word: str | None, sentence: str) -> str | None:
    lo, hi, min_sound = RANGES[level]
    wc = base.word_count(sentence)
    sc = base.count_sound(sentence, bank)
    if not (lo <= wc <= hi):
        return f"{wc} mots"
    if sc < min_sound:
        return f"son ×{sc}"
    if re.search(r"\bde le\b|\bà le\b", sentence, re.I):
        return "contraction"
    if word:
        if not base.whole_word(sentence, word):
            return "mot absent"
        if not base.first_hit_is_whole(sentence, word):
            return "sous-chaîne"
    if not re.match(r"^[A-ZÀÂÄÉÈÊËÎÏÔÖÙÛÜÇŒ]", sentence):
        return "majuscule"
    if not re.search(r"[.!?]$", sentence):
        return "ponctuation"
    return None


def fix_elisions(sentence: str) -> str | None:
    """Évite les l’ problématiques pour le type 10 ; remplace quelques cas sûrs."""
    sentence = (
        sentence.replace("dans l’évier", "dans le bac")
        .replace("dans l'évier", "dans le bac")
        .replace("dans l’armoire", "dans le placard")
        .replace("dans l'armoire", "dans le placard")
        .replace("dans l’agenda", "dans le carnet")
        .replace("dans l'agenda", "dans le carnet")
        .replace("pendant l’année", "pendant l an")  # will still have l — skip pads with l’
    )
    # Pads avec apostrophe : refuser
    if "l’" in sentence or "l'" in sentence:
        return None
    return sentence


def art_word(art: str, word: str) -> str:
    return f"{art} {word}"


# Verbes qui exigent une préposition (si absente du modèle → on saute).
NEED_PREP = {
    "téléphone": "à",
    "parle": "avec",
    "pense": "à",
    "habite": "dans",
    "rentre": "chez",
    "retourne": "dans",
    "entre": "dans",
    "monte": "dans",
    "manque": "à",
    "donne": "à",
    "offre": "à",
    "s’approche": "de",
    "s'approche": "de",
    "joue": "avec",
}

# Verbes Gattegno absurdes pour certains thèmes (mauvais calque prep).
BLOCK_VERB_THEME: dict[str, set[str]] = {
    "personne": {"donne", "offre", "fait", "manque", "rentre", "retourne", "étudie", "part"},
    "maison": {"étudie", "retourne"},  # seulement avec « dans »
    "repas": {"lave", "sauve", "caresse", "attrape"},  # sauf fruits lavage géré à part
}

# Compléments qui se boivent / ne se mangent pas.
DRINK_WORDS = {"café", "thé", "jus", "lait", "eau", "chocolat", "soda"}
WASHABLE_FOOD = {"salade", "tomate", "carotte", "banane", "pomme", "cerise", "fraise", "raisin", "poire"}


def pick_verbs_for_word(
    word: str,
    theme: str,
    by_noun: dict[str, list[tuple[str, str, str]]],
    art: str,
) -> list[tuple[str, str, str]]:
    """Liste (verbe, préposition, déterminant) Gattegno ou thème."""
    hits = list(by_noun.get(word.lower(), []))
    blocked = BLOCK_VERB_THEME.get(theme, set())
    pool: list[tuple[str, str, str]] = []
    for verb, prep, _det in hits:
        if verb in NEED_PREP and not prep:
            prep = NEED_PREP[verb]
        # Sans prép. obligatoire, certains verbes restent absurdes (*donne la maman*).
        if verb in blocked and not prep:
            continue
        # Toujours absurde / pédago faible pour personne
        if theme == "personne" and verb in {"fait", "manque", "part"}:
            continue
        pool.append((verb, prep, art))
    # Filtrer hits absurdes pour boissons / lavage
    filtered: list[tuple[str, str, str]] = []
    for verb, prep, a in pool:
        if word.lower() in DRINK_WORDS and verb in {"mange", "coupe", "lave", "mélange"}:
            continue
        if theme == "repas" and verb == "lave" and word.lower() not in WASHABLE_FOOD:
            continue
        filtered.append((verb, prep, a))
    pool = filtered

    if word.lower() in DRINK_WORDS:
        drink = [("boit", "", art), ("prépare", "", art), ("sert", "", art), ("aime", "", art), ("achète", "", art)]
        return drink + [x for x in pool if x[0] not in {"mange", "coupe", "lave"}]

    if pool:
        return pool
    if theme == "personne":
        return [
            (v, "", art)
            for v in ("salue", "aide", "appelle", "invite", "remercie", "suit", "console", "embrasse")
        ]
    verbs = THEME_VERBS.get(theme) or THEME_VERBS["objet"]
    out: list[tuple[str, str, str]] = []
    for v in verbs:
        if theme == "repas" and v == "lave" and word.lower() not in WASHABLE_FOOD:
            continue
        if word.lower() in DRINK_WORDS and v in {"mange", "coupe", "lave"}:
            continue
        if v == "joue":
            out.append((v, "avec", art))
        elif v in NEED_PREP:
            out.append((v, NEED_PREP[v], art))
        else:
            out.append((v, "", art))
    return out


def build_core(name: str, verb: str, prep: str, det_noun: str) -> str | None:
    """Noyau Gattegno : Sujet + verbe (+ prép.) + complément."""
    if prep:
        # Contractions
        low = det_noun.lower()
        if prep == "à" and low.startswith("le "):
            comp = "au " + det_noun.split(" ", 1)[1]
        elif prep == "de" and low.startswith("le "):
            comp = "du " + det_noun.split(" ", 1)[1]
        elif prep == "à" and low.startswith("les "):
            comp = "aux " + det_noun.split(" ", 1)[1]
        elif prep == "de" and low.startswith("les "):
            comp = "des " + det_noun.split(" ", 1)[1]
        else:
            comp = f"{prep} {det_noun}"
        return f"{name} {verb} {comp}"
    if re.search(r"\b(à|de) le\b", f"{verb} {det_noun}", re.I):
        return None
    return f"{name} {verb} {det_noun}"


def assemble(
    bank: str,
    level: str,
    core: str,
    name2: str,
    pad: str,
    tail: str,
    seed: int,
) -> list[str]:
    """Variantes A1/A2/B1 autour du même noyau Gattegno."""
    out: list[str] = []
    if level == "a1":
        out.extend(
            [
                f"{core}.",
                f"{core} bien.",
                f"{core} vite.",
                f"{core} ici.",
                f"{core} {pad}.",
            ]
        )
    elif level == "a2":
        times = ["Ce matin,", "Ce soir,", "À midi,", "Après le cours,", "Avant le repas,"]
        t = times[seed % len(times)]
        out.extend(
            [
                f"{t} {core} {pad}.",
                f"{t} {core} avec soin.",
                f"{t} {core} près de {name2}.",
                f"{t} {core} à la maison.",
                f"{t} {core} dans la salle.",
                f"{t} {core} {pad}.",
            ]
        )
    else:  # b1
        times = ["Ce matin,", "Ce soir,", "À midi,", "Quand"]
        t = times[seed % len(times)]
        if t == "Quand":
            out.extend(
                [
                    f"Quand {core.lower() if False else core}, {tail}.",
                    f"Quand {core} {pad}, {tail}.",
                    f"Quand {core} près de {name2}, {tail}.",
                ]
            )
            # Fix: "Quand Sara mange…" — core already starts with Name
            fixed = []
            for s in out:
                s = s.replace("Quand " + core[0].lower(), "Quand " + core[0])  # noop
                # Ensure "Quand Name ..." — core is "Name verb..."
                if s.startswith("Quand "):
                    # core has capital name — lower only if we want "quand sara" — keep Name capital OK for pedagogy? 
                    # French: "Quand Sara mange la salade, …"
                    fixed.append(s)
                else:
                    fixed.append(s)
            out = fixed
        out.extend(
            [
                f"Ce matin, quand {core}, {tail}.",
                f"Ce soir, quand {core}, {tail}.",
                f"À midi, quand {core} {pad}, {tail}.",
                f"Ce matin, quand {core} près de {name2}, {tail}.",
                f"Ce soir, quand {core} {pad}, {tail}.",
            ]
        )
    # Normalize: "quand Name" — if core appears after "quand ", keep as is
    cleaned = []
    for s in out:
        s = re.sub(r"\s+", " ", s).strip()
        # "Quand Name" is fine; avoid "quand quand"
        s = s.replace("quand Quand", "quand")
        cleaned.append(base.cap_first(s) if not s[0].isupper() else s)
        # Ensure first letter capital
        cleaned[-1] = base.cap_first(cleaned[-1][0].lower() + cleaned[-1][1:]) if False else (
            cleaned[-1][0].upper() + cleaned[-1][1:] if cleaned[-1] else cleaned[-1]
        )
    return cleaned


def build_one(
    bank: str,
    level: str,
    art: str,
    word: str,
    theme: str,
    seed: int,
    used: set[str],
    used_verb: set[str],
    by_noun: dict[str, list[tuple[str, str, str]]],
) -> str:
    names = CAST.get(bank) or ["Léa", "Noah"]
    pads = SOUND_PAD.get(bank) or ["ici"]
    tails = TAIL.get(bank) or ["et tout le monde est content aussi"]
    verb_pool = pick_verbs_for_word(word, theme, by_noun, art)
    errors: list[str] = []

    for attempt in range(max(80, len(verb_pool) * len(names) * 3)):
        vi = (seed + attempt * 3) % len(verb_pool)
        ni = (seed + attempt * 5) % len(names)
        n2i = (seed + attempt * 7 + 1) % len(names)
        pi = (seed + attempt * 11) % len(pads)
        tai = (seed + attempt * 13) % len(tails)
        verb, prep, _det = verb_pool[vi]
        # Variété : éviter le même verbe pour ce mot si possible
        # Variété inter-niveaux : ne pas recycler le même verbe pour ce mot.
        vkey = f"{word}:{verb}"
        if vkey in used_verb and attempt < len(verb_pool) * 3:
            continue
        name = names[ni]
        name2 = names[n2i]
        if name == name2:
            name2 = names[(n2i + 1) % len(names)]
        # Nom ≠ mot cible
        if word.lower() in name.lower() or name.lower() in word.lower():
            continue
        if word.lower() in name2.lower():
            continue
        dn = art_word(art, word)
        core = build_core(name, verb, prep, dn)
        if not core:
            continue
        if re.search(r"\b(à|de) le\b", core, re.I):
            continue
        # Verbe montre + mot montre
        if word.lower() == "montre" and verb == "montre":
            continue
        # Éviter « avec Name » si Name déjà sujet (`avec Lou` après Lou)
        pad = pads[pi]
        if f"avec {name}" in pad:
            pad = pads[(pi + 1) % len(pads)]
        candidates = assemble(bank, level, core, name2, pad, tails[tai], seed + attempt)
        for sentence in candidates:
            sentence = fix_elisions(sentence)
            if not sentence:
                continue
            sentence = re.sub(r"\s+", " ", sentence).strip()
            if not sentence.endswith((".", "!", "?")):
                sentence += "."
            if sentence in used:
                continue
            err = valid(bank, level, word, sentence)
            if err:
                errors.append(err)
                continue
            used.add(sentence)
            used_verb.add(vkey)
            return sentence

    # Dernier recours : noyau minimal + pads sonores empilés
    for attempt in range(60):
        name = names[(seed + attempt) % len(names)]
        name2 = names[(seed + attempt + 1) % len(names)]
        pad = pads[(seed + attempt) % len(pads)]
        pad2 = pads[(seed + attempt + 2) % len(pads)]
        tail = tails[(seed + attempt) % len(tails)]
        theme_verbs = THEME_VERBS.get(theme) or THEME_VERBS["objet"]
        verb = theme_verbs[attempt % len(theme_verbs)]
        prep = NEED_PREP.get(verb, "")
        core = build_core(name, verb, prep, f"{art} {word}")
        if not core:
            continue
        if level == "a1":
            cands = [f"{core} {pad}.", f"{core} bien.", f"{core} {pad2}."]
        elif level == "a2":
            cands = [
                f"Ce matin, {core} {pad}.",
                f"Ce soir, {core} près de {name2}.",
                f"À midi, {core} {pad}.",
                f"Ce matin, {core} {pad} {pad2}.".replace(f"{pad} {pad}", pad),
            ]
        else:
            cands = [
                f"Ce matin, quand {core} {pad}, {tail}.",
                f"Ce soir, quand {core} près de {name2}, {tail}.",
                f"À midi, quand {core} {pad}, {tail}.",
            ]
        for sentence in cands:
            sentence = fix_elisions(sentence)
            if not sentence:
                continue
            sentence = re.sub(r"\s+", " ", sentence).strip()
            if sentence in used:
                continue
            err = valid(bank, level, word, sentence)
            if err:
                errors.append(err)
                continue
            used.add(sentence)
            return sentence

    raise SystemExit(
        f"{bank} {level} « {word} » : impossible ({', '.join(errors[:8]) or 'aucun modèle'})"
    )


def main() -> None:
    only = {a for a in sys.argv[1:] if not a.startswith("-")}
    nouns = base.load_nouns()
    by_noun = load_gattegno()
    OUT.mkdir(parents=True, exist_ok=True)
    failures: list[str] = []

    print(f"Gattegno : {sum(len(v) for v in by_noun.values())} couples verbe(+prép)↔nom ({len(by_noun)} noms)")

    for bank, rows in nouns.items():
        if only and bank not in only:
            continue
        used: set[str] = set()
        used_verb: set[str] = set()
        type9: list[dict] = []
        try:
            for index, (art, word, theme) in enumerate(rows):
                for li, level in enumerate(("a1", "a2", "b1")):
                    sentence = build_one(
                        bank,
                        level,
                        art,
                        word,
                        theme,
                        index * 11 + li * 5,
                        used,
                        used_verb,
                        by_noun,
                    )
                    type9.append({"level": level, "word": word, "sentence": sentence})
        except SystemExit as e:
            failures.append(str(e))
            continue

        extras: dict[str, list[str]] = {"a1": [], "a2": [], "b1": []}
        cursor = 0
        for level in ("a1", "a2", "b1"):
            need = 4 + 6
            guard = 0
            while len(extras[level]) < need and guard < need * 40:
                art, word, theme = rows[cursor % len(rows)]
                cursor += 1
                guard += 1
                try:
                    sentence = build_one(
                        bank,
                        level,
                        art,
                        word,
                        theme,
                        cursor * 13 + guard,
                        used,
                        used_verb,
                        by_noun,
                    )
                except SystemExit:
                    continue
                extras[level].append(sentence)
            if len(extras[level]) < need:
                failures.append(f"{bank}: seulement {len(extras[level])}/{need} extras {level}")

        if any(f.startswith(f"{bank}:") or f.startswith(f"{bank} ") for f in failures):
            continue

        type12 = [
            {"level": level, "sentence": s}
            for level in ("a1", "a2", "b1")
            for s in extras[level][:4]
        ]
        type14 = [
            {"level": level, "sentence": s}
            for level in ("a1", "a2", "b1")
            for s in extras[level][4:10]
        ]

        type10: list[dict] = []
        seen_det: set[str] = set()
        by_lvl = {"a1": 0, "a2": 0, "b1": 0}

        def add_type10(level: str, sentence: str) -> None:
            if sentence in seen_det:
                return
            parts = blank_determinants(sentence)
            if not parts:
                return
            seen_det.add(sentence)
            type10.append({"level": level, "sentence": sentence, "parts": parts})
            by_lvl[level] += 1

        for row in type9 + type12 + type14:
            add_type10(row["level"], row["sentence"])

        # Compléter type 10 si les mots n’ont que « un/une » (ex. x-gz) :
        # phrases Gattegno avec le/la dans le complément de lieu.
        cursor = 0
        guard = 0
        while any(by_lvl[lv] < 3 for lv in ("a1", "a2", "b1")) and guard < 200:
            art, word, theme = rows[cursor % len(rows)]
            cursor += 1
            guard += 1
            for level in ("a1", "a2", "b1"):
                if by_lvl[level] >= 3:
                    continue
                try:
                    sentence = build_one(
                        bank,
                        level,
                        art,
                        word,
                        theme,
                        cursor * 17 + guard + ord(level[1]),
                        used,
                        used_verb,
                        by_noun,
                    )
                except SystemExit:
                    continue
                # Forcer un le/la si absent
                if not blank_determinants(sentence):
                    names = CAST.get(bank) or ["Léa"]
                    name = names[guard % len(names)]
                    verb_pool = pick_verbs_for_word(word, theme, by_noun, art)
                    verb, prep, _ = verb_pool[guard % len(verb_pool)]
                    core = build_core(name, verb, prep, f"{art} {word}")
                    if not core:
                        continue
                    pads_la = [
                        "dans la classe",
                        "sur la table",
                        "près de la porte",
                        "dans la salle",
                        "sous la table",
                    ]
                    pad = pads_la[guard % len(pads_la)]
                    tails = TAIL.get(bank) or ["et tout le monde est content aussi"]
                    tail = tails[guard % len(tails)]
                    if level == "a1":
                        sentence = f"{core} {pad}."
                    elif level == "a2":
                        sentence = f"Ce matin, {core} {pad}."
                    else:
                        sentence = f"Ce matin, quand {core} {pad}, {tail}."
                    sentence = fix_elisions(sentence)
                    if not sentence:
                        continue
                    sentence = re.sub(r"\s+", " ", sentence).strip()
                    err = valid(bank, level, word, sentence)
                    if err:
                        continue
                    used.add(sentence)
                add_type10(level, sentence)

        for level in ("a1", "a2", "b1"):
            if by_lvl[level] < 3:
                failures.append(f"{bank}: type10 {level} seulement {by_lvl[level]}/3")

        if any(f.startswith(f"{bank}:") or f.startswith(f"{bank} ") for f in failures):
            continue

        payload = {"type9": type9, "type10": type10, "type12": type12, "type14": type14}
        (OUT / f"{bank}.json").write_text(
            json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
        )
        print(f"{bank}: {len(rows)} mots · {len(used)} phrases · type10 {len(type10)}")

    if failures:
        print("\n".join(failures[:80]))
        if len(failures) > 80:
            print(f"... {len(failures) - 80} de plus")
        raise SystemExit(f"{len(failures)} problème(s)")
    print("phrases sensées OK (base Gattegno)")


if __name__ == "__main__":
    main()
