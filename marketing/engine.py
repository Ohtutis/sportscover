#!/usr/bin/env python3
"""Data + queue for the daily Pinterest/Reddit engine.

WHY THIS IS DATA AND NOT A SPREADSHEET
The pin queue has to be REPRODUCIBLE: a day's batch must be the same batch every time it is
built, so a re-run never re-posts different art under the same caption, and so a gap in the
calendar can be filled without hand-bookkeeping. Everything below is deterministic from a
start date — no randomness, no state file.

The unit is a PIN ITEM: one image + one caption + one board + one destination link. The
renderer (gen_pins.py) turns an item into a PNG; the caption formulas here turn the same
item into Pinterest SEO text. Nothing else in the repo is touched.
"""
from __future__ import annotations

import datetime as dt
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# ---------------------------------------------------------------- config ----
def config() -> dict:
    """marketing/config.json — the only file a human edits to wire up destinations."""
    p = os.path.join(ROOT, "marketing", "config.json")
    with open(p, encoding="utf-8") as f:
        return json.load(f)


# ---------------------------------------------------------------- sports ----
# `athlete` is the art-pipeline slug (art-pipeline/out/...); `name` is what a US buyer types.
# `head` is the head keyword the sport owns on Pinterest; `also` are the secondary phrases
# that go in the description. Order = demand order, and it decides rotation priority.
SPORTS = [
    # `numbered=False` = the kit carries no jersey number, so no caption may promise one.
    # `tight` zooms the crop to head-and-shoulders. Swimming is the reason it exists: a
    # full-body competition-swimsuit frame of a teenager is not a marketing image.
    dict(slug="basketball",   athlete="basketball",   name="Basketball",   head="basketball",
         board="Basketball Gift Ideas",     kid="basketball player"),
    dict(slug="football",     athlete="football",     name="Football",     head="football",
         board="Football Gift Ideas",       kid="football player"),
    dict(slug="volleyball",   athlete="volleyball",   name="Volleyball",   head="volleyball",
         board="Volleyball and Soccer Gifts", kid="volleyball player"),
    dict(slug="soccer",       athlete="soccer",       name="Soccer",       head="soccer",
         board="Volleyball and Soccer Gifts", kid="soccer player"),
    dict(slug="baseball",     athlete="baseball",     name="Baseball",     head="baseball",
         board="Baseball and Softball Gifts", kid="baseball player"),
    dict(slug="softball",     athlete="softball",     name="Softball",     head="softball",
         board="Baseball and Softball Gifts", kid="softball player"),
    dict(numbered=False, slug="cheerleading", athlete="cheerleading", name="Cheer",        head="cheer",
         board="Cheer and Dance Gifts",       kid="cheerleader"),
    dict(slug="ice-hockey",   athlete="ice-hockey",   name="Hockey",       head="hockey",
         board="Hockey and Lacrosse Gifts",   kid="hockey player"),
    dict(slug="wrestling",    athlete="wrestling",    name="Wrestling",    head="wrestling",
         board="Wrestling and Track Gifts",   kid="wrestler"),
    dict(slug="lacrosse",     athlete="lacrosse",     name="Lacrosse",     head="lacrosse",
         board="Hockey and Lacrosse Gifts",   kid="lacrosse player"),
    dict(numbered=False, slug="gymnastics",   athlete="gymnastics",   name="Gymnastics",   head="gymnastics",
         board="Cheer and Dance Gifts",       kid="gymnast"),
    dict(slug="track-field",  athlete="track-field",  name="Track & Field", head="track and field",
         board="Wrestling and Track Gifts",   kid="runner"),
    dict(numbered=False, tight=2.3, slug="swimming",     athlete="swimming",     name="Swimming",     head="swim",
         board="Swim Tennis and Golf Gifts", kid="swimmer"),
    dict(numbered=False, slug="tennis",       athlete="tennis",       name="Tennis",       head="tennis",
         board="Swim Tennis and Golf Gifts", kid="tennis player"),
    dict(numbered=False, slug="golf",         athlete="golf",         name="Golf",         head="golf",
         board="Swim Tennis and Golf Gifts", kid="golfer"),
]

