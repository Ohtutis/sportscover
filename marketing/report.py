#!/usr/bin/env python3
"""Weekly read of what actually worked, from Pinterest's own analytics export.

  npm run mkt:report -- --export ~/Downloads/pin_stats.csv

WHY THIS EXISTS
You cannot make a pin that converts by deciding to. You can only make pins that are
DISTINGUISHABLE from each other and then let the winners multiply — which needs two things
the engine already provides: every pin carries `utm_content=<pin id>` into the link, and the
id encodes date, template and sport. So a Pinterest export joins back to the queue with no
bookkeeping, and the question "which template earns clicks" becomes arithmetic.

The export: Pinterest Analytics -> Overview -> Pin stats -> Export. Any CSV with a link
column and impression/save/outbound-click columns works; column names are matched loosely
because Pinterest renames them.
"""
from __future__ import annotations

import argparse, csv, datetime as dt, os, re, sys
from collections import defaultdict

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import engine  # noqa: E402

os.chdir(engine.ROOT)

ID_RE = re.compile(r"utm_content=([0-9]{8}-\d+-[a-z]+-[a-z0-9-]+)")


def col(row: dict, *names: str) -> float:
    """Pinterest renames its columns between exports; match on substrings instead."""
    for key, value in row.items():
        k = (key or "").lower()
        if any(n in k for n in names):
            try:
                return float(str(value).replace(",", "").strip() or 0)
            except ValueError:
                return 0.0
    return 0.0


def parse_id(pin_id: str) -> dict:
    date, k, template, rest = pin_id.split("-", 3)
    # A list pin's id ends in the list index, not a sport slug — grouping on it invented
    # sports called "4".
    return dict(id=pin_id, date=date, template=template,
                sport="(text pin)" if template == "list" else rest)


