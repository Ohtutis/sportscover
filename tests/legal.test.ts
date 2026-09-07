// Legal pages (CONTRACTS §5.7, COPY §2.14 / §2.16, GAPS #14 / #19 / #31): /privacy,
// /privacy/biometric, /terms and /accessibility. The pages are synchronous server components, so
// renderToStaticMarkup gives us the real body — the assertions below are about what a reader (and a
// regulator) actually sees, not about the source layout.
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import PrivacyPage, { metadata as privacyMetadata } from "../app/(marketing)/privacy/page";
import BiometricPage, { metadata as biometricMetadata } from "../app/(marketing)/privacy/biometric/page";
import TermsPage, { metadata as termsMetadata } from "../app/(marketing)/terms/page";
import AccessibilityPage, { metadata as accessibilityMetadata } from "../app/(marketing)/accessibility/page";
import { PAGES } from "../lib/seo/titles";
import { IMPRINT, SUPPORT_EMAIL, imprintComplete } from "../lib/site";
import type { Metadata } from "next";

const VERSION_LINE = "Version 2026-09-F1 · effective September 7, 2026";
const IMPRINT_FALLBACK = "independent custom design studio operated from Lithuania";

interface LegalPage {
  name: string;
  path: string;
  file: string;
  component: ComponentType;
  metadata: Metadata;
  h1: string;
}

const PAGES_UNDER_TEST: LegalPage[] = [
  {
    name: "/privacy",
    path: "/privacy",
    file: "app/(marketing)/privacy/page.tsx",
    component: PrivacyPage,
    metadata: privacyMetadata,
    h1: "PRIVACY POLICY.",
  },
  {
    name: "/privacy/biometric",
    path: "/privacy/biometric",
    file: "app/(marketing)/privacy/biometric/page.tsx",
    component: BiometricPage,
    metadata: biometricMetadata,
    h1: "THE LIKENESS CHECK.",
  },
  {
    name: "/terms",
    path: "/terms",
    file: "app/(marketing)/terms/page.tsx",
    component: TermsPage,
    metadata: termsMetadata,
    h1: "TERMS OF SERVICE.",
  },
  {
    name: "/accessibility",
    path: "/accessibility",
    file: "app/(marketing)/accessibility/page.tsx",
    component: AccessibilityPage,
    metadata: accessibilityMetadata,
    h1: "ACCESSIBILITY.",
  },
];

const render = (p: LegalPage): string => renderToStaticMarkup(createElement(p.component));
const source = (p: LegalPage): string => fs.readFileSync(path.join(process.cwd(), p.file), "utf8");

const markup = new Map(PAGES_UNDER_TEST.map((p) => [p.name, render(p)]));
const html = (name: string): string => markup.get(name)!;

describe("legal pages — shell", () => {
  for (const p of PAGES_UNDER_TEST) {
    it(`${p.name} renders one H1 and the copy's heading`, () => {
      const m = html(p.name);
      expect(m.match(/<h1\b/g) ?? []).toHaveLength(1);
      expect(m).toContain(p.h1);
    });

    it(`${p.name} carries the version line in the label font`, () => {
      expect(html(p.name)).toContain(VERSION_LINE);
      expect(html(p.name)).toMatch(/class="[^"]*font-label[^"]*"[^>]*>\s*Version 2026-09-F1/);
    });

    it(`${p.name} has breadcrumbs with BreadcrumbList JSON-LD`, () => {
      const m = html(p.name);
      expect(m).toContain('aria-label="Breadcrumb"');
      expect(m).toContain('"@type":"BreadcrumbList"');
    });

    it(`${p.name} never says TEMPLATE, and has no eyebrow (GAPS #14)`, () => {
      expect(html(p.name)).not.toMatch(/TEMPLATE/);
      expect(source(p)).not.toMatch(/TEMPLATE/);
      expect(html(p.name)).not.toContain('class="eyebrow"');
    });

    it(`${p.name} takes its metadata from PAGES`, () => {
      const table = PAGES[p.path];
      expect(table, `${p.path} must be in PAGES`).toBeDefined();
      expect(table.phase).toBe("F1");
      expect(p.metadata.title).toBe(table.title);
      expect(p.metadata.description).toBe(table.description);
      expect(p.metadata.alternates?.canonical).toBe(p.path);
    });

    it(`${p.name} gives the reader a contact address`, () => {
      expect(html(p.name)).toContain(SUPPORT_EMAIL);
    });
  }
});

