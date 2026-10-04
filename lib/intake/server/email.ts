// The two emails a completed free-proof request sends, through Resend's REST API with a plain fetch
// (no SDK dependency): the owner's notification and the parent's confirmation. Text + a simple HTML
// rendering of the same text, both answering to the support inbox.
//
// Never throws: a failed send is logged by status code only (no address, no key, no link) and reported
// as `false` — the request is already stored, so the parent still gets their thank-you page. Each send
// carries an Idempotency-Key, so two racing completes cannot email twice.

import { BRAND, SUPPORT_EMAIL } from "../../site";
import { INTAKE_COPY } from "../copy";
import type { EmailConfig } from "./env";
import type { StoredRequest } from "./record";
import { athleteName, photoState, renderSummary, sportLabel, styleShort } from "./summary";

export const RESEND_ENDPOINT = "https://api.resend.com/emails";

export interface OutgoingEmail {
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo: string;
  idempotencyKey: string;
}

export interface EmailLinks {
  /** Object path → 7-day signed URL (null = not found in storage). */
  files: Map<string, string | null>;
  requestJson: string | null;
}

const oneLine = (s: string): string => s.replace(/[\r\n\t]+/g, " ").replace(/\s{2,}/g, " ").trim();

export const ownerSubject = (r: StoredRequest): string =>
  oneLine(`Free proof request ${r.requestId} — ${athleteName(r)} (${sportLabel(r.athlete.sportSlug)}, ${styleShort(r.style)})`);

export const customerSubject = (r: StoredRequest): string => `We have your photos — your free proof is in the queue (${r.requestId})`;

const escapeHtml = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const LINKABLE = /(https?:\/\/[^\s<]+)|([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/g;
/** "WHAT TO MAKE", "PHOTOS (3 of 5 arrived)" — the summary's section titles. */
const SECTION_TITLE = /^[A-Z]{4,}( [A-Z]{2,})*( \([^)]*\))?$/;

/** The same words as the text part: paragraphs on blank lines, links and addresses clickable, CAPS headings bold. */
export function textToHtml(text: string): string {
  const paragraphs = text
    .trim()
    .split(/\n{2,}/)
    .map((para) => {
      const lines = para.split("\n").map((raw, i) => {
        const html = escapeHtml(raw).replace(LINKABLE, (match, url: string | undefined) =>
          url ? `<a href="${match}">${match}</a>` : `<a href="mailto:${match}">${match}</a>`,
        );
        return i === 0 && SECTION_TITLE.test(raw) ? `<strong>${html}</strong>` : html;
      });
      return `<p style="margin:0 0 16px">${lines.join("<br>")}</p>`;
    });
  return [
    '<!doctype html><html><body style="margin:0;padding:24px;background:#ffffff;color:#111111;',
    "font:15px/1.55 -apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif\">",
    `<div style="max-width:640px">${paragraphs.join("")}</div></body></html>`,
  ].join("");
}

export function ownerEmail(cfg: EmailConfig, record: StoredRequest, links: EmailLinks): OutgoingEmail {
  const state = photoState(record);
  const intro = [
    `New free-proof request ${record.requestId}.`,
    `Reply to the parent: ${record.contact.name} <${record.contact.email}>`,
    state.arrived === state.sent
      ? `All ${state.sent} photos arrived.`
      : `Only ${state.arrived} of ${state.sent} photos arrived — ask the parent for the rest.`,
    record.contact.neededBy ? `Needed by ${record.contact.neededBy}.` : null,
    `The links stay valid for 7 days. To download everything: npx tsx scripts/intake-pull.ts ${record.requestId}`,
  ]
    .filter(Boolean)
    .join("\n");
  const text = `${intro}\n\n${renderSummary(record, { audience: "owner", links: links.files, requestJsonLink: links.requestJson })}\n`;
  return { to: cfg.ownerTo, subject: ownerSubject(record), text, html: textToHtml(text), replyTo: cfg.replyTo, idempotencyKey: `${record.requestId}-owner` };
}

export function customerEmail(cfg: EmailConfig, record: StoredRequest): OutgoingEmail {
  const t = INTAKE_COPY.thanks;
  const state = photoState(record);
  const first = record.contact.name.split(/\s+/)[0] || "there";
  const text = `${[
    `Hi ${oneLine(first)},`,
    t.lead,
    `${t.referenceLabel}: ${record.requestId}`,
    state.arrived < state.sent
      ? `${state.arrived} of your ${state.sent} photos arrived. Reply to this email with the others attached and we'll add them to your request.`
      : null,
    ["What happens next:", ...t.next.map((step, i) => `${i + 1}. ${step}`)].join("\n"),
    t.nothingToPay,
    "Reply to this email to add photos or details — it carries your reference.",
    `${BRAND}\n${SUPPORT_EMAIL}`,
    `YOUR REQUEST\n\n${renderSummary(record, { audience: "customer" })}`,
  ]
    .filter(Boolean)
    .join("\n\n")}\n`;
  return {
    to: record.contact.email,
    subject: customerSubject(record),
    text,
    html: textToHtml(text),
    replyTo: cfg.replyTo,
    idempotencyKey: `${record.requestId}-customer`,
  };
}

/** POSTs one email to Resend. True on 2xx; otherwise logs the status (never the payload) and returns false. */
export async function sendEmail(cfg: EmailConfig, email: OutgoingEmail, label: string): Promise<boolean> {
  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfg.apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": email.idempotencyKey,
      },
      body: JSON.stringify({
        from: cfg.from,
        to: [email.to],
        subject: email.subject,
        text: email.text,
        html: email.html,
        reply_to: email.replyTo,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (response.ok) return true;
    console.warn(`[intake] email ${label} failed: HTTP ${response.status}`);
    return false;
  } catch (error) {
    console.warn(`[intake] email ${label} failed: ${error instanceof Error ? error.name : "error"}`);
    return false;
  }
}

export async function sendRequestEmails(cfg: EmailConfig | null, record: StoredRequest, links: EmailLinks): Promise<{ owner: boolean; customer: boolean }> {
  if (!cfg) {
    console.warn(`[intake] email ${record.requestId} skipped: RESEND_API_KEY is not set`);
    return { owner: false, customer: false };
  }
  const [owner, customer] = await Promise.all([
    sendEmail(cfg, ownerEmail(cfg, record, links), `owner ${record.requestId}`),
    sendEmail(cfg, customerEmail(cfg, record), `customer ${record.requestId}`),
  ]);
  return { owner, customer };
}
