#!/usr/bin/env python3
"""Ajoute les mots Voc courants (A1–B1) absents de la banque lecture.

Génère `src/francais/soutien/lecture-word-items-extra.ts` avec des phonèmes
approximés (alignés sur les conventions de `lecture-word-items.ts`).
"""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LECTURE = ROOT / "src" / "francais" / "soutien" / "lecture-word-items.ts"
VOCAB_DIR = ROOT / "src" / "francais" / "vocab-banks"
OUT = ROOT / "src" / "francais" / "soutien" / "lecture-word-items-extra.ts"

VOWELS = set("aeiouyàâäéèêëïîôöùûüÿœæ")

NASALS = [
    ("ain", "ɛ̃"),
    ("ein", "ɛ̃"),
    ("an", "ɑ̃"),
    ("en", "ɑ̃"),
    ("am", "ɑ̃"),
    ("em", "ɑ̃"),
    ("on", "ɔ̃"),
    ("om", "ɔ̃"),
    ("in", "ɛ̃"),
    ("im", "ɛ̃"),
    ("yn", "ɛ̃"),
    ("ym", "ɛ̃"),
    ("un", "œ̃"),
    ("um", "œ̃"),
]
COMPLEX = [
    ("eau", "o"),
    ("œu", "ø"),
    ("oeu", "ø"),
    ("ou", "u"),
    ("oi", "wa"),
    ("ui", "ɥi"),
    ("ai", "ɛ"),
    ("ei", "ɛ"),
    ("au", "o"),
    ("eu", "ø"),
    ("ill", "j"),
    ("ch", "ʃ"),
    ("ph", "f"),
    ("gn", "ɲ"),
    ("qu", "k"),
    ("gu", "g"),
]
DOUBLES = ("ss", "tt", "ll", "nn", "rr", "pp", "ff", "cc", "mm")


def is_vowel(ch: str) -> bool:
    return ch in VOWELS


def nasal_ok(raw: str, start: int, length: int) -> bool:
    after = raw[start + length :]
    if not after:
        return True
    nxt = after[0]
    if is_vowel(nxt):
        return False
    last = raw[start + length - 1]
    if last in "mn" and nxt == last:
        return False
    return True


def tokenize_fr(word: str) -> list[tuple[str, str]]:
    raw = word.lower().replace("-", "").replace("'", "").replace("’", "")
    out: list[tuple[str, str]] = []
    i = 0
    while i < len(raw):
        ch = raw[i]
        if not (ch.isalpha() or ch in "àâäéèêëïîôöùûüÿœæç"):
            i += 1
            continue
        matched: tuple[str, str] | None = None
        for g, tone in NASALS:
            if raw.startswith(g, i) and nasal_ok(raw, i, len(g)):
                matched = (g, tone)
                break
        if matched is None:
            for g, tone in COMPLEX:
                if raw.startswith(g, i):
                    matched = (g, tone)
                    break
        if matched is None:
            for dig in DOUBLES:
                if raw.startswith(dig, i):
                    matched = (dig, dig[0])
                    break
        if matched is None:
            c = raw[i]
            nxt = raw[i + 1] if i + 1 < len(raw) else ""
            prev = raw[i - 1] if i > 0 else ""
            if c == "ç":
                matched = ("ç", "s")
            elif c == "c":
                matched = ("c", "s" if nxt in "eiéèêëiyïî" else "k")
            elif c == "g":
                matched = ("g", "ʒ" if nxt in "eiéèêëiyïî" else "g")
            elif c == "s":
                if prev and is_vowel(prev) and nxt and is_vowel(nxt):
                    matched = ("s", "z")
                else:
                    matched = ("s", "s")
            elif c == "x":
                # ex + voyelle → gz pédagogique ; sinon ks
                if i >= 1 and raw[i - 1] == "e" and nxt and is_vowel(nxt):
                    matched = ("x", "gz")
                else:
                    matched = ("x", "ks")
            elif c == "h":
                matched = ("h", "∅")
            elif c == "w":
                matched = ("w", "w")
            elif c == "y":
                matched = ("y", "i")
            elif c in "àâ":
                matched = (c, "a")
            elif c in "éèêë":
                matched = (c, "e")
            elif c in "îï":
                matched = (c, "i")
            elif c == "ô":
                matched = (c, "o")
            elif c in "ùû":
                matched = (c, "y")
            elif c == "u":
                matched = ("u", "y")
            elif c == "e":
                matched = ("e", "e")
            elif c == "a":
                matched = ("a", "a")
            elif c == "o":
                matched = ("o", "o")
            elif c == "i":
                matched = ("i", "i")
            else:
                mono = {
                    "b": "b",
                    "d": "d",
                    "f": "f",
                    "j": "ʒ",
                    "k": "k",
                    "l": "l",
                    "m": "m",
                    "n": "n",
                    "p": "p",
                    "q": "k",
                    "r": "r",
                    "t": "t",
                    "v": "v",
                    "z": "z",
                }
                matched = (c, mono.get(c, c))
        assert matched is not None
        out.append(matched)
        i += len(matched[0])
    return out


