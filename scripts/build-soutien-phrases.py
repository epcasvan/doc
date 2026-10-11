#!/usr/bin/env python3
"""Génère src/francais/soutien/phrases/<banque>.json (types 9 / 12 / 14, A1/A2/B1).

Chaque nom porte le son (liste curée). Les phrases sont des phrases du quotidien
assemblées par thème, avec le bon nombre de mots et d'occurrences :
  A1 : 6–7 mots, 2 noms · A2 : 11–12 mots, 3 noms · B1 : 15 mots, 4 noms.
"""
from __future__ import annotations

import json
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "src" / "francais" / "soutien" / "phrases"
DATA = Path(__file__).with_name("soutien-phrase-nouns.txt")

VOWELS = {
    "a": set("aàâ"),
    "o": set("oô"),
    "i": set("iîï"),
    "u": set("uû"),
    "e": set("eéèêë"),
    "y": set("yÿ"),
}
GRAPHEMES = {
    "b": ["b"],
    "c-k": ["c"],
    "c-s": ["c", "ç"],
    "d": ["d"],
    "g-g": ["g"],
    "g-j": ["g"],
    "k": ["k"],
    "p": ["p"],
    "q": ["q", "qu"],
    "t": ["t"],
    "f": ["f"],
    "j": ["j"],
    "l": ["l"],
    "m": ["m"],
    "n": ["n"],
    "r": ["r"],
    "s-s": ["ss", "s"],
    "s-z": ["s"],
    "v": ["v"],
    "z": ["z"],
    "w": ["w"],
    "x-ks": ["x"],
    "x-gz": ["x"],
    "h": ["h"],
    "ch": ["ch"],
    "ph": ["ph"],
    "ou": ["ou"],
    "oi": ["oi"],
    "an": ["an", "en", "am", "em"],
    "in": ["ain", "ein", "in", "im"],
    "on": ["on", "om"],
    "au": ["eau", "au"],
    "gn": ["gn"],
    "ill": ["ill", "il"],
}
# Nasales : le compteur pédagogique du site compte le graphème tel quel.
# On ne met dans les listes que des mots où le son est vraiment prononcé.

NASALS = [
    ("ain", "in"),
    ("ein", "in"),
    ("an", "an"),
    ("en", "an"),
    ("am", "an"),
    ("em", "an"),
    ("on", "on"),
    ("om", "on"),
    ("in", "in"),
    ("im", "in"),
    ("yn", "in"),
    ("ym", "in"),
    ("un", "un"),
    ("um", "un"),
]
COMPLEX = [
    ("eau", "au"),
    ("œu", "eu"),
    ("oeu", "eu"),
    ("ou", "ou"),
    ("oi", "oi"),
    ("ai", "ai"),
    ("ei", "ai"),
    ("au", "au"),
    ("eu", "eu"),
]
CONS_GROUPS = ["ch", "gn", "ph", "qu"]
VOWEL_RE = re.compile(r"[aeiouyàâäéèêëïîôöùûüÿœæ]", re.I)

RANGES = {"a1": (5, 7, 2), "a2": (8, 12, 3), "b1": (13, 15, 4)}
NEED = {"a1": 2, "a2": 3, "b1": 4}

TEMPLATES = {
    "a1": [
        "{p1} et {p2} sont là.",
        "{p1} et {p2} vont bien.",
        "Voici {p1} et {p2}.",
        "{p1} est près de {p2}.",
        "Prenez {p1} et {p2}.",
        "Regardez {p1} et {p2}.",
        "{p1} est avec {p2}.",
        "Où sont {p1} et {p2} ?",
    ],
    "a2": [
        "Ce soir, {p1}, {p2} et {p3} sont là.",
        "Ce matin, {p1}, {p2} et {p3} vont bien.",
        "À midi, {p1}, {p2} et {p3} sont là.",
        "Dans la rue, {p1}, {p2} et {p3} sont là.",
        "Pour le cours, {p1}, {p2} et {p3} sont utiles.",
        "Après le repas, {p1}, {p2} et {p3} restent là.",
        "Avant le cours, {p1}, {p2} et {p3} sont là.",
        "Ce soir, {p1}, {p2} et {p3} restent là.",
    ],
    "b1": [
        "Quand on voit {p1} et {p2}, on cherche {p3} et {p4}.",
        "Quand on prend {p1} et {p2}, on trouve {p3} et {p4}.",
        "Quand on range {p1} et {p2}, on cherche {p3} et {p4}.",
        "Si on voit {p1} et {p2}, on cherche {p3} et {p4}.",
        "Quand on voit {p1} et {p2}, on trouve {p3} et {p4}.",
        "Quand on cherche {p1} et {p2}, on prend {p3} et {p4}.",
        "Quand on voit {p1} et {p2} mais aussi {p3} et {p4}.",
        "Si on cherche {p1} et {p2}, on trouve {p3} et {p4}.",
    ],
}


