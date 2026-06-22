"use client";

import { useEffect, useState } from "react";
import { Badge, Card, PageHeader, PageShell } from "@/components/ui";
import { membrosDb, supabase } from "@/lib/supabase";
import { filterPeopleByAccess, getAccessContext } from "@/lib/access";
import { isBirthdayThisWeek, isOlderThanDays, formatDate } from "@/lib/date";
import { personStatusLabels } from "@/lib/labels";
import type { PastoralTask, Person } from "@/lib/types";

export default function ReportsPage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [tasks, setTasks] = useState<PastoralTask[]>([]);

  useEffect(() => {
    async function loadReports() {
      if (!supabase || !membrosDb) return;
      const accessContext = await getAccessContext();
      const [peopleResult, tasksResult] = await Promise.all([
        membrosDb.from("people").select("*").order("created_at", { ascending: false }),
        membrosDb.from("pastoral_tasks").select("*, people(name, phone)").eq("status", "pendente").order("due_date")
      ]);
      setPeople(filterPeopleByAccess((peopleResult.data ?? []) as Person[], accessContext));
      setTasks((tasksResult.data ?? []) as PastoralTask[]);
    }

    loadReports();
  }, []);

  const byStatus = Object.entries(personStatusLabels).map(([status, label]) => ({
    label,
    total: people.filter((person) => person.status === status).length
  }));
  const visitorsByMonth = people
    .filter((person) => person.status === "visitante")
    .reduce<Record<string, number>>((acc, person) => {
      const key = new Intl.DateTimeFormat("pt-BR", { month: "short", year: "numeric" }).format(new Date(person.created_at));
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
  const birthdays = people.filter((person) => isBirthdayThisWeek(person.birth_date));
  const stale = people.filter((person) => isOlderThanDays(person.last_contact_at, 30));

  return (
    <PageShell>
      <PageHeader title="Relatorios" description="Indicadores simples para reunioes de cuidado e acompanhamento." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 font-semibold">Visitantes por mes</h3>
          <div className="space-y-2">{Object.entries(visitorsByMonth).map(([month, total]) => <p key={month} className="flex justify-between text-sm"><span>{month}</span><strong>{total}</strong></p>)}</div>
        </Card>
        <Card>
          <h3 className="mb-3 font-semibold">Membros por status</h3>
          <div className="space-y-2">{byStatus.map((row) => <p key={row.label} className="flex justify-between text-sm"><span>{row.label}</span><strong>{row.total}</strong></p>)}</div>
        </Card>
        <Card>
          <h3 className="mb-3 font-semibold">Aniversariantes da semana</h3>
          <div className="space-y-2">{birthdays.map((person) => <p key={person.id} className="text-sm">{person.name} · {formatDate(person.birth_date)}</p>)}</div>
        </Card>
        <Card>
          <h3 className="mb-3 font-semibold">Tarefas pendentes</h3>
          <div className="space-y-2">{tasks.map((task) => <p key={task.id} className="text-sm">{task.title} · {task.people?.name ?? "sem pessoa"} · {formatDate(task.due_date)}</p>)}</div>
        </Card>
        <Card className="lg:col-span-2">
          <h3 className="mb-3 font-semibold">Pessoas sem contato recente</h3>
          <div className="grid gap-2 md:grid-cols-2">{stale.map((person) => <p key={person.id} className="rounded-md border border-line p-3 text-sm"><strong>{person.name}</strong> <Badge>{personStatusLabels[person.status]}</Badge><br />Ultimo contato: {formatDate(person.last_contact_at)}</p>)}</div>
        </Card>
      </div>
    </PageShell>
  );
}
