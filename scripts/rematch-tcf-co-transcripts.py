#!/usr/bin/env python3
"""Réaligne transcription + questions CO quand le stem numérique A1/A2 est faux.

Pour chaque exercice tcf-ss-* dont l’audio est `facile-a1__NNN` / `moyen-a2__NNN`,
STT les ~15 s après éventuelle intro, score contre toutes les transcriptions du
même niveau, et si un autre stem score nettement mieux, on y bascule
transcription + pool de questions (via un export JSON produit par l’import).
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


def norm(s: str) -> str:
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9 ]+", " ", s)


def overlap(a: str, b: str) -> float:
    aw, bw = set(norm(a).split()), set(norm(b).split())
    aw -= {"le", "la", "les", "un", "une", "des", "de", "du", "et", "a", "au", "aux", "je", "tu", "il", "elle", "on", "nous", "vous", "ils", "elles", "est", "suis", "c", "est"}
    bw -= {"le", "la", "les", "un", "une", "des", "de", "du", "et", "a", "au", "aux", "je", "tu", "il", "elle", "on", "nous", "vous", "ils", "elles", "est", "suis", "c", "est"}
    if not aw or not bw:
        return 0.0
    return len(aw & bw) / max(1, min(len(aw), len(bw)))


def stt_head(model, mp3: Path) -> str:
    with tempfile.TemporaryDirectory() as tmp:
        wav = Path(tmp) / "h.wav"
        # saute ~6 s d’intro typique, prend 16 s de contenu
        subprocess.run(
            ["ffmpeg", "-y", "-ss", "5.5", "-i", str(mp3), "-t", "16", "-ac", "1", "-ar", "16000", str(wav)],
            capture_output=True,
            check=True,
        )
        segs, _ = model.transcribe(str(wav), language="fr", vad_filter=False)
        return " ".join((s.text or "").strip() for s in segs)


def main() -> int:
    if not CANDIDATES.exists():
        print("Manquant:", CANDIDATES, file=sys.stderr)
        print("Lancez d’abord: node scripts/export-tcf-co-candidates.mjs", file=sys.stderr)
        return 1

    try:
        from faster_whisper import WhisperModel
    except ImportError:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "faster-whisper", "av==12.3.0"])
        from faster_whisper import WhisperModel

    cands = json.loads(CANDIDATES.read_text())
    by_level = cands["byLevel"]  # A1/A2 -> {stem: {transcript, questions}}
    model = WhisperModel("tiny", device="cpu", compute_type="int8")

    report = {"fixed": [], "ok": [], "no_better": []}
    for dossier, niveau_key in [("a0-a1", "A1"), ("a1-a2", "A2")]:
        path = CONTENT / dossier / "co.json"
        data = json.loads(path.read_text())
        pool = by_level.get(niveau_key, {})
        changed = False
        for ex in data:
            if not str(ex.get("id", "")).startswith("tcf-ss-"):
                continue
            audio = ex.get("support", {}).get("audio", "")
            m = re.search(r"/(facile-a1|moyen-a2)__(\d+)\.mp3$", audio)
            if not m:
                continue
            stem = m.group(2).zfill(3)
            mp3 = ROOT / "public" / audio.lstrip("/")
            if not mp3.exists():
                continue
            heard = stt_head(model, mp3)
            current_tx = ex.get("support", {}).get("transcription", "")
            cur_score = overlap(heard, current_tx)
            best_stem, best_score, best = stem, cur_score, None
            for other_stem, doc in pool.items():
                if not re.fullmatch(r"\d{1,3}", other_stem) and not re.fullmatch(r"\d{3}", other_stem):
                    continue
                sc = overlap(heard, doc["transcript"])
                if sc > best_score + 0.12:
                    best_score, best_stem, best = sc, other_stem.zfill(3), doc
            if best and best_stem != stem.zfill(3) and best_score >= 0.35:
                ex["support"]["transcription"] = best["transcript"]
                # garder le même nombre de questions que le niveau
                max_q = 4 if dossier == "a0-a1" else 6
                ex["questions"] = best["questions"][:max_q]
                # theme Dialogue NNN → stem audio réel (fichier), noter le contenu
                ex["theme"] = f"Soutien scolaire · Dialogue {stem}"
                changed = True
                report["fixed"].append(
                    {
                        "id": ex["id"],
                        "audio": audio,
                        "from_stem_content": best_stem,
                        "score": round(best_score, 3),
                        "prev_score": round(cur_score, 3),
                        "heard": heard[:120],
                    }
                )
                print(f"FIX {ex['id']} content←{best_stem} ({cur_score:.2f}→{best_score:.2f})")
            elif cur_score >= 0.28:
                report["ok"].append({"id": ex["id"], "score": round(cur_score, 3)})
            else:
                report["no_better"].append(
                    {"id": ex["id"], "score": round(cur_score, 3), "heard": heard[:120], "tx": current_tx[:80]}
                )
                print(f"WEAK {ex['id']} score={cur_score:.2f} :: {heard[:60]}")
        if changed:
            path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")

    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(
        f"fixed={len(report['fixed'])} ok={len(report['ok'])} weak={len(report['no_better'])} → {REPORT}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
