import type { Metadata } from "next";
import { Suspense } from "react";
import { KurzThanks } from "@/components/kurz/landing/KurzThanks";
import { KurzFonts } from "@/components/kurz/landing/KurzShell";

export const metadata: Metadata = {
  title: "Ďakujeme za prihlášku na kurz",
  robots: { index: false, follow: false },
};

export default function KurzDakujemePage() {
  return (
    <KurzFonts>
      <Suspense fallback={null}>
        <KurzThanks locale="sk" />
      </Suspense>
    </KurzFonts>
  );
}
