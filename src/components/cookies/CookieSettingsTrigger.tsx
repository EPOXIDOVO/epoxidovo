"use client";

import * as React from "react";
import { Settings2 } from "lucide-react";

/**
 * Tlačidlo na otvorenie cookie banner settings z legal stránky.
 * Posiela 'open-cookie-settings' event ktorý počúva CookieBanner.
 */
export function CookieSettingsTrigger() {
  const open = () => {
    window.dispatchEvent(new Event("open-cookie-settings"));
  };
  return (
    <button
      type="button"
      onClick={open}
      className="not-prose inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#3db6e8] text-white font-semibold text-sm hover:bg-[#1a8cc4] shadow-[0_8px_24px_rgba(61,182,232,0.3)] transition-all duration-300"
    >
      <Settings2 className="w-4 h-4" aria-hidden />
      Spravovať cookies
    </button>
  );
}
