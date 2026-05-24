export const runtime = "edge";

import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Globe,
  MapPin,
  MessageSquare,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { getLeadById, STATUS_LABELS, STATUS_COLORS } from "@/lib/leads";
import { LeadStatusForm } from "@/components/admin/LeadStatusForm";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LeadDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const { id } = await params;
  const lead = await getLeadById(id);
  if (!lead) notFound();

  return (
    <div>
      <Link
        href="/admin/leads"
        className="inline-flex items-center gap-2 text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] mb-4"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden />
        Späť na leady
      </Link>

      <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            {lead.name}
          </h1>
          <p className="mt-2 text-[var(--color-fg-muted)]">
            <Calendar className="inline w-4 h-4 mr-1" aria-hidden />
            {new Intl.DateTimeFormat("sk-SK", {
              dateStyle: "long",
              timeStyle: "short",
            }).format(lead.createdAt)}
          </p>
        </div>
        <span
          className={`px-3 py-1.5 rounded-full text-sm font-semibold ${STATUS_COLORS[lead.status]}`}
        >
          {STATUS_LABELS[lead.status]}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hlavné údaje */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Kontakt">
            <Row icon={Mail} label="Email">
              <a
                href={`mailto:${lead.email}`}
                className="text-[#3db6e8] hover:underline"
              >
                {lead.email}
              </a>
            </Row>
            {lead.phone && (
              <Row icon={Phone} label="Telefón">
                <a
                  href={`tel:${lead.phone}`}
                  className="text-[#3db6e8] hover:underline"
                >
                  {lead.phone}
                </a>
              </Row>
            )}
            {lead.spaceType && (
              <Row icon={MapPin} label="Typ priestoru">
                {lead.spaceType}
              </Row>
            )}
            {lead.service && (
              <Row label="Záujem">
                {lead.service}
                {lead.area && <span> · {lead.area} m²</span>}
              </Row>
            )}
          </Card>

          {lead.message && (
            <Card title="Správa">
              <div className="flex items-start gap-3">
                <MessageSquare
                  className="w-4 h-4 mt-1 shrink-0 text-[var(--color-fg-subtle)]"
                  aria-hidden
                />
                <p className="text-[var(--color-fg)] whitespace-pre-wrap leading-relaxed">
                  {lead.message}
                </p>
              </div>
            </Card>
          )}

          <Card title="Tracking">
            <Row label="Zdroj">
              <code className="text-xs bg-[var(--color-bg-muted)] px-2 py-0.5 rounded">
                {lead.source}
              </code>
            </Row>
            {lead.utmSource && (
              <Row label="UTM Source">{lead.utmSource}</Row>
            )}
            {lead.utmCampaign && (
              <Row label="UTM Campaign">{lead.utmCampaign}</Row>
            )}
            {lead.referrer && (
              <Row icon={Globe} label="Referrer">
                <span className="text-xs break-all">{lead.referrer}</span>
              </Row>
            )}
          </Card>
        </div>

        {/* Sidebar — actions */}
        <div className="space-y-6">
          <LeadStatusForm leadId={lead.id} currentStatus={lead.status} />
        </div>
      </div>
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 md:p-6 border border-[var(--color-border)] shadow-[var(--shadow-card)]">
      <h2 className="text-xs uppercase tracking-[0.18em] text-[var(--color-fg-subtle)] mb-4">
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  children,
}: {
  icon?: typeof Mail;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 text-sm">
      {Icon && (
        <Icon className="w-4 h-4 shrink-0 text-[var(--color-fg-subtle)]" aria-hidden />
      )}
      <span className="text-[var(--color-fg-muted)] min-w-[110px]">{label}</span>
      <span className="font-medium text-[var(--color-fg)]">{children}</span>
    </div>
  );
}
