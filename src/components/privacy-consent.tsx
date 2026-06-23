"use client";

import Link from "next/link";
import { privacyConsentText } from "@/lib/privacy";

export function PrivacyConsentCheckbox({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-start gap-3 rounded-md border border-line bg-white p-3 text-sm text-ink/75">
      <input
        required
        type="checkbox"
        className="mt-1"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>
        {privacyConsentText}{" "}
        <Link href="/privacidade" target="_blank" className="font-semibold text-moss hover:underline">
          Ver Política de Privacidade
        </Link>
      </span>
    </label>
  );
}
