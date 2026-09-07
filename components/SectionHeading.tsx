import type { ReactNode } from "react";

/**
 * How every section opens (DESIGN §2.5): a full-width hairline rule with the section index on it
 * (`index`, only on pages whose copy numbers the sections) and an optional pill at the right of the rule
 * (`rail`, only when COPY supplies one); then, fixed by D12, title → subhead → `mt-stack` → pills.
 * H1s omit the rule (the header's bottom hairline is the rule). No eyebrows anywhere.
 * Titles are Anton uppercase and end with a full stop — a dev warning fires otherwise.
 */
export interface SectionHeadingProps {
  as: "h1" | "h2";
  title: string;
  subhead?: string;
  /** Pills rendered after the fixed 38 px gap under the subhead (D12). */
  pills?: ReactNode;
  align?: "left" | "center";
  id?: string;
  /** e.g. "05 / 13" — shown on the rule; omit on pages that do not number sections. */
  index?: string;
  /** Right-hand slot on the rule row (a `Pill` when COPY supplies one). */
  rail?: ReactNode;
  className?: string;
}

export function SectionHeading({ as, title, subhead, pills, align = "left", id, index, rail, className = "" }: SectionHeadingProps) {
  if (process.env.NODE_ENV !== "production" && !title.endsWith(".")) {
    console.warn(`SectionHeading: "${title}" should end with a full stop (COPY §0.1).`);
  }
  const Tag = as;
  const center = align === "center";
  const rule = as === "h2";
  return (
    <div className={`${center ? "text-center" : ""} ${className}`.trim()}>
      {rule ? (
        <div className={`flex items-center gap-4 border-t border-hairline pt-3 ${center && !rail ? "justify-center" : "justify-between"}`}>
          <span aria-hidden="true" className="font-body text-[0.8125rem] font-medium tabular-nums tracking-[0.14em] text-muted-text">
            {index ?? ""}
          </span>
          {rail}
        </div>
      ) : null}
      <Tag
        id={id}
        className={`${rule ? "mt-6" : ""} font-display uppercase text-balance ${as === "h1" ? "text-display max-w-[16ch]" : "text-h2 max-w-[20ch]"} ${center ? "mx-auto" : ""}`.trim()}
      >
        {title}
      </Tag>
      {subhead ? (
        <p className={`mt-4 max-w-[44ch] font-body text-[1.125rem] font-bold text-pretty md:text-sub ${center ? "mx-auto" : ""}`.trim()}>{subhead}</p>
      ) : null}
      {pills ? <div className={`mt-stack flex flex-wrap gap-2 ${center ? "justify-center" : ""}`.trim()}>{pills}</div> : null}
    </div>
  );
}
