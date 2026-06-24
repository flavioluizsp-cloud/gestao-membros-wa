-- Importacao conservadora do controle de membros enviado em PDF.
-- Nao substitui telefone, e-mail, data completa ou familiares ja cadastrados.
-- Novos nomes claros entram como frequentadores; nomes ambiguos sao ignorados.

create temporary table pdf_member_import (name text, birth_date date, birth_day smallint, birth_month smallint, life_stage text, is_baptized boolean, safe_insert boolean) on commit drop;

insert into pdf_member_import (name,birth_date,birth_day,birth_month,life_stage,is_baptized,safe_insert) values
  ('Pr Flávio Peres', '1980-01-01'::date, 1, 1, null, true, true),
  ('Pra Raquel', '1976-12-28'::date, 28, 12, null, true, true),
  ('Ana Lígia', '2007-08-03'::date, 3, 8, null, true, true),
  ('Isabel', '2012-11-28'::date, 28, 11, 'adolescente', false, true),
  ('Pr Atílio Mingotti', '1957-12-17'::date, 17, 12, null, true, true),
  ('Roseli Mingotti', '1964-04-23'::date, 23, 4, null, true, true),
  ('Daniel Mingotti', '1986-03-01'::date, 1, 3, null, true, true),
  ('Ana Santin', '1989-01-16'::date, 16, 1, null, true, true),
  ('Benjamim', '2019-03-27'::date, 27, 3, 'crianca', false, true),
  ('Maitê', '2024-02-14'::date, 14, 2, 'crianca', false, true),
  ('Josiane Santin Gomes', '1989-12-02'::date, 2, 12, null, true, true),
  ('Thiago Gomes', '1980-09-30'::date, 30, 9, null, true, true),
  ('Davi Santin Gomes', '2017-06-10'::date, 10, 6, 'crianca', false, true),
  ('Mariah Santin Gomes', '2020-01-27'::date, 27, 1, 'crianca', false, true),
  ('Nerci Santin Junior', '1985-05-20'::date, 20, 5, null, true, true),
  ('Karina Paludo Santin', '1988-01-05'::date, 5, 1, null, true, true),
  ('Vicente Paludo Santim', '2018-05-06'::date, 6, 5, 'crianca', false, true),
  ('Miguel Paludo Santin', '2018-05-06'::date, 6, 5, 'crianca', false, true),
  ('Nerci Santim', null, null, null, null, false, true),
  ('Cacilda (Kiki) Santin', null, 19, 11, null, false, true),
  ('Pr Elias Fronza', null, 22, 11, null, true, true),
  ('Karine Vaz Fronza', null, 30, 6, null, true, true),
  ('Juliana Vaz', null, 14, 5, null, false, true),
  ('Clara (Juliana)', null, null, null, null, false, false),
  ('Gabriele Vaz', null, 8, 2, null, true, true),
  ('Pedro Herinque Fracaro Vaz', null, 7, 12, null, false, true),
  ('Diego Gomes', null, 2, 12, null, true, true),
  ('Jennifer Baptista Gomes', null, 30, 4, null, true, true),
  ('Rebeca Baptista Gomes', null, 2, 12, 'crianca', false, true),
  ('Filipe Baptista Gomes', null, 7, 6, 'crianca', false, true),
  ('Kelvin Pompeo', null, 30, 12, null, true, true),
  ('Gabi', null, 17, 2, null, true, false),
  ('Marcil Pompeo da Silva', null, 18, 11, null, true, true),
  ('Cátia Cristina da Silva', null, 9, 10, null, true, true),
  ('Kamilla Vittória Pompeo', null, 26, 5, null, true, true),
  ('Heloise Pompeo', null, 12, 8, null, false, true),
  ('Emanuel Pompeo', null, 28, 8, 'crianca', false, true),
  ('João Marcelo Schulmeister', '1975-06-27'::date, 27, 6, null, true, true),
  ('Cristina Machado Schulmeister', '1979-03-01'::date, 1, 3, null, true, true),
  ('João Pedro Machado', '2019-10-15'::date, 15, 10, 'crianca', false, true),
  ('Teresa Zancanar Schulmeister', '1950-03-21'::date, 21, 3, null, false, true),
  ('Menaide', null, null, null, null, true, false),
  ('Evandro Grando', '1983-09-07'::date, 7, 9, null, true, true),
  ('Patricia Machado Grando', '1988-01-06'::date, 6, 1, null, true, true),
  ('Guilherme Grando', '2012-03-01'::date, 1, 3, 'adolescente', false, true),
  ('Lucas Grando', '2020-10-26'::date, 26, 10, 'crianca', false, true),
  ('Marcelo Neuls', '1978-08-15'::date, 15, 8, null, false, true),
  ('Nuria Verginia Pazinato Neuls', '1982-04-24'::date, 24, 4, null, true, true),
  ('Marcelo Tarcísio Pazinato Neuls', '1998-12-26'::date, 26, 12, null, false, true),
  ('Bruna Siviero Neuls', '1998-12-22'::date, 22, 12, null, false, true),
  ('Sérgio Junior Picinin', null, 24, 7, null, false, true),
  ('Ivonete Bogo', null, 3, 9, null, true, true),
  ('Eliane Freitas de Souza (Isa)', '1980-05-05'::date, 5, 5, null, true, true),
  ('Arno de souza', '1973-11-09'::date, 9, 11, null, true, true),
  ('Luan Freitas de Souza', '2004-02-05'::date, 5, 2, null, true, true),
  ('Laís Freitas de Souza', '2008-11-26'::date, 26, 11, null, true, true),
  ('Antônio da Silva (Toni)', null, null, null, null, true, true),
  ('Jozimara (Mara)', null, null, null, null, true, true),
  ('Petronilha', null, null, null, null, true, false),
  ('Geraldo Gotardo', '1959-02-25'::date, 25, 2, null, false, true),
  ('Ester Biazussi Gotardo', '1964-08-05'::date, 5, 8, null, true, true),
  ('Gabriela Mara Gotardo', '1994-04-27'::date, 27, 4, null, true, true),
  ('Bruna Biazussi Gotardo', '1989-01-04'::date, 4, 1, null, true, true),
  ('Benicio Moro', '2020-05-25'::date, 25, 5, 'crianca', false, true),
  ('Lavinia Moro', '2025-01-17'::date, 17, 1, 'crianca', false, true),
  ('Newton (Hugo)', null, 1, 4, null, true, true),
  ('Geslaine Michelin Bittencourt', null, 22, 9, null, true, true),
  ('Filho Gesleine', null, null, null, null, false, false),
  ('Luciane ?', null, null, null, null, false, true),
  ('Amiga Geslaine', null, null, null, null, false, false),
  ('Viviane (PG Geslaine)', null, null, null, null, false, true),
  ('Filha Viviane', null, null, null, null, false, false),
  ('Filha Viviane', null, null, null, null, false, false),
  ('Lucas Danilo Gosch', '1990-03-16'::date, 16, 3, null, true, true),
  ('Francieli Squena Gosch', '1993-09-30'::date, 30, 9, null, true, true),
  ('Cecília', '2023-04-22'::date, 22, 4, 'crianca', false, false),
  ('Volmir Farina', '1972-03-27'::date, 27, 3, null, true, true),
  ('Abigail Delgado Caleffi Farina', '1971-10-31'::date, 31, 10, null, true, true),
  ('Marcos Farina', '2003-04-01'::date, 1, 4, null, true, true),
  ('Fernanda (Namorada Marcos)', null, null, null, null, false, true),
  ('Marcos Yano', null, null, null, null, false, true),
  ('Cleoni Freitas Tedesco', null, 15, 1, null, true, true),
  ('Valdecir Tedesco', null, 5, 6, null, true, true),
  ('Laura Vitoria Tedesco', null, 3, 1, null, false, true),
  ('Ana Carolina Tedesco', null, null, null, null, true, true),
  ('Andrio De Biasi', '2000-03-06'::date, 6, 3, null, true, true),
  ('Marla da Silva De Biasi', '2003-01-05'::date, 5, 1, null, true, true),
  ('Suélen Soares', null, null, null, null, false, true),
  ('Yaxodara', null, null, null, 'adolescente', false, false),
  ('Eliane Felisberto Lemos', null, 24, 8, null, true, true),
  ('Gilson Antônio Lemos', null, 11, 6, null, false, true),
  ('Bruno Antônio Lemos', null, 22, 8, null, false, true),
  ('Sara Helena', null, 14, 9, 'adolescente', false, true),
  ('Vitor (Eliane)', null, null, null, null, true, false),
  ('Paula (Vitor)', null, null, null, null, true, false),
  ('Carolina Costa Lara', null, 23, 10, null, true, true),
  ('João Pedro', null, 15, 7, 'crianca', false, true),
  ('Mateus', null, 22, 9, 'crianca', false, false),
  ('Vicente', null, 22, 9, 'crianca', false, false),
  ('Daniela Costa', null, null, null, null, false, true),
  ('Jean', null, null, null, null, false, false),
  ('Iohana', null, null, null, 'crianca', false, true),
  ('Marcelo José Gonçalves Lins', '1982-05-17'::date, 17, 5, null, true, true),
  ('Franciele Regina zilli Lins', '1986-03-31'::date, 31, 3, null, true, true),
  ('Samuel Zilli Gonçalves Lins', '2017-03-30'::date, 30, 3, 'crianca', false, true),
  ('Maria Izabel zilli Gonçalves Lins', '2023-01-09'::date, 9, 1, 'crianca', false, true),
  ('Tadeu Ribeiro', null, 5, 8, null, true, true),
  ('Ângela Ribeiro', null, 16, 9, null, true, true),
  ('Júlia Ribeiro', null, 26, 5, null, true, true),
  ('Maria Stoc Silva', '1949-09-05'::date, 5, 9, null, true, true),
  ('Afonso Soares', '1971-02-26'::date, 26, 2, null, true, true),
  ('Eva Marines Soares', '1974-02-03'::date, 3, 2, null, true, true),
  ('Matheus Afonso Soares', '1999-05-30'::date, 30, 5, null, false, true),
  ('Tobias Gabriel Soares', '2012-02-16'::date, 16, 2, 'adolescente', false, true),
  ('Ivanete (Iva)', null, null, null, null, true, true),
  ('Joaquim Vitor ribas de freitas', '2006-05-27'::date, 27, 5, null, true, true),
  ('João Brasil', null, null, null, null, false, true),
  ('Bonérgio', null, null, null, null, true, false),
  ('Tere', null, null, null, null, true, false),
  ('Marcelo Santos', null, null, null, null, true, true),
  ('Fernanda Santos', null, null, null, null, true, true),
  ('Gabriel', null, null, null, null, true, false),
  ('Gabriela', null, null, null, 'crianca', false, false),
  ('Patricia (Tênis)', null, null, null, null, false, true),
  ('João (Patricia)', null, null, null, 'crianca', false, false),
  ('João Veloso', null, null, null, null, false, true),
  ('Heudes Andrade', '1992-12-12'::date, 12, 12, null, true, true),
  ('Gilselle Andrade', '1992-12-05'::date, 5, 12, null, true, true),
  ('Isabella Andrade', '2019-01-19'::date, 19, 1, 'crianca', false, true),
  ('Solange Batistella', null, null, null, null, true, true),
  ('Moacir (Xaxim) Battistela', null, null, null, null, true, true),
  ('Kiane', null, null, null, null, true, false),
  ('Felipe', null, null, null, null, true, false),
  ('Miguel', null, null, null, 'crianca', false, false),
  ('Filha (Kiane)', null, null, null, 'crianca', false, false),
  ('Assis', null, 4, 9, null, true, false),
  ('Lurdes', null, 20, 12, null, true, false),
  ('Rosilete de oliveira da Silva (Lete)', null, 7, 12, null, true, true),
  ('Ladimir Luiz da Silva (Ladi)', null, 18, 7, null, true, true),
  ('Valtoir (Tuica)', null, 30, 6, null, true, true),
  ('Loreni (Lori)', null, 26, 2, null, true, true),
  ('William (Lori)', null, null, null, null, true, true),
  ('Dâmares', null, null, null, null, false, false),
  ('Noah', null, null, null, null, false, false),
  ('Jandir Santin', null, null, null, null, true, true),
  ('Rose Santin', null, null, null, null, true, true),
  ('Luiz Carlos Kiki', null, null, null, null, true, true),
  ('Rosangela Kiki', null, null, null, null, true, true),
  ('Noir', null, null, null, null, true, false),
  ('Carlinda', null, null, null, null, true, false),
  ('Valmor Domanski (Biloca)', null, 17, 5, null, true, true),
  ('Juliana Becker Domanski', null, 11, 11, null, true, true),
  ('Davi Becker Domanski', null, 13, 5, 'crianca', false, true),
  ('Sofia Becker Domanski', null, 29, 11, 'crianca', false, true),
  ('Cirlei Terezinha Riedel', null, 25, 7, null, false, true),
  ('Deivid', null, 24, 6, null, false, false),
  ('Lady Sara', null, 13, 1, null, false, true),
  ('Miguel', null, 30, 12, 'crianca', false, false),
  ('Joaquim', null, 12, 2, 'crianca', false, false),
  ('Toni Storlaski', null, null, null, null, true, true),
  ('Sirlei Storlaski', null, null, null, null, true, true),
  ('Celso', null, null, null, null, true, false),
  ('Marilene', null, null, null, null, true, false),
  ('William', null, null, null, null, true, false),
  ('Filho Celso (Moreno)', null, null, null, null, false, false),
  ('Esposa', null, null, null, null, false, false),
  ('Filho', null, null, null, null, false, false),
  ('Aline Dias', null, 25, 1, null, true, true),
  ('Marcos Cunha', null, 22, 4, null, true, true),
  ('Melissa Dias', null, 27, 1, 'adolescente', false, true),
  ('Yasmim Dias', null, 17, 9, 'crianca', false, true),
  ('Vinilda Ap de Souza', '1979-02-21'::date, 21, 2, null, true, true),
  ('Maria da Luz de Souza', '1939-11-22'::date, 22, 11, null, true, true),
  ('Taionara Bertan', null, 30, 7, null, false, true),
  ('Dangle Miguel', null, 5, 8, null, true, true),
  ('Julia (Dangle)', null, 13, 7, 'crianca', false, true),
  ('João Antônio (Taionara)', null, 24, 7, null, false, false),
  ('Theodoro (Taionara)', null, 22, 8, null, false, false),
  ('Daiane Maciel', '1982-09-10'::date, 10, 9, null, false, true),
  ('Marcio Maciel', '1980-07-16'::date, 16, 7, null, false, true),
  ('Kauana Siqueira', '2005-12-13'::date, 13, 12, null, false, true),
  ('Yuri Miguel Maciel', '2004-02-07'::date, 7, 2, null, false, true),
  ('Vinicius (Kauana)', null, 6, 4, null, false, false),
  ('Matheus Becker', null, 12, 12, null, false, true),
  ('Lucas Luiz Fabris', '1992-07-01'::date, 1, 7, null, true, true),
  ('Odila Maria Miguel', '1954-12-31'::date, 31, 12, null, true, true),
  ('Amilton Serafim Miguel', '1954-09-13'::date, 13, 9, null, true, true),
  ('Sebastiana', null, null, null, null, true, false),
  ('Gonçalves', null, null, null, null, true, false),
  ('Bianca', null, null, null, null, true, false),
  ('Édina Mota Dos Santos Coradin', '1987-04-07'::date, 7, 4, null, true, true),
  ('Rodrigo Coradin', '1986-12-27'::date, 27, 12, null, true, true),
  ('Natasha Mota Coradin', '2017-04-29'::date, 29, 4, 'crianca', false, true),
  ('Marlene', '1966-11-20'::date, 20, 11, null, true, false),
  ('Jhenifer', null, null, null, null, true, false),
  ('Filho Jhenifer 1', null, null, null, 'crianca', false, false),
  ('Filho Jhenifer 2', null, null, null, 'crianca', false, false),
  ('Filho Jhenifer 3', null, null, null, 'crianca', false, false),
  ('Filho Jhenifer 4', null, null, null, 'crianca', false, false),
  ('Carmem (Mãe Jhenifer)', null, null, null, null, false, true),
  ('Nelson Gelinski', null, null, null, null, false, true),
  ('Marlise Gelinski', null, null, null, null, true, true),
  ('Salete', null, null, null, null, true, false),
  ('Companheiro Salete', null, null, null, null, false, false),
  ('Eliane (Adriano)', null, null, null, null, false, true),
  ('Adriano', null, null, null, null, false, false),
  ('Filho Eliane/Adriano', null, null, null, null, false, false),
  ('Alan (Rádio)', null, null, null, null, false, true),
  ('Esposa Alan', null, null, null, null, false, false),
  ('Filha Alan', null, null, null, null, false, false),
  ('Filho Alan', null, null, null, null, false, false),
  ('Bibi (Abigail)', null, null, null, null, false, true),
  ('Odivan (Bibi)', null, null, null, null, false, false),
  ('Menina Bibi', null, null, null, null, false, false),
  ('Martin (Bibi)', null, null, null, null, false, false),
  ('Edenir Loureiro (Arno)', null, null, null, null, false, false);


