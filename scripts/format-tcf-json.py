#!/usr/bin/env python3
"""Reformate les banques TCF CE/CO :
- transcription : retour à la ligne après . ! ?
- chaque objet de choix (qcm) sur une seule ligne
"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TCF = ROOT / "src/content/tcf"

# Fin de phrase suivie d’un espace (garde … intact)
SENTENCE_END = re.compile(r"([.!?…])([ \t]+)(?=\S)")


def break_transcription(text: str) -> str:
    t = text.replace("\r\n", "\n").strip()
    # Normalise les fins de phrase déjà sur plusieurs lignes
    t = re.sub(r"\n+", " ", t)
    t = SENTENCE_END.sub(r"\1\n", t)
    # Nettoie espaces en début de ligne
    t = "\n".join(line.strip() for line in t.split("\n") if line.strip())
    return t


def is_choix_item(obj: object) -> bool:
    if not isinstance(obj, dict):
        return False
    keys = set(obj.keys())
    if "id" not in keys:
        return False
    return bool(keys & {"texte", "image", "correct", "label", "audio"})


def is_choix_list(obj: object) -> bool:
    return isinstance(obj, list) and len(obj) > 0 and all(is_choix_item(x) for x in obj)


def dumps(obj: object, indent: int = 0) -> str:
    sp = "  " * indent
    sp1 = "  " * (indent + 1)

    if obj is None:
        return "null"
    if isinstance(obj, bool):
        return "true" if obj else "false"
    if isinstance(obj, (int, float)) and not isinstance(obj, bool):
        return json.dumps(obj)
    if isinstance(obj, str):
        return json.dumps(obj, ensure_ascii=False)

    if is_choix_list(obj):
        lines = ["["]
        for i, item in enumerate(obj):
            compact = json.dumps(item, ensure_ascii=False, separators=(", ", ": "))
            comma = "," if i < len(obj) - 1 else ""
            lines.append(f"{sp1}{compact}{comma}")
        lines.append(f"{sp}]")
        return "\n".join(lines)

    if isinstance(obj, list):
        if len(obj) == 0:
            return "[]"
        lines = ["["]
        for i, item in enumerate(obj):
            comma = "," if i < len(obj) - 1 else ""
            inner = dumps(item, indent + 1)
            if "\n" in inner:
                lines.append(f"{sp1}{inner}{comma}")
            else:
                lines.append(f"{sp1}{inner}{comma}")
        lines.append(f"{sp}]")
        return "\n".join(lines)

    if isinstance(obj, dict):
        if len(obj) == 0:
            return "{}"
        lines = ["{"]
        items = list(obj.items())
        for i, (k, v) in enumerate(items):
            comma = "," if i < len(items) - 1 else ""
            key = json.dumps(k, ensure_ascii=False)
            val = dumps(v, indent + 1)
            if "\n" in val:
                lines.append(f"{sp1}{key}: {val}{comma}")
            else:
                lines.append(f"{sp1}{key}: {val}{comma}")
        lines.append(f"{sp}}}")
        return "\n".join(lines)

    return json.dumps(obj, ensure_ascii=False)


def transform(ex: dict) -> bool:
    changed = False
    support = ex.get("support")
    if isinstance(support, dict):
        tr = support.get("transcription")
        if isinstance(tr, str) and tr.strip():
            new = break_transcription(tr)
            if new != tr:
                support["transcription"] = new
                changed = True
    return changed


def main() -> None:
    files = sorted(TCF.glob("*/*.json"))
    n_files = n_tr = 0
    for path in files:
        raw = path.read_text(encoding="utf-8")
        data = json.loads(raw)
        if not isinstance(data, list):
            continue
        tr_here = 0
        for ex in data:
            if isinstance(ex, dict) and transform(ex):
                tr_here += 1
        out = dumps(data) + "\n"
        if out != raw or tr_here:
            path.write_text(out, encoding="utf-8")
            n_files += 1
            n_tr += tr_here
            print(f"ok {path.relative_to(ROOT)} (transcriptions: {tr_here})")
    print(f"Fichiers réécrits : {n_files} · transcriptions coupées : {n_tr}")


if __name__ == "__main__":
    main()
