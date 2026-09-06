/**
 * Prepínače rozpracovaných častí webu.
 *
 * ESHOP_SPUSTENY = false znamená, že na verejnom webe nesmie byť ani jedna
 * preklikateľná cesta do obchodu, košíka ani B2B. Samotné routy ostávajú
 * funkčné cez priamu adresu — vieme si ich ukázať, len sa na ne nikto
 * nepreklikne. Keď e-shop spustíme, prepne sa jediná konštanta.
 *
 * Kde všade to visí:
 *   components/layout/EshopHeader.tsx  logo, odkaz E-shop, B2B, košík
 *   app/metalicka-podlaha/MetalikLanding.tsx  vloženie setu do košíka
 *   components/home/Hero.tsx  dlaždica „Kúpiť materiál" (má vlastný „Čoskoro")
 */
export const ESHOP_SPUSTENY = false;
