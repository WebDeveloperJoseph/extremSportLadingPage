-- ATENÇÃO: Este script APAGA TODOS os registros da tabela produtos
-- e REINICIA o ID (sequência) para começar novamente do 1.
-- Use somente se os produtos atuais são de teste e podem ser removidos.

BEGIN;

-- Remove todos os produtos e reinicia a sequência de IDs
TRUNCATE TABLE produtos RESTART IDENTITY CASCADE;

-- Opcional: também é possível remover pedidos (se desejar recomeçar tudo)
-- TRUNCATE TABLE pedidos RESTART IDENTITY CASCADE;

COMMIT;

-- Após rodar este script, rode o seed novamente ou cadastre novos produtos.
