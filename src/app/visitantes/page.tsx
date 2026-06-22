"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Save } from "lucide-react";
import { Badge, Button, Card, EmptyState, Field, inputClass, PageHeader, PageShell } from "@/components/ui";
import { supabase } from "@/lib/supabase";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { visitorOriginLabels, visitorStatusLabels } from "@/lib/labels";
import type { Person, VisitorOrigin, VisitorStatus } from "@/lib/types";

const emptyForm = { name: "", phone: "", visitor_origin: "culto" as VisitorOrigin, visitor_status: "novo" as VisitorStatus, notes: "" };

export default function VisitorsPage() {
  const [visitors, setVisitors] = useState<Person[]>([]);
  const [form, setForm] = useState(emptyForm);

  async function loadVisitors() {
    if (!supabase) return;
    const { data } = await supabase.from("people").select("*").eq("status", "visitante").order("created_at", { ascending: false });
    setVisitors((data ?? []) as Person[]);
  }

  useEffect(() => { loadVisitors(); }, []);

  async function saveVisitor(event: React.FormEvent) {
    event.preventDefault();
    if (!supabase) return;
    await supabase.from("people").insert({ ...form, status: "visitante", notes: form.notes || null });
    setForm(emptyForm);
    loadVisitors();
  }

  async function updateStatus(id: string, visitor_status: VisitorStatus) {
    if (!supabase) return;
    await supabase.from("people").update({ visitor_status }).eq("id", id);
    loadVisitors();
  }

  return (
    <PageShell>
      <PageHeader title="Visitantes" description="Cadastro rapido e acompanhamento ate integracao." />
      <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
        <Card>
          <form onSubmit={saveVisitor} className="space-y-3">
            <Field label="Nome"><input required className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Telefone"><input required className={inputClass} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
            <Field label="Origem">
              <select className={inputClass} value={form.visitor_origin} onChange={(e) => setForm({ ...form, visitor_origin: e.target.value as VisitorOrigin })}>
                {Object.entries(visitorOriginLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select className={inputClass} value={form.visitor_status} onChange={(e) => setForm({ ...form, visitor_status: e.target.value as VisitorStatus })}>
                {Object.entries(visitorStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </Field>
            <Field label="Observacoes"><textarea className={inputClass} rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
            <Button className="w-full gap-2"><Save className="h-4 w-4" />Cadastrar visitante</Button>
          </form>
        </Card>
        <div className="space-y-3">
          {visitors.map((visitor) => (
            <Card key={visitor.id}>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{visitor.name}</h3>
                    <Badge tone="warn">{visitorStatusLabels[visitor.visitor_status ?? "novo"]}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-ink/65">{visitor.phone} · {visitorOriginLabels[visitor.visitor_origin ?? "culto"]}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <select className={inputClass} value={visitor.visitor_status ?? "novo"} onChange={(e) => updateStatus(visitor.id, e.target.value as VisitorStatus)}>
                    {Object.entries(visitorStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                  <a className="inline-flex items-center gap-2 rounded-md bg-moss px-3 py-2 text-sm font-semibold text-white" target="_blank" href={buildWhatsAppUrl(visitor.phone, `Ola ${visitor.name}, paz! Foi uma alegria receber voce. Como podemos orar por voce?`)}>
                    <MessageCircle className="h-4 w-4" />Enviar WhatsApp
                  </a>
                </div>
              </div>
            </Card>
          ))}
          {visitors.length === 0 ? <EmptyState title="Nenhum visitante" text="Cadastre visitantes logo apos o culto, celula ou evento." /> : null}
        </div>
      </div>
    </PageShell>
  );
}
