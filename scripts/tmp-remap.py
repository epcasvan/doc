import json
import re
import subprocess
import unicodedata
from pathlib import Path

import av
import numpy as np
from faster_whisper import WhisperModel

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / "scripts/tmp-remap-stt.json"
STOP = {"le", "la", "les", "un", "une", "des", "de", "du", "et", "je", "tu", "il", "elle", "on", "nous", "vous",
        "est", "ce", "en", "ne", "pas", "que", "qui", "dans", "pour", "avec", "sur", "oui", "non"}


def toks(s):
    s = unicodedata.normalize("NFD", (s or "").lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return {w for w in re.sub(r"[^a-z0-9 ]+", " ", s).split() if len(w) > 1 and w not in STOP}


def decode(path):
    chunks = []
    with av.open(str(path)) as c:
        rs = av.AudioResampler(format="s16", layout="mono", rate=16000)
        for frame in c.decode(audio=0):
            for o in rs.resample(frame) or []:
                chunks.append(o.to_ndarray().reshape(-1))
        for o in rs.resample(None) or []:
            chunks.append(o.to_ndarray().reshape(-1))
    return np.concatenate(chunks).astype(np.float32) / 32768.0


def git_lines(*args):
    out = subprocess.run(["git", "-c", "core.quotepath=off", *args], cwd=ROOT, capture_output=True, text=True, encoding="utf-8")
    return [l for l in out.stdout.splitlines() if l.strip()]


deleted = {"/" + p.removeprefix("public/") for p in git_lines("ls-files", "--deleted") if p.endswith(".mp3")}
new = ["/" + p.removeprefix("public/") for p in git_lines("ls-files", "--others", "--exclude-standard")
       if p.endswith(".mp3") and "Copie" not in p]

refs = {}
for level in ["a0-a1", "a1-a2", "a2-b1"]:
    for ex in json.loads((ROOT / f"src/tcf/content/{level}/co.json").read_text(encoding="utf-8")):
        text = json.dumps(ex, ensure_ascii=False)
        for path in deleted:
            if f'"{path}"' in text:
                refs.setdefault(path, []).append((level, ex["id"], (ex.get("support") or {}).get("transcription") or "", ex.get("scene"), ex.get("scenario"), len(ex.get("questions", []))))

cache = json.loads(CACHE.read_text(encoding="utf-8")) if CACHE.exists() else {}
model = None
for path in new:
    if path in cache:
        continue
    model = model or WhisperModel("small", device="cpu", compute_type="int8")
    segs, _ = model.transcribe(decode(ROOT / "public" / path.lstrip("/")), language="fr", beam_size=5)
    cache[path] = " ".join((s.text or "").strip() for s in segs).strip()
    CACHE.write_text(json.dumps(cache, ensure_ascii=False, indent=2), encoding="utf-8")
    print("stt", path.split("/")[-1], flush=True)

for old in sorted(deleted):
    users = refs.get(old)
    if not users:
        print("NON RÉFÉRENCÉ", old)
        continue
    level, ex_id, tr, scene, scenario, nq = users[0]
    ot = toks(tr)
    scored = sorted(((len(toks(cache[n]) & ot) / max(1, len(toks(cache[n]))), n) for n in new), reverse=True)
    print(f"\n### {old.split('/')[-1]} [{level} {','.join(u[1] for u in users)} | {scenario} | {scene} | {nq}Q]")
    print("   TOP:", " | ".join(f"{s:.2f} {n.split('/')[-1][:38]}" for s, n in scored[:6]))
    print("   BANK:", tr.replace("\n", " / ")[:1500])
print()
for n in new:
    nt = toks(cache[n])
    scored = sorted(((len(nt & toks(u[0][2])) / max(1, len(nt)), o) for o, u in refs.items()), reverse=True)
    print(f"NEW {n.split('/', 5)[-1]} :: " + " | ".join(f"{s:.2f} {o.split('/')[-1]}" for s, o in scored[:2]))
    print("   STT:", cache[n][:700])
print("FIN")
