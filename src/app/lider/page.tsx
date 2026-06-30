"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Badge, Card, PageHeader, PageShell } from "@/components/ui";
import { SignupLinksCard } from "@/components/signup-links-card";
import { filterPeopleByAccess, getAccessContext } from "@/lib/access";
import { formatBirthdayRadar, formatDate, isBirthdayThisWeek } from "@/lib/date";
import { personStatusLabels } from "@/lib/labels";
import { membrosDb, supabase } from "@/lib/supabase";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import type { AccessContext, DepartmentAssignment, PastoralTask, Person } from "@/lib/types";

type LeadershipSegment = {
  key: string;
  title: string;
  type: "departamento" | "grupo-familiar" | "atribuicao";
  count: number;
};

export default function LiderHomePage() {
  const [access, setAccess] = useState<AccessContext | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [allPeople, setAllPeople] = useState<Person[]>([]);
  const [birthdayPeople, setBirthdayPeople] = useState<Person[]>([]);
  const [departmentAssignments, setDepartmentAssignments] = useState<DepartmentAssignment[]>([]);
  const [tasks, setTasks] = useState<PastoralTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!supabase || !membrosDb) return;
      const ctx = await getAccessContext();
      setAccess(ctx);

      const [peopleResult, tasksResult, assignmentsResult, birthdayResult] = await Promise.all([
        membrosDb.from("people").select("*").order("name"),
        membrosDb.from("pastoral_tasks").select("*, people(name, phone)").eq("status", "pendente").order("due_date"),
        membrosDb.from("department_assignments").select("*, people(id, name, preferred_name, phone)").eq("role", "lider"),
        membrosDb.rpc("birthday_directory")
      ]);

      const allPeopleData = (peopleResult.data ?? []) as Person[];
      const filtered = filterPeopleByAccess(allPeopleData, ctx);
      setAllPeople(allPeopleData);
      setBirthdayPeople((birthdayResult.data ?? []) as Person[]);
      setPeople(filtered);
      setDepartmentAssignments((assignmentsResult.data ?? []) as DepartmentAssignment[]);

      const myTasks = ((tasksResult.data ?? []) as PastoralTask[]).filter(
        (task) => task.responsible === ctx.person?.name
      );
      setTasks(myTasks);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <PageShell><p className="text-sm text-ink/60">Carregando...</p></PageShell>;

  const birthdays = birthdayPeople.filter((person) => isBirthdayThisWeek(person.birth_date, person.birth_day, person.birth_month));
  const leaderName = access?.person?.preferred_name || access?.person?.name || "Lider";
  const familyGroup = access?.person?.family_group || "Sem grupo familiar cadastrado";
  const leadershipSegments = buildLeadershipSegments(access, people, allPeople, departmentAssignments);
  const personName = access?.person?.name;
  const personPreferredName = access?.person?.preferred_name;
  const familyGroupsLed = allPeople
    .filter((item) => item.family_group && isLeaderNameMatch(item.family_group_leader, personName, personPreferredName))
    .map((item) => item.family_group as string)
    .filter((value, index, self) => self.indexOf(value) === index);

  return (
    <PageShell>
      <PageHeader
        title={`Ola, ${leaderName}`}
        description="Visao geral dos grupos, departamentos e tarefas sob seu cuidado."
      />

      {access?.person?.id ? (
        <Link href={`/pessoas/${access.person.id}`} className="mb-6 inline-flex w-full justify-center rounded-md bg-moss px-3 py-2.5 text-sm font-semibold text-white hover:bg-moss/90 sm:w-auto">
          Editar meus dados
        </Link>
      ) : null}

      <SignupLinksCard />

<div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 font-semibold">Departamentos que lidero</h3>
          <div className="space-y-2">
            {leadershipSegments.map((segment) => (
              <Link
                key={segment.key}
                href={`/segmentos/${segment.type}/${encodeURIComponent(segment.title)}`}
                className="flex items-center justify-between rounded-md border border-line px-3 py-2.5 hover:bg-sage"
              >
                <div>
                  <p className="text-sm font-semibold text-ink">{segment.title}</p>
                  <p className="text-xs text-ink/60">{segmentLabel(segment.type)}</p>
                </div>
                <Badge>{segment.count}</Badge>
              </Link>
            ))}
            {leadershipSegments.length === 0 ? <p className="text-sm text-ink/60">Nenhum grupo ou departamento atribuido como lider.</p> : null}
          </div>
        </Card>
        {(access?.person?.departments?.length ?? 0) > 0 ? (
          <Card>
            <h3 className="mb-3 font-semibold">Departamentos que participo</h3>
            <div className="space-y-2">
              {(access?.person?.departments ?? []).map((deptName) => {
                const count = allPeople.filter((item) => item.departments?.includes(deptName)).length;
                return (
                  <Link
                    key={deptName}
                    href={`/segmentos/departamento/${encodeURIComponent(deptName)}`}
                    className="flex items-center justify-between rounded-md border border-line px-3 py-2.5 hover:bg-sage"
                  >
                    <div>
                      <p className="text-sm font-semibold text-ink">{deptName}</p>
                      <p className="text-xs text-ink/60">Participante</p>
                    </div>
                    <Badge>{count}</Badge>
                  </Link>
                );
              })}
            </div>
          </Card>
        ) : null}
        {familyGroupsLed.length > 0 ? (
          <Card>
            <h3 className="mb-3 font-semibold">Grupos Familiares que lidero</h3>
            <div className="space-y-2">
              {familyGroupsLed.map((groupName) => {
                const count = allPeople.filter((item) => item.family_group === groupName).length;
                return (
                  <Link
                    key={`grupo-${groupName}`}
                    href={`/segmentos/grupo-familiar/${encodeURIComponent(groupName)}`}
                    className="flex items-center justify-between rounded-md border border-line px-3 py-2.5 hover:bg-sage"
                  >
                    <div>
                      <p className="text-sm font-semibold text-ink">{groupName}</p>
                      <p className="text-xs text-ink/60">Grupo Familiar</p>
                    </div>
                    <Badge>{count}</Badge>
                  </Link>
                );
              })}
            </div>
          </Card>
        ) : null}

        {access?.person?.family_group ? (
          <Card>
            <h3 className="mb-3 font-semibold">Meu Grupo Familiar</h3>
            <div className="rounded-md border border-line px-3 py-2.5">
              <p className="text-sm font-semibold text-ink">{access.person.family_group}</p>
              <p className="mt-1 text-xs text-ink/60">Lider: {access.person.family_group_leader || "Nao informado"}</p>
            </div>
          </Card>
        ) : null}

        <Card>
          <h3 className="mb-3 font-semibold">Aniversariantes da semana</h3>
          {birthdays.length > 0 ? (
            <div className="space-y-2">
              {birthdays.map((person) => (
                <div key={person.id} className="flex items-center justify-between rounded-md border border-line px-3 py-2.5">
                  <div>
                    <p className="text-sm font-semibold text-ink">{person.preferred_name || person.name}</p>
                    <p className="text-xs text-ink/60">{formatBirthdayRadar(person.birth_date, person.birth_day, person.birth_month)}</p>
                  </div>
                  <a
                    href={buildWhatsAppUrl(person.phone, `Feliz aniversario ${person.preferred_name || person.name}! Que Deus te abencoe muito!`)}
                    target="_blank"
                    className="rounded-md border border-line p-2 text-moss hover:bg-sage"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </a>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-ink/60">Nenhum aniversariante nesta semana.</p>}
        </Card>

        {tasks.length > 0 ? (
          <Card>
            <h3 className="mb-3 font-semibold">Minhas tarefas pastorais</h3>
            <div className="space-y-2">
              {tasks.map((task) => (
                <div key={task.id} className="rounded-md border border-line px-3 py-2.5">
                  <p className="text-sm font-semibold text-ink">{task.title}</p>
                  <p className="text-xs text-ink/60">{task.people?.name ?? "Sem pessoa"} - prazo {formatDate(task.due_date ?? "")}</p>
                </div>
              ))}
            </div>
          </Card>
        ) : null}

        <Card>
          <h3 className="mb-3 font-semibold">Pessoas que estou discipulando</h3>
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
                <div className="ml-2 flex items-center gap-2">
                  <a href={buildWhatsAppUrl(person.phone, `Ola ${person.preferred_name || person.name}, paz!`)} target="_blank" className="rounded-md border border-line p-2 text-moss hover:bg-sage">
                    <MessageCircle className="h-4 w-4" />
                  </a>
                  <Link href={`/pessoas/${person.id}`} className="rounded-md border border-line px-2.5 py-1.5 text-xs font-semibold text-ink hover:bg-sage">
                    Ver
                  </Link>
                </div>
              </div>
            ))}
            {people.length === 0 ? <p className="text-sm text-ink/60">Nenhuma pessoa atribuida ao seu grupo.</p> : null}
          </div>
        </Card>
      </div>
    </PageShell>
  );
}

function buildLeadershipSegments(
  access: AccessContext | null,
  people: Person[],
  allPeople: Person[],
  departmentAssignments: DepartmentAssignment[]
) {
  const person = access?.person;
  const profilePersonId = access?.profile?.person_id;
  const personName = person?.name;
  const personPreferredName = person?.preferred_name;
  const segments = new Map<string, LeadershipSegment>();

  for (const assignment of departmentAssignments) {
    if (assignment.person_id !== profilePersonId) continue;
    const count = allPeople.filter((item) => item.departments?.includes(assignment.department_name)).length;
    segments.set(`departamento-${assignment.department_name}`, {
      key: `departamento-${assignment.department_name}`,
      title: assignment.department_name,
      type: "departamento",
      count
    });
  }

  for (const scope of access?.scopes ?? []) {
    if (scope.scope_type === "departamento") {
      const count = people.filter((item) => item.departments?.includes(scope.scope_value)).length;
      segments.set(`departamento-${scope.scope_value}`, {
        key: `departamento-${scope.scope_value}`,
        title: scope.scope_value,
        type: "departamento",
        count
      });
    }
    if (scope.scope_type === "grupo_familiar") {
      const count = people.filter((item) => item.family_group === scope.scope_value).length;
      segments.set(`grupo-${scope.scope_value}`, {
        key: `grupo-${scope.scope_value}`,
        title: scope.scope_value,
        type: "grupo-familiar",
        count
      });
    }
  }

  const familyGroupsLed = allPeople
    .filter((item) => item.family_group && isLeaderNameMatch(item.family_group_leader, personName, personPreferredName))
    .map((item) => item.family_group as string);

  for (const groupName of Array.from(new Set(familyGroupsLed))) {
    const count = allPeople.filter((item) => item.family_group === groupName).length;
    segments.set(`grupo-${groupName}`, {
      key: `grupo-${groupName}`,
      title: groupName,
      type: "grupo-familiar",
      count
    });
  }

  if (personName) {
    const assignedCount = allPeople.filter((item) => item.assigned_leader === personName || item.assigned_leader === personPreferredName).length;
    if (assignedCount > 0) {
      segments.set(`atribuicao-${personName}`, {
        key: `atribuicao-${personName}`,
        title: personName,
        type: "atribuicao",
        count: assignedCount
      });
    }
  }

  return Array.from(segments.values()).sort((a, b) => a.title.localeCompare(b.title));
}

function isLeaderNameMatch(value?: string | null, name?: string | null, preferredName?: string | null) {
  if (!value) return false;
  const normalized = normalizeText(value);
  return [name, preferredName].filter(Boolean).some((candidate) => normalized.includes(normalizeText(candidate ?? "")));
}

function normalizeText(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function segmentLabel(type: LeadershipSegment["type"]) {
  if (type === "departamento") return "Departamento";
  if (type === "grupo-familiar") return "Grupo Familiar";
  return "Atribuicao direta";
}
