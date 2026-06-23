"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge, Card, PageHeader, PageShell } from "@/components/ui";
import { getAccessContext } from "@/lib/access";
import { familyGroupOptions } from "@/lib/labels";
import { membrosDb, supabase } from "@/lib/supabase";
import type { DepartmentAssignment, FamilyGroupAssignment, Person } from "@/lib/types";

type PageProps = {
  params: Promise<{ type: string }>;
};

type OverviewRow = {
  title: string;
  subtitle: string;
  people: Person[];
  href: string;
};

export default function OverviewPage({ params }: PageProps) {
  const [type, setType] = useState("");
  const [people, setPeople] = useState<Person[]>([]);
  const [departmentAssignments, setDepartmentAssignments] = useState<DepartmentAssignment[]>([]);
  const [familyGroupAssignments, setFamilyGroupAssignments] = useState<FamilyGroupAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then((value) => setType(value.type));
  }, [params]);

  useEffect(() => {
    async function load() {
      if (!supabase || !membrosDb || !type) return;
      await getAccessContext();
      const [peopleResult, assignmentsResult, familyGroupAssignmentsResult] = await Promise.all([
        membrosDb.from("people").select("*").order("name"),
        membrosDb.from("department_assignments").select("*, people(id, name, preferred_name, phone)"),
        membrosDb.from("family_group_assignments").select("*, people(id, name, preferred_name, phone)")
      ]);
      setPeople((peopleResult.data ?? []) as Person[]);
      setDepartmentAssignments((assignmentsResult.data ?? []) as DepartmentAssignment[]);
      setFamilyGroupAssignments((familyGroupAssignmentsResult.data ?? []) as FamilyGroupAssignment[]);
      setLoading(false);
    }
    load();
  }, [type]);

  const rows = useMemo(() => buildRows(type, people, departmentAssignments, familyGroupAssignments), [type, people, departmentAssignments, familyGroupAssignments]);
  const peopleInFamilyGroups = people.filter((person) => person.family_group).length;
  const peopleWithoutFamilyGroup = people.length - peopleInFamilyGroups;
  const title = getTitle(type);
  const description = getDescription(type, peopleInFamilyGroups, peopleWithoutFamilyGroup);

  if (loading) {
    return (
      <PageShell>
        <p className="text-sm text-ink/60">Carregando visao geral...</p>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader
        title={title}
        description={description}
        action={<Link href="/" className="inline-flex w-full items-center justify-center rounded-md bg-moss px-4 py-2.5 text-sm font-bold text-white shadow-soft hover:bg-moss/90 sm:w-auto">Voltar ao Dashboard</Link>}
      />

      {type === "grupos-familiares" ? (
        <div className="mb-4 grid gap-4 sm:grid-cols-2">
          <Card>
            <p className="text-sm text-ink/60">Pessoas em GF</p>
            <p className="mt-2 text-3xl font-bold text-ink">{peopleInFamilyGroups}</p>
          </Card>
          <Card>
            <p className="text-sm text-ink/60">Pessoas sem GF</p>
            <p className="mt-2 text-3xl font-bold text-ink">{peopleWithoutFamilyGroup}</p>
          </Card>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {rows.map((row) => (
          <Link key={row.href} href={row.href} className="block rounded-lg border border-line bg-white p-4 shadow-soft hover:bg-sage/50">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-ink">{row.title}</h3>
                <p className="mt-1 text-sm text-ink/60">{row.subtitle}</p>
              </div>
              <Badge>{row.people.length}</Badge>
            </div>
            <span className="mt-4 inline-flex w-full items-center justify-center rounded-md bg-moss px-3 py-2 text-sm font-semibold text-white">
              Ver contatos
            </span>
          </Link>
        ))}
        {rows.length === 0 ? <Card><p className="text-sm text-ink/60">Nenhum registro encontrado.</p></Card> : null}
      </div>
    </PageShell>
  );
}

function buildRows(type: string, people: Person[], departmentAssignments: DepartmentAssignment[], familyGroupAssignments: FamilyGroupAssignment[]) {
  if (type === "departamentos") return buildDepartmentRows(people, departmentAssignments);
  if (type === "grupos-familiares") return buildFamilyGroupRows(people, familyGroupAssignments);
  if (type === "atribuicoes") return buildAssignmentRows(people);
  return [];
}

function buildDepartmentRows(people: Person[], departmentAssignments: DepartmentAssignment[]): OverviewRow[] {
  const map = new Map<string, Person[]>();
  for (const person of people) {
    for (const department of person.departments ?? []) {
      map.set(department, [...(map.get(department) ?? []), person]);
    }
  }
  return Array.from(map.entries()).map(([title, members]) => ({
    title,
    subtitle: `Lider: ${findDepartmentLeaders(title, members, departmentAssignments)}`,
    people: members,
    href: `/segmentos/departamento/${encodeURIComponent(title)}`
  })).sort((a, b) => a.title.localeCompare(b.title));
}

function buildFamilyGroupRows(people: Person[], familyGroupAssignments: FamilyGroupAssignment[]): OverviewRow[] {
  const map = new Map<string, Person[]>();
  for (const person of people.filter((item) => item.family_group)) {
    map.set(person.family_group!, [...(map.get(person.family_group!) ?? []), person]);
  }
  return Array.from(map.entries()).map(([title, members]) => ({
    title,
    subtitle: `Lider: ${findFamilyGroupLeaders(title, members, familyGroupAssignments)}`,
    people: members,
    href: `/segmentos/grupo-familiar/${encodeURIComponent(title)}`
  })).sort((a, b) => a.title.localeCompare(b.title));
}

function buildAssignmentRows(people: Person[]): OverviewRow[] {
  const map = new Map<string, Person[]>();
  for (const person of people.filter((item) => item.assigned_leader)) {
    map.set(person.assigned_leader!, [...(map.get(person.assigned_leader!) ?? []), person]);
  }
  return Array.from(map.entries()).map(([title, members]) => ({
    title,
    subtitle: "Atribuicao direta",
    people: members,
    href: `/segmentos/atribuicao/${encodeURIComponent(title)}`
  })).sort((a, b) => a.title.localeCompare(b.title));
}

function findDepartmentLeaders(departmentName: string, members: Person[], departmentAssignments: DepartmentAssignment[]) {
  const configuredLeaders = departmentAssignments
    .filter((assignment) => assignment.department_name === departmentName && assignment.role === "lider")
    .map((assignment) => assignment.people?.preferred_name || assignment.people?.name)
    .filter(Boolean);
  if (configuredLeaders.length > 0) return configuredLeaders.join(" / ");
  const leader = members.find((person) => person.department_roles?.includes("Lider"));
  return leader?.preferred_name || leader?.name || "Sem lider definido";
}

function findFamilyGroupLeaders(groupName: string, members: Person[], familyGroupAssignments: FamilyGroupAssignment[]) {
  const configuredLeaders = familyGroupAssignments
    .filter((assignment) => assignment.family_group === groupName && assignment.role === "lider")
    .map((assignment) => assignment.people?.preferred_name || assignment.people?.name)
    .filter(Boolean);
  if (configuredLeaders.length > 0) return configuredLeaders.join(" / ");
  const group = familyGroupOptions.find((option) => option.value === groupName);
  if (group?.leader && group.coLeader) return `${group.leader} / ${group.coLeader}`;
  if (group?.leader) return group.leader;
  return members.find((person) => person.family_group === groupName)?.family_group_leader ?? "Sem lider definido";
}

function getTitle(type: string) {
  if (type === "departamentos") return "Departamentos";
  if (type === "grupos-familiares") return "Grupos Familiares";
  if (type === "atribuicoes") return "Atribuicoes pastorais";
  return "Visao geral";
}

function getDescription(type: string, peopleInFamilyGroups: number, peopleWithoutFamilyGroup: number) {
  if (type === "departamentos") return "Todos os departamentos, liderancas e quantidade de participantes.";
  if (type === "grupos-familiares") return `${peopleInFamilyGroups} pessoas em GF e ${peopleWithoutFamilyGroup} pessoas sem GF.`;
  if (type === "atribuicoes") return "Pessoas acompanhadas por lideres ou responsaveis diretos.";
  return "Resumo da area selecionada.";
}
