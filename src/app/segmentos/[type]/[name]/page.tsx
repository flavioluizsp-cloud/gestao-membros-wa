"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle } from "lucide-react";
import { Badge, Button, Card, PageHeader, PageShell } from "@/components/ui";
import { formatBirthDate } from "@/lib/date";
import { membrosDb, supabase } from "@/lib/supabase";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { getAccessContext } from "@/lib/access";
import { familyGroupOptions } from "@/lib/labels";
import type { DepartmentAssignment, FamilyGroupAssignment, Person } from "@/lib/types";

type PageProps = {
  params: Promise<{ type: string; name: string }>;
};

export default function SegmentPage({ params }: PageProps) {
  const [type, setType] = useState("");
  const [name, setName] = useState("");
  const [people, setPeople] = useState<Person[]>([]);
  const [allPeople, setAllPeople] = useState<Person[]>([]);
  const [departmentAssignments, setDepartmentAssignments] = useState<DepartmentAssignment[]>([]);
  const [familyGroupAssignments, setFamilyGroupAssignments] = useState<FamilyGroupAssignment[]>([]);
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
      const [{ data }, { data: departmentData }, { data: familyGroupData }] = await Promise.all([
        membrosDb.rpc("segment_directory", { p_type: type, p_name: name }),
        type === "departamento" ? membrosDb.from("department_assignments").select("*, people(id, name, preferred_name, phone)").eq("department_name", name) : Promise.resolve({ data: [] }),
        type === "grupo-familiar" ? membrosDb.from("family_group_assignments").select("*, people(id, name, preferred_name, phone)").eq("family_group", name) : Promise.resolve({ data: [] })
      ]);
      const role = accessContext?.profile?.role;
      setIsLeader(role === "admin" || role === "pastor" || role === "lider");
      const allPeopleData = (data ?? []) as Person[];
      const assignments = (departmentData ?? []) as DepartmentAssignment[];
      const groupAssignments = (familyGroupData ?? []) as FamilyGroupAssignment[];
      setAllPeople(allPeopleData);
      setDepartmentAssignments(assignments);
      setFamilyGroupAssignments(groupAssignments);
      if (type === "departamento") {
        const leaders = assignments
          .map((a) => ({ name: a.people?.preferred_name || a.people?.name || "", phone: a.people?.phone, role: a.role === "lider" ? "Lider" : "Co-lider" }))
          .filter((l) => l.name);
        setLeaderPeople(leaders);
      } else if (type === "grupo-familiar") {
        setLeaderPeople(getFamilyGroupLeadership(name, allPeopleData, groupAssignments));
      } else {
        setLeaderPeople([]);
      }
      setPeople(allPeopleData);
    }

    loadPeople();
  }, [type, name]);

  const leader = useMemo(() => findLeader(type, name, people, departmentAssignments, familyGroupAssignments, allPeople), [type, name, people, departmentAssignments, familyGroupAssignments, allPeople]);
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
        action={<Link className="inline-flex w-full items-center justify-center rounded-md bg-moss px-4 py-2.5 text-sm font-bold text-white shadow-soft hover:bg-moss/90 sm:w-auto" href="/">Voltar ao Dashboard</Link>}
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
                  {isLeader ? <Badge>{person.status}</Badge> : null}
                </div>
                <p className="mt-1 text-sm text-ink/60">{person.phone} - nasc. {formatBirthDate(person.birth_date, person.birth_day, person.birth_month, person.hide_birth_year)}</p>
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

function findLeader(type: string, name: string, people: Person[], departmentAssignments: DepartmentAssignment[], familyGroupAssignments: FamilyGroupAssignment[], allPeople: Person[]) {
  if (type === "grupo-familiar") {
    const configuredLeaders = familyGroupAssignments
      .filter((assignment) => assignment.role === "lider")
      .map((assignment) => assignment.people?.preferred_name || assignment.people?.name || allPeople.find((person) => person.id === assignment.person_id)?.name)
      .filter(Boolean);
    if (configuredLeaders.length > 0) return configuredLeaders.join(" / ");
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

function getFamilyGroupLeadership(groupName: string, allPeople: Person[], groupAssignments: FamilyGroupAssignment[]) {
  if (groupAssignments.length > 0) {
    return groupAssignments
      .map((assignment) => ({
        name: assignment.people?.preferred_name || assignment.people?.name || allPeople.find((person) => person.id === assignment.person_id)?.name || "",
        phone: assignment.people?.phone || allPeople.find((person) => person.id === assignment.person_id)?.phone,
        role: assignment.role === "lider" ? "Lider" : "Co-lider"
      }))
      .filter((leader) => leader.name);
  }

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
