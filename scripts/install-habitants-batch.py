#!/usr/bin/env python3
"""Installe les JPG/PNG habitant-* depuis /opt/cursor/artifacts/assets/ vers presenter/."""
from __future__ import annotations

import re
import sys
from pathlib import Path

from PIL import Image

W, H = 800, 600
ASSETS = Path('/opt/cursor/artifacts/assets')
DEST_DIR = Path('public/lib/images/vocabulaire/presenter')

# artifact stem (ascii) → fichier webp (accents FR)
MAP = {
    'afghan': 'afghan',
    'afghane': 'afghane',
    'albanais': 'albanais',
    'albanaise': 'albanaise',
    'algerien': 'algérien',
    'algerienne': 'algérienne',
    'allemand': 'allemand',
    'allemande': 'allemande',
    'americain': 'américain',
    'americaine': 'américaine',
    'anglais': 'anglais',
    'anglaise': 'anglaise',
    'autrichien': 'autrichien',
    'autrichienne': 'autrichienne',
    'bangladais': 'bangladais',
    'bangladaise': 'bangladaise',
    'belge': 'belge',
    'bosniaque': 'bosniaque',
    'bresilien': 'brésilien',
    'bresilienne': 'brésilienne',
    'camerounais': 'camerounais',
    'camerounaise': 'camerounaise',
    'canadien': 'canadien',
    'canadienne': 'canadienne',
    'chinois': 'chinois',
    'chinoise': 'chinoise',
    'colombien': 'colombien',
    'colombienne': 'colombienne',
    'congolais': 'congolais',
    'congolaise': 'congolaise',
    'coreen': 'coréen',
    'coreenne': 'coréenne',
    'croate': 'croate',
    'danois': 'danois',
    'danoise': 'danoise',
    'erythreen': 'érythréen',
    'erythreenne': 'érythréenne',
    'espagnol': 'espagnol',
    'espagnole': 'espagnole',
    'ethiopien': 'éthiopien',
    'ethiopienne': 'éthiopienne',
    'francais': 'français',
    'francaise': 'française',
    'grec': 'grec',
    'grecque': 'grecque',
    'indien': 'indien',
    'indienne': 'indienne',
    'irakien': 'irakien',
    'irakienne': 'irakienne',
    'iranien': 'iranien',
    'iranienne': 'iranienne',
    'irlandais': 'irlandais',
    'irlandaise': 'irlandaise',
    'italien': 'italien',
    'italienne': 'italienne',
    'japonais': 'japonais',
    'japonaise': 'japonaise',
    'kosovar': 'kosovar',
    'kosovare': 'kosovare',
    'libanais': 'libanais',
    'libanaise': 'libanaise',
    'malien': 'malien',
    'malienne': 'malienne',
    'marocain': 'marocain',
    'marocaine': 'marocaine',
    'mexicain': 'mexicain',
    'mexicaine': 'mexicaine',
    'nigerian': 'nigérian',
    'nigeriane': 'nigériane',
    'norvegien': 'norvégien',
    'norvegienne': 'norvégienne',
    'pakistanais': 'pakistanais',
    'pakistanaise': 'pakistanaise',
    'neerlandais': 'néerlandais',
    'neerlandaise': 'néerlandaise',
    'philippin': 'philippin',
    'philippine': 'philippine',
    'polonais': 'polonais',
    'polonaise': 'polonaise',
    'portugais': 'portugais',
    'portugaise': 'portugaise',
    'roumain': 'roumain',
    'roumaine': 'roumaine',
    'senegalais': 'sénégalais',
    'senegalaise': 'sénégalaise',
    'serbe': 'serbe',
    'somalien': 'somalien',
    'somalienne': 'somalienne',
    'soudanais': 'soudanais',
    'soudanaise': 'soudanaise',
    'sri-lankais': 'sri-lankais',
    'sri-lankaise': 'sri-lankaise',
    'suedois': 'suédois',
    'suedoise': 'suédoise',
    'suisse': 'suisse',
    'syrien': 'syrien',
    'syrienne': 'syrienne',
    'thailandais': 'thaïlandais',
    'thailandaise': 'thaïlandaise',
    'tunisien': 'tunisien',
    'tunisienne': 'tunisienne',
    'turc': 'turc',
    'turque': 'turque',
    'ukrainien': 'ukrainien',
    'ukrainienne': 'ukrainienne',
    'vietnamien': 'vietnamien',
    'vietnamienne': 'vietnamienne',
    'russe': 'russe',
}


def to_webp(src: Path, dest: Path) -> None:
    im = Image.open(src).convert('RGBA')
    canvas = Image.new('RGBA', (W, H), (255, 255, 255, 255))
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


def main() -> int:
    DEST_DIR.mkdir(parents=True, exist_ok=True)
    installed = 0
    for path in sorted(ASSETS.glob('habitant-*')):
        stem = path.stem  # habitant-francais
        key = stem.replace('habitant-', '', 1)
        # also accept without prefix if named exactly
        label = MAP.get(key)
        if not label:
            print('skip unknown', path.name)
            continue
        dest = DEST_DIR / f'{label}.webp'
        if dest.exists() and dest.stat().st_size > 1000:
            # refresh if artifact newer
            if dest.stat().st_mtime >= path.stat().st_mtime:
                continue
        to_webp(path, dest)
        print('OK', dest)
        installed += 1
    print(f'installed/updated {installed}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
