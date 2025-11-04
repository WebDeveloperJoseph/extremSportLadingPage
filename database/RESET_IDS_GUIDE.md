# Zerar IDs de Produtos e Recomeçar do 1

Se os produtos atuais são apenas de teste e você quer começar do zero com IDs reiniciados em 1, siga abaixo.

## Opção A (Recomendada): Apagar tudo e reiniciar IDs

1. Abra o **SQL Editor** do Supabase
2. Cole e execute o conteúdo do arquivo `database/reset_produtos_ids.sql`
   - Isso executa:
   ```sql
   TRUNCATE TABLE produtos RESTART IDENTITY CASCADE;
   ```
   - Apaga todos os produtos e reinicia a sequência
   - Se quiser começar 100% do zero, você pode descomentar a linha do `pedidos` também
3. Depois, rode o seed `/admin/seed.html` ou cadastre novos produtos no admin

## Opção B: Reatribuir IDs sem apagar (NÃO recomendado para produção)
Se você realmente precisa renumerar sem apagar, existe uma técnica que muda as chaves primárias, mas é arriscada e pode gerar inconsistências. Como seu sistema de pedidos guarda os itens em `produtos_json` (sem FK), é menos crítico, ainda assim recomendo a Opção A.

Script ilustrativo (use por sua conta e risco):
```sql
-- 1) Criar coluna temporária
ALTER TABLE produtos ADD COLUMN temp_new_id bigint;

-- 2) Calcular nova ordem e atribuir
UPDATE produtos p
SET temp_new_id = sub.rn
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS rn
  FROM produtos
) sub
WHERE p.id = sub.id;

-- 3) Elevar IDs atuais para evitar conflito
UPDATE produtos SET id = id + 1000000;

-- 4) Aplicar os novos IDs
UPDATE produtos SET id = temp_new_id;

-- 5) Limpar coluna temporária
ALTER TABLE produtos DROP COLUMN temp_new_id;

-- 6) Reiniciar sequência para apontar para o último ID atual
SELECT setval(pg_get_serial_sequence('produtos','id'), (SELECT MAX(id) FROM produtos));
```

Novamente, só faça isso se souber exatamente o que está fazendo. Para a maioria dos casos de teste, a **Opção A** é mais simples, rápida e segura.
