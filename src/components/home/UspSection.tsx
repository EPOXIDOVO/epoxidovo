"use client";

import * as React from "react";

/**
 * USP sekcia "TÚTO PODLAHU POTREBUJEŠ, AJ KEĎ SI MYSLÍŠ ŽE NIE!"
 * Z Docs briefu klienta:
 *  - Tmavé pozadie + biely text
 *  - "AJ KEĎ SI MYSLÍŠ ŽE NIE!" → modrá zvýraznená (akcent)
 */
export function UspSection() {
  return (
    <section
      id="preco-epoxid"
      className="relative bg-[#0e1320] text-white overflow-hidden"
    >
      {/* Atmosférické pozadie — radial blue glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(60% 80% at 50% 50%, rgba(61,182,232,0.15) 0%, transparent 70%)",
        }}
        aria-hidden
      />

      <div className="relative max-w-5xl mx-auto px-5 md:px-8 py-24 md:py-32 lg:py-40 text-center">
        <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05]">
          <span className="block">TÚTO PODLAHU POTREBUJEŠ,</span>
          <span className="block mt-2 text-[#3db6e8]">
            AJ KEĎ SI MYSLÍŠ ŽE NIE!
          </span>
        </h2>
      </div>
    </section>
  );
}
