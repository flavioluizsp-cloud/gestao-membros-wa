"use client";

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { Badge, Card, PageHeader, PageShell } from "@/components/ui";
import { getAccessContext } from "@/lib/access";
import { formatDate } from "@/lib/date";
import { personStatusLabels } from "@/lib/labels";
import { membrosDb, supabase } from "@/lib/supabase";
import type { Person, PersonStatus } from "@/lib/types";

export default function AprovacoesPage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function load() {
    if (!supabase || !membrosDb) return;
    const { data } = await membrosDb
      .from("people")
      .select("*")
      .eq("pending_approval", true)
      .order("created_at", { ascending: false });
    setPeople((data ?? []) as Person[]);
    setLoading(false);
  }

  useEffect(() => {
    async function check() {
      const ctx = await getAccessContext();
      if (!ctx.isAdminLike) {
        window.location.href = "/";
        return;
      }
      load();
    }
    check();
  }, []);

  async function approve(person: Person, status: PersonStatus) {
    if (!membrosDb) return;
    await membrosDb
      .from("people")
      .update({ pending_approval: false, status })
      .eq("id", person.id);
    setMessage(`${person.preferred_name || person.name} aprovado como ${personStatusLabels[status]}.`);
    setTimeout(() => setMessage(""), 3000);
    load();
  }

  async function reject(person: Person) {
    if (!membrosDb) return;
    if (!window.confirm(`Rejeitar e excluir o cadastro de ${person.name}?`)) return;
    await membrosDb.from("people").delete().eq("id", person.id);
    load();
  }

  return (
    <PageShell>
      <PageHeader
        title="Aprovações de cadastro"
        description="Cadastros enviados pelo formulário público aguardando aprovação."
      />

      {message && (
        <div className="fixed left-1/2 top-6 z-[9999] w-[min(92vw,560px)] -translate-x-1/2 rounded-md bg-emerald-700 px-5 py-4 text-center text-base font-bold text-white shadow-2xl">
          {message}
        </div>
      )}

      {loading && <p className="text-sm text-ink/60">Carregando...</p>}

      {!loading && people.length === 0 && (
        <div className="rounded-lg border border-dashed border-line bg-white p-8 text-center">
          <h3 className="font-semibold text-ink">Nenhum cadastro pendente</h3>
          <p className="mt-1 text-sm text-ink/60">Todos os cadastros já foram revisados.</p>
        </div>
      )}

      <div className="space-y-4">
        {people.map((person) => (
          <Card key={person.id}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-ink">{person.name}</h3>
                  {person.preferred_name && <span className="text-sm text-ink/60">({person.preferred_name})</span>}
                  <Badge>Pendente</Badge>
                </div>
                <div className="mt-2 grid gap-1 text-sm text-ink/70 sm:grid-cols-2">
                  <p>📱 {person.phone}</p>
                  {person.email && <p>✉️ {person.email}</p>}
                  {person.birth_date && <p>🎂 {formatDate(person.birth_date)}</p>}
                  {person.birth_city && <p>📍 {person.birth_city}</p>}
                  {person.marital_status && <p>💍 {person.marital_status}</p>}
                  {person.family_group && <p>👨‍👩‍👧 {person.family_group}</p>}
                  <p>🕊️ {person.is_baptized ? "Batizado" : "Não batizado"}</p>
                  <p>📅 Enviado em {formatDate(person.created_at)}</p>
                </div>

                {(person.departments ?? []).length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {(person.departments ?? []).map((dep) => (
                      <span key={dep} className="rounded-md bg-sage px-2 py-0.5 text-xs font-semibold text-moss">{dep}</span>
                    ))}
                  </div>
                )}

                {(person.family_members ?? []).length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-semibold text-ink/60 mb-1">Familiares:</p>
                    <div className="flex flex-wrap gap-2">
                      {(person.family_members ?? []).map((member, i) => (
                        <span key={i} className="rounded-md border border-line px-2 py-0.5 text-xs text-ink">
                          {member.name} · {member.relationship}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 sm:items-end">
                <p className="text-xs font-semibold text-ink/60 mb-1">Aprovar como:</p>
                <button
                  onClick={() => approve(person, "visitante")}
                  className="inline-flex items-center gap-2 rounded-md bg-moss px-3 py-2 text-sm font-semibold text-white hover:bg-moss/90"
                >
                  <Check className="h-4 w-4" /> Visitante
                </button>
                <button
                  onClick={() => approve(person, "frequentador")}
                  className="inline-flex items-center gap-2 rounded-md bg-moss/80 px-3 py-2 text-sm font-semibold text-white hover:bg-moss/90"
                >
                  <Check className="h-4 w-4" /> Frequentador
                </button>
                <button
                  onClick={() => approve(person, "membro")}
                  className="inline-flex items-center gap-2 rounded-md bg-moss/60 px-3 py-2 text-sm font-semibold text-white hover:bg-moss/70"
                >
                  <Check className="h-4 w-4" /> Membro
                </button>
                <button
                  onClick={() => reject(person)}
                  className="inline-flex items-center gap-2 rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                >
                  <X className="h-4 w-4" /> Rejeitar
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}