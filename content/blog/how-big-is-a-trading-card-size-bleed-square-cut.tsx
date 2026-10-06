// How big is a trading card (SEO brief 2026-10-06, builder W): a specific-question post. Every number in it
// is read from the card spec sheet (specRows("cards"), the /trading-cards ledger) or the printed poster tiers
// (tierNotes); nothing is typed. Square-cut everywhere since 2026-09-01 (CLAUDE.md): the corners are
// described as cut square and the other shape is never named. The ID line is C8; the sleeve and binder
// lines are plain statements about the standard size, with no brand names.
import { specRows } from "../../app/(marketing)/(families)/_shared/spec-sheet";
import { Figure, H2, InlineLink, Lead, P, PostCta } from "../../components/blog";
import { finishes, styleByCode } from "../../lib/catalog/styles";
import { tierNotes } from "../../lib/catalog/tiers";
import { CANON } from "../../lib/copy/canon";
import { INTAKE_COPY } from "../../lib/intake/copy";
import type { BlogPost } from "../../lib/blog";

/** The card spec sheet's rows as plain strings, by key. */
const CARD_SPEC: Record<string, string> = Object.fromEntries(
  specRows("cards").map((row) => [String(row.key), typeof row.value === "string" ? row.value : ""]),
);
const spec = (key: string): string => CARD_SPEC[key] ?? "";
/** Lower-cases a sentence's first letter to follow a colon, but never an initialism ("UV-coated" stays). */
const lower = (s: string): string => (/^[A-Z][a-z]/.test(s) ? s.charAt(0).toLowerCase() + s.slice(1) : s);

/** The Size row in inches, and the metric figure it carries in brackets. */
const SIZE_IN = spec("Size").replace(/\s*\(.*\)\s*$/, "");
const SIZE_MM = spec("Size").match(/\(([^)]+)\)/)?.[1] ?? "";
/** The Print row: the file's pixel size and its resolution. */
const FILE_PX = spec("Print").match(/\d+ × \d+ px/)?.[0] ?? "";
const DPI = spec("Print").match(/\d+ dpi/)?.[0] ?? "";
/** The Digital files row's format, the word before "at". */
const FILE_FORMAT = spec("Digital files").split(" ")[0];

/** The printed poster tiers' first lines: the size, then what it is printed as. */
const POSTER_NOTES = ["GDE-ANY-POST-P1824", "GDE-ANY-POST-P2436"].map((sku) => tierNotes[sku]?.[0] ?? "");
const POSTER_SIZES = POSTER_NOTES.map((note) => note.replace(/\s+matte poster.*$/, ""));
const POSTER_PAPER = POSTER_NOTES[0].replace(/^.*?\bin\s+/, "");

const WORDS = ["no", "one", "two", "three", "four", "five", "six", "seven"];
const word = (n: number): string => WORDS[n] ?? String(n);

const DEMO_FINISH = styleByCode("SN")?.name ?? "";

/** The form's own set sentence ("Cards and a poster together are priced as a set."), lifted out of its subhead. */
const SET_LINE = INTAKE_COPY.sections.products.subhead.match(/Cards and a poster[^.]*\./)?.[0] ?? "";

