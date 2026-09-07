import Link from "next/link";
import { formatEt } from "../lib/capacity";
import { sportByCode } from "../lib/catalog/sports";
import { CANON } from "../lib/copy/canon";
import { registeredAtOf, styleCode, updatedAtOf, type CardRecord } from "../lib/registry/cards";
import { Shield } from "./brand/Shield";
import { CopyIdButton } from "./CopyIdButton";
import { Pill } from "./Pill";

/**
 * The edition panel (COPY §2.15 (3), DESIGN §4.7) — always dark, on every surface. Rows exactly:
 * EDITION ID · FINISH · SPORT · SEASON · REGISTERED · CERTIFICATE · EDITION (SR only); then the
 * one-edition sentence, the AI Act line (C15), "Last updated" and the registry link. "Registered",
 * never "Verified". Demo instances carry `demoLabel` above the panel in the record style.
 */
export const EDITION_SENTENCE = `One registered edition per athlete, per finish, per season. Physical cards are not individually numbered; the sealed pack is ${CANON.packLine}.`;
export const CERTIFICATE_LINE = "Printed and included with every shipped package";
export const SENIOR_EDITION_LINE = "SENIOR EDITION · 1 OF 1";
export const REGISTERED_EDITION_PILL = "REGISTERED EDITION";
export const REGISTRY_LINK_LABEL = "What is a registered edition?";

export interface EditionPanelProps {
  card: CardRecord;
  tone: "arena" | "stock";
  /** e.g. "Example edition · Fictional athlete" — rendered above the panel. */
  demoLabel?: string;
  /** Mount the CopyIdButton island beside the ID. */
  copyButton?: boolean;
  /** Render "Last updated {updatedAt}". */
  lastUpdated?: boolean;
  registryHref?: string;
  /** On /c the labels use the finish's supporting face. */
  labelFont?: "label" | "finish";
  /** Render "What is a registered edition?" inside the panel (default). Off where the page prints it beside its CTA. */
  registryLink?: boolean;
  className?: string;
}

export const RECORD_STYLE = "font-label text-[0.9375rem] font-semibold uppercase tracking-[0.06em] tabular-nums";

export function EditionPanel({
  card,
  tone,
  demoLabel,
  copyButton,
  lastUpdated,
  registryHref = "/registry",
  labelFont = "label",
  registryLink = true,
  className = "",
}: EditionPanelProps) {
  const senior = styleCode(card.styleName) === "SR";
  const sportName = sportByCode(card.sportCode)?.name ?? card.sportCode;
  const dt = `${labelFont === "finish" ? "font-finish-supporting" : "font-label"} text-label font-semibold uppercase tracking-[0.12em] text-arena-muted`;
  const dd = "font-body text-[0.9375rem] font-medium text-white";
  const rows: [string, React.ReactNode][] = [
    [
      "EDITION ID",
      <span key="id" className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className={`${RECORD_STYLE} text-white`}>{card.cardId}</span>
        {copyButton ? <CopyIdButton value={card.cardId} /> : null}
      </span>,
    ],
    ["FINISH", card.styleName],
    ["SPORT", sportName],
    ["SEASON", card.season],
    ["REGISTERED", formatEt(registeredAtOf(card), "medium")],
    ["CERTIFICATE", CERTIFICATE_LINE],
  ];
  if (senior) rows.push(["EDITION", SENIOR_EDITION_LINE]);

  return (
    <div className={className || undefined}>
      {demoLabel ? <p className={`${RECORD_STYLE} mb-3 ${tone === "arena" ? "text-arena-muted" : "text-muted-text"}`}>{demoLabel}</p> : null}
      <section
        aria-label="Edition details"
        className={`relative rounded-ui bg-arena-surface p-5 text-white before:absolute before:inset-x-5 before:top-0 before:h-px before:bg-silver lg:p-6 ${
          tone === "arena"
            ? "transition-[opacity,translate] duration-panel ease-out starting:translate-y-2 starting:opacity-0"
            : "shadow-[var(--shadow-card-stock)]"
        }`}
      >
        {/* On the arena surface the /c header already prints REGISTERED EDITION, and the two pills
            landed in one viewport (owner review 2026-09-07). The senior pill says something else —
            SENIOR EDITION · 1 OF 1 — so it stays on every surface. */}
        <div className={`flex items-center gap-4 ${senior || tone === "stock" ? "justify-between" : "justify-end"}`}>
          {senior || tone === "stock" ? (
            <Pill tone={senior ? "gold" : "outline-silver"}>{senior ? SENIOR_EDITION_LINE : REGISTERED_EDITION_PILL}</Pill>
          ) : null}
          <Shield tone="arena" size={20} />
        </div>
        <dl className="mt-5 grid grid-cols-[6.5rem_1fr] gap-x-6 gap-y-3">
          {rows.map(([label, value]) => (
            <div key={label} className="contents">
              <dt className={dt}>{label}</dt>
              <dd className={dd}>{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-5 font-body text-small text-white/90">{EDITION_SENTENCE}</p>
        <p className="mt-2 font-body text-small text-arena-muted">{CANON.aiActLine}</p>
        {lastUpdated || registryLink ? (
          <p className="mt-4 flex flex-wrap gap-x-3 gap-y-1 font-body text-small text-arena-muted">
            {lastUpdated ? <span>Last updated {formatEt(updatedAtOf(card), "medium")}</span> : null}
            {registryLink ? (
              <Link
                href={registryHref}
                className="text-white underline-offset-4 decoration-1 transition-[text-decoration-thickness] duration-hover ease-out hover:underline"
              >
                {REGISTRY_LINK_LABEL}
              </Link>
            ) : null}
          </p>
        ) : null}
      </section>
    </div>
  );
}
