"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Card, PageShell } from "@/components/ui";
import { getAccessContext } from "@/lib/access";
import { formatDate } from "@/lib/date";
import { personStatusLabels } from "@/lib/labels";
import { membrosDb } from "@/lib/supabase";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import type { AccessContext, Person } from "@/lib/types";

export default function MembroHomePage() {
  const [access, setAccess] = useState<AccessContext | null>(null);
  const [person, setPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const ctx = await getAccessContext();
      setAccess(ctx);
      if (ctx.person?.id && membrosDb) {
        const { data } = await membrosDb.from("people").select("*").eq("id", ctx.person.id).maybeSingle();
        setPerson(data as Person | null);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <PageShell><p className="text-sm text-ink/60">Carregando...</p></PageShell>;

  if (!person) return (
    <PageShell>
      <div className="rounded-lg border border-dashed border-line bg-white p-8 text-center">
        <h3 className="font-semibold text-ink">Perfil não encontrado</h3>
        <p className="mt-1 text-sm text-ink/60">Seu usuário ainda não está vinculado a um cadastro. Fale com a liderança.</p>
      </div>
    </PageShell>
  );

  const familyGroupLeader = person.family_group_leader;

  if (person.pending_approval) {
    return (
      <PageShell>
        <div className="rounded-lg border border-line bg-white p-8 text-center shadow-soft">
          <h2 className="text-xl font-bold text-ink">Cadastro aguardando aprovacao</h2>
          <p className="mt-2 text-sm text-ink/60">Recebemos seus dados. A lideranca ainda precisa revisar e liberar seu acesso completo.</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-ink">Olá, {person.preferred_name || person.name} 👋</h2>
        <p className="mt-1 text-sm text-ink/65">Bem-vindo ao Portal do Membro.</p>
        <Link href={`/pessoas/${person.id}`} className="mt-4 inline-flex w-full justify-center rounded-md bg-moss px-3 py-2.5 text-sm font-semibold text-white hover:bg-moss/90 sm:w-auto">
          Editar meus dados
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h3 className="mb-3 font-semibold text-ink">Meus dados</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-ink/60">Nome</span>
              <span className="font-medium text-ink">{person.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink/60">WhatsApp</span>
              <span className="font-medium text-ink">{person.phone}</span>
            </div>
            {person.email && (
              <div className="flex justify-between">
                <span className="text-ink/60">E-mail</span>
                <span className="font-medium text-ink">{person.email}</span>
              </div>
            )}
            {person.birth_date && (
              <div className="flex justify-between">
                <span className="text-ink/60">Nascimento</span>
                <span className="font-medium text-ink">{formatDate(person.birth_date)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-ink/60">Status</span>
              <span className="font-medium text-moss">{personStatusLabels[person.status]}</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="mb-3 font-semibold text-ink">Minha igreja</h3>
          <div className="space-y-2 text-sm">
            {person.family_group && (
              <div className="flex justify-between">
                <span className="text-ink/60">Grupo Familiar</span>
                <span className="font-medium text-ink">{person.family_group}</span>
              </div>
            )}
            {familyGroupLeader && (
              <div className="flex justify-between">
                <span className="text-ink/60">Líder do GF</span>
                <span className="font-medium text-ink">{familyGroupLeader}</span>
              </div>
            )}
            {person.is_baptized && (
              <div className="flex justify-between">
                <span className="text-ink/60">Batizado em</span>
                <span className="font-medium text-ink">{formatDate(person.baptism_date ?? "")}</span>
              </div>
            )}
            {(person.departments ?? []).length > 0 && (
              <div>
                <p className="mb-1 text-ink/60">Departamentos</p>
                <div className="flex flex-wrap gap-1">
                  {(person.departments ?? []).map((dep) => (
                    <span key={dep} className="rounded-md bg-sage px-2 py-0.5 text-xs font-semibold text-moss">{dep}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {(person.family_members ?? []).length > 0 && (
          <Card className="md:col-span-2">
            <h3 className="mb-3 font-semibold text-ink">Minha família</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {(person.family_members ?? []).map((member, index) => (
                <div key={index} className="rounded-md border border-line px-3 py-2.5">
                  <p className="text-sm font-semibold text-ink">{member.name}</p>
                  <p className="text-xs text-ink/60">{member.relationship}{member.birth_date ? ` · ${formatDate(member.birth_date)}` : ""}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {person.assigned_leader && (
          <Card>
            <h3 className="mb-3 font-semibold text-ink">Meu acompanhamento</h3>
            <p className="text-sm text-ink/60">Responsável por você</p>
            <div className="mt-2 flex items-center justify-between rounded-md border border-line px-3 py-2.5">
              <p className="text-sm font-semibold text-ink">{person.assigned_leader}</p>
              <a href={buildWhatsAppUrl(person.phone, `Ola ${person.preferred_name || person.name}, paz!`)} target="_blank" className="rounded-md border border-line p-2 text-moss hover:bg-sage">
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </Card>
        )}
      </div>
    </PageShell>
  );
}
