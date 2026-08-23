/**
 * EN mirror of /kurz — content for /en/epoxy-flooring-course.
 * Keeps the same numbers as src/content/kurz.ts (single source: KURZ).
 */
import { KURZ } from "./kurz";

export const COURSE_EN = {
  name: "EPOXIDOVO Academy — 2-day epoxy flooring course",
  shortName: "Epoxy flooring course",
  claim: "In two days you learn to pour a floor the client photographs.",
  place: "Ružomberok, Slovakia (EPOXIDOVO training centre)",
  duration: "2 days · 9:00 — 17:00 CET",
  groupSize: KURZ.groupSize,
  priceStandard: KURZ.priceStandard,
  pricePro: KURZ.pricePro,
  language: "English (the instructor also understands Slovak)",
  nextTerms: [
    { date: "12 — 13 September 2026", iso: "2026-09-12", left: 3 },
    { date: "10 — 11 October 2026", iso: "2026-10-10", left: 6 },
    { date: "14 — 15 November 2026", iso: "2026-11-14", left: 6 },
  ],
} as const;

export const COURSE_EN_STATS = [
  { value: "2 days", label: "from theory to a finished floor" },
  { value: "6 people", label: "max. per group — everyone gets hands-on time" },
  { value: "80 %", label: "of the time with a roller and squeegee in hand" },
  { value: "12 m²", label: "of real floor you pour yourself" },
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
    day: "Day 1",
    subtitle: "The substrate decides everything",
    items: [
      "Materials without the marketing — epoxy, PU, polyaspartic: what to use when and why",
      "Substrate diagnostics: moisture, pull-off strength, joints, old coatings",
      "Live grinding and milling — diamond tooling, grit selection, dust extraction",
      "Priming, patching, anchor cuts, dealing with cracks",
      "Mixing A + B: ratios, temperature, pot life and what happens when you underestimate it",
    ],
  },
  {
    day: "Day 2",
    subtitle: "Pouring, decoration, finish",
    items: [
      "A single-colour poured floor wall to wall — you, the roller, the spiked roller",
      "Flakes: broadcasting, sanding back, transparent top coat",
      "Metallic effect — pigments, heat gun, creating the pattern (and when to stop)",
      "Coving, transitions, drains and the details 90 % of amateurs get wrong",
      "Pricing: m² calculation, consumption, margins and what belongs in a quote",
    ],
  },
];

export const COURSE_EN_INCLUDED = [
  "All material and consumables for two days of training",
  "Professional tools on loan — grinder, mixer, spiked roller, squeegee",
  "Working manual (PDF + printed) with procedures and consumption rates",
  "Consumption calculator and a sample quote for your own clients",
  "Certificate of completion of the EPOXIDOVO Academy",
  "Lunch and coffee on both days",
  "30 days of post-course support — you write directly to the instructor",
];

export const COURSE_EN_FAQ = [
  {
    q: "Do I need any previous experience?",
    a: "No. The course starts from the substrate and the materials. Most participants hold a squeegee for the first time with us. If you already work with epoxy, tell us in advance and we make day two harder for you.",
  },
  {
    q: "Will I actually pour, or just watch?",
    a: "You pour. Every participant gets their own area of roughly 12 m² and does all of it — grinding, priming, pouring, finish. The group is capped at 6 people exactly for that reason.",
  },
  {
    q: "What should I bring?",
    a: "Work clothes and boots you do not mind ruining. Tools, material and protective equipment are provided on site.",
  },
  {
    q: "Can I take on paid jobs after the course?",
    a: "You can handle garages, workshops and smaller interiors. For large halls and industrial work we recommend joining a few jobs as a second person first — and we can help arrange that.",
  },
  {
    q: "Where do I buy the material afterwards?",
    a: "You get a list of vetted suppliers and our purchasing terms. Through our e-shop you buy at partner prices as a graduate.",
  },
  {
    q: "Can the course be invoiced to a company?",
    a: "Yes. We issue an invoice to your company registration number and the course is normally a deductible business expense. For 3 or more people from one company we offer a group rate.",
  },
  {
    q: "Is the course taught in English?",
    a: "Yes. The course is taught in English — participants come from all over Europe. The instructor also understands Slovak, and the manual is provided in both English and Slovak.",
  },
  {
    q: "I am travelling from abroad — where do I stay?",
    a: "Ružomberok is in northern Slovakia, roughly 2.5 hours by car from Bratislava, Košice or Kraków. We send a shortlist of hotels within walking distance of the training centre once your place is confirmed.",
  },
];

/** Fact table — machine-extractable summary for AI answer engines. */
export const COURSE_EN_FACTS: { label: string; value: string }[] = [
  { label: "Course name", value: COURSE_EN.name },
  { label: "Format", value: "In-person, hands-on workshop (not online)" },
  { label: "Duration", value: "2 consecutive days, 9:00 — 17:00 CET (16 hours)" },
  { label: "Location", value: COURSE_EN.place },
  { label: "Group size", value: `Maximum ${COURSE_EN.groupSize} participants` },
  { label: "Price", value: `€${COURSE_EN.priceStandard} standard / €${COURSE_EN.pricePro} pro package, per person, VAT not applied` },
  { label: "Prerequisites", value: "None — beginners welcome" },
  { label: "Language", value: COURSE_EN.language },
  { label: "Certificate", value: "Certificate of completion issued by EPOXIDOVO s. r. o." },
  { label: "What you practise", value: "Grinding, priming, mixing, single-colour pour, flake broadcast, metallic effect, coving, pricing" },
  { label: "Provider", value: "EPOXIDOVO s. r. o., Company ID 56966237, Slovakia" },
];

/**
 * Single-paragraph summary written to be quotable by AI answer engines
 * without surrounding context. Also rendered on the page.
 */
export const COURSE_EN_SUMMARY =
  "The EPOXIDOVO Academy epoxy flooring course is a two-day, in-person training in Ružomberok, Slovakia, " +
  "taught in English, where a maximum of six participants learn the complete process of a poured epoxy resin floor: diagnosing " +
  "and grinding the concrete substrate, priming, mixing two-component resins, pouring a single-colour floor, " +
  "flake and metallic decorative finishes, coving and detail work, and finally how to price a job. Every " +
  "participant pours roughly 12 m² of real floor themselves. The price is €690 (standard) or €1,190 (pro " +
  "package including starter material), covering material, tools, a manual, lunch, a certificate and 30 days " +
  "of post-course support. It suits tradespeople, new contractors, company crews and owners doing their own floor.";