# Boards a new account opens on day 0. Ten is enough to sort 150 pins and few enough that
# each one accumulates a topic signal; twenty half-empty boards teach Pinterest nothing.
BOARDS = [
    ("Senior Night Ideas",           "senior night gifts, posters, banners and locker decorations for high school athletes"),
    ("Custom Sports Posters",        "personalized sports posters made from your own photos"),
    ("Trading Card Gift Ideas",      "custom trading cards for youth and high school athletes"),
    ("Sports Mom Gift Ideas",        "gift ideas from sports moms and dads for their athlete"),
    ("Basketball Gift Ideas",        "basketball gifts for players, seniors and team parents"),
    ("Football Gift Ideas",          "football gifts for players, seniors and team parents"),
    ("Volleyball and Soccer Gifts",    "volleyball and soccer gift ideas for young athletes"),
    ("Baseball and Softball Gifts",    "baseball and softball gift ideas for young athletes"),
    ("Cheer and Dance Gifts",          "cheer and gymnastics gift ideas"),
    ("Hockey and Lacrosse Gifts",      "hockey and lacrosse gift ideas"),
    ("Wrestling and Track Gifts",      "wrestling and track and field gift ideas"),
    ("Swim Tennis and Golf Gifts",    "swim, tennis and golf gift ideas"),
    ("End of Season Team Gifts",     "end of season gifts for the whole team and the coach"),
]

# ------------------------------------------------------------- occasions ----
# The occasion is what turns a browse into a purchase. Each has a season; the queue
# weights whichever occasion is in season on the pin's own date.
OCCASIONS = {
    "senior-night": dict(label="Senior Night", months=[9, 10, 11, 1, 2],
                         phrase="senior night gift", need="senior night is coming"),
    "christmas":    dict(label="Christmas",    months=[10, 11, 12],
                         phrase="christmas gift for a {kid}", need="christmas"),
    "end-season":   dict(label="End of Season", months=[5, 6, 11, 12, 2, 3],
                         phrase="end of season gift", need="the season just ended"),
    "birthday":     dict(label="Birthday",     months=list(range(1, 13)),
                         phrase="birthday gift for a {kid}", need="a birthday"),
    "evergreen":    dict(label="",             months=list(range(1, 13)),
                         phrase="custom {head} gift", need=""),
}

# --------------------------------------------------------------- copy -------
# Pinterest reads the TITLE first and the description second. Both are written for a person;
# the keyword is placed where a person would have said it anyway. Titles stay under 100
# characters — Pinterest truncates at ~40 in the grid and ~100 in the closeup.
HEADLINES = {
    "beforeafter": [
        "ONE PHONE PHOTO\nBECOMES THIS",
        "YOUR PHOTO.\nTHEIR CARD.",
        "SEND 3 PHOTOS.\nGET A REAL CARD.",
        "FROM CAMERA ROLL\nTO TRADING CARD",
    ],
    # `product` shows a POSTER. It may not say "card" — a wrestling pin went out headlined
    # CUSTOM WRESTLING TRADING CARD above a framed poster, which is the same class of lie as
    # labelling athlete art "their card".
    "product": [
        "CUSTOM {NAME}\nPOSTER",
        "{NAME} SENIOR NIGHT\nPOSTER",
        "A POSTER OF\nYOUR OWN KID",
        "THEIR SEASON,\nON THE WALL",
    ],
    "transform": [
        "THEIR PHOTOS.\nTHEIR OWN CARD.",
        "PHONE PHOTOS IN.\nA REAL CARD OUT.",
    ],
    "slide": [
        "WHAT YOU\nACTUALLY GET",
        "SIX ART STYLES.\nONE ATHLETE.",
        "EVERY FIELD\nIS YOURS",
        "HOW IT WORKS",
    ],
}

