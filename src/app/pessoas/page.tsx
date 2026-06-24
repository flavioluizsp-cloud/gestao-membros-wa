"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpDown, MessageCircle, Plus } from "lucide-react";
import { Badge, Card, EmptyState, Field, inputClass, PageHeader, PageShell } from "@/components/ui";
import { filterPeopleByAccess, getAccessContext } from "@/lib/access";
import { formatBirthDate } from "@/lib/date";
import { personStatusLabels } from "@/lib/labels";
import { membrosDb, supabase } from "@/lib/supabase";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import type { AccessContext, Person } from "@/lib/types";

function normalizeName(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[áàâãä]/gi, "a")
    .replace(/[éèêë]/gi, "e")
    .replace(/[íìîï]/gi, "i")
    .replace(/[óòôõö]/gi, "o")
    .replace(/[úùûü]/gi, "u")
    .replace(/ç/gi, "c")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("pt-BR");
}

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [access, setAccess] = useState<AccessContext | null>(null);
  const [search, setSearch] = useState("");
  const [dashboardFilter, setDashboardFilter] = useState("");
  const [missingFilter, setMissingFilter] = useState("");
  const [sortBy, setSortBy] = useState<"name_asc" | "name_desc" | "recent" | "oldest">("name_asc");

  useEffect(() => {
    setDashboardFilter(new URLSearchParams(window.location.search).get("filtro") ?? "");

    async function loadPeople() {
      if (!supabase || !membrosDb) return;
      const access = await getAccessContext();
      setAccess(access);
      const { data } = await membrosDb.from("people").select("*").order("name");
      setPeople(filterPeopleByAccess((data ?? []) as Person[], access));
    }

    loadPeople();
  }, []);

  const normalizedSearch = normalizeName(search.trim());
  const filteredPeople = useMemo(() => {
    const statusMatches = people.filter((person) => {
      if (dashboardFilter === "cadastradas") return !person.pending_approval;
      if (dashboardFilter === "membros") return person.status === "membro";
      if (dashboardFilter === "membro_dependente") return person.status === "membro_dependente";
      if (dashboardFilter === "frequentadores") return person.status === "frequentador";
      if (dashboardFilter === "visitante") return person.status === "visitante";
      if (dashboardFilter === "afastado") return person.status === "afastado";
      if (dashboardFilter === "transferido") return person.status === "transferido";
      return true;
    });
    const pendingMatches = statusMatches.filter((person) => {
      if (missingFilter === "sem_gf") return !person.family_group;
      if (missingFilter === "sem_aniversario") return !person.birth_date && (!person.birth_day || !person.birth_month);
      if (missingFilter === "sem_email") return !person.email?.trim();
      if (missingFilter === "sem_telefone") return !person.phone?.trim();
      if (missingFilter === "sem_familia") return (person.family_members ?? []).length === 0;
      if (missingFilter === "sem_departamento") return (person.departments ?? []).length === 0;
      if (missingFilter === "sem_cidade") return !person.birth_city?.trim();
      if (missingFilter === "sem_batismo") return !person.is_baptized && !person.baptism_date && !person.baptism_church;
      const getAge = (p: typeof person) => {
        if (!p.birth_date) return null;
        const d = new Date(p.birth_date);
        if (isNaN(d.getTime())) return null;
        const today = new Date();
        let age = today.getFullYear() - d.getFullYear();
        const m = today.getMonth() - d.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
        return age;
      };
      if (missingFilter === "criancas") { const a = getAge(person); return a !== null && a <= 12; }
      if (missingFilter === "jovens") { const a = getAge(person); return a !== null && a >= 13 && a <= 25; }
      if (missingFilter === "adultos") { const a = getAge(person); return a !== null && a >= 26 && a <= 59; }
      if (missingFilter === "idosos") { const a = getAge(person); return a !== null && a >= 60; }
      if (missingFilter === "casado") return person.marital_status === "casado";
      if (missingFilter === "solteiro") return person.marital_status === "solteiro";
      if (missingFilter === "batizados") return Boolean(person.is_baptized);
      if (missingFilter === "com_gf") return Boolean(person.family_group);
      if (missingFilter === "gender_m") return person.gender === "M";
      if (missingFilter === "gender_f") return person.gender === "F";
      if (missingFilter === "gender_none") return !person.gender;
      return true;
    });
    const matches = normalizedSearch
      ? pendingMatches.filter((person) => {
          const haystack = normalizeName([person.name, person.preferred_name].filter(Boolean).join(" "));
          return haystack.includes(normalizedSearch);
        })
      : pendingMatches;

    return [...matches].sort((a, b) => {
      const nameA = (a.preferred_name || a.name).trim();
      const nameB = (b.preferred_name || b.name).trim();

      if (sortBy === "name_desc") return nameB.localeCompare(nameA, "pt-BR");
      if (sortBy === "recent") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return nameA.localeCompare(nameB, "pt-BR");
    });
  }, [dashboardFilter, missingFilter, normalizedSearch, people, sortBy]);

  const filterLabels: Record<string, string> = {
    cadastradas: "Pessoas cadastradas",
    membros: "Membros",
    membro_dependente: "Membros dependentes",
    frequentadores: "Frequentadores",
    visitante: "Visitantes",
    afastado: "Afastados",
    transferido: "Transferidos",
    criancas: "Criancas (0-12)",
    jovens: "Jovens (13-25)",
    adultos: "Adultos (26-59)",
    idosos: "Idosos (60+)",
    casado: "Casados",
    solteiro: "Solteiros",
    batizados: "Batizados",
    com_gf: "Com Grupo Familiar",
    gender_m: "Masculino",
    gender_f: "Feminino",
    gender_none: "Genero nao informado",
    todas: "Total geral"
  };

  return (
    <PageShell>
      <PageHeader
        title="Pessoas"
        description="Pesquise uma pessoa e abra o perfil para ver ou atualizar os dados."
        action={access?.isAdminLike || access?.isLeader ? <Link href="/pessoas/novo" className="inline-flex items-center gap-2 rounded-md bg-moss px-3 py-2 text-sm font-semibold text-white"><Plus className="h-4 w-4" />Nova pessoa</Link> : null}
      />
      <Card className="mb-5">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_240px_220px] xl:items-end">
          <Field label="Pesquisar pessoa">
            <input className={inputClass} placeholder="Digite o nome completo ou como a pessoa e conhecida" value={search} onChange={(event) => setSearch(event.target.value)} />
          </Field>
          <Field label="Pendencia cadastral">
            <select className={inputClass} value={missingFilter} onChange={(event) => setMissingFilter(event.target.value)}>
              <option value="">Todas as pessoas</option>
              <option value="sem_gf">Sem Grupo Familiar</option>
              <option value="sem_aniversario">Sem aniversario</option>
              <option value="sem_email">Sem e-mail</option>
              <option value="sem_telefone">Sem telefone</option>
              <option value="sem_familia">Sem familiares</option>
              <option value="sem_departamento">Sem departamento</option>
              <option value="sem_cidade">Sem cidade natal</option>
              <option value="sem_batismo">Sem informacao de batismo</option>
            </select>
          </Field>
          <Field label="Ordenar por">
            <div className="relative">
              <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/55" />
              <select className={`${inputClass} pl-9`} value={sortBy} onChange={(event) => setSortBy(event.target.value as typeof sortBy)}>
                <option value="name_asc">Nome: A-Z</option>
                <option value="name_desc">Nome: Z-A</option>
                <option value="recent">Mais recentes</option>
                <option value="oldest">Mais antigos</option>
              </select>
            </div>
          </Field>
        </div>
        {dashboardFilter && dashboardFilter !== "todas" || missingFilter ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {dashboardFilter && dashboardFilter !== "todas" ? (
              <span className="rounded-md bg-sage px-3 py-1.5 text-sm font-semibold text-moss">
                Filtro: {filterLabels[dashboardFilter]}
              </span>
            ) : null}
            {missingFilter ? (
              <span className="rounded-md bg-sage px-3 py-1.5 text-sm font-semibold text-moss">
                Pendencia: {missingFilter.replace("sem_", "Sem ").replaceAll("_", " ")}
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => {
                setDashboardFilter("");
                setMissingFilter("");
                window.history.replaceState({}, "", "/pessoas");
              }}
              className="text-sm font-semibold text-ink/60 hover:text-moss"
            >
              Limpar filtros
            </button>
          </div>
        ) : null}
        <p className="mt-2 text-sm text-ink/60">{filteredPeople.length} de {people.length} pessoas encontradas</p>
      </Card>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filteredPeople.map((person) => (
          <Card key={person.id}>
            <div className="flex items-start justify-between gap-3">
              <Link href={`/pessoas/${person.id}`} className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{person.preferred_name || person.name}</h3>
                  {access?.isAdminLike || access?.isLeader ? <Badge>{personStatusLabels[person.status]}</Badge> : null}
                </div>
                {person.preferred_name ? <p className="mt-1 text-sm text-ink/60">{person.name}</p> : null}
                <p className="mt-2 text-sm text-ink/65">{person.phone} · nasc. {formatBirthDate(person.birth_date, person.birth_day, person.birth_month, person.hide_birth_year)}</p>
                <p className="mt-1 text-sm text-ink/65">GF: {person.family_group ?? "Sem grupo"}</p>
                {[...(person.departments ?? []), ...(person.department_roles ?? [])].length ? (
                  <p className="mt-1 text-sm text-moss">{[...(person.department_roles ?? []), ...(person.departments ?? [])].join(" · ")}</p>
                ) : null}
              </Link>
              <a className="inline-flex rounded-md border border-line p-2 text-moss hover:bg-sage" href={buildWhatsAppUrl(person.phone, `Ola ${person.preferred_name || person.name}, paz!`)} target="_blank">
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </Card>
        ))}
      </div>
      {people.length === 0 ? <EmptyState title="Nenhuma pessoa cadastrada" text="Cadastre a primeira pessoa pelo botao Nova pessoa." /> : null}
      {people.length > 0 && filteredPeople.length === 0 ? <EmptyState title="Nenhum resultado" text="Tente buscar pelo nome completo ou por como a pessoa e conhecida." /> : null}
    </PageShell>
  );
}
