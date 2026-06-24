"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, SkipForward } from "lucide-react";
import { Card, PageHeader, PageShell } from "@/components/ui";
import { getAccessContext } from "@/lib/access";
import { membrosDb } from "@/lib/supabase";
import type { Person } from "@/lib/types";

export default function GenderReviewPage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [reviewed, setReviewed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const access = await getAccessContext();
      if (!access.isAdminLike) {
        window.location.href = "/";
        return;
      }
      if (!membrosDb) return;
      const { data } = await membrosDb
        .from("people")
        .select("*")
        .order("name");
      setPeople(((data ?? []) as Person[]).filter((person) => !person.gender?.trim()));
      setLoading(false);
    }
    load();
  }, []);

  const current = people[0];

  async function chooseGender(gender: "M" | "F" | null) {
    if (!current || !membrosDb || saving) return;
    setSaving(true);
    if (gender) {
      const { error } = await membrosDb.from("people").update({ gender }).eq("id", current.id);
      if (error) {
        window.alert(error.message);
        setSaving(false);
        return;
      }
    }
    setPeople((items) => items.slice(1));
    setReviewed((value) => value + 1);
    setSaving(false);
  }

  return (
    <PageShell>
      <PageHeader
        title="Revisao de genero"
        description="Revise apenas os cadastros que ainda nao possuem essa informacao."
        action={<Link href="/pessoas" className="rounded-md border border-line px-3 py-2 text-sm font-semibold text-ink hover:bg-sage">Voltar para Pessoas</Link>}
      />

      <Card className="mb-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-ink">Progresso desta revisao</p>
            <p className="mt-1 text-sm text-ink/60">{reviewed} preenchido(s) agora</p>
          </div>
          <span className="rounded-md bg-sage px-3 py-1.5 text-sm font-bold text-moss">{people.length} pendente(s)</span>
        </div>
      </Card>

      {loading ? <Card><p className="text-sm text-ink/60">Carregando cadastros...</p></Card> : null}

      {!loading && current ? (
        <Card className="mx-auto max-w-xl">
          <p className="text-xs font-semibold uppercase text-ink/50">Pessoa em revisao</p>
          <h3 className="mt-2 text-2xl font-bold text-ink">{current.preferred_name || current.name}</h3>
          {current.preferred_name ? <p className="mt-1 text-sm text-ink/60">{current.name}</p> : null}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button type="button" disabled={saving} onClick={() => chooseGender("M")} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-moss px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">
              <Check className="h-4 w-4" />Masculino
            </button>
            <button type="button" disabled={saving} onClick={() => chooseGender("F")} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-moss px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">
              <Check className="h-4 w-4" />Feminino
            </button>
          </div>
          <button type="button" disabled={saving} onClick={() => chooseGender(null)} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md border border-line px-4 py-3 text-sm font-semibold text-ink/70 hover:bg-sage disabled:opacity-50">
            <SkipForward className="h-4 w-4" />Nao informar e avancar
          </button>
          <Link href={`/pessoas/${current.id}`} className="mt-3 inline-flex w-full items-center justify-center text-sm font-semibold text-moss hover:underline">
            Abrir perfil completo
          </Link>
        </Card>
      ) : null}

      {!loading && !current ? (
        <Card className="mx-auto max-w-xl text-center">
          <h3 className="text-lg font-bold text-ink">Revisao concluida</h3>
          <p className="mt-2 text-sm text-ink/60">Nao ha mais cadastros para revisar nesta sequencia.</p>
          <Link href="/pessoas" className="mt-4 inline-flex rounded-md bg-moss px-4 py-2.5 text-sm font-semibold text-white">Voltar para Pessoas</Link>
        </Card>
      ) : null}
    </PageShell>
  );
}
