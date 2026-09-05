"""Score candidate REJECTED takes and pick the best NEAR MISS.

    .venv-matte/bin/python lib/pick_reject.py <identity.png> <candidate.png> [<candidate.png> ...]

Slide 06 shows one frame the identity gate threw out, with its measured score under it. The
number must be real — but WHICH rejected take we show is a choice, and it matters.

The first cheerleading candidate scored -0.002: a different, much younger child. That is a true
rejection and a terrible advertisement. A listing that shows it is saying "our model can produce
someone else's kid", when the point of the slide is "we measure, so it never ships".

So the take to show is the NEAR MISS — the highest-scoring frame that still fails. It reads as a
careful process catching a subtle drift, which is what actually happens, instead of a freak
result. This script ranks candidates and names the one to use.

Band: a score under FLOOR is too far off to show; at or above THRESHOLD it is not a rejection at
all and must never be labelled as one.
"""
import math
import subprocess
import sys
import tempfile
from pathlib import Path

THRESHOLD = 0.36   # the identity gate's own threshold
FLOOR = 0.15       # below this the drift is a different person, not a near miss


def embeddings(paths):
    """Run lib/face.py once over every image and return unit-length embeddings."""
    import json
    out = Path(tempfile.mkdtemp()) / "faces.json"
    here = Path(__file__).resolve().parent
    subprocess.run([sys.executable, str(here / "face.py"), str(out), *paths],
                   check=True, capture_output=True)
    data = json.loads(out.read_text())
    entries = data if isinstance(data, list) else data.get("images", data)
    result = {}
    for e in entries:
        faces = sorted(e.get("faces", []), key=lambda f: -f.get("det_score", 0))
        if not faces:
            result[str(e.get("path", ""))] = None
            continue
        v = faces[0]["embedding"]
        n = math.sqrt(sum(x * x for x in v)) or 1.0
        result[str(e.get("path", ""))] = [x / n for x in v]
    return result


def main():
    identity, *cands = sys.argv[1:]
    if not cands:
        raise SystemExit("give an identity plate and at least one candidate")
    emb = embeddings([identity, *cands])
    ref = emb.get(identity)
    if ref is None:
        raise SystemExit(f"no face found in the identity plate {identity}")

    rows = []
    for c in cands:
        v = emb.get(c)
        if v is None:
            rows.append((c, None, "no face"))
            continue
        s = sum(a * b for a, b in zip(ref, v))
        if s >= THRESHOLD:
            verdict = "PASSES - not a rejection, do not label it one"
        elif s < FLOOR:
            verdict = "too far off - a different person, not a near miss"
        else:
            verdict = "usable near miss"
        rows.append((c, s, verdict))

    for c, s, v in sorted(rows, key=lambda r: -(r[1] if r[1] is not None else -9)):
        shown = "     -  " if s is None else f"{s:8.4f}"
        print(f"{shown}  {v:<45} {Path(c).name}")

    usable = [(s, c) for c, s, v in rows if s is not None and FLOOR <= s < THRESHOLD]
    if usable:
        s, c = max(usable)
        print(f"\nUSE: {c}  score {s:.3f}  (print this number on the slide)")
    else:
        print("\nNo usable near miss. Generate more candidates — do NOT show a freak result, "
              "and do NOT relabel a passing frame as rejected.")
        raise SystemExit(1)


if __name__ == "__main__":
    main()
