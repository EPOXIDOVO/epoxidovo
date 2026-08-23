import type { Metadata } from "next";
import { Suspense } from "react";
import { KurzThanks } from "@/components/kurz/landing/KurzThanks";
import { KurzFonts } from "@/components/kurz/landing/KurzShell";

export const metadata: Metadata = {
  title: { absolute: "Thank you — EPOXIDOVO Academy" },
  robots: { index: false, follow: false },
};

export default function CourseThankYouPage() {
  return (
    <KurzFonts>
      <Suspense fallback={null}>
        <KurzThanks locale="en" />
      </Suspense>
    </KurzFonts>
  );
}
