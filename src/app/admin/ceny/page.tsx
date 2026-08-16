import type { Metadata } from "next";
import { cookies } from "next/headers";
import { verifySession, ADMIN_COOKIE } from "@/lib/admin-auth";
import { CenyAdminClient } from "./CenyAdminClient";
import { AdminLogin } from "./AdminLogin";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "Admin — ceny e-shopu",
  robots: { index: false, follow: false },
};

export default async function CenyAdminPage() {
  const jar = await cookies();
  const ok = await verifySession(jar.get(ADMIN_COOKIE)?.value);
  if (!ok) return <AdminLogin />;
  return <CenyAdminClient />;
}
