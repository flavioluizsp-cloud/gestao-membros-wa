# Schemas

O sistema deve evitar tabelas de negocio no schema `public`.

- `membros`: cadastro de pessoas, grupos familiares, departamentos, cuidado pastoral, mensagens, eventos, presenca e permissoes.
- `financeiro`: reservado para a futura frente financeira.

Depois de rodar a migracao `2026-06-22-move-member-data-to-schemas.sql`, habilite o schema `membros` na API do Supabase:

1. Project Settings
2. API
3. Exposed schemas
4. Adicione `membros`
5. Salve

O schema `public` deve ficar sem tabelas de negocio.
