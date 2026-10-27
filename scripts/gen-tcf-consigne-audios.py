#!/usr/bin/env python3
"""Génère les audios de consignes TCF CO (DeniseNeural −25 %, 96 kb/s)."""
from __future__ import annotations

import asyncio
import subprocess
import tempfile
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public/lib/audio/tcf/consignes"
VOICE = "fr-FR-DeniseNeural"
RATE = "-25%"

ITEMS: list[tuple[str, str]] = [
    (
        "quatre-messages.mp3",
        "Vous allez entendre quatre messages. Vous entendrez chaque message deux fois. "
        "Écoutez et écrivez le numéro du message sous l'image qui correspond. "
        "Vous avez 30 secondes entre chaque message. Attention ! Nous commençons.",
    ),
    ("message-numero-1.mp3", "Message numéro 1."),
    ("message-numero-2.mp3", "Message numéro 2."),
    ("message-numero-3.mp3", "Message numéro 3."),
    ("message-numero-4.mp3", "Message numéro 4."),
]


async def synth(text: str, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
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
    print(f"OK {dest.relative_to(ROOT)} ({dest.stat().st_size} o)")


async def main() -> None:
    for name, text in ITEMS:
        await synth(text, OUT / name)


if __name__ == "__main__":
    asyncio.run(main())
