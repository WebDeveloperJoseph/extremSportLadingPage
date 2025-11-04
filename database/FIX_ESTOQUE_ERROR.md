# Guia Rápido: Corrigir Erro de Coluna Estoque

## Problema
Erro ao salvar produto: `Could not find the 'estoque' column of 'produtos' in the schema cache`

## Causa
A coluna `estoque` não existe na tabela `produtos` do seu banco Supabase.

## Solução - Passo a Passo

### 1️⃣ Acessar Supabase SQL Editor
1. Acesse https://supabase.com/dashboard
2. Selecione seu projeto
3. No menu lateral, clique em **SQL Editor**

### 2️⃣ Adicionar Coluna Estoque
1. Clique em **New query**
2. Cole o conteúdo do arquivo: `database/add_estoque_column.sql`
3. Clique em **RUN** ou pressione `Ctrl + Enter`
4. Verifique se a mensagem foi: "Coluna estoque adicionada com sucesso!"

### 3️⃣ Adicionar Trigger de Decremento
1. Clique em **New query** novamente
2. Cole o conteúdo do arquivo: `database/add_trigger_estoque.sql`
3. Clique em **RUN** ou pressione `Ctrl + Enter`
4. Verifique se o trigger foi criado com sucesso

### 4️⃣ Atualizar Produtos Existentes (Se Houver)
Execute este SQL para definir estoque inicial nos produtos já cadastrados:

```sql
-- Definir estoque padrão de 10 unidades para todos os produtos
UPDATE produtos SET estoque = 10 WHERE estoque = 0 OR estoque IS NULL;

-- Verificar produtos
SELECT id, nome, preco, estoque FROM produtos ORDER BY id;
```

### 5️⃣ Testar
1. Acesse `/admin/produtos.html`
2. Tente editar um produto
3. O campo "Estoque" deve aparecer no formulário
4. Salve as alterações - não deve mais dar erro

## Ordem de Execução
Execute os scripts nesta ordem:
1. **add_estoque_column.sql** (adiciona a coluna)
2. **add_trigger_estoque.sql** (adiciona o trigger)
3. **UPDATE produtos** (opcional, apenas se já tiver produtos)

## Verificação Final
Execute no SQL Editor para confirmar que tudo está OK:

```sql
-- Verificar estrutura da tabela produtos
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'produtos'
ORDER BY ordinal_position;

-- Verificar se o trigger existe
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_decrementar_estoque';
```

## Observações Importantes
- ⚠️ A coluna `estoque` é obrigatória (NOT NULL) com valor padrão 0
- ⚠️ O trigger decrementa automaticamente o estoque quando um pedido é criado
- ⚠️ Se o estoque for insuficiente, o pedido será rejeitado com erro
- ✅ O frontend já está preparado para trabalhar com estoque
- ✅ A página de seed já inclui valores de estoque para os produtos

## Próximos Passos Após Correção
1. Testar edição de produtos no admin
2. Executar seed para popular produtos (se ainda não fez)
3. Testar compra no frontend para verificar decremento automático
