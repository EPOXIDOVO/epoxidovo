/**
 * Mestá pre lokálne SEO landing pages.
 * Každé mesto má vlastnú URL /epoxidove-podlahy-{slug}.
 */

export interface City {
  slug: string;
  name: string; // nominatív, napr. "Bratislava"
  inCity: string; // lokál, napr. "v Bratislave"
  region: string; // kraj
  distance: string; // približná vzdialenosť od Ružomberka
  surroundings: string[]; // okolité mestá pre dlhý-tail copy
  ico?: string; // špecifické zameranie ak existuje
}

export const CITIES: City[] = [
  {
    slug: "bratislava",
    name: "Bratislava",
    inCity: "v Bratislave",
    region: "Bratislavský kraj",
    distance: "~280 km",
    surroundings: ["Pezinok", "Senec", "Malacky", "Modra", "Stupava"],
  },
  {
    slug: "kosice",
    name: "Košice",
    inCity: "v Košiciach",
    region: "Košický kraj",
    distance: "~190 km",
    surroundings: ["Prešov", "Michalovce", "Rožňava", "Spišská Nová Ves"],
  },
  {
    slug: "zilina",
    name: "Žilina",
    inCity: "v Žiline",
    region: "Žilinský kraj",
    distance: "~50 km",
    surroundings: ["Martin", "Čadca", "Bytča", "Liptovský Mikuláš", "Dolný Kubín"],
  },
  {
    slug: "presov",
    name: "Prešov",
    inCity: "v Prešove",
    region: "Prešovský kraj",
    distance: "~170 km",
    surroundings: ["Poprad", "Bardejov", "Sabinov", "Vranov nad Topľou"],
  },
  {
    slug: "banska-bystrica",
    name: "Banská Bystrica",
    inCity: "v Banskej Bystrici",
    region: "Banskobystrický kraj",
    distance: "~80 km",
    surroundings: ["Zvolen", "Brezno", "Lučenec", "Žiar nad Hronom"],
  },
  {
    slug: "nitra",
    name: "Nitra",
    inCity: "v Nitre",
    region: "Nitriansky kraj",
    distance: "~190 km",
    surroundings: ["Topoľčany", "Levice", "Šaľa", "Zlaté Moravce"],
  },
  {
    slug: "trnava",
    name: "Trnava",
    inCity: "v Trnave",
    region: "Trnavský kraj",
    distance: "~230 km",
    surroundings: ["Piešťany", "Hlohovec", "Skalica", "Senica"],
  },
  {
    slug: "trencin",
    name: "Trenčín",
    inCity: "v Trenčíne",
    region: "Trenčiansky kraj",
    distance: "~120 km",
    surroundings: ["Považská Bystrica", "Prievidza", "Nové Mesto nad Váhom"],
  },
  {
    slug: "poprad",
    name: "Poprad",
    inCity: "v Poprade",
    region: "Prešovský kraj",
    distance: "~110 km",
    surroundings: ["Kežmarok", "Vysoké Tatry", "Stará Ľubovňa", "Spišská Belá"],
  },
  {
    slug: "ruzomberok",
    name: "Ružomberok",
    inCity: "v Ružomberku",
    region: "Žilinský kraj",
    distance: "0 km — naše sídlo",
    surroundings: ["Liptovský Mikuláš", "Dolný Kubín", "Tvrdošín", "Brezno"],
  },
];

export function findCity(slug: string): City | undefined {
  return CITIES.find((c) => c.slug === slug);
}
