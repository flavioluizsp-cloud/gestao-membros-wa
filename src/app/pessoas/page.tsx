"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MessageCircle, Plus } from "lucide-react";
import { Badge, Card, EmptyState, Field, inputClass, PageHeader, PageShell } from "@/components/ui";
import { filterPeopleByAccess, getAccessContext } from "@/lib/access";
import { formatDate } from "@/lib/date";
import { personStatusLabels } from "@/lib/labels";
import { membrosDb, supabase } from "@/lib/supabase";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import type { AccessContext, Person } from "@/lib/types";

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [access, setAccess] = useState<AccessContext | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadPeople() {
      if (!supabase || !membrosDb) return;
      const access = await getAccessContext();
      setAccess(access);
      const { data } = await membrosDb.from("people").select("*").order("name");
      setPeople(filterPeopleByAccess((data ?? []) as Person[], access));
    }

    loadPeople();
  }, []);

  const normalizedSearch = search.trim().toLowerCase();
  const filteredPeople = normalizedSearch
    ? people.filter((person) => {
        const haystack = [
          person.name,
          person.preferred_name,
          person.phone,
          person.email,
          person.birth_city,
          person.family_group,
          person.family_group_leader,
          person.assigned_leader,
          person.baptism_church,
          person.baptizing_pastor,
          ...(person.departments ?? []),
          ...(person.department_roles ?? []),
          ...(person.ecclesiastical_roles ?? []),
          ...(person.administrative_roles ?? [])
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalizedSearch);
      })
    : people;

  return (
    <PageShell>
      <PageHeader
        title="Pessoas"
        description="Pesquise uma pessoa e abra o perfil para ver ou atualizar os dados."
        action={access?.isAdminLike || access?.isLeader ? <Link href="/pessoas/novo" className="inline-flex items-center gap-2 rounded-md bg-moss px-3 py-2 text-sm font-semibold text-white"><Plus className="h-4 w-4" />Nova pessoa</Link> : null}
      />
      <Card className="mb-5">
        <Field label="Pesquisar pessoa">
          <input className={inputClass} placeholder="Digite nome, telefone, departamento, grupo ou cidade" value={search} onChange={(event) => setSearch(event.target.value)} />
        </Field>
        <p className="mt-2 text-sm text-ink/60">{filteredPeople.length} de {people.length} pessoas encontradas</p>
      </Card>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filteredPeople.map((person) => (
          <Card key={person.id}>
            <div className="flex items-start justify-between gap-3">
              <Link href={`/pessoas/${person.id}`} className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{person.preferred_name || person.name}</h3>
                  <Badge>{personStatusLabels[person.status]}</Badge>
                </div>
                {person.preferred_name ? <p className="mt-1 text-sm text-ink/60">{person.name}</p> : null}
                <p className="mt-2 text-sm text-ink/65">{person.phone} · nasc. {formatDate(person.birth_date)}</p>
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
      {people.length > 0 && filteredPeople.length === 0 ? <EmptyState title="Nenhum resultado" text="Tente buscar por outro nome, telefone, departamento ou grupo." /> : null}
    </PageShell>
  );
}
