import type { Sport } from "../../../../lib/catalog/sports";
import { sportFactsFor, sportPagePath } from "../../../../lib/seo/sport-facts";

/**
 * One line under a family page's sport picker (2026-10-06, SEO plan §4): the chosen sport's own page
 * — its photo traps, its season, its questions — when one exists. A sport without a fact row renders
 * nothing, so the picker never promises a page that is not built. Internal links by meaning: the
 * anchor carries the sport's name, never a bare "here".
 */
export function SportPageLink({ sport, className = "" }: { sport: Sport; className?: string }) {
  if (!sportFactsFor(sport.slug)) return null;
  return (
    <p className={`mt-4 font-body text-small ${className}`.trim()}>
      <a href={sportPagePath(sport.slug)} className="decoration-1 underline-offset-4 hover:underline">
        Everything about a custom {sport.name.toLowerCase()} card: the {sport.name.toLowerCase()} page →
      </a>
    </p>
  );
}
