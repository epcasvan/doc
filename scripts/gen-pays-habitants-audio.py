#!/usr/bin/env python3
"""Génère les MP3 manquants (DeniseNeural −25 %) pour pays + habitants."""
from __future__ import annotations

import asyncio
import subprocess
import tempfile
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parents[1]
VOICE = 'fr-FR-DeniseNeural'
RATE = '-25%'

# slug fichier → texte lu (orthographe française)
TTS_TEXT = {
    'erythree': 'érythrée',
    'etats-unis': 'États-Unis',
    'grece': 'Grèce',
    'corée-du-sud': 'Corée du Sud',
    'sri-lanka': 'Sri Lanka',
    'pays-bas': 'Pays-Bas',
    'éthiopie': 'éthiopie',
}


def speak_text(slug: str) -> str:
    if slug in TTS_TEXT:
        return TTS_TEXT[slug]
    return slug.replace('-', ' ')


async def synth(text: str, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        raw = Path(tmp) / 'raw.mp3'
        await edge_tts.Communicate(text, VOICE, rate=RATE).save(str(raw))
        subprocess.run(
            [
                'ffmpeg', '-y', '-loglevel', 'error', '-i', str(raw),
                '-codec:a', 'libmp3lame', '-b:a', '96k', str(dest),
            ],
            check=True,
        )
    print('OK', dest.relative_to(ROOT), '←', text)


async def main() -> None:
    jobs: list[tuple[str, Path]] = []

    pays_img = ROOT / 'public/lib/images/vocabulaire/pays'
    pays_aud = ROOT / 'public/lib/audio/vocabulaire/pays'
    for img in sorted(pays_img.glob('*.webp')):
        if img.stem == 'drapeau':
            continue
        dest = pays_aud / f'{img.stem}.mp3'
        if not dest.exists():
            jobs.append((speak_text(img.stem), dest))

    pres_img = ROOT / 'public/lib/images/vocabulaire/presenter'
    pres_aud = ROOT / 'public/lib/audio/vocabulaire/presenter'
    for img in sorted(pres_img.glob('*.webp')):
        dest = pres_aud / f'{img.stem}.mp3'
        if not dest.exists():
            jobs.append((speak_text(img.stem), dest))

    print(f'{len(jobs)} audios à générer')
    # Séquentiel pour éviter de saturer edge-tts
    for text, dest in jobs:
        await synth(text, dest)
    print('done')


if __name__ == '__main__':
    asyncio.run(main())