create or replace function pg_temp.normalized_person_name(value text)
returns text language sql immutable as $$
  select trim(regexp_replace(
    regexp_replace(translate(lower(coalesce(value, '')), 'áàâãäéèêëíìîïóòôõöúùûüç', 'aaaaaeeeeiiiiooooouuuuc'), '^(pr|pra|dc|pb)\s+', ''),
    '[^a-z0-9]+', ' ', 'g'
  ));
$$;

-- Completa somente informacoes ausentes em perfis existentes com correspondencia unica.
with unique_source as (
  select *, count(*) over (partition by pg_temp.normalized_person_name(name)) as source_count
  from pdf_member_import
), matches as (
  select p.id, s.*
  from membros.people p
  join unique_source s on s.source_count = 1 and (
    pg_temp.normalized_person_name(p.name) = pg_temp.normalized_person_name(s.name)
    or pg_temp.normalized_person_name(p.preferred_name) = pg_temp.normalized_person_name(s.name)
  )
)
update membros.people p
set
  birth_date = coalesce(p.birth_date, m.birth_date),
  birth_day = coalesce(p.birth_day, m.birth_day),
  birth_month = coalesce(p.birth_month, m.birth_month),
  life_stage = coalesce(p.life_stage, m.life_stage),
  is_baptized = case when m.is_baptized then true else p.is_baptized end
