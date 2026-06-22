-- Limpeza conservadora baseada na lista enviada em imagem.
-- 1) Remove o sufixo "IBI AL" dos contatos importados.
-- 2) Atualiza datas de nascimento somente quando a lista possui ano.
-- 3) Complementa sobrenome somente em casos claros pelo proprio nome da lista.

update public.people
set name = trim(regexp_replace(name, '\s+IBI AL(\s*\(int\))?$', '\1', 'i'))
where name ~* '\s+IBI AL(\s*\(int\))?$';

update public.people set birth_date = date '1980-01-01' where name ilike 'Pr Flávio Peres' or name ilike 'Flávio Peres';
update public.people set birth_date = date '1976-12-28' where name ilike 'Pra Raquel' or name ilike 'Raquel%';
update public.people set birth_date = date '2007-08-03' where name ilike 'Ana Lígia%' or name ilike 'Ana Ligia%';
update public.people set birth_date = date '1957-12-17' where name ilike 'Pr Atílio Mingotti' or name ilike 'Pr Atilio Mingotti' or name ilike 'Atílio Mingotti%' or name ilike 'Atilio Mingotti%';
update public.people set birth_date = date '1964-04-23' where name ilike 'Roseli Mingotti%';
update public.people set birth_date = date '1986-03-01' where name ilike 'Daniel Mingotti%';
update public.people set birth_date = date '1989-01-16' where name ilike 'Ana Santin%';
update public.people set birth_date = date '2019-03-27' where name ilike 'Benjamim%' or name ilike 'Benjamin%';
update public.people set birth_date = date '2024-02-14' where name ilike 'Maitê%' or name ilike 'Maite%';
update public.people set birth_date = date '1989-12-02' where name ilike 'Josiane Santin Gomes%';
update public.people set birth_date = date '1980-09-30' where name ilike 'Thiago Gomes%';
update public.people set birth_date = date '2017-06-10' where name ilike 'Davi Santin Gomes%';
update public.people set birth_date = date '2020-01-27' where name ilike 'Mariah Santin Gomes%';
update public.people set birth_date = date '1985-05-20' where name ilike 'Nerci Santin Junior%';
update public.people set birth_date = date '1988-01-05' where name ilike 'Karina Paludo Santin%';
update public.people set birth_date = date '2018-05-06' where name ilike 'Miguel Paludo Santin%';
update public.people set birth_date = date '1975-06-27' where name ilike 'João Marcelo Schulmeister%' or name ilike 'Joao Marcelo Schulmeister%';
update public.people set birth_date = date '1979-03-01' where name ilike 'Cristina Machado Schulmeister%';
update public.people set birth_date = date '2019-10-15' where name ilike 'João Pedro Machado%' or name ilike 'Joao Pedro Machado%';
update public.people set birth_date = date '1950-03-21' where name ilike 'Teresa Zancanar Schulmeister%';
update public.people set birth_date = date '1983-09-07' where name ilike 'Evandro Grando%';
update public.people set birth_date = date '1988-01-06' where name ilike 'Patrícia Machado Grando%' or name ilike 'Patricia Machado Grando%';
update public.people set birth_date = date '2012-03-01' where name ilike 'Guilherme Grando%';
update public.people set birth_date = date '2020-10-26' where name ilike 'Lucas Grando%';
update public.people set birth_date = date '1978-08-15' where name ilike 'Marcelo Neuls%';
update public.people set birth_date = date '1982-04-24' where name ilike 'Nuria Verginia Pazinato Neuls%';
update public.people set birth_date = date '1980-05-05' where name ilike 'Eliane Freitas de Souza%' or name ilike 'Eliane Freitas de Souza (Isa)%';
update public.people set birth_date = date '1973-11-09' where name ilike 'Arno de Souza%';
update public.people set birth_date = date '2004-02-05' where name ilike 'Luan Freitas de Souza%';
update public.people set birth_date = date '2008-11-26' where name ilike 'Laís Freitas de Souza%' or name ilike 'Lais Freitas de Souza%';
update public.people set birth_date = date '1959-02-25' where name ilike 'Geraldo Gotardo%';
update public.people set birth_date = date '1964-08-05' where name ilike 'Ester Biazuszi Gotardo%';
update public.people set birth_date = date '1994-04-27' where name ilike 'Gabriela Mara Gotardo%';
update public.people set birth_date = date '1989-01-04' where name ilike 'Bruna Biazuszi Gotardo%';
update public.people set birth_date = date '2020-05-25' where name ilike 'Benicio Moro%';
update public.people set birth_date = date '2025-01-17' where name ilike 'Lavinia Moro%';
update public.people set birth_date = date '1990-03-16' where name ilike 'Lucas Danilo Gosch%';
update public.people set birth_date = date '1993-09-30' where name ilike 'Francieli Squena Gosch%';
update public.people set birth_date = date '2023-04-22' where name ilike 'Cecília%' or name ilike 'Cecilia%';
update public.people set birth_date = date '1972-03-27' where name ilike 'Volmir Farina%';
update public.people set birth_date = date '1971-10-31' where name ilike 'Abigail Delgado Caleffi Farina%';
update public.people set birth_date = date '2003-04-01' where name ilike 'Marcos Farina%';
update public.people set birth_date = date '2000-03-06' where name ilike 'Andrio De Biasi%';
update public.people set birth_date = date '2003-01-05' where name ilike 'Marla da Silva De Biasi%';
update public.people set birth_date = date '1982-05-17' where name ilike 'Marcelo José Gonçalves Lins%' or name ilike 'Marcelo Jose Goncalves Lins%';
update public.people set birth_date = date '1986-03-31' where name ilike 'Franciele Regina zilli Lins%' or name ilike 'Franciele Regina Zilli Lins%';
update public.people set birth_date = date '2017-03-30' where name ilike 'Samuel Zilli Gonçalves Lins%' or name ilike 'Samuel Zilli Goncalves Lins%';
update public.people set birth_date = date '2023-01-09' where name ilike 'Maria Izabel zilli Gonçalves Lins%' or name ilike 'Maria Izabel Zilli Goncalves Lins%';
update public.people set birth_date = date '1949-09-05' where name ilike 'Maria Stoc Silva%';
update public.people set birth_date = date '1971-02-26' where name ilike 'Afonso Soares%';
update public.people set birth_date = date '1974-02-03' where name ilike 'Eva Marines Soares%';
update public.people set birth_date = date '1999-05-30' where name ilike 'Matheus Afonso Soares%';
update public.people set birth_date = date '2012-02-16' where name ilike 'Tobias Gabriel Soares%';
update public.people set birth_date = date '2006-05-27' where name ilike 'Joaquim Vitor ribas de freitas%' or name ilike 'Joaquim Vitor Ribas de Freitas%';
update public.people set birth_date = date '1992-12-12' where name ilike 'Heudes Andrade%';
update public.people set birth_date = date '1992-12-05' where name ilike 'Gilselle Andrade%' or name ilike 'Giselle Andrade%';
update public.people set birth_date = date '2019-01-19' where name ilike 'Isabella Andrade%';
update public.people set birth_date = date '1979-02-21' where name ilike 'Vinilda Ap de Souza%' or name ilike 'Vinilda%';
update public.people set birth_date = date '1939-11-22' where name ilike 'Maria da Luz de Souza%';
update public.people set birth_date = date '1982-09-10' where name ilike 'Daiane Maciel%';
update public.people set birth_date = date '1980-07-16' where name ilike 'Marcio Maciel%' or name ilike 'Márcio Maciel%';
update public.people set birth_date = date '2005-12-13' where name ilike 'Kauana Siqueira%';
update public.people set birth_date = date '2004-02-07' where name ilike 'Yuri Miguel Maciel%';
update public.people set birth_date = date '1992-07-01' where name ilike 'Lucas Luiz Fabris%';
update public.people set birth_date = date '1954-12-31' where name ilike 'Odila Maria Miguel%';
update public.people set birth_date = date '1954-09-13' where name ilike 'Amilton Serafim Miguel%';
update public.people set birth_date = date '1987-04-07' where name ilike 'Édina Mota Dos Santos Coradin%' or name ilike 'Edina Mota Dos Santos Coradin%';
update public.people set birth_date = date '1986-12-27' where name ilike 'Rodrigo Coradin%';
update public.people set birth_date = date '2017-04-29' where name ilike 'Natasha Mota Coradin%';
update public.people set birth_date = date '1966-11-20' where name ilike 'Marlene%';

-- Complementos de sobrenome somente para nomes importados muito claros na lista.
update public.people set name = 'Afonso Soares' where name ilike 'Afonso Soares%';
update public.people set name = 'Andrio De Biasi' where name ilike 'Andrio De Biasi%';
update public.people set name = 'Ana Santin' where name ilike 'Ana Santin%';
update public.people set name = 'Karina Paludo Santin' where name ilike 'Karina Paludo Santin%';
update public.people set name = 'Yuri Miguel Maciel' where name ilike 'Yuri%' and phone is not null;
