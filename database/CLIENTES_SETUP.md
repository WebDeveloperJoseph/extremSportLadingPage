# Clientes: Tabela, RPC e Políticas (Supabase)

Este guia cria a tabela `clientes`, a função RPC `upsert_cliente` (usada no checkout do site) e adiciona a coluna `cliente_id` em `pedidos` com chave estrangeira.

## O que será criado
- Tabela `clientes` com: `id (bigserial)`, `nome`, `email` (único), `telefone`, `created_at`, `updated_at`.
- Trigger para manter `updated_at` automaticamente.
- Políticas RLS restritivas: somente admins visualizam/alteram direto via CRUD.
- Função `upsert_cliente(p_nome, p_email, p_telefone)` com `SECURITY DEFINER` para que o público (checkout) crie/atualize clientes via RPC.
- Coluna opcional `cliente_id` em `pedidos` (FK), com índice.

## Como aplicar
1. Abra o painel do Supabase e vá em SQL Editor.
2. Crie uma nova query e cole o conteúdo do arquivo `database/add_clientes.sql`.
3. Clique em Run.
4. Pronto! O front já está chamando `upsert_cliente` antes de inserir `pedidos`.

## Testar rapidamente
- Faça um checkout no site preenchendo nome, email e telefone.
- Verifique em `clientes` se o registro foi criado/atualizado (o email é usado como chave lógica de upsert).
- Em `pedidos`, a coluna `cliente_id` ficará preenchida quando o RPC retornar o id; se o RPC falhar, o pedido é criado sem vínculo (campo nulo).

## Resetar clientes (sem apagar pedidos)
Se quiser recomeçar a base de clientes sem perder pedidos:

Use o SQL do arquivo `database/reset_clientes_ids.sql` (ou copie no Admin > Ferramentas):

```sql
BEGIN;
UPDATE pedidos SET cliente_id = NULL;
TRUNCATE TABLE clientes RESTART IDENTITY;
COMMIT;
```

Após isso, novos checkouts recriarão os clientes automaticamente via `upsert_cliente`.
