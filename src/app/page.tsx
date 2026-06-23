"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, HeartHandshake, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge, Card, LinkButton, PageHeader, PageShell } from "@/components/ui";
import { SignupLinksCard } from "@/components/signup-links-card";
import { membrosDb, supabase } from "@/lib/supabase";
import { isBirthdayThisWeek, formatDate } from "@/lib/date";
import { useRouter } from "next/navigation";
import { filterPeopleByAccess, getAccessContext } from "@/lib/access";
import { familyGroupOptions } from "@/lib/labels";
import type { ChurchEvent, DepartmentAssignment, PastoralTask, Person } from "@/lib/types";

type OverviewCard = {
  href: string;
  title: string;
  description: string;
  totalLabel: string;
  total: number;
  details: Array<[string, number]>;
};

export default function DashboardPage() {
  const router = useRouter();
  const [people, setPeople] = useState<Person[]>([]);
  const [tasks, setTasks] = useState<PastoralTask[]>([]);
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [departmentAssignments, setDepartmentAssignments] = useState<DepartmentAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      if (!supabase || !membrosDb) {
        setLoading(false);
        return;
      }
      const accessContext = await getAccessContext();
      if (accessContext.isMember) {
        router.replace("/membro");
        return;
      }
      if (accessContext.isLeader) {
        router.replace("/lider");
        return;
      }
      const [peopleResult, tasksResult, eventsResult, departmentsResult] = await Promise.all([
        membrosDb.from("people").select("*").order("created_at", { ascending: false }),
        membrosDb.from("pastoral_tasks").select("*, people(name, phone)").eq("status", "pendente").order("due_date"),
        membrosDb.from("events").select("*").gte("event_date", new Date().toISOString()).order("event_date").limit(6),
        membrosDb.from("department_assignments").select("*, people(id, name, preferred_name, phone)")
      ]);
      setPeople(filterPeopleByAccess((peopleResult.data ?? []) as Person[], accessContext));
      setTasks((tasksResult.data ?? []) as PastoralTask[]);
      setEvents((eventsResult.data ?? []) as ChurchEvent[]);
      setDepartmentAssignments((departmentsResult.data ?? []) as DepartmentAssignment[]);
      setLoading(false);
    }

    loadDashboardData();
  }, [router]);

  if (loading) {
    return (
      <PageShell>
        <div className="rounded-lg border border-line bg-white p-6 shadow-soft">
          <p className="text-sm font-semibold text-ink">Carregando seus dados...</p>
          <p className="mt-1 text-sm text-ink/60">Aguarde um instante enquanto abrimos o painel correto.</p>
        </div>
      </PageShell>
    );
  }

  const month = new Date().getMonth();
  const visitorsThisMonth = people.filter((person) => person.status === "visitante" && new Date(person.created_at).getMonth() === month);
  const birthdays = people.filter((person) => isBirthdayThisWeek(person.birth_date));
  const departments = buildDepartmentRows(people, departmentAssignments);
  const familyGroups = buildFamilyGroupRows(people);
  const assignments = buildAssignmentRows(people);
  const peopleInFamilyGroups = people.filter((person) => person.family_group).length;
  const peopleWithoutFamilyGroup = people.length - peopleInFamilyGroups;

  const stats: Array<[string, number, LucideIcon]> = [
    ["Pessoas cadastradas", people.length, Users],
    ["Visitantes do mes", visitorsThisMonth.length, HeartHandshake],
    ["Aniversariantes da semana", birthdays.length, CalendarDays]
  ];

  const overviewCards: OverviewCard[] = [
    {
      href: "/visao/departamentos",
      title: "Departamentos",
      description: "Acompanhe liderancas e pessoas por frente de trabalho.",
      totalLabel: "Pessoas em departamentos",
      total: new Set(departments.flatMap((item) => item.people.map((person) => person.id))).size,
      details: departments.slice(0, 4).map((item) => [item.title, item.people.length])
    },
    {
      href: "/visao/grupos-familiares",
      title: "Grupos Familiares",
      description: "Veja GFs, liderancas e quem ainda esta sem grupo.",
      totalLabel: "Pessoas em GF",
      total: peopleInFamilyGroups,
      details: [["Sem GF", peopleWithoutFamilyGroup] as [string, number], ...familyGroups.slice(0, 3).map((item) => [item.title, item.people.length] as [string, number])]
    },
    {
      href: "/visao/atribuicoes",
      title: "Atribuicoes pastorais",
      description: "Pessoas acompanhadas por lideres ou responsaveis diretos.",
      totalLabel: "Pessoas atribuidas",
      total: assignments.reduce((sum, item) => sum + item.people.length, 0),
      details: assignments.slice(0, 4).map((item) => [item.title, item.people.length])
    }
  ];

  return (
    <PageShell>
      <PageHeader
        title="Dashboard"
        description="Visao geral para entrar rapido nas areas de cuidado e gestao."
        action={<LinkButton href="/pessoas">Cadastrar pessoa</LinkButton>}
      />
      <SignupLinksCard showApprovals />

      <div className="grid gap-4 md:grid-cols-3">
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

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        {overviewCards.map((card) => (
          <OverviewSectionCard key={card.href} card={card} />
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 font-semibold">Tarefas pastorais pendentes</h3>
          <div className="space-y-3">
            {tasks.slice(0, 5).map((task) => (
              <div key={task.id} className="rounded-md border border-line p-3">
                <p className="font-medium">{task.title}</p>
                <p className="text-sm text-ink/60">{task.people?.name ?? "Sem pessoa vinculada"} - prazo {formatDate(task.due_date)}</p>
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
                <p className="text-sm text-ink/60">{formatDate(event.event_date)} - {event.location ?? "Local a definir"}</p>
              </div>
            ))}
            {events.length === 0 ? <p className="text-sm text-ink/60">Nenhum evento futuro cadastrado.</p> : null}
          </div>
        </Card>
      </div>
    </PageShell>
  );
}

function OverviewSectionCard({ card }: { card: OverviewCard }) {
  return (
    <Link href={card.href} className="block rounded-lg border border-line bg-white p-4 shadow-soft hover:bg-sage/50">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-ink">{card.title}</h3>
          <p className="mt-1 text-sm text-ink/60">{card.description}</p>
        </div>
        <Badge>{card.total}</Badge>
      </div>
      <p className="mt-4 text-xs font-semibold uppercase text-ink/50">{card.totalLabel}</p>
      <div className="mt-3 space-y-2">
        {card.details.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between rounded-md border border-line px-3 py-2">
            <p className="text-sm font-medium text-ink">{label}</p>
            <span className="text-sm font-bold text-moss">{value}</span>
          </div>
        ))}
        {card.details.length === 0 ? <p className="text-sm text-ink/60">Nenhum registro ainda.</p> : null}
      </div>
      <span className="mt-4 inline-flex w-full items-center justify-center rounded-md bg-moss px-3 py-2 text-sm font-semibold text-white">
        Abrir visao geral
      </span>
    </Link>
  );
}