# A headline may name an occasion only when the pin's occasion agrees — chip, caption and
# headline must tell one story. (A BIRTHDAY chip rendered over "TENNIS SENIOR NIGHT POSTER"
# on 2026-09-01; caught by eye, so the rule now lives in code and in the audit.)
HEADLINE_OCCASION = {"SENIOR NIGHT": "senior-night", "CHRISTMAS": "christmas"}


def headlines_for(template: str, occasion: str) -> list[str]:
    bank = HEADLINES.get(template, [""])
    ok = [h for h in bank
          if all(occ == occasion for w, occ in HEADLINE_OCCASION.items() if w in h.upper())]
    return ok or bank

LISTS = [
    dict(title="5 SENIOR NIGHT GIFT IDEAS\nTHAT AREN'T FLOWERS",
         lines=["A custom poster of them, in their kit",
                "A trading card with their real stats",
                "A locker banner the team signs",
                "A framed print for the parents' wall",
                "Their number, printed and kept"],
         board="Senior Night Ideas", occasion="senior-night"),
    dict(title="WHAT TO PHOTOGRAPH\nBEFORE SENIOR NIGHT",
         lines=["Face, straight on, daylight",
                "Full body in the game kit",
                "The back of the jersey",
                "The club crest, close up",
                "One action shot, any quality"],
         board="Senior Night Ideas", occasion="senior-night"),
    dict(title="END OF SEASON GIFTS\nTHE WHOLE TEAM WANTS",
         lines=["A card for every player",
                "One poster for the coach",
                "Matching numbers, matching kit",
                "Printed, not a screenshot",
                "Ordered once, delivered as files"],
         board="End of Season Team Gifts", occasion="end-season"),
    dict(title="4 GIFTS FOR A KID\nWHO ONLY TALKS SPORT",
         lines=["A trading card of themselves",
                "A poster for above the bed",
                "A phone wallpaper of the same art",
                "A card page that lives online"],
         board="Sports Mom Gift Ideas", occasion="birthday"),
    dict(title="THE PHOTOS PARENTS\nALREADY HAVE ARE ENOUGH",
         lines=["No studio, no photographer",
                "Phone photos, taken at a game",
                "Blurry ones still work",
                "Three is enough to start",
                "You approve before anything prints"],
         board="Custom Sports Posters", occasion="evergreen"),
    dict(title="CHRISTMAS GIFTS FOR\nYOUTH ATHLETES",
         lines=["Custom trading card, their kit",
                "18x24 poster of their season",
                "A set for siblings who both play",
                "Digital files — no shipping date to miss"],
         board="Trading Card Gift Ideas", occasion="christmas"),
]


def in_season(occ_key: str, date: dt.date) -> bool:
    return date.month in OCCASIONS[occ_key]["months"]


def pick_occasion(date: dt.date, i: int) -> str:
    """An in-season occasion is worth three evergreen ones — it is the difference between
    somebody browsing and somebody with a date on the calendar. Deterministic in `i`."""
    pool = []
    for k in ("senior-night", "christmas", "end-season"):
        if in_season(k, date):
            pool += [k] * 3
    pool += ["birthday", "evergreen"]
    return pool[i % len(pool)]


# Demand order is not a tie: the first four sports carry the shop, so they carry the pins.
# The ring is built in PASSES (every sport, then the top 11, then the top 8, then the top 4)
# rather than in blocks — blocks put the same sport in three pins of the same day.
def _ring() -> list[dict]:
    out = []
    for cut in (len(SPORTS), 11, 8, 4):
        out += SPORTS[:cut]
    return out


SPORT_RING = _ring()


