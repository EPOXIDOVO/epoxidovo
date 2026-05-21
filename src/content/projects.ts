/**
 * Realizácie / projekty pre /realizacie galériu.
 * Každý projekt má title, lokalitu, typ podlahy, plochu, rok, popis a viacero fotiek.
 * Placeholder dáta — klient ich neskôr nahradí reálnymi.
 */

export type ProjectCategory =
  | "jednofarebne"
  | "chipsove"
  | "mramorove"
  | "metalicke"
  | "priemyselne";

export interface Project {
  id: string;
  title: string;
  location: string;
  category: ProjectCategory;
  area: number; // m²
  year: number;
  description?: string;
  photos: string[]; // prvá je hlavná
}

export const PROJECTS: Project[] = [
  {
    id: "p-01",
    title: "Rodinný dom",
    location: "Žilina",
    category: "mramorove",
    area: 60,
    year: 2024,
    description:
      "Mramorová podlaha s modrými žilami v obývacej izbe a kuchyni. Jednoliata plocha bez škár.",
    photos: [
      "/images/realizacie/r-32.jpg",
      "/images/realizacie/r-11.jpg",
      "/images/realizacie/r-12.jpg",
    ],
  },
  {
    id: "p-02",
    title: "Garáž rodinného domu",
    location: "Ružomberok",
    category: "jednofarebne",
    area: 32,
    year: 2024,
    description:
      "Hladká jednofarebná podlaha pre garáž s protišmykovou úpravou. Odolná voči ropným látkam.",
    photos: [
      "/images/realizacie/r-01.jpg",
      "/images/realizacie/r-14.jpg",
    ],
  },
  {
    id: "p-03",
    title: "Reštaurácia Castello",
    location: "Prešov",
    category: "jednofarebne",
    area: 180,
    year: 2023,
    description:
      "HACCP-certifikovaná podlaha pre gastro prevádzku. Antibakteriálna, ľahko umývateľná, bez špár.",
    photos: [
      "/images/realizacie/r-20.jpg",
      "/images/realizacie/r-19.jpg",
      "/images/realizacie/r-21.jpg",
    ],
  },
  {
    id: "p-04",
    title: "Showroom auto-salónu",
    location: "Bratislava",
    category: "metalicke",
    area: 85,
    year: 2024,
    description:
      "Metalická podlaha s 3D efektom — modrý odlesk pre prezentačný priestor. WOW efekt pri prvom kroku.",
    photos: [
      "/images/realizacie/r-31.jpg",
      "/images/realizacie/r-33.jpg",
      "/images/realizacie/r-35.jpg",
    ],
  },
  {
    id: "p-05",
    title: "Skladová hala",
    location: "Trnava",
    category: "priemyselne",
    area: 1200,
    year: 2023,
    description:
      "Priemyselná podlaha s ESD antistatickou ochranou a protišmykovou úpravou pre VZV prevádzku.",
    photos: [
      "/images/realizacie/r-16.jpg",
      "/images/realizacie/r-17.jpg",
      "/images/realizacie/r-23.jpg",
      "/images/realizacie/r-24.jpg",
    ],
  },
  {
    id: "p-06",
    title: "Loft byt",
    location: "Banská Bystrica",
    category: "chipsove",
    area: 45,
    year: 2024,
    description:
      "Chipsová podlaha s farebnými flakes — moderný industriálny vibe pre mladého klienta.",
    photos: [
      "/images/realizacie/r-44.jpg",
      "/images/realizacie/r-43.jpg",
    ],
  },
  {
    id: "p-07",
    title: "Výrobná hala",
    location: "Žilina",
    category: "priemyselne",
    area: 750,
    year: 2022,
    description:
      "ATEX-certifikovaná podlaha pre výrobu so zvýšeným rizikom výbuchu. Vodivá, chemicky odolná.",
    photos: [
      "/images/realizacie/r-15.jpg",
      "/images/realizacie/r-22.jpg",
      "/images/realizacie/r-18.jpg",
    ],
  },
  {
    id: "p-08",
    title: "Wellness & spa",
    location: "Liptovský Mikuláš",
    category: "mramorove",
    area: 95,
    year: 2024,
    description:
      "Mramorová podlaha s teplým odtieňom pre wellness zónu. Protišmyková, odolná voči vlhkosti a chemikáliám.",
    photos: [
      "/images/realizacie/r-37.webp",
      "/images/realizacie/r-13.jpg",
      "/images/realizacie/r-40.jpg",
    ],
  },
];

export const PROJECT_CATEGORIES: { value: ProjectCategory | "all"; label: string }[] = [
  { value: "all", label: "Všetky" },
  { value: "jednofarebne", label: "Hladké jednofarebné" },
  { value: "chipsove", label: "Chipsové" },
  { value: "mramorove", label: "Mramorové" },
  { value: "metalicke", label: "Metalické" },
  { value: "priemyselne", label: "Priemyselné" },
];
