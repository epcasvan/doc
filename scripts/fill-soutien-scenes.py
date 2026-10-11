#!/usr/bin/env python3
"""Construit les phrases Soutien à partir de scènes sensées (un mot variable)."""
from __future__ import annotations

import importlib.util
import json
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
SCENES = HERE / "soutien-scenes.txt"
OUT = ROOT / "src" / "francais" / "soutien" / "phrases"

spec = importlib.util.spec_from_file_location("soutien_phrases", HERE / "build-soutien-phrases.py")
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

RANGES = mod.RANGES


def load_articles() -> dict[str, dict[str, str]]:
    nouns = mod.load_nouns()
    return {bank: {word.lower(): f"{art} {word}" for art, word, _ in rows} for bank, rows in nouns.items()}


def load_scenes() -> dict[str, list[dict]]:
    banks: dict[str, list[dict]] = {}
    bank = None
    scene = None
    for raw in SCENES.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        if line.startswith("@"):
            bank = line[1:].strip()
            banks.setdefault(bank, [])
            scene = None
            continue
        m = re.match(r"^(a1|a2|b1)\s*:\s*(.+)$", line)
        if m:
            if scene is None:
                raise SystemExit(f"{bank}: modèle sans liste de mots — {line}")
            scene["frames"][m.group(1)].append(m.group(2).strip())
            continue
        scene = {"words": line.split(), "frames": {"a1": [], "a2": [], "b1": []}}
        banks[bank].append(scene)
    return banks


def valid(bank: str, level: str, word: str, sentence: str) -> str | None:
    lo, hi, min_sound = RANGES[level]
    wc = mod.word_count(sentence)
    sc = mod.count_sound(sentence, bank)
    if not (lo <= wc <= hi):
        return f"{wc} mots (attendu {lo}–{hi})"
    if sc < min_sound:
        return f"son ×{sc} < {min_sound}"
    if not mod.whole_word(sentence, word):
        return "mot absent"
    if not mod.first_hit_is_whole(sentence, word):
        return "le mot est pris dans un autre mot"
    if re.search(r"\bde le\b", sentence, re.I):
        return "« de le »"
    return None


def main() -> None:
    articles = load_articles()
    scenes = load_scenes()
    failures: list[str] = []
    OUT.mkdir(parents=True, exist_ok=True)
    only = {a for a in __import__("sys").argv[1:] if not a.startswith("-")}

    for bank, arts in articles.items():
        if only and bank not in only:
            continue
        if bank not in scenes:
            failures.append(f"{bank}: aucune scène")
            continue
        seen: set[str] = set()
        for scene in scenes[bank]:
            for word in scene["words"]:
                if word.lower() in seen:
                    failures.append(f"{bank}: « {word} » dans deux scènes")
                seen.add(word.lower())
                if word.lower() not in arts:
                    failures.append(f"{bank}: « {word} » absent de la liste de noms")
        for word in arts:
            if word not in seen:
                failures.append(f"{bank}: « {word} » sans scène")

        candidates: list[tuple[str, str, str]] = []
        for scene in scenes[bank]:
            for level, tmpls in scene["frames"].items():
                if not tmpls:
                    failures.append(f"{bank}: scène {' '.join(scene['words'][:4])} sans modèle {level}")
                for tmpl in tmpls:
                    if "{1}" not in tmpl:
                        failures.append(f"{bank}: modèle sans {{1}} — {tmpl}")
                        continue
                    bare = tmpl.replace("{1}", " ")
                    for word in scene["words"]:
                        if word.lower() not in arts:
                            continue
                        if word.lower() in bare.lower():
                            failures.append(f"{bank}: « {word} » est déjà dans le modèle — {tmpl}")
                            continue
                        sentence = mod.cap_first(tmpl.replace("{1}", arts[word.lower()]))
                        err = valid(bank, level, word, sentence)
                        if err:
                            failures.append(f"{bank} {level} {word}: {err} — {sentence}")
                            continue
                        candidates.append((level, word.lower(), sentence))

        if any(f.startswith(f"{bank} ") or f.startswith(f"{bank}:") for f in failures):
            continue

        used: set[str] = set()
        type9 = []
        by_word: dict[tuple[str, str], list[str]] = {}
        for level, word, sentence in candidates:
            by_word.setdefault((level, word), [])
            if sentence not in by_word[(level, word)]:
                by_word[(level, word)].append(sentence)

        order = []
        for scene in scenes[bank]:
            order.extend(scene["words"])
        for word in order:
            key = word.lower()
            for level in ("a1", "a2", "b1"):
                options = [s for s in by_word.get((level, key), []) if s not in used]
                if not options:
                    failures.append(f"{bank}: plus de phrase {level} pour « {word} »")
                    continue
                sentence = options[0]
                used.add(sentence)
                type9.append({"level": level, "word": word, "sentence": sentence})

        extras: dict[str, list[str]] = {"a1": [], "a2": [], "b1": []}
        for level, _word, sentence in candidates:
            if sentence in used:
                continue
            used.add(sentence)
            extras[level].append(sentence)

        def take(level: str, n: int, kind: str) -> list[str]:
            got = extras[level][:n]
            del extras[level][:n]
            if len(got) < n:
                failures.append(f"{bank}: seulement {len(got)}/{n} phrases {kind} {level}")
            return got

        type12 = [{"level": level, "sentence": s} for level in ("a1", "a2", "b1") for s in take(level, 4, "type12")]
        type14 = [{"level": level, "sentence": s} for level in ("a1", "a2", "b1") for s in take(level, 6, "type14")]
        if any(f.startswith(f"{bank}:") or f.startswith(f"{bank} ") for f in failures):
            continue
        payload = {"type9": type9, "type12": type12, "type14": type14}
        (OUT / f"{bank}.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"{bank}: {len(order)} mots")

    if failures:
        print("\n".join(failures[:80]))
        if len(failures) > 80:
            print(f"... {len(failures) - 80} de plus")
        raise SystemExit(f"{len(failures)} problème(s)")
    print("scènes OK")


if __name__ == "__main__":
    main()