export const post: BlogPost = {
  slug: "how-big-is-a-trading-card-size-bleed-square-cut",
  title: "How Big Is a Trading Card? Size and Cut",
  h1: "HOW BIG IS A TRADING CARD.",
  description: `A standard trading card is ${SIZE_IN}. What bleed is, why the print file is bigger than the card, why ours are square-cut, and what fits a sleeve.`,
  category: "Trading Card Gift Ideas",
  primaryPage: "/trading-cards",
  publishedAt: "2026-10-06",
  readingMinutes: 4,
  image: "cards.demo.front",
  body: () => (
    <>
      <Lead>
        A standard trading card is {SIZE_IN}, or {SIZE_MM}. That is the size of the cards in a pack, and the size of every card
        we print. Below: what the print file looks like before it is cut, why our corners are square, what the coating does, and
        what holds a card once you have it. The cards themselves are on our{" "}
        <InlineLink href="/trading-cards">custom trading cards</InlineLink> page, and{" "}
        <InlineLink href="/how-it-works">how it's made</InlineLink> covers every check before anything is printed.
      </Lead>

      <H2>THE STANDARD SIZE.</H2>
      <P>
        {SIZE_IN} is the size collectors mean when they say standard, and the size that card sleeves, binder pages and
        top-loaders are made for. It has been the common size for sports cards for decades, so a custom card sits in a
        collection without looking out of place. Ours are made at that size on {lower(spec("Stock"))}, and the printed sets come
        as {spec("Loose sets")}.
      </P>
      <Figure asset="life.card.desk" caption="A printed card on a desk, beside a pen and a coin." />

      <H2>WHAT BLEED IS.</H2>
      <P>
        A card is printed bigger than it ends up. The artwork runs past the line where the card will be cut, and that extra
        margin, the bleed, is trimmed away. No cutter lands on precisely the same line every time: if the art stopped exactly at
        the edge, a cut that drifted by a hair would leave a thin white sliver along one side. With bleed, a drifting cut still
        lands on artwork.
      </P>
      <P>
        So our print file is {FILE_PX} at {DPI}, a little more than {SIZE_IN}: the card plus its bleed. The same logic works
        inward. Nothing that matters sits near the cut: the name, the stats and the QR code stay well inside the edge, so the trim
        only ever takes background.
      </P>
      <P>
        Printing the digital files yourself? They are {FILE_FORMAT} at {DPI}. Ask the shop to print them at actual size, with no
        scaling, and to trim the bleed off at the card's edge. A file scaled down to fit a sheet shrinks the card along with it.
      </P>

      <H2>WHY THE CORNERS ARE SQUARE.</H2>
      <P>
        Our cards are {lower(spec("Corners"))}: all four corners are cut straight, with no curve. That is a design choice, not a
        shortcut. Every finish draws a frame around its card, and the frame runs right into the corners; a square cut keeps the
        whole frame, where a curved cut would clip it. One border shape serves all {word(finishes.length)} finishes, so the cut
        is the same whichever finish you pick.
      </P>

      <H2>WHAT UV COATING DOES.</H2>
      <P>
        The face of every card is {lower(spec("Finish"))}: a clear coat goes over the printed face and is hardened under
        ultraviolet light. The coat seals the ink and helps the face stand up to being handled, sleeved and passed around. A
        sleeve still helps: the coating looks after the print, not the edges.
      </P>

      <H2>SLEEVES, BINDERS AND TOP-LOADERS.</H2>
      <P>
        Because the cards are the standard size, they fit standard card sleeves, nine-pocket binder pages and standard
        top-loaders, the same as any other card in a collection. Sleeve the card first, then slide it into the top-loader: the
        soft sleeve keeps the face from scuffing on the way in. A card in a top-loader can stand on a shelf or ride in a backpack
        without bending.
      </P>
      <Figure asset="life.card.binder" caption="Printed cards in the sleeves of a binder page." />

      <H2>WHAT'S ON THE BACK.</H2>
      <P>On the back: {lower(spec("Back"))}.</P>
      <P>
        {CANON.registeredIdLine} Scan the QR code beside it and the card's own page opens, with the edition, the stats and the
        season. Type the ID into the <InlineLink href="/registry">registry</InlineLink> and the same page opens. The rule behind
        the ID: {lower(spec("Registry"))}. Every shipped package also carries a free printed Certificate of Authenticity with the
        same ID.
      </P>
      <Figure
        asset={["cards.demo.front", "cards.demo.back"]}
        variant="card"
        caption={`The front and the back of one card, in the ${DEMO_FINISH} finish.`}
      />

      <H2>A POSTER, FOR CONTRAST.</H2>
      <P>
        A card is made to be held. A poster is the same artwork made for a wall: {POSTER_SIZES.join(" or ")}, printed as a{" "}
        {POSTER_PAPER}. The stats and the class year stay on the card, and the poster is the art at full size. {SET_LINE} More
        on <InlineLink href="/posters">custom sports posters</InlineLink>.
      </P>

      <PostCta context="cards" />
    </>
  ),
};
