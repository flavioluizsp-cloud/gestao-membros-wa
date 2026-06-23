"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Badge, Card, PageShell } from "@/components/ui";
import { getAccessContext } from "@/lib/access";
import { formatDate, isBirthdayThisWeek } from "@/lib/date";
import { personStatusLabels } from "@/lib/labels";
import { membrosDb } from "@/lib/supabase";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import type { AccessContext, Person } from "@/lib/types";

export default function MembroHomePage() {
  const [access, setAccess] = useState<AccessContext | null>(null);
  const [person, setPerson] = useState<Person | null>(null);
  const [allPeople, setAllPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const ctx = await getAccessContext();
      setAccess(ctx);
      if (ctx.person?.id && membrosDb) {
        const [{ data }, { data: allPeopleData }] = await Promise.all([
          membrosDb.from("people").select("*").eq("id", ctx.person.id).maybeSingle(),
          membrosDb.from("people").select("id, name, preferred_name, phone, birth_date, departments, family_group")
        ]);
        setPerson(data as Person | null);
        setAllPeople((allPeopleData ?? []) as Person[]);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <PageShell><p className="text-sm text-ink/60">Carregando...</p></PageShell>;

  if (!person) return (
    <PageShell>
      <div className="rounded-lg border border-dashed border-line bg-white p-8 text-center">
        <h3 className="font-semibold text-ink">Perfil nao encontrado</h3>
        <p className="mt-1 text-sm text-ink/60">Seu usuario ainda nao esta vinculado a um cadastro. Fale com a lideranca.</p>
      </div>
    </PageShell>
  );

  const familyGroupLeader = person.family_group_leader;
  const birthdays = allPeople.filter((item) => isBirthdayThisWeek(item.birth_date));

  if (person.pending_approval) {
    return (
      <PageShell>
        <div className="rounded-lg border border-line bg-white p-8 text-center shadow-soft">
          <h2 className="text-xl font-bold text-ink">Cadastro aguardando aprovacao</h2>
          <p className="mt-2 text-sm text-ink/60">Recebemos seus dados. A lideranca ainda precisa revisar e liberar seu acesso completo.</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-ink">Ola, {person.preferred_name || person.name.trim().split(" ")[0]}</h2>
        <p className="mt-1 text-sm text-ink/65">Bem-vindo ao Portal do Membro.</p>
        <Link href={`/pessoas/${person.id}`} className="mt-4 inline-flex w-full justify-center rounded-md bg-moss px-3 py-2.5 text-sm font-semibold text-white hover:bg-moss/90 sm:w-auto">
          Editar meus dados
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h3 className="mb-3 font-semibold text-ink">Meus dados</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-ink/60">Nome</span>
              <span className="font-medium text-ink">{person.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink/60">WhatsApp</span>
              <span className="font-medium text-ink">{person.phone}</span>
            </div>
            {person.email ? (
              <div className="flex justify-between">
                <span className="text-ink/60">E-mail</span>
                <span className="font-medium text-ink">{person.email}</span>
              </div>
            ) : null}
            {person.birth_date ? (
              <div className="flex justify-between">
                <span className="text-ink/60">Nascimento</span>
                <span className="font-medium text-ink">{formatDate(person.birth_date)}</span>
              </div>
            ) : null}
            <div className="flex justify-between">
              <span className="text-ink/60">Status</span>
              <span className="font-medium text-moss">{personStatusLabels[person.status]}</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="mb-3 font-semibold text-ink">Minha igreja</h3>
          <div className="space-y-2 text-sm">
            {person.family_group ? (
              <div>
                <p className="mb-2 text-ink/60">Grupo Familiar</p>
                <Link
                  href={`/segmentos/grupo-familiar/${encodeURIComponent(person.family_group)}`}
                  className="flex items-center justify-between rounded-md border border-line px-3 py-2.5 hover:bg-sage"
                >
                  <div>
                    <p className="text-sm font-semibold text-ink">{person.family_group}</p>
                    <p className="text-xs text-ink/60">Lider: {familyGroupLeader || "Nao definido"}</p>
                  </div>
                  <Badge>{allPeople.filter((p) => p.family_group === person.family_group).length}</Badge>
                </Link>
              </div>
            ) : null}
            {person.is_baptized ? (
              <div className="flex justify-between">
                <span className="text-ink/60">Batizado em</span>
                <span className="font-medium text-ink">{formatDate(person.baptism_date ?? "")}</span>
              </div>
            ) : null}
            {(person.departments ?? []).length > 0 ? (
              <div>
                <p className="mb-2 text-ink/60">Departamentos</p>
                <div className="space-y-2">
                  {(person.departments ?? []).map((dep) => {
                    const count = allPeople.filter((p) => p.departments?.includes(dep)).length;
                    return (
                      <Link
                        key={dep}
                        href={`/segmentos/departamento/${encodeURIComponent(dep)}`}
                        className="flex items-center justify-between rounded-md border border-line px-3 py-2.5 hover:bg-sage"
                      >
                        <div>
                          <p className="text-sm font-semibold text-ink">{dep}</p>
                          <p className="text-xs text-ink/60">Participante</p>
                        </div>
                        <Badge>{count}</Badge>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </Card>

        {(person.family_members ?? []).length > 0 ? (
          <Card className="md:col-span-2">
            <h3 className="mb-3 font-semibold text-ink">Minha familia</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {(person.family_members ?? []).map((member, index) => (
                <div key={index} className="rounded-md border border-line px-3 py-2.5">
                  <p className="text-sm font-semibold text-ink">{member.name}</p>
                  <p className="text-xs text-ink/60">{member.relationship}{member.birth_date ? ` - ${formatDate(member.birth_date)}` : ""}</p>
                </div>
              ))}
            </div>
          </Card>
        ) : null}

        <Card className="md:col-span-2">
          <h3 className="mb-3 font-semibold text-ink">Aniversariantes da semana</h3>
          <div className="space-y-2">
            {birthdays.map((birthdayPerson) => (
              <div key={birthdayPerson.id} className="flex items-center justify-between rounded-md border border-line px-3 py-2.5">
                <div>
                  <p className="text-sm font-semibold text-ink">{birthdayPerson.preferred_name || birthdayPerson.name}</p>
                  <p className="text-xs text-ink/60">{formatBirthdayForMember(birthdayPerson.birth_date)}</p>
                </div>
                <a
                  href={buildWhatsAppUrl(birthdayPerson.phone, `Feliz aniversario ${birthdayPerson.preferred_name || birthdayPerson.name}! Que Deus te abencoe muito!`)}
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

        {person.assigned_leader ? (
          <Card>
            <h3 className="mb-3 font-semibold text-ink">Meu acompanhamento</h3>
            <p className="text-sm text-ink/60">Responsavel por voce</p>
            <div className="mt-2 flex items-center justify-between rounded-md border border-line px-3 py-2.5">
              <p className="text-sm font-semibold text-ink">{person.assigned_leader}</p>
              <a href={buildWhatsAppUrl(person.phone, `Ola ${person.preferred_name || person.name}, paz!`)} target="_blank" className="rounded-md border border-line p-2 text-moss hover:bg-sage">
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </Card>
        ) : null}
      </div>
    </PageShell>
  );
}

function formatBirthdayForMember(date?: string | null) {
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
