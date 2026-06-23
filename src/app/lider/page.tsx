"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Badge, Card, PageHeader, PageShell } from "@/components/ui";
import { filterPeopleByAccess, getAccessContext } from "@/lib/access";
import { isBirthdayThisWeek, isOlderThanDays, formatDate } from "@/lib/date";
import { personStatusLabels } from "@/lib/labels";
import { membrosDb, supabase } from "@/lib/supabase";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import type { AccessContext, PastoralTask, Person } from "@/lib/types";

export default function LiderHomePage() {
  const [access, setAccess] = useState<AccessContext | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [tasks, setTasks] = useState<PastoralTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!supabase || !membrosDb) return;
      const ctx = await getAccessContext();
      setAccess(ctx);

      const [peopleResult, tasksResult] = await Promise.all([
        membrosDb.from("people").select("*").order("name"),
        membrosDb.from("pastoral_tasks").select("*, people(name, phone)").eq("status", "pendente").order("due_date")
      ]);

      const allPeople = (peopleResult.data ?? []) as Person[];
      const filtered = filterPeopleByAccess(allPeople, ctx);
      setPeople(filtered);

      const myTasks = ((tasksResult.data ?? []) as PastoralTask[]).filter(
        (task) => task.responsible === ctx.person?.name
      );
      setTasks(myTasks);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <PageShell><p className="text-sm text-ink/60">Carregando...</p></PageShell>;

  const birthdays = people.filter((p) => isBirthdayThisWeek(p.birth_date));
  const stale = people.filter((p) => isOlderThanDays(p.last_contact_at, 30));
  const leaderName = access?.person?.preferred_name || access?.person?.name || "Líder";

  return (
    <PageShell>
      <PageHeader
        title={`Olá, ${leaderName} 👋`}
        description="Visão geral do seu grupo e tarefas pastorais."
      />

      <Card className="mb-6">
        <h3 className="font-semibold text-ink">Links rápidos</h3>
        <p className="mt-1 text-sm text-ink/60">Compartilhe estes links para novos cadastros. Eles entram para revisão da liderança.</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <Link href="/cadastro" className="rounded-md border border-line px-3 py-2.5 text-center text-sm font-semibold text-ink hover:bg-sage">
            Cadastro completo
          </Link>
          <Link href="/visitante/cadastro" className="rounded-md border border-line px-3 py-2.5 text-center text-sm font-semibold text-ink hover:bg-sage">
            Cadastro de visitante
          </Link>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <Card>
          <p className="text-sm text-ink/60">Pessoas no grupo</p>
          <p className="mt-2 text-3xl font-bold text-ink">{people.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-ink/60">Aniversariantes esta semana</p>
          <p className="mt-2 text-3xl font-bold text-ink">{birthdays.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-ink/60">Sem contato há 30+ dias</p>
          <p className="mt-2 text-3xl font-bold text-ink">{stale.length}</p>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {birthdays.length > 0 && (
          <Card>
            <h3 className="mb-3 font-semibold">🎂 Aniversariantes da semana</h3>
            <div className="space-y-2">
              {birthdays.map((person) => (
                <div key={person.id} className="flex items-center justify-between rounded-md border border-line px-3 py-2.5">
                  <div>
                    <p className="text-sm font-semibold text-ink">{person.preferred_name || person.name}</p>
                    <p className="text-xs text-ink/60">{formatDate(person.birth_date ?? "")}</p>
                  </div>
                  <a href={buildWhatsAppUrl(person.phone, `Feliz aniversario ${person.preferred_name || person.name}! Que Deus te abencoe muito!`)} target="_blank" className="rounded-md border border-line p-2 text-moss hover:bg-sage">
                    <MessageCircle className="h-4 w-4" />
                  </a>
                </div>
              ))}
            </div>
          </Card>
        )}

        {stale.length > 0 && (
          <Card>
            <h3 className="mb-3 font-semibold">⚠️ Sem contato há 30+ dias</h3>
            <div className="space-y-2">
              {stale.slice(0, 6).map((person) => (
                <div key={person.id} className="flex items-center justify-between rounded-md border border-line px-3 py-2.5">
                  <div>
                    <p className="text-sm font-semibold text-ink">{person.preferred_name || person.name}</p>
                    <p className="text-xs text-ink/60">Último contato: {person.last_contact_at ? formatDate(person.last_contact_at) : "nunca"}</p>
                  </div>
                  <a href={buildWhatsAppUrl(person.phone, `Ola ${person.preferred_name || person.name}, paz!`)} target="_blank" className="rounded-md border border-line p-2 text-moss hover:bg-sage">
                    <MessageCircle className="h-4 w-4" />
                  </a>
                </div>
              ))}
            </div>
          </Card>
        )}

        {tasks.length > 0 && (
          <Card>
            <h3 className="mb-3 font-semibold">📋 Minhas tarefas pastorais</h3>
            <div className="space-y-2">
              {tasks.map((task) => (
                <div key={task.id} className="rounded-md border border-line px-3 py-2.5">
                  <p className="text-sm font-semibold text-ink">{task.title}</p>
                  <p className="text-xs text-ink/60">{task.people?.name ?? "Sem pessoa"} · prazo {formatDate(task.due_date ?? "")}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card>
          <h3 className="mb-3 font-semibold">👥 Meu grupo</h3>
          <div className="space-y-2">
            {people.map((person) => (
              <div key={person.id} className="flex items-center justify-between rounded-md border border-line px-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-ink">{person.preferred_name || person.name}</p>
                    <Badge>{personStatusLabels[person.status]}</Badge>
                  </div>
                  <p className="text-xs text-ink/60">{person.phone}</p>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <a href={buildWhatsAppUrl(person.phone, `Ola ${person.preferred_name || person.name}, paz!`)} target="_blank" className="rounded-md border border-line p-2 text-moss hover:bg-sage">
                    <MessageCircle className="h-4 w-4" />
                  </a>
                  <Link href={`/pessoas/${person.id}`} className="rounded-md border border-line px-2.5 py-1.5 text-xs font-semibold text-ink hover:bg-sage">
                    Ver
                  </Link>
                </div>
              </div>
            ))}
            {people.length === 0 && <p className="text-sm text-ink/60">Nenhuma pessoa atribuída ao seu grupo.</p>}
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
