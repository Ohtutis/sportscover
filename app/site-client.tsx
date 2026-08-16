"use client";

import { ChangeEvent, FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import { addOns, faqItems, packages, siteConfig, sports, styleOptions } from "./site-config";

type FormData = Record<string, string | boolean>;
type PhotoRole = "face" | "action" | "uniform" | "additional";
type PreparedPhoto = {
  id: string;
  name: string;
  blob: Blob;
  preview: string;
  width: number;
  height: number;
  role: PhotoRole;
  progress: number;
};

const initialForm: FormData = {
  order_type: "Individual Athlete",
  sport: "",
  package_interest: "Signature Collector Pack — $199",
  add_on_interest: "",
  style: "Stadium Night",
  athlete_first_name: "",
  athlete_last_name: "",
  jersey_number: "",
  position_event: "",
  team_name: "",
  primary_color: "",
  secondary_color: "",
  graduation_year: "",
  season_year: "",
  headline: "",
  stats: "",
  team_size: "",
  customer_name: "",
  customer_email: "",
  country: "United States",
  state: "",
  phone: "",
  instagram: "",
  deadline_date: "",
  notes: "",
  guardian_consent: false,
  photo_rights_consent: false,
  terms_consent: false,
  portfolio_contact_opt_in: false,
};

const visualStyles = [
  ["Stadium Night", "Championship lights, deep shadows, and controlled smoke."],
  ["Chrome All-Star", "Metallic framing and a restrained collectible-card finish."],
  ["Fire & Smoke", "Bold movement and a high-energy game-day atmosphere."],
  ["Neon Future", "Electric light and a social-first futuristic edge."],
  ["Vintage Trading Card", "Classic card character with modern image quality."],
] as const;
const sampleAthletes: Record<string, { name: string; number: string; detail: string; team: string; season: string; stats: string[] }> = {
  Basketball: { name: "Nia Brooks", number: "23", detail: "Point Guard", team: "Northside Wolves", season: "2026 Season", stats: ["18.4 PPG", "6.2 APG", "41% 3PT"] },
  Football: { name: "Marcus Reed", number: "11", detail: "Wide Receiver", team: "Westview Lions", season: "2026 Season", stats: ["1,128 YDS", "14 TD", "17.9 AVG"] },
  Baseball: { name: "Eli Carter", number: "7", detail: "Shortstop", team: "River City Hawks", season: "Spring 2026", stats: [".382 AVG", "28 RBI", "19 SB"] },
  Softball: { name: "Maya Torres", number: "44", detail: "Pitcher / 1B", team: "Falcon Elite", season: "Spring 2026", stats: ["1.68 ERA", "142 K", ".347 AVG"] },
  Soccer: { name: "Noah Bennett", number: "7", detail: "Midfielder", team: "Metro United", season: "2026 Season", stats: ["12 GOALS", "16 ASSISTS", "24 STARTS"] },
  "Ice Hockey": { name: "Owen Hayes", number: "21", detail: "Center", team: "Lakeview Storm", season: "2025–26", stats: ["31 GOALS", "27 ASSISTS", "+22 RATING"] },
  Volleyball: { name: "Ava Collins", number: "7", detail: "Outside Hitter", team: "Summit VBC", season: "2026 Season", stats: ["312 KILLS", "46 ACES", ".286 HIT"] },
  Lacrosse: { name: "Caleb Foster", number: "22", detail: "Attack", team: "Capital Select", season: "Spring 2026", stats: ["48 GOALS", "31 ASSISTS", "62% SOG"] },
  Wrestling: { name: "Luke Morgan", number: "24", detail: "157 lb", team: "Central Wrestling", season: "2025–26", stats: ["32–4 RECORD", "18 PINS", "DISTRICT CHAMP"] },
  Cheerleading: { name: "Zoe Mitchell", number: "12", detail: "Flyer", team: "Premier Athletics", season: "2026 Season", stats: ["LEVEL 6", "HIT ZERO ×8", "STATE FINALIST"] },
  Gymnastics: { name: "Sofia Nguyen", number: "9", detail: "All-Around", team: "Apex Gymnastics", season: "2026 Season", stats: ["37.825 AA", "9.725 FLOOR", "9.650 BEAM"] },
  "Track & Field": { name: "Jayden Price", number: "4", detail: "100m / 200m", team: "East Ridge Track", season: "Spring 2026", stats: ["10.72 100M", "21.84 200M", "REGION CHAMP"] },
  Swimming: { name: "Kai Lawson", number: "15", detail: "Freestyle", team: "Blue Wave Aquatics", season: "2025–26", stats: ["24.08 50 FREE", "52.31 100 FREE", "STATE QUALIFIER"] },
  Tennis: { name: "Mia Patel", number: "18", detail: "Singles", team: "Kingsley Tennis", season: "Spring 2026", stats: ["21–3 RECORD", "68% 1ST SERVE", "REGION FINALIST"] },
  Golf: { name: "Avery Kim", number: "3", detail: "Varsity Golfer", team: "Oak Hills Golf", season: "Spring 2026", stats: ["74.2 AVG", "3 TOP 5s", "LOW ROUND 69"] },
  Pickleball: { name: "Riley James", number: "27", detail: "Doubles", team: "City Court Club", season: "2026 Tour", stats: ["4.5 RATING", "68% WIN RATE", "3 PODIUMS"] },
  "Other Sport": { name: "Alex Jordan", number: "31", detail: "Street Skate", team: "Hometown Athletics", season: "2026 Season", stats: ["3 PODIUMS", "BEST TRICK 91.4", "TEAM MVP"] },
};
const landscapeSheets = new Set(["Pickleball", "Other Sport"]);
const outputs = ["Premium Wall Poster", "25 Trading Cards", "Digital Artwork", "Phone Wallpaper", "Social Graphics", "Cinematic Reveal"];
const sportSlug: Record<string, string> = {
  Basketball: "basketball", Football: "football", Baseball: "baseball", Softball: "softball", Soccer: "soccer", "Ice Hockey": "ice-hockey", Volleyball: "volleyball", Lacrosse: "lacrosse", Wrestling: "wrestling", Cheerleading: "cheerleading", Gymnastics: "gymnastics", "Track & Field": "track-field", Swimming: "swimming", Tennis: "tennis", Golf: "golf", Pickleball: "pickleball", "Other Sport": "other-sport",
};

function fieldValue(form: FormData, key: string) {
  return String(form[key] || "");
}

function scrollToForm() {
  document.getElementById("create")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function preparePhoto(file: File): Promise<PreparedPhoto> {
  if (file.size > 20 * 1024 * 1024) throw new Error(`${file.name} is larger than 20 MB.`);
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!["jpg", "jpeg", "png", "webp", "heic", "heif"].includes(extension || "")) {
    throw new Error(`${file.name} is not a supported photo format.`);
  }
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error(`${file.name} could not be read by this browser. For HEIC photos, export a JPG or PNG and try again.`);
  }
  const scale = Math.min(1, 3000 / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) throw new Error("This browser could not prepare the image.");
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.9));
  if (!blob) throw new Error("This browser could not prepare the image.");
  return {
    id: crypto.randomUUID(),
    name: file.name,
    blob,
    preview: URL.createObjectURL(blob),
    width,
    height,
    role: "additional",
    progress: 0,
  };
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

