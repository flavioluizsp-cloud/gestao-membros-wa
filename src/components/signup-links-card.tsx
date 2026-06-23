"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import { Card } from "@/components/ui";

const siteUrl = "https://gestao-membros-wa.vercel.app";

const links = [
  { label: "Cadastro de membro", url: `${siteUrl}/novo-membro` },
  { label: "Cadastro de visitante", url: `${siteUrl}/registro-visitante` }
];

export function SignupLinksCard({ showApprovals = false }: { showApprovals?: boolean }) {
  const [copied, setCopied] = useState("");

  async function copyLink(url: string, label: string) {
    await navigator.clipboard.writeText(url);
    setCopied(label);
    window.setTimeout(() => setCopied(""), 2500);
  }

  return (
    <Card className="mb-6">
      <h3 className="font-semibold text-ink">Links de cadastro</h3>
      <p className="mt-1 text-sm text-ink/60">Copie e envie quando quiser convidar alguem para preencher os dados.</p>
      <div className="mt-4 grid gap-2">
        {links.map((item) => (
          <div key={item.url} className="grid gap-2 rounded-md border border-line bg-white px-3 py-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink">{item.label}</p>
              <p className="truncate text-xs text-ink/50">{item.url}</p>
            </div>
            <button
              type="button"
              onClick={() => copyLink(item.url, item.label)}
              className="inline-flex w-full items-center justify-center gap-1 rounded-md border border-line px-2.5 py-1.5 text-xs font-semibold text-ink hover:bg-sage"
            >
              <Copy className="h-3.5 w-3.5" />
              {copied === item.label ? "Copiado" : "Copiar"}
            </button>
          </div>
        ))}
      </div>
      {showApprovals ? (
        <a href="/admin/aprovacoes" className="mt-3 inline-flex text-sm font-semibold text-moss hover:underline">
          Ver aprovacoes pendentes
        </a>
      ) : null}
    </Card>
  );
}
