"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle } from "lucide-react";
import { Badge, Button, Card, PageHeader, PageShell } from "@/components/ui";
import { formatDate } from "@/lib/date";
import { membrosDb, supabase } from "@/lib/supabase";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { filterPeopleByAccess, getAccessContext } from "@/lib/access";
import { familyGroupOptions } from "@/lib/labels";
import type { DepartmentAssignment, Person } from "@/lib/types";

type PageProps = {
  params: Promise<{ type: string; name: string }>;
};

export default function SegmentPage({ params }: PageProps) {
  const [type, setType] = useState("");
  const [name, setName] = useState("");
  const [people, setPeople] = useState<Person[]>([]);
  const [allPeople, setAllPeople] = useState<Person[]>([]);
  const [departmentAssignments, setDepartmentAssignments] = useState<DepartmentAssignment[]>([]);
  const [message, setMessage] = useState("");
  const [isLeader, setIsLeader] = useState(false);
  const [leaderPeople, setLeaderPeople] = useState<Array<{ name: string; phone?: string; role: string }>>([]);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    params.then((value) => {
      setType(value.type);
      setName(decodeURIComponent(value.name));
    });
  }, [params]);

  useEffect(() => {
    async function loadPeople() {
      if (!supabase || !membrosDb || !name) return;
      const accessContext = await getAccessContext();
      const [{ data }, { data: departmentData }] = await Promise.all([
        membrosDb.from("people").select("*").order("name"),
        type === "departamento" ? membrosDb.from("department_assignments").select("*, people(id, name, preferred_name, phone)").eq("department_name", name) : Promise.resolve({ data: [] })
      ]);
      const allPeople = filterPeopleByAccess((data ?? []) as Person[], accessContext);
      const role = accessContext?.profile?.role;
      setIsLeader(role === "admin" || role === "pastor" || role === "lider");
      const allPeopleData = (data ?? []) as Person[];
      const assignments = (departmentData ?? []) as DepartmentAssignment[];
      setAllPeople(allPeopleData);
      setDepartmentAssignments(assignments);
      if (type === "departamento") {
        const leaders = assignments
          .map((a) => ({ name: a.people?.preferred_name || a.people?.name || "", phone: a.people?.phone, role: a.role === "lider" ? "Lider" : "Co-lider" }))
          .filter((l) => l.name);
        setLeaderPeople(leaders);
      } else if (type === "grupo-familiar") {
        setLeaderPeople(getFamilyGroupLeadership(name, allPeopleData));
      } else {
        setLeaderPeople([]);
      }
      setPeople(allPeople.filter((person) => belongsToSegment(person, type, name)));
    }

    loadPeople();
  }, [type, name]);

  const leader = useMemo(() => findLeader(type, name, people, departmentAssignments, allPeople), [type, name, people, departmentAssignments, allPeople]);
  const defaultMessage = buildSegmentMessage(type, name);
  const messageToSend = message.trim() || defaultMessage;

  function openAllMessages() {
    people.forEach((person, index) => {
      window.setTimeout(() => {
        window.open(buildWhatsAppUrl(person.phone, renderPersonMessage(messageToSend, person)), "_blank");
      }, index * 700);
    });
  }

  function insertNameVariable() {
    const token = "{{nome}}";
    const textarea = textareaRef.current;
    if (!textarea) {
      setMessage((current) => `${current}${token}`);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const nextMessage = `${message.slice(0, start)}${token}${message.slice(end)}`;
    setMessage(nextMessage);
    window.setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + token.length, start + token.length);
    }, 0);
  }

  return (
    <PageShell>
      <PageHeader
        title={name || "Segmento"}
        description={`${segmentTypeLabel(type)} - Lider: ${leader}`}
        action={<Link className="rounded-md border border-line px-3 py-2 text-sm font-semibold" href="/">Voltar ao Dashboard</Link>}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-ink/60">Contatos</p>
          <p className="mt-2 text-3xl font-bold">{people.length}</p>
        </Card>
        <Card>
          <p className="mb-2 text-sm text-ink/60">Lideranca</p>
          <div className="space-y-2">
            {leaderPeople.length > 0 ? leaderPeople.map((l, i) => (
              <div key={i} className="flex items-center justify-between rounded-md border border-line px-3 py-2">
                <div>
                  <p className="text-sm font-semibold text-ink">{l.name}</p>
                  <p className="text-xs text-ink/60">{l.role}</p>
                </div>
                {l.phone ? (
                  <a href={buildWhatsAppUrl(l.phone, `Ola ${l.name}, paz!`)} target="_blank" className="rounded-md border border-line p-2 text-moss hover:bg-sage">
                    <MessageCircle className="h-4 w-4" />
                  </a>
                ) : null}
              </div>
            )) : <p className="text-sm font-semibold text-ink">{leader}</p>}
          </div>
        </Card>
        {isLeader ? (
          <Card>
            <p className="text-sm text-ink/60">Enviar para o segmento</p>
          <Button className="mt-3 w-full gap-2" onClick={openAllMessages} disabled={people.length === 0}>
            <MessageCircle className="h-4 w-4" />Mensagem para todos
          </Button>
          </Card>
        ) : null}
      </div>

      {isLeader ? (
      <Card className="mt-5">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-ink">Mensagem</span>
          <textarea
            ref={textareaRef}
            className="min-h-28 w-full rounded-md border border-line bg-white px-3 py-2 text-sm focus-ring"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder={defaultMessage}
          />
        </label>
        <button type="button" onClick={insertNameVariable} className="mt-3 rounded-md border border-line px-3 py-2 text-sm font-semibold text-moss hover:bg-sage">
          Nome
        </button>
      </Card>
      ) : null}

      <Card className="mt-5">
        <h3 className="mb-3 font-semibold">Gestao dos contatos</h3>
        <div className="space-y-3">
          {people.map((person) => (
            <div key={person.id} className="flex flex-col gap-3 rounded-md border border-line p-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{person.name}</p>
                  <Badge>{person.status}</Badge>
                </div>
                <p className="mt-1 text-sm text-ink/60">{person.phone} - nasc. {formatDate(person.birth_date)}</p>
                <p className="mt-1 text-sm text-ink/60">GF: {person.family_group ?? "Sem grupo"} - Atribuicao: {person.assigned_leader ?? "-"}</p>
              </div>
              {isLeader ? (
              <a
                href={buildWhatsAppUrl(person.phone, renderPersonMessage(messageToSend, person))}
                target="_blank"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-line px-3 py-2 text-sm font-semibold text-moss hover:bg-sage"
              >
                <MessageCircle className="h-4 w-4" />WhatsApp
              </a>
              ) : null}
            </div>
          ))}
          {people.length === 0 ? <p className="text-sm text-ink/60">Nenhuma pessoa neste segmento.</p> : null}
        </div>
      </Card>
    </PageShell>
  );
}