def is_vowel_char(ch: str) -> bool:
    return bool(VOWEL_RE.match(ch))


def nasal_allowed(word: str, start: int, length: int) -> bool:
    after = word[start + length :]
    if not after:
        return True
    nxt = after[0]
    if is_vowel_char(nxt):
        return False
    last = word[start + length - 1]
    if re.match(r"[mn]", last, re.I) and last.lower() == nxt.lower():
        return False
    return True


def tokenize_alpha(word: str):
    raw = unicodedata.normalize("NFC", word)
    out = []
    i = 0
    while i < len(raw):
        ch = raw[i]
        if ch.isspace() or ch in "-'’.,;:!?«»":
            out.append((ch, "cons"))
            i += 1
            continue
        matched = None
        for g, tone in NASALS:
            if raw[i : i + len(g)].lower() == g and nasal_allowed(raw, i, len(g)):
                matched = (raw[i : i + len(g)], tone)
                break
        if not matched:
            for g, tone in COMPLEX:
                if raw[i : i + len(g)].lower() == g:
                    matched = (raw[i : i + len(g)], tone)
                    break
        if not matched:
            for g in CONS_GROUPS:
                if raw[i : i + len(g)].lower() == g:
                    matched = (raw[i : i + len(g)], "cons")
                    break
        if not matched:
            matched = (ch, "vowel" if is_vowel_char(ch) else "cons")
        out.append(matched)
        i += len(matched[0])
    return out


def count_sound(text: str, bank: str) -> int:
    if bank in VOWELS:
        targets = VOWELS[bank]
        n = 0
        for seg, tone in tokenize_alpha(text):
            if tone == "vowel" and len(seg) == 1 and seg.lower() in targets:
                n += 1
        return n
    needles = sorted(GRAPHEMES[bank], key=len, reverse=True)
    lower = text.lower()
    n = 0
    i = 0
    while i < len(lower):
        hit = 0
        for g in needles:
            if lower.startswith(g, i):
                hit = len(g)
                break
        if hit:
            n += 1
            i += hit
        else:
            i += 1
    return n


def word_count(sentence: str) -> int:
    return len([t for t in sentence.split() if re.search(r"[^\W\d_]|[\d]", t, re.U)])


def cap_first(sentence: str) -> str:
    return sentence[0].upper() + sentence[1:]


def glue_tokens(template: str) -> list[str]:
    masked = re.sub(r"\{p\d\}", " ", template)
    return [re.sub(r"^[^\wÀ-ÿ]+|[^\wÀ-ÿ]+$", "", t, flags=re.U) for t in masked.split() if re.search(r"\w", t, re.U)]


def load_nouns() -> dict[str, list[tuple[str, str, str]]]:
    banks: dict[str, list[tuple[str, str, str]]] = {}
    current = None
    for raw in DATA.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        if line.startswith("@"):
            current = line[1:].strip()
            banks[current] = []
            continue
        art, word, theme = line.split()
        banks[current].append((art, word, theme))
    return banks


def ok_pair(a: str, b: str) -> bool:
    al, bl = a.lower(), b.lower()
    if al == bl:
        return False
    return al not in bl and bl not in al


def template_allowed(template: str, nouns: list[tuple[str, str, str]]) -> bool:
    words = [w.lower() for _, w, _ in nouns]
    for token in glue_tokens(template):
        t = token.lower()
        if t in words:
            return False
        if any(n in t for n in words):
            return False
    return True


def choose(nouns, k, theme, forbid, start):
    same = [n for n in nouns if n[2] == theme and n[1].lower() not in forbid]
    rest = [n for n in nouns if n[2] != theme and n[1].lower() not in forbid]
    pool = same + rest
    if not pool:
        return None
    shift = start % len(pool)
    pool = pool[shift:] + pool[:shift]
    chosen = []
    for n in pool:
        if any(not ok_pair(n[1], c[1]) for c in chosen):
            continue
        if any(not ok_pair(n[1], w) for w in forbid):
            continue
        chosen.append(n)
        if len(chosen) == k:
            return chosen
    return None


