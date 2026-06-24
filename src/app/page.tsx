"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle, Users } from "lucide-react";
import { Badge, Card, LinkButton, PageHeader, PageShell } from "@/components/ui";
import { SignupLinksCard } from "@/components/signup-links-card";
import { membrosDb, supabase } from "@/lib/supabase";
import { isBirthdayThisWeek } from "@/lib/date";
import { useRouter } from "next/navigation";
import { filterPeopleByAccess, getAccessContext } from "@/lib/access";
import { familyGroupOptions } from "@/lib/labels";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import type { DepartmentAssignment, FamilyGroupAssignment, Person } from "@/lib/types";

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
  const [departmentAssignments, setDepartmentAssignments] = useState<DepartmentAssignment[]>([]);
  const [familyGroupAssignments, setFamilyGroupAssignments] = useState<FamilyGroupAssignment[]>([]);
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
      const [peopleResult, departmentsResult, familyGroupsResult] = await Promise.all([
        membrosDb.from("people").select("*").order("created_at", { ascending: false }),
        membrosDb.from("department_assignments").select("*, people(id, name, preferred_name, phone)"),
        membrosDb.from("family_group_assignments").select("*, people(id, name, preferred_name, phone)")
      ]);
      setPeople(filterPeopleByAccess((peopleResult.data ?? []) as Person[], accessContext));
      setDepartmentAssignments((departmentsResult.data ?? []) as DepartmentAssignment[]);
      setFamilyGroupAssignments((familyGroupsResult.data ?? []) as FamilyGroupAssignment[]);
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

  const birthdays = people.filter((person) => isBirthdayThisWeek(person.birth_date));
  const departments = buildDepartmentRows(people, departmentAssignments);
  const familyGroups = buildFamilyGroupRows(people, familyGroupAssignments);
  const peopleInFamilyGroups = people.filter((person) => person.family_group).length;
  const peopleWithoutFamilyGroup = people.length - peopleInFamilyGroups;
  const approvedPeople = people.filter((person) => !person.pending_approval).length;
  const members = people.filter((person) => person.status === "membro").length;
  const regularAttendees = people.filter((person) => person.status === "frequentador").length;

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

      <Card className="mb-6">
        <h3 className="mb-3 font-semibold text-ink">Acessos rapidos</h3>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/pessoas" className="rounded-md border border-line px-3 py-2.5 text-center text-sm font-semibold text-ink hover:bg-sage">
            Pessoas
          </Link>
          <Link href="/departamentos" className="rounded-md border border-line px-3 py-2.5 text-center text-sm font-semibold text-ink hover:bg-sage">
            Gerenciar departamentos
          </Link>
          <Link href="/grupos-familiares" className="rounded-md border border-line px-3 py-2.5 text-center text-sm font-semibold text-ink hover:bg-sage">
            Gerenciar GFs
          </Link>
          <Link href="/admin/aprovacoes" className="rounded-md border border-line px-3 py-2.5 text-center text-sm font-semibold text-ink hover:bg-sage">
            Aprovacoes
          </Link>
        </div>
      </Card>

      <Link href="/pessoas" className="block">
        <Card className="hover:bg-sage/40">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-ink">Pessoas</h3>
              <p className="mt-1 text-sm text-ink/60">Visao geral dos cadastros da igreja.</p>
            </div>
            <Users className="h-5 w-5 text-moss" />
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              ["Pessoas cadastradas", approvedPeople],
              ["Membros", members],
              ["Frequentadores", regularAttendees],
              ["Total geral", people.length]
            ].map(([label, value]) => (
              <div key={label} className="rounded-md border border-line bg-white px-3 py-3">
                <p className="text-xs font-medium text-ink/60">{label}</p>
                <p className="mt-2 text-2xl font-bold text-ink">{value}</p>
              </div>
            ))}
          </div>
          <span className="mt-4 inline-flex w-full items-center justify-center rounded-md border border-line px-3 py-2 text-sm font-semibold text-moss">
            Abrir Pessoas
          </span>
        </Card>
      </Link>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        {overviewCards.map((card) => (
          <OverviewSectionCard key={card.href} card={card} />
        ))}
      </div>

      <BirthdaysCard birthdays={birthdays} />
    </PageShell>
  );
}

function BirthdaysCard({ birthdays }: { birthdays: Person[] }) {
  return (
    <Card className="mt-6">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-ink">Aniversariantes da semana</h3>
        <Badge>{birthdays.length}</Badge>
      </div>
      <div className="space-y-2">
        {birthdays.map((person) => (
          <div key={person.id} className="flex items-center justify-between rounded-md border border-line px-3 py-2.5">
            <div>
              <p className="text-sm font-semibold text-ink">{person.preferred_name || person.name}</p>
              <p className="text-xs text-ink/60">{formatBirthdayForDashboard(person.birth_date)}</p>
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
        {birthdays.length === 0 ? <p className="text-sm text-ink/60">Nenhum aniversariante nesta semana.</p> : null}
      </div>
    </Card>
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

function buildFamilyGroupRows(people: Person[], familyGroupAssignments: FamilyGroupAssignment[]) {
  const map = new Map<string, Person[]>();
  for (const person of people.filter((item) => item.family_group)) {
    map.set(person.family_group!, [...(map.get(person.family_group!) ?? []), person]);
  }
  return Array.from(map.entries()).map(([title, members]) => ({
    title,
    subtitle: findFamilyGroupLeaders(title, members, familyGroupAssignments),
    people: members
  })).sort((a, b) => a.title.localeCompare(b.title));
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
  return members.find((person) => person.family_group === groupName)?.family_group_leader ?? "Sem lider";
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

function formatBirthdayForDashboard(date?: string | null) {
  if (!date) return "-";
  const birthday = new Date(date);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const currentBirthday = new Date(now.getFullYear(), birthday.getUTCMonth(), birthday.getUTCDate());
  if (currentBirthday < today) currentBirthday.setFullYear(now.getFullYear() + 1);

  const day = String(currentBirthday.getDate()).padStart(2, "0");
  const month = String(currentBirthday.getMonth() + 1).padStart(2, "0");
  const weekday = new Intl.DateTimeFormat("pt-BR", { weekday: "long" }).format(currentBirthday);
  return `${day}/${month} - ${weekday}`;
}