from matches m
where p.id = m.id;

-- Cria apenas nomes suficientemente claros que ainda nao existem.
insert into membros.people (
  name, phone, status, birth_date, birth_day, birth_month, life_stage,
  is_baptized, notes, pending_approval
)
select
  source.name, '', 'frequentador', source.birth_date, source.birth_day, source.birth_month,
  source.life_stage, source.is_baptized,
  'Importado do controle de membros em 24/06/2026.', false
from pdf_member_import source
where source.safe_insert
  and not exists (
    select 1 from membros.people p
    where pg_temp.normalized_person_name(p.name) = pg_temp.normalized_person_name(source.name)
       or pg_temp.normalized_person_name(p.preferred_name) = pg_temp.normalized_person_name(source.name)
  );

create or replace function pg_temp.add_family_member(
  target_name text,
  relative_name text,
  relationship_name text,
  relative_birth text default ''
) returns void language plpgsql as $$
declare target_id uuid;
begin
  select id into target_id
  from membros.people
  where pg_temp.normalized_person_name(name) = pg_temp.normalized_person_name(target_name)
     or pg_temp.normalized_person_name(preferred_name) = pg_temp.normalized_person_name(target_name)
  order by created_at
  limit 1;

  if target_id is null then return; end if;

  update membros.people p
  set family_members = coalesce(p.family_members, '[]'::jsonb) || jsonb_build_array(
    jsonb_build_object('name', relative_name, 'relationship', relationship_name, 'birth_date', relative_birth)
  )
  where p.id = target_id
    and not exists (
      select 1 from jsonb_array_elements(coalesce(p.family_members, '[]'::jsonb)) item
      where pg_temp.normalized_person_name(item->>'name') = pg_temp.normalized_person_name(relative_name)
        and lower(coalesce(item->>'relationship', '')) = lower(relationship_name)
    );
