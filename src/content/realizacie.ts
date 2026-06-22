/**
 * Realizacie galeria — fotky podla kategorie + priestoru.
 * Vygenerovane z /Users/puska/Downloads/realizacie-fotky/
 */

export interface Realizacia {
  id: number;
  src: string;
  category: "jednofarebne" | "chipsove" | "mramorove" | "metalicke";
  space: "dom" | "garaz" | "hala-firma";
  alt: string;
  labels?: string[];
}

export const REALIZACIE: Realizacia[] = [
  { id: 16, src: "/images/realizacie/r-16.jpg", category: "jednofarebne", space: "hala-firma", alt: "Jednofarebná podlaha v priemyselnej hale", labels: ["⚡ Antistatika (ESD)", "💥 ATEX", "👣 Protišmyková úprava"] },
  { id: 1, src: "/images/realizacie/r-01.jpg", category: "jednofarebne", space: "garaz", alt: "Jednofarebná podlaha v garáži" },
  { id: 3, src: "/images/realizacie/r-03.jpg", category: "jednofarebne", space: "dom", alt: "Jednofarebná podlaha v bývaní" },
  { id: 4, src: "/images/realizacie/r-04.jpg", category: "jednofarebne", space: "dom", alt: "Jednofarebná podlaha v bývaní" },
  { id: 5, src: "/images/realizacie/r-05.jpg", category: "jednofarebne", space: "dom", alt: "Jednofarebná podlaha v bývaní" },
  { id: 6, src: "/images/realizacie/r-06.jpg", category: "jednofarebne", space: "dom", alt: "Jednofarebná podlaha v bývaní" },
  { id: 7, src: "/images/realizacie/r-07.jpg", category: "jednofarebne", space: "dom", alt: "Jednofarebná podlaha v bývaní" },
  { id: 8, src: "/images/realizacie/r-08.jpg", category: "jednofarebne", space: "dom", alt: "Jednofarebná podlaha v bývaní" },
  { id: 9, src: "/images/realizacie/r-09.jpg", category: "jednofarebne", space: "dom", alt: "Jednofarebná podlaha v bývaní" },
  { id: 10, src: "/images/realizacie/r-10.jpg", category: "jednofarebne", space: "dom", alt: "Jednofarebná podlaha v bývaní" },
  { id: 11, src: "/images/realizacie/r-11.jpg", category: "mramorove", space: "dom", alt: "Mramorová podlaha v bývaní" },
  { id: 12, src: "/images/realizacie/r-12.jpg", category: "mramorove", space: "dom", alt: "Mramorová podlaha v bývaní" },
  { id: 13, src: "/images/realizacie/r-13.jpg", category: "jednofarebne", space: "dom", alt: "Jednofarebná podlaha v bývaní" },
  { id: 14, src: "/images/realizacie/r-14.jpg", category: "jednofarebne", space: "garaz", alt: "Jednofarebná podlaha v garáži" },
  { id: 15, src: "/images/realizacie/r-15.jpg", category: "jednofarebne", space: "hala-firma", alt: "Jednofarebná podlaha v priemyselnej hale", labels: ["⚡ Antistatika (ESD)", "👣 Protišmyková úprava"] },
  { id: 17, src: "/images/realizacie/r-17.jpg", category: "jednofarebne", space: "hala-firma", alt: "Jednofarebná podlaha v priemyselnej hale", labels: ["⚡ Antistatika (ESD)"] },
  { id: 18, src: "/images/realizacie/r-18.jpg", category: "jednofarebne", space: "hala-firma", alt: "Jednofarebná podlaha v priemyselnej hale" },
  { id: 19, src: "/images/realizacie/r-19.jpg", category: "jednofarebne", space: "hala-firma", alt: "Jednofarebná podlaha v priemyselnej hale" },
  { id: 20, src: "/images/realizacie/r-20.jpg", category: "jednofarebne", space: "hala-firma", alt: "Jednofarebná podlaha v priemyselnej hale", labels: ["🍴 HACCP"] },
  { id: 21, src: "/images/realizacie/r-21.jpg", category: "jednofarebne", space: "hala-firma", alt: "Jednofarebná podlaha v priemyselnej hale" },
  { id: 22, src: "/images/realizacie/r-22.jpg", category: "jednofarebne", space: "hala-firma", alt: "Jednofarebná podlaha v priemyselnej hale" },
  { id: 23, src: "/images/realizacie/r-23.jpg", category: "jednofarebne", space: "hala-firma", alt: "Jednofarebná podlaha v priemyselnej hale", labels: ["⚡ Antistatika (ESD)"] },
  { id: 24, src: "/images/realizacie/r-24.jpg", category: "jednofarebne", space: "hala-firma", alt: "Jednofarebná podlaha v priemyselnej hale", labels: ["⚡ Antistatika (ESD)", "👣 Protišmyková úprava"] },
  { id: 25, src: "/images/realizacie/r-25.jpg", category: "jednofarebne", space: "dom", alt: "Jednofarebná podlaha v bývaní" },
  { id: 26, src: "/images/realizacie/r-26.jpg", category: "jednofarebne", space: "dom", alt: "Jednofarebná podlaha v bývaní" },
  { id: 27, src: "/images/realizacie/r-27.jpg", category: "jednofarebne", space: "dom", alt: "Jednofarebná podlaha v bývaní" },
  { id: 28, src: "/images/realizacie/r-28.jpg", category: "jednofarebne", space: "dom", alt: "Jednofarebná podlaha v bývaní" },
  { id: 29, src: "/images/realizacie/r-29.jpg", category: "jednofarebne", space: "dom", alt: "Jednofarebná podlaha v bývaní" },
  { id: 30, src: "/images/realizacie/r-30.jpg", category: "jednofarebne", space: "dom", alt: "Jednofarebná podlaha v bývaní" },
  { id: 31, src: "/images/realizacie/r-31.jpg", category: "metalicke", space: "dom", alt: "Metalická podlaha v bývaní" },
  { id: 32, src: "/images/realizacie/r-32.jpg", category: "metalicke", space: "dom", alt: "Metalická podlaha v bývaní" },
  { id: 33, src: "/images/realizacie/r-33.jpg", category: "metalicke", space: "dom", alt: "Metalická podlaha v bývaní" },
  { id: 34, src: "/images/realizacie/r-34.jpg", category: "metalicke", space: "garaz", alt: "Metalická podlaha v garáži" },
  { id: 35, src: "/images/realizacie/r-35.jpg", category: "metalicke", space: "garaz", alt: "Metalická podlaha v garáži" },
  { id: 36, src: "/images/realizacie/r-36.jpg", category: "metalicke", space: "garaz", alt: "Metalická podlaha v garáži" },
  { id: 37, src: "/images/realizacie/r-37.webp", category: "mramorove", space: "dom", alt: "Mramorová podlaha v bývaní" },
  { id: 38, src: "/images/realizacie/r-38.avif", category: "mramorove", space: "dom", alt: "Mramorová podlaha v bývaní" },
  { id: 39, src: "/images/realizacie/r-39.jpg", category: "jednofarebne", space: "garaz", alt: "Jednofarebná podlaha v garáži" },
  { id: 40, src: "/images/realizacie/r-40.jpg", category: "jednofarebne", space: "dom", alt: "Jednofarebná podlaha v bývaní" },
  { id: 41, src: "/images/realizacie/r-41.jpg", category: "jednofarebne", space: "hala-firma", alt: "Jednofarebná podlaha v priemyselnej hale", labels: ["🍴 HACCP"] },
  { id: 42, src: "/images/realizacie/r-42.jpg", category: "jednofarebne", space: "hala-firma", alt: "Jednofarebná podlaha v priemyselnej hale" },
  { id: 43, src: "/images/realizacie/r-43.jpg", category: "jednofarebne", space: "hala-firma", alt: "Jednofarebná podlaha v priemyselnej hale" },
  { id: 45, src: "/images/realizacie/r-45.jpg", category: "jednofarebne", space: "hala-firma", alt: "Jednofarebná podlaha v priemyselnej hale" },
  { id: 46, src: "/images/realizacie/r-46.jpg", category: "jednofarebne", space: "hala-firma", alt: "Jednofarebná podlaha v priemyselnej hale", labels: ["⚡ Antistatika (ESD)"] },
  // Chipsové — pridané z user-ovho desktopu (chips garaz.jpg, chips garaz 2.jpg, chips 3.jpg)
  { id: 47, src: "/images/realizacie/r-47.jpg", category: "chipsove", space: "garaz", alt: "Chipsová podlaha v garáži" },
  { id: 48, src: "/images/realizacie/r-48.jpg", category: "chipsove", space: "garaz", alt: "Chipsová podlaha v garáži" },
  { id: 49, src: "/images/realizacie/r-49.jpg", category: "chipsove", space: "dom", alt: "Chipsová podlaha v bývaní" },
];