def queue_index(cfg: dict) -> dict[str, dict]:
    """id -> the queue item and its caption. The queue is deterministic, so the board, the
    occasion and the keyword set a pin was published with can be recovered from its id alone
    — nothing has to be recorded at upload time."""
    start = dt.date.fromisoformat(cfg["start_date"])
    horizon = (dt.date.today() - start).days + 45
    out = {}
    for item in engine.build_queue(start, max(1, horizon)):
        c = engine.caption(item, cfg)
        out[item["id"]] = dict(board=c["board"], keywords=c["keywords"],
                               occasion=item["occasion"])
        # a spec pin that fell back to product at render time keeps the product id
        out[item["id"].replace("-spec-", "-product-")] = out[item["id"]]
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--export", required=True, help="CSV exported from Pinterest Analytics")
    ap.add_argument("--out", default=None)
    args = ap.parse_args()

    cfg = engine.config()
    index = queue_index(cfg)
    rows, unmatched = [], 0
    with open(args.export, newline="", encoding="utf-8-sig") as f:
        for row in csv.DictReader(f):
            blob = " ".join(str(v) for v in row.values())
            m = ID_RE.search(blob)
            if not m:
                unmatched += 1
                continue
            r = parse_id(m.group(1))
            r["impressions"] = col(row, "impression")
            r["saves"] = col(row, "save", "repin")
            r["clicks"] = col(row, "outbound", "link click", "clickthrough")
            meta = index.get(r["id"], {})
            r["board"] = meta.get("board", "?")
            r["occasion"] = meta.get("occasion", "?")
            r["keywords"] = meta.get("keywords", "")
            rows.append(r)

    if not rows:
        print(f"No pins matched. {unmatched} rows had no utm_content — is this the right export?")
        return

    def table(key: str) -> list[tuple]:
        agg = defaultdict(lambda: [0, 0.0, 0.0, 0.0])
        for r in rows:
            a = agg[r[key]]
            a[0] += 1
            a[1] += r["impressions"]
            a[2] += r["saves"]
            a[3] += r["clicks"]
        out = []
        for name, (n, imp, sav, clk) in agg.items():
            ctr = (clk / imp * 100) if imp else 0.0
            out.append((name, n, imp, sav, clk, clk / n, ctr))
        return sorted(out, key=lambda t: -t[5])          # by clicks PER PIN, not total

    def md(title, key, label) -> str:
        s = f"\n## {title}\n\n| {label} | pins | impressions | saves | clicks | clicks/pin | CTR |\n"
        s += "|---|---:|---:|---:|---:|---:|---:|\n"
        for name, n, imp, sav, clk, cpp, ctr in table(key):
            s += f"| {name} | {n} | {imp:,.0f} | {sav:,.0f} | {clk:,.0f} | {cpp:.1f} | {ctr:.2f} % |\n"
        return s

    tot_i = sum(r["impressions"] for r in rows)
    tot_c = sum(r["clicks"] for r in rows)
    dead = [r for r in rows if r["impressions"] >= 200 and r["clicks"] == 0]
    best = sorted(rows, key=lambda r: -r["clicks"])[:5]

    body = [f"# Pinterest report — {dt.date.today():%Y-%m-%d}",
            "",
            f"{len(rows)} pins matched ({unmatched} export rows skipped). "
            f"{tot_i:,.0f} impressions, {tot_c:,.0f} outbound clicks "
            f"({(tot_c/tot_i*100 if tot_i else 0):.2f} % CTR).",
            "",
            "Ranked by **clicks per pin**, not by total — a template that got more pins will "
            "always win on total, which tells you nothing.",
            md("By template", "template", "template"),
            md("By board", "board", "board"),
            md("By sport", "sport", "sport"),
            md("By occasion", "occasion", "occasion")]

    # Keywords are shared between pins, so they aggregate across rows rather than grouping
    # them. A keyword that keeps appearing under clicks is one to put in an Etsy tag too.
    kw = defaultdict(lambda: [0, 0.0, 0.0])
    for r in rows:
        for k in [x.strip() for x in r["keywords"].split(",") if x.strip()]:
            a = kw[k]
            a[0] += 1
            a[1] += r["impressions"]
            a[2] += r["clicks"]
    # A keyword carried by one pin ranks on that pin's luck, not on the keyword. Three is the
    # smallest number that is not simply noise.
    ranked_kw = sorted([kv for kv in kw.items() if kv[1][0] >= 3],
                       key=lambda t: -(t[1][2] / max(1, t[1][0])))
    body.append("\n## By keyword — only those carried by 3+ pins\n\n| keyword | pins | impressions | clicks | clicks/pin |\n"
                "|---|---:|---:|---:|---:|")
    for k, (n, imp, clk) in ranked_kw[:12]:
        body.append(f"| {k} | {n} | {imp:,.0f} | {clk:,.0f} | {clk/n:.1f} |")

    body.append("\n## What to change\n")
    t = table("template")
    if len(t) > 1 and t[0][5] > 0:
        body.append(f"- **{t[0][0]}** earns {t[0][5]:.1f} clicks/pin vs **{t[-1][0]}** at "
                    f"{t[-1][5]:.1f}. Shift the daily MIX towards it in `engine.py`.")
    s = table("sport")
    if len(s) > 2:
        body.append(f"- Sports carrying the account: **{', '.join(x[0] for x in s[:3])}**. "
                    f"Weakest: **{', '.join(x[0] for x in s[-2:])}** — reorder `SPORTS`.")
    b = table("board")
    empty_boards = [x for x in b if x[2] >= 500 and x[3] == 0]
    if empty_boards:
        body.append(f"- **{', '.join(x[0] for x in empty_boards)}** got impressions and zero "
                    f"saves. A board nobody saves from is a board whose description or whose "
                    f"pins are aimed at the wrong search — rewrite it before adding more.")
    if ranked_kw:
        body.append(f"- Keyword earning most per pin: **{ranked_kw[0][0]}**. If it is not "
                    f"already in the matching Etsy listing's tags, put it there.")
    if dead:
        body.append(f"- **{len(dead)} pins have 200+ impressions and zero clicks.** That is a "
                    f"THUMBNAIL problem, not a price or listing problem: "
                    f"{', '.join(r['id'] for r in dead[:5])}")
    if tot_c and tot_i and tot_c / tot_i < 0.005:
        body.append("- CTR is under 0.5 %. Pinterest is showing the pins and people are not "
                    "tapping — the image is the thing to change, nothing downstream of it.")
    body.append("\n## Best five, to make more of\n")
    for r in best:
        body.append(f"- `{r['id']}` — {r['clicks']:.0f} clicks, {r['saves']:.0f} saves")

    dest = args.out or f"marketing/REPORT-{dt.date.today():%Y-%m-%d}.md"
    with open(dest, "w", encoding="utf-8") as f:
        f.write("\n".join(body) + "\n")
    print(f"{len(rows)} pins -> {dest}")
    print(f"{tot_i:,.0f} impressions, {tot_c:,.0f} clicks, "
          f"{(tot_c/tot_i*100 if tot_i else 0):.2f}% CTR")


if __name__ == "__main__":
    main()
