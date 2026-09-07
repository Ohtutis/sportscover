// The /c 404 body (COPY §2.13, card variant). Reached when the page calls notFound() — today only
// for a `deleted` record whose /api/gone rewrite is missing. Unknown IDs never reach a function
// (`dynamicParams = false`), they fall to the root 404, whose NotFoundBody renders this same copy
// by pathname. Server component: the lookup is a plain POST that works without JS.
import { Shield } from "../../../../components/brand/Shield";
import { ButtonLink } from "../../../../components/ButtonLink";
import { LookupForm } from "../../../../components/LookupForm";

export const CARD_NOT_FOUND = {
  title: "NO CARD REGISTERED UNDER THIS ID.",
  body: "Check the back of the card — the ID reads GDE-XX-XXX-YYYY-NN. Mind O versus 0 and I versus 1.",
  link: "What is a registered edition?",
} as const;

export default function CardNotFound() {
  return (
    <div className="container-site max-w-[40rem] py-16 md:py-24">
      <Shield tone="arena" size={48} />
      <h1 className="mt-8 max-w-[16ch] font-display text-display uppercase text-balance">{CARD_NOT_FOUND.title}</h1>
      <p className="mt-6 max-w-[62ch] font-body text-body text-pretty text-arena-muted">{CARD_NOT_FOUND.body}</p>
      <LookupForm className="mt-8" tone="arena" id="c-404-card-id" />
      <div className="mt-8">
        <ButtonLink href="/registry" variant="outline-arena">
          {CARD_NOT_FOUND.link}
        </ButtonLink>
      </div>
    </div>
  );
}
