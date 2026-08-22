import { redirect } from "next/navigation";

/**
 * /en zatiaľ nie je plná anglická mutácia webu — jediná EN stránka je
 * landing kurzu. Aby /en nekončilo 404 (a aby sa prípadné odkazy zvonku
 * nestratili), presmerujeme na ňu.
 */
export default function EnIndexRedirect() {
  redirect("/en/epoxy-flooring-course");
}
