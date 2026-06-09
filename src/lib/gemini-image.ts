/**
 * Google Gemini image API klient — edge runtime compatible.
 *
 * Používa 2 modely:
 *   - `gemini-2.5-flash`        → cheap pre-check (~$0.0005) "is this a floor?"
 *   - `gemini-3.1-flash-image`  → drahšia generácia (~$0.067) Nano Banana 2
 *
 * Pre edge-compat: priamy fetch na REST API, žiadny `@google/generative-ai` SDK
 * (ten používa Node-only features).
 */

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";

interface GeminiContent {
  parts: Array<
    | { text: string }
    | { inlineData: { mimeType: string; data: string } }
  >;
}

interface GeminiResponse {
  candidates?: Array<{
    content?: GeminiContent;
    finishReason?: string;
  }>;
  promptFeedback?: {
    blockReason?: string;
    safetyRatings?: Array<{ category: string; probability: string }>;
  };
  error?: { code: number; message: string; status: string };
}

/**
 * Vráti API kľúč alebo null. Volajúce funkcie majú handlovať null → ok:false
 * s friendly hláškou, namiesto crashu s HTTP 500.
 */
function getApiKeyOrNull(): string | null {
  return process.env.GEMINI_API_KEY ?? null;
}

// ════════════════════════════════════════════════════════════════════════
// PRE-CHECK: je to fotka podlahy?
// ════════════════════════════════════════════════════════════════════════

export interface FloorCheckResult {
  ok: boolean;
  reason?: string; // ak ok=false: human-readable EN reason
}

/**
 * Skontroluje cez Gemini Flash (cheap) či uploadnutý obrázok obsahuje
 * podlahu ktorá by sa dala vizuálne nahradiť epoxidom.
 *
 * @param imageBase64 base64 (bez `data:image/jpeg;base64,` prefixu)
 * @param mimeType `image/jpeg` | `image/png` | `image/webp`
 */
export async function checkIfFloor(
  imageBase64: string,
  mimeType: string,
): Promise<FloorCheckResult> {
  const apiKey = getApiKeyOrNull();
  if (!apiKey) {
    console.error("[gemini.checkIfFloor] GEMINI_API_KEY missing in env");
    return { ok: false, reason: "api_key_missing" };
  }
  const url = `${GEMINI_API_BASE}/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const body = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Analyze this image. Reply with ONLY ONE of these single words, no other text:

FLOOR - if the image clearly shows an indoor or outdoor floor that could be redesigned with new flooring material (carpet, wood, tile, concrete, vinyl, etc.). Floor must be visible in at least 25% of the image area.
NOT_FLOOR - if the image does not clearly show a floor, OR shows: a portrait/selfie/person without floor visible, food, animal, abstract art, screenshot, text document, NSFW content, weapons, drugs.

Reply with single word only: FLOOR or NOT_FLOOR`,
          },
          {
            inlineData: { mimeType, data: imageBase64 },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0,
      maxOutputTokens: 10,
    },
    // Safety filters — block obvious NSFW pre-emptively
    safetySettings: [
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_LOW_AND_ABOVE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_LOW_AND_ABOVE" },
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
    ],
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await res.json()) as GeminiResponse;

    if (data.error) {
      console.error("[gemini.checkIfFloor] API error:", data.error);
      return { ok: false, reason: `api_error_${data.error.code}` };
    }

    // Blocked content → considered NOT_FLOOR (safety violation)
    if (data.promptFeedback?.blockReason) {
      return { ok: false, reason: `blocked_${data.promptFeedback.blockReason}` };
    }

    const text =
      data.candidates?.[0]?.content?.parts
        ?.map((p) => ("text" in p ? p.text : ""))
        .join("")
        .trim()
        .toUpperCase() ?? "";

    if (text.includes("FLOOR") && !text.includes("NOT_FLOOR") && !text.includes("NOT FLOOR")) {
      return { ok: true };
    }
    return { ok: false, reason: "not_a_floor" };
  } catch (err) {
    console.error("[gemini.checkIfFloor] fetch error:", err);
    return { ok: false, reason: "network_error" };
  }
}

// ════════════════════════════════════════════════════════════════════════
// IMAGE EDIT: vygeneruj novú podlahu na fotke
// ════════════════════════════════════════════════════════════════════════

export interface GenerateImageResult {
  ok: boolean;
  /** Base64 vygenerovaného obrázku (bez data: prefixu) */
  imageBase64?: string;
  /** MIME type vygenerovaného obrázku, väčšinou `image/png` */
  mimeType?: string;
  /** Error code ak ok=false */
  reason?: string;
}

export interface ReferenceImage {
  base64: string;
  mimeType: string;
}

/**
 * Pošle obrázok + prompt do Gemini Nano Banana 2 (`gemini-3.1-flash-image`)
 * a vráti vygenerovaný edit.
 *
 * @param imageBase64 base64 input obrázku (bez prefixu)
 * @param inputMimeType `image/jpeg` | `image/png` | `image/webp`
 * @param prompt finálny prompt (zostavený cez buildGeminiPrompt)
 * @param referenceImages voliteľné style-guide fotky (mramor/metalika),
 *   posielané do Gemini PO room photo. Prompt by mal explicitne referenciu.
 */
export async function generateFloorEdit(
  imageBase64: string,
  inputMimeType: string,
  prompt: string,
  referenceImages: ReferenceImage[] = [],
): Promise<GenerateImageResult> {
  const apiKey = getApiKeyOrNull();
  if (!apiKey) {
    console.error("[gemini.generateFloorEdit] GEMINI_API_KEY missing in env");
    return { ok: false, reason: "api_key_missing" };
  }
  const url = `${GEMINI_API_BASE}/models/gemini-3.1-flash-image:generateContent?key=${apiKey}`;

  // Parts: [prompt, room_photo, ...reference_photos]
  const parts: GeminiContent["parts"] = [
    { text: prompt },
    { inlineData: { mimeType: inputMimeType, data: imageBase64 } },
    ...referenceImages.map((ref) => ({
      inlineData: { mimeType: ref.mimeType, data: ref.base64 },
    })),
  ];

  const body = {
    contents: [
      {
        role: "user",
        parts,
      },
    ],
    generationConfig: {
      temperature: 0.4, // nižšia = menej náhody, konzistentnejší výsledok
      responseModalities: ["IMAGE"],
    },
    safetySettings: [
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_LOW_AND_ABOVE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_LOW_AND_ABOVE" },
    ],
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await res.json()) as GeminiResponse;

    if (data.error) {
      console.error("[gemini.generateFloorEdit] API error:", data.error);
      return { ok: false, reason: `api_error_${data.error.code}` };
    }

    if (data.promptFeedback?.blockReason) {
      return { ok: false, reason: `blocked_${data.promptFeedback.blockReason}` };
    }

    // Hľadáme inlineData (obrázok) v parts
    const parts = data.candidates?.[0]?.content?.parts ?? [];
    for (const p of parts) {
      if ("inlineData" in p && p.inlineData) {
        return {
          ok: true,
          imageBase64: p.inlineData.data,
          mimeType: p.inlineData.mimeType,
        };
      }
    }

    // Žiadny image v odpovedi — model mohol vrátiť len text (chybu)
    const fallbackText = parts
      .map((p) => ("text" in p ? p.text : ""))
      .join("");
    console.warn(
      "[gemini.generateFloorEdit] no image in response, text:",
      fallbackText,
    );
    return { ok: false, reason: "no_image_in_response" };
  } catch (err) {
    console.error("[gemini.generateFloorEdit] fetch error:", err);
    return { ok: false, reason: "network_error" };
  }
}
