-- ATENÇÃO: Este script remove vínculo de clientes nos pedidos
-- e zera a tabela de clientes reiniciando o ID a partir de 1.
-- Ele NÃO apaga pedidos.

BEGIN;

-- Remover vínculo dos pedidos com clientes
UPDATE pedidos SET cliente_id = NULL;

-- Apagar todos os clientes e reiniciar sequência
TRUNCATE TABLE clientes RESTART IDENTITY;

COMMIT;

-- Após rodar, novos checkouts irão recriar clientes via RPC upsert_cliente.