function belongsToSegment(person: Person, type: string, name: string) {
  if (type === "departamento") return person.departments?.includes(name);
  if (type === "grupo-familiar") return person.family_group === name;
  if (type === "atribuicao") return person.assigned_leader === name;
  return false;
}

function findLeader(type: string, name: string, people: Person[], departmentAssignments: DepartmentAssignment[], allPeople: Person[]) {
  if (type === "grupo-familiar") {
    const group = familyGroupOptions.find((option) => option.value === name);
    if (group?.leader && group.coLeader) return `${group.leader} / ${group.coLeader}`;
    if (group?.leader) return group.leader;
    return people.find((person) => person.family_group === name)?.family_group_leader ?? "Sem lider definido";
  }
  if (type === "atribuicao") return name;
  if (type === "departamento") {
    const configuredLeaders = departmentAssignments
      .filter((assignment) => assignment.role === "lider")
      .map((assignment) => assignment.people?.preferred_name || assignment.people?.name || allPeople.find((person) => person.id === assignment.person_id)?.name)
      .filter(Boolean);
    if (configuredLeaders.length > 0) return configuredLeaders.join(" / ");
  }
  const leader = people.find((person) => person.department_roles?.includes("Lider"));
  const coLeader = people.find((person) => person.department_roles?.includes("Co-Lider"));
  if (leader && coLeader) return `${leader.name} / ${coLeader.name}`;
  return leader?.name ?? coLeader?.name ?? "Sem lider definido";
}

function segmentTypeLabel(type: string) {
  if (type === "departamento") return "Departamento";
  if (type === "grupo-familiar") return "Grupo Familiar";
  if (type === "atribuicao") return "Atribuicao";
  return "Segmento";
}

function buildSegmentMessage(type: string, name: string) {
  if (type === "departamento") return `Ola {{nome}}, paz! Esta mensagem e para o departamento ${name}.`;
  if (type === "grupo-familiar") return `Ola {{nome}}, paz! Esta mensagem e para o ${name}.`;
  if (type === "atribuicao") return `Ola {{nome}}, paz! Esta mensagem e para o grupo acompanhado por ${name}.`;
  return `Ola {{nome}}, paz! Esta mensagem e para ${name}.`;
}

function renderPersonMessage(message: string, person: Person) {
  return message.replaceAll("{{nome}}", getFirstName(person.name));
}

function getFirstName(name: string) {
  return name.trim().split(/\s+/)[0] || name;
}

function getFamilyGroupLeadership(groupName: string, allPeople: Person[]) {
  const group = familyGroupOptions.find((option) => option.value === groupName);
  if (!group) {
    const leaderName = allPeople.find((person) => person.family_group === groupName)?.family_group_leader;
    const person = leaderName ? findPersonByLeaderName(allPeople, leaderName) : null;
    return leaderName ? [{ name: person?.preferred_name || person?.name || leaderName, phone: person?.phone, role: "Lider" }] : [];
  }

  return [
    group.leader ? buildLeaderContact(group.leader, "Lider", allPeople) : null,
    group.coLeader ? buildLeaderContact(group.coLeader, "Co-lider", allPeople) : null
  ].filter(Boolean) as Array<{ name: string; phone?: string; role: string }>;
}

function buildLeaderContact(name: string, role: string, allPeople: Person[]) {
  const person = findPersonByLeaderName(allPeople, name);
  return {
    name: person?.preferred_name || person?.name || name,
    phone: person?.phone,
    role
  };
}

function findPersonByLeaderName(allPeople: Person[], name: string) {
  const normalizedName = normalizeText(name);
  return allPeople.find((person) => {
    const preferred = normalizeText(person.preferred_name || "");
    const fullName = normalizeText(person.name);
    const firstName = fullName.split(" ")[0];
    return preferred === normalizedName || firstName === normalizedName || fullName.includes(normalizedName);
  });
}

function normalizeText(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}
