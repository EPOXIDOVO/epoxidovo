import type { Metadata } from "next";
import { CenyAdminClient } from "./CenyAdminClient";

export const metadata: Metadata = {
  title: "Admin — ceny e-shopu",
  robots: { index: false, follow: false },
};

export default function CenyAdminPage() {
  return <CenyAdminClient />;
}
