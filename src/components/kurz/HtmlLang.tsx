"use client";

import * as React from "react";

/**
 * Root layout renderuje <html lang="sk">. EN stránka je jediná anglická
 * routa, tak jej jazyk prepneme na klientovi — kvôli screen readerom,
 * prekladačom a jazykovej detekcii prehliadača. Pre crawlerov je jazyk
 * navyše označený cez lang atribút na wrapperi + hreflang alternates.
 */
export function HtmlLang({ lang }: { lang: string }) {
  React.useEffect(() => {
    const el = document.documentElement;
    const prev = el.lang;
    el.lang = lang;
    return () => {
      el.lang = prev;
    };
  }, [lang]);

  return null;
}
