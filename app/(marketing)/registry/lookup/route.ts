// POST (and GET) /registry/lookup — the registry's only lookup surface (GAPS #27).
//
// A plain form post so the lookup works with JavaScript off: LookupForm and NotFoundBody both send
// the field `id`. A hit 303s to the card page (a `private` record answers there with its neutral
// notice; a `deleted` one is answered by the /api/gone rewrite on that same path). A miss goes back
// to the page the visitor came from with `?miss=1&id=<what they typed>`, which LookupForm renders as
// the COPY §1.3 miss string — never a message that reveals whether some other ID exists. The `id` is
// echoed so the field can be refilled: an 18-character ID retyped from scratch, right after a message
// about O versus 0, is the miss doing the damage twice (smooth audit S9). Never cached.
//
// Only the HTTP methods are exported: Next type-checks a route file's exports, so the helpers stay
// local and the tests drive GET / POST directly.
import { NextResponse } from "next/server";
import { getCard } from "../../../../lib/registry/cards";

export const dynamic = "force-dynamic";

/** The two F1 pages that mount a lookup field; anything else falls back to /registry. */
const MISS_TARGETS: Record<string, string> = {
  "/": "/?miss=1#registry",
  "/registry": "/registry?miss=1",
};
const DEFAULT_MISS_TARGET = "/registry?miss=1";

/** "  gde-sn-bkb-2026-12 " → "GDE-SN-BKB-2026-12". */
const normaliseCardId = (raw: string | null | undefined): string => (raw ?? "").toUpperCase().replace(/\s+/g, "");

/** Only an ID-SHAPED string is echoed back into the URL — never arbitrary submitted text. */
const ECHOABLE = /^[A-Z0-9-]{1,24}$/;

/** Adds `&id=` before any hash, so `/?miss=1#registry` keeps landing on the form. */
function withEchoedId(target: string, cardId: string): string {
  if (!ECHOABLE.test(cardId)) return target;
  const [path, hash] = target.split("#");
  return `${path}&id=${encodeURIComponent(cardId)}${hash ? `#${hash}` : ""}`;
}

/** Where a miss sends the visitor: back to the form they used, else the registry page. */
function missTarget(referer: string | null, cardId: string): string {
  let target = DEFAULT_MISS_TARGET;
  if (referer) {
    try {
      target = MISS_TARGETS[new URL(referer).pathname] ?? DEFAULT_MISS_TARGET;
    } catch {
      target = DEFAULT_MISS_TARGET;
    }
  }
  return withEchoedId(target, cardId);
}

const seeOther = (request: Request, target: string) =>
  new NextResponse(null, { status: 303, headers: { Location: new URL(target, request.url).toString(), "Cache-Control": "no-store" } });

function answer(request: Request, rawId: string | null): NextResponse {
  const cardId = normaliseCardId(rawId);
  const card = cardId ? getCard(cardId) : undefined;
  // Every record that exists resolves to its own path, deleted ones included — the rewrite answers 410 there.
  if (card) return seeOther(request, `/c/${card.cardId}`);
  return seeOther(request, missTarget(request.headers.get("referer"), cardId));
}

export async function GET(request: Request): Promise<NextResponse> {
  return answer(request, new URL(request.url).searchParams.get("id"));
}

export async function POST(request: Request): Promise<NextResponse> {
  const form = await request.formData().catch(() => null);
  const value = form?.get("id");
  return answer(request, typeof value === "string" ? value : null);
}
