#!/usr/bin/env python3
"""Audit STT strict : transcription + bonnes réponses vs audio.

- Rematch tcf-ss seulement si score élevé (évite les faux positifs).
- Séries de test : saute l’intro d’épreuve avant de scorer (pas de réécriture auto).
- Les tcf-ss irrécupérables sont listés pour retrait.
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
REPORT = ROOT / "scripts/audit-tcf-co-alignment-report.json"
REMOVE_LIST = ROOT / "scripts/tcf-co-removed-unaligned.json"

STOP = {
    "le", "la", "les", "un", "une", "des", "de", "du", "et", "a", "au", "aux",
    "je", "tu", "il", "elle", "on", "nous", "vous", "ils", "elles", "est", "suis",
    "c", "ce", "se", "sa", "son", "ses", "mon", "ton", "ma", "ta", "mes", "tes",
    "en", "y", "ne", "pas", "plus", "que", "qui", "dans", "pour", "avec", "sur",
    "oui", "non", "ou", "par",
}

INTRO_RE = re.compile(
    r"(preuve|epreuve|exercice|exercise|lisez|ecoutez|compr[eé]hension|"
    r"document|vous allez|avant chaque|il y a deux)",
    re.I,
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


def correct_answers(questions: list) -> list[str]:
    out = []
    for q in questions or []:
        for c in q.get("choix") or []:
            if c.get("correct"):
                out.append(str(c.get("texte") or ""))
                break
        else:
            ans = q.get("reponse_modele")
            if not ans:
                ans = (q.get("formes") or {}).get("lignes", {}).get("reponse_modele")
            if ans:
                out.append(str(ans))
    return out


def answer_hit_rate(heard: str, questions: list) -> float:
    ht = tokens(heard)
    answers = correct_answers(questions)
    if not answers or not ht:
        return 0.0
    hits = sum(1 for a in answers if tokens(a) & ht)
    return hits / len(answers)


def ffmpeg_wav(mp3: Path, wav: Path, ss: float = 0.0, t: float = 28.0) -> bool:
    cmd = ["ffmpeg", "-y"]
    if ss > 0:
        cmd += ["-ss", str(ss)]
    cmd += ["-i", str(mp3), "-t", str(t), "-ac", "1", "-ar", "16000", str(wav)]
    r = subprocess.run(cmd, capture_output=True)
    return r.returncode == 0 and wav.exists() and wav.stat().st_size > 1000


def stt_file(model, wav: Path) -> str:
    segs, _ = model.transcribe(str(wav), language="fr", vad_filter=False)
    return " ".join((s.text or "").strip() for s in segs).strip()


def strip_exam_intro(text: str) -> str:
    """Retire les consignes d’épreuve en tête d’une transcription STT longue."""
    # Association d’images / multi-dialogues : partir du premier « Dialogue 1 »
    m = re.search(r"(?i)\bdialogue\s*1\b", text)
    if m:
        return text[m.start() :].strip()
    # Couper après la dernière consigne typique avant le document
    parts = re.split(
        r"(?i)(?:lisez les questions[^.]*\.\s*)?(?:[eé]coutez(?: le document)?[^.]*\.\s*)?(?:puis r[eé]pondez\.?\s*)",
        text,
    )
    if len(parts) >= 2 and len(parts[-1].strip()) > 40:
        return parts[-1].strip()
    # Sinon : partir du premier bonjour/allô/salut après une consigne
    m = re.search(
        r"(?i)(?:exercice|exercise|document)\b.{0,80}?\b(bonjour|all[oô]|salut|coucou|madame|monsieur)\b",
        text,
    )
    if m:
        return text[m.start(1) :].strip()
    m = re.search(r"(?i)\b(bonjour|all[oô]|salut|coucou)\b", text)
    if m and m.start() > 20:
        return text[m.start() :].strip()
    return text


def stt_smart(model, mp3: Path, is_test_series: bool) -> str | None:
    with open(mp3, "rb") as f:
        if f.read(40).startswith(b"version https://git-lfs"):
            return None
    with tempfile.TemporaryDirectory() as tmp:
        wav = Path(tmp) / "h.wav"
        # Séries de test : prises longues (intro d’épreuve souvent 30–45 s)
        duration = 90.0 if is_test_series else 30.0
        if not ffmpeg_wav(mp3, wav, ss=0.0, t=duration):
            return None
        text = stt_file(model, wav)
        if not text:
            return None
        if is_test_series:
            text = strip_exam_intro(text)
        return text


def score(heard: str, transcript: str, questions: list) -> dict:
    tx = overlap(heard, transcript)
    ans = answer_hit_rate(heard, questions)
    combined = 0.65 * tx + 0.35 * ans
    return {"tx": round(tx, 3), "ans": round(ans, 3), "score": round(combined, 3)}


def main() -> int:
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "faster-whisper", "av==12.3.0"])
        from faster_whisper import WhisperModel

    model_size = sys.argv[1] if len(sys.argv) > 1 else "tiny"
    do_remove = "--remove-bad-ss" in sys.argv
    model = WhisperModel(model_size, device="cpu", compute_type="int8")

    all_cands: list[tuple[str, dict]] = []
    if CANDIDATES.exists():
        raw = json.loads(CANDIDATES.read_text())
        for level, bucket in raw.get("byLevel", {}).items():
            for stem, doc in bucket.items():
                all_cands.append((f"{level}:{stem}", doc))

    report: dict = {
        "ok": [],
        "warn": [],
        "bad": [],
        "fixed": [],
        "removed": [],
        "missing_audio": [],
        "model": model_size,
    }
    previously_removed = set()
    if REMOVE_LIST.exists():
        previously_removed = set(json.loads(REMOVE_LIST.read_text()))

    for dossier, max_q in [("a0-a1", 4), ("a1-a2", 6), ("a2-b1", 6)]:
        path = CONTENT / dossier / "co.json"
        data = json.loads(path.read_text())
        keep = []
        for ex in data:
            audio = (ex.get("support") or {}).get("audio") or ""
            transcript = (ex.get("support") or {}).get("transcription") or ""
            eid = ex.get("id", "")
            is_ss = str(eid).startswith("tcf-ss-")
            is_test = bool(re.match(r"^tcf-a\d", str(eid))) and not is_ss

            if not audio or not transcript or len(transcript) < 20:
                keep.append(ex)
                continue

            mp3 = ROOT / "public" / audio.lstrip("/")
            if not mp3.exists():
                report["missing_audio"].append({"id": eid, "audio": audio})
                keep.append(ex)
                continue

            heard = stt_smart(model, mp3, is_test_series=is_test)
            if not heard:
                report["missing_audio"].append({"id": eid, "audio": audio, "reason": "stt_failed"})
                keep.append(ex)
                continue

            sc = score(heard, transcript, ex.get("questions") or [])
            row = {
                "id": eid,
                "audio": audio,
                "ss": is_ss,
                **sc,
                "heard": heard[:140],
            }

            if is_ss and sc["score"] < 0.30:
                best_key, best_doc, best_sc = None, None, sc
                for key, doc in all_cands:
                    s2 = score(heard, doc["transcript"], doc.get("questions") or [])
                    # Strict : éviter les faux positifs
                    if (
                        s2["score"] >= 0.48
                        and s2["tx"] >= 0.40
                        and s2["ans"] >= 0.25
                        and s2["score"] > sc["score"] + 0.15
                    ):
                        if best_doc is None or s2["score"] > best_sc["score"]:
                            best_key, best_doc, best_sc = key, doc, s2
                if best_doc:
                    ex["support"]["transcription"] = best_doc["transcript"]
                    ex["questions"] = (best_doc.get("questions") or [])[:max_q]
                    report["fixed"].append(
                        {**row, "from": best_key, "new_score": best_sc["score"], "new_tx": best_sc["tx"], "new_ans": best_sc["ans"]}
                    )
                    print(f"FIX {eid} ←{best_key} ({sc['score']:.2f}→{best_sc['score']:.2f})")
                    keep.append(ex)
                    continue
                if do_remove and sc["score"] < 0.22:
                    report["removed"].append(row)
                    previously_removed.add(eid)
                    print(f"REMOVE {eid} score={sc['score']:.2f} :: {heard[:60]}")
                    continue

            if sc["score"] >= 0.34 or (sc["tx"] >= 0.38 and sc["ans"] >= 0.25):
                report["ok"].append(row)
            elif sc["score"] >= 0.22 or sc["tx"] >= 0.30:
                report["warn"].append(row)
                print(f"WARN {eid} score={sc['score']:.2f} tx={sc['tx']:.2f} ans={sc['ans']:.2f}")
            else:
                report["bad"].append(row)
                print(f"BAD  {eid} score={sc['score']:.2f} tx={sc['tx']:.2f} ans={sc['ans']:.2f} :: {heard[:60]}")
            keep.append(ex)

        path.write_text(json.dumps(keep, ensure_ascii=False, indent=2) + "\n")

    if do_remove and previously_removed:
        REMOVE_LIST.write_text(json.dumps(sorted(previously_removed), indent=2) + "\n")

    ov = ROOT / "scripts/apply-tcf-co-overrides.mjs"
    if ov.exists():
        subprocess.run(["node", str(ov)], check=False)

    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(
        f"ok={len(report['ok'])} warn={len(report['warn'])} bad={len(report['bad'])} "
        f"fixed={len(report['fixed'])} removed={len(report['removed'])} "
        f"missing={len(report['missing_audio'])} → {REPORT}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