describe("legal pages — anchors other pages link to", () => {
  it("/privacy has the subprocessors anchor", () => {
    expect(html("/privacy")).toContain('id="subprocessors"');
  });

  it("/terms has the refunds and registry anchors", () => {
    expect(html("/terms")).toContain('id="refunds"');
    expect(html("/terms")).toContain('id="registry"');
  });

  it("every anchored section can be scrolled clear of the header", () => {
    for (const name of ["/privacy", "/terms"]) {
      for (const m of html(name).matchAll(/<section id="[^"]+"([^>]*)>/g)) {
        expect(m[1]).toContain("scroll-mt-20");
      }
    }
  });
});

describe("legal pages — the imprint is gated, never a placeholder", () => {
  it("privacy and terms follow imprintComplete()", () => {
    for (const name of ["/privacy", "/terms"]) {
      const m = html(name);
      if (imprintComplete()) {
        expect(m).toContain(IMPRINT.legalName);
        expect(m).toContain(IMPRINT.address);
      } else {
        expect(m).toContain(IMPRINT_FALLBACK);
        // GAPS #19: no entity or registration claim before the imprint env vars exist.
        expect(m).not.toMatch(/legal entity|Registered in Lithuania|details coming/i);
      }
    }
  });
});

describe("/privacy — the numbers a regulator checks", () => {
  const m = () => html("/privacy");

  it("names the retention periods: 30 days, 12 months, at least five years", () => {
    expect(m()).toContain("Deleted 30 days after delivery");
    expect(m()).toContain("12 months");
    expect(m()).toContain("At least five years");
  });

  it("lists every subprocessor", () => {
    for (const provider of [
      "Vercel",
      "Supabase",
      "Cloudflare R2",
      "Google Cloud Vertex AI",
      "Stripe",
      "Resend",
      "Etsy and Etsy Payments",
      "Printing partners",
    ]) {
      expect(m()).toContain(provider);
    }
  });

  it("marks the direct-ordering providers as future (GAPS #31)", () => {
    const from = m().match(/from the day direct ordering opens on this site/g) ?? [];
    expect(from.length).toBe(3); // Supabase, Cloudflare R2, Stripe
    expect(m()).not.toContain("reprinted at cost");
  });

  it("states the GDPR basis, the COPPA position and the transfer note", () => {
    expect(m()).toContain("Legal basis (GDPR)");
    expect(m()).toContain("Children (COPPA and GDPR)");
    expect(m()).toContain("EU–US Data Privacy Framework");
  });

  it("keeps the card page unlisted by default and points at the biometric policy", () => {
    expect(m()).toContain("unlisted by default");
    expect(m()).toContain("/privacy/biometric");
  });
});

describe("/privacy/biometric — the state-law policy", () => {
  const m = () => html("/privacy/biometric");

  it("names the three state laws and GDPR Article 9", () => {
    expect(m()).toContain("Illinois Biometric Information Privacy Act");
    expect(m()).toContain("Texas Capture or Use of Biometric Identifier Act");
    expect(m()).toContain("Washington&#x27;s biometric identifier law");
    expect(m()).toContain("Article 9 of the GDPR");
  });

  it("promises consent, no sale, no training and destruction in 30 days", () => {
    expect(m()).toContain("only with the written consent");
    expect(m()).toMatch(/never sell, lease, trade, share/);
    expect(m()).toMatch(/never use it to train AI models/);
    expect(m()).toContain("within 30 days");
  });
});

describe("/terms — the promises the copy is built on", () => {
  const m = () => html("/terms");

  it("lets a buyer cancel with a full refund until the reference plate is approved", () => {
    expect(m()).toContain("Until you approve the reference plate you may cancel for any reason with a full refund.");
  });

  it("carries the personalized-goods and digital-content waivers", () => {
    expect(m()).toContain("goods made to the consumer&#x27;s specifications");
    expect(m()).toContain("waive the withdrawal right once the files are delivered");
  });

  it("counts the delivery clocks from the order date and starts printing at proof approval (D5)", () => {
    expect(m()).toContain("Both clocks start on the day you order");
    expect(m()).toContain("a proof left waiting moves the ship date by the same amount");
    expect(m()).toContain("counted in US Eastern business days from the order date");
  });

  it("keeps the registry for at least five years and pledges the wind-down", () => {
    expect(m()).toContain("at least five years from the order date");
    expect(m()).toContain("If the service ever winds down");
  });

  it("says Etsy orders also run under Etsy's rules, and Lithuanian law governs", () => {
    expect(m()).toContain("Etsy&#x27;s purchase terms");
    expect(m()).toContain("laws of the Republic of Lithuania");
  });
});

describe("/accessibility — the WCAG 2.2 AA statement", () => {
  const m = () => html("/accessibility");

  it("names the standard, the level and a way to report a problem", () => {
    expect(m()).toContain("Web Content Accessibility Guidelines (WCAG) 2.2 at level AA");
    expect(m()).toContain("within 5 business days");
    expect(m()).toContain(`mailto:${SUPPORT_EMAIL}`);
  });
});
