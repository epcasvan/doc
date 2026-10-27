#!/usr/bin/env python3
"""Réaligne transcription + questions CO tcf-ss-* sur le contenu audio (STT).

Pour chaque exercice soutien, transcrit l’audio, score contre les candidats
du même niveau (+ banque `any`), et remplace transcription/questions si un
autre stem colle nettement mieux.
"""
from __future__ import annotations

import json
import re
import subprocess
import sys
import tempfile
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "src/content/tcf"
CANDIDATES = ROOT / "scripts/tcf-co-transcript-candidates.json"
REPORT = ROOT / "scripts/rematch-tcf-co-transcripts-report.json"

STOP = {
    "le", "la", "les", "un", "une", "des", "de", "du", "et", "a", "au", "aux",
    "je", "tu", "il", "elle", "on", "nous", "vous", "ils", "elles", "est", "suis",
    "c", "ce", "se", "sa", "son", "ses", "mon", "ton", "ma", "ta", "mes", "tes",
    "en", "y", "ne", "pas", "plus", "que", "qui", "dans", "pour", "avec", "sur",
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


def answer_hit(heard: str, questions: list) -> float:
    """Fraction des bonnes réponses dont un mot significatif apparaît dans l’audio."""
    ht = tokens(heard)
    if not questions or not ht:
        return 0.0
    hits = 0
    total = 0
    for q in questions:
        ans = None
        for c in q.get("choix") or []:
            if c.get("correct"):
                ans = c.get("texte")
                break
        if not ans:
            ans = q.get("reponse_modele") or q.get("formes", {}).get("lignes", {}).get("reponse_modele")
        if not ans:
            continue
        total += 1
        at = tokens(str(ans))
        if at & ht:
            hits += 1
    return hits / total if total else 0.0


def stt_audio(model, mp3: Path) -> str:
    with tempfile.TemporaryDirectory() as tmp:
        wav = Path(tmp) / "h.wav"
        # Intros déjà coupées : prendre le début + milieu
        subprocess.run(
            ["ffmpeg", "-y", "-i", str(mp3), "-t", "28", "-ac", "1", "-ar", "16000", str(wav)],
            capture_output=True,
            check=True,
        )
        segs, _ = model.transcribe(str(wav), language="fr", vad_filter=False)
        return " ".join((s.text or "").strip() for s in segs)


def stem_from_audio(audio: str) -> str | None:
    m = re.search(r"/(?:facile-a1|moyen-a2|difficile-b1)__(.+)\.mp3$", audio)
    return m.group(1) if m else None


def score_pair(heard: str, transcript: str, questions: list) -> float:
    return 0.7 * overlap(heard, transcript) + 0.3 * answer_hit(heard, questions)


def main() -> int:
    if not CANDIDATES.exists():
        print("Manquant:", CANDIDATES, file=sys.stderr)
        print("Lancez: SOUTIEN_ROOT=… node scripts/import-tcf-co-soutien.mjs", file=sys.stderr)
        return 1

    try:
        from faster_whisper import WhisperModel
    except ImportError:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "faster-whisper", "av==12.3.0"])
        from faster_whisper import WhisperModel

    cands = json.loads(CANDIDATES.read_text())
    model = WhisperModel("tiny", device="cpu", compute_type="int8")

    report: dict = {"fixed": [], "ok": [], "weak": []}
    for dossier, niveau_key, max_q in [
        ("a0-a1", "A1", 4),
        ("a1-a2", "A2", 6),
        ("a2-b1", "A2", 6),
    ]:
        path = CONTENT / dossier / "co.json"
        if not path.exists():
            continue
        data = json.loads(path.read_text())
        pool = {**cands["byLevel"].get("any", {}), **cands["byLevel"].get(niveau_key, {})}
        changed = False
        for ex in data:
            if not str(ex.get("id", "")).startswith("tcf-ss-"):
                continue
            audio = ex.get("support", {}).get("audio", "")
            stem = stem_from_audio(audio)
            if not stem:
                continue
            mp3 = ROOT / "public" / audio.lstrip("/")
            if not mp3.exists():
                continue
            heard = stt_audio(model, mp3)
            current_tx = ex.get("support", {}).get("transcription", "")
            cur_qs = ex.get("questions") or []
            cur_score = score_pair(heard, current_tx, cur_qs)

            best_stem, best_score, best = stem, cur_score, None
            for other_stem, doc in pool.items():
                sc = score_pair(heard, doc["transcript"], doc.get("questions") or [])
                # Exiger un gain net pour éviter les faux positifs
                if sc > best_score + 0.10 and sc >= 0.32:
                    best_score, best_stem, best = sc, other_stem, doc

            title_stem = stem if re.fullmatch(r"\d+", stem) else stem
            if best and best_stem != stem and best_score >= 0.32:
                ex["support"]["transcription"] = best["transcript"]
                ex["questions"] = (best.get("questions") or [])[:max_q]
                if re.fullmatch(r"\d+", stem):
                    ex["theme"] = f"Soutien scolaire · Dialogue {stem.zfill(3) if stem.isdigit() else stem}"
                changed = True
                report["fixed"].append(
                    {
                        "id": ex["id"],
                        "audio": audio,
                        "content_from": best_stem,
                        "score": round(best_score, 3),
                        "prev_score": round(cur_score, 3),
                        "heard": heard[:140],
                    }
                )
                print(f"FIX {ex['id']} ←{best_stem} ({cur_score:.2f}→{best_score:.2f})")
            elif cur_score >= 0.30:
                report["ok"].append({"id": ex["id"], "score": round(cur_score, 3)})
            else:
                report["weak"].append(
                    {
                        "id": ex["id"],
                        "audio": audio,
                        "score": round(cur_score, 3),
                        "heard": heard[:140],
                        "tx": current_tx[:100],
                    }
                )
                print(f"WEAK {ex['id']} {cur_score:.2f} :: {heard[:70]}")

        if changed:
            path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")

    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(
        f"fixed={len(report['fixed'])} ok={len(report['ok'])} weak={len(report['weak'])} → {REPORT}"
    )
    # Overrides manuels (ex. moyen-a2__047 pique-nique)
    ov = ROOT / "scripts/apply-tcf-co-overrides.mjs"
    if ov.exists():
        subprocess.run(["node", str(ov)], check=False)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
