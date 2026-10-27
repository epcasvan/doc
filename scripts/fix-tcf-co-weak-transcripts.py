#!/usr/bin/env python3
"""Corrige transcriptions CO TCF faibles / vides.

- tcf-ss-* : reprend transcript (+ questions) du meilleur candidat soutien
  (banque scripts/tcf-co-transcript-candidates.json) scorant vs STT audio.
- Autres : retranscription STT complète (faster-whisper) nettoyée, écrite
  dans support.transcription (sans toucher aux questions).
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
CANDIDATES = ROOT / "scripts/tcf-co-transcript-candidates.json"
REPORT = ROOT / "scripts/fix-tcf-co-weak-transcripts-report.json"
LEVELS = ["a0-a1", "a1-a2", "a2-b1"]
WEAK_THRESHOLD = 0.35

STOP = {
    "le", "la", "les", "un", "une", "des", "de", "du", "et", "a", "au", "aux",
    "je", "tu", "il", "elle", "on", "nous", "vous", "ils", "elles", "est", "suis",
    "c", "ce", "se", "sa", "son", "ses", "mon", "ton", "ma", "ta", "mes", "tes",
    "en", "y", "ne", "pas", "plus", "que", "qui", "dans", "pour", "avec", "sur",
    "oui", "non", "ou", "par",
}

INTRO_RE = re.compile(
    r"(?is)^(?:\s*(?:exercice|exercise|page|épreuve|epreuve|delf|dialogue)\s*"
    r"[\d\.]*\s*[-:.]?\s*)+"
)
INSTR_RE = re.compile(
    r"(?is)^\s*(?:lisez|écoutez|ecoutez|vous allez entendre|attention)[^.?!]*[.?!]\s*"
)


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


def clean_stt(text: str) -> str:
    t = (text or "").strip()
    t = INTRO_RE.sub("", t)
    t = INSTR_RE.sub("", t)
    # Partir du premier Dialogue N si présent
    m = re.search(r"(?i)\bdialogue\s*\d+\b", t)
    if m and m.start() < 80:
        t = t[m.start() :].strip()
    t = re.sub(r"\s+", " ", t).strip()
    return t


def stt_full(model: WhisperModel, mp3: Path) -> str:
    with tempfile.TemporaryDirectory() as tmp:
        wav = Path(tmp) / "h.wav"
        subprocess.run(
            ["ffmpeg", "-y", "-i", str(mp3), "-ac", "1", "-ar", "16000", str(wav)],
            capture_output=True,
            check=True,
        )
        segs, _ = model.transcribe(str(wav), language="fr", vad_filter=True)
        return " ".join((s.text or "").strip() for s in segs).strip()


def level_keys(niveau: str) -> list[str]:
    if str(niveau).startswith("A0") or str(niveau) == "A1":
        return ["A1", "any", "A2"]
    if str(niveau).startswith("A1") or str(niveau) == "A2":
        return ["A2", "A1", "any"]
    return ["A2", "any", "A1"]


def iter_candidates(by_level: dict, niveau: str):
    for lk in level_keys(niveau):
        bucket = by_level.get(lk) or {}
        for stem, data in bucket.items():
            if not isinstance(data, dict):
                continue
            tx = data.get("transcript") or data.get("transcription") or ""
            if tx.strip():
                yield lk, stem, tx, data.get("questions")


def main() -> int:
    cache = json.loads(CACHE.read_text(encoding="utf-8")) if CACHE.exists() else {}
    candidates = json.loads(CANDIDATES.read_text(encoding="utf-8"))
    by_level = candidates.get("byLevel") or {}

    banks = {}
    targets = []  # (level, ex)
    for level in LEVELS:
        data = json.loads((CONTENT / level / "co.json").read_text(encoding="utf-8"))
        banks[level] = data
        for ex in data:
            audio = (ex.get("support") or {}).get("audio") or ""
            tx = ((ex.get("support") or {}).get("transcription") or "").strip()
            heard = (cache.get(audio) or "").strip()
            if not audio:
                continue
            if not tx:
                targets.append((level, ex, "empty", 0.0))
                continue
            sc = overlap(heard, tx)
            if sc < WEAK_THRESHOLD:
                targets.append((level, ex, "weak", sc))

    print(f"targets: {len(targets)}", flush=True)
    model = None
    report = {"from_soutien": [], "from_stt": [], "unchanged": [], "errors": []}

    for i, (level, ex, kind, prev) in enumerate(targets):
        audio = ex["support"]["audio"]
        mp3 = PUBLIC / audio.lstrip("/")
        eid = ex["id"]
        is_ss = str(eid).startswith("tcf-ss-")
        print(f"[{i+1}/{len(targets)}] {kind} {eid}", flush=True)

        if not mp3.exists():
            report["errors"].append({"id": eid, "audio": audio, "reason": "missing_file"})
            continue

        heard = (cache.get(audio) or "").strip()
        old_tx = (ex["support"].get("transcription") or "").strip()

        def ensure_stt() -> str:
            nonlocal heard, model
            if model is None:
                model = WhisperModel("base", device="cpu", compute_type="int8")
            heard = stt_full(model, mp3)
            cache[audio] = heard
            if (i + 1) % 10 == 0:
                CACHE.write_text(json.dumps(cache, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            return heard

        def best_soutien(heard_text: str):
            best = None
            best_sc = overlap(heard_text, old_tx) if old_tx else 0.0
            for lk, stem, ctx, questions in iter_candidates(by_level, ex.get("niveau") or ""):
                sc = overlap(heard_text, ctx)
                if sc > best_sc + 0.08:
                    best_sc = sc
                    best = (lk, stem, ctx, questions, sc)
            return best, best_sc

        if is_ss:
            best, best_sc = best_soutien(heard) if heard else (None, 0.0)
            if not (best and best_sc >= 0.28):
                # STT frais puis nouvel essai soutien
                try:
                    ensure_stt()
                except Exception as e:  # noqa: BLE001
                    report["errors"].append({"id": eid, "audio": audio, "reason": str(e)})
                    continue
                best, best_sc = best_soutien(heard)
            if best and best_sc >= 0.28:
                lk, stem, ctx, questions, sc = best
                ex["support"]["transcription"] = ctx
                if questions:
                    ex["questions"] = questions
                report["from_soutien"].append(
                    {
                        "id": eid,
                        "audio": audio,
                        "from": f"{lk}:{stem}",
                        "score": round(sc, 3),
                        "prev": round(prev, 3),
                    }
                )
                continue
            cleaned = clean_stt(heard)
            if cleaned and (not old_tx or overlap(cleaned, old_tx) < 0.5):
                ex["support"]["transcription"] = cleaned
                report["from_stt"].append(
                    {"id": eid, "audio": audio, "reason": "no_soutien_match", "score": round(best_sc, 3)}
                )
            else:
                report["unchanged"].append({"id": eid, "audio": audio, "prev": round(prev, 3)})
            continue

        # Non-ss (vides inclus) : STT complète → transcription
        try:
            if kind == "empty" or len(heard) < 40:
                ensure_stt()
            elif kind == "weak":
                ensure_stt()
        except Exception as e:  # noqa: BLE001
            report["errors"].append({"id": eid, "audio": audio, "reason": str(e)})
            continue
        cleaned = clean_stt(heard)
        if cleaned:
            ex["support"]["transcription"] = cleaned
            report["from_stt"].append(
                {
                    "id": eid,
                    "audio": audio,
                    "kind": kind,
                    "prev": round(prev, 3),
                    "chars": len(cleaned),
                }
            )
        else:
            report["unchanged"].append({"id": eid, "audio": audio, "reason": "empty_stt"})

    for level, data in banks.items():
        (CONTENT / level / "co.json").write_text(
            json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
        )
    CACHE.write_text(json.dumps(cache, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    # Overrides connus
    ov = ROOT / "scripts/apply-tcf-co-overrides.mjs"
    if ov.exists():
        subprocess.run(["node", str(ov)], cwd=str(ROOT), check=False)

    summary = {
        "targets": len(targets),
        "from_soutien": len(report["from_soutien"]),
        "from_stt": len(report["from_stt"]),
        "unchanged": len(report["unchanged"]),
        "errors": len(report["errors"]),
    }
    report["summary"] = summary
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(summary, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
