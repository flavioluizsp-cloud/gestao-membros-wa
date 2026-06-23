"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge, Card, Field, inputClass, PageHeader, PageShell } from "@/components/ui";
import { getAccessContext } from "@/lib/access";
import { departmentOptions } from "@/lib/labels";
import { membrosDb, supabase } from "@/lib/supabase";
import type { DepartmentAssignment, DepartmentAssignmentRole, DepartmentSetting, Person } from "@/lib/types";

export default function DepartmentsPage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [settings, setSettings] = useState<DepartmentSetting[]>([]);
  const [assignments, setAssignments] = useState<DepartmentAssignment[]>([]);
  const [selectedPeople, setSelectedPeople] = useState<Record<string, string>>({});
  const [selectedRoles, setSelectedRoles] = useState<Record<string, DepartmentAssignmentRole>>({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!supabase || !membrosDb) return;
      const access = await getAccessContext();
      if (!access.isAdminLike) {
        window.location.href = "/";
        return;
      }

      const [peopleResult, settingsResult, assignmentsResult] = await Promise.all([
        membrosDb.from("people").select("*").order("name"),
        membrosDb.from("department_settings").select("*").order("name"),
        membrosDb.from("department_assignments").select("*, people(id, name, preferred_name, phone)").order("created_at")
      ]);

      const existingSettings = (settingsResult.data ?? []) as DepartmentSetting[];
      const missingDepartments = departmentOptions.filter((name) => !existingSettings.some((setting) => setting.name === name));
      if (missingDepartments.length > 0) {
        await membrosDb.from("department_settings").insert(missingDepartments.map((name) => ({ name })));
        const refreshed = await membrosDb.from("department_settings").select("*").order("name");
        setSettings((refreshed.data ?? []) as DepartmentSetting[]);
      } else {
        setSettings(existingSettings);
      }

      setPeople((peopleResult.data ?? []) as Person[]);
      setAssignments((assignmentsResult.data ?? []) as DepartmentAssignment[]);
      setLoading(false);
    }

    load();
  }, []);

  const peopleById = useMemo(() => new Map(people.map((person) => [person.id, person])), [people]);

  async function addAssignment(departmentName: string) {
    if (!membrosDb) return;
    const personId = selectedPeople[departmentName];
    const role = selectedRoles[departmentName] ?? "lider";
    if (!personId) {
      showMessage("Escolha uma pessoa para adicionar.");
      return;
    }

    const existing = assignments.find((assignment) => assignment.department_name === departmentName && assignment.person_id === personId);
    const person = peopleById.get(personId);
    const payload = { department_name: departmentName, person_id: personId, role };

    const { data, error } = existing
      ? await membrosDb.from("department_assignments").update({ role }).eq("id", existing.id).select("*, people(id, name, preferred_name, phone)").single()
      : await membrosDb.from("department_assignments").insert(payload).select("*, people(id, name, preferred_name, phone)").single();

    if (!error && data) {
      const next = data as DepartmentAssignment;
      setAssignments((current) => existing
        ? current.map((assignment) => assignment.id === existing.id ? next : assignment)
        : [...current, next]
      );
      setSelectedPeople((current) => ({ ...current, [departmentName]: "" }));
    } else if (!error && !data) {
      const fallback = {
        id: existing?.id ?? `${departmentName}-${personId}`,
        department_name: departmentName,
        person_id: personId,
        role,
        created_at: new Date().toISOString(),
        people: person ? { id: person.id, name: person.name, preferred_name: person.preferred_name, phone: person.phone } : null
      } as DepartmentAssignment;
      setAssignments((current) => existing
        ? current.map((assignment) => assignment.id === existing.id ? fallback : assignment)
        : [...current, fallback]
      );
    }

    showMessage(error ? error.message : role === "lider" ? "Lider adicionado ao departamento." : "Co-lider adicionado ao departamento.");
  }

  async function removeAssignment(assignment: DepartmentAssignment) {
    if (!membrosDb) return;
    const { error } = await membrosDb.from("department_assignments").delete().eq("id", assignment.id);
    if (!error) setAssignments((current) => current.filter((item) => item.id !== assignment.id));
    showMessage(error ? error.message : "Atribuicao removida.");
  }

  function showMessage(text: string) {
    setMessage(text);
    window.setTimeout(() => setMessage(""), 2500);
  }

  if (loading) return <PageShell><p className="text-sm text-ink/60">Carregando departamentos...</p></PageShell>;

  return (
    <PageShell>
      <PageHeader
        title="Departamentos"
        description="Defina lideres e co-lideres por departamento. Depois, somente quem estiver como lider tera acesso a gestao do departamento."
      />

      {message ? (
        <div className="fixed left-1/2 top-6 z-[9999] w-[min(92vw,520px)] -translate-x-1/2 rounded-md bg-moss px-5 py-3 text-center text-sm font-bold text-white shadow-2xl">
          {message}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {departmentOptions.map((departmentName) => {
          const setting = settings.find((item) => item.name === departmentName);
          if (!setting) return null;
          const departmentAssignments = assignments.filter((assignment) => assignment.department_name === departmentName);
          const leaders = departmentAssignments.filter((assignment) => assignment.role === "lider");
          const coLeaders = departmentAssignments.filter((assignment) => assignment.role === "co_lider");
          const availablePeople = people.filter((person) => !departmentAssignments.some((assignment) => assignment.person_id === person.id));

          return (
            <Card key={departmentName}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-ink">{departmentName}</h3>
                  <p className="mt-1 text-sm text-ink/60">
                    Lideres: {leaders.length > 0 ? leaders.map((assignment) => assignment.people?.preferred_name || assignment.people?.name || peopleById.get(assignment.person_id)?.name).join(" / ") : "Nao definido"}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge>{leaders.length} lider(es)</Badge>
                  <Badge>{coLeaders.length} co-lider(es)</Badge>
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                <div className="grid gap-3 sm:grid-cols-[1fr_150px_auto]">
                  <Field label="Pessoa">
                    <select
                      className={inputClass}
                      value={selectedPeople[departmentName] ?? ""}
                      onChange={(event) => setSelectedPeople((current) => ({ ...current, [departmentName]: event.target.value }))}
                    >
                      <option value="">Escolha uma pessoa</option>
                      {availablePeople.map((person) => (
                        <option key={person.id} value={person.id}>{person.name}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Funcao">
                    <select
                      className={inputClass}
                      value={selectedRoles[departmentName] ?? "lider"}
                      onChange={(event) => setSelectedRoles((current) => ({ ...current, [departmentName]: event.target.value as DepartmentAssignmentRole }))}
                    >
                      <option value="lider">Lider</option>
                      <option value="co_lider">Co-lider</option>
                    </select>
                  </Field>
                  <button
                    type="button"
                    onClick={() => addAssignment(departmentName)}
                    className="self-end rounded-md bg-moss px-4 py-2 text-sm font-semibold text-white hover:bg-moss/90"
                  >
                    Adicionar
                  </button>
                </div>

                <div className="rounded-md border border-line bg-white p-3">
                  <p className="mb-2 text-sm font-semibold text-ink">Pessoas atribuidas</p>
                  <div className="space-y-2">
                    {departmentAssignments.map((assignment) => {
                      const person = assignment.people ?? peopleById.get(assignment.person_id);
                      return (
                        <div key={assignment.id} className="flex flex-col gap-2 rounded-md border border-line px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-medium">{person?.preferred_name || person?.name || "Pessoa removida"}</p>
                            <p className="text-xs text-ink/60">{assignment.role === "lider" ? "Lider do departamento" : "Co-lider"}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge>{assignment.role === "lider" ? "Lider" : "Co-lider"}</Badge>
                            <button
                              type="button"
                              onClick={() => removeAssignment(assignment)}
                              className="rounded-md border border-red-200 px-3 py-1 text-sm font-semibold text-red-600 hover:bg-red-50"
                            >
                              Remover
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {departmentAssignments.length === 0 ? <p className="text-sm text-ink/55">Nenhuma pessoa atribuida ainda.</p> : null}
                  </div>
                </div>

              </div>
            </Card>
          );
        })}
      </div>
    </PageShell>
  );
}
