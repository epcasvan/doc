#!/usr/bin/env python3
"""Retranscrit tous les audios CO TCF et compare aux transcriptions banque.

N’efface aucun exercice : écrit un rapport JSON + met à jour la transcription
uniquement si le score STT↔banque est très faible et qu’une meilleure source
soutien (candidates) colle nettement mieux à l’audio.
"""
from __future__ import annotations

import json
import re
import subprocess
import tempfile
import unicodedata
from pathlib import Path

from faster_whisper import WhisperModel

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "src/content/tcf"
PUBLIC = ROOT / "public"
CACHE = ROOT / "scripts/tcf-co-stt-cache.json"
REPORT = ROOT / "scripts/verify-tcf-co-transcripts-report.json"
CANDIDATES = ROOT / "scripts/tcf-co-transcript-candidates.json"
LEVELS = ["a0-a1", "a1-a2", "a2-b1"]

STOP = {
    "le", "la", "les", "un", "une", "des", "de", "du", "et", "a", "au", "aux",
    "je", "tu", "il", "elle", "on", "nous", "vous", "ils", "elles", "est", "suis",
    "c", "ce", "se", "sa", "son", "ses", "mon", "ton", "ma", "ta", "mes", "tes",
    "en", "y", "ne", "pas", "plus", "que", "qui", "dans", "pour", "avec", "sur",
    "oui", "non", "ou", "par",
}


def norm(s: str) -> str:
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9 ]+", " ", s)


def tokens(s: str) -> set[str]:
    return {w for w in norm(s).split() if w and w not in STOP and len(w) > 1}


def overlap(a: str, b: str) -> float:
    aw, bw = tokens(a), tokens(b)
    if not aw or not bw:
        return 0.0
    return len(aw & bw) / max(1, min(len(aw), len(bw)))


def stt_audio(model: WhisperModel, mp3: Path) -> str:
    with tempfile.TemporaryDirectory() as tmp:
        wav = Path(tmp) / "h.wav"
        # Début + milieu (audios souvent avec intro d’épreuve)
        subprocess.run(
            ["ffmpeg", "-y", "-i", str(mp3), "-t", "40", "-ac", "1", "-ar", "16000", str(wav)],
            capture_output=True,
            check=True,
        )
        segs, _ = model.transcribe(str(wav), language="fr", vad_filter=False)
        return " ".join((s.text or "").strip() for s in segs).strip()


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def main() -> int:
    cache: dict[str, str] = {}
    if CACHE.exists():
        cache = load_json(CACHE)

    candidates = {}
    if CANDIDATES.exists():
        raw = load_json(CANDIDATES)
        # { level: { stem: { transcription, questions } } } or flat
        if isinstance(raw, dict):
            candidates = raw

    model = WhisperModel("tiny", device="cpu", compute_type="int8")

    ok, weak, fixed, missing = [], [], [], []
    banks = {}
    for level in LEVELS:
        path = CONTENT / level / "co.json"
        banks[level] = load_json(path)

    # Unique audios
    jobs = []
    for level, data in banks.items():
        for ex in data:
            audio = (ex.get("support") or {}).get("audio") or ""
            if not audio:
                continue
            jobs.append((level, ex, audio))

    seen_stt = set()
    for i, (level, ex, audio) in enumerate(jobs):
        rel = audio.lstrip("/")
        mp3 = PUBLIC / rel
        if not mp3.exists():
            missing.append({"id": ex["id"], "audio": audio, "reason": "missing_file"})
            continue
        if audio not in cache and audio not in seen_stt:
            print(f"[{i+1}/{len(jobs)}] STT {audio}", flush=True)
            try:
                cache[audio] = stt_audio(model, mp3)
            except Exception as e:  # noqa: BLE001
                missing.append({"id": ex["id"], "audio": audio, "reason": str(e)})
                continue
            seen_stt.add(audio)
            if len(seen_stt) % 10 == 0:
                CACHE.write_text(json.dumps(cache, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

        heard = cache.get(audio, "")
        tx = (ex.get("support") or {}).get("transcription") or ""
        score = overlap(heard, tx)
        row = {
            "id": ex["id"],
            "audio": audio,
            "score": round(score, 3),
            "heard": heard[:220],
            "tx": tx[:220],
        }
        if score >= 0.35 or (not tx.strip() and not heard.strip()):
            ok.append(row)
            continue

        # Essayer un meilleur candidat soutien pour ce niveau
        stem = Path(audio).stem
        if "__" in stem:
            stem = stem.split("__", 1)[1]
        stem = re.sub(r"-\d+(\.\d+)?$", "", stem)

        best = None
        best_score = score
        # candidates : { byLevel: { A1|A2|any: { stem: { transcript, questions } } } }
        by_level = candidates.get("byLevel") or {}
        niveau = str(ex.get("niveau") or "")
        level_keys = []
        if niveau.startswith("A0") or niveau == "A1":
            level_keys = ["A1", "any"]
        elif niveau.startswith("A1") or niveau == "A2":
            level_keys = ["A2", "A1", "any"]
        else:
            level_keys = ["A2", "any", "A1"]
        for lk in level_keys:
            level_cands = by_level.get(lk) or {}
            if not isinstance(level_cands, dict):
                continue
            for cstem, cdata in level_cands.items():
                if not isinstance(cdata, dict):
                    continue
                ctx = cdata.get("transcript") or cdata.get("transcription") or ""
                if not ctx:
                    continue
                sc = overlap(heard, ctx)
                if sc > best_score + 0.12:
                    best_score = sc
                    best = (cstem, cdata, lk)

        if best and best_score >= 0.4:
            cstem, cdata, lk = best
            tx_new = cdata.get("transcript") or cdata.get("transcription") or ""
            ex["support"]["transcription"] = tx_new
            if cdata.get("questions"):
                ex["questions"] = cdata["questions"]
            row["fixed_from"] = f"{lk}:{cstem}"
            row["score"] = round(best_score, 3)
            fixed.append(row)
        else:
            weak.append(row)

    for level, data in banks.items():
        (CONTENT / level / "co.json").write_text(
            json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
        )

    CACHE.write_text(json.dumps(cache, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    report = {
        "totals": {
            "jobs": len(jobs),
            "ok": len(ok),
            "weak": len(weak),
            "fixed": len(fixed),
            "missing": len(missing),
            "cached": len(cache),
        },
        "ok": ok,
        "weak": weak,
        "fixed": fixed,
        "missing": missing,
    }
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report["totals"], indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
