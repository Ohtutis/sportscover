"use client";

import { ReactNode, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BrandMark } from "../components/BrandMark";
import { FictionalLabel } from "../components/FictionalLabel";

export type TierView = { sku: string; name: string; current: string; compareAt?: string; notes: string[]; featured?: boolean; physical: boolean };
export type FamilyView = { key: string; label: string; from: string; deliverables: readonly string[]; etsySku: string; tiers: TierView[] };
export type SiteData = {
  brand: string;
  supportEmail: string;
  /** Rendered on the server (ISR) so the footer year never differs between server and client HTML. */
  year: number;
  chips: string;
  shippingSentence: string;
  families: FamilyView[];
  sports: { slug: string; code: string; name: string; numbered: boolean; image?: string }[];
  styles: { code: string; name: string; material: string; image: string; isOccasion: boolean }[];
  faq: [string, string][];
  blocks: { promise: string; howItsMade: string; photoPrivacy: string; independent: string; photos: string; logo: string };
  imprint: { legalName: string; companyCode: string; vat: string; address: string; responsiblePerson: string } | null;
};

const ETSY_SET = "/go/etsy/GDE-ANY-SET-DIG";

const heroSlides = [
  { sport: "Basketball", src: "/images/hero-basketball.webp", alt: "Fictional basketball athlete in cinematic poster artwork" },
  { sport: "Football", src: "/images/hero-football.webp", alt: "Fictional American football athlete in cinematic poster artwork" },
  { sport: "Softball", src: "/images/hero-softball.webp", alt: "Fictional softball athlete in cinematic poster artwork" },
] as const;

function HeroShowcase() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setIndex((current) => (current + 1) % heroSlides.length), 3000);
    return () => clearInterval(id);
  }, []);
  return (
    <figure className="hero-art">
      <div className="hero-stage">
        {heroSlides.map((slide, idx) => (
          <Image key={slide.sport} src={slide.src} alt={slide.alt} fill priority={idx === 0} sizes="(max-width: 960px) 88vw, 40vw" className={idx === index ? "hero-slide active" : "hero-slide"} />
        ))}
        <span className="hero-badge" key={heroSlides[index].sport}>{heroSlides[index].sport}</span>
        <span className="hero-caption"><FictionalLabel /></span>
      </div>
      <div className="hero-dots" role="group" aria-label="Sport showcase">
        {heroSlides.map((slide, idx) => (
          <button key={slide.sport} type="button" aria-pressed={idx === index} aria-label={`Show ${slide.sport} example`} className={idx === index ? "active" : ""} onClick={() => setIndex(idx)} />
        ))}
      </div>
    </figure>
  );
}

function SectionHeading({ eyebrow, title, copy, center = false }: { eyebrow: string; title: string; copy?: string; center?: boolean }) {
  return (
    <div className={`section-heading ${center ? "center" : ""}`}>
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {copy && <p>{copy}</p>}
    </div>
  );
}

function Svg({ children }: { children: ReactNode }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
  );
}
const ArrowIcon = () => <Svg><path d="M7 7h10v10" /><path d="M7 17 17 7" /></Svg>;
const ArrowDownIcon = () => <Svg><path d="M12 5v14" /><path d="m19 12-7 7-7-7" /></Svg>;
const SwapIcon = () => <Svg><path d="M8 3 4 7l4 4" /><path d="M4 7h16" /><path d="m16 21 4-4-4-4" /><path d="M20 17H4" /></Svg>;
const CheckIcon = () => <Svg><path d="M20 6 9 17l-5-5" /></Svg>;
const XIcon = () => <Svg><path d="M18 6 6 18" /><path d="m6 6 12 12" /></Svg>;
const PlusIcon = () => <Svg><path d="M5 12h14" /><path d="M12 5v14" /></Svg>;
const MenuIcon = () => <Svg><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" /></Svg>;
const TargetIcon = () => <Svg><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" /></Svg>;
const ImageIcon = () => <Svg><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" /></Svg>;
const ReviewIcon = () => <Svg><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /><path d="m8 11 2 2 4-4" /></Svg>;
const BadgeCheckIcon = () => <Svg><circle cx="12" cy="12" r="9" /><path d="m8.5 12 2.5 2.5 4.5-5" /></Svg>;
const PackageIcon = () => <Svg><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></Svg>;
const processIcons = [TargetIcon, ImageIcon, ReviewIcon, BadgeCheckIcon, PackageIcon];

