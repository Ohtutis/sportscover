// Football senior night (master plan §7.5 calendar #6, now with the banner as a real product and the
// blanket coming). The senior edition is /senior-night's own description (COPY §2.5, FAQ 40/41); the
// four products are PRODUCTS (lib/intake/products.ts); the clocks are CHIPS.seniorNight minus the
// sealed pack (D18: not sold) and PROOF_CLOCK; the date calculator and the gift note are CALC_COPY's.
// Football carries a number (lib/catalog/sports.ts), so "theirs" is true here.
import { Callout, Figure, H2, InlineLink, Lead, List, P, PostCta } from "../../components/blog";
import { block } from "../../lib/blocks";
import { CHIPS } from "../../lib/catalog/delivery";
import { CANON } from "../../lib/copy/canon";
import { PROOF_CLOCK } from "../../lib/intake/copy";
import { PRICE_ON_PROOF, productByKey } from "../../lib/intake/products";
import type { BlogPost } from "../../lib/blog";
import { SUPPORT_EMAIL } from "../../lib/site";

/** "FILES 1 WEEK BEFORE" → "Files 1 week before": the senior night chip, read as a sentence. The sealed pack segment is dropped (D18). */
const SN_CLOCKS = CHIPS.seniorNight
  .split(" · ")
  .filter((segment) => !/PACK/.test(segment))
  .map((segment) => segment.charAt(0) + segment.slice(1).toLowerCase());

export const post: BlogPost = {
  slug: "senior-night-football-gift-ideas-poster-cards-banner-blanket",
  title: "Football Senior Night Gift Ideas",
  h1: "FOOTBALL SENIOR NIGHT GIFTS.",
  description:
    "Football senior night gift ideas built from your senior's own photos — a poster, trading cards, a banner and a blanket — and when to order each one.",
  category: "Senior Night Ideas",
  sport: "football",
  occasion: "senior-night",
  primaryPage: "/senior-night",
  publishedAt: "2026-10-04",
  readingMinutes: 3,
  image: "life.gift.moment",
  body: () => (
    <>
      <Lead>
        Football senior night comes once: the last home game, the name read out over the field, the walk with the people who
        drove to every practice. If you want a gift for it built from your senior's own photos, this is what we make and
        when to order it. The whole senior edition is on the <InlineLink href="/senior-night">senior night page</InlineLink>; the{" "}
        <InlineLink href="/photo-guide">photo guide</InlineLink> shows which photos to pull from your phone first.
      </Lead>
      <Figure asset="life.gift.moment" caption="A framed football poster, held up on the night itself." />

      <H2>WHAT MAKES IT A SENIOR EDITION.</H2>
      <P>
        Senior Night is our seventh style, made for this one night: the gold senior finish, the class year, the four-year career
        line — FR · SO · JR · SR — and their senior quote, on a card and a poster that are theirs alone. The back carries career
        highs, position, team and senior season, the athlete signature line, and SENIOR EDITION · 1 OF 1 beside the registered
        card ID.
      </P>
      <P>
        Football wears a number, so theirs is on the card, on a kit copied from your photos, crest and all.{" "}
        {block("logo-sentence")}
      </P>
      <P>
        The senior set also brings die-cut bonus files — a badge and a sticker in the senior gold — and a printed Certificate of
        Authenticity ships with every printed set. Every printed senior set includes every digital file: the files arrive first,
        and the printed set ships after you approve the proof.
      </P>
      <Figure asset="sn.sport.football.front" variant="card" caption="A football senior card in the gold Senior Night finish." />

      <H2>PHOTOS FOR A FOOTBALL CARD.</H2>
      <P>
        Football photos come with one problem of their own: the helmet. The face needs both eyes visible, with
        no cage and no visor shadow across them, so send at least one close-up with the helmet off. Add one in the full uniform
        — a game photo or team photo day — because the kit on the card is copied from it, and one full-body photo, head to
        shoes.
      </P>

      <H2>FOUR GIFTS FROM ONE SET OF PHOTOS.</H2>
      <P>
        Every piece below is built from the same photos and the same artwork, so you can ask for one or all of them on the same
        free proof.
      </P>
      <List
        items={[
          <>
            <strong className="font-medium">The poster.</strong> Art for the wall — the stats stay on the card. 18 × 24 sits above
            a desk or dresser; 24 × 36 holds a wall on its own, and every poster order includes both sizes as files.
          </>,
          <>
            <strong className="font-medium">Trading cards.</strong> The senior front and back, printed square-cut and UV-coated: 12
            cards, or 24 — enough for the team and the family.
          </>,
          <>
            <strong className="font-medium">A banner.</strong> {productByKey("banner")?.blurb} Printed vinyl at 1 × 2, 2 × 4 or 3 × 6
            ft, or the print-ready file at full size. Printed banners ship separately, in 1–2 weeks.
          </>,
          <>
            <strong className="font-medium">A blanket.</strong> {productByKey("blanket")?.blurb} New, and coming in three sizes —{" "}
            {PRICE_ON_PROOF.toLowerCase()}.
          </>,
        ]}
      />
      <Figure
        asset={["product.banner", "product.blanket"]}
        caption="A football banner on a garage wall, and the blanket — the blanket is a mockup, a generated image rather than a photo of a finished blanket."
      />

      <H2>THE TIMELINE.</H2>
      <P>Senior night has a date, so we plan backwards from it.</P>
      <Callout label="Senior night clocks">{SN_CLOCKS.join(" · ")}</Callout>
      <P>
        In practice: order the digital files at least a week before the night and a printed set at least two weeks before. The
        free proof comes first and takes {PROOF_CLOCK}, so ask for it a few days ahead of those marks. A printed banner ships on
        its own clock, so order it early.
      </P>
      <P>
        You don't have to count by hand. The calculator on the <InlineLink href="/senior-night">senior night page</InlineLink>{" "}
        takes the date and shows what is still in time, counting business days from the day you order. If a printed set can no
        longer make it, the files still can: gift the digital first and print the gift note — the printed set follows after the
        night.
      </P>
      <P>{CANON.seniorDateLine}</P>

      <H2>THE WHOLE SENIOR CLASS.</H2>
      <P>
        Ordering for every senior on the team? Email us the sport, roster size and event date at{" "}
        <InlineLink href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</InlineLink>. Every family orders their own athlete under one
        team setup, and each card is built and proofed individually.
      </P>

      <PostCta context="senior-night" options={{ sport: "football" }} />
    </>
  ),
};
