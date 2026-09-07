// Mint a new registry card (GAPS #21): id, record, QR code and audited art in one command.
//
//   npm run card:new -- --sport <code|slug> --style <name|code> --season 2026 \
//       --first Rita --last Gataveckaite --team Vilnius --position Pro \
//       [--number 12] [--adult] [--class-of 2028] [--stats "PPG=18.4,APG=6.2,RPG=5.3"] \
//       [--highlight "…"] [--serial "1 of 1"] [--fictional] [--athlete-id slug] \
//       [--visibility public|unlisted|private] [--channel site|etsy|demo-site|demo-etsy] \
//       [--front <png> --back <png> [--mp4 <mp4>]] [--allow-orders] [--dry]
//
// 1. The id comes from makeCardId(). Numberless sports (cheerleading, gymnastics, swimming, tennis,
//    golf) and adults carry no shirt number: the id gets the next printed EDITION number for that
//    style, sport and season — 01, 02, … — never a jersey number, never an "E" prefix.
// 2. The record is appended above `// card:new inserts above` in lib/registry/cards.ts; when
//    --front/--back are given the source entry is appended above `// card:new sources insert above`
//    in lib/registry/art-sources.ts (real customers' sources under orders/** are `sourceKind: "order"`).
// 3. `npm run qr:gen` rewrites public/cards/qr/<id>.png and `cards:assets --id <id>` builds and audits
//    public/cards/<id>/ (pass --allow-orders for a real customer's export).
// Real customers default to unlisted (visibilityOf); only what is printed on the card goes in.

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { sportByCode, sportBySlug } from "../lib/catalog/sports";
import { styleByCode, styleByName } from "../lib/catalog/styles";
import { cards, makeCardId, styleCode, type CardRecord, type Channel, type Visibility } from "../lib/registry/cards";
import { isOrderSource } from "../lib/registry/art-sources";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CARDS_FILE = path.join(ROOT, "lib", "registry", "cards.ts");
const SOURCES_FILE = path.join(ROOT, "lib", "registry", "art-sources.ts");
const CARDS_MARKER = "  // card:new inserts above";
const SOURCES_MARKER = "  // card:new sources insert above";
const TSX = path.join(ROOT, "node_modules", ".bin", "tsx");

// ---------------------------------------------------------------------------------------------

type Args = Record<string, string | true>;

function parseArgs(argv: string[]): Args {
  const out: Args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (!a.startsWith("--")) throw new Error(`unexpected argument ${a}`);
    const key = a.slice(2);
    const v = argv[i + 1];
    if (v === undefined || v.startsWith("--")) out[key] = true;
    else {
      out[key] = v;
      i += 1;
    }
  }
  return out;
}

const str = (args: Args, key: string): string | undefined => (typeof args[key] === "string" ? (args[key] as string).trim() : undefined);
const flag = (args: Args, key: string): boolean => args[key] === true;

function required(args: Args, key: string): string {
  const v = str(args, key);
  if (!v) throw new Error(`--${key} is required`);
  return v;
}

/** Next printed edition number (01, 02, …) for a style × sport × season with no shirt number. */
export function nextEditionNumber(styleName: string, sportCode: string, season: string, existing: ReadonlyArray<{ cardId: string }> = cards): string {
  const taken = new Set(existing.map((c) => c.cardId));
  for (let n = 1; n < 100; n += 1) {
    const num = String(n).padStart(2, "0");
    if (!taken.has(`GDE-${styleCode(styleName)}-${sportCode}-${season}-${num}`)) return num;
  }
  throw new Error("more than 99 editions for one style, sport and season — extend the scheme");
}

function parseStats(spec: string | undefined): { label: string; value: string }[] {
  if (!spec) return [];
  const stats = spec.split(",").map((part) => {
    const [label, value] = part.split("=").map((s) => s.trim());
    if (!label || !value) throw new Error(`--stats entry "${part}" must be LABEL=value`);
    if (label.length > 6) throw new Error(`stat label "${label}" is longer than 6 characters`);
    if (value.length > 5) throw new Error(`stat value "${value}" is longer than 5 characters`);
    return { label: label.toUpperCase(), value };
  });
  if (stats.length > 3) throw new Error("a card carries at most three stat chips");
  return stats;
}

const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// ---------------------------------------------------------------------------------------------
// Record → TypeScript source (matches the hand-written style of lib/registry/cards.ts)

function tsValue(v: unknown, indent: string): string {
  if (typeof v === "string") return JSON.stringify(v);
  if (typeof v === "boolean" || typeof v === "number") return String(v);
  if (Array.isArray(v)) {
    if (v.length === 0) return "[]";
    const inner = indent + "  ";
    return `[\n${v.map((item) => `${inner}${tsValue(item, inner)},`).join("\n")}\n${indent}]`;
  }
  if (v && typeof v === "object") {
    const entries = Object.entries(v as Record<string, unknown>).filter(([, val]) => val !== undefined);
    return `{ ${entries.map(([k, val]) => `${k}: ${tsValue(val, indent)}`).join(", ")} }`;
  }
  throw new Error(`cannot serialise ${String(v)}`);
}

function recordSource(record: CardRecord, comment: string): string {
  const indent = "  ";
  const inner = indent + "  ";
  const lines = [`${indent}{`, `${inner}// ${comment}`];
  for (const [k, v] of Object.entries(record)) {
    if (v === undefined) continue;
    lines.push(`${inner}${k}: ${tsValue(v, inner)},`);
  }
  lines.push(`${indent}},`);
  return lines.join("\n");
}

