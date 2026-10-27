#!/usr/bin/env python3
"""Retranscrit tous les audios CO TCF, compare aux transcriptions banque, remplace si incorrect.

Source de vérité = contenu audio (STT faster-whisper base, volume ×3).
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
CACHE = ROOT / "scripts/tcf-co-stt-full-cache.json"
REPORT = ROOT / "scripts/retranscribe-all-tcf-co-report.json"
LEVELS = ["a0-a1", "a1-a2", "a2-b1"]
REPLACE_BELOW = 0.35

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


def clean_transcription(text: str) -> str:
    """Retire intros d’épreuve / consignes en tête, garde le document."""
    t = (text or "").strip()
    if not t:
        return ""
    # Couper avant le contenu utile
    m = re.search(r"(?i)\bdialogue\s*\d+\b", t)
    if m and m.start() < 120:
        t = t[m.start() :].strip()
    # Retirer préfixes Exercice / Page / Épreuve / Lisez…
    t = re.sub(
        r"(?is)^(?:\s*(?:exercice|exercise|page|épreuve|epreuve|delf|attention)[^.!?\n]{0,40}[.!?]?\s*)+",
        "",
        t,
    )
    t = re.sub(
        r"(?is)^\s*(?:lisez les questions|écoutez le document|ecoutez le document|"
        r"vous allez entendre[^.!?]*|quelles? objets?[^.!?]*|puis répondez)[^.!?]*[.!]?\s*",
        "",
        t,
    )
    t = re.sub(r"\s+", " ", t).strip()
    # Capitaliser
    if t and t[0].islower():
        t = t[0].upper() + t[1:]
    return t


def stt_audio(model: WhisperModel, mp3: Path) -> str:
    with tempfile.TemporaryDirectory() as tmp:
        wav = Path(tmp) / "h.wav"
        subprocess.run(
            [
                "ffmpeg",
                "-y",
                "-i",
                str(mp3),
                "-af",
                "volume=2.5",
                "-ac",
                "1",
                "-ar",
                "16000",
                str(wav),
            ],
            capture_output=True,
            check=True,
        )
        segs, _ = model.transcribe(str(wav), language="fr", vad_filter=False, beam_size=5)
        return " ".join((s.text or "").strip() for s in segs).strip()


def main() -> int:
    cache: dict[str, str] = {}
    if CACHE.exists():
        cache = json.loads(CACHE.read_text(encoding="utf-8"))

    banks = {}
    jobs: list[tuple[str, dict]] = []
    audios: list[str] = []
    seen = set()
    for level in LEVELS:
        data = json.loads((CONTENT / level / "co.json").read_text(encoding="utf-8"))
        banks[level] = data
        for ex in data:
            audio = (ex.get("support") or {}).get("audio") or ""
            if not audio:
                continue
            jobs.append((level, ex))
            if audio not in seen:
                seen.add(audio)
                audios.append(audio)

    print(f"exercises={len(jobs)} unique_audios={len(audios)} cached={len(cache)}", flush=True)
    model = WhisperModel("base", device="cpu", compute_type="int8")

    for i, audio in enumerate(audios):
        if audio in cache and len(cache[audio]) >= 20:
            continue
        mp3 = PUBLIC / audio.lstrip("/")
        if not mp3.exists():
            print(f"[{i+1}/{len(audios)}] MISSING {audio}", flush=True)
            cache[audio] = ""
            continue
        print(f"[{i+1}/{len(audios)}] STT {audio}", flush=True)
        try:
            cache[audio] = stt_audio(model, mp3)
        except Exception as e:  # noqa: BLE001
            print(f"  ERR {e}", flush=True)
            cache[audio] = cache.get(audio) or ""
        if (i + 1) % 5 == 0:
            CACHE.write_text(json.dumps(cache, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    CACHE.write_text(json.dumps(cache, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    replaced, kept, empty_stt, errors = [], [], [], []
    for level, ex in jobs:
        audio = ex["support"]["audio"]
        old = (ex["support"].get("transcription") or "").strip()
        heard_raw = (cache.get(audio) or "").strip()
        heard = clean_transcription(heard_raw)
        if not heard:
            # garder brut si clean a tout effacé
            heard = heard_raw.strip()
        if not heard:
            empty_stt.append({"id": ex["id"], "audio": audio, "old": old[:120]})
            continue
        sc = overlap(heard_raw, old) if old else 0.0
        # Aussi scorer vs cleaned
        sc2 = overlap(heard, old) if old else 0.0
        score = max(sc, sc2)
        if not old or score < REPLACE_BELOW:
            ex["support"]["transcription"] = heard
            replaced.append(
                {
                    "id": ex["id"],
                    "audio": audio,
                    "score": round(score, 3),
                    "old": old[:160],
                    "new": heard[:160],
                }
            )
        else:
            kept.append({"id": ex["id"], "audio": audio, "score": round(score, 3)})

    for level, data in banks.items():
        (CONTENT / level / "co.json").write_text(
            json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
        )

    # Override pique-nique connu
    ov = ROOT / "scripts/apply-tcf-co-overrides.mjs"
    if ov.exists():
        subprocess.run(["node", str(ov)], cwd=str(ROOT), check=False)

    summary = {
        "unique_audios": len(audios),
        "exercises": len(jobs),
        "replaced": len(replaced),
        "kept": len(kept),
        "empty_stt": len(empty_stt),
        "errors": len(errors),
        "threshold": REPLACE_BELOW,
    }
    REPORT.write_text(
        json.dumps(
            {"summary": summary, "replaced": replaced, "kept": kept, "empty_stt": empty_stt, "errors": errors},
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    print(json.dumps(summary, indent=2), flush=True)
    # Affiche l’exemple magasin de sport
    for row in replaced:
        if "magasin-de-sport" in row["audio"] or "magasin de sport" in row["new"].lower():
            print("MAGASIN", json.dumps(row, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
