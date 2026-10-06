// Christmas gifts for athletes (SEO brief 2026-10-06, builder W). Which gift suits which athlete is read
// from PRODUCTS (lib/intake/products.ts): every blurb, size, count and option line is the form's own, and
// the blanket is priced (lib/catalog/prices.ts blanketTiers, 2026-10-07); a post names no price, so it points at the form. The photo rules are
// C5 and INTAKE_COPY; the four steps and their clocks are INTAKE_COPY.steps (LEAD_TIMES, PROOF_CLOCK);
// shipping and staged delivery are C11 and C12. The order-by dates are christmasDates() on /christmas-gift
// and move with the calendar, so this post prints none. No sport, so never "their number".
import { Figure, H2, InlineLink, Lead, List, P, PostCta } from "../../components/blog";
import { block } from "../../lib/blocks";
import { SHIPPING_SENTENCE, STAGED_DELIVERY_SENTENCE } from "../../lib/catalog/delivery";
import { finishes } from "../../lib/catalog/styles";
import { CANON } from "../../lib/copy/canon";
import { INTAKE_COPY } from "../../lib/intake/copy";
import { optionOf, productByKey, type ProductKey } from "../../lib/intake/products";
import type { BlogPost } from "../../lib/blog";

const CHRISTMAS_PAGE = "/christmas-gift";

const WORDS = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
const word = (n: number): string => WORDS[n] ?? String(n);

