import type { PhotoChecklistItem } from "../lib/catalog/photo-checklist";

/**
 * The nine-row checklist (COPY §2.8, DESIGN §5.6; GAPS #35): index in Anton, title in Space Grotesk
 * 700, the explanation in body. The intake mapping is data, never rendered. `printable` keeps the
 * rows on the printed page (the /photo-guide print stylesheet drops the media around it).
 */
export interface PhotoChecklistProps {
  items: PhotoChecklistItem[];
  printable?: boolean;
  className?: string;
}

export function PhotoChecklist({ items, printable, className = "" }: PhotoChecklistProps) {
  return (
    <ol className={`list-none ${className}`.trim()}>
      {items.map((item) => (
        <li
          key={item.id}
          id={`check-${item.id}`}
          className={`grid grid-cols-[2.5rem_1fr] gap-4 border-t border-hairline py-5 last:border-b last:border-hairline ${printable ? "print:break-inside-avoid print:py-3" : ""}`.trim()}
        >
          <span aria-hidden="true" className="font-display text-h3 leading-none tabular-nums text-ink">
            {item.n}
          </span>
          <div>
            <h3 className="font-body text-[1.125rem] font-bold normal-case tracking-normal text-ink">{item.title}</h3>
            <p className="mt-1 max-w-[62ch] font-body text-body text-pretty text-ink">{item.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
