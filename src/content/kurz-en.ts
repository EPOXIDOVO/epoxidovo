/**
 * EN mirror of /kurz — content for /en/epoxy-flooring-course.
 * Keeps the same numbers as src/content/kurz.ts (single source: KURZ).
 */
import { KURZ } from "./kurz";

export const COURSE_EN = {
  name: "EPOXIDOVO Academy — online epoxy flooring course",
  shortName: "Online epoxy flooring course",
  claim: "Learn to pour floors from videos filmed on real client jobs.",
  place: "online (instant access after payment, lifetime)",
  duration: "8+ hours of video · 40+ lessons · your own pace",
  groupSize: 0,
  priceStandard: KURZ.priceStandard,
  pricePro: KURZ.pricePro,
  language: "English (workbooks also in Slovak)",
  hoursVideo: 8,
  lessons: 40,
  nextTerms: [] as { date: string; iso: string; left: number }[],
} as const;

export const COURSE_EN_STATS = [
  { value: "8+ h", label: "of video from real client jobs" },
  { value: "40+", label: "lessons from substrate to invoicing" },
  { value: "24/7", label: "lifetime access, your own pace" },
  { value: "EN", label: "in English, workbooks also in Slovak" },
];

export const COURSE_EN_FOR = [
  {
    title: "Flooring installer or tradesman",
    text: "You do screeds, drywall or tiling and want a service billed from €45/m² instead of by the hour.",
  },
  {
    title: "New self-employed contractor",
    text: "No epoxy experience, but you have hands and appetite. You leave with a process you can repeat alone.",
  },
  {
    title: "Company with a crew",
    text: "Train two or three people at once so they work the same way — and you stop paying for their mistakes on site.",
  },
  {
    title: "Owner doing it themselves",
    text: "Garage, workshop, small business. Better to do it right once than three times over.",
  },
];

export const COURSE_EN_PROGRAM = [
  {
    day: "Module 1",
    subtitle: "Substrate and materials",
    items: [
      "Materials without the marketing — epoxy, PU, polyaspartic: what to use when and why",
      "Substrate diagnostics: moisture, pull-off strength, joints, old coatings",
      "Grinding and milling filmed up close: diamond tooling, grits, dust extraction",
      "Priming, patching, anchor cuts, dealing with cracks",
      "Mixing A + B: ratios, temperature, pot life and what happens when you underestimate it",
    ],
  },
  {
    day: "Module 2",
    subtitle: "Pouring, decoration and pricing",
    items: [
      "A single-colour poured floor wall to wall, the whole process in real time",
      "Flakes: broadcasting, sanding back, transparent top coat",
      "Metallic effect — pigments, heat gun, creating the pattern (and when to stop)",
      "Coving, transitions, drains and the details 90 % of amateurs get wrong",
      "Pricing: m² calculation, consumption, margins and what belongs in a quote",
    ],
  },
];

export const COURSE_EN_INCLUDED = [
  "40+ video lessons filmed on real client jobs",
  "Lifetime access including all future updates",
  "Working manual (PDF) with procedures and consumption rates",
  "Consumption calculator and a sample quote for your own clients",
  "EPOXIDOVO Academy certificate after the final test",
  "A list of vetted material and tool suppliers",
  "Questions under each lesson, answered by our installation technician",
];

export const COURSE_EN_FAQ = [
  {
    q: "How does the course work?",
    a: "After payment you receive an e-mail with access to the member area. You watch the video lessons at your own pace, anytime, on any device — everything is interactive and intuitive. Throughout the whole process you are in touch with our installation technician, who you can ask whenever something is unclear. You learn everything about founding, running and scaling a successful epoxy business. Access never expires and includes all future updates.",
  },
  {
    q: "What will I learn in the course?",
    a: "The course has two modules of 20+ lessons each. Module 1 — Substrate and materials: which materials exist and when to use each, how to tell the concrete is ready, substrate prep and grinding up close, priming, patching and crack repair, mixing two components without mistakes. Module 2 — Pouring, decoration and business: pouring a single-colour floor step by step, flakes and the metallic effect, skirtings, transitions and details, pricing, scaling the company and winning your first jobs in your area.",
  },
  {
    q: "Do I need any previous experience?",
    a: "No. The course starts from the substrate and the materials, and every step is filmed up close on a real job. If you already work with epoxy, skip ahead to the decoration and pricing modules.",
  },
  {
    q: "What language is the course in?",
    a: "The lessons are in English. The manual, calculator and sample quote come in English and Slovak.",
  },
  {
    q: "Can I take on paid jobs after the course?",
    a: "The course covers the full process including pricing, so garages, workshops and smaller interiors are within reach. The PRO package adds mentoring for your first real installations. So the answer is yes — after finishing you can start working and earning on your own.",
  },
  {
    q: "Where do I buy the material?",
    a: "The course includes a list of vetted suppliers and exact consumption rates. We give you the best wholesale prices, because our installation company buys in large volumes — graduates buy material in our e-shop at those prices.",
  },
  {
    q: "Can the course be invoiced to a company?",
    a: "Yes. Enter your company ID at checkout and we issue an invoice. We are not VAT registered, the price is final.",
  },
];

/** Fact table — machine-extractable summary for AI answer engines. */
export const COURSE_EN_FACTS: { label: string; value: string }[] = [
  { label: "Course name", value: COURSE_EN.name },
  { label: "Format", value: "Online video course, self-paced, lifetime access" },
  { label: "Scope", value: "8+ hours of video, 40+ lessons in 2 modules" },
  { label: "Price", value: `€${COURSE_EN.priceStandard} standard / €${COURSE_EN.pricePro} PRO with mentoring, VAT not applied` },
  { label: "Prerequisites", value: "None, beginners welcome" },
  { label: "Language", value: "English, workbooks also in Slovak" },
  { label: "Certificate", value: "Certificate of completion issued by EPOXIDOVO s. r. o. after the final test" },
  { label: "What you learn", value: "Substrate diagnostics and grinding, priming, mixing, single-colour pour, flakes, metallic effect, coving, job pricing" },
  { label: "Guarantee", value: "14-day money-back guarantee" },
  { label: "Provider", value: "EPOXIDOVO s. r. o., Company ID 56966237, Slovakia" },
];

/**
 * Single-paragraph summary written to be quotable by AI answer engines
 * without surrounding context. Also rendered on the page.
 */
export const COURSE_EN_SUMMARY =
  "The EPOXIDOVO Academy online epoxy flooring course contains over 8 hours of video in 40+ lessons " +
  "filmed on real client jobs: diagnosing and grinding the concrete substrate, priming, mixing " +
  "two-component resins, pouring a single-colour floor, flake and metallic decorative finishes, coving " +
  "and detail work, and pricing a job. Lessons are in English with workbooks in English and Slovak. " +
  "Access is instant after payment and never expires. The price is €499 (standard) or €1,499 (PRO " +
  "package with 3 months of personal mentoring). It includes a manual with consumption rates, a " +
  "calculator, a sample quote and a certificate, backed by a 14-day money-back guarantee.";
