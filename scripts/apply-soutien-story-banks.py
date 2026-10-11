#!/usr/bin/env python3
"""Applique scripts/data/soutien-stories/<id>.json sur phrases/<id>.json (type12/14 Stories)."""
from __future__ import annotations
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PHRASES = ROOT / "src/francais/soutien/phrases"
DATA = ROOT / "scripts/data/soutien-stories"
BANKS = ["gn", "h", "ill", "j", "k"]

def as_stories(blocks, want):
    out = []
    for i, sentences in enumerate(blocks):
        if len(sentences) != want:
            raise SystemExit(f"histoire {i}: attendu {want}, obtenu {len(sentences)}")
        for j, s in enumerate(sentences):
            if not isinstance(s, str) or not s.strip():
                raise SystemExit(f"histoire {i} phrase {j}: vide")
        out.append({"level": "a2" if i % 2 == 0 else "b1", "sentences": list(sentences)})
    if len(out) != 10:
        raise SystemExit(f"attendu 10 histoires, obtenu {len(out)}")
    return out

def main():
    ids = []
    for bank_id in BANKS:
        raw = json.loads((DATA / f"{bank_id}.json").read_text(encoding="utf-8"))
        path = PHRASES / f"{bank_id}.json"
        data = json.loads(path.read_text(encoding="utf-8"))
        data["type12Stories"] = as_stories(raw["type12"], 9)
        data["type14Stories"] = as_stories(raw["type14"], 19)
        data.pop("type12", None)
        data.pop("type14", None)
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        d2 = json.loads(path.read_text(encoding="utf-8"))
        assert len(d2["type12Stories"]) == 10
        assert len(d2["type14Stories"]) == 10
        assert all(len(s["sentences"]) == 9 for s in d2["type12Stories"])
        assert all(len(s["sentences"]) == 19 for s in d2["type14Stories"])
        assert [s["level"] for s in d2["type12Stories"]] == ["a2", "b1"] * 5
        assert "type9" in d2 and "type10" in d2
        ids.append(bank_id)
        print(f"OK {bank_id}: type12=10×9 type14=10×19")
    print("IDS:", ",".join(ids))

if __name__ == "__main__":
    main()
