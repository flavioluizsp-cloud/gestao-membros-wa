# Gestao Membros WA

Sistema simples e barato para gestao de igreja com dashboard web e envio de WhatsApp por links `wa.me`, sem API paga no MVP.

## Stack

- Next.js + TypeScript
- Tailwind CSS
- Supabase Auth + PostgreSQL
- Deploy gratuito na Vercel
- WhatsApp via `https://wa.me/55NUMERO?text=MENSAGEM`

## Funcionalidades do MVP

- Dashboard com totais, visitantes do mes, aniversariantes, contatos atrasados, tarefas e eventos.
- Cadastro de pessoas com status, responsavel, observacoes e ultimo contato.
- Cadastro rapido de visitantes com origem, status e botao de WhatsApp.
- Tarefas pastorais com tipo, prazo, responsavel e conclusao.
- Templates editaveis de mensagens.
- Eventos, presenca manual e historico.
- Relatorios simples.
- Login com Supabase Auth e permissoes por papel preparadas no banco.

## Instalar

```bash
npm install
cp .env.example .env.local
npm run dev
```

No Windows PowerShell, se `npm` estiver bloqueado, use:

```bash
npm.cmd install
npm.cmd run dev
```

## Configurar Supabase

1. Crie um projeto gratuito no Supabase.
2. Abra o SQL Editor.
3. Execute o arquivo `database/schema.sql`.
4. Em Authentication, crie os usuarios da equipe.
5. Copie a URL e a anon key para `.env.local`.

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
```

## Deploy na Vercel

1. Suba o projeto para um repositorio Git.
2. Importe na Vercel.
3. Configure as mesmas variaveis de ambiente.
4. Deploy.

## Evolucao prevista

A estrutura ja deixa caminho para WhatsApp Cloud API, automacoes, celulas, financeiro, trilha de discipulado, relatorios avancados e IA pastoral.
