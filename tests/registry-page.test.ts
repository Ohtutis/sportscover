// The registry PAGES: /c/[cardId] in all four visibilities, its 404 body, /registry, the lookup
// route and the 410 handler. next/font/google is a compiler shim (the shipped file is empty), so it
// is mocked here — this is the only suite that imports lib/fonts/finishes through the /c page.
import { beforeAll, describe, expect, it, vi } from "vitest";
import type { ReactElement } from "react";
import type { CardRecord } from "../lib/registry/cards";
import { renderToStaticMarkup } from "react-dom/server";
import { LookupStatus } from "../components/LookupForm";

// The real module is an empty file (next/font is a compiler transform), so every loader
// lib/fonts/finishes.ts calls is stubbed by name. Never a Proxy: a namespace whose `then` resolves
// to a function makes `await import()` hang.
vi.mock("next/font/google", () => {
  const loader = () => ({ className: "font-mock", variable: "--ff-mock", style: { fontFamily: "mock" } });
  const names = [
    "Anton", "Archivo", "Archivo_Narrow", "Barlow", "Chakra_Petch", "Graduate", "Khand", "Orbitron",
    "Oswald", "Passion_One", "Playfair_Display", "Russo_One", "Saira_Condensed", "Space_Grotesk",
  ];
  return Object.fromEntries(names.map((n) => [n, loader])) as Record<string, typeof loader>;
});

const { default: CardPage } = await import("../app/(registry)/c/[cardId]/page");
const { default: CardNotFound } = await import("../app/(registry)/c/[cardId]/not-found");
const { default: RegistryPage } = await import("../app/(marketing)/registry/page");
const { GET: lookupGet, POST: lookupPost } = await import("../app/(marketing)/registry/lookup/route");
const { GET: gone } = await import("../app/api/gone/route");
const { CANON } = await import("../lib/copy/canon");
const { cards, getCard } = await import("../lib/registry/cards");
const { cardArtFor } = await import("../lib/registry/art");
const fs = await import("node:fs");
const path = await import("node:path");
const read = (rel: string): string => fs.readFileSync(path.join(process.cwd(), rel), "utf8");

const ORIGIN = "https://www.gamedayedition.com";
const DEMO_WITH_ART = "GDE-SN-BKB-2026-12";
const DEMO_PENDING = "GDE-SN-BKB-2026-23";
const REAL_UNLISTED = "GDE-SN-BKB-2026-51";

const decode = (s: string) => s.replace(/&(#\d+|#x[0-9a-f]+|amp|lt|gt|quot|#x27|#39);/gi, (m, e: string) => {
  if (e === "amp") return "&";
  if (e === "lt") return "<";
  if (e === "gt") return ">";
  if (e === "quot") return '"';
  if (e.startsWith("#x")) return String.fromCodePoint(parseInt(e.slice(2), 16));
  if (e.startsWith("#")) return String.fromCodePoint(Number(e.slice(1)));
  return m;
});

async function renderCard(cardId: string): Promise<string> {
  const el = (await CardPage({ params: Promise.resolve({ cardId }) })) as ReactElement;
  return decode(renderToStaticMarkup(el));
}

function renderRegistry(): string {
  return decode(renderToStaticMarkup(RegistryPage() as ReactElement));
}

/** The miss line moved to a client island (LookupMiss) so /registry prerenders; test the line itself. */
function renderMiss(miss?: string): string {
  return decode(renderToStaticMarkup(LookupStatus({ miss }) as ReactElement));
}

describe("/c — a public demo record with art", () => {
  let html = "";
  beforeAll(async () => {
    html = await renderCard(DEMO_WITH_ART);
  });
  it("has the art it claims to have", () => {
    expect(cardArtFor(DEMO_WITH_ART)).not.toBeNull();
  });
  it("names the athlete, the ID and the flip", () => {
    const card = getCard(DEMO_WITH_ART)!;
    expect(html).toContain(`${card.firstName} ${card.lastName}`);
    expect(html).toContain(card.cardId);
    expect(html).toContain("Tap to flip");
    expect(html).toContain("#12 · Guard · Cedar Ridge Bears · 2026");
  });
  it("says Registered, never Verified, and carries the AI Act line", () => {
    expect(html).toContain("REGISTERED");
    expect(html.toLowerCase()).not.toContain("verified");
    expect(html).toContain(CANON.aiActLine);
    expect(html).toContain(CANON.fictionalLabel);
    expect(html).toContain(CANON.galleryCaptionShort);
  });
  it("offers the faces as downloads, named front and back, and the single Etsy CTA", () => {
    // Button labels are set uppercase, so the file format belongs in the accessible name, not in
    // a label a parent reads as "CARD FRONT (WEBP)" (DESIGN §5.10-5: front · back · flip).
    expect(html).toContain("DOWNLOADS");
    expect(html).toContain(">Card front<");
    expect(html).toContain(">Card back<");
    expect(html).toContain('aria-label="Download the card front (WebP)"');
    expect(html).not.toContain("Card front (WebP)<");
    // No flip render exists for this record, so no flip row is offered.
    expect(cardArtFor(DEMO_WITH_ART)?.flipMp4).toBeUndefined();
    expect(html).not.toContain(">Card flip<");
    expect(html).toContain("/go/etsy/GDE-BKB-CARD");
    expect(html).not.toContain("Order on Etsy");
  });

  it("prints the stats in the order the card prints them, and no studio type note", () => {
    // The card back reads 18.4 PPG · 4.6 APG · 7.1 RPG; the record lists RPG second. The page is
    // the card's twin and may not reorder the card's own data.
    const order = [...html.matchAll(/aria-label="(PPG|APG|RPG) ([\d.]+)"/g)].map((m) => `${m[2]} ${m[1]}`);
    expect(order).toEqual(["18.4 PPG", "4.6 APG", "7.1 RPG"]);
    expect(html).not.toContain("Type:");
    expect(html).not.toContain("Anton + Barlow");
  });
  it("carries no price, no coupon and no pending block", () => {
    expect(html).not.toMatch(/\$\d/);
    expect(html).not.toContain(CANON.artPendingLine);
    expect(html).not.toContain("ARTWORK PENDING");
  });
  it("has exactly one h1 and no video", () => {
    expect(html.match(/<h1/g)?.length).toBe(1);
    expect(html).not.toContain("<video");
  });
});

