"use client";

import * as React from "react";
import { Star, Quote } from "lucide-react";
import { REVIEWS, type Review } from "@/content/reviews";

/**
 * Reviews — kontinuálny right-to-left sliding carousel.
 * Track sa posúva pásovo doľava — najlavejší review zmizne za okrajom,
 * vpravo sa objaví ďalší. Plynule, bez fade.
 *
 * 3 viditeľné na desktop, 1 na mobile.
 * Auto-rotation každých 4 sekúnd.
 */

const ROTATE_INTERVAL_MS = 4000;
const TRANSITION_MS = 800;

function ReviewCard({ review }: { review: Review }) {
  return (
    <figure className="mx-3 md:mx-4 h-full rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm shadow-[0_10px_30px_rgba(0,0,0,0.18)] px-5 py-5 md:px-6 md:py-6">
      {/* 5 hviezd */}
      <div className="flex items-center gap-1" aria-label="5 z 5 hviezdičiek">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className="w-4 h-4 fill-[#3db6e8] text-[#3db6e8]"
            aria-hidden
          />
        ))}
      </div>

      <blockquote className="mt-4 text-sm text-white/90 leading-relaxed min-h-[120px]">
        „{review.text}"
      </blockquote>

      <figcaption className="mt-5 font-bold text-sm text-white">
        {review.name}
      </figcaption>
      {(review.role || review.company) && (
        <div className="text-xs text-white/85 mt-0.5 leading-snug">
          {review.role}
          {review.role && review.company && " — "}
          {review.company && (
            <span className="font-semibold text-[#3db6e8]">
              {review.company}
            </span>
          )}
        </div>
      )}
      {review.location && (
        <div className="text-xs text-white/60 mt-0.5">{review.location}</div>
      )}
    </figure>
  );
}

export function Reviews() {
  const [offset, setOffset] = React.useState(0);
  const [withTransition, setWithTransition] = React.useState(true);
  const [visibleCount, setVisibleCount] = React.useState(3);

  const total = REVIEWS.length;

  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setVisibleCount(mq.matches ? 3 : 1);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Duplicate posledných N reviews dopredu — pre seamless wrap
  const trackItems = React.useMemo(
    () => [...REVIEWS, ...REVIEWS.slice(0, 3)],
    [],
  );

  React.useEffect(() => {
    const id = window.setInterval(() => {
      setOffset((o) => o + 1);
    }, ROTATE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);

  // Pri prekročení konca pôvodného poľa: reset bez animácie
  React.useEffect(() => {
    if (offset === total) {
      const t = window.setTimeout(() => {
        setWithTransition(false);
        setOffset(0);
        // Re-enable transition po dvoch frames (aby DOM stihol bez animácie)
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setWithTransition(true));
        });
      }, TRANSITION_MS);
      return () => window.clearTimeout(t);
    }
  }, [offset, total]);

  return (
    <section
      id="recenzie"
      className="relative bg-[var(--color-brand-bg)] text-white overflow-hidden"
    >
      <Quote
        className="absolute top-6 right-8 md:right-16 w-16 h-16 md:w-24 md:h-24 text-white/10"
        aria-hidden
      />

      {/* Full-width sekcia, znížené vertikálne paddingy ~50% (z py-16/20/24 → py-8/10/12) */}
      <div className="w-full px-5 md:px-10 lg:px-16 py-8 md:py-10 lg:py-12 relative">
        <div className="text-center mb-6 md:mb-8">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm text-[0.7rem] md:text-xs font-extrabold uppercase tracking-[0.18em] text-white">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-white" aria-hidden />
            ČO HOVORIA NAŠI KLIENTI
          </span>
          <h2 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-[1.15] text-white">
            Skutočné skúsenosti.
          </h2>
        </div>

        {/* Sliding carousel — overflow-hidden + track translateX */}
        <div className="overflow-hidden -mx-3 md:-mx-4">
          <div
            className="flex"
            style={{
              transform: `translateX(-${offset * (100 / visibleCount)}%)`,
              transition: withTransition
                ? `transform ${TRANSITION_MS}ms cubic-bezier(0.16, 1, 0.3, 1)`
                : "none",
            }}
          >
            {trackItems.map((review, i) => (
              <div
                key={`${review.id}-${i}`}
                className="shrink-0 basis-full md:basis-1/3"
              >
                <ReviewCard review={review} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
