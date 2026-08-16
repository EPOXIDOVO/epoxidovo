import { redirect } from "next/navigation";

/** Kalkulačka sa presťahovala a premenovala na „Navrhni si podlahu". */
export default function KalkulackaRedirect() {
  redirect("/navrhni-podlahu");
}
