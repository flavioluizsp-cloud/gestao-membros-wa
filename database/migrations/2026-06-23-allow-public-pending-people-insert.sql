grant usage on schema membros to anon, authenticated;
grant insert on membros.people to anon, authenticated;

drop policy if exists "public can submit pending people" on membros.people;

create policy "public can submit pending people"
on membros.people
for insert
to anon, authenticated
with check (
  pending_approval is true
  and privacy_consent is true
);
