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
    // Mobile: natívny flow (content sa môže rozšíriť pod viewport a scroll je
    // natívny document scroll → CTA, form atď. sú dosiahnuteľné).
    // Desktop: SiteChrome dáva main h-[100dvh] flex flex-col → flex-1 vyplní
    // zvyšok, overflow-hidden = 1-page UX bez scrollu.
    <div className="bg-[#F8FAFC] md:flex-1 md:min-h-0 md:overflow-hidden">
      <AiVisualizer />
    </div>
  );
}
