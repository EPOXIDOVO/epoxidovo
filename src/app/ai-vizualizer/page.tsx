import type { Metadata } from "next";
import { AiVisualizer } from "@/components/visualizer/AiVisualizer";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "AI Vizualizácia podlahy — EPOXIDOVO",
  description:
    "Nahraj fotku miestnosti a uvidíš ako by vyzerala s epoxidovou podlahou. AI vizualizácia zadarmo — vyber si textúru a farbu.",
  openGraph: {
    title: "AI Vizualizácia podlahy — pozri svoju budúcu podlahu",
    description:
      "Za 30 sekúnd uvidíš tvoju miestnosť s novou epoxidovou podlahou. AI nástroj zadarmo.",
  },
};

export default function AiVizualizerPage() {
  return (
    // SiteChrome dáva main h-[100dvh] flex flex-col → tento div vyplní zvyšok
    // (po global headeri) cez flex-1. Žiadny scroll na desktope.
    <div className="flex-1 min-h-0 bg-[#F8FAFC] overflow-y-auto md:overflow-hidden">
      <AiVisualizer />
    </div>
  );
}
