// Owner CLI for free-proof requests — runs on the owner's machine, never on the site.
//
//   npx tsx scripts/intake-pull.ts <requestId> [--out orders/<requestId>]
//       Downloads request.json, the photos and the crest of one request into <out>/from-buyer/
//       (default orders/<requestId>/from-buyer/ — orders/ is git-ignored: these are personal data) and
//       prints the request summary.
//   npx tsx scripts/intake-pull.ts --list [--month 2026-10]
//       Lists one month's requests and their status. "upload not completed" = the parent started but
//       never finished uploading: the contact details are in the record — follow up by email.
//
// Credentials: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (SUPABASE_STORAGE_BUCKET optional) from the
// environment, or from .env.local via the small parser below (no dotenv dependency; variables already
// in the environment win). Never runs git, never commits anything. (package.json is not edited, so there
// is no npm script alias — call it with npx tsx as above.)

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DEFAULT_BUCKET } from "../lib/intake/server/env";
import type { StoredRequest } from "../lib/intake/server/record";
import { listRequestIds, openBucket, readBytes, readJson, requestFolder, requestJsonPath, type Bucket } from "../lib/intake/server/storage";
import { athleteName, renderSummary, sportLabel, styleShort } from "../lib/intake/server/summary";
import { REQUEST_ID } from "../lib/intake/types";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USAGE = [
  "Usage:",
  "  npx tsx scripts/intake-pull.ts <requestId> [--out orders/<requestId>]",
  "  npx tsx scripts/intake-pull.ts --list [--month YYYY-MM]",
  "Needs SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment or in .env.local.",
].join("\n");

/** KEY=value lines; `export`, quotes and trailing " # comments" handled; blank lines and comments skipped. */
export function parseDotenv(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const match = /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(line);
    if (!match) continue;
    let value = match[2].trim();
    const quote = value[0];
    if (quote === '"' || quote === "'") {
      const end = value.indexOf(quote, 1);
      value = end > 0 ? value.slice(1, end) : value.slice(1);
      if (quote === '"') value = value.replace(/\\n/g, "\n");
    } else {
      value = value.replace(/\s+#.*$/, "").trim();
    }
    out[match[1]] = value;
  }
  return out;
}

function loadEnvFile(file: string): void {
  if (!fs.existsSync(file)) return;
  for (const [key, value] of Object.entries(parseDotenv(fs.readFileSync(file, "utf8")))) {
    if (process.env[key] === undefined || process.env[key] === "") process.env[key] = value;
  }
}

export type Args =
  | { mode: "pull"; requestId: string; out: string }
  | { mode: "list"; month: string }
  | { mode: "help"; error?: string };

export function parseArgs(argv: string[], now: Date = new Date()): Args {
  const flags = new Map<string, string>();
  const positional: string[] = [];
  let list = false;
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--list") list = true;
    else if (arg === "--help" || arg === "-h") return { mode: "help" };
    else if (arg === "--out" || arg === "--month") {
      const value = argv[i + 1];
      if (!value || value.startsWith("--")) return { mode: "help", error: `${arg} needs a value.` };
      flags.set(arg, value);
      i += 1;
    } else if (arg.startsWith("-")) return { mode: "help", error: `Unknown option ${arg}.` };
    else positional.push(arg);
  }
  if (list) {
    const month = flags.get("--month") ?? now.toISOString().slice(0, 7);
    return /^\d{4}-\d{2}$/.test(month) ? { mode: "list", month } : { mode: "help", error: "--month is YYYY-MM." };
  }
  const requestId = (positional[0] ?? "").trim().toUpperCase();
  if (!REQUEST_ID.test(requestId)) return { mode: "help", error: positional[0] ? `Not a request reference: ${positional[0]}` : undefined };
  return { mode: "pull", requestId, out: flags.get("--out") ?? path.join("orders", requestId) };
}

async function pull(bucket: Bucket, bucketName: string, requestId: string, out: string): Promise<number> {
  const record = await readJson<StoredRequest>(bucket, requestJsonPath(requestId));
  if (!record) {
    console.error(`No request ${requestId} in bucket "${bucketName}" (looked for ${requestJsonPath(requestId)}).`);
    return 1;
  }
  const folder = requestFolder(requestId);
  const outDir = path.resolve(out, "from-buyer");
  fs.mkdirSync(outDir, { recursive: true });
  const jsonFile = path.join(outDir, "request.json");
  fs.writeFileSync(jsonFile, `${JSON.stringify(record, null, 2)}\n`);

  const wanted = record.uploaded ?? record.issued;
  const paths = [...wanted.photos, ...(wanted.crest ? [wanted.crest] : [])];
  const links = new Map<string, string | null>();
  let saved = 0;
  for (const objectPath of paths) {
    const bytes = await readBytes(bucket, objectPath);
    if (!bytes) {
      links.set(objectPath, null);
      continue;
    }
    const local = path.join(outDir, objectPath.slice(folder.length + 1));
    fs.mkdirSync(path.dirname(local), { recursive: true });
    fs.writeFileSync(local, bytes);
    links.set(objectPath, path.relative(process.cwd(), local));
    saved += 1;
  }
  console.log(renderSummary(record, { audience: "owner", links, requestJsonLink: path.relative(process.cwd(), jsonFile) }));
  const state = record.status === "received" ? "Received" : "Upload not completed (the parent never finished)";
  console.log(`\n${state} · ${saved} of ${paths.length} file(s) saved to ${path.relative(process.cwd(), outDir)}/`);
  return 0;
}

async function list(bucket: Bucket, month: string): Promise<number> {
  const ids = await listRequestIds(bucket, month);
  if (!ids.length) {
    console.log(`No requests in ${month}.`);
    return 0;
  }
  for (const id of ids) {
    const r = await readJson<StoredRequest>(bucket, requestJsonPath(id)).catch(() => null);
    if (!r) {
      console.log(`${id}  (request.json missing or unreadable)`);
      continue;
    }
    const status = r.status === "received" ? `received, ${r.uploaded?.photos.length ?? 0}/${r.photos.length} photos` : "upload not completed";
    const emails = r.emails && !(r.emails.owner && r.emails.customer) ? " · EMAIL NOT SENT" : "";
    console.log(`${id}  ${status}${emails}  ${athleteName(r)} (${sportLabel(r.athlete.sportSlug, r.athlete.sportOther)}, ${styleShort(r.style)})  ${r.contact.name} <${r.contact.email}>`);
  }
  return 0;
}

/** The CLI. `envFile` is a parameter only so the tests never read the real .env.local. */
export async function main(argv: string[], envFile: string = path.join(ROOT, ".env.local")): Promise<number> {
  const args = parseArgs(argv);
  if (args.mode === "help") {
    if (args.error) console.error(args.error);
    console.log(USAGE);
    return args.error ? 1 : 0;
  }
  loadEnvFile(envFile);
  const url = (process.env.SUPABASE_URL ?? "").trim().replace(/\/+$/, "");
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim();
  const bucketName = (process.env.SUPABASE_STORAGE_BUCKET ?? "").trim() || DEFAULT_BUCKET;
  if (!url || !serviceKey) {
    console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY — in the environment or as two lines in .env.local.");
    return 1;
  }
  const bucket = openBucket({ url, serviceKey, bucket: bucketName });
  return args.mode === "list" ? list(bucket, args.month) : pull(bucket, bucketName, args.requestId, args.out);
}

const isMain = Boolean(process.argv[1]) && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  main(process.argv.slice(2)).then(
    (code) => process.exit(code),
    (error: unknown) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    },
  );
}