/** "a, b and c" or "a, b or c". */
const joinList = (items: readonly string[], last: "and" | "or"): string =>
  items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} ${last} ${items[items.length - 1]}`;

const blurb = (product: ProductKey): string => productByKey(product)?.blurb ?? "";

/** An option's one-line detail as the form prints it, lower-cased to follow a colon. */
function detail(product: ProductKey, option: string): string {
  const p = productByKey(product);
  const text = (p && optionOf(p, option)?.detail) ?? "";
  return text.charAt(0).toLowerCase() + text.slice(1);
}

/** The printed options' labels without the trailing word: "2 × 4 ft printed" → "2 × 4 ft", "12 printed cards" → "12". */
const printedLabels = (product: ProductKey): string[] =>
  (productByKey(product)?.options ?? [])
    .filter((o) => o.printed)
    .map((o) => o.label.replace(/\s+printed(\s+cards)?$/, ""));

const blanketSizeCount = productByKey("blanket")?.options.filter((o) => o.printed).length ?? 0;

const FINISH_LIST = joinList(
  finishes.map((f) => f.name),
  "and",
);

export const post: BlogPost = {
  slug: "christmas-gifts-for-athletes-custom-card-poster-order-by",
  title: "Christmas Athlete Gifts: Card or Poster",
  h1: "CHRISTMAS GIFTS FOR ATHLETES.",
  description:
    "Christmas gifts for athletes from their own photos: which suits whom (cards, poster, banner, blanket), what photos to send, and gifting the digital first.",
  category: "Trading Card Gift Ideas",
  occasion: "christmas",
  primaryPage: CHRISTMAS_PAGE,
  publishedAt: "2026-10-06",
  readingMinutes: 4,
  image: "life.gift.moment",
  body: () => (
    <>
      <Lead>
        Most athletes unwrap the same things every Christmas: a hoodie, a water bottle, one more gym bag. A gift built from their
        own photos is different, because it could only ever be theirs. Below is what we make, which piece suits which athlete,
        and what to send. The order-by dates are on our <InlineLink href={CHRISTMAS_PAGE}>Christmas gifts for athletes</InlineLink>{" "}
        page, and the <InlineLink href="/photo-guide">photo guide</InlineLink> shows which photos to pull from your phone first.
      </Lead>
      <Figure asset="life.gift.moment" caption="A family holding up a framed football poster on the court." />

      <H2>WHY THEIR OWN PHOTOS WIN.</H2>
      <P>
        A water bottle is the same for every athlete on the team. A card or a poster built from their photos carries their face,
        their uniform and their season, and nothing else under the tree does. The kit is copied from your photos exactly as it
        is, crest and all, and the art is finished in one of {word(finishes.length)} finishes: {FINISH_LIST}.
      </P>
      <P>
        The card is also a record. {CANON.registeredIdLine} The QR code beside it opens the card's own page, with the season and
        the stats you chose to print. Long after the uniform stops fitting, the card still says who wore it and when.
      </P>

      <H2>WHICH ONE FITS WHICH ATHLETE.</H2>
      <P>Every piece starts from the same photos and the same artwork, so the choice comes down to where the gift will live.</P>
      <List
        items={[
          <>
            <strong className="font-medium">Trading cards, the keepsake.</strong> For the athlete who keeps a binder, swaps with
            teammates or wants something to hand out. Printed, {joinList(printedLabels("cards"), "or")} to an order:{" "}
            {detail("cards", "p12")} More on <InlineLink href="/trading-cards">custom trading cards</InlineLink>.
          </>,
          <>
            <strong className="font-medium">A poster, for their room.</strong> {blurb("poster")} It suits a bedroom, a dorm room
            or a grandparent's hallway. Printed at {joinList(printedLabels("poster"), "or")}; the files carry{" "}
            {detail("poster", "digital")} More on <InlineLink href="/posters">custom sports posters</InlineLink>.
          </>,
          <>
            <strong className="font-medium">A banner, for game day.</strong> {blurb("banner")} For the family that brings folding
            chairs to every game. Three sizes, {joinList(printedLabels("banner"), "or")}, each a{" "}
            {detail("banner", "2x4")}
          </>,
          <>
            <strong className="font-medium">A blanket.</strong> {blurb("blanket")} New, in {word(blanketSizeCount)}{" "}
            sizes or as a digital file, each priced on the free-proof form.
          </>,
        ]}
      />
      <Figure
        asset={["product.cards", "product.poster", "product.banner", "product.blanket"]}
        caption="Cards, a poster, a banner and a blanket. The blanket is a mockup, a generated image rather than a photo of a finished blanket."
      />
      <P>
        {INTAKE_COPY.sections.products.subhead} Not sure which? Ask for more than one on the same free proof, and decide once you
        can see them side by side.
      </P>

      <H2>WHAT TO SEND.</H2>
      <P>
        A surprise is easy to keep, because nobody has to pose for anything. The season is already on your phone: game photos,
        team photo day, the sideline after the last whistle. {block("photos-that-work-best")}
      </P>
      <P>Four of them matter most. Look for these first:</P>
      <List items={INTAKE_COPY.photoMustHaves.map((line) => `${line}.`)} />
      <P>
        Skip screenshots and social-media downloads and send the original files. If you have the school or club crest as a file
        of its own, add it; the kit on the card is copied from your photos, and a clean crest saves a revision.
      </P>

      <H2>THE DATES LIVE ON ONE PAGE.</H2>
      <P>
        The order-by dates live on the <InlineLink href={CHRISTMAS_PAGE}>Christmas page</InlineLink> and move with the calendar,
        so this post names none. What never moves is the order things happen in:
      </P>
      <List
        ordered
        items={INTAKE_COPY.steps.map((step) => (
          <>
            <strong className="font-medium">{step.title}.</strong> {step.body}
          </>
        ))}
      />
      <P>
        {STAGED_DELIVERY_SENTENCE} {SHIPPING_SENTENCE} A printed banner ships on its own clock, so if one is part of the gift, ask
        for it with the first proof.
      </P>

      <H2>GIFT THE DIGITAL FIRST.</H2>
      <P>
        Cutting it close? The files arrive before the prints, and they are a gift on their own: the card front and back, the flip
        video of the card turning over, the poster files and the phone wallpapers, depending on what you chose. Open them
        together on the day, and let the printed pieces follow.
      </P>
      <P>
        Order the printed piece as usual. Every printed option includes the digital files, so those come first and the print
        follows on its own clock. Nothing about the gift changes except the order it is opened in.
      </P>

      <PostCta />
    </>
  ),
};
