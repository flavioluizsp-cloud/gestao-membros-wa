import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gestao de Igreja via WhatsApp",
  description: "CRM pastoral simples com Supabase e WhatsApp sem API paga."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
