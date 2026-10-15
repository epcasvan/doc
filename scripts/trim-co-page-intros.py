#!/usr/bin/env python3
"""Coupe les annonces pédagogiques en tête des audios CO TCF.

Détecte les intros du type « Page 45, exercice 4 », « Activité 12 »,
« Exercice 17 », « Leçon 2, page 17… » via STT (faster-whisper tiny) +
silence, puis réécrit le MP3 sans cette tête.
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
AUDIO_ROOT = ROOT / "public/lib/audio/tcf/co"
REPORT = ROOT / "scripts/trim-co-page-intros-report.json"

# Whisper entend souvent « Page » comme « Pâche » / « Bâge ».
INTRO_HEAD = re.compile(
    r"^\s*("
    r"page|p[aâàä]che|b[aâàä]ge|pas\s*je|"
    r"le[cç]on|le\s*son|"
    r"activit[eé]|exercice|exercise|"
    r"compr[eé]hension|partie|document|"
    r"pour\s+communiquer"
    r")\b",
    re.I,
)


def energy_cut(wav: Path, max_scan: float = 14.0) -> float | None:
    import wave

    with wave.open(str(wav), "rb") as w:
        sr = w.getframerate()
        x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768.0
    win = max(1, int(0.05 * sr))
    thr = 0.02
    rms = [
        (i / sr, float(np.sqrt(np.mean(x[i : i + win] ** 2))))
        for i in range(0, len(x) - win, win)
    ]
    regions: list[tuple[float, float]] = []
    on = False
    start = 0.0
    for t, r in rms:
        if r > thr and not on:
            on = True
            start = t
        elif r <= thr and on:
            on = False
            regions.append((start, t))
    if on and rms:
        regions.append((start, rms[-1][0]))
    best = None
    for i in range(len(regions) - 1):
        a, b = regions[i][1], regions[i + 1][0]
        gap = b - a
        if regions[i][0] < max_scan and gap >= 0.7:
            if best is None or gap > best[2]:
                best = (a, b, gap)
    if best and best[2] >= 0.85:
        return round(float(best[1]), 2)
    return None


def to_wav(mp3: Path, wav: Path, duration: float | None = None) -> None:
    cmd = ["ffmpeg", "-y", "-i", str(mp3), "-ac", "1", "-ar", "16000"]
    if duration is not None:
        cmd += ["-t", str(duration)]
    cmd.append(str(wav))
    subprocess.run(cmd, capture_output=True, check=True)


def detect_cut(model, mp3: Path) -> tuple[float | None, str]:
    with tempfile.TemporaryDirectory() as tmp:
        head = Path(tmp) / "head.wav"
        to_wav(mp3, head, 14.0)
        segments, _ = model.transcribe(str(head), language="fr", vad_filter=False, word_timestamps=True)
        segs = list(segments)
        if not segs:
            return None, ""

        # Fin d’intro = fin des premiers segments « méta », sinon silence énergie.
        intro_end = None
        heard_parts: list[str] = []
        for i, seg in enumerate(segs):
            text = (seg.text or "").strip()
            heard_parts.append(text)
            if i == 0 and not INTRO_HEAD.search(text):
                # Pas d’annonce détectée en tête.
                ec = energy_cut(head)
                # Si silence net mais pas d’intro STT, on ne coupe pas (contenu utile).
                return None, " ".join(heard_parts)
            if INTRO_HEAD.search(text) or (
                i > 0
                and re.search(r"\b(exercice|activit[eé]|page|document)\b", text, re.I)
                and len(text) < 80
            ):
                intro_end = float(seg.end)
                # Si le même segment contient déjà du dialogue après la virgule méta…
                # ex. « Exercice 17. Salut, c'est Ismail »
                if i == 0 and re.search(
                    r"(exercice|activit[eé]|page)\s*\d+.*[.!?]\s+\S{3,}",
                    text,
                    re.I,
                ):
                    # Couper juste après le premier point / fin de phrase méta.
                    m = re.search(
                        r"(?i)(page[^.!?]{0,40}|le[cç]on[^.!?]{0,40}|activit[eé]\s*\d+|exercice\s*\d+|exercise\s*\d+)[.!]?",
                        text,
                    )
                    if m and seg.words:
                        # approx: proportion de caractères
                        ratio = min(1.0, (m.end()) / max(1, len(text)))
                        intro_end = float(seg.start) + (float(seg.end) - float(seg.start)) * ratio
                        break
                continue
            # Premier segment de contenu réel
            break

        if intro_end is None:
            return None, " ".join(heard_parts)

        ec = energy_cut(head)
        cut = intro_end
        if ec is not None and abs(ec - intro_end) < 3.5:
            # Silence après l’annonce : préférer le début du discours principal.
            cut = max(intro_end, ec) if ec >= intro_end - 0.4 else ec
            if ec >= intro_end - 0.15:
                cut = ec
        # Garde-fous
        if cut < 1.2 or cut > 12.5:
            return None, " ".join(heard_parts)
        return round(cut, 2), " ".join(heard_parts)


def trim_mp3(mp3: Path, cut: float, dry_run: bool) -> None:
    if dry_run:
        return
    with tempfile.TemporaryDirectory() as tmp:
        out = Path(tmp) / "out.mp3"
        subprocess.run(
            [
                "ffmpeg",
                "-y",
                "-ss",
                str(cut),
                "-i",
                str(mp3),
                "-acodec",
                "libmp3lame",
                "-q:a",
                "4",
                str(out),
            ],
            capture_output=True,
            check=True,
        )
        out.replace(mp3)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--only", default="", help="Sous-chaîne du nom de fichier")
    args = ap.parse_args()

    try:
        from faster_whisper import WhisperModel
    except ImportError:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "faster-whisper", "av==12.3.0"])
        from faster_whisper import WhisperModel

    model = WhisperModel("tiny", device="cpu", compute_type="int8")
    # Uniquement les audios soutien (facile-a1__*, moyen-a2__*, difficile-b1__*).
    # Les séries de test (`a-la-plage.mp3`, …) gardent leurs consignes orales.
    files = sorted(
        f
        for f in AUDIO_ROOT.glob("*/*.mp3")
        if f.name.startswith(("facile-a1__", "moyen-a2__", "difficile-b1__"))
    )
    if args.only:
        files = [f for f in files if args.only in f.name]
    if args.limit:
        files = files[: args.limit]

    report = {"trimmed": [], "skipped": [], "errors": []}
    for i, mp3 in enumerate(files, 1):
        rel = str(mp3.relative_to(ROOT))
        try:
            cut, heard = detect_cut(model, mp3)
            if cut is None:
                report["skipped"].append({"file": rel, "heard": heard[:160]})
                print(f"[{i}/{len(files)}] skip {mp3.name}")
                continue
            trim_mp3(mp3, cut, args.dry_run)
            report["trimmed"].append({"file": rel, "cut": cut, "heard": heard[:160]})
            print(f"[{i}/{len(files)}] cut {cut:5.2f}s {mp3.name} :: {heard[:70]}")
        except Exception as e:  # noqa: BLE001
            report["errors"].append({"file": rel, "error": str(e)})
            print(f"[{i}/{len(files)}] ERROR {mp3.name}: {e}", file=sys.stderr)

    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(
        f"Done. trimmed={len(report['trimmed'])} skipped={len(report['skipped'])} "
        f"errors={len(report['errors'])} → {REPORT}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
