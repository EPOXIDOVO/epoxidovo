import type { Metadata } from "next";
import { Suspense } from "react";
import { KurzThanks } from "@/components/kurz/landing/KurzThanks";

export const metadata: Metadata = {
  title: { absolute: "Thank you — EPOXIDOVO Academy" },
  robots: { index: false, follow: false },
};

export default function CourseThankYouPage() {
  return (
    <Suspense fallback={null}>
      <KurzThanks locale="en" />
    </Suspense>
  );
}