def caption(item: dict, cfg: dict) -> dict:
    """Pin title + description + board + link, from the item alone."""
    sport = item.get("sport")
    occ = OCCASIONS[item["occasion"]]
    name = sport["name"] if sport else "Sports"
    head = sport["head"] if sport else "sports"
    kid = sport["kid"] if sport else "young athlete"
    label = occ["label"]
    phrase = occ["phrase"].format(kid=kid, head=head)

    numbered = (sport or {}).get("numbered", True)
    mark = "their number, their club crest" if numbered else "their club crest, their name"
    if item["template"] == "list":
        title = item["list"]["title"].replace("\n", " ").title()
    elif item["template"] == "slide":
        title = "Custom Sports Trading Card & Poster Set Made From Your Own Photos"
        name = "Sports"
    elif label == "Senior Night":
        title = f"{name} Senior Night Poster & Trading Card From Your Own Photos"
    elif label:
        title = f"Custom {name} Poster & Trading Card | {label} Gift From Your Photos"
    elif item["template"] in ("product", "transform") and item.get("kind", "poster") == "poster":
        title = f"Custom {name} Poster Made From Your Own Photos"   # a poster pin may not say "card"
    else:
        title = f"Custom {name} Trading Card Made From Your Own Photos"
    title = title[:100]

    what = {
        "beforeafter": (f"Three ordinary phone photos of your {kid} go in. A finished "
                        f"{head} trading card and poster come out — their real kit, "
                        f"{mark}."),
        "product":     (f"A one-of-one {head} poster built from your own photos — their kit, "
                        f"{mark}. Print-ready 18x24 and 24x36, or printed and shipped free."),
        "transform":   (f"The photos on the left came off a parent's phone. The {head} "
                        f"{'poster' if item.get('kind') == 'poster' else 'card'} on the right "
                        f"is what came back — same face, same kit, {mark}."),
        "spec":        (f"Everything the {head} card is: rebuilt from your own photos, six "
                        f"art styles, front and back at print-ready 300 DPI, and a proof you "
                        f"approve before anything is delivered."),
        # slide pins show a listing slide, which may picture ANY sport (the exported decks are
        # basketball or multi-sport) — so the slide copy names no sport. A "soccer" slide pin
        # rendered a basketball slide on 2026-09-03 and had to be re-captioned by hand.
        "slide":       ("Exactly what you get: the card front and back, the poster, six art "
                        "styles to choose from, and phone wallpapers of the same art — for any "
                        "of seventeen sports."),
        "list":        (f"Ideas for the {head} family. Everything here is made from photos "
                        f"you already have on your phone."),
    }[item["template"]]

    # Lead with PRINTED. The old line ("Digital files, printable at home or at any print
    # shop") read as an instruction to buy the cheapest tier and print it yourself, which is
    # the opposite of what the shop needs: the printed tiers carry the margin, the review
    # photos and the supplier test. Digital stays available, second, for the people who
    # genuinely want the files.
    desc = (f"{what} Choose from six art styles and approve a proof before anything is final. "
            f"Printed and shipped free worldwide, or print-ready files if you would rather "
            f"print it yourself. "
            f"{('Perfect as a ' + phrase + '.') if phrase else ''} "
            f"Tap through to see it on Etsy.")
    # The occasion keyword is built from the LABEL, not from the sentence-shaped `phrase`.
    # Concatenating the two produced "golf custom golf gift" and "golf birthday gift for a
    # golfer" — phrases nobody searches, sitting in the keyword field of every pin.
    occ_kw = f"{head} {label.lower()} gift" if label else f"custom {head} gift"
    keywords = ", ".join(dict.fromkeys([
        occ_kw,
        f"custom {head} poster",
        f"{head} trading card",
        f"personalized {head} gift",
        f"{head} mom gift",
        f"{head} senior night" if label == "Senior Night" else f"{head} team gift",
    ]))

    board = item["list"]["board"] if item["template"] == "list" else (
        "Senior Night Ideas" if label == "Senior Night" else
        (sport["board"] if sport else "Custom Sports Posters"))

    # The picture decides the destination: a sport listing when one exists, the generic
    # product listing otherwise, the shop last.
    by_sport = cfg["links"].get("by_sport", {})
    slug = sport["slug"] if sport else ""
    link = (by_sport.get(slug, {}).get(item["link_key"])
            or cfg["links"].get(item["link_key"])
            or cfg["links"]["shop"])
    if cfg.get("utm"):
        link += ("&" if "?" in link else "?") + cfg["utm"].format(
            source="pinterest", campaign=item["template"], content=item["id"])
    return dict(title=title, description=" ".join(desc.split()), board=board,
                link=link, keywords=keywords)


