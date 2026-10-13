#!/usr/bin/env python3
"""Génère les MP3 manquants Alphabétisation / Soutien (DeniseNeural si possible, sinon gTTS)."""
from __future__ import annotations

import asyncio
import json
import re
import subprocess
import tempfile
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VOICE = "fr-FR-DeniseNeural"
RATE = "-25%"
AUDIO_ROOT = ROOT / "public/lib/audio/vocabulaire"
SYLL_ROOT = ROOT / "public/lib/audio/syllabes"
STEM_INDEX = ROOT / "src/francais/soutien/audio-stem-index.json"


def slugify(label: str) -> str:
    s = unicodedata.normalize("NFD", label)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    s = s.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s


def write_stem_index() -> dict[str, str]:
    entries: dict[str, str] = {}
    for p in sorted(AUDIO_ROOT.rglob("*.mp3")):
        if p.stat().st_size < 500:
            continue
        rel = "/" + str(p.relative_to(ROOT / "public")).replace("\\", "/")
        stem_raw = p.stem.lower()
        stem_ascii = slugify(p.stem)
        # ASCII key first (lookup principal), garder aussi la clé brute accentuée
        if stem_ascii not in entries:
            entries[stem_ascii] = rel
        if stem_raw not in entries:
            entries[stem_raw] = rel
    for p in sorted(SYLL_ROOT.rglob("*.mp3")) if SYLL_ROOT.exists() else []:
        if p.stat().st_size < 500:
            continue
        rel = "/" + str(p.relative_to(ROOT / "public")).replace("\\", "/")
        stem_raw = p.stem.lower()
        stem_ascii = slugify(p.stem)
        key_ascii = f"syll:{stem_ascii}"
        key_raw = f"syll:{stem_raw}"
        if key_ascii not in entries:
            entries[key_ascii] = rel
        if key_raw not in entries:
            entries[key_raw] = rel
        # aussi slug simple pour résolution syllabe
        if stem_ascii not in entries:
            entries[stem_ascii] = rel
        if stem_raw not in entries:
            entries[stem_raw] = rel
    STEM_INDEX.write_text(
        json.dumps(entries, ensure_ascii=False, indent=0, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    return entries


def collect_word_jobs(existing: dict[str, str]) -> list[tuple[str, Path]]:
    """Labels Voc + pools lecture → chemin cible manquant."""
    jobs: list[tuple[str, Path]] = []
    seen: set[str] = set()

    def add(label: str, dest: Path) -> None:
        key = label.strip().lower()
        if not key or key in seen:
            return
        seen.add(key)
        ascii_slug = slugify(label)
        if ascii_slug in existing or label.lower() in existing:
            return
        if dest.exists() and dest.stat().st_size > 500:
            return
        jobs.append((label.strip(), dest))

    # Banques Voc (imageSrc → même thème/slug)
    for f in (ROOT / "src/francais/vocab-banks").glob("*.ts"):
        text = f.read_text(encoding="utf-8")
        for m in re.finditer(
            r'"label"\s*:\s*"([^"]+)"[\s\S]*?"imageSrc"\s*:\s*"/lib/images/vocabulaire/([^/]+)/([^/"]+)\.([^"]+)"',
            text,
        ):
            label, theme, stem = m.group(1), m.group(2), m.group(3)
            add(label, AUDIO_ROOT / theme / f"{stem}.mp3")

    # Pools lecture / graphemes (sans image) → theme lecture
    for rel in (
        "src/francais/soutien/lecture-word-items.ts",
        "src/francais/soutien/lecture-word-items-extra.ts",
        "src/francais/soutien/grapheme-word-pools.ts",
    ):
        path = ROOT / rel
        if not path.exists():
            continue
        text = path.read_text(encoding="utf-8")
        for m in re.finditer(r'label:\s*"([^"]+)"', text):
            label = m.group(1)
            add(label, AUDIO_ROOT / "lecture" / f"{slugify(label)}.mp3")
        for m in re.finditer(r'"([a-zàâäéèêëïîôöùûüçœæA-ZÀÂÄÉÈÊËÏÎÔÖÙÛÜÇŒÆ][a-zàâäéèêëïîôöùûüçœæ-]{1,})"', text):
            # grapheme pools: quoted words
            label = m.group(1)
            if len(label) < 2:
                continue
            add(label, AUDIO_ROOT / "lecture" / f"{slugify(label)}.mp3")

    return jobs


def collect_syllable_jobs(existing: dict[str, str]) -> list[tuple[str, Path]]:
    """Syllabes courtes présentes dans les banques Soutien."""
    jobs: list[tuple[str, Path]] = []
    seen: set[str] = set()
    SYLL_ROOT.mkdir(parents=True, exist_ok=True)
    texts: list[str] = []
    for f in (ROOT / "src/francais/soutien").glob("*.ts"):
        texts.append(f.read_text(encoding="utf-8"))
    blob = "\n".join(texts)
    # Extraire des syllabes type "pa", "bra", "eau" entre guillemets (2–4 lettres)
    for m in re.finditer(r'"([a-zàâäéèêëïîôöùûüyA-ZÀÂÄÉÈÊËÏÎÔÖÙÛÜY]{1,4})"', blob):
        syll = m.group(1).lower()
        if not re.fullmatch(r"[a-zàâäéèêëïîôöùûüy]{1,4}", syll):
            continue
        if syll in seen:
            continue
        seen.add(syll)
        ascii_slug = slugify(syll)
        if ascii_slug in existing or f"syll:{ascii_slug}" in existing:
            continue
        dest = SYLL_ROOT / f"{ascii_slug}.mp3"
        if dest.exists() and dest.stat().st_size > 500:
            continue
        jobs.append((syll, dest))
    return jobs


async def synth_edge(text: str, dest: Path) -> bool:
    try:
        import edge_tts
    except ImportError:
        return False
    try:
        with tempfile.TemporaryDirectory() as tmp:
            raw = Path(tmp) / "raw.mp3"
            await edge_tts.Communicate(text, VOICE, rate=RATE).save(str(raw))
            subprocess.run(
                [
                    "ffmpeg",
                    "-y",
                    "-loglevel",
                    "error",
                    "-i",
                    str(raw),
                    "-codec:a",
                    "libmp3lame",
                    "-b:a",
                    "96k",
                    str(dest),
                ],
                check=True,
            )
        return True
    except Exception:
        return False


def synth_gtts(text: str, dest: Path) -> bool:
    try:
        from gtts import gTTS
    except ImportError:
        return False
    try:
        with tempfile.TemporaryDirectory() as tmp:
            raw = Path(tmp) / "raw.mp3"
            gTTS(text=text, lang="fr").save(str(raw))
            subprocess.run(
                [
                    "ffmpeg",
                    "-y",
                    "-loglevel",
                    "error",
                    "-i",
                    str(raw),
                    "-codec:a",
                    "libmp3lame",
                    "-b:a",
                    "96k",
                    str(dest),
                ],
                check=True,
            )
        return True
    except Exception as e:
        print("gTTS fail", text, e)
        return False


def is_lfs_pointer(path: Path) -> bool:
    if not path.exists() or path.stat().st_size > 800:
        return False
    try:
        head = path.read_text(encoding="utf-8", errors="ignore")[:120]
    except Exception:
        return False
    return head.startswith("version https://git-lfs.github.com/spec/")


async def synth(text: str, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    # Ne jamais écraser un vrai MP3 ni un pointeur LFS déjà suivi.
    if dest.exists() and (dest.stat().st_size > 500 or is_lfs_pointer(dest)):
        print("SKIP", dest.relative_to(ROOT))
        return
    if await synth_edge(text, dest):
        print("OK edge", dest.relative_to(ROOT), "←", text)
        return
    if synth_gtts(text, dest):
        print("OK gtts", dest.relative_to(ROOT), "←", text)
        return
    print("FAIL", text, "→", dest.relative_to(ROOT))


async def main() -> None:
    existing = write_stem_index()
    word_jobs = collect_word_jobs(existing)
    syll_jobs = collect_syllable_jobs(existing)
    # Prioriser quelques mots signalés
    priority = {"séquoia", "sequoia", "séparé", "separe"}
    word_jobs.sort(key=lambda j: (0 if j[0].lower() in priority else 1, j[0]))
    print(f"{len(word_jobs)} mots · {len(syll_jobs)} syllabes à générer")
    for text, dest in word_jobs + syll_jobs:
        await synth(text, dest)
    write_stem_index()
    print("index", STEM_INDEX.relative_to(ROOT))


if __name__ == "__main__":
    asyncio.run(main())
