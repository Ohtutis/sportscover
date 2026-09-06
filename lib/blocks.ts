// Shared copy blocks (content/blocks/*.md) — the exact text used on the Etsy listings.
import fs from "node:fs";
import path from "node:path";

const dir = path.join(process.cwd(), "content", "blocks");

export type BlockName =
  | "our-promise"
  | "how-its-made"
  | "photo-privacy"
  | "independent-studio"
  | "photos-that-work-best"
  | "logo-sentence";

export function block(name: BlockName): string {
  return fs.readFileSync(path.join(dir, `${name}.md`), "utf8").trim();
}
