-- Script para adicionar UNIQUE constraint ao campo 'name' da tabela players
-- Execute este script SOMENTE se você já criou o banco anteriormente sem a constraint

-- Adiciona a constraint UNIQUE ao campo name
ALTER TABLE players ADD CONSTRAINT players_name_unique UNIQUE (name);

-- Caso queira remover nomes duplicados antes de adicionar a constraint (CUIDADO!)
-- Descomente as linhas abaixo apenas se necessário:

-- DELETE FROM players a USING players b
-- WHERE a.id > b.id AND LOWER(a.name) = LOWER(b.name);