describe("/c — a record whose art is pending (COPY §2.15 (2b))", () => {
  let html = "";
  beforeAll(async () => {
    html = await renderCard(DEMO_PENDING);
  });
  it("renders the pending block instead of the flip", () => {
    expect(cardArtFor(DEMO_PENDING)).toBeNull();
    expect(html).toContain(CANON.artPendingLine);
    expect(html).toContain("ARTWORK PENDING");
    expect(html).not.toContain("Tap to flip");
    expect(html).not.toContain("<video");
    expect(html).not.toContain("<img");
  });
  it("omits DOWNLOADS entirely but keeps the registration live", () => {
    expect(html).not.toContain("DOWNLOADS");
    const card = getCard(DEMO_PENDING)!;
    expect(html).toContain(card.cardId);
    expect(html).toContain(`${card.firstName} ${card.lastName}`);
    expect(html).toContain("Copy ID");
    expect(html).toContain("Copy link");
  });
});

describe("/c — a real customer's unlisted page", () => {
  let html = "";
  beforeAll(async () => {
    html = await renderCard(REAL_UNLISTED);
  });
  it("prints no jersey number for an adult", () => {
    const card = getCard(REAL_UNLISTED)!;
    expect(card.ageBand).toBe("adult");
    expect(html).not.toContain(`#${card.jerseyNumber}`);
    expect(html).toContain(`${card.position} · ${card.team}`);
  });
  it("says the page is unlisted, offers no download and no fictional label", () => {
    expect(html).toContain("This page is unlisted");
    expect(html).not.toContain("DOWNLOADS");
    expect(html).not.toContain(CANON.fictionalLabel);
    expect(html).not.toContain("CLASS OF");
  });
  it("gives the owner the report and manage lines", () => {
    expect(html).toContain("Report this card");
    expect(html).toContain("mailto:hello@gamedayedition.com?subject=Report%20card%20" + REAL_UNLISTED);
    expect(html).toContain("To unlist, make public or delete this page");
  });
});

describe("/c — a private record", () => {
  const fixture: CardRecord = {
    cardId: "GDE-SN-BKB-2026-77",
    athleteId: "test-private",
    firstName: "Testfirst",
    lastName: "Testlast",
    jerseyNumber: "77",
    position: "Guard",
    team: "Testteam Rovers",
    season: "2026",
    sportCode: "BKB",
    styleName: "Stadium Night",
    createdAt: "2026-09-01",
    visibility: "private",
  };
  it("renders the neutral notice with no name, no art and only the lookup", async () => {
    cards.push(fixture);
    try {
      const html = await renderCard(fixture.cardId);
      expect(html).toContain("This card is registered with Game Day Edition.");
      expect(html).not.toContain(fixture.firstName);
      expect(html).not.toContain(fixture.lastName);
      expect(html).not.toContain(fixture.team);
      expect(html).not.toContain(fixture.cardId);
      expect(html).not.toContain("<img");
      expect(html).toContain("/registry");
      expect(html).not.toContain("/go/etsy/");
    } finally {
      cards.splice(cards.indexOf(fixture), 1);
    }
  });
});

describe("/c 404 body (COPY §2.13)", () => {
  it("carries the card copy and the inline lookup", () => {
    const html = decode(renderToStaticMarkup(CardNotFound() as ReactElement));
    expect(html).toContain("NO CARD REGISTERED UNDER THIS ID.");
    expect(html).toContain("GDE-XX-XXX-YYYY-NN");
    expect(html).toContain('action="/registry/lookup"');
    expect(html).toContain('name="id"');
  });
});

