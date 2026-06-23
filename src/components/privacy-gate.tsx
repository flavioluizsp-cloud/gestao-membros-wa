"use client";

import { useState } from "react";
import Link from "next/link";
import { dataResponsibilityText, privacyConsentText, privacyConsentVersion } from "@/lib/privacy";
import { membrosDb } from "@/lib/supabase";
import type { AccessContext } from "@/lib/types";

export function PrivacyGate({ access, children }: { access: AccessContext | null; children: React.ReactNode }) {
  const [accepted, setAccepted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [localApproved, setLocalApproved] = useState(false);
  const needsConsent = Boolean(access?.profile && !access.profile.privacy_consent && !localApproved);

  if (!needsConsent) return <>{children}</>;

  const isResponsibleForData = Boolean(access?.isAdminLike || access?.isLeader);

  async function acceptTerms() {
    if (!membrosDb || !access?.profile || !accepted) return;
    setSaving(true);
    const now = new Date().toISOString();
    const payload = {
      privacy_consent: true,
      privacy_consent_at: now,
      privacy_consent_version: privacyConsentVersion,
      ...(isResponsibleForData
        ? {
            data_responsibility_consent: true,
            data_responsibility_consent_at: now,
            data_responsibility_version: privacyConsentVersion
          }
        : {})
    };
    const { error } = await membrosDb.from("user_profiles").update(payload).eq("id", access.profile.id);
    setSaving(false);
    if (!error) setLocalApproved(true);
  }

  return (
    <section className="mx-auto max-w-2xl rounded-lg border border-line bg-white p-4 shadow-soft">
      <h2 className="text-xl font-bold text-ink">Termo de privacidade e uso de dados</h2>
      <p className="mt-2 text-sm text-ink/65">Antes de continuar, confirme que você está ciente de como os dados serão usados no sistema da igreja.</p>
      <div className="mt-4 space-y-3 text-sm text-ink/70">
        <p>{privacyConsentText}</p>
        {isResponsibleForData ? <p>{dataResponsibilityText}</p> : null}
        <p>
          Leia a{" "}
          <Link href="/privacidade" target="_blank" className="font-semibold text-moss hover:underline">
            Política de Privacidade
          </Link>
          .
        </p>
      </div>
      <label className="mt-4 flex items-start gap-3 rounded-md border border-line p-3 text-sm">
        <input type="checkbox" className="mt-1" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} />
        <span>Li e concordo com o termo de privacidade e uso adequado dos dados.</span>
      </label>
      <button type="button" disabled={!accepted || saving} onClick={acceptTerms} className="mt-4 w-full rounded-md bg-moss px-3 py-2 text-sm font-semibold text-white hover:bg-moss/90 disabled:opacity-50">
        {saving ? "Salvando..." : "Aceitar e continuar"}
      </button>
    </section>
  );
}
