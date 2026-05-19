import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { SITE } from "@/lib/site";

/**
 * POST /api/chat — AI asistent (Anthropic Claude).
 *
 * Body: { messages: [{ role: 'user' | 'assistant', content: string }] }
 * Returns: { reply: string }
 *
 * Vyžaduje ANTHROPIC_API_KEY env. Ak nie je nastavený, fallback na rule-based
 * odpovede na časté otázky (FAQ).
 */

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(2000),
});

const BodySchema = z.object({
  messages: z.array(MessageSchema).min(1).max(40),
});

const SYSTEM_PROMPT = `Si AI asistent firmy ${SITE.legalName} (${SITE.domain}), ktorá robí ručne tvorené epoxidové a polyuretánové podlahy na Slovensku.

Tvoja úloha:
- Odpovedať priateľsky a stručne (max 3-5 viet) na otázky o epoxidových podlahách
- Pomáhať návštevníkom webu rozhodnúť sa
- Vždy v slovenčine, neformálne (tykanie)
- Pri konkrétnych cenách / termínoch odporúč zavolať alebo poslať dopyt cez formulár

Kľúčové info o firme:
- Sídlo: Ružomberok, realizujeme po celom Slovensku
- Telefón: ${SITE.contact.phone}
- E-mail: ${SITE.contact.email}
- Cenová ponuka: cez formulár na /kontakt

4 typy podláh ktoré ponúkame:
1. **Jednofarebné / minimalistické** — od 35 €/m². Hladký monolitický povrch v jednom odtieni. Bez špár, ľahká údržba. Ideálne pre kuchyne, obývačky, kancelárie.
2. **Chipsové** — od 42 €/m². Farebné vločky zaliate v lesklom epoxide. Skvele skrývajú nečistoty. Ideálne pre garáže, dielne, prevádzky.
3. **Mramorové** — od 65 €/m². Ručne tvorené žilkovanie ako mramor. Každá podlaha je originál. Pre reprezentačné priestory, kuchyne, kúpeľne.
4. **Metalické** — od 75 €/m². Pigmenty s 3D ilúziou hĺbky. Showroomy, reštaurácie, luxusné obývačky.

Časté otázky:
- Realizácia trvá 3-5 dní pre bežnú podlahu do 50 m²
- Životnosť 20+ rokov pri správnej realizácii
- Vhodné aj do kuchyne, kúpeľne (s anti-slip variantou), garáže, haly, byty
- Bez prachu, bez špár, ľahká údržba (mokrý mop)
- Aj v starom byte/dome — pri obhliadke skontrolujeme podklad

Ak otázka nie je o podlahách / firme / kontaktu, slušne presmeruj na tému alebo na kontakt.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "validation", message: "Neplatný formát správy." },
        { status: 400 },
      );
    }

    const messages = parsed.data.messages;

    // Ak nemáme API key, fallback na rule-based odpovede
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
      const reply = ruleBasedReply(lastUserMsg?.content ?? "");
      return NextResponse.json({ reply, mode: "fallback" });
    }

    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 600,
      system: SYSTEM_PROMPT,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const textBlock = response.content.find((b) => b.type === "text");
    const reply =
      textBlock && textBlock.type === "text"
        ? textBlock.text
        : "Prepáč, nepodarilo sa odpovedať. Skús to znovu.";

    return NextResponse.json({ reply, mode: "ai" });
  } catch (err) {
    console.error("[chat] error:", err);
    return NextResponse.json(
      {
        error: "server_error",
        message:
          "Chyba pri AI komunikácii. Pre záväznú odpoveď nás kontaktuj telefonicky.",
      },
      { status: 500 },
    );
  }
}

/** Jednoduché kľúčové slová pre rule-based fallback */
function ruleBasedReply(question: string): string {
  const q = question.toLowerCase();

  if (/cena|stoj|koľk|kolk|euro|€/.test(q)) {
    return `Orientačné ceny: jednofarebná od 35 €/m², chipsová od 42 €/m², mramorová od 65 €/m², metalická od 75 €/m². Presnú ponuku ti pošleme po obhliadke — napíš nám cez kontaktný formulár alebo zavolaj na ${SITE.contact.phone}.`;
  }
  if (/dlh|trvá|trva|kedy|termín|termin|čas|cas/.test(q)) {
    return "Bežná podlaha do 50 m² je hotová za 3-5 dní (príprava podkladu + nanášanie + finálna vrstva). Pri väčších priestoroch dohodneme harmonogram pri obhliadke.";
  }
  if (/životnos|zivotnos|vydrž|vydrz|trvanli/.test(q)) {
    return "Pri správnej realizácii a bežnej domácej záťaži vydrží 20+ rokov. V priemyselnom prostredí 10-15 rokov. Drobné poškodenia sa dajú opraviť lokálne.";
  }
  if (/údržb|udrzb|čisten|cisten|umýv|umyv/.test(q)) {
    return "Stačí mokrý mop a štandardný čistič na podlahy. Bez voskovania, leštenia, špár ktoré treba čistiť. Pri väčšej záťaži (garáž, dielňa) odporúčame raz ročne tenkú údržbovú vrstvu.";
  }
  if (/kuchyn|kúpel|kupel|garáž|garaz|hala|firma|byt|dom/.test(q)) {
    return "Áno, robíme aj do bytov, domov, kuchýň, kúpeľní (s anti-slip), garáží aj komerčných hál. Epoxid je vodotesný, hygienicky čistý a bez špár. Realizujeme po celom Slovensku.";
  }
  if (/kontakt|telef|email|mail|napís|napis|zavola/.test(q)) {
    return `Telefón: ${SITE.contact.phone}\nEmail: ${SITE.contact.email}\nFormulár pre cenovú ponuku: /kontakt`;
  }
  if (/farb|vzor|dizajn|design|farebn/.test(q)) {
    return "Vyber si zo 4 kategórií: jednofarebné (100+ RAL odtieňov), chipsové (vločky v rôznych farbách), mramorové (ručne tvorené žilkovanie) a metalické (pigmenty s 3D efektom). Konkrétny vzor a kombináciu vyberieme spolu pri obhliadke.";
  }

  return `Pre presnú odpoveď nás najlepšie kontaktuj — zavolaj na ${SITE.contact.phone} alebo napíš cez formulár na /kontakt. Rád si pripravíme nezáväznú cenovú ponuku.`;
}
