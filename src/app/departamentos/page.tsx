"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge, Card, Field, inputClass, PageHeader, PageShell } from "@/components/ui";
import { getAccessContext } from "@/lib/access";
import { departmentOptions } from "@/lib/labels";
import { membrosDb, supabase } from "@/lib/supabase";
import type { DepartmentSetting, Person } from "@/lib/types";

export default function DepartmentsPage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [settings, setSettings] = useState<DepartmentSetting[]>([]);
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

      const [peopleResult, settingsResult] = await Promise.all([
        membrosDb.from("people").select("*").order("name"),
        membrosDb.from("department_settings").select("*").order("name")
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
      setLoading(false);
    }

    load();
  }, []);

  const peopleById = useMemo(() => new Map(people.map((person) => [person.id, person])), [people]);

  async function updateDepartment(setting: DepartmentSetting, values: Partial<DepartmentSetting>) {
    if (!membrosDb) return;
    const next = { ...setting, ...values, updated_at: new Date().toISOString() };
    setSettings((current) => current.map((item) => item.id === setting.id ? next : item));
    const { error } = await membrosDb
      .from("department_settings")
      .update({
        leader_person_id: next.leader_person_id || null,
        co_leader_person_ids: next.co_leader_person_ids ?? [],
        updated_at: next.updated_at
      })
      .eq("id", setting.id);

    setMessage(error ? error.message : "Departamento atualizado.");
    window.setTimeout(() => setMessage(""), 2500);
  }

  if (loading) return <PageShell><p className="text-sm text-ink/60">Carregando departamentos...</p></PageShell>;

  return (
    <PageShell>
      <PageHeader
        title="Departamentos"
        description="Defina o lider principal e os co-lideres de cada departamento. Apenas o lider principal sera usado depois para acesso de gestao."
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
          const leader = setting.leader_person_id ? peopleById.get(setting.leader_person_id) : null;
          const coLeaders = (setting.co_leader_person_ids ?? []).map((id) => peopleById.get(id)).filter(Boolean) as Person[];

          return (
            <Card key={departmentName}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-ink">{departmentName}</h3>
                  <p className="mt-1 text-sm text-ink/60">Lider: {leader?.preferred_name || leader?.name || "Nao definido"}</p>
                </div>
                <Badge>{coLeaders.length} co-lider(es)</Badge>
              </div>

              <div className="mt-4 grid gap-3">
                <Field label="Lider principal">
                  <select
                    className={inputClass}
                    value={setting.leader_person_id ?? ""}
                    onChange={(event) => updateDepartment(setting, { leader_person_id: event.target.value || null })}
                  >
                    <option value="">Sem lider definido</option>
                    {people.map((person) => (
                      <option key={person.id} value={person.id}>{person.name}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Co-lideres">
                  <select
                    multiple
                    className={`${inputClass} min-h-32`}
                    value={setting.co_leader_person_ids ?? []}
                    onChange={(event) => {
                      const values = Array.from(event.target.selectedOptions).map((option) => option.value);
                      updateDepartment(setting, { co_leader_person_ids: values });
                    }}
                  >
                    {people.map((person) => (
                      <option key={person.id} value={person.id}>{person.name}</option>
                    ))}
                  </select>
                </Field>
                <p className="text-xs text-ink/55">Dica: segure Ctrl para selecionar mais de um co-lider no computador.</p>
              </div>
            </Card>
          );
        })}
      </div>
    </PageShell>
  );
}