def to_phonemes(word: str) -> list[str]:
    ph: list[str] = []
    for _g, tone in tokenize_fr(word):
        ph.append(f"/{tone}/")
    cleaned: list[str] = []
    for p in ph:
        if (
            cleaned
            and cleaned[-1] == p
            and p in {"/s/", "/t/", "/l/", "/n/", "/r/", "/p/", "/f/", "/k/", "/m/"}
        ):
            continue
        cleaned.append(p)
    return cleaned


def load_vocab_labels() -> list[str]:
    labels: list[str] = []
    for path in sorted(VOCAB_DIR.glob("fr-*.ts")):
        text = path.read_text(encoding="utf-8")
        for m in re.finditer(
            r'\{\s*"id"\s*:\s*"[^"]+"\s*,\s*"label"\s*:\s*"([^"]+)"', text
        ):
            lab = m.group(1).strip()
            if not lab or " " in lab:
                continue
            labels.append(lab)
    # Uniques, ordre stable
    seen: set[str] = set()
    out: list[str] = []
    for lab in labels:
        key = lab.lower()
        if key in seen:
            continue
        seen.add(key)
        out.append(lab)
    return out


def main() -> None:
    existing = {m.lower() for m in re.findall(r'label:\s*"([^"]+)"', LECTURE.read_text(encoding="utf-8"))}
    # Aussi les extras déjà générés
    if OUT.exists():
        existing |= {
            m.lower()
            for m in re.findall(r'label:\s*"([^"]+)"', OUT.read_text(encoding="utf-8"))
        }

    rows: list[tuple[str, list[str]]] = []
    for word in load_vocab_labels():
        if word.lower() in existing:
            continue
        if any(ch.isdigit() for ch in word):
            continue
        if len(word) < 2:
            continue
        phonemes = to_phonemes(word)
        if not phonemes:
            continue
        rows.append((word, phonemes))

    lines = [
        "/** Mots Voc courants (A1–B1) absents de la banque lecture d’origine.",
        " * Phonèmes approximés pour le filtrage Soutien (types sans image).",
        " */",
        "import type { LectureWordItem } from './lecture-word-items'",
        "",
        "export const LECTURE_WORD_ITEMS_EXTRA: readonly LectureWordItem[] = [",
    ]
    for word, phonemes in rows:
        lab = word.replace("\\", "\\\\").replace('"', '\\"')
        phs = ", ".join(f'"{p}"' for p in phonemes)
        lines.append(f'  {{ label: "{lab}", phonemes: [{phs}] }},')
    lines.append("]")
    lines.append("")
    OUT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"{OUT.relative_to(ROOT)} : {len(rows)} mots")


if __name__ == "__main__":
    main()