describe("/registry (COPY §2.10)", () => {
  it("has the lookup, the demo line and the GAPS #11 wording", async () => {
    const html = renderRegistry();
    expect(html).toContain("LOOK UP A CARD.");
    expect(html).toContain("WHAT A REGISTERED EDITION IS.");
    expect(html).toContain('action="/registry/lookup"');
    expect(html).toContain(`/c/${DEMO_WITH_ART}`);
    expect(html).toContain("an edition number such as 01");
    expect(html).not.toContain("E07");
    expect(html).toContain("/terms#registry");
    expect(html).toContain("at least five years");
  });
  it("shows the QR-ringed back at the 200 px DESIGN §5.8-1 asks for", () => {
    // The point of the image is "this is where the ID is": the ring is drawn over the QR, and the
    // box that holds it is a fixed 200 px that does not shrink beside the form.
    const src = read("app/(marketing)/registry/page.tsx");
    expect(src).toContain('className="mt-8 hidden w-[200px] shrink-0 sm:block"');
    const html = renderRegistry();
    expect(html).toContain("border-accent"); // the ring is drawn by the site, never baked into the file
    expect(html).toContain('sizes="200px"');
  });

  it("lists no cards", async () => {
    const html = renderRegistry();
    const ids = cards.filter((c) => c.cardId !== DEMO_WITH_ART).filter((c) => html.includes(c.cardId));
    expect(ids.map((c) => c.cardId)).toEqual([]);
  });
  it("renders the miss string only when the lookup reported a miss", () => {
    expect(renderRegistry()).not.toContain("No card is registered under that ID");
    expect(renderMiss()).toBe("");
    expect(renderMiss("1")).toContain("No card is registered under that ID");
  });
});

describe("/registry/lookup", () => {
  const post = async (id: string, referer?: string) => {
    const body = new FormData();
    body.set("id", id);
    return lookupPost(new Request(`${ORIGIN}/registry/lookup`, { method: "POST", body, headers: referer ? { referer } : {} }));
  };
  it("normalises case and whitespace and 303s to the card", async () => {
    const res = await post("  gde-sn-bkb-2026-12 ");
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toBe(`${ORIGIN}/c/${DEMO_WITH_ART}`);
    expect(res.headers.get("cache-control")).toBe("no-store");
  });
  it("answers GET ?id= the same way", async () => {
    const res = await lookupGet(new Request(`${ORIGIN}/registry/lookup?id=gde-sn-bkb-2026-12`));
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toBe(`${ORIGIN}/c/${DEMO_WITH_ART}`);
  });
  it("sends a private record to its own page (the page answers, not the form)", async () => {
    const fixture: CardRecord = { ...getCard(DEMO_WITH_ART)!, cardId: "GDE-SN-BKB-2026-78", visibility: "private" };
    cards.push(fixture);
    try {
      const res = await post(fixture.cardId);
      expect(res.headers.get("location")).toBe(`${ORIGIN}/c/${fixture.cardId}`);
    } finally {
      cards.splice(cards.indexOf(fixture), 1);
    }
  });
  it("a miss goes back to the form the visitor used", async () => {
    expect((await post("GDE-XX-XXX-2099-00", `${ORIGIN}/registry`)).headers.get("location")).toBe(`${ORIGIN}/registry?miss=1`);
    expect((await post("GDE-XX-XXX-2099-00", `${ORIGIN}/`)).headers.get("location")).toBe(`${ORIGIN}/?miss=1#registry`);
    expect((await post("GDE-XX-XXX-2099-00", `${ORIGIN}/c/GDE-XX-XXX-2099-00`)).headers.get("location")).toBe(`${ORIGIN}/registry?miss=1`);
    expect((await post("GDE-XX-XXX-2099-00")).headers.get("location")).toBe(`${ORIGIN}/registry?miss=1`);
    expect((await post("GDE-XX-XXX-2099-00", "not a url")).headers.get("location")).toBe(`${ORIGIN}/registry?miss=1`);
  });
  it("an empty field is a miss, not a redirect to /c/", async () => {
    const res = await post("   ");
    expect(res.headers.get("location")).toBe(`${ORIGIN}/registry?miss=1`);
  });
});

describe("/api/gone (410)", () => {
  it("answers 410 with the removal copy and noindex", async () => {
    const res = await gone();
    expect(res.status).toBe(410);
    expect(res.headers.get("x-robots-tag")).toBe("noindex");
    expect(res.headers.get("cache-control")).toBe("public, max-age=3600");
    expect(res.headers.get("content-type")).toContain("text/html");
    const body = await res.text();
    expect(body).toContain("THIS CARD PAGE HAS BEEN REMOVED.");
    expect(body).toContain("The page was removed at the request of the edition&#39;s owner.".replace("&#39;", "'"));
    expect(body).toContain('name="robots" content="noindex, nofollow"');
    for (const c of cards) expect(body).not.toContain(c.lastName);
  });
});
