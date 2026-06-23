/**
 * RAL Classic K7 — curated podset (~50 najpopulárnejších RAL farieb)
 * organizovaný podľa sérií. Pre použitie na /vzorkovnik stránke.
 *
 * RAL Classic má spolu 213 farieb, ale väčšina nie je vhodná pre epoxidové
 * podlahy (príliš extrémne tóny). Tento subset pokrýva najčastejšie voľby.
 *
 * Štruktúra:
 *   - kod: "RAL 7016"
 *   - nazov: "Antracitsivá"
 *   - hex: "#293133"
 *   - skupina: "greys" | "whites" | "beiges-browns" | "blues" | "greens" | "reds-pinks" | "yellows-oranges" | "blacks"
 */

export interface RalSwatch {
  kod: string;
  nazov: string;
  hex: string;
  skupina:
    | "whites"
    | "yellows-oranges"
    | "reds-pinks"
    | "violets"
    | "blues"
    | "greens"
    | "greys"
    | "beiges-browns"
    | "blacks";
}

export const RAL_CLASSIC_FULL: RalSwatch[] = [
  // WHITES & IVORY
  { kod: "RAL 9010", nazov: "Čisto biela", hex: "#F7F7F1", skupina: "whites" },
  { kod: "RAL 9016", nazov: "Dopravná biela", hex: "#F1F1F1", skupina: "whites" },
  { kod: "RAL 9001", nazov: "Krémová biela", hex: "#EAE6CA", skupina: "whites" },
  { kod: "RAL 9002", nazov: "Sivobiela", hex: "#E6E5DC", skupina: "whites" },
  { kod: "RAL 9003", nazov: "Signálna biela", hex: "#F4F4F4", skupina: "whites" },
  { kod: "RAL 1013", nazov: "Perlovo biela", hex: "#E3D9C6", skupina: "whites" },
  { kod: "RAL 1015", nazov: "Slonová kosť", hex: "#E6D5B8", skupina: "whites" },

  // YELLOWS / ORANGES
  { kod: "RAL 1003", nazov: "Signálna žltá", hex: "#F7BA0B", skupina: "yellows-oranges" },
  { kod: "RAL 1018", nazov: "Zinkovo žltá", hex: "#FAD201", skupina: "yellows-oranges" },
  { kod: "RAL 1023", nazov: "Dopravná žltá", hex: "#FAD201", skupina: "yellows-oranges" },
  { kod: "RAL 2003", nazov: "Pastelovo oranžová", hex: "#F39F18", skupina: "yellows-oranges" },
  { kod: "RAL 2004", nazov: "Čistá oranžová", hex: "#E55B13", skupina: "yellows-oranges" },
  { kod: "RAL 2008", nazov: "Svetlá oranžová", hex: "#F18F1F", skupina: "yellows-oranges" },

  // REDS / PINKS
  { kod: "RAL 3000", nazov: "Ohňová červená", hex: "#AF2B1E", skupina: "reds-pinks" },
  { kod: "RAL 3002", nazov: "Karmínovo červená", hex: "#A52019", skupina: "reds-pinks" },
  { kod: "RAL 3009", nazov: "Oxidovo červená", hex: "#6D3F36", skupina: "reds-pinks" },
  { kod: "RAL 3020", nazov: "Dopravná červená", hex: "#C7372F", skupina: "reds-pinks" },
  { kod: "RAL 4005", nazov: "Modro-fialová", hex: "#6C4675", skupina: "violets" },

  // BLUES
  { kod: "RAL 5002", nazov: "Ultramarinová modrá", hex: "#20214F", skupina: "blues" },
  { kod: "RAL 5005", nazov: "Signálna modrá", hex: "#1E2460", skupina: "blues" },
  { kod: "RAL 5010", nazov: "Encyánovo modrá", hex: "#0E294B", skupina: "blues" },
  { kod: "RAL 5012", nazov: "Svetlomodrá", hex: "#3B83BD", skupina: "blues" },
  { kod: "RAL 5015", nazov: "Nebesky modrá", hex: "#2271B3", skupina: "blues" },
  { kod: "RAL 5017", nazov: "Dopravná modrá", hex: "#063971", skupina: "blues" },

  // GREENS
  { kod: "RAL 6005", nazov: "Machovo zelená", hex: "#2F4538", skupina: "greens" },
  { kod: "RAL 6018", nazov: "Žltozelená", hex: "#57A639", skupina: "greens" },
  { kod: "RAL 6029", nazov: "Mätovo zelená", hex: "#20603D", skupina: "greens" },
  { kod: "RAL 6011", nazov: "Rezedovo zelená", hex: "#6C7059", skupina: "greens" },
  { kod: "RAL 6021", nazov: "Bledo zelená", hex: "#89AC76", skupina: "greens" },

  // GREYS
  { kod: "RAL 7035", nazov: "Svetlosivá", hex: "#D7D7D7", skupina: "greys" },
  { kod: "RAL 7038", nazov: "Achátsivá", hex: "#B5B8B1", skupina: "greys" },
  { kod: "RAL 7030", nazov: "Kamennosivá", hex: "#8B8C7A", skupina: "greys" },
  { kod: "RAL 7032", nazov: "Štrkosivá", hex: "#B9B9A8", skupina: "greys" },
  { kod: "RAL 7037", nazov: "Prachovo sivá", hex: "#7D7F7D", skupina: "greys" },
  { kod: "RAL 7040", nazov: "Okenná sivá", hex: "#9DA1AA", skupina: "greys" },
  { kod: "RAL 7042", nazov: "Dopravná sivá A", hex: "#8F949B", skupina: "greys" },
  { kod: "RAL 7016", nazov: "Antracitsivá", hex: "#293133", skupina: "greys" },
  { kod: "RAL 7021", nazov: "Čiernosivá", hex: "#23282B", skupina: "greys" },
  { kod: "RAL 7022", nazov: "Umbrosivá", hex: "#332F2C", skupina: "greys" },
  { kod: "RAL 7024", nazov: "Grafitovo sivá", hex: "#3E3B39", skupina: "greys" },
  { kod: "RAL 7045", nazov: "Telegrafická sivá", hex: "#8F8F8C", skupina: "greys" },

  // BEIGES / BROWNS
  { kod: "RAL 1001", nazov: "Béžová", hex: "#D0B084", skupina: "beiges-browns" },
  { kod: "RAL 1011", nazov: "Hnedo-béžová", hex: "#8E7B41", skupina: "beiges-browns" },
  { kod: "RAL 1019", nazov: "Šedo-béžová", hex: "#A48F7A", skupina: "beiges-browns" },
  { kod: "RAL 8001", nazov: "Okrová hnedá", hex: "#9D622B", skupina: "beiges-browns" },
  { kod: "RAL 8003", nazov: "Hlinková hnedá", hex: "#7B5141", skupina: "beiges-browns" },
  { kod: "RAL 8011", nazov: "Orechovo hnedá", hex: "#5B3A29", skupina: "beiges-browns" },
  { kod: "RAL 8014", nazov: "Sépiová hnedá", hex: "#382C1E", skupina: "beiges-browns" },
  { kod: "RAL 8017", nazov: "Čokoládovo hnedá", hex: "#45322E", skupina: "beiges-browns" },
  { kod: "RAL 8022", nazov: "Čierno-hnedá", hex: "#1A1718", skupina: "beiges-browns" },
  { kod: "RAL 8024", nazov: "Béžovo-hnedá", hex: "#826C34", skupina: "beiges-browns" },

  // BLACKS
  { kod: "RAL 9004", nazov: "Signálna čierna", hex: "#1E1E1E", skupina: "blacks" },
  { kod: "RAL 9005", nazov: "Hĺbková čierna", hex: "#0A0A0A", skupina: "blacks" },
  { kod: "RAL 9011", nazov: "Grafitová čierna", hex: "#27292B", skupina: "blacks" },
  { kod: "RAL 9017", nazov: "Dopravná čierna", hex: "#1E1E1E", skupina: "blacks" },
];

export const RAL_GROUPS: { key: RalSwatch["skupina"]; label: string }[] = [
  { key: "whites", label: "Biele a ivory" },
  { key: "yellows-oranges", label: "Žlté a oranžové" },
  { key: "reds-pinks", label: "Červené a ružové" },
  { key: "violets", label: "Fialové" },
  { key: "blues", label: "Modré" },
  { key: "greens", label: "Zelené" },
  { key: "greys", label: "Sivé" },
  { key: "beiges-browns", label: "Béžové a hnedé" },
  { key: "blacks", label: "Čierne" },
];
