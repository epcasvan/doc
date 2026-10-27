#!/usr/bin/env python3
"""Génère des cadrans analogiques minimalistes (style B/C) toutes les 5 minutes.

Base unique : 00:00 → 11:55 (144 images). Puis copies pour 12:00–23:55
(midi / après-midi / soir) — même dessin 12 h, noms français distincts.

  python3 scripts/generate-heure-horloges.py
"""
from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parents[1] / "public" / "lib" / "images" / "vocabulaire" / "heure-horloge"
W, H = 800, 600
CX, CY = W // 2, H // 2
R = 220

HOUR_WORDS = {
    0: "minuit",
    1: "une",
    2: "deux",
    3: "trois",
    4: "quatre",
    5: "cinq",
    6: "six",
    7: "sept",
    8: "huit",
    9: "neuf",
    10: "dix",
    11: "onze",
    12: "midi",
    13: "treize",
    14: "quatorze",
    15: "quinze",
    16: "seize",
    17: "dix-sept",
    18: "dix-huit",
    19: "dix-neuf",
    20: "vingt",
    21: "vingt-et-une",
    22: "vingt-deux",
    23: "vingt-trois",
}

MIN_WORDS = {
    0: None,
    5: "cinq",
    10: "dix",
    15: "quinze",
    20: "vingt",
    25: "vingt-cinq",
    30: "trente",
    35: "trente-cinq",
    40: "quarante",
    45: "quarante-cinq",
    50: "cinquante",
    55: "cinquante-cinq",
}


def slug_fr(h24: int, minute: int) -> str:
    """Nom de fichier français (sans .webp)."""
    hw = HOUR_WORDS[h24]
    mw = MIN_WORDS[minute]
    if h24 in (0, 12):
        # minuit / midi
        return hw if mw is None else f"{hw}-{mw}"
    if h24 == 1 or h24 == 13:
        # une heure / treize heures
        base = "une-heure" if h24 == 1 else "treize-heures"
        return base if mw is None else f"{base}-{mw}"
    if h24 == 21:
        base = "vingt-et-une-heures"
        return base if mw is None else f"{base}-{mw}"
    base = f"{hw}-heures"
    return base if mw is None else f"{base}-{mw}"


def draw_clock(hour12: int, minute: int) -> Image.Image:
    """Cadran 12 h minimaliste : traits, aiguilles, pas de chiffres."""
    img = Image.new("RGB", (W, H), (255, 255, 255))
    d = ImageDraw.Draw(img)

    # Cercle extérieur
    d.ellipse((CX - R, CY - R, CX + R, CY + R), outline=(30, 30, 30), width=6)

    # Graduations heures (12) + minutes (60 fines)
    for i in range(60):
        ang = math.radians(i * 6 - 90)
        outer = R - 8
        if i % 5 == 0:
            inner = R - 36
            width = 5
        else:
            inner = R - 18
            width = 2
        x1 = CX + inner * math.cos(ang)
        y1 = CY + inner * math.sin(ang)
        x2 = CX + outer * math.cos(ang)
        y2 = CY + outer * math.sin(ang)
        d.line((x1, y1, x2, y2), fill=(30, 30, 30), width=width)

    # Aiguilles (heure + minutes)
    h = hour12 % 12
    # Minute hand: 6° per minute
    min_ang = math.radians(minute * 6 - 90)
    # Hour hand: 30° per hour + 0.5° per minute
    hour_ang = math.radians(h * 30 + minute * 0.5 - 90)

    def hand(ang: float, length: float, width: int) -> None:
        x = CX + length * math.cos(ang)
        y = CY + length * math.sin(ang)
        d.line((CX, CY, x, y), fill=(20, 20, 20), width=width)

    hand(hour_ang, R * 0.52, 10)
    hand(min_ang, R * 0.78, 6)

    # Axe central
    d.ellipse((CX - 10, CY - 10, CX + 10, CY + 10), fill=(20, 20, 20))
    return img


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    # Bases uniques 0h–11h55
    bases: dict[tuple[int, int], Image.Image] = {}
    for h in range(12):
        for m in range(0, 60, 5):
            bases[(h, m)] = draw_clock(h, m)

    written = 0
    for h24 in range(24):
        h12 = h24 % 12
        for m in range(0, 60, 5):
            name = slug_fr(h24, m) + ".webp"
            path = OUT / name
            bases[(h12, m)].save(path, "WEBP", quality=85, method=4)
            written += 1

    # Alias utiles déjà référencés dans les banques (orthographes historiques)
    aliases = {
        "douze-heures.webp": (12, 0),
        "douze-heures-trente.webp": (12, 30),
        "midi-et-quart.webp": (12, 15),
        "midi-et-demi.webp": (12, 30),
        "une-heure-et-quart.webp": (1, 15),
        "une-heure-et-demi.webp": (1, 30),  # if exists in banks
        "deux-heures-et-demie.webp": (2, 30),
        "onze-heures-et-demie.webp": (11, 30),
        "trois-heures-moins-le-quart.webp": (2, 45),  # 3h moins le quart = 2h45
        "dix-heures-moins-cinq.webp": (9, 55),
        "neuf-heures-moins-dix.webp": (8, 50),
        "huit-heures-moins-vingt.webp": (7, 40),
    }
    for alias, (h24, m) in aliases.items():
        bases[(h24 % 12, m)].save(OUT / alias, "WEBP", quality=85, method=4)
        written += 1

    print(f"{written} fichiers → {OUT}")


if __name__ == "__main__":
    main()