function Svg({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
  );
}
const ArrowIcon = () => <Svg><path d="M7 7h10v10" /><path d="M7 17 17 7" /></Svg>;
const ArrowDownIcon = () => <Svg><path d="M12 5v14" /><path d="m19 12-7 7-7-7" /></Svg>;
const ArrowLeftIcon = () => <Svg><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></Svg>;
const ArrowRightIcon = () => <Svg><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></Svg>;
const SwapIcon = () => <Svg><path d="M8 3 4 7l4 4" /><path d="M4 7h16" /><path d="m16 21 4-4-4-4" /><path d="M20 17H4" /></Svg>;
const CheckIcon = () => <Svg><path d="M20 6 9 17l-5-5" /></Svg>;
const XIcon = () => <Svg><path d="M18 6 6 18" /><path d="m6 6 12 12" /></Svg>;
const PlusIcon = () => <Svg><path d="M5 12h14" /><path d="M12 5v14" /></Svg>;
const MenuIcon = () => <Svg><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" /></Svg>;
const LockIcon = () => <Svg><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></Svg>;
const UploadIcon = () => <Svg><path d="M12 13v8" /><path d="m8 17 4-4 4 4" /><path d="M20 16.7A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25" /></Svg>;
const TargetIcon = () => <Svg><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" /></Svg>;
const ImageIcon = () => <Svg><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" /></Svg>;
const ReviewIcon = () => <Svg><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /><path d="m8 11 2 2 4-4" /></Svg>;
const BadgeCheckIcon = () => <Svg><circle cx="12" cy="12" r="9" /><path d="m8.5 12 2.5 2.5 4.5-5" /></Svg>;
const PackageIcon = () => <Svg><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></Svg>;
const processIcons = [TargetIcon, ImageIcon, ReviewIcon, BadgeCheckIcon, PackageIcon];

