#!/usr/bin/env python3
"""Convertit une image générée en WebP 800×600 fond blanc (vocabulaire)."""
from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image

W, H = 800, 600


def to_vocab_webp(src: Path, dest: Path) -> None:
    im = Image.open(src).convert('RGBA')
    # Fond blanc + contain
    canvas = Image.new('RGBA', (W, H), (255, 255, 255, 255))
    # Recadrage léger si marges
    bbox = im.getbbox()
    if bbox:
        im = im.crop(bbox)
    ratio = min(W / im.width, H / im.height)
    nw, nh = max(1, int(im.width * ratio)), max(1, int(im.height * ratio))
    im = im.resize((nw, nh), Image.Resampling.LANCZOS)
    x, y = (W - nw) // 2, (H - nh) // 2
    canvas.paste(im, (x, y), im)
    dest.parent.mkdir(parents=True, exist_ok=True)
    canvas.convert('RGB').save(dest, 'WEBP', quality=85, method=6)
    print(f'OK {dest} ({W}x{H})')


if __name__ == '__main__':
    if len(sys.argv) != 3:
        print('Usage: install-habitant-webp.py <src> <dest.webp>', file=sys.stderr)
        sys.exit(2)
    to_vocab_webp(Path(sys.argv[1]), Path(sys.argv[2]))