# --------------------------------------------------------------- queue ------
# One day = MIX pins. Two before/afters (the workhorse — it is the only pin that proves the
# input was ordinary), one product, one proof slide, and a text/list pin every other day.
# HOW MANY PINS A DAY
# A new account is being judged on whether it is legible, not on whether it is prolific.
# The "25 pins a day" advice is from the Tailwind era and is now actively counter-productive;
# the current consensus is 1–5 FRESH pins a day for a young account, every day, beating any
# burst. So the engine ramps: three a day while Pinterest is still working out what this
# account is about, five a day once it has.
#
# ⚠️ Changing the ramp RE-DEALS every future pin (the queue is a single walk). Change it
# before posting starts, or accept that tomorrow's five are different five.
RAMP = [(0, 3), (21, 5)]


def per_day_for(day_index: int) -> int:
    n = RAMP[0][1]
    for after, count in RAMP:
        if day_index >= after:
            n = count
    return n


# The mix is a RING walked by the global counter, not a per-day list indexed by slot. Indexed
# by slot it silently lost two templates the moment the ramp dropped the day to three pins:
# slots 4 and 5 (slide and list) were never reached. Nine slots = before/after 4, product 2,
# slide 2, list 1, and the proportions survive any pins-per-day.
# `transform` is the self-composed "photos in -> product out" frame (gen_pins.t_transform).
# It carries the most information per pin, so it appears often; `beforeafter` keeps the
# arrow version alongside it so the feed is not one repeated layout.
# `product` is the poster frame and `transform` alternates card/poster, so posters now get
# the same billing as cards — owner's call 2026-09-02: advertise both, and push the printed
# tiers rather than the digital one.
TEMPLATE_RING = ["transform", "product", "spec", "transform", "product", "beforeafter",
                 "slide", "transform", "product", "list", "transform", "beforeafter"]

# CARD RENDERS — exported from the 15 per-sport Figma files (`docs/FIGMA-FILES.md`),
# Stadium Night page, node `40:2` (front) and `49:2` (back), at 900x1260 into
# `marketing/cards/<sport>-{front,back}.png`.
#
# WHY THEY EXIST AT ALL: the first before/after pin put the rebuilt athlete ART in the
# after half, and the owner said it plainly — two photographs of a kid do not tell anyone
# they are buying a card. The after is the PRODUCT or it is nothing. Re-export with
# `download_assets` when a card design changes.
CARDS: dict[str, list[str]] = {}

# ---------------------------------------------------------------- poster art ----
# A `product` pin shows the POSTER. Until 2026-09-01 it framed the athlete's pose render
# instead — a bare studio photograph of a kid inside a white mat, captioned "A POSTER OF
# YOUR OWN KID". That is the same defect as a before/after whose "after" is athlete art:
# the picture has to be the THING BEING SOLD, not the raw material it was built from.
# So the product pin now needs finished poster artwork, and a sport without any is not
# rendered as a product pin at all — it falls back to the card.
_POSTER_SRC: dict[str, list[str]] = {
    "baseball":     [f"etsy/listing-images/02-baseball-poster/src/BB-{f}-poster.png"
                     for f in ("SN", "CA", "FS", "HE", "PR", "SS")],
    "cheerleading": [f"etsy/listing-images/02-cheerleading-poster/src/CH-{f}-poster.png"
                     for f in ("SN", "CA", "FS", "HE", "PR", "SS")],
    "football":     [f"etsy/listing-images/02-football-poster/src/FB-{f}-poster.png"
                     for f in ("SN", "CA", "FS", "HE", "PR", "SS")],
    "soccer":       ["etsy/listing-images/02-soccer-poster/src/SC-FS-poster.png",
                     "etsy/listing-images/04-complete-set/src/s03/soccer-he-poster.png",
                     "etsy/listing-images/03-senior-night/src/soc-sr-poster.png"],
    "volleyball":   ["etsy/listing-images/02-volleyball-poster/src/VB-PR-poster.png",
                     "etsy/listing-images/03-senior-night/src/vlb-sr-poster.png"],
    "basketball":   ["etsy/listing-images/04-complete-set/src/marcus-sn-poster.png"],
    "gymnastics":   ["etsy/listing-images/04-complete-set/src/gymnastics-poster.png"],
    "ice-hockey":   ["etsy/listing-images/04-complete-set/src/hockey-poster.png"],
    "track-field":  ["etsy/listing-images/04-complete-set/src/s03/track-sn-poster.png"],
}