export default function SiteClient({ turnstileSiteKey = "" }: { turnstileSiteKey?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [exampleSport, setExampleSport] = useState("Basketball");
  const [showAllSports, setShowAllSports] = useState(false);
  const [showMobileCta, setShowMobileCta] = useState(false);
  const [slider, setSlider] = useState(50);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(initialForm);
  const [photos, setPhotos] = useState<PreparedPhoto[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [successId, setSuccessId] = useState("");
  const [emailDelayed, setEmailDelayed] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const errorRef = useRef<HTMLDivElement>(null);
  const photoPreviewsRef = useRef(new Set<string>());
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    if (!turnstileSiteKey) return;
    (window as typeof window & { onCoverMomentTurnstile?: (token: string) => void }).onCoverMomentTurnstile = setTurnstileToken;
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
    return () => {
      script.remove();
      delete (window as typeof window & { onCoverMomentTurnstile?: (token: string) => void }).onCoverMomentTurnstile;
    };
  }, [turnstileSiteKey]);

  useEffect(() => {
    const hero = document.getElementById("top");
    if (!hero) return;
    const observer = new IntersectionObserver(([entry]) => setShowMobileCta(!entry.isIntersecting), { threshold: 0.05 });
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const previews = photoPreviewsRef.current;
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview));
      previews.clear();
    };
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

  const update = (key: string, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));

  const validate = (targetStep = step) => {
    const nextErrors: string[] = [];
    if (targetStep === 1) {
      if (!fieldValue(form, "sport")) nextErrors.push("Please select a sport.");
      if (!fieldValue(form, "style")) nextErrors.push("Please choose a preferred style.");
    }
    if (targetStep === 2) {
      const required = [
        ["athlete_first_name", "athlete first name"],
        ["athlete_last_name", "athlete last name or initial"],
        ["jersey_number", "jersey number"],
        ["position_event", "position or event"],
        ["team_name", "team name"],
        ["primary_color", "primary team color"],
        ["secondary_color", "secondary team color"],
      ];
      required.forEach(([key, label]) => !fieldValue(form, key) && nextErrors.push(`Please enter the ${label}.`));
      if (fieldValue(form, "order_type") === "Team Order" && !fieldValue(form, "team_size")) nextErrors.push("Please enter the approximate number of athletes.");
      if (fieldValue(form, "stats").length > 300) nextErrors.push("Stats must be 300 characters or fewer.");
    }
    if (targetStep === 3 && photos.length < 3) nextErrors.push("Please upload at least 3 photos.");
    if (targetStep === 3 && photos.length > 5) nextErrors.push("You can upload no more than 5 photos.");
    if (targetStep === 4) {
      if (!fieldValue(form, "customer_name")) nextErrors.push("Please enter the parent or customer name.");
      if (!/^\S+@\S+\.\S+$/.test(fieldValue(form, "customer_email"))) nextErrors.push("Please enter a valid email address.");
      if (!fieldValue(form, "country")) nextErrors.push("Please select a country.");
      if (fieldValue(form, "country") === "United States" && !fieldValue(form, "state")) nextErrors.push("Please enter your state.");
    }
    if (targetStep === 5) {
      if (!form.guardian_consent) nextErrors.push("Please confirm that you have permission to submit these athlete photos.");
      if (!form.photo_rights_consent) nextErrors.push("Please confirm that you own the photos or have permission to use them.");
      if (!form.terms_consent) nextErrors.push("Please agree to the Privacy Policy and Terms.");
      if (turnstileSiteKey && !turnstileToken) nextErrors.push("Please complete the security check.");
    }
    setErrors(nextErrors);
    if (nextErrors.length) requestAnimationFrame(() => errorRef.current?.focus());
    return nextErrors.length === 0;
  };

  const nextStep = () => {
    if (!validate()) return;
    setErrors([]);
    setStep((current) => Math.min(5, current + 1));
    document.getElementById("form-card")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const addPhotos = async (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files || []);
    const prepared: PreparedPhoto[] = [];
    event.target.value = "";
    if (photos.length + selected.length > 5) {
      setErrors(["You can upload no more than 5 photos."]);
      return;
    }
    try {
      for (const file of selected) prepared.push(await preparePhoto(file));
      prepared.forEach((photo) => photoPreviewsRef.current.add(photo.preview));
      setPhotos((current) => [...current, ...prepared]);
      setErrors([]);
    } catch (error) {
      prepared.forEach((photo) => URL.revokeObjectURL(photo.preview));
      setErrors([error instanceof Error ? error.message : "A photo could not be prepared."]);
    }
  };

  const movePhoto = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= photos.length) return;
    setPhotos((current) => {
      const copy = [...current];
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });
  };

  const removePhoto = (id: string) => setPhotos((current) => {
    const target = current.find((photo) => photo.id === id);
    if (target) {
      URL.revokeObjectURL(target.preview);
      photoPreviewsRef.current.delete(target.preview);
    }
    return current.filter((photo) => photo.id !== id);
  });

  const setPhotoRole = (id: string, role: PhotoRole) => {
    setPhotos((current) => current.map((photo) => ({ ...photo, role: photo.id === id ? role : (photo.role === role && (role === "face" || role === "action") ? "additional" : photo.role) })));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate(5) || busy) return;
    setBusy(true);
    setStatus("Preparing secure upload…");
    setErrors([]);
    try {
      const idempotencyKey = sessionStorage.getItem("cover-moment-idempotency") || crypto.randomUUID();
      sessionStorage.setItem("cover-moment-idempotency", idempotencyKey);
      const payload = Object.fromEntries(Object.entries(form).filter(([, value]) => value !== ""));
      const startResponse = await fetch("/api/submissions/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          file_count: photos.length,
          idempotency_key: idempotencyKey,
          turnstile_token: turnstileToken,
          landing_path: location.pathname,
          source: "website",
          utm_source: new URLSearchParams(location.search).get("utm_source") || "",
          utm_medium: new URLSearchParams(location.search).get("utm_medium") || "",
          utm_campaign: new URLSearchParams(location.search).get("utm_campaign") || "",
          utm_content: new URLSearchParams(location.search).get("utm_content") || "",
        }),
      });
      const startData = await startResponse.json();
      if (!startResponse.ok) throw new Error(startData.error || "We could not start the secure upload.");
      const supabase = createClient(startData.supabaseUrl, startData.supabaseAnonKey);
      setStatus("Uploading Photos…");
      const uploadedFiles = [];
      for (let index = 0; index < photos.length; index += 1) {
        const photo = photos[index];
        const target = startData.uploads[index];
        setPhotos((current) => current.map((item) => item.id === photo.id ? { ...item, progress: 18 } : item));
        const { error } = await supabase.storage.from(startData.bucket).uploadToSignedUrl(target.path, target.token, photo.blob, { contentType: "image/webp" });
        if (error) throw error;
        setPhotos((current) => current.map((item) => item.id === photo.id ? { ...item, progress: 100 } : item));
        uploadedFiles.push({
          storage_path: target.path,
          original_filename: photo.name,
          mime_type: "image/webp",
          size_bytes: photo.blob.size,
          width: photo.width,
          height: photo.height,
          sort_order: index,
          photo_role: photo.role,
        });
      }
      setStatus("Sending Request…");
      const completeResponse = await fetch("/api/submissions/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submission_id: startData.submissionId, submission_token: startData.submissionToken, files: uploadedFiles }),
      });
      const completeData = await completeResponse.json();
      if (!completeResponse.ok) throw new Error(completeData.error || "We could not finalize the request.");
      setSuccessId(completeData.requestId);
      setEmailDelayed(completeData.emailDelayed === true);
      sessionStorage.removeItem("cover-moment-idempotency");
    } catch (error) {
      setErrors([error instanceof Error ? error.message : `We could not submit the request. Please try again, or email ${siteConfig.supportEmail}.`]);
    } finally {
      setBusy(false);
      setStatus("");
    }
  };

  const summary = useMemo(() => [
    ["Project", `${fieldValue(form, "order_type")} · ${fieldValue(form, "sport")} · ${fieldValue(form, "style")}`],
    ["Athlete", `${fieldValue(form, "athlete_first_name")} ${fieldValue(form, "athlete_last_name")} · #${fieldValue(form, "jersey_number")} · ${fieldValue(form, "position_event")}`],
    ["Team", `${fieldValue(form, "team_name")} · ${fieldValue(form, "primary_color")} / ${fieldValue(form, "secondary_color")}`],
    ["Package", fieldValue(form, "package_interest")],
    ["Add-on", fieldValue(form, "add_on_interest") || "None selected"],
    ["Photos", `${photos.length} private files ready to upload`],
    ["Contact", `${fieldValue(form, "customer_name")} · ${fieldValue(form, "customer_email")}`],
  ], [form, photos.length]);
  const exampleAthlete = sampleAthletes[exampleSport];
  const visibleSports = showAllSports ? sports : sports.slice(0, 6);

  return (
    <main>
      <div className="announcement">Now accepting a limited number of custom athlete projects each week.</div>
      <header className="site-header">
        <a className="brand" href="#top" aria-label={`${siteConfig.brandName} home`}><span className="brand-mark">CM</span><span>{siteConfig.brandName}</span></a>
        <nav className={menuOpen ? "nav open" : "nav"} aria-label="Primary navigation">
          <a href="#examples" onClick={() => setMenuOpen(false)}>Examples</a>
          <a href="#styles" onClick={() => setMenuOpen(false)}>Styles</a>
          <a href="#how" onClick={() => setMenuOpen(false)}>How It Works</a>
          <a href="#pricing" onClick={() => setMenuOpen(false)}>Pricing</a>
          <a href="#faq" onClick={() => setMenuOpen(false)}>FAQ</a>
        </nav>
        <button className="menu-button" aria-expanded={menuOpen} aria-label="Toggle navigation" onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? <XIcon /> : <MenuIcon />}{menuOpen ? "Close" : "Menu"}</button>
        <button className="button small header-cta" onClick={scrollToForm}>Create My Athlete <ArrowIcon /></button>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <span className="eyebrow"><i /> POSTER + TRADING CARD EXPERIENCE</span>
          <h1>Their Photos. Their Poster. <em>Their Own Trading Cards.</em></h1>
          <p>Upload real game-day photos and receive a complete athlete experience—custom artwork, a premium wall poster, collectible trading cards, and digital graphics made to share.</p>
          <div className="button-row">
            <button className="button" onClick={scrollToForm}>Create Their Collector Pack <ArrowIcon /></button>
            <a className="text-link" href="#transformation">See Example Transformations <ArrowDownIcon /></a>
          </div>
          <div className="microcopy"><span><CheckIcon /> No payment today</span><span><CheckIcon /> Printed after approval</span><span><CheckIcon /> US shipping included on physical packs</span></div>
        </div>
        <figure className="hero-art">
          <Image src="/images/hero-physical.webp" alt="Fictional basketball athlete holding a physical trading card beside a framed poster, collector card pack, and matching phone wallpaper" width={1536} height={960} sizes="(max-width: 820px) 100vw, 58vw" preload />
          <figcaption>Example artwork · Fictional athlete</figcaption>
        </figure>
      </section>

      <section className="trust-strip" aria-label="Service benefits">
        {["Built from real photos", "Personally reviewed", "Custom team colors", "Ready to share and print"].map((item, index) => <div key={item}><span>0{index + 1}</span>{item}</div>)}
      </section>

      <section className="section output-section" id="examples">
        <SectionHeading eyebrow="ONE ATHLETE. A COMPLETE EXPERIENCE." title="More Than a Digital Design." copy="Their custom identity becomes something they can hold, hang, collect, and share—a premium wall poster, a real pack of personalized trading cards, matching digital artwork, and an optional cinematic athlete reveal." />
        <div className="output-grid">
          <div className="output-image"><Image src="/images/hero-identity-pack.webp" alt="Complete fictional athlete identity pack with a framed poster, trading cards, social graphics, and phone artwork" width={1570} height={1001} sizes="(max-width: 1080px) 100vw, 68vw" /></div>
          <div className="output-list">{outputs.map((output, index) => <div key={output}><span>0{index + 1}</span><strong>{output}</strong><i>Included by package</i></div>)}</div>
        </div>
        <p className="fine-print">Physical products are printed only after you approve the final artwork. Deliverables depend on the selected package.</p>
      </section>

      <section className="section transformation-section" id="transformation">
        <SectionHeading eyebrow="THE TRANSFORMATION" title="Your Photo. Their Moment." copy="We begin with the athlete’s real face, uniform, and game-day details—then build the lighting, atmosphere, composition, and identity around them." />
        <div className="comparison" style={{ "--reveal": `${slider}%` } as React.CSSProperties}>
          <div className="comparison-pane before" role="img" aria-label="Natural parent-shot photo of a fictional basketball athlete" />
          <div className="comparison-pane after" role="img" aria-label="The same fictional athlete transformed into cinematic sports artwork" />
          <div className="comparison-line" aria-hidden="true"><span><SwapIcon /></span></div>
          <span className="comparison-label left">Your original photo</span><span className="comparison-label right">Custom final artwork</span>
          <input type="range" min="8" max="92" value={slider} onChange={(event) => setSlider(Number(event.target.value))} aria-label="Compare original photo and final artwork" />
        </div>
        <p className="trust-note">This is not a one-click filter. Every accepted project is reviewed and finished by hand with an AI-assisted creative workflow.</p>
      </section>

      <section className="section sports-section">
        <SectionHeading eyebrow="BUILT FOR THEIR SPORT" title="Every Sport Has Its Own Energy." copy="Select the game they love. We adapt the composition, motion, equipment, textures, and atmosphere to feel native to that sport." />
        <div className="sports-grid">{visibleSports.map((sport, index) => (
          <button key={sport} className="sport-card" onClick={() => { update("sport", sport); setExampleSport(sport); document.getElementById("sport-examples")?.scrollIntoView({ behavior: "smooth", block: "center" }); }}>
            <span className={`sport-media ${landscapeSheets.has(sport) ? "landscape-media" : ""}`} aria-hidden="true"><span className={`sport-image single-sport-image ${landscapeSheets.has(sport) ? "sheet-landscape" : "sheet-portrait"}`} style={{ backgroundImage: `url(/images/sport-examples/${sportSlug[sport]}.webp)`, backgroundSize: "300% 200%", backgroundPosition: "0 0" }} /></span>
            <span className="sport-caption"><small>{String(index + 1).padStart(2, "0")}</small><strong>{sport}</strong><i><ArrowIcon /></i></span>
          </button>
        ))}</div>
        <div className="sports-actions"><button type="button" className="outline-button" aria-expanded={showAllSports} onClick={() => setShowAllSports((current) => !current)}>{showAllSports ? "Show Fewer Sports" : `View All ${sports.length} Sports`} <ArrowIcon /></button></div>
        <p className="fine-print">{showAllSports ? "All 17 launch sport directions are shown. Choose “Other Sport” for a discipline not listed." : "Start with six popular sports, or open the full gallery to find all 17 launch directions."}</p>
        <div className="sport-examples" id="sport-examples">
          <div className="example-head"><div><span className="eyebrow">ONE ATHLETE · FIVE CONSISTENT FINISHES</span><h3>{exampleSport} examples</h3><p>Every finish below uses the same athlete, uniform, number, and details. Only the art direction changes.</p></div><button className="button small" onClick={() => { update("sport", exampleSport); scrollToForm(); }}>Choose {exampleSport} <ArrowIcon /></button></div>
          <div className="sport-tabs" role="tablist" aria-label="Choose sport examples">{sports.map((sport) => <button type="button" role="tab" aria-selected={exampleSport === sport} className={exampleSport === sport ? "active" : ""} key={sport} onClick={() => setExampleSport(sport)}>{sport}</button>)}</div>
          <div className="sample-athlete-bar"><div><small>Sample athlete</small><strong>{exampleAthlete.name}</strong></div><span>#{exampleAthlete.number}</span><div><small>Position / event</small><strong>{exampleAthlete.detail}</strong></div><div><small>Team · season</small><strong>{exampleAthlete.team} · {exampleAthlete.season}</strong></div><div className="sample-stats">{exampleAthlete.stats.map((stat) => <b key={stat}>{stat}</b>)}</div></div>
          <div className={`example-cards ${landscapeSheets.has(exampleSport) ? "landscape-sheet" : "portrait-sheet"}`}>{styleOptions.map((style, index) => <article key={`${exampleSport}-${style}`}><div className="example-art"><span className={`example-crop crop-${index}`} style={{ backgroundImage: `url(/images/sport-examples/${sportSlug[exampleSport]}.webp)` }} aria-label={`Fictional ${exampleSport} artwork in ${style} finish`} role="img" /><span className="artwork-identity"><small>{exampleAthlete.team}</small><strong>{exampleAthlete.name}</strong><em>#{exampleAthlete.number} · {exampleAthlete.detail}</em></span></div><div className="example-caption"><small>0{index + 1}</small><span><strong>{style}</strong><em>{exampleAthlete.season} · {exampleAthlete.stats.slice(0, 2).join(" · ")}</em></span></div></article>)}</div>
          <p className="fine-print">Fictional sample athlete and statistics. Your selected name, number, position/event, team, season, colors, headline, and stats are applied to the final design.</p>
        </div>
      </section>

      <section className="section styles-section" id="styles">
        <SectionHeading eyebrow="THE SAME FIVE FINISHES EVERYWHERE" title="Choose One Clear Art Direction." copy="These are the exact five choices in the request form and every sport gallery. The same sample athlete makes the visual difference easy to compare." />
        <div className="styles-grid">{visualStyles.map(([name, description], index) => (
          <button className="style-card" key={name} onClick={() => { update("style", name); scrollToForm(); }}>
            <span className={`style-image example-crop crop-${index}`} style={{ backgroundImage: "url(/images/sport-examples/basketball.webp)" }} aria-hidden="true"><span className="artwork-identity"><small>Northside Wolves</small><strong>Nia Brooks</strong><em>#23 · Point Guard</em></span></span>
            <span className="style-copy"><small>0{index + 1}</small><strong>{name}</strong><em>{description} · 2026 Season · 18.4 PPG · 6.2 APG</em></span>
          </button>
        ))}</div>
        <p className="fine-print">One fictional athlete, five different finishes. Your final artwork is personalized with the exact information requested in the order form.</p>
      </section>

      <section className="section process-section" id="how">
        <SectionHeading eyebrow="SIMPLE FROM START TO FINISH" title="From Camera Roll to Cover Moment." center />
        <div className="process-grid">{[
          ["Choose the direction", "Select the sport, visual style, and package that best matches the moment."],
          ["Upload 3–5 photos", "Add clear game-day images plus the athlete’s name, number, position, colors, and stats."],
          ["Personal review", "We check every photo, confirm the package, then send a secure payment link."],
          ["Approve the proof", "After payment, we create a watermarked proof and complete the included revision."],
          ["Print & deliver", "Only approved artwork goes to print. Digital files arrive by email; tracking follows separately."],
        ].map(([title, copy], index) => { const Icon = processIcons[index]; return <article key={title}><span>0{index + 1}</span><div className="process-icon"><Icon /></div><h3>{title}</h3><p>{copy}</p></article>; })}</div>
        <p className="process-note">Most first proofs are delivered within 2 business days after payment. Print-carrier delivery dates and team-order timing are confirmed separately.</p>
      </section>

      <section className="section difference-section">
        <SectionHeading eyebrow="DESIGNED, NOT FILTERED" title="It Should Still Look Like Them." copy="The most important part is not the smoke, lights, or effects. It is preserving the athlete’s identity and the details that make the moment theirs." />
        <div className="value-grid">{[
          ["Real likeness first", "We work from real athlete photos and preserve recognizable facial details instead of replacing them with a random character."],
          ["Sport-specific direction", "The pose, equipment, texture, and atmosphere are adapted to the actual sport—not dropped into one generic template."],
          ["Human quality control", "Every order is reviewed before payment and checked again before delivery."],
        ].map(([title, copy], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
      </section>

      <section className="section pricing-section" id="pricing">
        <SectionHeading eyebrow="HOLD IT. HANG IT. SHARE IT." title="Choose Their Complete Experience." copy="The Signature Collector Pack is the main experience: a premium poster, 25 real trading cards, and the complete matching digital set. Not sure? Choose “Help Me Choose.”" center />
        <div className="pricing-grid">{packages.map((item) => <article className={`price-card ${item.id === "signature" ? "featured" : ""}`} key={item.id}>
          {item.badge && <span className="price-badge">{item.badge}</span>}
          <div className="price-top"><h3>{item.name}</h3><strong>{item.price}</strong><p>{item.summary}</p></div>
          <ul>{item.features.map((feature) => <li key={feature}><CheckIcon />{feature}</li>)}</ul>
          <button className={item.badge ? "button full" : "outline-button full"} onClick={() => { update("package_interest", `${item.name} — ${item.price.toLowerCase()}`); scrollToForm(); }}>{item.cta} <ArrowIcon /></button>
        </article>)}</div>
        <p className="pricing-note"><strong>No payment is required today.</strong> We review your photos first, confirm the right package by email, and collect the shipping address securely during payment. Physical products are sent to print only after artwork approval.</p>
        <div className="add-ons">
          <div className="add-ons-heading"><span className="eyebrow">OPTIONAL AFTER YOU CHOOSE A PACKAGE</span><h3>Make It Even More Theirs.</h3><p>Add-ons are confirmed during the personal approval process. Framed posters are not offered at launch while supplier quality is still being tested.</p></div>
          <div className="add-on-grid">{addOns.map(([name, price, copy]) => <button type="button" key={name} onClick={() => { update("add_on_interest", `${name} — ${price}`); scrollToForm(); }}><span><strong>{name}</strong><small>{copy}</small></span><em>{price}</em></button>)}</div>
        </div>
      </section>

      <section className="section guidelines-section" id="guidelines">
        <SectionHeading eyebrow="BETTER PHOTOS, BETTER ARTWORK" title="What Should You Upload?" copy="You do not need professional photography. These are ordinary phone-photo examples—the kind of clear, natural game-day images that work best." />
        <div className="guidelines-layout">
          <div className="guideline-visual">
            {["Clear face", "Visible uniform", "Action pose", "Heavy blur", "Too dark", "Too far away"].map((label, index) => <div className={`guide-panel guide-${index}`} key={label}><span>{index < 3 ? <><CheckIcon /> Good</> : <><XIcon /> Avoid</>}</span><strong>{label}</strong></div>)}
          </div>
          <div className="checklists"><div><h3>Photos that work well</h3>{["Face is clearly visible", "Athlete is reasonably well lit", "Uniform and number are visible", "Natural sports pose", "Original-resolution files"].map((item) => <p key={item}><CheckIcon />{item}</p>)}</div><div><h3>Try to avoid</h3>{["Social-media screenshots", "Extremely dark photos", "Heavy motion blur", "Face covered in every image", "Tiny athlete far away"].map((item) => <p key={item}><XIcon />{item}</p>)}</div></div>
        </div>
        <p className="trust-note">Not sure? Upload your best options. We review them before you pay.</p>
      </section>

      <section className="team-section">
        <Image src="/images/team-order.webp" alt="Coordinated set of six fictional youth athlete posters displayed at a team banquet" width={1536} height={1024} sizes="100vw" />
        <div className="team-overlay"><span className="eyebrow">TEAM COLLECTION · FROM $699 FOR 5 ATHLETES</span><h2>One Team. One Visual Identity. Every Player.</h2><p>A coordinated direction with personalized artwork, one 18×24 poster per athlete, physical trading cards for every included athlete, and matching digital files.</p><button className="button" onClick={() => { update("order_type", "Team Order"); update("package_interest", "Team Collection — from $699"); scrollToForm(); }}>Request a Team Quote <ArrowIcon /></button><small>Additional athletes receive a custom quote. Production timing is confirmed after photo review.</small></div>
      </section>

      <section className="section form-section" id="create">
        <SectionHeading eyebrow="START YOUR PROJECT" title="Tell Us About Your Athlete." copy="Submit the details and 3–5 photos. There is no payment today. We will personally review the request and email you with the next step." center />
        <div className="trust-chips">{["Secure photo upload", "No payment today", "Personal review", "No public use without permission"].map((chip) => <span key={chip}><CheckIcon /> {chip}</span>)}</div>
        <form className="form-card" id="form-card" onSubmit={submit} noValidate>
          {successId ? <div className="success-card" role="status"><span className="success-icon"><CheckIcon /></span><span className="eyebrow">REQUEST RECEIVED</span><h3>We’ve Got the Photos.</h3><p>Your request has been stored securely. We will review the photos and contact you within 24 hours with confirmation, any questions, and a secure payment link if the project is accepted.</p><strong>Request ID: {successId}</strong><small>{emailDelayed ? `The request is safe, but automatic email delivery is delayed. Save this Request ID or contact ${siteConfig.supportEmail}.` : "Please check your spam or promotions folder if you do not see the confirmation email within a few minutes."}</small><a className="button" href="#examples">View More Examples</a></div> : <>
            <div className="form-progress"><div><span>Step {step} of 5</span><strong>{["Choose the project", "Athlete details", "Photo upload", "Contact details", "Review & consent"][step - 1]}</strong></div><div className="progress-track"><i style={{ width: `${step * 20}%` }} /></div></div>
            {errors.length > 0 && <div className="error-summary" ref={errorRef} tabIndex={-1} role="alert"><strong>Please check the following:</strong><ul>{errors.map((error) => <li key={error}>{error}</li>)}</ul></div>}

            {step === 1 && <div className="form-step"><fieldset><legend>Who is this for?</legend><div className="choice-grid two">{["Individual Athlete", "Team Order"].map((value) => <label className={fieldValue(form, "order_type") === value ? "choice active" : "choice"} key={value}><input type="radio" name="order_type" checked={fieldValue(form, "order_type") === value} onChange={() => update("order_type", value)} /><span>{value === "Individual Athlete" ? "01" : "02"}</span><strong>{value}</strong></label>)}</div></fieldset>
              <div className="field-grid"><label>Sport<select value={fieldValue(form, "sport")} onChange={(event) => update("sport", event.target.value)}><option value="">Select a sport</option>{sports.map((sport) => <option key={sport}>{sport}</option>)}</select></label><label>Preferred style<select value={fieldValue(form, "style")} onChange={(event) => update("style", event.target.value)}>{styleOptions.map((style) => <option key={style}>{style}</option>)}</select></label><label className="full-field">Package interest<select value={fieldValue(form, "package_interest")} onChange={(event) => update("package_interest", event.target.value)}><option>Digital Edition — $119</option><option>Signature Collector Pack — $199</option><option>All-Star Cinematic Pack — $299</option><option>Team Collection — from $699</option><option>Help Me Choose</option></select></label><label className="full-field">Optional add-on <em>Can be confirmed later</em><select value={fieldValue(form, "add_on_interest")} onChange={(event) => update("add_on_interest", event.target.value)}><option value="">No add-on selected</option>{addOns.map(([name, price]) => <option key={name}>{name} — {price}</option>)}</select></label>{["Signature Collector Pack — $199", "All-Star Cinematic Pack — $299", "Team Collection — from $699"].includes(fieldValue(form, "package_interest")) && <p className="shipping-note full-field">Shipping address will be collected securely during payment after your photos are reviewed.</p>}</div>
            </div>}

            {step === 2 && <div className="form-step"><div className="field-grid"><label>Athlete first name<input value={fieldValue(form, "athlete_first_name")} onChange={(event) => update("athlete_first_name", event.target.value)} autoComplete="off" /></label><label>Last name or last initial<input value={fieldValue(form, "athlete_last_name")} onChange={(event) => update("athlete_last_name", event.target.value)} autoComplete="off" /></label><label>Jersey number<input value={fieldValue(form, "jersey_number")} onChange={(event) => update("jersey_number", event.target.value)} /></label><label>Position / event<input value={fieldValue(form, "position_event")} onChange={(event) => update("position_event", event.target.value)} /></label><label>Team name<input value={fieldValue(form, "team_name")} onChange={(event) => update("team_name", event.target.value)} /></label><label>Graduation year <em>Optional</em><input value={fieldValue(form, "graduation_year")} onChange={(event) => update("graduation_year", event.target.value)} inputMode="numeric" /></label><label>Primary team color<input value={fieldValue(form, "primary_color")} onChange={(event) => update("primary_color", event.target.value)} placeholder="Navy blue" /></label><label>Secondary team color<input value={fieldValue(form, "secondary_color")} onChange={(event) => update("secondary_color", event.target.value)} placeholder="Electric blue" /></label>{fieldValue(form, "order_type") === "Team Order" && <label>Approximate athletes<input value={fieldValue(form, "team_size")} onChange={(event) => update("team_size", event.target.value)} inputMode="numeric" /></label>}<label>Season / year <em>Optional</em><input value={fieldValue(form, "season_year")} onChange={(event) => update("season_year", event.target.value)} /></label><label className="full-field">Short headline <em>Optional</em><input value={fieldValue(form, "headline")} onChange={(event) => update("headline", event.target.value)} placeholder="Own the moment" /></label><label className="full-field">Stats <em>Optional · {fieldValue(form, "stats").length}/300</em><textarea value={fieldValue(form, "stats")} onChange={(event) => update("stats", event.target.value)} maxLength={300} /></label></div></div>}

            {step === 3 && <div className="form-step"><div className="upload-intro"><h3>Add 3–5 clear photos.</h3><p>A close-up plus one or two action images usually creates the strongest result. Images are resized, converted, and stripped of embedded location metadata before upload.</p></div><label className="upload-zone"><input type="file" multiple accept=".jpg,.jpeg,.png,.webp,.heic,.heif,image/jpeg,image/png,image/webp,image/heic,image/heif" onChange={addPhotos} disabled={photos.length >= 5} /><span className="upload-icon"><UploadIcon /></span><strong>Add Athlete Photos</strong><small>JPG, PNG, WebP, HEIC or HEIF · 20 MB each · {photos.length}/5 selected</small></label>
              <div className="photo-grid">{photos.map((photo, index) => <article className="photo-card" key={photo.id}><Image src={photo.preview} alt={`Selected athlete photo ${index + 1}`} width={photo.width} height={photo.height} sizes="90px" unoptimized /><div className="photo-meta"><strong>{index + 1}. {photo.name}</strong><select aria-label={`Role for ${photo.name}`} value={photo.role} onChange={(event) => setPhotoRole(photo.id, event.target.value as PhotoRole)}><option value="additional">Additional</option><option value="face">Best face photo</option><option value="action">Best action photo</option><option value="uniform">Uniform reference</option></select><div><button type="button" onClick={() => movePhoto(index, -1)} aria-label="Move photo earlier"><ArrowLeftIcon /></button><button type="button" onClick={() => movePhoto(index, 1)} aria-label="Move photo later"><ArrowRightIcon /></button><button type="button" className="remove" onClick={() => removePhoto(photo.id)}>Remove</button></div>{photo.progress > 0 && <progress value={photo.progress} max="100">{photo.progress}%</progress>}</div></article>)}</div><p className="privacy-note"><LockIcon /> Photos remain private and are not used in our portfolio or advertising without separate permission.</p></div>}

            {step === 4 && <div className="form-step"><div className="field-grid"><label>Parent / customer full name<input value={fieldValue(form, "customer_name")} onChange={(event) => update("customer_name", event.target.value)} autoComplete="name" /></label><label>Email address<input type="email" value={fieldValue(form, "customer_email")} onChange={(event) => update("customer_email", event.target.value)} autoComplete="email" /></label><label>Country<select value={fieldValue(form, "country")} onChange={(event) => update("country", event.target.value)}><option>United States</option><option>Canada</option><option>United Kingdom</option><option>Australia</option><option>Other</option></select></label>{fieldValue(form, "country") === "United States" && <label>State<input value={fieldValue(form, "state")} onChange={(event) => update("state", event.target.value)} autoComplete="address-level1" /></label>}<label>Phone <em>Optional</em><input type="tel" value={fieldValue(form, "phone")} onChange={(event) => update("phone", event.target.value)} autoComplete="tel" /></label><label>Instagram <em>Optional</em><input value={fieldValue(form, "instagram")} onChange={(event) => update("instagram", event.target.value)} placeholder="@handle" /></label><label>Deadline / event date <em>Optional</em><input type="date" value={fieldValue(form, "deadline_date")} onChange={(event) => update("deadline_date", event.target.value)} /></label><label className="full-field">What matters most about this design? <em>Optional</em><textarea value={fieldValue(form, "notes")} onChange={(event) => update("notes", event.target.value)} placeholder="Example: This is for Senior Night. He loves the black-and-gold uniform, and we would like the final poster to feel dramatic but clean." /></label></div></div>}

            {step === 5 && <div className="form-step"><div className="review-list">{summary.map(([label, value], index) => <div key={label}><span>{label}</span><strong>{value}</strong><button type="button" onClick={() => setStep(index < 1 ? 1 : index < 4 ? 2 : index === 4 ? 3 : 4)}>Edit</button></div>)}</div><div className="consents">{[
              ["guardian_consent", "I confirm that I am the athlete, the athlete’s parent or legal guardian, or that I have permission from the athlete’s parent or legal guardian to submit these photos and request this artwork."],
              ["photo_rights_consent", "I confirm that I own these photos or have permission to use them for this custom order."],
              ["terms_consent", "I agree to the Privacy Policy and Terms and understand that submitting this request does not require payment or guarantee that the project will be accepted."],
              ["portfolio_contact_opt_in", "After the project is complete, you may contact me separately to request permission to feature the final artwork. Nothing will be published without additional approval."],
            ].map(([key, label], index) => <label key={key}><input type="checkbox" checked={Boolean(form[key])} onChange={(event) => update(key, event.target.checked)} /><span>{label}{index === 3 && <em> Optional</em>}</span></label>)}</div>{turnstileSiteKey && <div className="cf-turnstile" data-sitekey={turnstileSiteKey} data-callback="onCoverMomentTurnstile" />}</div>}

            <div className="form-actions">{step > 1 && <button type="button" className="back-button" onClick={() => { setErrors([]); setStep((current) => current - 1); }}><ArrowLeftIcon /> Back</button>} {step < 5 ? <button type="button" className="button" onClick={nextStep}>{["Continue to Athlete Details", "Continue to Photos", "Continue to Contact Details", "Review Request"][step - 1]} <ArrowIcon /></button> : <button type="submit" className="button" disabled={busy}>{busy ? status || "Sending Request…" : "Submit My Athlete"} <ArrowIcon /></button>}</div>
          </>}
        </form>
      </section>

      <section className="section faq-section" id="faq"><SectionHeading eyebrow="THE DETAILS" title="Questions, Answered." center /><div className="faq-list">{faqItems.map(([question, answer]) => <details key={question}><summary>{question}<span><PlusIcon /></span></summary><p>{answer}</p></details>)}</div></section>

      <section className="final-cta"><span className="eyebrow">HOLD IT · HANG IT · COLLECT IT · SHARE IT</span><h2>Make the Moment Feel <em>as Big as It Was.</em></h2><p>Turn their best game-day photos into a cinematic poster and a real pack of personalized trading cards.</p><button className="button" onClick={scrollToForm}>Create Their Collector Pack <ArrowIcon /></button><small>No payment today · Personal reply within 24 hours</small></section>

      <footer><div className="footer-top"><a className="brand" href="#top"><span className="brand-mark">CM</span><span>{siteConfig.brandName}</span></a><p>Custom sports identities created from the moments athletes and families already care about.</p></div><div className="footer-links"><div><strong>Explore</strong><a href="#examples">Examples</a><a href="#how">How It Works</a><a href="#pricing">Pricing</a><a href="#guidelines">Photo Guidelines</a></div><div><strong>Studio</strong><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href={`mailto:${siteConfig.supportEmail}`}>Contact</a>{siteConfig.instagramUrl && <a href={siteConfig.instagramUrl} target="_blank" rel="noreferrer">Instagram</a>}</div></div><p className="disclaimer">{siteConfig.brandName} is an independent custom design studio and is not affiliated with any professional sports league, team, school, equipment brand, or trading-card company.</p><div className="copyright"><span>© {currentYear} {siteConfig.brandName}. All rights reserved.</span><span>Real photos. Custom designed.</span></div></footer>

      <button className={`mobile-sticky ${showMobileCta ? "visible" : ""}`} aria-hidden={!showMobileCta} tabIndex={showMobileCta ? 0 : -1} onClick={scrollToForm}>Create My Athlete <ArrowIcon /></button>
    </main>
  );
}