const outputs = ["Printed trading cards", "Custom poster", "Certificate of Authenticity", "Card flip video", "Phone & desktop wallpapers", "Live registry page"];

export default function SiteClient({ data }: { data: SiteData }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAllSports, setShowAllSports] = useState(false);
  const [showMobileCta, setShowMobileCta] = useState(false);
  const [slider, setSlider] = useState(50);

  useEffect(() => {
    const hero = document.getElementById("top");
    if (!hero) return;
    const observer = new IntersectionObserver(([entry]) => setShowMobileCta(!entry.isIntersecting), { threshold: 0.05 });
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const root = document.querySelector("main");
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const targets = Array.from(root.querySelectorAll<HTMLElement>(".section, .trust-strip, .team-section, .final-cta"));
    root.classList.add("js-reveal");
    targets.forEach((el) => el.classList.add("reveal"));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -8% 0px" });
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const visibleSports = showAllSports ? data.sports : data.sports.slice(0, 6);
  const teamMail = `mailto:${data.supportEmail}?subject=${encodeURIComponent("Team order — Game Day Edition")}&body=${encodeURIComponent("Sport:\nRoster size:\nEvent date:\nTeam / club:\n")}`;

  return (
    <main>
      <div className="announcement">Custom sports trading cards &amp; posters from your photo · Printed in the US</div>
      <header className="site-header">
        <BrandMark href="#top" />
        <nav id="site-nav" className={menuOpen ? "nav open" : "nav"} aria-label="Primary navigation">
          <a href="#examples" onClick={() => setMenuOpen(false)}>Examples</a>
          <a href="#styles" onClick={() => setMenuOpen(false)}>Styles</a>
          <a href="#how" onClick={() => setMenuOpen(false)}>How It Works</a>
          <a href="#pricing" onClick={() => setMenuOpen(false)}>Pricing</a>
          <a href="#faq" onClick={() => setMenuOpen(false)}>FAQ</a>
          <Link href="/registry" onClick={() => setMenuOpen(false)}>Registry</Link>
        </nav>
        <button className="menu-button" aria-expanded={menuOpen} aria-controls="site-nav" aria-label="Toggle navigation" onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? <XIcon /> : <MenuIcon />}{menuOpen ? "Close" : "Menu"}</button>
        <a className="button small header-cta" href={ETSY_SET}>Order on Etsy <ArrowIcon /></a>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <span className="eyebrow"><i /> ONE ATHLETE. ONE REGISTERED EDITION.</span>
          <h1>Their Photos. Their Poster. <em>Their Own Trading Cards.</em></h1>
          <p>Send 4–10 real photos and get a custom poster, printed trading cards and the matching digital set — composed around your athlete, not dropped into a template. You approve a proof before anything prints.</p>
          <div className="button-row">
            <a className="button" href={ETSY_SET}>Order on Etsy <ArrowIcon /></a>
            <a className="text-link" href="#transformation">See the transformation <ArrowDownIcon /></a>
          </div>
          <p className="chips">{data.chips}</p>
          <div className="microcopy"><span><CheckIcon /> Proof before print</span><span><CheckIcon /> Free printed certificate with every shipped package</span><span><CheckIcon /> Printed and shipped free in the US</span></div>
        </div>
        <HeroShowcase />
      </section>

      <section className="trust-strip" aria-label="What makes it different">
        {["Built from your photos", "Proof before print", "A registered card ID on every card", "Free printed certificate"].map((item, index) => <div key={item}><span>0{index + 1}</span>{item}</div>)}
      </section>

      <section className="section output-section" id="examples">
        <SectionHeading eyebrow="ONE ATHLETE. A COMPLETE EDITION." title="More Than a Digital Design." copy="A custom poster, printed trading cards with a free certificate, the matching digital set, a card flip video — and a registered card page that opens from the QR code on the back of every card." />
        <div className="output-grid">
          <div className="output-image"><Image src="/images/hero-identity-pack.webp" alt="Example edition: a framed poster, printed trading cards, social graphics and phone wallpaper for a fictional basketball athlete" width={1570} height={1001} sizes="(max-width: 1080px) 100vw, 68vw" /></div>
          <div className="output-list">{outputs.map((output, index) => <div key={output}><span>0{index + 1}</span><strong>{output}</strong><i>By package</i></div>)}</div>
        </div>
        <p className="fine-print"><FictionalLabel /> Printed items are produced only after you approve the proof. What is included depends on the package.</p>
      </section>

      <section className="section transformation-section" id="transformation">
        <SectionHeading eyebrow="THE TRANSFORMATION" title="Your Photo. Their Moment." copy="We start from the athlete's real face, uniform and game-day details — then build the lighting, atmosphere and composition around them." />
        <div className="comparison" style={{ "--reveal": `${slider}%` } as React.CSSProperties}>
          <div className="comparison-pane before" role="img" aria-label="A phone photo of a fictional basketball athlete" />
          <div className="comparison-pane after" role="img" aria-label="The same fictional athlete composed into cinematic sports artwork" />
          <div className="comparison-line" aria-hidden="true"><span><SwapIcon /></span></div>
          <span className="comparison-label left">Your photo</span><span className="comparison-label right">Custom artwork</span>
          <input type="range" min="8" max="92" value={slider} onChange={(event) => setSlider(Number(event.target.value))} aria-label="Compare original photo and final artwork" />
        </div>
        <p className="trust-note"><FictionalLabel /> {data.blocks.howItsMade}</p>
      </section>

      <section className="section sports-section">
        <SectionHeading eyebrow="BUILT FOR THEIR SPORT" title="Seventeen Sports. Their Own Card." copy="The composition, equipment, texture and atmosphere are adapted to the sport. Sports that don't wear numbers get their name and club crest instead." />
        <div className="sports-grid">{visibleSports.map((sport, index) => (
          <a key={sport.slug} className="sport-card" href={`/go/etsy/GDE-${sport.code}-CARD-P12`}>
            <span className="sport-media" aria-hidden="true">
              {sport.image ? <Image src={sport.image} alt="" fill sizes="(max-width: 560px) 45vw, 20vw" /> : <span className="sport-fallback">{sport.name.slice(0, 2).toUpperCase()}</span>}
            </span>
            <span className="sport-caption"><small>{String(index + 1).padStart(2, "0")}</small><strong>{sport.name}</strong><i><ArrowIcon /></i></span>
          </a>
        ))}</div>
        <div className="sports-actions"><button type="button" className="outline-button" aria-expanded={showAllSports} onClick={() => setShowAllSports((current) => !current)}>{showAllSports ? "Show fewer sports" : `View all ${data.sports.length} sports`} <ArrowIcon /></button></div>
        <p className="fine-print"><FictionalLabel /> Every card shown is a fictional roster athlete. Your card carries their name and their club crest — and their number where the sport has one.</p>
      </section>

      <section className="section styles-section" id="styles">
        <SectionHeading eyebrow="SIX FINISHES + SENIOR NIGHT" title="One Athlete, Six Finishes." copy="Every finish is rebuilt around your athlete — their photos, colors, uniform and sport. Senior Night is an occasion edition with its own gold treatment, class year and four-year career line." />
        <div className="styles-grid">{data.styles.map((style, index) => (
          <a className="style-card" key={style.code} href={style.isOccasion ? "/go/etsy/GDE-ANY-SNSET-DIG" : ETSY_SET}>
            <span className="style-image"><Image src={style.image} alt={`${style.name} finish — example card front, fictional athlete`} fill sizes="(max-width: 560px) 90vw, 20vw" /></span>
            <span className="style-copy"><small>0{index + 1}</small><strong>{style.name}</strong><em>{style.material}</em></span>
          </a>
        ))}</div>
        <p className="fine-print"><FictionalLabel /> One fictional athlete, six finishes. Your artwork is personalized with the name, number, team colors and stats you send.</p>
      </section>

      <section className="section process-section" id="how">
        <SectionHeading eyebrow="HOW IT WORKS" title="From Camera Roll to the Wall." center />
        <div className="process-grid">{[
          ["Choose sport & style", "Pick the sport and one of six finishes — or the Senior Night edition."],
          ["Send 4–10 photos", "A clear face, a few angles, one in the team kit. We check them before any art is made."],
          ["We build the athlete", "A reference of your athlete first, then the shots — every one checked against it."],
          ["Approve the proof", "You see it first. One revision included. Nothing prints until you approve."],
          ["Print & deliver", "Digital files within 1–2 business days of your order; printed items ship within 5–7, with a printed certificate. Printing starts the moment you approve."],
        ].map(([title, copy], index) => { const Icon = processIcons[index]; return <article key={title}><span>0{index + 1}</span><div className="process-icon"><Icon /></div><h3>{title}</h3><p>{copy}</p></article>; })}</div>
        <p className="process-note">{data.chips} · {data.shippingSentence}</p>
      </section>

      <section className="section difference-section">
        <SectionHeading eyebrow="DESIGNED, NOT FILTERED" title="It Should Still Look Like Them." copy="The point is not the smoke or the lights. It is your athlete — recognizable, in their own uniform, with the details that make the season theirs." />
        <div className="value-grid">{[
          ["Real likeness first", "We build a reference of your athlete from your photos and check every shot against it. If it doesn't look like them, it doesn't ship."],
          ["Their sport, their crest", "The pose, equipment and atmosphere fit the actual sport. Your school or club's own crest goes on exactly as you send it."],
          ["A person finishes every piece", data.blocks.howItsMade],
        ].map(([title, copy], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
      </section>

      <section className="section pricing-section" id="pricing">
        <SectionHeading eyebrow="CARDS · POSTERS · THE COMPLETE SET" title="Choose Their Edition." copy="The same packages as our Etsy shop, in Etsy's own words. Every shipped package includes a free printed Certificate of Authenticity." center />
        <div className="pricing-grid">{data.families.map((family) => (
          <article className={`price-card ${family.key === "set" ? "featured" : ""}`} key={family.key}>
            {family.key === "set" && <span className="price-badge">Most complete</span>}
            <div className="price-top"><h3>{family.label}</h3><strong>from {family.from}</strong><p>{family.deliverables.slice(0, 3).join(" · ")}</p></div>
            <ul className="tier-list">{family.tiers.map((tier) => (
              <li className="tier-row" key={tier.sku}>
                <span><strong>{tier.name}</strong>{tier.notes[0] && <small>{tier.notes[0]}</small>}</span>
                <span className="price-line">{tier.compareAt && <s className="price-compare">{tier.compareAt}</s>}<b>{tier.current}</b></span>
              </li>
            ))}</ul>
            <a className={family.key === "set" ? "button full" : "outline-button full"} href={`/go/etsy/${family.etsySku}`}>Order on Etsy <ArrowIcon /></a>
          </article>
        ))}</div>
        <p className="pricing-note"><strong>{data.chips}</strong> · {data.shippingSentence} One price list, no coupon codes — the sale price is shown for as long as it runs.</p>
        <p className="pricing-note">{data.blocks.promise}</p>
      </section>

      <section className="section guidelines-section" id="guidelines">
        <SectionHeading eyebrow="BETTER PHOTOS, BETTER ARTWORK" title="What Should You Send?" copy={data.blocks.photos} />
        <div className="guidelines-layout">
          <div className="guideline-visual">
            {["Clear face", "Visible uniform", "Action pose", "Heavy blur", "Too dark", "Too far away"].map((label, index) => <div className={`guide-panel guide-${index}`} key={label}><span>{index < 3 ? <><CheckIcon /> Good</> : <><XIcon /> Avoid</>}</span><strong>{label}</strong></div>)}
          </div>
          <div className="checklists"><div><h3>Photos that work well</h3>{["Face clearly visible and sharp", "One photo turned ~45° each way", "One full-body photo", "One in the team kit", "Original files, not screenshots"].map((item) => <p key={item}><CheckIcon />{item}</p>)}</div><div><h3>Try to avoid</h3>{["Sunglasses or a visor shadow", "Group shots with other faces the same size", "Heavy motion blur", "Very dark photos", "Tiny athlete far away"].map((item) => <p key={item}><XIcon />{item}</p>)}</div></div>
        </div>
        <p className="trust-note">Not sure? Send your best options. We check them before any art is made — and refund every cent if they can't carry the likeness.</p>
      </section>

      <section className="team-section">
        <Image src="/images/team-order.webp" alt="Example: a coordinated set of six fictional youth athlete posters displayed at a team banquet" width={1536} height={1024} sizes="100vw" />
        <div className="team-overlay"><span className="eyebrow">TEAMS · CLUBS · SENIOR CLASSES</span><h2>One Team Setup. Every Family Orders Their Own.</h2><p>You choose the finish, send the crest and colors once, set a deadline. Every family orders their own athlete, and each card is built and proofed individually — nobody&apos;s kid is a copy-paste.</p><a className="button" href={teamMail}>Email us about a team <ArrowIcon /></a><small>Same price per athlete as every order. The coach sees names and order status — never photos.</small></div>
      </section>

      <section className="section faq-section" id="faq"><SectionHeading eyebrow="THE DETAILS" title="Questions, Answered." center /><div className="faq-list">{data.faq.map(([question, answer]) => <details key={question}><summary>{question}<span><PlusIcon /></span></summary><p>{answer}</p></details>)}</div></section>

      <section className="final-cta"><span className="eyebrow">HOLD IT · HANG IT · REGISTER IT</span><h2>Their Season Deserves More <em>Than a Camera Roll.</em></h2><p>A custom poster, printed trading cards and a registered edition — built from the photos you already have.</p><a className="button" href={ETSY_SET}>Order on Etsy <ArrowIcon /></a><small>{data.chips}</small></section>

      <footer>
        <div className="footer-top"><BrandMark href="#top" /><p>Custom sports posters &amp; trading cards from your photo. One athlete, one registered edition.</p></div>
        <div className="footer-links">
          <div><strong>Explore</strong><a href="#examples">Examples</a><a href="#styles">Styles</a><a href="#how">How It Works</a><a href="#pricing">Pricing</a><a href="#guidelines">Photo Guidelines</a></div>
          <div><strong>Studio</strong><Link href="/registry">Registry lookup</Link><Link href="/contact">Contact</Link><a href="/etsy">Etsy shop</a><Link href="/privacy">Privacy</Link><Link href="/privacy/biometric">Biometric policy</Link><Link href="/terms">Terms</Link></div>
        </div>
        <p className="disclaimer">{data.blocks.independent}</p>
        {data.imprint && <p className="imprint">{data.imprint.legalName} · Company code {data.imprint.companyCode}{data.imprint.vat ? ` · VAT ${data.imprint.vat}` : ""} · {data.imprint.address} · Responsible person: {data.imprint.responsiblePerson} · {data.supportEmail}</p>}
        <div className="copyright"><span>© {data.year} {data.brand}. All rights reserved.</span><span>Your photos. Custom designed.</span></div>
      </footer>

      <a className={`mobile-sticky ${showMobileCta ? "visible" : ""}`} aria-hidden={!showMobileCta} tabIndex={showMobileCta ? 0 : -1} href={ETSY_SET}>Order on Etsy <ArrowIcon /></a>
    </main>
  );
}