function insertAbove(file: string, marker: string, block: string): void {
  const text = fs.readFileSync(file, "utf8");
  const at = text.indexOf(marker);
  if (at < 0) throw new Error(`${path.relative(ROOT, file)} has no "${marker.trim()}" marker`);
  fs.writeFileSync(file, `${text.slice(0, at)}${block}\n${text.slice(at)}`);
}

// ---------------------------------------------------------------------------------------------

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (flag(args, "help") || flag(args, "h")) {
    console.log(fs.readFileSync(fileURLToPath(import.meta.url), "utf8").split("\n").slice(0, 18).join("\n"));
    return;
  }
  const sportArg = required(args, "sport");
  const sport = sportByCode(sportArg.toUpperCase()) ?? sportBySlug(sportArg.toLowerCase());
  if (!sport) throw new Error(`unknown sport "${sportArg}" (code like BKB or slug like basketball)`);
  const styleArg = required(args, "style");
  const style = styleByName(styleArg) ?? styleByCode(styleArg.toUpperCase());
  if (!style) throw new Error(`unknown style "${styleArg}" (name like "Stadium Night" or code like SN)`);
  const season = required(args, "season");
  const firstName = required(args, "first");
  const lastName = required(args, "last");
  const team = required(args, "team");
  const position = required(args, "position");
  const adult = flag(args, "adult");
  const fictional = flag(args, "fictional");
  const number = str(args, "number");

  if (number && !sport.numbered) throw new Error(`${sport.name} does not number its athletes — drop --number; the id takes an edition number`);
  if (number && adult) throw new Error("--number and --adult are exclusive: adults carry no shirt number on the card (GAPS #11)");
  if (!number && sport.numbered && !adult) throw new Error(`${sport.name} is a numbered sport — give --number, or --adult for an adult athlete`);
  if (number && !/^\d{1,2}$/.test(number)) throw new Error("--number must be one or two digits");

  const jerseyNumber = number ?? nextEditionNumber(style.name, sport.code, season);
  const cardId = makeCardId({ sportCode: sport.code, styleName: style.name, season, jerseyNumber });
  // Local calendar date (the registry is kept on the owner's Mac; a UTC date would be yesterday after midnight).
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const visibility = str(args, "visibility") as Visibility | undefined;
  const channel = str(args, "channel") as Channel | undefined;
  if (visibility && !["public", "unlisted", "private", "deleted"].includes(visibility)) throw new Error(`bad --visibility ${visibility}`);
  if (channel && !["site", "etsy", "demo-site", "demo-etsy"].includes(channel)) throw new Error(`bad --channel ${channel}`);
  if (visibility === "public" && !fictional) throw new Error("a real customer cannot be minted public — consent fields are set by hand after written consent");

  const record: CardRecord = {
    cardId,
    athleteId: str(args, "athlete-id") ?? (fictional ? slugify(`${firstName} ${lastName}`) : cardId.toLowerCase()),
    firstName,
    lastName,
    jerseyNumber,
    position,
    team,
    season,
    classOf: adult ? undefined : str(args, "class-of"),
    stats: parseStats(str(args, "stats")),
    playerHighlight: str(args, "highlight"),
    sportCode: sport.code,
    styleName: style.name,
    serial: str(args, "serial"),
    createdAt: today,
    visibility,
    channel: channel ?? (fictional ? "demo-etsy" : "etsy"),
    isFictional: fictional || undefined,
    ageBand: adult ? "adult" : undefined,
  };

  const front = str(args, "front");
  const back = str(args, "back");
  const mp4 = str(args, "mp4");
  if ((front && !back) || (back && !front)) throw new Error("--front and --back go together");
  const sourceKind = !fictional || [front, back, mp4].some((p) => p && isOrderSource(p)) ? "order" : "demo";
  const comment = `${fictional ? "Fictional roster card" : "Real customer — only what is printed on the card"}, minted by card:new on ${today}${number ? "" : " (numberless: the id carries an edition number)"}.`;
  const recordBlock = recordSource(record, comment);
  const sourceBlock = front && back
    ? `  ${JSON.stringify(cardId)}: {\n    front: ${JSON.stringify(front)},\n    back: ${JSON.stringify(back)},${mp4 ? `\n    mp4: ${JSON.stringify(mp4)},` : ""}\n    sourceKind: ${JSON.stringify(sourceKind)},\n    note: ${JSON.stringify(`Added by card:new on ${today}.`)},\n  },`
    : null;

  console.log(`card id: ${cardId}\n${recordBlock}${sourceBlock ? `\n\nart source:\n${sourceBlock}` : "\n\n(no --front/--back: add the sources to lib/registry/art-sources.ts and run cards:assets --id)"}`);
  if (flag(args, "dry")) {
    console.log("\n--dry: nothing written");
    return;
  }

  insertAbove(CARDS_FILE, CARDS_MARKER, recordBlock);
  if (sourceBlock) insertAbove(SOURCES_FILE, SOURCES_MARKER, sourceBlock);
  console.log(`\nappended ${cardId} to lib/registry/cards.ts${sourceBlock ? " and lib/registry/art-sources.ts" : ""}`);

  execFileSync(TSX, [path.join(ROOT, "scripts", "gen-card-qr.ts")], { stdio: "inherit", cwd: ROOT });
  if (sourceBlock) {
    const assetArgs = [path.join(ROOT, "scripts", "card-assets.ts"), "--id", cardId];
    if (flag(args, "allow-orders") || sourceKind === "order") assetArgs.push("--allow-orders");
    execFileSync(TSX, assetArgs, { stdio: "inherit", cwd: ROOT });
  }
}

const isMain = Boolean(process.argv[1]) && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  try {
    main();
  } catch (err) {
    console.error(`card:new — ${(err as Error).message}`);
    process.exit(1);
  }
}
