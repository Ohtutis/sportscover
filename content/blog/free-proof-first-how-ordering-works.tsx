// The free-proof path (owner decision 2026-10-04, D29) step by step. The four steps are INTAKE_COPY's
// own, rendered from the constant; what "digital" and "printed" include comes from PRODUCTS
// (lib/intake/products.ts) — the details are read from the data, never retyped — and the clocks from
// PROOF_CLOCK / LEAD_TIMES. No prices: an option's price is shown on the form and confirmed with the proof.
import { Callout, Figure, H2, InlineLink, Lead, List, P, PostCta } from "../../components/blog";
import { block } from "../../lib/blocks";
import { SHIPPING_SENTENCE } from "../../lib/catalog/delivery";
import { CANON } from "../../lib/copy/canon";
import { INTAKE_COPY, PROOF_CLOCK } from "../../lib/intake/copy";
import { optionOf, productByKey, type ProductKey } from "../../lib/intake/products";
import type { BlogPost } from "../../lib/blog";

/** An option's one-line detail, as the form shows it, starting lower-case to sit after a colon. */
function detail(product: ProductKey, option: string): string {
  const p = productByKey(product);
  const text = (p && optionOf(p, option)?.detail) ?? "";
  return text.charAt(0).toLowerCase() + text.slice(1);
}

const blanket = productByKey("blanket");

export const post: BlogPost = {
  slug: "free-proof-first-how-ordering-works",
  title: "Free Proof First: How Ordering Works",
  h1: "HOW ORDERING WORKS.",
  description:
    "Send 4–10 photos, see a free watermarked proof, then choose digital or printed and pay only if you love it. What each option includes, step by step.",
  category: "Sports Mom Gift Ideas",
  primaryPage: "/free-proof",
  publishedAt: "2026-10-04",
  readingMinutes: 3,
  image: "show.proof.basketball",
  body: () => (
    <>
      <Lead>
        Ordering a custom edition now starts with a <InlineLink href="/free-proof">free proof</InlineLink>. You send photos and
        tell us what you would like made; we build a watermarked proof of your athlete's edition; you pay only if you love
        it. There is no account to create and no card details to type. If you would like to see what happens to the photos in
        between, <InlineLink href="/how-it-works">how it's made</InlineLink> walks through every check.
      </Lead>

      <H2>THE FOUR STEPS.</H2>
      <List
        ordered
        items={INTAKE_COPY.steps.map((step) => (
          <>
            <strong className="font-medium">{step.title}.</strong> {step.body}
          </>
        ))}
      />

      <H2>WHAT YOU SEND.</H2>
      <P>{block("photos-that-work-best")}</P>
      <P>
        You also choose what you would like made — trading cards, a poster, a banner or a blanket, one or all — and a style: six
        finishes and the Senior Night edition. Not sure? Let us recommend one; you will see it on the proof. About the athlete we
        ask only what goes on the card. Long names are fine — the type scales down, it never shortens.
      </P>
      <P>{CANON.seniorDateLine}</P>

      <H2>THE PROOF.</H2>
      <P>
        We check the photos first, within one business day, and email you if one more angle would help. Then the watermarked
        proof arrives by email within {PROOF_CLOCK}: the real card, poster, banner or blanket, with the watermark across it.
      </P>
      <Figure
        asset="show.proof.basketball"
        variant="artefact"
        caption="A watermarked proof sheet: the poster, the card front and the card back, side by side."
      />
      <P>
        {CANON.proofChecklist} Want a change? One revision is included. And if the proof isn't right and we can't fix
        it, there is nothing to pay at all.
      </P>

      <H2>DIGITAL OR PRINTED.</H2>
      <P>
        Once you love the proof, you choose how you want it. Every printed option includes the digital files, and cards and a
        poster together are priced as a set.
      </P>
      <List
        items={[
          <>
            <strong className="font-medium">Trading cards.</strong> Digital: {detail("cards", "digital")} Printed, 12 or 24 cards:{" "}
            {detail("cards", "p12")}
          </>,
          <>
            <strong className="font-medium">Poster.</strong> Digital: {detail("poster", "digital")} Printed, 18 × 24 or 24 × 36 in:{" "}
            {detail("poster", "p1824")}
          </>,
          <>
            <strong className="font-medium">Banner.</strong> Digital: {detail("banner", "digital")} Printed, 1 × 2, 2 × 4 or 3 × 6
            ft: {detail("banner", "2x4")}
          </>,
          <>
            <strong className="font-medium">Blanket.</strong> {blanket?.blurb} New, in three sizes, each priced on the form.
          </>,
        ]}
      />

      <Figure
        asset={["product.cards", "product.poster", "product.banner", "product.blanket"]}
        caption="The four things a proof can show: cards, a poster, a banner and a blanket — the blanket is a mockup, a generated image rather than a photo of a finished blanket."
      />

      <H2>AFTER YOU APPROVE.</H2>
      <P>
        You pay the way you prefer, the watermark comes off, and the files and prints follow on the clocks in step four. Digital
        files arrive first; printed items may arrive in separate packages, because the cards, the poster and a banner come from
        different print partners. {SHIPPING_SENTENCE}
      </P>
      <P>
        To add photos or details after you send the request, reply to the confirmation email — it carries your reference.
      </P>
      <Callout label="If you don't go ahead">
        {block("photo-privacy")} The likeness measurement made from them is destroyed when your request closes — within 30
        days if you don't go ahead.
      </Callout>

      <PostCta />
    </>
  ),
};