end;
$$;

select pg_temp.add_family_member('Daniel Mingotti', 'Ana Santin', 'Conjuge', '1989-01-16');
select pg_temp.add_family_member('Ana Santin', 'Daniel Mingotti', 'Conjuge', '1986-03-01');
update membros.people set marital_status = coalesce(marital_status, 'casado') where pg_temp.normalized_person_name(name) in (pg_temp.normalized_person_name('Daniel Mingotti'), pg_temp.normalized_person_name('Ana Santin'));
select pg_temp.add_family_member('Daniel Mingotti', 'Benjamim', 'Filho(a)', '2019-03-27');
select pg_temp.add_family_member('Ana Santin', 'Benjamim', 'Filho(a)', '2019-03-27');
select pg_temp.add_family_member('Benjamim', 'Daniel Mingotti', 'Pai/Mae', '1986-03-01');
select pg_temp.add_family_member('Benjamim', 'Ana Santin', 'Pai/Mae', '1989-01-16');
select pg_temp.add_family_member('Daniel Mingotti', 'Maitê', 'Filho(a)', '2024-02-14');
select pg_temp.add_family_member('Ana Santin', 'Maitê', 'Filho(a)', '2024-02-14');
select pg_temp.add_family_member('Maitê', 'Daniel Mingotti', 'Pai/Mae', '1986-03-01');
select pg_temp.add_family_member('Maitê', 'Ana Santin', 'Pai/Mae', '1989-01-16');
select pg_temp.add_family_member('Josiane Santin Gomes', 'Thiago Gomes', 'Conjuge', '1980-09-30');
select pg_temp.add_family_member('Thiago Gomes', 'Josiane Santin Gomes', 'Conjuge', '1989-12-02');
update membros.people set marital_status = coalesce(marital_status, 'casado') where pg_temp.normalized_person_name(name) in (pg_temp.normalized_person_name('Josiane Santin Gomes'), pg_temp.normalized_person_name('Thiago Gomes'));
select pg_temp.add_family_member('Josiane Santin Gomes', 'Davi Santin Gomes', 'Filho(a)', '2017-06-10');
select pg_temp.add_family_member('Thiago Gomes', 'Davi Santin Gomes', 'Filho(a)', '2017-06-10');
select pg_temp.add_family_member('Davi Santin Gomes', 'Josiane Santin Gomes', 'Pai/Mae', '1989-12-02');
select pg_temp.add_family_member('Davi Santin Gomes', 'Thiago Gomes', 'Pai/Mae', '1980-09-30');
select pg_temp.add_family_member('Josiane Santin Gomes', 'Mariah Santin Gomes', 'Filho(a)', '2020-01-27');
select pg_temp.add_family_member('Thiago Gomes', 'Mariah Santin Gomes', 'Filho(a)', '2020-01-27');
select pg_temp.add_family_member('Mariah Santin Gomes', 'Josiane Santin Gomes', 'Pai/Mae', '1989-12-02');
select pg_temp.add_family_member('Mariah Santin Gomes', 'Thiago Gomes', 'Pai/Mae', '1980-09-30');
select pg_temp.add_family_member('Nerci Santin Junior', 'Karina Paludo Santin', 'Conjuge', '1988-01-05');
select pg_temp.add_family_member('Karina Paludo Santin', 'Nerci Santin Junior', 'Conjuge', '1985-05-20');
update membros.people set marital_status = coalesce(marital_status, 'casado') where pg_temp.normalized_person_name(name) in (pg_temp.normalized_person_name('Nerci Santin Junior'), pg_temp.normalized_person_name('Karina Paludo Santin'));
select pg_temp.add_family_member('Nerci Santin Junior', 'Vicente Paludo Santim', 'Filho(a)', '2018-05-06');
select pg_temp.add_family_member('Karina Paludo Santin', 'Vicente Paludo Santim', 'Filho(a)', '2018-05-06');
select pg_temp.add_family_member('Vicente Paludo Santim', 'Nerci Santin Junior', 'Pai/Mae', '1985-05-20');
select pg_temp.add_family_member('Vicente Paludo Santim', 'Karina Paludo Santin', 'Pai/Mae', '1988-01-05');
select pg_temp.add_family_member('Nerci Santin Junior', 'Miguel Paludo Santin', 'Filho(a)', '2018-05-06');
select pg_temp.add_family_member('Karina Paludo Santin', 'Miguel Paludo Santin', 'Filho(a)', '2018-05-06');
select pg_temp.add_family_member('Miguel Paludo Santin', 'Nerci Santin Junior', 'Pai/Mae', '1985-05-20');
select pg_temp.add_family_member('Miguel Paludo Santin', 'Karina Paludo Santin', 'Pai/Mae', '1988-01-05');
select pg_temp.add_family_member('Diego Gomes', 'Jennifer Baptista Gomes', 'Conjuge', '30/04');
select pg_temp.add_family_member('Jennifer Baptista Gomes', 'Diego Gomes', 'Conjuge', '02/12');
update membros.people set marital_status = coalesce(marital_status, 'casado') where pg_temp.normalized_person_name(name) in (pg_temp.normalized_person_name('Diego Gomes'), pg_temp.normalized_person_name('Jennifer Baptista Gomes'));
select pg_temp.add_family_member('Diego Gomes', 'Rebeca Baptista Gomes', 'Filho(a)', '02/12');
select pg_temp.add_family_member('Jennifer Baptista Gomes', 'Rebeca Baptista Gomes', 'Filho(a)', '02/12');
select pg_temp.add_family_member('Rebeca Baptista Gomes', 'Diego Gomes', 'Pai/Mae', '02/12');
select pg_temp.add_family_member('Rebeca Baptista Gomes', 'Jennifer Baptista Gomes', 'Pai/Mae', '30/04');
select pg_temp.add_family_member('Diego Gomes', 'Filipe Baptista Gomes', 'Filho(a)', '07/06');
select pg_temp.add_family_member('Jennifer Baptista Gomes', 'Filipe Baptista Gomes', 'Filho(a)', '07/06');
select pg_temp.add_family_member('Filipe Baptista Gomes', 'Diego Gomes', 'Pai/Mae', '02/12');
select pg_temp.add_family_member('Filipe Baptista Gomes', 'Jennifer Baptista Gomes', 'Pai/Mae', '30/04');
select pg_temp.add_family_member('Evandro Grando', 'Patricia Machado Grando', 'Conjuge', '1988-01-06');
select pg_temp.add_family_member('Patricia Machado Grando', 'Evandro Grando', 'Conjuge', '1983-09-07');
update membros.people set marital_status = coalesce(marital_status, 'casado') where pg_temp.normalized_person_name(name) in (pg_temp.normalized_person_name('Evandro Grando'), pg_temp.normalized_person_name('Patricia Machado Grando'));
select pg_temp.add_family_member('Evandro Grando', 'Guilherme Grando', 'Filho(a)', '2012-03-01');
select pg_temp.add_family_member('Patricia Machado Grando', 'Guilherme Grando', 'Filho(a)', '2012-03-01');
select pg_temp.add_family_member('Guilherme Grando', 'Evandro Grando', 'Pai/Mae', '1983-09-07');
select pg_temp.add_family_member('Guilherme Grando', 'Patricia Machado Grando', 'Pai/Mae', '1988-01-06');
select pg_temp.add_family_member('Evandro Grando', 'Lucas Grando', 'Filho(a)', '2020-10-26');
select pg_temp.add_family_member('Patricia Machado Grando', 'Lucas Grando', 'Filho(a)', '2020-10-26');
select pg_temp.add_family_member('Lucas Grando', 'Evandro Grando', 'Pai/Mae', '1983-09-07');
select pg_temp.add_family_member('Lucas Grando', 'Patricia Machado Grando', 'Pai/Mae', '1988-01-06');
select pg_temp.add_family_member('Lucas Danilo Gosch', 'Francieli Squena Gosch', 'Conjuge', '1993-09-30');
select pg_temp.add_family_member('Francieli Squena Gosch', 'Lucas Danilo Gosch', 'Conjuge', '1990-03-16');
update membros.people set marital_status = coalesce(marital_status, 'casado') where pg_temp.normalized_person_name(name) in (pg_temp.normalized_person_name('Lucas Danilo Gosch'), pg_temp.normalized_person_name('Francieli Squena Gosch'));
select pg_temp.add_family_member('Andrio De Biasi', 'Marla da Silva De Biasi', 'Conjuge', '2003-01-05');
select pg_temp.add_family_member('Marla da Silva De Biasi', 'Andrio De Biasi', 'Conjuge', '2000-03-06');
update membros.people set marital_status = coalesce(marital_status, 'casado') where pg_temp.normalized_person_name(name) in (pg_temp.normalized_person_name('Andrio De Biasi'), pg_temp.normalized_person_name('Marla da Silva De Biasi'));
select pg_temp.add_family_member('Andrio De Biasi', 'Yaxodara', 'Filho(a)', '');
select pg_temp.add_family_member('Marla da Silva De Biasi', 'Yaxodara', 'Filho(a)', '');
select pg_temp.add_family_member('Yaxodara', 'Andrio De Biasi', 'Pai/Mae', '2000-03-06');
select pg_temp.add_family_member('Yaxodara', 'Marla da Silva De Biasi', 'Pai/Mae', '2003-01-05');
select pg_temp.add_family_member('Daniela Costa', 'Jean', 'Conjuge', '');
select pg_temp.add_family_member('Jean', 'Daniela Costa', 'Conjuge', '');
update membros.people set marital_status = coalesce(marital_status, 'casado') where pg_temp.normalized_person_name(name) in (pg_temp.normalized_person_name('Daniela Costa'), pg_temp.normalized_person_name('Jean'));
select pg_temp.add_family_member('Daniela Costa', 'Iohana', 'Filho(a)', '');
select pg_temp.add_family_member('Jean', 'Iohana', 'Filho(a)', '');
select pg_temp.add_family_member('Iohana', 'Daniela Costa', 'Pai/Mae', '');
select pg_temp.add_family_member('Iohana', 'Jean', 'Pai/Mae', '');
select pg_temp.add_family_member('Afonso Soares', 'Eva Marines Soares', 'Conjuge', '1974-02-03');
select pg_temp.add_family_member('Eva Marines Soares', 'Afonso Soares', 'Conjuge', '1971-02-26');
update membros.people set marital_status = coalesce(marital_status, 'casado') where pg_temp.normalized_person_name(name) in (pg_temp.normalized_person_name('Afonso Soares'), pg_temp.normalized_person_name('Eva Marines Soares'));
select pg_temp.add_family_member('Afonso Soares', 'Tobias Gabriel Soares', 'Filho(a)', '2012-02-16');
select pg_temp.add_family_member('Eva Marines Soares', 'Tobias Gabriel Soares', 'Filho(a)', '2012-02-16');
select pg_temp.add_family_member('Tobias Gabriel Soares', 'Afonso Soares', 'Pai/Mae', '1971-02-26');
select pg_temp.add_family_member('Tobias Gabriel Soares', 'Eva Marines Soares', 'Pai/Mae', '1974-02-03');
select pg_temp.add_family_member('Marcelo Santos', 'Fernanda Santos', 'Conjuge', '');
select pg_temp.add_family_member('Fernanda Santos', 'Marcelo Santos', 'Conjuge', '');
update membros.people set marital_status = coalesce(marital_status, 'casado') where pg_temp.normalized_person_name(name) in (pg_temp.normalized_person_name('Marcelo Santos'), pg_temp.normalized_person_name('Fernanda Santos'));
select pg_temp.add_family_member('Marcelo Santos', 'Gabriela', 'Filho(a)', '');
select pg_temp.add_family_member('Fernanda Santos', 'Gabriela', 'Filho(a)', '');
select pg_temp.add_family_member('Gabriela', 'Marcelo Santos', 'Pai/Mae', '');
select pg_temp.add_family_member('Gabriela', 'Fernanda Santos', 'Pai/Mae', '');
select pg_temp.add_family_member('Heudes Andrade', 'Gilselle Andrade', 'Conjuge', '1992-12-05');
select pg_temp.add_family_member('Gilselle Andrade', 'Heudes Andrade', 'Conjuge', '1992-12-12');
update membros.people set marital_status = coalesce(marital_status, 'casado') where pg_temp.normalized_person_name(name) in (pg_temp.normalized_person_name('Heudes Andrade'), pg_temp.normalized_person_name('Gilselle Andrade'));
select pg_temp.add_family_member('Heudes Andrade', 'Isabella Andrade', 'Filho(a)', '2019-01-19');
select pg_temp.add_family_member('Gilselle Andrade', 'Isabella Andrade', 'Filho(a)', '2019-01-19');
select pg_temp.add_family_member('Isabella Andrade', 'Heudes Andrade', 'Pai/Mae', '1992-12-12');
select pg_temp.add_family_member('Isabella Andrade', 'Gilselle Andrade', 'Pai/Mae', '1992-12-05');
select pg_temp.add_family_member('Kiane', 'Felipe', 'Conjuge', '');
select pg_temp.add_family_member('Felipe', 'Kiane', 'Conjuge', '');
update membros.people set marital_status = coalesce(marital_status, 'casado') where pg_temp.normalized_person_name(name) in (pg_temp.normalized_person_name('Kiane'), pg_temp.normalized_person_name('Felipe'));
select pg_temp.add_family_member('Kiane', 'Miguel', 'Filho(a)', '30/12');
select pg_temp.add_family_member('Felipe', 'Miguel', 'Filho(a)', '30/12');
select pg_temp.add_family_member('Miguel', 'Kiane', 'Pai/Mae', '');
select pg_temp.add_family_member('Miguel', 'Felipe', 'Pai/Mae', '');
select pg_temp.add_family_member('Valmor Domanski (Biloca)', 'Juliana Becker Domanski', 'Conjuge', '11/11');
select pg_temp.add_family_member('Juliana Becker Domanski', 'Valmor Domanski (Biloca)', 'Conjuge', '17/05');
update membros.people set marital_status = coalesce(marital_status, 'casado') where pg_temp.normalized_person_name(name) in (pg_temp.normalized_person_name('Valmor Domanski (Biloca)'), pg_temp.normalized_person_name('Juliana Becker Domanski'));
select pg_temp.add_family_member('Valmor Domanski (Biloca)', 'Davi Becker Domanski', 'Filho(a)', '13/05');
select pg_temp.add_family_member('Juliana Becker Domanski', 'Davi Becker Domanski', 'Filho(a)', '13/05');
select pg_temp.add_family_member('Davi Becker Domanski', 'Valmor Domanski (Biloca)', 'Pai/Mae', '17/05');
select pg_temp.add_family_member('Davi Becker Domanski', 'Juliana Becker Domanski', 'Pai/Mae', '11/11');
select pg_temp.add_family_member('Valmor Domanski (Biloca)', 'Sofia Becker Domanski', 'Filho(a)', '29/11');
select pg_temp.add_family_member('Juliana Becker Domanski', 'Sofia Becker Domanski', 'Filho(a)', '29/11');
select pg_temp.add_family_member('Sofia Becker Domanski', 'Valmor Domanski (Biloca)', 'Pai/Mae', '17/05');
select pg_temp.add_family_member('Sofia Becker Domanski', 'Juliana Becker Domanski', 'Pai/Mae', '11/11');
select pg_temp.add_family_member('Deivid', 'Lady Sara', 'Conjuge', '13/01');
select pg_temp.add_family_member('Lady Sara', 'Deivid', 'Conjuge', '24/06');
update membros.people set marital_status = coalesce(marital_status, 'casado') where pg_temp.normalized_person_name(name) in (pg_temp.normalized_person_name('Deivid'), pg_temp.normalized_person_name('Lady Sara'));
select pg_temp.add_family_member('Deivid', 'Miguel', 'Filho(a)', '30/12');
select pg_temp.add_family_member('Lady Sara', 'Miguel', 'Filho(a)', '30/12');
select pg_temp.add_family_member('Miguel', 'Deivid', 'Pai/Mae', '24/06');
select pg_temp.add_family_member('Miguel', 'Lady Sara', 'Pai/Mae', '13/01');
select pg_temp.add_family_member('Deivid', 'Joaquim', 'Filho(a)', '12/02');
select pg_temp.add_family_member('Lady Sara', 'Joaquim', 'Filho(a)', '12/02');
select pg_temp.add_family_member('Joaquim', 'Deivid', 'Pai/Mae', '24/06');
select pg_temp.add_family_member('Joaquim', 'Lady Sara', 'Pai/Mae', '13/01');
select pg_temp.add_family_member('Aline Dias', 'Marcos Cunha', 'Conjuge', '22/04');
select pg_temp.add_family_member('Marcos Cunha', 'Aline Dias', 'Conjuge', '25/01');
update membros.people set marital_status = coalesce(marital_status, 'casado') where pg_temp.normalized_person_name(name) in (pg_temp.normalized_person_name('Aline Dias'), pg_temp.normalized_person_name('Marcos Cunha'));
select pg_temp.add_family_member('Aline Dias', 'Melissa Dias', 'Filho(a)', '27/01');
select pg_temp.add_family_member('Marcos Cunha', 'Melissa Dias', 'Filho(a)', '27/01');
select pg_temp.add_family_member('Melissa Dias', 'Aline Dias', 'Pai/Mae', '25/01');
select pg_temp.add_family_member('Melissa Dias', 'Marcos Cunha', 'Pai/Mae', '22/04');
select pg_temp.add_family_member('Aline Dias', 'Yasmim Dias', 'Filho(a)', '17/09');
select pg_temp.add_family_member('Marcos Cunha', 'Yasmim Dias', 'Filho(a)', '17/09');
select pg_temp.add_family_member('Yasmim Dias', 'Aline Dias', 'Pai/Mae', '25/01');
select pg_temp.add_family_member('Yasmim Dias', 'Marcos Cunha', 'Pai/Mae', '22/04');

select count(*) as registros_pdf from pdf_member_import;
