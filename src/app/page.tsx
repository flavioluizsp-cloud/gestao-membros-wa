"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle, Users } from "lucide-react";
import { Badge, Card, LinkButton, PageHeader, PageShell } from "@/components/ui";
import { SignupLinksCard } from "@/components/signup-links-card";
import { membrosDb, supabase } from "@/lib/supabase";
import { formatBirthdayRadar, isBirthdayThisWeek } from "@/lib/date";
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
    const maleNames = ["jose","joao","pedro","paulo","marcos","lucas","mateus","andre","felipe","carlos","antonio","francisco","raimundo","manoel","joaquim","jorge","roberto","fernando","marcelo","rafael","daniel","gabriel","samuel","elias","davi","isaias","jeremias","ezequiel","amos","oseas","miqueas","naum","habacuque","sofonias","ageu","zacarias","malaquias","joel","obadias","jonas","rufus","tiago","simao","bartolomeu","natanael","timoteo","tito","filemom","estevao","filipe","nicodemos","lazaro","zaqueu","cornelio","barnabe","silas","clemente","onesifo","aristarco","gaio","epafras","trofimo","tiquico","crescente","demas","hermas","hermes","patrobas","filolo","olimpas","nereo","junias","andronicus","herodion","sosipater","lucio","jasao","sosipater","tertio","erasto","quarto","fortunato","acaico","estafanas"];
  const guessGender = (name: string) => {
    const first = name.trim().split(" ")[0].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return maleNames.includes(first) ? "M" : "F";
  };
  const males = people.filter((p) => guessGender(p.name) === "M").length;
  const females = people.filter((p) => guessGender(p.name) === "F").length;
  const getAge = (p: Person) => {
    const d = p.birth_date ? new Date(p.birth_date) : null;
    if (!d) return null;
    const age = new Date().getFullYear() - d.getFullYear();
    return age;
  };
  const children = people.filter((p) => { const a = getAge(p); return a !== null && a <= 12; }).length;
  const youth = people.filter((p) => { const a = getAge(p); return a !== null && a >= 13 && a <= 25; }).length;
  const adults = people.filter((p) => { const a = getAge(p); return a !== null && a >= 26 && a <= 59; }).length;
  const seniors = people.filter((p) => { const a = getAge(p); return a !== null && a >= 60; }).length;
  const noAge = people.filter((p) => getAge(p) === null).length;
  const married = people.filter((p) => p.marital_status === "casado").length;
  const single = people.filter((p) => p.marital_status === "solteiro").length;
  const otherMarital = people.filter((p) => p.marital_status && p.marital_status !== "casado" && p.marital_status !== "solteiro").length;
  const baptized = people.filter((p) => p.is_baptized).length;
  const notBaptized = people.filter((p) => !p.is_baptized).length;
  const withGF = people.filter((p) => p.family_group).length;
  const withoutGF = people.filter((p) => !p.family_group).length;

  return (
      <PageShell>
        <div className="rounded-lg border border-line bg-white p-6 shadow-soft">
          <p className="text-sm font-semibold text-ink">Carregando seus dados...</p>
          <p className="mt-1 text-sm text-ink/60">Aguarde um instante enquanto abrimos o painel correto.</p>
        </div>
      </PageShell>
    );
  }

  const birthdays = people.filter((person) => isBirthdayThisWeek(person.birth_date, person.birth_day, person.birth_month));
  const birthdaysVisible = birthdays.filter((p) => p.status !== "afastado" && p.status !== "transferido");
  const birthdaysHidden = birthdays.filter((p) => p.status === "afastado" || p.status === "transferido");
  const departments = buildDepartmentRows(people, departmentAssignments);
  const familyGroups = buildFamilyGroupRows(people, familyGroupAssignments);
  const peopleInFamilyGroups = people.filter((person) => person.family_group).length;
  const peopleWithoutFamilyGroup = people.length - peopleInFamilyGroups;
  const approvedPeople = people.filter((person) => !person.pending_approval).length;
  const countVisitante = people.filter((person) => person.status === "visitante").length;
  const countFrequentador = people.filter((person) => person.status === "frequentador").length;
  const countMembroDependente = people.filter((person) => person.status === "membro_dependente").length;
  const countMembro = people.filter((person) => person.status === "membro").length;
  const countAfastado = people.filter((person) => person.status === "afastado").length;
  const countTransferido = people.filter((person) => person.status === "transferido").length;
  const totalCongregants = countMembro + countMembroDependente + countFrequentador;

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

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-ink">Pessoas</h3>
            <p className="mt-1 text-sm text-ink/60">Visao geral dos cadastros da igreja.</p>
          </div>
          <Users className="h-5 w-5 text-moss" />
        </div>
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {[
              ["Visitante", countVisitante, "visitante"],
              ["Frequentador", countFrequentador, "frequentadores"],
              ["Membro Dep.", countMembroDependente, "membro_dependente"],
              ["Membro", countMembro, "membros"],
              ["Afastado", countAfastado, "afastado"],
              ["Transferido", countTransferido, "transferido"],
            ].map(([label, value, filter]) => (
              <Link key={String(label)} href={`/pessoas?filtro=${filter}`} className="rounded-md border border-line bg-white px-2 py-2.5 text-center hover:border-moss hover:bg-sage">
                <p className="text-xs text-ink/60 leading-tight">{label}</p>
                <p className="mt-1.5 text-xl font-bold text-ink">{value}</p>
              </Link>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-md border border-line bg-sage px-3 py-2.5 text-center">
              <p className="text-xs text-ink/60">Total cadastros</p>
              <p className="mt-1 text-lg font-bold text-ink">{approvedPeople}</p>
            </div>
            <div className="rounded-md border border-line bg-sage px-3 py-2.5 text-center">
              <p className="text-xs text-ink/60">Presenca total</p>
              <p className="mt-1 text-lg font-bold text-ink">{totalCongregants}</p>
            </div>
          </div>
        </div>
        <Link href="/pessoas" className="mt-4 inline-flex w-full items-center justify-center rounded-md border border-line px-3 py-2 text-sm font-semibold text-moss hover:bg-sage">
          Abrir Pessoas
        </Link>
      </Card>

      <DemographicsCard people={people} />
      <BirthdaysCard birthdays={birthdaysVisible} hiddenBirthdays={birthdaysHidden} />
    </PageShell>
  );
}

function BirthdaysCard({ birthdays, hiddenBirthdays = [] }: { birthdays: Person[]; hiddenBirthdays?: Person[] }) {
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

function DemographicsCard({ people }: { people: Person[] }) {
  const maleNames = ["jose","joao","pedro","paulo","marcos","lucas","mateus","andre","felipe","carlos","antonio","francisco","raimundo","manoel","joaquim","jorge","roberto","fernando","marcelo","rafael","daniel","gabriel","samuel","elias","davi","isaias","jeremias","ezequiel","amos","oseas","miqueas","naum","habacuque","sofonias","ageu","zacarias","malaquias","joel","obadias","jonas","rufus","tiago","simao","bartolomeu","natanael","timoteo","tito","filemom","estevao","filipe","nicodemos","lazaro","zaqueu","cornelio","barnabe","silas","clemente","onesifo","aristarco","gaio","epafras","trofimo","tiquico","crescente","demas","hermas","hermes","patrobas","filolo","olimpas","nereo","junias","andronicus","herodion","sosipater","lucio","jasao","sosipater","tertio","erasto","quarto","fortunato","acaico","estafanas"];
  const guessGender = (name: string) => {
    const first = name.trim().split(" ")[0].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return maleNames.includes(first) ? "M" : "F";
  };
  const males = people.filter((p) => guessGender(p.name) === "M").length;
  const females = people.filter((p) => guessGender(p.name) === "F").length;
  const getAge = (p: Person) => {
    const d = p.birth_date ? new Date(p.birth_date) : null;
    if (!d) return null;
    return new Date().getFullYear() - d.getFullYear();
  };
  const children = people.filter((p) => { const a = getAge(p); return a !== null && a <= 12; }).length;
  const youth = people.filter((p) => { const a = getAge(p); return a !== null && a >= 13 && a <= 25; }).length;
  const adults = people.filter((p) => { const a = getAge(p); return a !== null && a >= 26 && a <= 59; }).length;
  const seniors = people.filter((p) => { const a = getAge(p); return a !== null && a >= 60; }).length;
  const noAge = people.filter((p) => getAge(p) === null).length;
  const married = people.filter((p) => p.marital_status === "casado").length;
  const single = people.filter((p) => p.marital_status === "solteiro").length;
  const otherMarital = people.filter((p) => p.marital_status && p.marital_status !== "casado" && p.marital_status !== "solteiro").length;
  const baptized = people.filter((p) => p.is_baptized).length;
  const notBaptized = people.filter((p) => !p.is_baptized).length;
  const withGF = people.filter((p) => p.family_group).length;
  const withoutGF = people.filter((p) => !p.family_group).length;

  type StatItem = { label: string; value: number; href?: string };
  const Section = ({ title, items }: { title: string; items: StatItem[] }) => (
    <div>
      <p className="mb-2 text-sm font-semibold text-ink border-b border-line pb-1">{title}</p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
        {items.map(({ label, value, href }) => {
          const content = (
            <>
              <p className="text-xs text-ink/60 leading-tight">{label}</p>
              <p className="mt-1.5 text-xl font-bold text-ink">{value}</p>
            </>
          );
          return href ? (
            <a key={label} href={href} className="rounded-md border border-line bg-white px-2 py-3 text-center hover:border-moss hover:bg-sage">{content}</a>
          ) : (
            <div key={label} className="rounded-md border border-line bg-white px-2 py-3 text-center">{content}</div>
          );
        })}
      </div>
    </div>
  );

  return (
    <Card className="mt-6">
      <h3 className="mb-5 font-semibold text-ink">Analise demografica</h3>
      <div className="space-y-5">
        <Section title="Genero (estimado pelo nome)" items={[
          { label: "Homens", value: males },
          { label: "Mulheres", value: females },
        ]} />
        <Section title="Faixa etaria" items={[
          { label: "Criancas 0-12", value: children, href: "/pessoas?filtro=criancas" },
          { label: "Jovens 13-25", value: youth, href: "/pessoas?filtro=jovens" },
          { label: "Adultos 26-59", value: adults },
          { label: "Idosos 60+", value: seniors },
          { label: "Sem idade", value: noAge, href: "/pessoas?filtro=sem_aniversario" },
        ]} />
        <Section title="Estado civil" items={[
          { label: "Casados", value: married },
          { label: "Solteiros", value: single },
          { label: "Outros", value: otherMarital },
        ]} />
        <Section title="Batismo" items={[
          { label: "Batizados", value: baptized },
          { label: "Nao batizados", value: notBaptized, href: "/pessoas?filtro=sem_batismo" },
        ]} />
        <Section title="Grupos Familiares" items={[
          { label: "Com GF", value: withGF },
          { label: "Sem GF", value: withoutGF, href: "/pessoas?filtro=sem_gf" },
        ]} />
      </div>
    </Card>
  );
}