def posters_for(slug: str) -> list[str]:
    """Finished poster art for a sport, existing files only."""
    return [p for p in _POSTER_SRC.get(slug, []) if os.path.exists(p)]

# What the spec pin claims. Every line has to be true of what actually ships.
SPEC_LINES = [
    "Rebuilt from your own phone photos",
    "Six art styles — you pick",
    "Front and back, print-ready 300 DPI",
    "You approve a proof before delivery",
    "Registered — its own page online",
]
# `back` is deliberately absent. A pin has one job — prove this is the SAME KID — and a
# from-behind frame has no face to prove it with. It shipped twice in the first batch.
POSES = ["hero", "action3", "action2"]
LINKS = {"beforeafter": "card", "product": "poster", "slide": "set", "list": "shop",
         "spec": "card", "transform": "card"}


def build_queue(start: dt.date, days: int, per_day: int | None = None) -> list[dict]:
    """`per_day=None` follows RAMP; an explicit number overrides it (for a one-off catch-up)."""
    items, n = [], 0
    # Pose and before-photo rotate on the SPORT's own appearance count, not on the global
    # counter. Keyed globally they collided: basketball came round every fifth day and landed
    # on the same pose each time, so the audit saw the same frame inside its repeat window.
    seen_sport: dict[str, int] = {}
    for d in range(days):
        date = start + dt.timedelta(days=d)
        for k in range(per_day if per_day else per_day_for(d)):
            template = TEMPLATE_RING[n % len(TEMPLATE_RING)]
            sport = SPORT_RING[n % len(SPORT_RING)]   # adjacent ring entries are always different sports
            seen_sport[sport["slug"]] = seen_sport.get(sport["slug"], -1) + 1
            turn = seen_sport[sport["slug"]]
            occasion = pick_occasion(date, n)
            item = dict(
                id=f"{date:%Y%m%d}-{k+1}-{template}-{sport['slug']}",
                date=f"{date:%Y-%m-%d}", template=template, sport=sport,
                occasion=occasion, pose=POSES[turn % len(POSES)],
                # photo1/photo4 are the everyday shots — the strongest "before"
                photo=(1 if turn % 2 == 0 else 4), link_key=LINKS[template],
                # transform alternates card / poster by slot parity (odd = card). The kind is
                # decided HERE so the caption, the link and the render agree — on 2026-09-03
                # a poster transform went out captioned "the baseball card" and linked to a
                # card listing because gen_pins decided the kind on its own.
                kind=("card" if (k + 1) % 2 == 1 or not posters_for(sport["slug"]) else "poster")
                     if template == "transform" else None,
                headline=(lambda hb: hb[n % len(hb)])(headlines_for(template, occasion)),
                list=LISTS[n % len(LISTS)] if template == "list" else None,
            )
            if template == "transform" and item["kind"] == "poster":
                item["link_key"] = "poster"
            if template == "list":
                item["occasion"] = item["list"]["occasion"]
                item["id"] = f"{date:%Y%m%d}-{k+1}-list-{n % len(LISTS)}"
            items.append(item)
            n += 1
    return items
