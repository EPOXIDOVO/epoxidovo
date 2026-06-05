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
} from "lucide-react";
import { TurnstileWidget } from "@/components/turnstile/TurnstileWidget";
import { trackEvent } from "@/components/analytics/Analytics";
import {
  COLORS,
  TEXTURES,
  type TextureSlug,
} from "@/lib/visualizer-presets";

type Step = "upload" | "validating" | "pick" | "generating" | "result" | "error";

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

    // Read as base64 a rovno do pick step (žiadny validate medzistupeň —
    // Nano Banana 2 sám rozhoduje či vie vyrenderovať floor, pre-check Flash
    // bol príliš striktný a blokoval legit fotky).
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(",")[1];
      setImageBase64(base64);
      setMimeType(file.type === "image/jpg" ? "image/jpeg" : file.type);
      setPreviewUrl(dataUrl);
      trackEvent("visualizer_upload", { size: file.size, type: file.type });
      setStep("pick");
    };
    reader.onerror = () => setError("Nepodarilo sa načítať fotku. Skús inú.");
    reader.readAsDataURL(file);
  };

  // ───────────────────────────────────────────────────────────────────────
  // Generation
  // ───────────────────────────────────────────────────────────────────────

  const generate = async () => {
    if (!imageBase64 || !turnstileToken) return;
    setStep("generating");
    setProgress(0);
    setError(null);

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
    setStep("pick");
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <Header step={step} />

      {/* STEP: UPLOAD */}
      {step === "upload" && (
        <UploadStep
          onFile={handleFile}
          onClick={() => fileInputRef.current?.click()}
          error={error}
        />
      )}

      {/* STEP: PICK */}
      {step === "pick" && previewUrl && (
        <PickStep
          previewUrl={previewUrl}
          texture={texture}
          colorSlug={colorSlug}
          onTexture={setTexture}
          onColor={setColorSlug}
          turnstileToken={turnstileToken}
          onTurnstile={setTurnstileToken}
          onGenerate={generate}
          onBack={startOver}
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

function Header({ step }: { step: Step }) {
  const stepNum =
    step === "upload"
      ? 1
      : step === "validating" || step === "pick"
        ? 2
        : step === "generating" || step === "result"
          ? 3
          : 0;
  return (
    <header className="text-center mb-8">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#3db6e8]/10 text-[#3db6e8] text-xs font-bold uppercase tracking-wider mb-3">
        <Sparkles className="w-3.5 h-3.5" aria-hidden />
        AI Vizualizácia
      </div>
      <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[var(--color-fg)]">
        Pozri svoju budúcu podlahu
      </h1>
      <p className="mt-3 text-base md:text-lg font-bold text-[var(--color-fg-muted)] max-w-2xl mx-auto leading-relaxed">
        Nahraj fotku miestnosti, vyber typ podlahy a farbu.
        <br />
        AI ti za pár sekúnd ukáže ako bude vyzerať tvoja podlaha.
      </p>
      {stepNum > 0 && (
        <div className="mt-6 flex justify-center gap-2">
          {[1, 2, 3].map((n) => (
            <span
              key={n}
              className={`h-1.5 rounded-full transition-all ${
                n <= stepNum
                  ? "w-12 bg-[#3db6e8]"
                  : "w-6 bg-[var(--color-border-strong)]"
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
      className={`cursor-pointer rounded-3xl border-2 border-dashed p-10 md:p-16 text-center transition-all ${
        dragging
          ? "border-[#3db6e8] bg-[#3db6e8]/5 scale-[1.01]"
          : "border-[var(--color-border-strong)] bg-white hover:border-[#3db6e8] hover:bg-[#3db6e8]/5"
      }`}
    >
      <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-[#3db6e8]/10 text-[#3db6e8] mb-5">
        <Upload className="w-7 h-7 md:w-9 md:h-9" aria-hidden />
      </div>
      <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-[var(--color-fg)]">
        Klikni alebo presuň fotku miestnosti
      </h2>
      <p className="mt-2 text-sm md:text-base font-bold text-[var(--color-fg-muted)]">
        JPG, PNG alebo WebP · max 5 MB
      </p>

      <div className="mt-7 max-w-md mx-auto text-left bg-[var(--color-bg-muted)] rounded-xl p-4 md:p-5">
        <div className="text-xs font-bold text-[var(--color-fg)] uppercase tracking-wider mb-2">
          💡 Tipy pre najlepší výsledok
        </div>
        <ul className="space-y-1.5 text-xs md:text-sm font-bold text-[var(--color-fg-muted)] leading-relaxed">
          <li>• Foť priamo cez podlahu, nie šikmo zhora</li>
          <li>• Dobré osvetlenie (denné svetlo je ideál)</li>
          <li>• Aspoň 50 % obrázku má byť podlaha</li>
          <li>• Fotka môže obsahovať nábytok, predmety, ľudí — ostanú</li>
        </ul>
      </div>
    </div>
    </>
  );
}

function ValidatingStep({ previewUrl }: { previewUrl: string | null }) {
  return (
    <div className="rounded-3xl bg-white p-6 md:p-10 text-center shadow-[var(--shadow-card)] border border-[var(--color-border)]">
      {previewUrl && (
        <div className="relative w-full max-w-md mx-auto aspect-square rounded-2xl overflow-hidden mb-5 bg-[var(--color-bg-muted)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Preview"
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/90 rounded-xl px-4 py-3 inline-flex items-center gap-2 shadow-md">
              <Loader2 className="w-5 h-5 animate-spin text-[#3db6e8]" aria-hidden />
              <span className="text-sm font-semibold text-[var(--color-fg)]">
                Kontrolujeme fotku…
              </span>
            </div>
          </div>
        </div>
      )}
      <p className="text-sm font-bold text-[var(--color-fg-muted)]">
        Overujeme či je na fotke viditeľná podlaha (3-5 sekúnd).
      </p>
    </div>
  );
}

function PickStep({
  previewUrl,
  texture,
  colorSlug,
  onTexture,
  onColor,
  turnstileToken,
  onTurnstile,
  onGenerate,
  onBack,
}: {
  previewUrl: string;
  texture: TextureSlug;
  colorSlug: string;
  onTexture: (t: TextureSlug) => void;
  onColor: (c: string) => void;
  turnstileToken: string | null;
  onTurnstile: (t: string | null) => void;
  onGenerate: () => void;
  onBack: () => void;
}) {
  const textureKeys = Object.keys(TEXTURES) as TextureSlug[];
  const colors = COLORS[texture];

  return (
    <div className="rounded-3xl bg-white p-5 md:p-8 shadow-[var(--shadow-card)] border border-[var(--color-border)]">
      <div className="grid md:grid-cols-2 gap-6 md:gap-8">
        {/* Preview vľavo */}
        <div>
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-[var(--color-bg-muted)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Tvoja fotka"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
          <button
            type="button"
            onClick={onBack}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden />
            Zmeniť fotku
          </button>
        </div>

        {/* Picker vpravo */}
        <div className="flex flex-col">
          <label className="block text-sm font-bold uppercase tracking-wider text-[var(--color-fg)] mb-3">
            Vyber typ podlahy a farbu
          </label>
          <div>
            <div className="grid grid-cols-2 gap-2">
              {textureKeys.map((t) => {
                const def = TEXTURES[t];
                const active = t === texture;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => onTexture(t)}
                    className={`text-left p-3 rounded-xl border-2 transition-all ${
                      active
                        ? "border-[#3db6e8] bg-[#3db6e8]/5"
                        : "border-[var(--color-border)] hover:border-[var(--color-border-strong)]"
                    }`}
                  >
                    <div className="text-sm font-bold text-[var(--color-fg)]">
                      {def.label}
                    </div>
                    <div className="text-[11px] font-bold text-[var(--color-fg-muted)] mt-0.5 leading-tight">
                      {def.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5">
            <div className="grid grid-cols-4 gap-2">
              {colors.map((c) => {
                const active = c.slug === colorSlug;
                return (
                  <button
                    key={c.slug}
                    type="button"
                    onClick={() => onColor(c.slug)}
                    title={c.commercialName}
                    className={`group relative aspect-square rounded-lg border-2 transition-all ${
                      active
                        ? "border-[#3db6e8] scale-105 shadow-md"
                        : "border-[var(--color-border)] hover:border-[var(--color-border-strong)]"
                    }`}
                    style={{ backgroundColor: c.hex }}
                  >
                    {active && (
                      <CheckCircle2
                        className="absolute top-1 right-1 w-4 h-4 text-white drop-shadow-md"
                        aria-hidden
                      />
                    )}
                  </button>
                );
              })}
            </div>
            <div className="mt-2 text-sm font-bold text-[var(--color-fg)]">
              {colors.find((c) => c.slug === colorSlug)?.commercialName}
            </div>
          </div>

          <div className="mt-5 flex justify-center">
            <TurnstileWidget
              onVerify={onTurnstile}
              onExpire={() => onTurnstile(null)}
            />
          </div>

          <button
            type="button"
            disabled={!turnstileToken}
            onClick={onGenerate}
            className="mt-4 w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#3db6e8] text-white font-bold text-sm md:text-base hover:bg-[#1a8cc4] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_10px_30px_rgba(61,182,232,0.45)] transition-all"
          >
            <Sparkles className="w-5 h-5" aria-hidden />
            Vygenerovať vizualizáciu
          </button>
          <p className="mt-2 text-[11px] font-bold text-center text-[var(--color-fg-subtle)]">
            Trvá 20–40 sekúnd · denný limit 3 generácie
          </p>
        </div>
      </div>
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
    <div className="rounded-3xl bg-white p-8 md:p-12 text-center shadow-[var(--shadow-card)] border border-[var(--color-border)]">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#3db6e8]/10 mb-5">
        <Loader2 className="w-10 h-10 animate-spin text-[#3db6e8]" aria-hidden />
      </div>
      <h2 className="text-xl md:text-2xl font-extrabold text-[var(--color-fg)]">
        Generujeme tvoju podlahu
      </h2>

      <div className="mt-6 w-full max-w-md mx-auto bg-[var(--color-bg-muted)] rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-[#3db6e8] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-3 text-sm font-bold text-[var(--color-fg)]">
        {currentStage.label}
      </div>
      <p className="mt-1 text-xs font-bold text-[var(--color-fg-muted)]">
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
  return (
    <div className="rounded-3xl bg-white p-5 md:p-8 shadow-[var(--shadow-card)] border border-[var(--color-border)]">
      {/* Before/After slider */}
      <div
        className="relative w-full aspect-video md:aspect-[4/3] rounded-2xl overflow-hidden bg-[var(--color-bg-muted)] select-none"
        style={{ touchAction: "none" }}
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
            <ArrowLeft className="w-3 h-3 text-[var(--color-fg)]" aria-hidden />
            <ArrowRight className="w-3 h-3 text-[var(--color-fg)]" aria-hidden />
          </div>
        </div>
        {/* Labels */}
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/60 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
          Pred
        </div>
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-[#3db6e8] text-white text-xs font-bold uppercase tracking-wider">
          Po
        </div>
        {/* Slider input — full width invisible */}
        <input
          type="range"
          min={0}
          max={100}
          value={sliderPos}
          onChange={(e) => onSlider(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
          aria-label="Porovnanie pred a po"
        />
      </div>

      <div className="mt-4 text-center">
        <div className="text-sm font-bold text-[var(--color-fg)]">
          {textureLabel} · {colorName}
        </div>
        <div className="text-xs font-bold text-[var(--color-fg-muted)] mt-0.5">
          ← Posuvníkom porovnaj pred a po →
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={onDownload}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[var(--color-bg-muted)] text-[var(--color-fg)] font-semibold text-sm hover:bg-[var(--color-border)] transition-colors"
        >
          <Download className="w-4 h-4" aria-hidden />
          Stiahnuť
        </button>
        <button
          type="button"
          onClick={onTryAgain}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[var(--color-bg-muted)] text-[var(--color-fg)] font-semibold text-sm hover:bg-[var(--color-border)] transition-colors"
        >
          <RefreshCw className="w-4 h-4" aria-hidden />
          Skús inú farbu
        </button>
        <button
          type="button"
          onClick={onStartOver}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[var(--color-bg-muted)] text-[var(--color-fg)] font-semibold text-sm hover:bg-[var(--color-border)] transition-colors"
        >
          <Upload className="w-4 h-4" aria-hidden />
          Iná fotka
        </button>
      </div>

      {/* CTA na cenovku — najdôležitejšia časť, konverzný hook */}
      <div className="mt-8 rounded-2xl bg-gradient-to-br from-[#f97316] to-[#ea580c] p-6 md:p-8 text-center text-white shadow-[0_10px_40px_rgba(249,115,22,0.3)]">
        <h3 className="text-xl md:text-2xl font-extrabold tracking-tight">
          Páči sa ti? Pošlite mi cenovku.
        </h3>
        <p className="mt-2 text-sm md:text-base font-bold text-white/90 leading-relaxed max-w-md mx-auto">
          Pripravíme presnú kalkuláciu na túto podlahu pre tvoju miestnosť do
          24 hodín.
        </p>
        <button
          type="button"
          onClick={onRequestQuote}
          className="mt-5 inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white text-[#ea580c] font-bold text-sm md:text-base hover:bg-white/90 shadow-[0_8px_24px_rgba(0,0,0,0.2)] transition-all"
        >
          <Send className="w-4 h-4" aria-hidden />
          Chcem cenovú ponuku
        </button>
      </div>
    </div>
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
      <h2 className="text-xl md:text-2xl font-extrabold text-[var(--color-fg)]">
        Niečo sa pokazilo
      </h2>
      <p className="mt-2 text-sm md:text-base font-bold text-[var(--color-fg-muted)] max-w-md mx-auto leading-relaxed">
        {message ?? "Skús to prosím znovu o chvíľu."}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#3db6e8] text-white font-semibold text-sm hover:bg-[#1a8cc4] transition-colors"
        >
          <RefreshCw className="w-4 h-4" aria-hidden />
          Skús znovu
        </button>
        <Link
          href="/kontakt"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[var(--color-bg-muted)] text-[var(--color-fg)] font-semibold text-sm hover:bg-[var(--color-border)] transition-colors"
        >
          Kontaktuj nás
        </Link>
      </div>
    </div>
  );
}
