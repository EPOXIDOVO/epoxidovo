import { redirect } from "next/navigation";

/**
 * Hub /kupit-material je zrušený — „Kúpiť materiál" vedie rovno do katalógu.
 * Podstránky (kalkulacka, kosik, b2b) žijú ďalej na svojich cestách;
 * galéria dôvery sa presunula na spodok /eshop.
 */
export default function KupitMaterialRedirect() {
  redirect("/eshop");
}
