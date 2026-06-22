"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, CheckSquare, HeartHandshake, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge, Card, LinkButton, PageHeader, PageShell } from "@/components/ui";
import { supabase } from "@/lib/supabase";
import { isBirthdayThisWeek, isOlderThanDays, formatDate } from "@/lib/date";
import type { ChurchEvent, PastoralTask, Person } from "@/lib/types";

type Segment = {
  key: string;
  title: string;
  subtitle: string;
  people: Person[];
};

export default function DashboardPage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [tasks, setTasks] = useState<PastoralTask[]>([]);
  const [events, setEvents] = useState<ChurchEvent[]>([]);

  useEffect(() => {
    async function loadDashboardData() {
      if (!supabase) return;
      const [peopleResult, tasksResult, eventsResult] = await Promise.all([
        supabase.from("people").select("*").order("created_at", { ascending: false }),
        supabase.from("pastoral_tasks").select("*, people(name, phone)").eq("status", "pendente").order("due_date"),
        supabase.from("events").select("*").gte("event_date", new Date().toISOString()).order("event_date").limit(6)
      ]);
      setPeople((peopleResult.data ?? []) as Person[]);
      setTasks((tasksResult.data ?? []) as PastoralTask[]);
      setEvents((eventsResult.data ?? []) as ChurchEvent[]);
    }

    loadDashboardData();
  }, []);

  const month = new Date().getMonth();
  const visitorsThisMonth = people.filter((p) => p.status === "visitante" && new Date(p.created_at).getMonth() === month);
  const birthdays = people.filter((p) => isBirthdayThisWeek(p.birth_date));
  const stale = people.filter((p) => isOlderThanDays(p.last_contact_at, 30));

  const stats: Array<[string, number, LucideIcon]> = [
    ["Pessoas cadastradas", people.length, Users],
    ["Visitantes do mes", visitorsThisMonth.length, HeartHandshake],
    ["Aniversariantes da semana", birthdays.length, CalendarDays],
    ["Sem contato ha 30+ dias", stale.length, CheckSquare]
  ];
  const departments = buildSegments(
    people,
    (person) => person.departments ?? [],
    (name, members) => ({ key: `dep-${name}`, title: name, subtitle: findSegmentLeader(members), people: members })
  );
  const familyGroups = buildSegments(
    people.filter((person) => person.family_group),
    (person) => [person.family_group!],
    (name, members) => ({
      key: `gf-${name}`,
      title: name,
      subtitle: members.find((person) => person.family_group === name)?.family_group_leader ?? "Sem lider",
      people: members
    })
  );
  const leaders = buildSegments(
    people.filter((person) => person.assigned_leader),
    (person) => [person.assigned_leader!],
    (name, members) => ({ key: `leader-${name}`, title: name, subtitle: "Atribuicao", people: members })
  );

  return (
    <PageShell>
      <PageHeader
        title="Dashboard"
        description="Visao rapida da igreja, acompanhamento pastoral e proximos passos."
        action={<LinkButton href="/pessoas">Cadastrar pessoa</LinkButton>}
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map(([label, value, Icon]) => (
          <Card key={label}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-ink/65">{label}</p>
              <Icon className="h-5 w-5 text-moss" />
            </div>
            <p className="mt-3 text-3xl font-bold text-ink">{value}</p>
          </Card>
        ))}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 font-semibold">Tarefas pastorais pendentes</h3>
          <div className="space-y-3">
            {tasks.slice(0, 6).map((task) => (
              <div key={task.id} className="rounded-md border border-line p-3">
                <p className="font-medium">{task.title}</p>
                <p className="text-sm text-ink/60">{task.people?.name ?? "Sem pessoa vinculada"} · prazo {formatDate(task.due_date)}</p>
              </div>
            ))}
            {tasks.length === 0 ? <p className="text-sm text-ink/60">Nenhuma tarefa pendente.</p> : null}
          </div>
        </Card>
        <Card>
          <h3 className="mb-3 font-semibold">Proximos eventos</h3>
          <div className="space-y-3">
            {events.map((event) => (
              <div key={event.id} className="rounded-md border border-line p-3">
                <p className="font-medium">{event.name}</p>
                <p className="text-sm text-ink/60">{formatDate(event.event_date)} · {event.location ?? "Local a definir"}</p>
              </div>
            ))}
            {events.length === 0 ? <p className="text-sm text-ink/60">Nenhum evento futuro cadastrado.</p> : null}
          </div>
        </Card>
      </div>
      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <SegmentPanel title="Departamentos" empty="Nenhum departamento com pessoas." type="departamento" segments={departments} />
        <SegmentPanel title="Grupos Familiares" empty="Nenhum Grupo Familiar com pessoas." type="grupo-familiar" segments={familyGroups} />
        <SegmentPanel title="Atribuicoes" empty="Nenhuma atribuicao cadastrada." type="atribuicao" segments={leaders} />
      </div>
    </PageShell>
  );
}

function findSegmentLeader(members: Person[]) {
  const leader = members.find((person) => person.department_roles?.includes("Lider"));
  const coLeader = members.find((person) => person.department_roles?.includes("Co-Lider"));
  if (leader && coLeader) return `${leader.name} / ${coLeader.name}`;
  if (leader) return leader.name;
  if (coLeader) return coLeader.name;
  return "Sem lider definido";
}

function buildSegments(
  people: Person[],
  getNames: (person: Person) => string[],
  makeSegment: (name: string, members: Person[]) => Segment
) {
  const map = new Map<string, Person[]>();
  for (const person of people) {
    for (const name of getNames(person).filter(Boolean)) {
      map.set(name, [...(map.get(name) ?? []), person]);
    }
  }
  return Array.from(map.entries())
    .map(([name, members]) => makeSegment(name, members))
    .sort((a, b) => a.title.localeCompare(b.title));
}

function SegmentPanel({ title, empty, type, segments }: { title: string; empty: string; type: string; segments: Segment[] }) {
  return (
    <Card>
      <h3 className="mb-3 font-semibold">{title}</h3>
      <div className="space-y-3">
        {segments.map((segment) => (
          <div key={segment.key} className="rounded-md border border-line p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{segment.title}</p>
                <p className="mt-1 text-sm text-ink/60">Lider: {segment.subtitle}</p>
              </div>
              <Badge>{segment.people.length}</Badge>
            </div>
            <Link
              href={`/segmentos/${type}/${encodeURIComponent(segment.title)}`}
              className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-moss px-3 py-2 text-sm font-semibold text-white hover:bg-moss/90"
            >
              Ver gestao dos contatos
            </Link>
          </div>
        ))}
        {segments.length === 0 ? <p className="text-sm text-ink/60">{empty}</p> : null}
      </div>
    </Card>
  );
}
