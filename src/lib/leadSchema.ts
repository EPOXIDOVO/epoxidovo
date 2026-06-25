import { z } from "zod";

/**
 * Zod schema pre lead form — single source of truth.
 * Použitie: client (RHF resolver) + server (API validation).
 */
export const LeadInputSchema = z.object({
  name: z
    .string()
    .min(2, "Meno musí mať aspoň 2 znaky")
    .max(120, "Meno je príliš dlhé"),
  email: z
    .string()
    .email("Zadaj platnú emailovú adresu")
    .max(200, "Email je príliš dlhý"),
  // Telefón POVINNÝ — chceme každého leadu vedieť okamžite zavolať.
  phone: z
    .string()
    .min(9, "Zadaj platné telefónne číslo")
    .max(30, "Telefón je príliš dlhý")
    .regex(/^[+\d\s\-/()]+$/, "Telefón obsahuje nepovolené znaky"),
  spaceType: z
    .enum(["dom", "garaz", "hala-firma", "ine"])
    .optional(),
  service: z
    .enum([
      "jednofarebne",
      "chipsove",
      "mramorove",
      "metalicke",
      "neviem",
    ])
    .optional(),
  area: z
    .union([
      z.number().int().min(1).max(100000),
      z.string().regex(/^\d+$/).transform(Number),
      z.literal("").transform(() => undefined),
    ])
    .optional(),
  message: z
    .string()
    .max(2000, "Správa je príliš dlhá")
    .optional()
    .or(z.literal("")),
  // GDPR consent — povinný
  consent: z.literal(true, {
    message: "Pre odoslanie musíš súhlasiť s ochranou osobných údajov",
  }),
  // Honeypot pre boty (nemal by byť nikdy vyplnený)
  website: z.string().max(0).optional().or(z.literal("")),
  // Tracking — kontrolované max lengths aby attacker nemohol stuffnúť 1MB string
  source: z.string().max(80).regex(/^[A-Za-z0-9_\-]+$/, "invalid source").optional(),
  utmSource: z.string().max(100).optional(),
  utmMedium: z.string().max(100).optional(),
  utmCampaign: z.string().max(150).optional(),
  // Cloudflare Turnstile token — max 2048 chars per CF docs
  turnstileToken: z.string().max(2048).optional(),
});

export type LeadInput = z.infer<typeof LeadInputSchema>;
