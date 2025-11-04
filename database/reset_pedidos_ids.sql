-- ATENÇÃO: Este script APAGA TODOS os registros da tabela pedidos
-- e REINICIA o ID (sequência) para começar novamente do 1.
-- Use somente se os pedidos atuais são de teste e podem ser removidos.

BEGIN;

TRUNCATE TABLE pedidos RESTART IDENTITY CASCADE;

COMMIT;
