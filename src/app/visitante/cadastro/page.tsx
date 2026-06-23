"use client";

import { useState } from "react";
import { Card, Field, inputClass } from "@/components/ui";
import { membrosDb } from "@/lib/supabase";
import type { VisitorOrigin } from "@/lib/types";

const originOptions: { value: VisitorOrigin; label: string }[] = [
  { value: "culto", label: "Vim a um culto" },
  { value: "indicacao", label: "Indicacao de amigo ou familiar" },
  { value: "evento", label: "Participei de um evento" },
  { value: "online", label: "Encontrei nas redes sociais" },
  { value: "celula", label: "Participei de um grupo familiar" },
];

export default function VisitanteCadastroPage() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    birth_city: "",
    visitor_origin: "" as VisitorOrigin | "",
    notes: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!membrosDb) return;
    setLoading(true);
    setError("");
    const payload = {
      name: form.name,
      preferred_name: form.name,
      phone: form.phone,
      birth_city: form.birth_city || null,
      visitor_origin: form.visitor_origin || null,
      notes: form.notes || null,
      status: "visitante" as const,
      pending_approval: true,
    };
    const { error: err } = await membrosDb.from("people").insert(payload);
    setLoading(false);
    if (err) { setError(err.message); return; }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sage px-4">
        <div className="w-full max-w-md rounded-xl border border-line bg-white p-8 text-center shadow-soft">
          <div className="mb-4 text-4xl">🙏</div>
          <h2 className="text-xl font-bold text-ink">Obrigado pela visita!</h2>
          <p className="mt-2 text-sm text-ink/60">Ficamos felizes em ter voce conosco. Nossa equipe vai entrar em contato em breve.</p>
          {form.notes && <p className="mt-3 text-sm text-moss font-medium">Seu pedido de oracao foi recebido. Vamos orar por voce!</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sage px-4 py-8">
      <div className="mx-auto max-w-lg">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-moss">IGREJA BATISTA INDEPENDENTE</p>
          <p className="text-xs font-semibold uppercase tracking-wide text-moss/70">ABELARDO LUZ</p>
          <h1 className="mt-2 text-2xl font-bold text-ink">Bem-vindo!</h1>
          <p className="mt-1 text-sm text-ink/60">Deixe seu contato para ficarmos conectados.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Card>
            <div className="grid gap-4">
              <Field label="Seu nome">
                <input required className={inputClass} placeholder="Como quer ser chamado" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </Field>
              <Field label="Seu WhatsApp">
                <input required className={inputClass} placeholder="Ex: 48999999999" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </Field>
              <Field label="Como conheceu nossa igreja?">
                <select className={inputClass} value={form.visitor_origin} onChange={(e) => setForm({ ...form, visitor_origin: e.target.value as VisitorOrigin })}>
                  <option value="">Selecione</option>
                  {originOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>
              <Field label="Cidade onde mora (opcional)">
                <input className={inputClass} placeholder="Sua cidade" value={form.birth_city} onChange={(e) => setForm({ ...form, birth_city: e.target.value })} />
              </Field>
              <Field label="Pedido de oracao (opcional)">
                <textarea className={inputClass} rows={4} placeholder="Compartilhe se quiser — nossa equipe vai orar por voce." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </Field>
            </div>
          </Card>
          {error && <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={loading} className="w-full rounded-md bg-moss px-4 py-3 text-sm font-semibold text-white hover:bg-moss/90 disabled:opacity-50">
            {loading ? "Enviando..." : "Enviar"}
          </button>
          <p className="text-center text-xs text-ink/40">Seus dados sao usados apenas para contato pastoral.</p>
        </form>
      </div>
    </div>
  );
}
