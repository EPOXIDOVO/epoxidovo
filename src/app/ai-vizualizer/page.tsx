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
    <div className="min-h-screen bg-[#F8FAFC]">
      <AiVisualizer />
    </div>
  );
}
