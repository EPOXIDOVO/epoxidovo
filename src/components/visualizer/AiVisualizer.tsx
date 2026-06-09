"use client";

import * as React from "react";
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
  FINISHES,
  TEXTURES,
  getRalCatalog,
  getRalColors,
  ralSlug,
  type Finish,
  type RalColor,
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

  // Picker state — START AS null aby pri otvorení pickera žiadna textúra/farba/
  // lak neboli zvýraznené modrou (vyznačí sa až keď user reálne klikne).
  const [texture, setTexture] = React.useState<TextureSlug | null>(null);
  const [colorSlug, setColorSlug] = React.useState<string | null>(null);
  const [finish, setFinish] = React.useState<Finish | null>(null);
  const [turnstileToken, setTurnstileToken] = React.useState<string | null>(null);

  // Result state
  const [resultBase64, setResultBase64] = React.useState<string | null>(null);
  const [resultMime, setResultMime] = React.useState<string>("image/png");
  // Slider default = 65 → AFTER dominantne viditeľná hneď ako sa zobrazí výsledok.
  // 50 by mohol pri subtílnejších AI generáciách pôsobiť ako "nič sa nezmenilo".
  const [sliderPos, setSliderPos] = React.useState(65);

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
    if (!imageBase64 || !turnstileToken || !texture || !colorSlug || !finish) return;
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
          finish,
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
    // Reset voľby aby picker zobrazil čistý stav (žiadny default highlight) —
    // user prichádza zo "result" a chce skúsiť úplne inú kombináciu.
    setTexture(null);
    setColorSlug(null);
    setFinish(null);
    setTurnstileToken(null);
    setStep("pick-texture");
    scrollToTop();
  };

  const startOver = () => {
    setImageBase64(null);
    setPreviewUrl(null);
    setResultBase64(null);
    setError(null);
    setProgress(0);
    // KRITICKÉ: resetni AJ texture/colorSlug/finish, inak po uploade novej fotky
    // user uvidí predošlú voľbu defaultne zvýraznenú modrou (čo je presne to,
    // čo user nechce — žiadny default highlight pri vstupe do pickera).
    setTexture(null);
    setColorSlug(null);
    setFinish(null);
    setTurnstileToken(null);
    setStep("upload");
  };

  const download = () => {
    if (!resultBase64 || !texture || !colorSlug || !finish) return;
    const ext = resultMime?.includes("png") ? "png" : "jpg";
    const filename = `epoxidovo-vizualizacia-${texture}-${colorSlug}-${finish}.${ext}`;
    trackEvent("visualizer_download", { texture, color: colorSlug, finish });

    // KRITICKÉ: všetko musí byť SYNCHRONNE pred navigator.share, inak iOS
    // stratí "user activation" a share sheet sa nezobrazí. Žiadny await.
    let blob: Blob;
    let file: File;
    try {
      const byteString = atob(resultBase64);
      const bytes = new Uint8Array(byteString.length);
      for (let i = 0; i < byteString.length; i++) bytes[i] = byteString.charCodeAt(i);
      blob = new Blob([bytes], { type: resultMime });
      file = new File([blob], filename, { type: resultMime });
    } catch {
      return;
    }

    // Web Share API — synchronný call (.catch handluje cancel asynchronne).
    // Na iOS Safari 15+ a Android Chrome: share sheet → "Save Image" → Photos.
    const nav = typeof navigator !== "undefined" ? navigator : null;
    if (
      nav &&
      typeof nav.share === "function" &&
      typeof nav.canShare === "function"
    ) {
      try {
        if (nav.canShare({ files: [file] })) {
          // Volaj share() priamo, bez await — preserves user activation
          nav.share({
            files: [file],
            title: "Moja AI vizualizácia podlahy — EPOXIDOVO",
          }).catch(() => {
            /* user cancelled — silently */
          });
          return;
        }
      } catch {
        /* canShare hodil error → fallback */
      }
    }

    // Fallback: klasický blob URL download (Desktop)
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  const requestQuote = () => {
    if (!resultBase64 || !texture || !colorSlug || !finish) return;
    trackEvent("visualizer_request_quote", { texture, color: colorSlug, finish });
    window.location.href = `/cenova-ponuka?source=ai_vizualizer&texture=${texture}&color=${colorSlug}&finish=${finish}`;
  };

  // Pri zmene textúry zresetujeme farbu na null — user musí vedome kliknúť
  // farbu (žiadny default highlight v color pickeri). Lak zachováme — finish
  // je nezávislý od textúry/farby (preference užívateľa naprieč variantmi).
  React.useEffect(() => {
    setColorSlug(null);
  }, [texture]);

  // ───────────────────────────────────────────────────────────────────────
  // Render — krokový UI
  // ───────────────────────────────────────────────────────────────────────

    // Mobile: prirodzená výška; Desktop: vyplní viewport (page wrapper limituje výšku).
  return (
    <div className="max-w-screen-2xl mx-auto px-4 py-3 md:py-4 md:h-full md:flex md:flex-col">
      <Breadcrumb />
      <Header step={step} />

      {/* STEP: UPLOAD — mobile: vertical stack (upload + mini demo) | desktop: side-by-side.
          Pomer 1fr:1fr na lg+ aby demo fotky podláh (vpravo) mali toľko priestoru
          ako upload box — predtým bol 3fr:2fr → demo bolo stlačené a fotky drobné
          na 16" laptopoch. */}
      {step === "upload" && (
        <div className="flex flex-col gap-3 md:grid md:grid-cols-[3fr_2fr] lg:grid-cols-[2fr_3fr] md:gap-6 md:items-stretch flex-1 min-h-0 mt-2 md:mt-4">
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

      {/* STEP: PICK COLOR — texture musí byť picknutá (parent posúva na tento
          step len cez onTexture callback, takže texture je guaranteed non-null) */}
      {step === "pick-color" && previewUrl && texture && (
        <PickColorStep
          previewUrl={previewUrl}
          texture={texture}
          colorSlug={colorSlug}
          onColor={setColorSlug}
          finish={finish}
          onFinish={setFinish}
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

      {/* STEP: RESULT — texture/colorSlug/finish guaranteed non-null
          (generate() early-returns ak su null, takže sa sem nedostaneme) */}
      {step === "result" && resultBase64 && previewUrl && texture && colorSlug && finish && (
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
          finishLabel={FINISHES[finish].label}
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
    : "Pozri si ako môže vyzerať tvoja podlaha";
  const subtitleNode = isResult ? (
    <>
      Pre istotu si pozri aj <strong>ukážky realizácií</strong>.
    </>
  ) : (
    <>
      Nahraj fotku, vyber typ podlahy a farbu.
      <br className="hidden md:inline" />
      <span className="md:hidden"> </span>
      AI ti za pár sekúnd ukáže ako môže vyzerať.
    </>
  );

  return (
    <header className="text-center mb-2 md:mb-2 md:shrink-0">
      {/* AI gradient pill — značí "AI features" v celom UI */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 md:px-3 md:py-1 rounded-full bg-gradient-to-r from-[#7EC8F0] via-[#6AA8F0] to-[#8B5CF6] text-white text-[10px] md:text-[11px] font-extrabold uppercase tracking-wider mb-2 md:mb-1.5 shadow-[0_4px_14px_rgba(139,92,246,0.35)]">
        <Sparkles className="w-3 h-3 md:w-3 md:h-3" aria-hidden />
        AI Vizualizácia
      </div>
      {/* H1 — výrazne menší na desktope aby fotky podláh dostali viac vertikálneho
          priestoru (user feedback: musia byť fotky vyššie, na jednej stránke). */}
      <h1
        className={`font-black tracking-tight text-[#1B2430] ${
          isResult ? "text-xl md:text-2xl" : "text-xl md:text-2xl lg:text-3xl"
        }`}
      >
        {title}
      </h1>
      {/* Subtitle len na mobile (na desktope zbytočne zaberá vertikálny priestor —
          stačí H1 a step indicator). */}
      {!isResult && (
        <p className="md:hidden mt-1.5 text-xs font-bold text-[#1B2430]/65 leading-snug">
          {subtitleNode}
        </p>
      )}
      {/* Step indicator — kompaktnejší na desktope */}
      {stepNum > 0 && !isResult && (
        <div className="mt-2 md:mt-2 flex justify-center gap-1.5">
          {[1, 2, 3].map((n) => (
            <span
              key={n}
              className={`h-1 md:h-1 rounded-full transition-all ${
                n <= stepNum
                  ? "w-8 md:w-10 bg-gradient-to-r from-[#7EC8F0] via-[#6AA8F0] to-[#8B5CF6]"
                  : "w-4 md:w-5 bg-[#1B2430]/15"
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
      className={`cursor-pointer rounded-2xl md:rounded-3xl border-2 border-dashed p-6 md:p-4 lg:p-5 text-center transition-all bg-white flex-1 min-h-0 md:h-full flex flex-col items-center justify-center ${
        dragging
          ? "border-[#2EA3DC] bg-[#2EA3DC]/5 scale-[1.01] shadow-[0_8px_28px_rgba(46,163,220,0.2)]"
          : "border-[#1B2430]/20 hover:border-[#2EA3DC] hover:bg-[#2EA3DC]/5 hover:shadow-[0_8px_28px_rgba(46,163,220,0.15)]"
      }`}
    >
      <div className="inline-flex items-center justify-center w-16 h-16 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-2xl bg-[#2EA3DC] text-white mb-3 md:mb-2 shadow-[0_8px_20px_rgba(46,163,220,0.4)]">
        <Upload className="w-8 h-8 md:w-6 md:h-6 lg:w-7 lg:h-7" aria-hidden />
      </div>
      <h2 className="text-lg md:text-base lg:text-lg font-extrabold tracking-tight text-[#1B2430]">
        <span className="md:hidden">Klikni a nahraj fotku</span>
        <span className="hidden md:inline">Klikni alebo presuň fotku miestnosti</span>
      </h2>
      <p className="mt-1.5 md:mt-1 text-xs md:text-[11px] lg:text-xs font-bold text-[#1B2430]/65">
        JPG, PNG alebo WebP · max 5 MB
      </p>

      {/* Tipy IBA na desktope — kompaktný card aby upload box nezaberal celú
          výšku a demo fotky vpravo mali viac priestoru. */}
      <div className="hidden md:block mt-3 md:mt-3 max-w-md mx-auto text-left bg-[#F8FAFC] rounded-xl p-3 md:p-2.5 ring-1 ring-[#1B2430]/5">
        <div className="text-[10px] md:text-[10px] font-extrabold text-[#1B2430] uppercase tracking-wider mb-1">
          💡 Tipy pre najlepší výsledok
        </div>
        <ul className="space-y-0.5 text-[11px] md:text-[11px] font-bold text-[#1B2430]/70 leading-snug">
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
  texture: TextureSlug | null;
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
      {/* Mobile: 2-col (vertikálny scroll OK). Desktop lg+: 4-col aby všetky
          4 textúry boli VIDITEĽNÉ NARAZ na 16" laptope — predtým 2-col
          zaberal toľko šírky že fotky boli obrie a videl si len 2 z 4. */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-3">
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
                className="aspect-[4/3] lg:aspect-[3/2] w-full relative bg-[#F8FAFC]"
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
      <p className="mt-3 text-xs md:text-sm font-black text-center text-[#1B2430]">
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
  finish,
  onFinish,
  turnstileToken,
  onTurnstile,
  onGenerate,
  onBack,
}: {
  previewUrl: string;
  texture: TextureSlug;
  colorSlug: string | null;
  onColor: (c: string | null) => void;
  finish: Finish | null;
  onFinish: (f: Finish) => void;
  turnstileToken: string | null;
  onTurnstile: (t: string | null) => void;
  onGenerate: () => void;
  onBack: () => void;
}) {
  const colors = COLORS[texture];
  const textureDef = TEXTURES[texture];
  const finishKeys = Object.keys(FINISHES) as Finish[];

  // TOP 4 farby (featured) sa zobrazia hneď v 1 rade. Zvyšok + RAL paleta
  // sú v MODAL POPUPE (žiadny inline-expand aby sa nepushli content dole
  // — stránka je striktne 100dvh bez scrollu).
  const featuredColors = colors.filter((c) => c.featured);
  const restColors = colors.filter((c) => !c.featured);
  const ralColors = getRalColors(texture);
  const [showAllModal, setShowAllModal] = React.useState(false);
  const activeColor =
    colors.find((c) => c.slug === colorSlug) ??
    ralColors.find((c) => c.slug === colorSlug);

  // ESC zatvára modal
  React.useEffect(() => {
    if (!showAllModal) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setShowAllModal(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showAllModal]);

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

      {/* ═══════════════════════════════════════════════════════════════
          PER-TEXTÚROVÝ COLOR PICKER:
          - mramor → 2-step (báza + žilkovanie)
          - metalicka → multi-select 1-3 farby (zmes)
          - hladka/chips → single color
          Renderujem inline aby zostal jeden komponent (a finish/turnstile/
          generate ostali spoločné nižšie). */}

      {texture === "mramor" ? (
        <MramorPicker colorSlug={colorSlug} onColor={onColor} />
      ) : texture === "metalicka" ? (
        <MetalickaPicker colorSlug={colorSlug} onColor={onColor} />
      ) : (
        <>
      <label className="block text-sm md:text-base font-extrabold text-[#1B2430] mb-2">
        2. Vyber farbu
      </label>
      {/* Featured row — top 4 farby. Fixná výška: na mobile/tablet kompaktne,
          na desktope (lg+) výrazne vyššie — máme tam dosť miesta. */}
      <div className="grid grid-cols-4 gap-2 md:gap-3">
        {featuredColors.map((c) => {
          const active = c.slug === colorSlug;
          return (
            <button
              key={c.slug}
              type="button"
              onClick={() => onColor(c.slug)}
              title={c.commercialName}
              className={`group relative h-16 md:h-20 lg:h-28 rounded-xl md:rounded-2xl border-2 transition-all ${
                active
                  ? "border-[#2EA3DC] scale-105 shadow-[0_6px_20px_rgba(46,163,220,0.4)]"
                  : "border-[#1B2430]/10 hover:border-[#2EA3DC]/50"
              }`}
              style={{ backgroundColor: c.hex }}
            >
              {active && (
                <CheckCircle2
                  className="absolute top-1.5 right-1.5 w-5 h-5 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
                  aria-hidden
                />
              )}
            </button>
          );
        })}
      </div>

      {/* "Ďalšie farby" — otvára MODAL popup (nie inline expand), aby sa
          obsah pod ním (finish picker + generate) nepushol mimo viewport.
          Stránka je striktne 100dvh bez scrollu. */}
      {(restColors.length > 0 || ralColors.length > 0) && (
        <button
          type="button"
          onClick={() => setShowAllModal(true)}
          className="mt-2 w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold text-[#2EA3DC] bg-[#2EA3DC]/5 ring-1 ring-[#2EA3DC]/30 hover:bg-[#2EA3DC]/10 hover:ring-[#2EA3DC] transition-colors"
        >
          + Ďalšie farby ({restColors.length + ralColors.length})
        </button>
      )}

      {activeColor && (
        <div className="mt-1.5 text-xs md:text-sm font-extrabold text-[#1B2430]">
          {activeColor.commercialName}
        </div>
      )}

      {/* MODAL — full palette (Featured + ostatné + RAL Classic). */}
      {showAllModal && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setShowAllModal(false)}
          className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl md:rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl"
          >
            {/* Header s close button */}
            <div className="sticky top-0 bg-white px-5 md:px-6 py-4 border-b border-[#1B2430]/10 flex items-center justify-between rounded-t-2xl md:rounded-t-3xl">
              <div>
                <h3 className="text-lg md:text-xl font-black text-[#1B2430]">
                  Vyber farbu z palety
                </h3>
                <p className="text-xs md:text-sm font-bold text-[#1B2430]/60 mt-0.5">
                  {textureDef.label} · klik na vzorku
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAllModal(false)}
                aria-label="Zavrieť"
                className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#F8FAFC] hover:bg-[#1B2430] hover:text-white text-[#1B2430] transition-colors"
              >
                <X className="w-5 h-5" aria-hidden />
              </button>
            </div>

            {/* Vlastné + featured farby (top sekcia).
                Labels sú teraz BLOCK pod swatchom (nie absolute) → žiadne
                prekrývanie s ďalším radom. font-black + dark color = čitateľné. */}
            <div className="px-5 md:px-6 py-4">
              <div className="text-xs md:text-sm font-black text-[#1B2430] uppercase tracking-wider mb-3">
                Naša paleta ({colors.length})
              </div>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-2 gap-y-3">
                {colors.map((c) => {
                  const active = c.slug === colorSlug;
                  return (
                    <button
                      key={c.slug}
                      type="button"
                      onClick={() => {
                        onColor(c.slug);
                        setShowAllModal(false);
                      }}
                      title={c.commercialName}
                      className="group flex flex-col gap-1.5 text-left"
                    >
                      <div
                        className={`relative h-16 rounded-xl border-2 transition-all ${
                          active
                            ? "border-[#2EA3DC] shadow-[0_6px_20px_rgba(46,163,220,0.4)]"
                            : "border-[#1B2430]/10 group-hover:border-[#2EA3DC]/50 group-hover:scale-105"
                        }`}
                        style={{ backgroundColor: c.hex }}
                      >
                        {active && (
                          <CheckCircle2
                            className="absolute top-1 right-1 w-4 h-4 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
                            aria-hidden
                          />
                        )}
                      </div>
                      <span className="text-[11px] md:text-xs font-black text-[#1B2430] text-center leading-tight">
                        {c.commercialName}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* RAL Classic sekcia (len pre Hladká) */}
            {ralColors.length > 0 && (
              <div className="px-5 md:px-6 pt-4 pb-6 border-t border-[#1B2430]/10">
                <div className="mb-3">
                  <div className="text-xs md:text-sm font-black text-[#1B2430] uppercase tracking-wider">
                    RAL Classic ({ralColors.length})
                  </div>
                  <div className="text-[11px] md:text-xs font-bold text-[#1B2430]/70 mt-0.5">
                    štandardná priemyselná paleta
                  </div>
                </div>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-2 gap-y-3">
                  {ralColors.map((c) => {
                    const active = c.slug === colorSlug;
                    const [ralCode, ralName] = c.commercialName.split(" · ");
                    return (
                      <button
                        key={c.slug}
                        type="button"
                        onClick={() => {
                          onColor(c.slug);
                          setShowAllModal(false);
                        }}
                        title={c.commercialName}
                        className="group flex flex-col gap-1.5 text-left"
                      >
                        <div
                          className={`relative h-16 rounded-xl border-2 transition-all ${
                            active
                              ? "border-[#2EA3DC] shadow-[0_6px_20px_rgba(46,163,220,0.4)]"
                              : "border-[#1B2430]/10 group-hover:border-[#2EA3DC]/50 group-hover:scale-105"
                          }`}
                          style={{ backgroundColor: c.hex }}
                        >
                          {active && (
                            <CheckCircle2
                              className="absolute top-1 right-1 w-4 h-4 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
                              aria-hidden
                            />
                          )}
                        </div>
                        <div className="text-center leading-tight">
                          <div className="text-[11px] md:text-xs font-black text-[#1B2430]">
                            {ralCode}
                          </div>
                          <div className="text-[10px] md:text-[11px] font-bold text-[#1B2430]/70 truncate">
                            {ralName}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
        </>
      )}
      {/* ═══════════════ KONIEC PER-TEXTURE COLOR PICKER ═══════════════ */}

      {/* Krok 3: Povrchový lak — len finálny topcoat. Žiadny default,
          aktivuje sa modrá až po kliknutí. */}
      <label className="block text-base md:text-lg font-extrabold text-[#1B2430] mt-5 mb-3">
        3. Vyber povrchový lak
      </label>
      <div className="grid grid-cols-2 gap-2.5">
        {finishKeys.map((f) => {
          const def = FINISHES[f];
          const active = f === finish;
          return (
            <button
              key={f}
              type="button"
              onClick={() => onFinish(f)}
              className={`relative rounded-xl border-2 p-3 text-left transition-all ${
                active
                  ? "border-[#2EA3DC] bg-[#2EA3DC]/5 shadow-[0_6px_20px_rgba(46,163,220,0.25)]"
                  : "border-[#1B2430]/10 bg-white hover:border-[#2EA3DC]/50"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full border-2 ${
                    active
                      ? "border-[#2EA3DC] bg-[#2EA3DC]"
                      : "border-[#1B2430]/30 bg-white"
                  }`}
                >
                  {active && (
                    <span className="block w-2 h-2 rounded-full bg-white" />
                  )}
                </span>
                <span className="text-sm md:text-base font-extrabold text-[#1B2430]">
                  {def.label}
                </span>
              </div>
              <p className="mt-1 ml-7 text-[11px] md:text-xs font-bold text-[#1B2430]/60 leading-tight">
                {def.description}
              </p>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex justify-center">
        <TurnstileWidget
          onVerify={onTurnstile}
          onExpire={() => onTurnstile(null)}
        />
      </div>

      {/* Primárna akcia — oranžová pill ako "Cenová ponuka" na homepage.
          Disabled kým user nezvolí farbu, lak alebo Turnstile neprejde.
          Pre mramor (compound "base:vein"): obe časti musia byť vyplnené. */}
      <button
        type="button"
        disabled={
          !turnstileToken ||
          !colorSlug ||
          !finish ||
          // Mramor compound: ak chýba báza alebo žilkovanie
          (texture === "mramor" &&
            (!colorSlug.includes(":") ||
              colorSlug.split(":").some((p) => p === "")))
        }
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

/* ═══════════════════════════════════════════════════════════════════════
 * MramorPicker — 2-krokový výber: bázová farba + farba žiliek.
 * Compound slug format: "<baseSlug>:<veinSlug>" (napr. "ral-9010:ral-7016")
 * Posiela onColor LEN keď sú obe vybraté, inak null (generate disabled).
 * ─────────────────────────────────────────────────────────────────────── */
function MramorPicker({
  colorSlug,
  onColor,
}: {
  colorSlug: string | null;
  onColor: (c: string | null) => void;
}) {
  const ral = getRalCatalog();
  // Parse compound slug
  const [baseSlug, veinSlug] = (colorSlug ?? "").includes(":")
    ? (colorSlug as string).split(":")
    : [null, null];

  const setBase = (slug: string) =>
    onColor(veinSlug ? `${slug}:${veinSlug}` : `${slug}:`);
  const setVein = (slug: string) =>
    onColor(baseSlug ? `${baseSlug}:${slug}` : `:${slug}`);

  const baseRal = ral.find((r) => ralSlug(r) === baseSlug);
  const veinRal = ral.find((r) => ralSlug(r) === veinSlug);

  return (
    <div className="space-y-3">
      <label className="block text-sm md:text-base font-extrabold text-[#1B2430]">
        2. Vyber farby mramoru
      </label>

      {/* Bázová farba */}
      <div>
        <div className="text-[11px] md:text-xs font-black text-[#1B2430] uppercase tracking-wider mb-1.5">
          Bázová farba {baseRal && <span className="text-[#2EA3DC] normal-case tracking-normal">· {baseRal.name}</span>}
        </div>
        <RalSwatchRow
          ral={ral}
          activeSlug={baseSlug}
          onPick={setBase}
        />
      </div>

      {/* Farba žiliek */}
      <div>
        <div className="text-[11px] md:text-xs font-black text-[#1B2430] uppercase tracking-wider mb-1.5">
          Farba žiliek {veinRal && <span className="text-[#2EA3DC] normal-case tracking-normal">· {veinRal.name}</span>}
        </div>
        <RalSwatchRow
          ral={ral}
          activeSlug={veinSlug}
          onPick={setVein}
        />
      </div>

      {/* Pomôcka */}
      <p className="text-[11px] md:text-xs font-bold text-[#1B2430]/70 leading-snug">
        Mramor tipicky vznikne kombináciou 2 farieb — báza je dominantná, žilky tvoria
        prirodzený vzor cez podlahu (klasicky tmavšie žilky na svetlej báze).
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * MetalickaPicker — multi-select 1-3 RAL farby ktoré sa zmiešajú.
 * Compound slug: "<slug1>+<slug2>+<slug3>"
 * 1 farba = pekný uniformný metalický look, viac = swirled mix.
 * ─────────────────────────────────────────────────────────────────────── */
function MetalickaPicker({
  colorSlug,
  onColor,
}: {
  colorSlug: string | null;
  onColor: (c: string | null) => void;
}) {
  const ral = getRalCatalog();
  const selected = colorSlug ? colorSlug.split("+").filter(Boolean) : [];
  const MAX = 3;

  const toggle = (slug: string) => {
    if (selected.includes(slug)) {
      const next = selected.filter((s) => s !== slug);
      onColor(next.length > 0 ? next.join("+") : null);
    } else {
      if (selected.length >= MAX) return; // limit
      const next = [...selected, slug];
      onColor(next.join("+"));
    }
  };

  const selectedRals = selected
    .map((s) => ral.find((r) => ralSlug(r) === s))
    .filter(Boolean) as RalColor[];

  return (
    <div className="space-y-3">
      <label className="block text-sm md:text-base font-extrabold text-[#1B2430]">
        2. Vyber 1–3 farby (zmiešajú sa)
      </label>

      {/* Vybrané farby — chips s × na odstránenie */}
      {selectedRals.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedRals.map((r) => (
            <button
              key={r.ral}
              type="button"
              onClick={() => toggle(ralSlug(r))}
              className="group inline-flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full bg-[#2EA3DC]/10 ring-1 ring-[#2EA3DC]/40 text-xs font-extrabold text-[#1B2430] hover:bg-[#2EA3DC]/20"
            >
              <span
                className="inline-block w-4 h-4 rounded-full ring-1 ring-black/20"
                style={{ backgroundColor: r.hex }}
              />
              <span>{r.name}</span>
              <X className="w-3 h-3 text-[#1B2430]/60 group-hover:text-[#1B2430]" aria-hidden />
            </button>
          ))}
        </div>
      )}

      {/* RAL palette — toggle (click = add/remove) */}
      <RalSwatchRow
        ral={ral}
        activeSlug={null}
        selectedSet={new Set(selected)}
        onPick={toggle}
        disabled={(slug) => selected.length >= MAX && !selected.includes(slug)}
      />

      <p className="text-[11px] md:text-xs font-bold text-[#1B2430]/70 leading-snug">
        {selected.length === 0
          ? "Vyber aspoň 1 farbu. 1 farba = pekný uniformný metalik, viac farieb = zmiešané swirly."
          : selected.length === 1
            ? "1 farba — jednoduchý metalický finish. Pre dramatickejší efekt pridaj ďalšiu."
            : `${selected.length} farby — AI ich zmieša do pearlescent swirlov.`}
      </p>
    </div>
  );
}

/* RalSwatchRow — kompaktný horizontálny grid 20 RAL swatches.
 * Použitý oboma marble + metallic picker-mi. */
function RalSwatchRow({
  ral,
  activeSlug,
  selectedSet,
  onPick,
  disabled,
}: {
  ral: RalColor[];
  activeSlug: string | null;
  selectedSet?: Set<string>;
  onPick: (slug: string) => void;
  disabled?: (slug: string) => boolean;
}) {
  return (
    <div className="grid grid-cols-10 md:grid-cols-10 gap-1.5">
      {ral.map((r) => {
        const slug = ralSlug(r);
        const isActive = slug === activeSlug;
        const isSelected = selectedSet?.has(slug);
        const isDisabled = disabled?.(slug) ?? false;
        return (
          <button
            key={r.ral}
            type="button"
            onClick={() => onPick(slug)}
            disabled={isDisabled}
            title={`${r.ral} · ${r.name}`}
            className={`relative h-10 md:h-12 lg:h-14 rounded-md border-2 transition-all ${
              isActive || isSelected
                ? "border-[#2EA3DC] scale-105 shadow-[0_4px_12px_rgba(46,163,220,0.4)]"
                : isDisabled
                  ? "border-[#1B2430]/10 opacity-30 cursor-not-allowed"
                  : "border-[#1B2430]/10 hover:border-[#2EA3DC]/50 hover:scale-105"
            }`}
            style={{ backgroundColor: r.hex }}
          >
            {(isActive || isSelected) && (
              <CheckCircle2
                className="absolute top-0.5 right-0.5 w-3.5 h-3.5 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
                aria-hidden
              />
            )}
          </button>
        );
      })}
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
  finishLabel,
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
  finishLabel: string;
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

  // Auto-animácia pri prvom mount-e: slider sa hýbe 100 → 0 → 65 cez ~1.5s
  // aby user OKAMŽITE videl že sú tam DVE rôzne fotky (BEFORE aj AFTER) — nie
  // len jeden statický výsledok. Toto rieši časté user feedback "obe polky
  // vyzerajú rovnako" pri subtílnejších AI generáciách.
  // Animáciu spustíme len raz pri prvom renderi, potom necháme usera ovládať.
  const animatedOnMount = React.useRef(false);
  React.useEffect(() => {
    if (animatedOnMount.current) return;
    animatedOnMount.current = true;
    // Štart: po-only (100% = celé AFTER), potom plynulý prechod na ~65 default
    onSlider(100);
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      // Fáza 1 (0 → 600ms): 100 → 5 (odhaľ BEFORE)
      // Fáza 2 (600 → 1500ms): 5 → 65 (vráť sa na default split)
      let pos: number;
      if (elapsed < 600) {
        const t = elapsed / 600;
        // easeOutCubic
        const eased = 1 - Math.pow(1 - t, 3);
        pos = 100 - eased * 95;
      } else if (elapsed < 1500) {
        const t = (elapsed - 600) / 900;
        const eased = t * t * (3 - 2 * t); // smoothstep
        pos = 5 + eased * 60;
      } else {
        pos = 65;
      }
      onSlider(Math.round(pos));
      if (elapsed < 1500) {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="rounded-3xl bg-white p-4 md:p-5 lg:p-6 shadow-[0_10px_40px_rgba(27,36,48,0.08)] ring-1 ring-[#1B2430]/5 lg:grid lg:grid-cols-[1.55fr_1fr] lg:gap-6 lg:items-stretch">
      {/* ═════ ĽAVÝ STĹPEC (lg+): Before/After slider ═════ */}
      <div className="lg:min-w-0">
      {/* Before/After slider — klik na obrázok → fullscreen lightbox */}
      <div
        className="relative w-full aspect-video lg:aspect-[16/11] rounded-2xl overflow-hidden bg-[#F8FAFC] select-none group cursor-zoom-in"
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
        {/* Slider handle — hrubšia biela čiara + ring-2 čierna outline aby bola
            jasne vidno aj na svetlých podlahách. Drop shadow zo strany pre 3D. */}
        <div
          className="absolute top-0 bottom-0 w-[3px] bg-white shadow-[2px_0_8px_rgba(0,0,0,0.6),-2px_0_8px_rgba(0,0,0,0.6)] pointer-events-none"
          style={{ left: `calc(${sliderPos}% - 1.5px)` }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white ring-2 ring-[#1B2430]/15 shadow-[0_4px_16px_rgba(0,0,0,0.35)] flex items-center justify-center gap-0.5">
            <ArrowLeft className="w-3.5 h-3.5 text-[#1B2430]" aria-hidden />
            <ArrowRight className="w-3.5 h-3.5 text-[#1B2430]" aria-hidden />
          </div>
        </div>
        {/* Labels — výraznejšie + explicitnejšie texty aby bolo jasné že
            PRED = užívateľova fotka (originál), PO = AI náhľad novej podlahy */}
        <div className="absolute top-3 left-3 px-3 py-1.5 rounded-md bg-[#1B2430] text-white text-xs font-black uppercase tracking-wider shadow-[0_4px_14px_rgba(0,0,0,0.5)] ring-2 ring-white/20 pointer-events-none">
          Pred · tvoja fotka
        </div>
        <div className="absolute top-3 right-3 px-3 py-1.5 rounded-md bg-[#2EA3DC] text-white text-xs font-black uppercase tracking-wider shadow-[0_4px_14px_rgba(46,163,220,0.6)] ring-2 ring-white/30 pointer-events-none">
          Po · nová podlaha
        </div>
        {/* Expand button — skutočne klikateľný (z-20 nad slider input).
            stopPropagation aby slider neukradol klik. */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setFullscreen(true);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          aria-label="Zväčšiť výsledok"
          className="absolute bottom-3 right-3 z-20 inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#1B2430]/90 text-white text-[10px] md:text-xs font-extrabold backdrop-blur-sm shadow-md hover:bg-[#1B2430] active:scale-95 transition-all cursor-pointer"
        >
          <Maximize2 className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden />
          Zväčšiť
        </button>
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

        {/* Label OVERLAY na spodku fotky — textura · farba · lak.
            Pôvodne bol pod fotkou ako blok textu, ale to spôsobovalo že
            ľavý stĺpec bol vyšší než pravý → orange CTA box nelícoval
            spodnou hranou s fotkou. Teraz je label SÚČASŤOU fotky → ľavý
            stĺpec má presne výšku fotky (cez aspect-ratio) → pravý stĺpec
            sa naňho perfektne stretch-uje. */}
        <div className="absolute bottom-3 left-3 max-w-[calc(100%-120px)] px-3 py-1.5 rounded-md bg-[#1B2430]/85 text-white text-xs md:text-sm font-extrabold backdrop-blur-sm shadow-md pointer-events-none truncate">
          {textureLabel} · {colorName} · {finishLabel}
        </div>
      </div>
      </div>
      {/* ═════ KONIEC ĽAVÉHO STĹPCA ═════ */}

      {/* ═════ PRAVÝ STĹPEC (lg+): info + akcie + CTA ═════
           lg:h-full + flex-col + gap → CTA box dostane mt-auto a sám sa pretiahne
           dolu, takže pravý stĺpec končí na rovnakej výške ako slider. */}
      <div className="mt-4 lg:mt-0 flex flex-col gap-3 lg:h-full">
        {/* Disclaimer warning — rovnaký štýl ako v DemoExample pred uploadom.
            User požiadal aby bolo aj v result step jasne povedané že AI nemusí
            vždy vygenerovať správny výsledok + link na reálne realizácie. */}
        {/* Disclaimer warning — výraznejší: väčší padding + text aby bolo lepšie
            vidno aj na desktope (predtým bol takmer prehliadnuteľný vedľa CTA). */}
        <div className="rounded-xl bg-[#F0851A]/10 ring-2 ring-[#F0851A]/40 px-4 py-3 lg:px-5 lg:py-4">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 lg:w-6 lg:h-6 text-[#F0851A] shrink-0 mt-0.5" aria-hidden />
            <div className="text-sm lg:text-base font-bold text-[#1B2430] leading-snug">
              AI nemusí vždy vygenerovať správny výsledok. Pre istotu si pozri aj{" "}
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

        {/* 3 secondary buttons — väčšie tlačidlá, ikona vedľa labelu */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={onDownload}
            className="inline-flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 px-2 py-3.5 lg:py-4 rounded-xl bg-[#F8FAFC] text-[#1B2430] font-extrabold text-xs md:text-sm ring-1 ring-[#1B2430]/10 hover:bg-white hover:ring-[#2EA3DC] hover:text-[#2EA3DC] hover:shadow-[0_6px_16px_rgba(46,163,220,0.15)] transition-all"
          >
            <Download className="w-4 h-4 md:w-5 md:h-5 shrink-0" aria-hidden />
            <span>Stiahnuť</span>
          </button>
          <button
            type="button"
            onClick={onTryAgain}
            className="inline-flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 px-2 py-3.5 lg:py-4 rounded-xl bg-[#F8FAFC] text-[#1B2430] font-extrabold text-xs md:text-sm ring-1 ring-[#1B2430]/10 hover:bg-white hover:ring-[#2EA3DC] hover:text-[#2EA3DC] hover:shadow-[0_6px_16px_rgba(46,163,220,0.15)] transition-all"
          >
            <RefreshCw className="w-4 h-4 md:w-5 md:h-5 shrink-0" aria-hidden />
            <span className="text-center leading-tight">Iná farba</span>
          </button>
          <button
            type="button"
            onClick={onStartOver}
            className="inline-flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 px-2 py-3.5 lg:py-4 rounded-xl bg-[#F8FAFC] text-[#1B2430] font-extrabold text-xs md:text-sm ring-1 ring-[#1B2430]/10 hover:bg-white hover:ring-[#2EA3DC] hover:text-[#2EA3DC] hover:shadow-[0_6px_16px_rgba(46,163,220,0.15)] transition-all"
          >
            <Upload className="w-4 h-4 md:w-5 md:h-5 shrink-0" aria-hidden />
            <span>Iná fotka</span>
          </button>
        </div>

        {/* CTA na cenovku — menšie ako predtým (užívateľ chcel ubrať
            z oranžového aby dáta hore boli väčšie/viditeľnejšie). Stále
            flex-1 takže vyplní zvyšok výšky pravého stĺpca, len nie
            tak dominantne. */}
        <div className="rounded-2xl bg-gradient-to-br from-[#F0851A] to-[#D9760F] p-3 md:p-4 text-center text-white shadow-[0_12px_40px_rgba(240,133,26,0.35)] lg:flex-1 lg:flex lg:flex-col lg:justify-center">
          <h3 className="text-sm md:text-base lg:text-lg font-black tracking-tight leading-tight">
            Toto je ono! Pošleme ti nezáväznú cenovú ponuku.
          </h3>
          <p className="mt-1 text-[11px] md:text-xs lg:text-sm font-bold text-white/95 leading-snug">
            Pripravíme ti kalkuláciu na túto podlahu pre tvoju miestnosť do 24 hodín.
          </p>
          <button
            type="button"
            onClick={onRequestQuote}
            className="mt-2.5 lg:mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 lg:py-3 rounded-full bg-white text-[#D9760F] font-black text-sm hover:bg-white/95 shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition-all"
          >
            <Send className="w-4 h-4" aria-hidden />
            Cenová ponuka
          </button>
        </div>
      </div>
      {/* ═════ KONIEC PRAVÉHO STĹPCA ═════ */}

      {/* Fullscreen lightbox — veľký náhľad výsledku (fixed, mimo gridu) */}
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
            {textureLabel} · {colorName} · {finishLabel}
          </div>
        </div>
      )}
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
      className="flex flex-col rounded-2xl md:rounded-3xl bg-white p-2.5 md:p-3 lg:p-4 shadow-[0_10px_40px_rgba(27,36,48,0.08)] ring-1 ring-[#1B2430]/5 md:h-full"
    >
      {/* Header — kompaktný, ešte menší na desktope aby fotky podláh dostali
          maximálny vertikálny priestor cez flex-1. */}
      <div className="flex items-center gap-1.5 md:gap-1.5 shrink-0 mb-1.5 md:mb-1.5">
        <span className="inline-flex items-center justify-center w-6 h-6 md:w-6 md:h-6 rounded-md bg-gradient-to-br from-[#7EC8F0] via-[#6AA8F0] to-[#8B5CF6] text-white shadow-[0_4px_12px_rgba(139,92,246,0.4)]">
          <Sparkles className="w-3 h-3 md:w-3.5 md:h-3.5" aria-hidden />
        </span>
        <h3 className="text-xs md:text-xs font-black text-[#1B2430] uppercase tracking-wider">
          Ako to funguje
        </h3>
      </div>

      {/* ─── MOBILE LAYOUT: horizontálny strip pred → šípka → po + popisky pod fotkami ─── */}
      <div className="md:hidden mt-2 grid grid-cols-[1fr_auto_1fr] gap-2 items-start">
        {/* PRED stĺpec: fotka + popisok */}
        <div className="flex flex-col gap-1.5">
          <div className="relative aspect-square rounded-lg overflow-hidden bg-[#F8FAFC] ring-1 ring-[#1B2430]/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/visualizer-demo/pred.jpg"
              alt="Pôvodná fotka miestnosti"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-[#1B2430] text-white text-[9px] font-black uppercase tracking-wider z-10">
              Pred
            </div>
          </div>
          <div className="text-[11px] font-black text-[#1B2430] leading-tight text-center flex items-center justify-center gap-1">
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#2EA3DC] text-white text-[9px] font-black shrink-0">1</span>
            <span>Nahraj fotku</span>
          </div>
        </div>

        {/* Stredná šípka — vertikálne zarovnaná na stred fotiek */}
        <div className="flex flex-col items-center gap-1 pt-8">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-[#7EC8F0] via-[#6AA8F0] to-[#8B5CF6] text-white shadow-[0_4px_12px_rgba(139,92,246,0.45)]">
            <ArrowRight className="w-4 h-4" strokeWidth={3} aria-hidden />
          </span>
          <span className="text-[8px] font-black uppercase tracking-wider text-[#8B5CF6] leading-none whitespace-nowrap">
            AI·30s
          </span>
        </div>

        {/* PO stĺpec: fotka + popisok */}
        <div className="flex flex-col gap-1.5">
          <div className="relative aspect-square rounded-lg overflow-hidden bg-[#F8FAFC] ring-2 ring-[#2EA3DC]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/visualizer-demo/po.jpg"
              alt="Fotka miestnosti po AI vizualizácii"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-[#2EA3DC] text-white text-[9px] font-black uppercase tracking-wider z-10">
              Po
            </div>
          </div>
          <div className="text-[11px] font-black text-[#2EA3DC] leading-tight text-center flex items-center justify-center gap-1">
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#2EA3DC] text-white text-[9px] font-black shrink-0">2</span>
            <span>AI výsledok</span>
          </div>
        </div>
      </div>

      {/* ─── DESKTOP LAYOUT: fotky MAXIMÁLNE — žiadne separátne labels, len overlay badges ─── */}
      <div className="hidden md:flex md:flex-col md:flex-1 md:min-h-0 md:gap-2">
        {/* Pred fotka — flex-1, label "Pred" ako overlay badge v rohu */}
        <div className="relative flex-1 min-h-[260px] lg:min-h-0 rounded-2xl overflow-hidden bg-[#F8FAFC] ring-1 ring-[#1B2430]/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/visualizer-demo/pred.jpg"
            alt="Pôvodná fotka miestnosti"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute top-2 left-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1B2430] text-white text-xs font-black uppercase tracking-wider shadow-md z-10">
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-white text-[#1B2430] text-[10px] font-black">1</span>
            Pred · tvoja fotka
          </div>
        </div>

        {/* Tiny separator s šípkou a AI pillom — kompaktnejší vertikálne aby
            fotky dostali viac priestoru. */}
        <div className="flex items-center justify-center gap-2 shrink-0">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#8B5CF6]/40 to-[#8B5CF6]/60" aria-hidden />
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-[#7EC8F0] via-[#6AA8F0] to-[#8B5CF6] text-white shadow-[0_4px_14px_rgba(139,92,246,0.5)] ring-2 ring-white shrink-0">
            <ArrowDown className="w-3.5 h-3.5" strokeWidth={3} aria-hidden />
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white ring-2 ring-[#8B5CF6]/40 text-[#8B5CF6] text-[10px] font-black uppercase tracking-wider shadow-sm shrink-0">
            <Sparkles className="w-2.5 h-2.5" aria-hidden />
            AI · 30 s
          </span>
          <span className="h-px flex-1 bg-gradient-to-l from-transparent via-[#8B5CF6]/40 to-[#8B5CF6]/60" aria-hidden />
        </div>

        {/* Po fotka — flex-1, label "Po" ako overlay v rohu */}
        <div className="relative flex-1 min-h-[260px] lg:min-h-0 rounded-2xl overflow-hidden bg-[#F8FAFC] ring-2 ring-[#2EA3DC]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/visualizer-demo/po.jpg"
            alt="Fotka miestnosti po AI vizualizácii"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute top-2 left-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#2EA3DC] text-white text-xs font-black uppercase tracking-wider shadow-[0_4px_12px_rgba(46,163,220,0.5)] z-10">
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-white text-[#2EA3DC] text-[10px] font-black">2</span>
            Po · AI výsledok
          </div>
          <div className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-[#7EC8F0] via-[#6AA8F0] to-[#8B5CF6] text-white text-[10px] font-black uppercase tracking-wider shadow-md z-10">
            <Sparkles className="w-2.5 h-2.5" aria-hidden />
            AI
          </div>
        </div>
      </div>

      {/* Krátke upozornenie + link na realizácie — kompaktné, single line na desktope */}
      <div className="mt-1.5 rounded-lg bg-[#F0851A]/10 ring-1 ring-[#F0851A]/30 px-2.5 py-1 shrink-0">
        <div className="flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-[#F0851A] shrink-0" aria-hidden />
          <div className="text-[10px] md:text-[11px] font-bold text-[#1B2430] leading-tight">
            AI nemusí vždy vygenerovať správny výsledok. Pre istotu si pozri aj{" "}
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