function buildDepartmentRows(people: Person[], departmentAssignments: DepartmentAssignment[]) {
  const map = new Map<string, Person[]>();
  for (const person of people) {
    for (const department of person.departments ?? []) {
      map.set(department, [...(map.get(department) ?? []), person]);
    }
  }
  return Array.from(map.entries()).map(([title, members]) => ({
    title,
    subtitle: findSegmentLeader(title, members, departmentAssignments),
    people: members
  })).sort((a, b) => a.title.localeCompare(b.title));
}

function buildFamilyGroupRows(people: Person[]) {
  const map = new Map<string, Person[]>();
  for (const person of people.filter((item) => item.family_group)) {
    map.set(person.family_group!, [...(map.get(person.family_group!) ?? []), person]);
  }
  return Array.from(map.entries()).map(([title, members]) => ({
    title,
    subtitle: familyGroupOptions.find((group) => group.value === title)
      ? [familyGroupOptions.find((group) => group.value === title)?.leader, familyGroupOptions.find((group) => group.value === title)?.coLeader].filter(Boolean).join(" / ")
      : members.find((person) => person.family_group === title)?.family_group_leader ?? "Sem lider",
    people: members
  })).sort((a, b) => a.title.localeCompare(b.title));
}

function buildAssignmentRows(people: Person[]) {
  const map = new Map<string, Person[]>();
  for (const person of people.filter((item) => item.assigned_leader)) {
    map.set(person.assigned_leader!, [...(map.get(person.assigned_leader!) ?? []), person]);
  }
  return Array.from(map.entries()).map(([title, members]) => ({ title, subtitle: "Atribuicao", people: members })).sort((a, b) => a.title.localeCompare(b.title));
}

function findSegmentLeader(departmentName: string, members: Person[], departmentAssignments: DepartmentAssignment[]) {
  const configuredLeaders = departmentAssignments
    .filter((assignment) => assignment.department_name === departmentName && assignment.role === "lider")
    .map((assignment) => assignment.people?.preferred_name || assignment.people?.name)
    .filter(Boolean);
  if (configuredLeaders.length > 0) return configuredLeaders.join(" / ");
  const leader = members.find((person) => person.department_roles?.includes("Lider"));
  const coLeader = members.find((person) => person.department_roles?.includes("Co-Lider"));
  if (leader && coLeader) return `${leader.name} / ${coLeader.name}`;
  if (leader) return leader.name;
  if (coLeader) return coLeader.name;
  return "Sem lider definido";
}
