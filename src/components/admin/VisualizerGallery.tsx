"use client";

import * as React from "react";
import { X, AlertCircle, CheckCircle2 } from "lucide-react";

interface GalleryItem {
  id: string;
  createdAt: Date;
  ip: string;
  texture: string | null;
  color: string | null;
  ok: boolean;
  errorCode: string | null;
  inputImageData: string | null;
  inputMimeType: string | null;
  outputImageData: string | null;
  outputMimeType: string | null;
}

/**
 * Galéria s thumbnailmi všetkých AI generácií.
 * Klik na thumbnail otvorí modal s veľkým pred/po porovnaním.
 */
export function VisualizerGallery({ items }: { items: GalleryItem[] }) {
  const [selected, setSelected] = React.useState<GalleryItem | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {items.map((item) => (
          <GalleryThumb
            key={item.id}
            item={item}
            onClick={() => setSelected(item)}
          />
        ))}
      </div>

      {selected && (
        <DetailModal item={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}

function GalleryThumb({
  item,
  onClick,
}: {
  item: GalleryItem;
  onClick: () => void;
}) {
  const thumbSrc = item.outputImageData
    ? `data:${item.outputMimeType ?? "image/png"};base64,${item.outputImageData}`
    : item.inputImageData
      ? `data:${item.inputMimeType ?? "image/jpeg"};base64,${item.inputImageData}`
      : null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative aspect-square rounded-xl overflow-hidden bg-[var(--color-bg-muted)] border border-[var(--color-border)] hover:border-[#3db6e8] hover:shadow-md transition-all"
    >
      {thumbSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumbSrc}
          alt={`${item.texture} ${item.color}`}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-[var(--color-fg-subtle)] text-xs">
          (žiadny obrázok)
        </div>
      )}

      {/* Top-left badge — status */}
      <div className="absolute top-1.5 left-1.5">
        {item.ok ? (
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold backdrop-blur-sm">
            <CheckCircle2 className="w-2.5 h-2.5" aria-hidden />
            OK
          </span>
        ) : (
          <span
            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold backdrop-blur-sm"
            title={item.errorCode ?? "unknown"}
          >
            <AlertCircle className="w-2.5 h-2.5" aria-hidden />
            FAIL
          </span>
        )}
      </div>

      {/* Bottom overlay s info */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-2 text-left">
        <div className="text-[11px] text-white font-semibold truncate">
          {item.texture ?? "—"} · {item.color ?? "—"}
        </div>
        <div className="text-[10px] text-white/70 truncate">
          {new Date(item.createdAt).toLocaleString("sk-SK", {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </button>
  );
}

function DetailModal({
  item,
  onClose,
}: {
  item: GalleryItem;
  onClose: () => void;
}) {
  // ESC zatvára modal
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const inputSrc = item.inputImageData
    ? `data:${item.inputMimeType ?? "image/jpeg"};base64,${item.inputImageData}`
    : null;
  const outputSrc = item.outputImageData
    ? `data:${item.outputMimeType ?? "image/png"};base64,${item.outputImageData}`
    : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm overflow-y-auto"
    >
      <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative bg-white rounded-2xl max-w-6xl w-full p-5 md:p-7"
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Zavrieť"
            className="absolute top-3 right-3 inline-flex items-center justify-center w-9 h-9 rounded-full hover:bg-[var(--color-bg-muted)] transition-colors"
          >
            <X className="w-5 h-5" aria-hidden />
          </button>

          <div className="mb-5">
            <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-fg-subtle)]">
              Generácia #{item.id.slice(-8)}
            </div>
            <h2 className="text-2xl font-extrabold mt-1">
              {item.texture ?? "?"} · {item.color ?? "?"}
            </h2>
            <div className="mt-2 flex flex-wrap gap-3 text-sm text-[var(--color-fg-muted)]">
              <span>
                📅 {new Date(item.createdAt).toLocaleString("sk-SK")}
              </span>
              <span>🌐 IP: {item.ip}</span>
              {item.ok ? (
                <span className="text-emerald-700 font-semibold">✓ Úspešná</span>
              ) : (
                <span className="text-red-700 font-semibold">
                  ✗ Zlyhala ({item.errorCode ?? "unknown"})
                </span>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-fg-muted)] mb-2">
                Pred (input)
              </div>
              {inputSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={inputSrc}
                  alt="Input photo"
                  className="w-full rounded-xl border border-[var(--color-border)]"
                />
              ) : (
                <div className="aspect-square rounded-xl bg-[var(--color-bg-muted)] flex items-center justify-center text-[var(--color-fg-subtle)]">
                  Žiadny input
                </div>
              )}
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-fg-muted)] mb-2">
                Po (AI generácia)
              </div>
              {outputSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={outputSrc}
                  alt="AI output"
                  className="w-full rounded-xl border border-[var(--color-border)]"
                />
              ) : (
                <div className="aspect-square rounded-xl bg-red-50 border-2 border-red-200 flex items-center justify-center text-red-600 text-sm p-4 text-center">
                  Output nebol vygenerovaný<br />
                  ({item.errorCode ?? "unknown error"})
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
