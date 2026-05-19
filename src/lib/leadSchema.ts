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
  phone: z
    .string()
    .min(9, "Zadaj platné telefónne číslo")
    .max(30, "Telefón je príliš dlhý")
    .regex(/^[+\d\s\-/()]+$/, "Telefón obsahuje nepovolené znaky")
    .optional()
    .or(z.literal("")),
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
  // Tracking
  source: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
});

export type LeadInput = z.infer<typeof LeadInputSchema>;
