import type { Metadata } from "next";
import { KurzFonts } from "@/components/kurz/landing/KurzShell";
import { KalkulackaPage } from "@/components/kurz/landing/KalkulackaPage";

export const metadata: Metadata = {
  title: "Kalkulačka zárobku — EPOXIDOVO Akadémia",
  description: "Obšírna kalkulačka: koľko zarobíš z jednej zákazky pri každom type podlahy.",
  // Dostupná len cez tlačidlo z landingu — nechceme ju v indexe.
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <KurzFonts>
      <KalkulackaPage locale="sk" />
    </KurzFonts>
  );
}
