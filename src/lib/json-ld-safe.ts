/**
 * Bezpečné JSON.stringify pre vloženie do <script type="application/ld+json">.
 *
 * JSON.stringify NEescapeuje `<`. Ak data obsahujú `</script>` (alebo aj
 * podobné `<!--`, `<script`), môžu predčasne ukončiť <script> tag a vykonať
 * injected HTML/JS. Industry standard ochrana: replace `<` → `<`.
 *
 * Aj keď náš content je momentálne statický (žiadne user input v JSON-LD),
 * táto utility je zero-cost defense-in-depth pre prípad budúcich zmien.
 */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
