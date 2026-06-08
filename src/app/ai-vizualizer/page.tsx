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
    // SiteChrome dáva main h-[100dvh] flex flex-col → tento div vyplní zvyšok.
    // overflow-y-auto: upload step sa zmestí presne na viewport (žiadny scroll),
    // ostatné kroky (result s CTA, pick textury, generating) sa môžu prirodzene
    // scrollovať ak presahujú výšku — najmä na mobile.
    <div className="flex-1 min-h-0 bg-[#F8FAFC] overflow-y-auto">
      <AiVisualizer />
    </div>
  );
}
