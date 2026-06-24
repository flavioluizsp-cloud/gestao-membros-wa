-- Acrescenta o novo status sem alterar nenhum cadastro existente.
alter type membros.person_status add value if not exists 'membro_dependente';