def build_sentence(bank, level, nouns, templates, primary, start, used):
    need = NEED[level]
    tmpls = [t for t in templates[level] if template_allowed(t, nouns)]
    if not tmpls:
        raise SystemExit(f"{bank}: aucun modèle {level}")
    forbid = set()
    theme = nouns[0][2]
    forced = None
    if primary is not None:
        forced = next(n for n in nouns if n[1].lower() == primary.lower())
        theme = forced[2]
        forbid.add(forced[1].lower())
    for attempt in range(len(tmpls) * 6):
        tmpl = tmpls[(start + attempt) % len(tmpls)]
        picked = choose(nouns, need - (1 if forced else 0), theme, forbid, start + attempt * 3)
        if not picked:
            continue
        slots = []
        if forced:
            slots.append(forced)
        slots.extend(picked)
        # Le mot imposé n'est pas toujours en tête : on le place selon start.
        if forced:
            slots = slots[1:]
            pos = (start + attempt) % len(slots + [forced]) if False else (start + attempt) % need
            slots.insert(pos, forced)
        mapping = {f"p{i+1}": f"{art} {word}" for i, (art, word, _) in enumerate(slots)}
        sentence = cap_first(tmpl.format(**mapping))
        if sentence in used:
            continue
        lo, hi, min_sound = RANGES[level]
        wc = word_count(sentence)
        sc = count_sound(sentence, bank)
        if not (lo <= wc <= hi) or sc < min_sound:
            continue
        if forced and not whole_word(sentence, forced[1]):
            continue
        if forced and first_hit_is_whole(sentence, forced[1]) is False:
            continue
        used.add(sentence)
        return sentence
    raise SystemExit(f"{bank}: phrase {level} impossible (mot {primary})")


def whole_word(sentence: str, word: str) -> bool:
    return re.search(rf"(?<![\wÀ-ÿ]){re.escape(word)}(?![\wÀ-ÿ])", sentence, re.I) is not None


def first_hit_is_whole(sentence: str, word: str) -> bool:
    idx = sentence.lower().find(word.lower())
    if idx < 0:
        return False
    before = sentence[idx - 1] if idx else " "
    after_i = idx + len(word)
    after = sentence[after_i] if after_i < len(sentence) else " "
    return not re.match(r"[\wÀ-ÿ]", before) and not re.match(r"[\wÀ-ÿ]", after)


def main():
    nouns = load_nouns()
    OUT.mkdir(parents=True, exist_ok=True)
    problems = []
    for bank, rows in nouns.items():
        if bank not in VOWELS and bank not in GRAPHEMES:
            problems.append(f"{bank}: banque inconnue")
            continue
        seen = set()
        for art, word, theme in rows:
            key = word.lower()
            if key in seen:
                problems.append(f"{bank}: mot en double « {word} »")
            seen.add(key)
            if count_sound(word, bank) < 1:
                problems.append(f"{bank}: « {word} » ne porte pas le graphème")
            if " " in word or "'" in word or "’" in word:
                problems.append(f"{bank}: « {word} » doit être un seul mot sans apostrophe")
        for i, (_, w1, _) in enumerate(rows):
            for _, w2, _ in rows[i + 1 :]:
                if not ok_pair(w1, w2):
                    problems.append(f"{bank}: « {w1} » / « {w2} » se contiennent")
    if problems:
        print("\n".join(problems))
        raise SystemExit(f"{len(problems)} problème(s) dans les listes")

    for bank, rows in nouns.items():
        used: set[str] = set()
        type9 = []
        for index, (_, word, _) in enumerate(rows):
            for li, level in enumerate(("a1", "a2", "b1")):
                sentence = build_sentence(
                    bank, level, rows, TEMPLATES, word, index * 5 + li * 2, used
                )
                type9.append({"level": level, "word": word, "sentence": sentence})
        type12 = []
        type14 = []
        cursor = 0
        for level, n in (("a1", 4), ("a2", 4), ("b1", 4)):
            for k in range(n):
                type12.append(
                    {
                        "level": level,
                        "sentence": build_sentence(
                            bank, level, rows, TEMPLATES, None, cursor + k * 4, used
                        ),
                    }
                )
            cursor += 20
        for level, n in (("a1", 6), ("a2", 6), ("b1", 6)):
            for k in range(n):
                type14.append(
                    {
                        "level": level,
                        "sentence": build_sentence(
                            bank, level, rows, TEMPLATES, None, cursor + k * 3, used
                        ),
                    }
                )
            cursor += 30
        payload = {"type9": type9, "type12": type12, "type14": type14}
        (OUT / f"{bank}.json").write_text(
            json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
        )
        print(f"{bank}: {len(rows)} mots, {len(used)} phrases")
    print(f"{len(nouns)} banques → {OUT}")


if __name__ == "__main__":
    main()
