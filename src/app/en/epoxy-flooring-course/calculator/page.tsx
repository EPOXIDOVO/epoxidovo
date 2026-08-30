import type { Metadata } from "next";
import { KurzFonts } from "@/components/kurz/landing/KurzShell";
import { KalkulackaPage } from "@/components/kurz/landing/KalkulackaPage";

export const metadata: Metadata = {
  title: "Earnings calculator — EPOXIDOVO Academy",
  description: "The full calculator: how much you earn per job for every floor type.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <KurzFonts>
      <KalkulackaPage locale="en" />
    </KurzFonts>
  );
}
