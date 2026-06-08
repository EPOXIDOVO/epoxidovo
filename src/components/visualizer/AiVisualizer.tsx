"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  Upload,
  RefreshCw,
  Download,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  Images,
  Maximize2,
  X,
} from "lucide-react";
import { TurnstileWidget } from "@/components/turnstile/TurnstileWidget";
import { trackEvent } from "@/components/analytics/Analytics";
import {
  COLORS,
  TEXTURES,
  type TextureSlug,
} from "@/lib/visualizer-presets";

type Step =
  | "upload"
  | "pick-texture"
  | "pick-color"
  | "generating"
  | "result"
  | "error";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * AI Vizualizér — 5 krokov:
 *   1. Upload fotky (drag-drop alebo klik)
 *   2. Validating (server overí že je to podlaha)
 *   3. Pick textúru + farbu
 *   4. Generating (server volá Gemini Nano Banana 2)
 *   5. Result (before/after + CTA na cenovku alebo "skús inú")
 */
export function AiVisualizer() {
  const [step, setStep] = React.useState<Step>("upload");
  const [error, setError] = React.useState<string | null>(null);
  const [progress, setProgress] = React.useState(0);

  // Upload state
  const [imageBase64, setImageBase64] = React.useState<string | null>(null);
  const [mimeType, setMimeType] = React.useState<string>("image/jpeg");
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  // Picker state
  const [texture, setTexture] = React.useState<TextureSlug>("hladka");
  const [colorSlug, setColorSlug] = React.useState<string>(
    COLORS.hladka[0].slug,
  );
  const [turnstileToken, setTurnstileToken] = React.useState<string | null>(null);

  // Result state
  const [resultBase64, setResultBase64] = React.useState<string | null>(null);
  const [resultMime, setResultMime] = React.useState<string>("image/png");
  const [sliderPos, setSliderPos] = React.useState(50);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // ───────────────────────────────────────────────────────────────────────
  // File upload handlers
  // ───────────────────────────────────────────────────────────────────────

  const handleFile = async (file: File) => {
    setError(null);
    if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) {
      setError("Podporujeme len JPG, PNG a WebP fotky.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("Fotka je príliš veľká. Max 5 MB.");
      return;
    }

    // Read as base64 a rovno do pick-texture step.
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(",")[1];
      setImageBase64(base64);
      setMimeType(file.type === "image/jpg" ? "image/jpeg" : file.type);
      setPreviewUrl(dataUrl);
      trackEvent("visualizer_upload", { size: file.size, type: file.type });
      setStep("pick-texture");
      scrollToTop();
    };
    reader.onerror = () => setError("Nepodarilo sa načítať fotku. Skús inú.");
    reader.readAsDataURL(file);
  };

  // Scrolluje stránku na top — používame pri každej zmene stepu aby user
  // nikdy nezostal "stratený" v scrolle (1-page UX).
  const scrollToTop = React.useCallback(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, []);

  // ───────────────────────────────────────────────────────────────────────
  // Generation
  // ───────────────────────────────────────────────────────────────────────

  const generate = async () => {
    if (!imageBase64 || !turnstileToken) return;
    setStep("generating");
    setProgress(0);
    setError(null);
    scrollToTop();

    // Smooth progress UX (fake — Gemini call netracking inkrementálny)
    const startTime = Date.now();
    const expectedDuration = 25_000; // 25s typical
    const progressTimer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(95, (elapsed / expectedDuration) * 100);
      setProgress(pct);
    }, 500);

    try {
      const res = await fetch("/api/visualizer/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64,
          mimeType,
          texture,
          colorSlug,
          turnstileToken,
        }),
      });
      clearInterval(progressTimer);
      setProgress(100);

      const data = await res.json();
      if (!data.ok) {
        setError(data.message ?? "Generácia zlyhala. Skús to znovu.");
        setStep("error");
        trackEvent("visualizer_generate_fail", { reason: data.error });
        return;
      }
      setResultBase64(data.imageBase64);
      setResultMime(data.mimeType ?? "image/png");
      setStep("result");
      scrollToTop();
      trackEvent("visualizer_generate_ok", { texture, color: colorSlug });
    } catch {
      clearInterval(progressTimer);
      setError("Sieťová chyba pri generovaní. Skús znovu.");
      setStep("error");
    }
  };

  // ───────────────────────────────────────────────────────────────────────
  // Result helpers
  // ───────────────────────────────────────────────────────────────────────

  const tryAgain = () => {
    setResultBase64(null);
    setStep("pick-texture");
    scrollToTop();
  };

  const startOver = () => {
    setImageBase64(null);
    setPreviewUrl(null);
    setResultBase64(null);
    setError(null);
    setProgress(0);
    setStep("upload");
  };

  const download = () => {
    if (!resultBase64) return;
    const link = document.createElement("a");
    link.href = `data:${resultMime};base64,${resultBase64}`;
    link.download = `epoxidovo-vizualizacia-${texture}-${colorSlug}.png`;
    link.click();
    trackEvent("visualizer_download", { texture, color: colorSlug });
  };

  const requestQuote = () => {
    if (!resultBase64) return;
    // Pre-fill /cenova-ponuka cez sessionStorage (väčší než URL params).
    try {
      const colorObj = COLORS[texture].find((c) => c.slug === colorSlug);
      sessionStorage.setItem(
        "visualizer_prefill",
        JSON.stringify({
          texture,
          colorSlug,
          textureLabel: TEXTURES[texture].label,
          colorName: colorObj?.commercialName ?? colorSlug,
          generatedAt: new Date().toISOString(),
        }),
      );
    } catch {
      // sessionStorage nedostupné — pokračujeme bez prefill
    }
    trackEvent("visualizer_request_quote", { texture, color: colorSlug });
    window.location.href = `/cenova-ponuka?source=ai_vizualizer&texture=${texture}&color=${colorSlug}`;
  };

  // Auto-update color keď user prepne textúru
  React.useEffect(() => {
    setColorSlug(COLORS[texture][0].slug);
  }, [texture]);

  // ───────────────────────────────────────────────────────────────────────
  // Render — krokový UI
  // ───────────────────────────────────────────────────────────────────────

    // Mobile: prirodzená výška; Desktop: vyplní viewport (page wrapper limituje výšku).
  return (
    <div className="max-w-5xl mx-auto px-4 py-3 md:py-4 md:h-full md:flex md:flex-col">
      <Breadcrumb />
      <Header step={step} />

      {/* STEP: UPLOAD — mobile: iba upload | desktop: upload + demo side-by-side,
          rovnaká výška, vyplní zvyšok viewportu (flex-1 + min-h-0). */}
      {step === "upload" && (
        <div className="md:grid md:grid-cols-[3fr_2fr] md:gap-6 md:items-stretch md:flex-1 md:min-h-0 md:mt-4">
          <UploadStep
            onFile={handleFile}
            onClick={() => fileInputRef.current?.click()}
            error={error}
          />
          <DemoExample />
        </div>
      )}

      {/* STEP: PICK TEXTURE */}
      {step === "pick-texture" && previewUrl && (
        <PickTextureStep
          previewUrl={previewUrl}
          texture={texture}
          onTexture={(t) => {
            setTexture(t);
            setStep("pick-color");
            scrollToTop();
          }}
          onBack={startOver}
        />
      )}

      {/* STEP: PICK COLOR */}
      {step === "pick-color" && previewUrl && (
        <PickColorStep
          previewUrl={previewUrl}
          texture={texture}
          colorSlug={colorSlug}
          onColor={setColorSlug}
          turnstileToken={turnstileToken}
          onTurnstile={setTurnstileToken}
          onGenerate={generate}
          onBack={() => {
            setStep("pick-texture");
            scrollToTop();
          }}
        />
      )}

      {/* STEP: GENERATING */}
      {step === "generating" && (
        <GeneratingStep progress={progress} />
      )}

      {/* STEP: RESULT */}
      {step === "result" && resultBase64 && previewUrl && (
        <ResultStep
          beforeUrl={previewUrl}
          afterDataUrl={`data:${resultMime};base64,${resultBase64}`}
          sliderPos={sliderPos}
          onSlider={setSliderPos}
          textureLabel={TEXTURES[texture].label}
          colorName={
            COLORS[texture].find((c) => c.slug === colorSlug)?.commercialName ??
            colorSlug
          }
          onDownload={download}
          onTryAgain={tryAgain}
          onRequestQuote={requestQuote}
          onStartOver={startOver}
        />
      )}

      {/* STEP: ERROR */}
      {step === "error" && (
        <ErrorStep message={error} onRetry={startOver} />
      )}

      {/* Hidden file input — globálny pre re-use */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// Sub-komponenty
// ════════════════════════════════════════════════════════════════════════

/* Breadcrumb — "Domovská stránka / AI Vizualizácia" pre lepšiu navigáciu.
   Mnoho používateľov nevie že kliknutím na logo sa vrátia domov. */
function Breadcrumb() {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-2 md:mb-3 text-xs md:text-sm font-bold text-[#1B2430]/65 shrink-0 text-center"
    >
      <ol className="inline-flex items-center gap-1.5">
        <li>
          <Link
            href="/"
            className="hover:text-[#2EA3DC] transition-colors"
          >
            Domovská stránka
          </Link>
        </li>
        <li className="text-[#1B2430]/30" aria-hidden>
          /
        </li>
        <li className="text-[#2EA3DC] font-black">AI Vizualizácia</li>
      </ol>
    </nav>
  );
}

function Header({ step }: { step: Step }) {
  const stepNum =
    step === "upload"
      ? 1
      : step === "pick-texture" || step === "pick-color"
        ? 2
        : step === "generating" || step === "result"
          ? 3
          : 0;
  // Dynamický nadpis + subtitle podľa kroku
  const isResult = step === "result";
  const title = isResult
    ? "Hotovo! Takto môže vyzerať tvoja podlaha"
    : "Pozri si ako bude vyzerať tvoja podlaha";
  const subtitleNode = isResult ? (
    <>
      Výsledky AI nie sú vždy 100% presné — pre istotu si pozri aj
      <br className="hidden md:inline" />
      <span className="md:hidden"> </span>
      reálne <strong>ukážky našich realizácií</strong>.
    </>
  ) : (
    <>
      Nahraj fotku, vyber typ podlahy a farbu.
      <br className="hidden md:inline" />
      <span className="md:hidden"> </span>
      AI ti za pár sekúnd ukáže ako bude vyzerať.
    </>
  );

  return (
    <header className="text-center mb-3 md:mb-4 md:shrink-0">
      {/* AI gradient pill — značí "AI features" v celom UI */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-gradient-to-r from-[#7EC8F0] via-[#6AA8F0] to-[#8B5CF6] text-white text-[10px] md:text-xs font-extrabold uppercase tracking-wider mb-2 md:mb-3 shadow-[0_4px_14px_rgba(139,92,246,0.35)]">
        <Sparkles className="w-3 h-3 md:w-3.5 md:h-3.5" aria-hidden />
        AI Vizualizácia
      </div>
      <h1 className="text-xl md:text-5xl font-black tracking-tight text-[#1B2430]">
        {title}
      </h1>
      <p className="mt-1.5 md:mt-3 text-xs md:text-lg font-bold text-[#1B2430]/65 max-w-2xl mx-auto leading-snug md:leading-relaxed">
        {subtitleNode}
      </p>
      {/* Po výsledku — odkaz na realizácie pre istotu */}
      {isResult && (
        <Link
          href="/realizacie"
          className="mt-3 md:mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-[#2EA3DC] font-extrabold text-xs md:text-sm ring-1 ring-[#2EA3DC]/30 hover:bg-[#2EA3DC]/5 hover:ring-[#2EA3DC] transition-colors shadow-sm"
        >
          <Images className="w-4 h-4" aria-hidden />
          Pozri ukážky realizácií
        </Link>
      )}
      {stepNum > 0 && (
        <div className="mt-3 md:mt-6 flex justify-center gap-1.5 md:gap-2">
          {[1, 2, 3].map((n) => (
            <span
              key={n}
              className={`h-1 md:h-1.5 rounded-full transition-all ${
                n <= stepNum
                  ? "w-8 md:w-12 bg-gradient-to-r from-[#7EC8F0] via-[#6AA8F0] to-[#8B5CF6]"
                  : "w-4 md:w-6 bg-[#1B2430]/15"
              }`}
            />
          ))}
        </div>
      )}
    </header>
  );
}

function UploadStep({
  onFile,
  onClick,
  error,
}: {
  onFile: (f: File) => void;
  onClick: () => void;
  error?: string | null;
}) {
  const [dragging, setDragging] = React.useState(false);
  return (
    <>
      {/* Error banner ak validácia predošlej fotky zlyhala (nie je podlaha) */}
      {error && (
        <div className="mb-5 rounded-2xl bg-amber-50 border border-amber-200 p-4 md:p-5 flex items-start gap-3">
          <span className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-700">
            <AlertCircle className="w-5 h-5" aria-hidden />
          </span>
          <div className="text-sm md:text-base font-bold text-amber-900 leading-relaxed">
            {error}
          </div>
        </div>
      )}

    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const f = e.dataTransfer.files?.[0];
        if (f) onFile(f);
      }}
      onClick={onClick}
      className={`cursor-pointer rounded-3xl border-2 border-dashed p-6 md:p-10 lg:p-14 text-center transition-all bg-white md:h-full md:flex md:flex-col md:items-center md:justify-center ${
        dragging
          ? "border-[#2EA3DC] bg-[#2EA3DC]/5 scale-[1.01] shadow-[0_8px_28px_rgba(46,163,220,0.2)]"
          : "border-[#1B2430]/20 hover:border-[#2EA3DC] hover:bg-[#2EA3DC]/5 hover:shadow-[0_8px_28px_rgba(46,163,220,0.15)]"
      }`}
    >
      <div className="inline-flex items-center justify-center w-12 h-12 md:w-20 md:h-20 rounded-2xl bg-[#2EA3DC] text-white mb-3 md:mb-5 shadow-[0_8px_20px_rgba(46,163,220,0.4)]">
        <Upload className="w-6 h-6 md:w-9 md:h-9" aria-hidden />
      </div>
      <h2 className="text-base md:text-2xl font-extrabold tracking-tight text-[#1B2430]">
        <span className="md:hidden">Klikni a nahraj fotku…</span>
        <span className="hidden md:inline">Klikni alebo presuň fotku miestnosti</span>
      </h2>
      <p className="mt-1 md:mt-2 text-xs md:text-base font-bold text-[#1B2430]/65">
        JPG, PNG alebo WebP · max 5 MB
      </p>

      <div className="mt-4 md:mt-7 max-w-md mx-auto text-left bg-[#F8FAFC] rounded-2xl p-3 md:p-5 ring-1 ring-[#1B2430]/5">
        <div className="text-[10px] md:text-xs font-extrabold text-[#1B2430] uppercase tracking-wider mb-1.5 md:mb-2">
          💡 Tipy pre najlepší výsledok
        </div>
        <ul className="space-y-1 md:space-y-1.5 text-[11px] md:text-sm font-bold text-[#1B2430]/70 leading-snug md:leading-relaxed">
          <li>• Dobré osvetlenie</li>
          <li>• Aspoň 40 % fotky by mala byť podlaha</li>
          <li>• Predmety, nábytok aj ľudia môžu ostať na fotke</li>
        </ul>
      </div>
    </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * Sekvenčný picker — krok 1: VÝBER TEXTÚRY
 * ─────────────────────────────────────────────────────────────────────── */
function PickTextureStep({
  previewUrl,
  texture,
  onTexture,
  onBack,
}: {
  previewUrl: string;
  texture: TextureSlug;
  onTexture: (t: TextureSlug) => void;
  onBack: () => void;
}) {
  const textureKeys = Object.keys(TEXTURES) as TextureSlug[];

  return (
    <div className="rounded-3xl bg-white p-4 md:p-6 shadow-[0_10px_40px_rgba(27,36,48,0.08)] ring-1 ring-[#1B2430]/5">
      {/* Mini preview fotky + back tlačidlo */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-2xl overflow-hidden bg-[#F8FAFC] shrink-0 ring-1 ring-[#1B2430]/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs md:text-sm font-extrabold text-[#1B2430]/70 hover:text-[#2EA3DC] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden />
          Zmeniť fotku
        </button>
      </div>

      <label className="block text-base md:text-lg font-extrabold text-[#1B2430] mb-3">
        1. Vyber typ podlahy
      </label>
      <div className="grid grid-cols-2 gap-2.5 md:gap-3">
        {textureKeys.map((t) => {
          const def = TEXTURES[t];
          const active = t === texture;
          return (
            <button
              key={t}
              type="button"
              onClick={() => onTexture(t)}
              className={`group relative overflow-hidden rounded-2xl border-2 transition-all text-left ${
                active
                  ? "border-[#2EA3DC] scale-[1.02] shadow-[0_8px_28px_rgba(46,163,220,0.35)]"
                  : "border-[#1B2430]/10 hover:border-[#2EA3DC]/50 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(27,36,48,0.1)]"
              }`}
            >
              {/* Vizuálny náhľad textúry — reálna fotka ak je k dispozícii,
                  inak CSS pattern fallback. */}
              <div
                className="aspect-[4/3] w-full relative bg-[#F8FAFC]"
                style={def.previewImage ? undefined : def.swatchCss}
              >
                {def.previewImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={def.previewImage}
                    alt={`Náhľad podlahy: ${def.label}`}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{
                      objectPosition:
                        def.previewObjectPosition ?? "center center",
                    }}
                  />
                )}
                {active && (
                  <span className="absolute top-2 right-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#2EA3DC] text-white shadow-[0_4px_12px_rgba(46,163,220,0.5)] ring-2 ring-white">
                    <CheckCircle2 className="w-4 h-4" aria-hidden />
                  </span>
                )}
              </div>
              {/* Label pod náhľadom */}
              <div className="p-2.5 md:p-3 bg-white">
                <div className="text-sm md:text-base font-extrabold text-[#1B2430]">
                  {def.label}
                </div>
                <div className="text-[10px] md:text-xs font-bold text-[#1B2430]/60 mt-0.5 leading-tight">
                  {def.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-[11px] md:text-xs font-bold text-center text-[#1B2430]/50">
        Klikni na textúru → pokračuješ na výber farby
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * Sekvenčný picker — krok 2: VÝBER FARBY + Turnstile + Generate
 * ─────────────────────────────────────────────────────────────────────── */
function PickColorStep({
  previewUrl,
  texture,
  colorSlug,
  onColor,
  turnstileToken,
  onTurnstile,
  onGenerate,
  onBack,
}: {
  previewUrl: string;
  texture: TextureSlug;
  colorSlug: string;
  onColor: (c: string) => void;
  turnstileToken: string | null;
  onTurnstile: (t: string | null) => void;
  onGenerate: () => void;
  onBack: () => void;
}) {
  const colors = COLORS[texture];
  const textureDef = TEXTURES[texture];
  const activeColor = colors.find((c) => c.slug === colorSlug);

  return (
    <div className="rounded-3xl bg-white p-4 md:p-6 shadow-[0_10px_40px_rgba(27,36,48,0.08)] ring-1 ring-[#1B2430]/5">
      {/* Mini preview + zvolená textúra + back */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-2xl overflow-hidden bg-[#F8FAFC] shrink-0 ring-1 ring-[#1B2430]/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] md:text-xs font-extrabold uppercase tracking-wider text-[#1B2430]/55">
            Textúra
          </div>
          <div className="text-sm md:text-base font-extrabold text-[#1B2430] truncate">
            {textureDef.label}
          </div>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#1B2430]/70 hover:text-[#2EA3DC] transition-colors shrink-0"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden />
          Späť
        </button>
      </div>

      <label className="block text-base md:text-lg font-extrabold text-[#1B2430] mb-3">
        2. Vyber farbu
      </label>
      <div className="grid grid-cols-4 gap-2">
        {colors.map((c) => {
          const active = c.slug === colorSlug;
          return (
            <button
              key={c.slug}
              type="button"
              onClick={() => onColor(c.slug)}
              title={c.commercialName}
              className={`group relative aspect-square rounded-xl border-2 transition-all ${
                active
                  ? "border-[#2EA3DC] scale-105 shadow-[0_6px_20px_rgba(46,163,220,0.4)]"
                  : "border-[#1B2430]/10 hover:border-[#2EA3DC]/50"
              }`}
              style={{ backgroundColor: c.hex }}
            >
              {active && (
                <CheckCircle2
                  className="absolute top-1 right-1 w-4 h-4 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
                  aria-hidden
                />
              )}
            </button>
          );
        })}
      </div>
      {activeColor && (
        <div className="mt-2 text-sm font-extrabold text-[#1B2430]">
          {activeColor.commercialName}
        </div>
      )}

      <div className="mt-4 flex justify-center">
        <TurnstileWidget
          onVerify={onTurnstile}
          onExpire={() => onTurnstile(null)}
        />
      </div>

      {/* Primárna akcia — oranžová pill ako "Cenová ponuka" na homepage */}
      <button
        type="button"
        disabled={!turnstileToken}
        onClick={onGenerate}
        className="mt-3 w-full inline-flex items-center justify-center gap-2 px-6 py-3 md:py-3.5 rounded-full bg-[#F0851A] text-white font-extrabold text-sm md:text-base hover:bg-[#D9760F] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_10px_30px_rgba(240,133,26,0.45)] hover:shadow-[0_14px_40px_rgba(240,133,26,0.6)] transition-all duration-300"
      >
        <Sparkles className="w-5 h-5" aria-hidden />
        Vygenerovať vizualizáciu
      </button>
      <p className="mt-2 text-[11px] font-bold text-center text-[#1B2430]/50">
        Trvá 20–40 sekúnd · denný limit 3 generácie
      </p>
    </div>
  );
}

function GeneratingStep({ progress }: { progress: number }) {
  const stages = [
    { pct: 15, label: "📸 Analyzujeme fotku…" },
    { pct: 40, label: "🎨 Aplikujeme textúru…" },
    { pct: 75, label: "💧 Pridávame odrazy a lesk…" },
    { pct: 95, label: "✨ Finalizujeme…" },
  ];
  const currentStage =
    stages.find((s) => progress < s.pct) ?? stages[stages.length - 1];

  return (
    <div className="rounded-3xl bg-white p-8 md:p-12 text-center shadow-[0_10px_40px_rgba(27,36,48,0.08)] ring-1 ring-[#1B2430]/5">
      {/* AI gradient spinner — conic gradient rotujúci s biely stred */}
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-5 relative">
        <span
          aria-hidden
          className="absolute inset-0 rounded-full animate-spin"
          style={{
            background:
              "conic-gradient(from 0deg, #7EC8F0, #6AA8F0, #8B5CF6, #7EC8F0)",
            animationDuration: "1.4s",
          }}
        />
        <span className="absolute inset-1.5 rounded-full bg-white" />
        <Sparkles
          className="relative w-8 h-8 text-[#8B5CF6]"
          aria-hidden
        />
      </div>
      <h2 className="text-xl md:text-2xl font-black text-[#1B2430]">
        Generujeme tvoju podlahu
      </h2>

      <div className="mt-6 w-full max-w-md mx-auto bg-[#1B2430]/10 rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#7EC8F0] via-[#6AA8F0] to-[#8B5CF6] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-3 text-sm font-extrabold text-[#1B2430]">
        {currentStage.label}
      </div>
      <p className="mt-1 text-xs font-bold text-[#1B2430]/60">
        {Math.round(progress)}% · zvyčajne 20-40 sekúnd
      </p>
    </div>
  );
}

function ResultStep({
  beforeUrl,
  afterDataUrl,
  sliderPos,
  onSlider,
  textureLabel,
  colorName,
  onDownload,
  onTryAgain,
  onRequestQuote,
  onStartOver,
}: {
  beforeUrl: string;
  afterDataUrl: string;
  sliderPos: number;
  onSlider: (v: number) => void;
  textureLabel: string;
  colorName: string;
  onDownload: () => void;
  onTryAgain: () => void;
  onRequestQuote: () => void;
  onStartOver: () => void;
}) {
  const [fullscreen, setFullscreen] = React.useState(false);

  // ESC zatvára fullscreen
  React.useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setFullscreen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen]);

  return (
    <div className="rounded-3xl bg-white p-5 md:p-8 shadow-[0_10px_40px_rgba(27,36,48,0.08)] ring-1 ring-[#1B2430]/5">
      {/* Before/After slider — klik na obrázok → fullscreen lightbox */}
      <div
        className="relative w-full aspect-video md:aspect-[4/3] rounded-2xl overflow-hidden bg-[#F8FAFC] select-none group cursor-zoom-in"
        style={{ touchAction: "none" }}
        onClick={() => setFullscreen(true)}
        role="button"
        tabIndex={0}
        aria-label="Otvor veľký náhľad výsledku"
      >
        {/* After (vždy plne viditeľný v pozadí) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={afterDataUrl}
          alt={`Po: ${textureLabel} ${colorName}`}
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
        {/* Before (overlay, oklieštený podľa slider pozicie) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={beforeUrl}
            alt="Pred"
            className="absolute inset-0 w-full h-full object-cover"
            draggable={false}
          />
        </div>
        {/* Slider handle */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] pointer-events-none"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center gap-0.5">
            <ArrowLeft className="w-3 h-3 text-[#1B2430]" aria-hidden />
            <ArrowRight className="w-3 h-3 text-[#1B2430]" aria-hidden />
          </div>
        </div>
        {/* Labels */}
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-[#1B2430]/85 text-white text-xs font-extrabold uppercase tracking-wider backdrop-blur-sm pointer-events-none">
          Pred
        </div>
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-[#2EA3DC] text-white text-xs font-extrabold uppercase tracking-wider shadow-[0_4px_12px_rgba(46,163,220,0.4)] pointer-events-none">
          Po
        </div>
        {/* Expand icon — vizuálny hint že sa dá kliknúť */}
        <div className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#1B2430]/85 text-white text-[10px] md:text-xs font-extrabold backdrop-blur-sm shadow-md pointer-events-none group-hover:bg-[#1B2430]">
          <Maximize2 className="w-3 h-3 md:w-3.5 md:h-3.5" aria-hidden />
          Zväčšiť
        </div>
        {/* Slider input — full width invisible. stopPropagation aby nezatvorilo expand. */}
        <input
          type="range"
          min={0}
          max={100}
          value={sliderPos}
          onChange={(e) => onSlider(Number(e.target.value))}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
          aria-label="Porovnanie pred a po"
        />
      </div>

      <div className="mt-4 text-center">
        <div className="text-sm font-extrabold text-[#1B2430]">
          {textureLabel} · {colorName}
        </div>
        <div className="text-xs font-bold text-[#1B2430]/60 mt-0.5">
          ← Posuvníkom porovnaj pred a po · klik = veľký náhľad
        </div>
      </div>

      {/* 3 secondary buttons — vždy v jednom rade (grid-cols-3),
          ikona naľavo, label napravo, jednotná šírka. */}
      <div className="mt-6 grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={onDownload}
          className="inline-flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 px-2 md:px-4 py-3 rounded-2xl bg-[#F8FAFC] text-[#1B2430] font-extrabold text-[11px] md:text-sm ring-1 ring-[#1B2430]/10 hover:bg-white hover:ring-[#2EA3DC] hover:text-[#2EA3DC] hover:shadow-[0_6px_16px_rgba(46,163,220,0.15)] transition-all"
        >
          <Download className="w-4 h-4 md:w-4 md:h-4 shrink-0" aria-hidden />
          <span>Stiahnuť</span>
        </button>
        <button
          type="button"
          onClick={onTryAgain}
          className="inline-flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 px-2 md:px-4 py-3 rounded-2xl bg-[#F8FAFC] text-[#1B2430] font-extrabold text-[11px] md:text-sm ring-1 ring-[#1B2430]/10 hover:bg-white hover:ring-[#2EA3DC] hover:text-[#2EA3DC] hover:shadow-[0_6px_16px_rgba(46,163,220,0.15)] transition-all"
        >
          <RefreshCw className="w-4 h-4 md:w-4 md:h-4 shrink-0" aria-hidden />
          <span className="text-center leading-tight">Iná farba</span>
        </button>
        <button
          type="button"
          onClick={onStartOver}
          className="inline-flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 px-2 md:px-4 py-3 rounded-2xl bg-[#F8FAFC] text-[#1B2430] font-extrabold text-[11px] md:text-sm ring-1 ring-[#1B2430]/10 hover:bg-white hover:ring-[#2EA3DC] hover:text-[#2EA3DC] hover:shadow-[0_6px_16px_rgba(46,163,220,0.15)] transition-all"
        >
          <Upload className="w-4 h-4 md:w-4 md:h-4 shrink-0" aria-hidden />
          <span>Iná fotka</span>
        </button>
      </div>

      {/* Fullscreen lightbox — veľký náhľad výsledku */}
      {fullscreen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setFullscreen(false)}
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-3 md:p-8 cursor-zoom-out"
        >
          <button
            type="button"
            onClick={() => setFullscreen(false)}
            aria-label="Zavrieť"
            className="absolute top-4 right-4 inline-flex items-center justify-center w-11 h-11 rounded-full bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm transition-colors z-10"
          >
            <X className="w-6 h-6" aria-hidden />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={afterDataUrl}
            alt={`Po: ${textureLabel} ${colorName}`}
            className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/15 text-white text-xs md:text-sm font-extrabold backdrop-blur-sm">
            {textureLabel} · {colorName}
          </div>
        </div>
      )}

      {/* CTA na cenovku — najdôležitejšia časť, konverzný hook (orange brand) */}
      <div className="mt-8 rounded-3xl bg-gradient-to-br from-[#F0851A] to-[#D9760F] p-6 md:p-8 text-center text-white shadow-[0_12px_40px_rgba(240,133,26,0.35)]">
        <h3 className="text-xl md:text-2xl font-black tracking-tight">
          Páči sa ti? Pošlite mi nezáväznú cenovku.
        </h3>
        <p className="mt-2 text-sm md:text-base font-bold text-white/95 leading-relaxed max-w-md mx-auto">
          Pripravíme presnú kalkuláciu na túto podlahu pre tvoju miestnosť do
          24 hodín.
        </p>
        <button
          type="button"
          onClick={onRequestQuote}
          className="mt-5 inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white text-[#D9760F] font-black text-sm md:text-base hover:bg-white/95 shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition-all"
        >
          <Send className="w-4 h-4" aria-hidden />
          Cenová ponuka z vizualizátora
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * Demo "Ako to funguje" — kompaktný vertikálny info panel.
 * Sedí VEDĽA upload boxu na desktope (md+ only). Mobile: skrytý.
 * ─────────────────────────────────────────────────────────────────────── */
function DemoExample() {
  return (
    <aside
      aria-label="Príklad ako funguje AI vizualizácia"
      className="hidden md:flex md:flex-col md:h-full md:rounded-3xl md:bg-white md:p-5 md:shadow-[0_10px_40px_rgba(27,36,48,0.08)] md:ring-1 md:ring-[#1B2430]/5"
    >
      {/* Header — väčší, výraznejší */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-[#7EC8F0] via-[#6AA8F0] to-[#8B5CF6] text-white shadow-[0_6px_18px_rgba(139,92,246,0.4)]">
          <Sparkles className="w-5 h-5" aria-hidden />
        </span>
        <h3 className="text-lg font-black text-[#1B2430] uppercase tracking-wider">
          Ako to funguje
        </h3>
      </div>

      {/* Pred fotka + popis NAD fotkou — väčší, cyan, bold */}
      <div className="mt-3 shrink-0">
        <div className="text-sm font-black text-[#2EA3DC] uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#2EA3DC] text-white text-[10px] font-black">1</span>
          Nahraj svoju fotku
        </div>
      </div>
      <div className="relative flex-1 min-h-[100px] rounded-2xl overflow-hidden bg-[#F8FAFC] ring-1 ring-[#1B2430]/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/visualizer-demo/pred.jpg"
          alt="Pôvodná fotka miestnosti"
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute top-2 left-2 px-2.5 py-1 rounded-md bg-[#1B2430] text-white text-xs font-black uppercase tracking-wider shadow-md">
          Pred
        </div>
      </div>

      {/* Šípka medzi fotkami — väčšia, výraznejšia + "ai vygeneruje" */}
      <div className="relative flex flex-col items-center justify-center py-3 shrink-0">
        <span
          className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-[#7EC8F0]/30 via-[#8B5CF6]/60 to-[#8B5CF6]/30 rounded-full"
          aria-hidden
        />
        <span className="relative inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-[#7EC8F0] via-[#6AA8F0] to-[#8B5CF6] text-white shadow-[0_8px_24px_rgba(139,92,246,0.55)] ring-4 ring-white">
          <ArrowDown className="w-7 h-7" strokeWidth={3} aria-hidden />
        </span>
        <span className="relative mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white ring-2 ring-[#8B5CF6]/40 text-[#8B5CF6] text-xs font-black uppercase tracking-wider shadow-sm">
          <Sparkles className="w-3.5 h-3.5" aria-hidden />
          AI · 30 sekúnd
        </span>
      </div>

      {/* Po fotka + popis NAD fotkou — väčší, cyan, bold */}
      <div className="shrink-0">
        <div className="text-sm font-black text-[#2EA3DC] uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#2EA3DC] text-white text-[10px] font-black">2</span>
          AI vygeneruje výsledok
        </div>
      </div>
      <div className="relative flex-1 min-h-[80px] rounded-2xl overflow-hidden bg-[#F8FAFC] ring-2 ring-[#2EA3DC]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/visualizer-demo/po.jpg"
          alt="Fotka miestnosti po AI vizualizácii"
          className="absolute inset-0 w-full h-full object-cover scale-[1.12]"
          style={{ objectPosition: "center 38%" }}
          loading="lazy"
        />
        <div className="absolute top-2 left-2 px-2.5 py-1 rounded-md bg-[#2EA3DC] text-white text-xs font-black uppercase tracking-wider shadow-[0_4px_12px_rgba(46,163,220,0.5)]">
          Po
        </div>
        <div className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-[#7EC8F0] via-[#6AA8F0] to-[#8B5CF6] text-white text-[10px] font-black uppercase tracking-wider shadow-md">
          <Sparkles className="w-2.5 h-2.5" aria-hidden />
          AI
        </div>
      </div>

      {/* Krátke upozornenie + link na realizácie (bez pomlčky, 2 riadky pod sebou) */}
      <div className="mt-3 rounded-xl bg-[#F0851A]/10 ring-1 ring-[#F0851A]/30 px-3 py-2 shrink-0">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-[#F0851A] shrink-0 mt-0.5" aria-hidden />
          <div className="text-xs font-bold text-[#1B2430] leading-snug">
            <div>AI nemusí vždy vygenerovať správny výsledok.</div>
            <div className="mt-0.5">
              Pre istotu si pozri aj{" "}
              <Link
                href="/realizacie"
                className="text-[#F0851A] hover:text-[#D9760F] font-black underline underline-offset-2"
              >
                ukážky realizácií
              </Link>
              .
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function ErrorStep({
  message,
  onRetry,
}: {
  message: string | null;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-3xl bg-white p-8 md:p-12 text-center shadow-[var(--shadow-card)] border border-red-100">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-red-600 mb-5">
        <AlertCircle className="w-8 h-8" aria-hidden />
      </div>
      <h2 className="text-xl md:text-2xl font-black text-[#1B2430]">
        Niečo sa pokazilo
      </h2>
      <p className="mt-2 text-sm md:text-base font-bold text-[#1B2430]/65 max-w-md mx-auto leading-relaxed">
        {message ?? "Skús to prosím znovu o chvíľu."}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#2EA3DC] text-white font-extrabold text-sm hover:bg-[#1E8AC1] shadow-[0_8px_24px_rgba(46,163,220,0.4)] transition-colors"
        >
          <RefreshCw className="w-4 h-4" aria-hidden />
          Skús znovu
        </button>
        <Link
          href="/kontakt"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#F8FAFC] text-[#1B2430] font-extrabold text-sm ring-1 ring-[#1B2430]/10 hover:bg-[#1B2430]/5 transition-colors"
        >
          Kontaktuj nás
        </Link>
      </div>
    </div>
  );
}
